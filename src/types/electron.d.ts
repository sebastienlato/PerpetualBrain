export {}

declare global {
  interface Window {
    perpetualBrainDesktop?: {
      apiBaseUrl: string
      apiToken?: string
      platform: string
      chooseBrainFolder(): Promise<BrainFolderSelectionResult>
      resetBrainFolder(): Promise<BrainFolderSelectionResult>
      getBrainFolder(): Promise<BrainFolderSelectionResult>
      exportBrainBackup(): Promise<BrainBackupResult>
      importBrainBackup(): Promise<BrainBackupResult>
    }
  }

  interface BrainFolderSelectionResult {
    brainRoot: string
    source: 'configured' | 'default'
    message?: string
    canceled?: boolean
  }

  interface BrainBackupResult extends BrainFolderSelectionResult {
    backupPath?: string
    exportedFiles?: number
    skippedFiles?: string[]
    importedFiles?: number
    unsupportedEntries?: string[]
    rejectedEntries?: string[]
  }
}
