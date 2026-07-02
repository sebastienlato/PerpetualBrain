import { app as electronApp, BrowserWindow, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import { cp, mkdir, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiApp } from '../server/app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiPort = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)
const apiBaseUrl = `http://127.0.0.1:${apiPort}`

let mainWindow: BrowserWindow | undefined
let apiServer: http.Server | undefined

async function ensureDirectoryExists(directory: string) {
  try {
    await stat(directory)
  } catch {
    await mkdir(directory, { recursive: true })
  }
}

async function pathExists(targetPath: string) {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

function repoRoot() {
  return path.resolve(__dirname, '../..')
}

async function resolveBrainRoot() {
  if (!electronApp.isPackaged) {
    return path.resolve(process.env.PERPETUAL_BRAIN_ROOT || path.join(repoRoot(), 'brain'))
  }

  const userBrainRoot = path.join(electronApp.getPath('userData'), 'brain')
  if (!(await pathExists(userBrainRoot))) {
    const seedRoot = path.join(process.resourcesPath, 'brain-seed')
    if (await pathExists(seedRoot)) {
      await cp(seedRoot, userBrainRoot, { recursive: true, errorOnExist: false })
    } else {
      await mkdir(userBrainRoot, { recursive: true })
    }
  }

  return userBrainRoot
}

async function startApiServer(brainRoot: string) {
  const apiApp = createApiApp({ brainRoot })

  await new Promise<void>((resolve, reject) => {
    const server = apiApp.listen(apiPort, '127.0.0.1')

    server.once('listening', () => {
      apiServer = server
      console.log(`PerpetualBrain desktop API listening on ${apiBaseUrl}`)
      console.log(`Desktop brain root: ${brainRoot}`)
      resolve()
    })

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${apiPort} is already in use; Electron will connect to the existing API.`)
        resolve()
        return
      }
      reject(error)
    })
  })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 680,
    title: 'PerpetualBrain',
    show: false,
    backgroundColor: '#070a12',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow?.webContents.getURL()
    if (currentUrl && new URL(url).origin !== new URL(currentUrl).origin) {
      event.preventDefault()
      void shell.openExternal(url)
    }
  })

  if (electronApp.isPackaged) {
    void mainWindow.loadFile(path.join(electronApp.getAppPath(), 'dist/index.html'))
  } else {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
  }
}

function installAppMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'PerpetualBrain',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

electronApp.whenReady().then(async () => {
  electronApp.setName('PerpetualBrain')
  await ensureDirectoryExists(electronApp.getPath('userData'))
  const brainRoot = await resolveBrainRoot()
  await startApiServer(brainRoot)
  installAppMenu()
  createMainWindow()

  electronApp.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
}).catch((error: unknown) => {
  console.error(error)
  electronApp.quit()
})

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('before-quit', () => {
  apiServer?.close()
})
