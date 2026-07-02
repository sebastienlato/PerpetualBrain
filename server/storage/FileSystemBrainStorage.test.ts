import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FileSystemBrainStorage } from './FileSystemBrainStorage'

let brainRoot = ''
let storage: FileSystemBrainStorage

beforeEach(async () => {
  brainRoot = await mkdtemp(path.join(os.tmpdir(), 'perpetual-brain-'))
  storage = new FileSystemBrainStorage(brainRoot)
})

afterEach(async () => {
  await rm(brainRoot, { recursive: true, force: true })
})

describe('FileSystemBrainStorage', () => {
  it('creates, lists, saves, and deletes Markdown files inside brain root', async () => {
    const created = await storage.createFile({
      path: 'brain/projects/demo/PROJECT.md',
      content: '# Demo\n\n## Summary\nInitial.',
    })

    expect(created.path).toBe('brain/projects/demo/PROJECT.md')
    expect((await storage.listFiles()).map((file) => file.path)).toEqual(['brain/projects/demo/PROJECT.md'])

    const saved = await storage.saveFile(created.path, '# Demo\n\n## Summary\nUpdated.')
    expect(saved.content).toContain('Updated')

    await storage.deleteFile(created.path)
    expect(await storage.listFiles()).toEqual([])
  })

  it('creates project folders with default Markdown files', async () => {
    const project = await storage.createProject({ name: 'Crystal Console' })

    expect(project.slug).toBe('crystal-console')
    expect(project.files.map((file) => file.name).sort()).toEqual([
      'ARCHITECTURE.md',
      'CODEX_CONTEXT.md',
      'DECISIONS.md',
      'DESIGN_RULES.md',
      'LESSONS.md',
      'PROJECT.md',
      'TODO.md',
    ])
  })

  it('rejects traversal writes and binary content', async () => {
    await expect(storage.createFile({ path: '../escape.md', content: '# Escape' })).rejects.toThrow()
    await expect(storage.createFile({ path: 'brain/projects/demo/BINARY.md', content: 'bad\u0000content' })).rejects.toThrow()
  })
})
