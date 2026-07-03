const { contextBridge, ipcRenderer } = require('electron')

const apiPort = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)
const tokenPrefix = '--perpetual-brain-token='
const tokenArg = process.argv.find((arg) => typeof arg === 'string' && arg.startsWith(tokenPrefix))
const apiToken = tokenArg ? tokenArg.slice(tokenPrefix.length) : undefined

contextBridge.exposeInMainWorld('perpetualBrainDesktop', {
  apiBaseUrl: `http://127.0.0.1:${apiPort}`,
  apiToken,
  platform: process.platform,
  chooseBrainFolder: () => ipcRenderer.invoke('brain-folder:choose'),
  resetBrainFolder: () => ipcRenderer.invoke('brain-folder:reset-default'),
  getBrainFolder: () => ipcRenderer.invoke('brain-folder:get'),
  exportBrainBackup: () => ipcRenderer.invoke('brain-backup:export'),
  importBrainBackup: () => ipcRenderer.invoke('brain-backup:import'),
})
