const { contextBridge, ipcRenderer } = require('electron')

const apiPort = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)

contextBridge.exposeInMainWorld('perpetualBrainDesktop', {
  apiBaseUrl: `http://127.0.0.1:${apiPort}`,
  platform: process.platform,
  chooseBrainFolder: () => ipcRenderer.invoke('brain-folder:choose'),
  resetBrainFolder: () => ipcRenderer.invoke('brain-folder:reset-default'),
  getBrainFolder: () => ipcRenderer.invoke('brain-folder:get'),
})
