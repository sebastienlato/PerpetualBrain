export {}

declare global {
  interface Window {
    perpetualBrainDesktop?: {
      apiBaseUrl: string
      platform: string
      chooseBrainFolder(): Promise<BrainFolderSelectionResult>
      resetBrainFolder(): Promise<BrainFolderSelectionResult>
      getBrainFolder(): Promise<BrainFolderSelectionResult>
    }
  }

  interface BrainFolderSelectionResult {
    brainRoot: string
    source: 'configured' | 'default'
    message?: string
    canceled?: boolean
  }
}
