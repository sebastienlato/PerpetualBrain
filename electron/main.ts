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
import { backupTimestamp, createBrainBackupZip, importBrainBackupZip, inspectBrainBackupZip } from '../server/utils/brainBackup.js'

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

function backupResult(message?: string) {
  return {
    ...brainFolderResult(),
    message,
  }
}

async function nextImportBrainRoot() {
  const importsRoot = path.join(electronApp.getPath('userData'), 'brain-imports')
  await mkdir(importsRoot, { recursive: true })
  const baseName = `PerpetualBrain-import-${backupTimestamp()}`

  for (let index = 0; index < 100; index += 1) {
    const candidate = path.join(importsRoot, index === 0 ? baseName : `${baseName}-${index}`)
    if (!(await pathExists(candidate))) {
      return candidate
    }
  }

  throw new Error('Unable to create a unique import folder.')
}

async function exportBrainBackup() {
  const defaultPath = path.join(electronApp.getPath('downloads'), `PerpetualBrain-backup-${backupTimestamp()}.zip`)
  const saveOptions: Electron.SaveDialogOptions = {
    title: 'Export PerpetualBrain Backup',
    defaultPath,
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
  }
  const result = mainWindow ? await dialog.showSaveDialog(mainWindow, saveOptions) : await dialog.showSaveDialog(saveOptions)

  if (result.canceled || !result.filePath) {
    return { ...backupResult('Backup export canceled.'), canceled: true }
  }

  const summary = await createBrainBackupZip(activeBrainRoot, result.filePath)
  return {
    ...backupResult(`Exported ${summary.exportedFiles} brain files to ${summary.outputPath}.`),
    backupPath: summary.outputPath,
    exportedFiles: summary.exportedFiles,
    skippedFiles: summary.skippedFiles,
  }
}

async function importBrainBackup() {
  const openOptions: Electron.OpenDialogOptions = {
    title: 'Import PerpetualBrain Backup',
    message: 'Choose a PerpetualBrain backup ZIP.',
    properties: ['openFile'],
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
  }
  const result = mainWindow ? await dialog.showOpenDialog(mainWindow, openOptions) : await dialog.showOpenDialog(openOptions)

  if (result.canceled || !result.filePaths[0]) {
    return { ...backupResult('Backup import canceled.'), canceled: true }
  }

  const zipPath = result.filePaths[0]
  const inspection = await inspectBrainBackupZip(zipPath)
  if (inspection.validEntries.length === 0) {
    const message = 'Backup ZIP does not contain supported brain files.'
    const messageOptions: Electron.MessageBoxOptions = {
      type: 'error',
      message,
      detail: inspection.rejectedEntries.length ? `Rejected entries: ${inspection.rejectedEntries.slice(0, 8).join(', ')}` : undefined,
    }
    if (mainWindow) {
      await dialog.showMessageBox(mainWindow, messageOptions)
    } else {
      await dialog.showMessageBox(messageOptions)
    }
    return { ...backupResult(message), canceled: true, rejectedEntries: inspection.rejectedEntries, unsupportedEntries: inspection.unsupportedEntries }
  }

  const destinationRoot = await nextImportBrainRoot()
  const confirmationOptions: Electron.MessageBoxOptions = {
    type: 'question',
    buttons: ['Import and Switch', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
    message: 'Import this brain backup?',
    detail: [
      `PerpetualBrain will extract ${inspection.validEntries.length} supported files into a new folder:`,
      destinationRoot,
      '',
      'The current brain folder will not be overwritten.',
      inspection.unsupportedEntries.length ? `${inspection.unsupportedEntries.length} unsupported files will be ignored.` : '',
      inspection.rejectedEntries.length ? `${inspection.rejectedEntries.length} unsafe entries will be rejected.` : '',
    ].filter(Boolean).join('\n'),
  }
  const confirmation = mainWindow
    ? await dialog.showMessageBox(mainWindow, confirmationOptions)
    : await dialog.showMessageBox(confirmationOptions)

  if (confirmation.response !== 0) {
    return { ...backupResult('Backup import canceled.'), canceled: true }
  }

  const summary = await importBrainBackupZip(zipPath, destinationRoot)
  await saveBrainFolderSettings(settingsPath(), { brainRoot: summary.destinationRoot })
  activeBrainRoot = summary.destinationRoot
  activeBrainRootSource = 'configured'
  activeBrainRootMessage = undefined

  return {
    ...backupResult(`Imported ${summary.importedFiles} files and switched to the imported brain folder.`),
    brainRoot: activeBrainRoot,
    source: activeBrainRootSource,
    importedFiles: summary.importedFiles,
    unsupportedEntries: summary.unsupportedEntries,
    rejectedEntries: summary.rejectedEntries,
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
  ipcMain.handle('brain-backup:export', () => exportBrainBackup())
  ipcMain.handle('brain-backup:import', () => importBrainBackup())
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
