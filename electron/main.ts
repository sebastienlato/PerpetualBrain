import { app as electronApp, BrowserWindow, Menu, dialog, ipcMain, shell, type MenuItemConstructorOptions } from 'electron'
import { mkdir, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiApp } from '../server/app.js'
import {
  clearBrainFolderSettings,
  ensureDefaultBrainRoot,
  initializeBrainFolder,
  inspectBrainFolder,
  isDirectory,
  resolveConfiguredBrainRoot,
  saveBrainFolderSettings,
} from '../server/utils/brainFolder.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiPort = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)
const apiBaseUrl = `http://127.0.0.1:${apiPort}`

let mainWindow: BrowserWindow | undefined
let apiServer: http.Server | undefined
let activeBrainRoot = ''
let activeBrainRootSource: 'configured' | 'default' = 'default'
let activeBrainRootMessage: string | undefined

async function ensureDirectoryExists(directory: string) {
  try {
    await stat(directory)
  } catch {
    await mkdir(directory, { recursive: true })
  }
}

function repoRoot() {
  return path.resolve(__dirname, '../..')
}

function settingsPath() {
  return path.join(electronApp.getPath('userData'), 'settings.json')
}

function seedBrainRoot() {
  return electronApp.isPackaged ? path.join(process.resourcesPath, 'brain-seed') : path.join(repoRoot(), 'brain')
}

function defaultBrainRoot() {
  if (!electronApp.isPackaged) {
    return path.resolve(process.env.PERPETUAL_BRAIN_ROOT || path.join(repoRoot(), 'brain'))
  }

  return path.join(electronApp.getPath('userData'), 'brain')
}

async function resolveBrainRoot() {
  const resolved = await resolveConfiguredBrainRoot(settingsPath(), defaultBrainRoot(), seedBrainRoot())
  activeBrainRoot = resolved.brainRoot
  activeBrainRootSource = resolved.source
  activeBrainRootMessage = resolved.message
  if (resolved.message) {
    console.warn(resolved.message)
  }
  return resolved.brainRoot
}

async function startApiServer() {
  const apiApp = createApiApp({
    getBrainRoot: () => activeBrainRoot,
    getBrainRootSource: () => activeBrainRootSource,
    getBrainRootMessage: () => activeBrainRootMessage,
  })

  await new Promise<void>((resolve, reject) => {
    const server = apiApp.listen(apiPort, '127.0.0.1')

    server.once('listening', () => {
      apiServer = server
      console.log(`PerpetualBrain desktop API listening on ${apiBaseUrl}`)
      console.log(`Desktop brain root: ${activeBrainRoot}`)
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

function brainFolderResult(message?: string) {
  return {
    brainRoot: activeBrainRoot,
    source: activeBrainRootSource,
    message,
  }
}

async function chooseBrainFolder() {
  const openOptions: Electron.OpenDialogOptions = {
    title: 'Choose PerpetualBrain Folder',
    message: 'Choose the folder PerpetualBrain should use as its Markdown brain root.',
    properties: ['openDirectory', 'createDirectory'],
  }
  const result = mainWindow ? await dialog.showOpenDialog(mainWindow, openOptions) : await dialog.showOpenDialog(openOptions)

  if (result.canceled || !result.filePaths[0]) {
    return { ...brainFolderResult('Folder selection canceled.'), canceled: true }
  }

  const selectedRoot = path.resolve(result.filePaths[0])
  if (!(await isDirectory(selectedRoot))) {
    const messageOptions: Electron.MessageBoxOptions = {
      type: 'error',
      message: 'Selected path is not a folder.',
      detail: selectedRoot,
    }
    if (mainWindow) {
      await dialog.showMessageBox(mainWindow, messageOptions)
    } else {
      await dialog.showMessageBox(messageOptions)
    }
    return { ...brainFolderResult('Selected path is not a folder.'), canceled: true }
  }

  const folderState = await inspectBrainFolder(selectedRoot)
  if (folderState === 'empty') {
    const initializationOptions: Electron.MessageBoxOptions = {
      type: 'question',
      buttons: ['Initialize with seed files', 'Use Empty Folder', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      message: 'This folder is empty.',
      detail: 'PerpetualBrain can copy the seeded Markdown brain files into it. Existing files are never overwritten.',
    }
    const initialization = mainWindow
      ? await dialog.showMessageBox(mainWindow, initializationOptions)
      : await dialog.showMessageBox(initializationOptions)

    if (initialization.response === 2) {
      return { ...brainFolderResult('Folder selection canceled.'), canceled: true }
    }

    if (initialization.response === 0) {
      await initializeBrainFolder(selectedRoot, seedBrainRoot())
    }
  }

  if (folderState === 'mixed') {
    const confirmationOptions: Electron.MessageBoxOptions = {
      type: 'warning',
      buttons: ['Use This Folder', 'Cancel'],
      defaultId: 1,
      cancelId: 1,
      message: 'This folder does not look like a PerpetualBrain folder.',
      detail: 'It has existing non-brain files. PerpetualBrain will not overwrite them, but new Markdown folders and files may be created here if you continue.',
    }
    const confirmation = mainWindow
      ? await dialog.showMessageBox(mainWindow, confirmationOptions)
      : await dialog.showMessageBox(confirmationOptions)

    if (confirmation.response !== 0) {
      return { ...brainFolderResult('Folder selection canceled.'), canceled: true }
    }
  }

  await saveBrainFolderSettings(settingsPath(), { brainRoot: selectedRoot })
  activeBrainRoot = selectedRoot
  activeBrainRootSource = 'configured'
  activeBrainRootMessage = undefined
  return brainFolderResult(folderState === 'empty' ? 'Brain folder selected and initialized.' : 'Brain folder selected.')
}

async function resetBrainFolder() {
  await clearBrainFolderSettings(settingsPath())
  activeBrainRoot = await ensureDefaultBrainRoot(defaultBrainRoot(), seedBrainRoot())
  activeBrainRootSource = 'default'
  activeBrainRootMessage = undefined
  return brainFolderResult('Reset to the default brain folder.')
}

function installIpcHandlers() {
  ipcMain.handle('brain-folder:choose', () => chooseBrainFolder())
  ipcMain.handle('brain-folder:reset-default', () => resetBrainFolder())
  ipcMain.handle('brain-folder:get', () => brainFolderResult(activeBrainRootMessage))
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
      preload: path.join(__dirname, 'preload.cjs'),
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
  await resolveBrainRoot()
  await startApiServer()
  installIpcHandlers()
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
