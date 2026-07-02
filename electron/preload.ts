import { contextBridge } from 'electron'

const apiPort = Number(process.env.PERPETUAL_BRAIN_API_PORT || 3717)

contextBridge.exposeInMainWorld('perpetualBrainDesktop', {
  apiBaseUrl: `http://127.0.0.1:${apiPort}`,
  platform: process.platform,
})
