export interface GitStatusResult {
  gitAvailable: boolean
  isGitRepo: boolean
  branch?: string
  clean: boolean
  changedFiles: string[]
  untrackedFiles: string[]
  stagedFiles: string[]
  error?: string
}
