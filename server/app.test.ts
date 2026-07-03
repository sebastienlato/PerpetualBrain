import type { Server } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { API_TOKEN_HEADER, createApiApp, type CreateApiAppOptions } from './app'

let brainRoot = ''
const openServers: Server[] = []
const jsonHeaders = { 'Content-Type': 'application/json' }

async function startApp(options: CreateApiAppOptions = {}) {
  const app = createApiApp({ getBrainRoot: () => brainRoot, ...options })
  const server = await new Promise<Server>((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
  })
  openServers.push(server)
  const { port } = server.address() as AddressInfo
  return `http://127.0.0.1:${port}`
}

beforeEach(async () => {
  brainRoot = await mkdtemp(path.join(os.tmpdir(), 'perpetual-brain-app-'))
})

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))))
  await rm(brainRoot, { recursive: true, force: true })
})

describe('access token gate', () => {
  it('allows requests when no token is configured (dev-server mode)', async () => {
    const baseUrl = await startApp({})
    const response = await fetch(`${baseUrl}/api/health`)
    expect(response.status).toBe(200)
  })

  it('rejects requests that omit the token when one is configured', async () => {
    const baseUrl = await startApp({ getAccessToken: () => 'secret-token' })
    const response = await fetch(`${baseUrl}/api/health`)
    expect(response.status).toBe(403)
  })

  it('rejects requests with an incorrect token', async () => {
    const baseUrl = await startApp({ getAccessToken: () => 'secret-token' })
    const response = await fetch(`${baseUrl}/api/health`, { headers: { [API_TOKEN_HEADER]: 'wrong-token' } })
    expect(response.status).toBe(403)
  })

  it('accepts requests with the correct token', async () => {
    const baseUrl = await startApp({ getAccessToken: () => 'secret-token' })
    const response = await fetch(`${baseUrl}/api/health`, { headers: { [API_TOKEN_HEADER]: 'secret-token' } })
    expect(response.status).toBe(200)
    const body = await response.json() as { ok: boolean }
    expect(body.ok).toBe(true)
  })
})

describe('cross-origin policy', () => {
  it('reflects an allowed dev origin', async () => {
    const baseUrl = await startApp({})
    const response = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'http://localhost:5173' } })
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
  })

  it('does not grant CORS access to an untrusted website origin', async () => {
    const baseUrl = await startApp({ getAccessToken: () => 'secret-token' })
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://evil.example', [API_TOKEN_HEADER]: 'secret-token' },
    })
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('rejects a mutating preflight from an untrusted origin', async () => {
    const baseUrl = await startApp({ getAccessToken: () => 'secret-token' })
    const response = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.example',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type',
      },
    })
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('trusts the packaged desktop opaque origin only when a token gates access', async () => {
    const withToken = await startApp({ getAccessToken: () => 'secret-token' })
    const allowed = await fetch(`${withToken}/api/health`, {
      headers: { Origin: 'null', [API_TOKEN_HEADER]: 'secret-token' },
    })
    expect(allowed.headers.get('access-control-allow-origin')).toBe('null')

    const withoutToken = await startApp({})
    const denied = await fetch(`${withoutToken}/api/health`, { headers: { Origin: 'null' } })
    expect(denied.headers.get('access-control-allow-origin')).toBeNull()
  })
})

describe('brain file routes', () => {
  const filePath = 'brain/projects/demo/PROJECT.md'

  it('creates, reads, lists, updates, and deletes a markdown file', async () => {
    const baseUrl = await startApp({})

    const created = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ path: filePath, content: '# Demo\n' }),
    })
    expect(created.status).toBe(201)

    const tree = await fetch(`${baseUrl}/api/brain/tree`).then((response) => response.json()) as { files: { path: string }[] }
    expect(tree.files.some((file) => file.path === filePath)).toBe(true)

    const updated = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ path: filePath, content: '# Demo v2\n' }),
    }).then((response) => response.json()) as { file: { content: string } }
    expect(updated.file.content).toBe('# Demo v2\n')

    const read = await fetch(`${baseUrl}/api/brain/file?path=${encodeURIComponent(filePath)}`)
      .then((response) => response.json()) as { file: { content: string } }
    expect(read.file.content).toBe('# Demo v2\n')

    const deleted = await fetch(`${baseUrl}/api/brain/file?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' })
    expect(deleted.status).toBe(200)

    const readMissing = await fetch(`${baseUrl}/api/brain/file?path=${encodeURIComponent(filePath)}`)
    expect(readMissing.status).toBe(404)
  })

  it('rejects path traversal', async () => {
    const baseUrl = await startApp({})
    const response = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ path: '../escape.md', content: '# nope\n' }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects non-markdown paths', async () => {
    const baseUrl = await startApp({})
    const response = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ path: 'brain/projects/demo/notes.txt', content: 'plain' }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects binary content', async () => {
    const baseUrl = await startApp({})
    const binaryContent = `has-a-null${String.fromCharCode(0)}byte`
    const response = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ path: filePath, content: binaryContent }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects bodies that fail zod validation', async () => {
    const baseUrl = await startApp({})
    const response = await fetch(`${baseUrl}/api/brain/file`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ path: '' }),
    })
    expect(response.status).toBe(400)
  })

  it('creates a project scaffold from a name', async () => {
    const baseUrl = await startApp({})
    const response = await fetch(`${baseUrl}/api/brain/project`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'My New App' }),
    })
    expect(response.status).toBe(201)
    const body = await response.json() as { slug: string; files: unknown[] }
    expect(body.slug).toBe('my-new-app')
    expect(body.files.length).toBeGreaterThan(0)
  })
})
