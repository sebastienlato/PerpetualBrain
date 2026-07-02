import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiApp } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const brainRoot = path.resolve(process.env.PERPETUAL_BRAIN_ROOT || path.resolve(repoRoot, 'brain'))
const port = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)

const app = createApiApp({ brainRoot })

app.listen(port, '127.0.0.1', () => {
  console.log(`PerpetualBrain API listening on http://127.0.0.1:${port}`)
  console.log(`Brain root: ${brainRoot}`)
})
