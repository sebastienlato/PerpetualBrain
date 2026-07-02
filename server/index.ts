import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { FileSystemBrainStorage } from './storage/FileSystemBrainStorage'
import { BrainPathError } from './utils/brainPath'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const brainRoot = path.resolve(repoRoot, 'brain')
const port = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)

const app = express()
const storage = new FileSystemBrainStorage(brainRoot)

app.use(cors({ origin: true }))
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
    brainRoot,
  })
})

app.get('/api/brain/tree', async (_req, res, next) => {
  try {
    res.json({ files: await storage.listFiles() })
  } catch (error) {
    next(error)
  }
})

app.get('/api/brain/file', async (req, res, next) => {
  try {
    const { path: filePath } = pathQuerySchema.parse(req.query)
    res.json({ file: await storage.getFile(filePath) })
  } catch (error) {
    next(error)
  }
})

app.put('/api/brain/file', async (req, res, next) => {
  try {
    const { path: filePath, content } = writeFileSchema.parse(req.body)
    res.json({ file: await storage.saveFile(filePath, content) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/brain/file', async (req, res, next) => {
  try {
    const input = writeFileSchema.parse(req.body)
    res.status(201).json({ file: await storage.createFile(input) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/brain/project', async (req, res, next) => {
  try {
    const input = createProjectSchema.parse(req.body)
    res.status(201).json(await storage.createProject(input))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/brain/file', async (req, res, next) => {
  try {
    const { path: filePath } = pathQuerySchema.parse(req.query)
    await storage.deleteFile(filePath)
    res.json({ ok: true })
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

app.listen(port, '127.0.0.1', () => {
  console.log(`PerpetualBrain API listening on http://127.0.0.1:${port}`)
  console.log(`Brain root: ${brainRoot}`)
})
