import { timingSafeEqual } from 'node:crypto'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { FileSystemBrainStorage } from './storage/FileSystemBrainStorage.js'
import { BrainPathError } from './utils/brainPath.js'
import { getGitDiffSummary, getGitStatus, initializeGitRepo } from './utils/gitStatus.js'

export const API_TOKEN_HEADER = 'x-perpetual-brain-token'

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

export interface CreateApiAppOptions {
  brainRoot?: string
  getBrainRoot?: () => string
  getBrainRootSource?: () => string
  getBrainRootMessage?: () => string | undefined
  getAccessToken?: () => string | undefined
  allowedOrigins?: string[]
}

function tokensMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }
  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export function createApiApp({
  brainRoot,
  getBrainRoot,
  getBrainRootSource,
  getBrainRootMessage,
  getAccessToken,
  allowedOrigins = DEFAULT_ALLOWED_ORIGINS,
}: CreateApiAppOptions) {
  const app = express()
  const resolveBrainRoot = getBrainRoot ?? (() => {
    if (!brainRoot) {
      throw new Error('A brain root is required.')
    }
    return brainRoot
  })
  const storage = () => new FileSystemBrainStorage(resolveBrainRoot())
  const allowedOriginSet = new Set(allowedOrigins)

  app.use(cors({
    credentials: false,
    origin(origin, callback) {
      // Non-browser callers (curl) and same-origin requests omit Origin; allow them.
      if (!origin) {
        callback(null, true)
        return
      }
      if (allowedOriginSet.has(origin)) {
        callback(null, true)
        return
      }
      // The packaged desktop renderer loads over file:// and sends an opaque origin.
      // Only trust it when an access token is also required, since the token — not the
      // origin — is the real gate against untrusted pages.
      if ((origin === 'null' || origin.startsWith('file://')) && Boolean(getAccessToken?.())) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
  }))

  // Reject any request that lacks the desktop access token. Dev-server mode configures no
  // token, so this gate is a no-op there and browser/dev workflows are unaffected.
  app.use((req, res, next) => {
    const expected = getAccessToken?.()
    if (!expected) {
      next()
      return
    }
    const provided = req.header(API_TOKEN_HEADER) ?? ''
    if (tokensMatch(provided, expected)) {
      next()
      return
    }
    res.status(403).json({ error: 'Missing or invalid API token.' })
  })

  app.use(express.json({ limit: '1mb', type: 'application/json' }))

  const pathQuerySchema = z.object({
    path: z.string().min(1),
  })

  const writeFileSchema = z.object({
    path: z.string().min(1),
    content: z.string().max(800_000),
  })

  const createProjectSchema = z.object({
    name: z.string().trim().min(1).max(120),
    slug: z.string().trim().min(1).max(80).optional(),
  })

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mode: 'file-system',
      brainRoot: resolveBrainRoot(),
      brainRootSource: getBrainRootSource?.(),
      brainRootMessage: getBrainRootMessage?.(),
    })
  })

  app.get('/api/brain/tree', async (_req, res, next) => {
    try {
      res.json({ files: await storage().listFiles() })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/brain/file', async (req, res, next) => {
    try {
      const { path: filePath } = pathQuerySchema.parse(req.query)
      res.json({ file: await storage().getFile(filePath) })
    } catch (error) {
      next(error)
    }
  })

  app.put('/api/brain/file', async (req, res, next) => {
    try {
      const { path: filePath, content } = writeFileSchema.parse(req.body)
      res.json({ file: await storage().saveFile(filePath, content) })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/brain/file', async (req, res, next) => {
    try {
      const input = writeFileSchema.parse(req.body)
      res.status(201).json({ file: await storage().createFile(input) })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/brain/project', async (req, res, next) => {
    try {
      const input = createProjectSchema.parse(req.body)
      res.status(201).json(await storage().createProject(input))
    } catch (error) {
      next(error)
    }
  })

  app.delete('/api/brain/file', async (req, res, next) => {
    try {
      const { path: filePath } = pathQuerySchema.parse(req.query)
      await storage().deleteFile(filePath)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/git/status', async (_req, res, next) => {
    try {
      res.json(await getGitStatus(resolveBrainRoot()))
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/git/init', async (_req, res, next) => {
    try {
      res.status(201).json(await initializeGitRepo(resolveBrainRoot()))
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/git/diff-summary', async (_req, res, next) => {
    try {
      res.json(await getGitDiffSummary(resolveBrainRoot()))
    } catch (error) {
      next(error)
    }
  })

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request.', details: error.flatten() })
      return
    }

    if (error instanceof BrainPathError) {
      res.status(400).json({ error: error.message })
      return
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      res.status(404).json({ error: 'Brain file was not found.' })
      return
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      res.status(409).json({ error: 'Brain file or project already exists.' })
      return
    }

    const message = error instanceof Error ? error.message : 'Unexpected server error.'
    res.status(500).json({ error: message })
  })

  return app
}
