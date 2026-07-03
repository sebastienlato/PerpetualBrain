import { Archive, Download, FolderOpen, GitBranch, GitCommit, MonitorCog, RefreshCw, RotateCcw, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import type { GitStatusResult } from '../types/git'

export function Settings() {
  const { files, resetToSeed, reloadFromSource, storageMode, storageMessage, activeBrainPath } = useBrain()
  const [status, setStatus] = useState<string>()
  const [backupStatus, setBackupStatus] = useState<string>()
  const [backupError, setBackupError] = useState<string>()
  const [backupLoading, setBackupLoading] = useState<'export' | 'import'>()
  const [gitStatus, setGitStatus] = useState<GitStatusResult>()
  const [gitStatusError, setGitStatusError] = useState<string>()
  const [gitLastCheckedAt, setGitLastCheckedAt] = useState<string>()
  const [gitLoading, setGitLoading] = useState(false)
  const desktopRuntime = typeof window !== 'undefined' ? window.perpetualBrainDesktop : undefined
  const runtimeLabel = desktopRuntime ? `Electron desktop (${desktopRuntime.platform})` : 'Browser/dev server'
  const gitCommands = useMemo(() => buildGitCommands(activeBrainPath, gitStatus), [activeBrainPath, gitStatus])

  const refreshGitStatus = useCallback(async () => {
    if (storageMode !== 'api') {
      setGitStatus(undefined)
      setGitStatusError('Git integration is available when the local API is running.')
      return
    }

    setGitLoading(true)
    try {
      const response = await fetch('/api/git/status')
      if (!response.ok) {
        throw new Error(`Git status failed with ${response.status}.`)
      }
      setGitStatus(await response.json() as GitStatusResult)
      setGitStatusError(undefined)
      setGitLastCheckedAt(new Date().toLocaleString())
    } catch (error) {
      setGitStatus(undefined)
      setGitStatusError(error instanceof Error ? error.message : 'Unable to load Git status.')
    } finally {
      setGitLoading(false)
    }
  }, [storageMode])

  useEffect(() => {
    void refreshGitStatus()
  }, [activeBrainPath, refreshGitStatus])

  async function reset() {
    if (window.confirm('Reset local browser storage to the seeded /brain Markdown files? Unsaved local edits will be replaced.')) {
      await resetToSeed()
      setStatus('Fallback seed data reset.')
    }
  }

  async function reload() {
    await reloadFromSource()
    await refreshGitStatus()
    setStatus(storageMode === 'api' ? 'Reloaded latest Markdown files from disk.' : 'Reloaded browser fallback storage.')
  }

  async function chooseBrainFolder() {
    if (!desktopRuntime?.chooseBrainFolder) {
      setStatus('Custom folder selection is available in the desktop app.')
      return
    }

    const result = await desktopRuntime.chooseBrainFolder()
    if (!result.canceled) {
      await reloadFromSource()
    }
    setStatus(result.message || (result.canceled ? 'Folder selection canceled.' : 'Brain folder updated.'))
  }

  async function resetBrainFolder() {
    if (!desktopRuntime?.resetBrainFolder) {
      setStatus('Custom folder selection is available in the desktop app.')
      return
    }

    const result = await desktopRuntime.resetBrainFolder()
    await reloadFromSource()
    setStatus(result.message || 'Reset to the default brain folder.')
  }

  async function initializeGitRepo() {
    if (storageMode !== 'api') {
      setStatus('Git integration is available when the local API is running.')
      return
    }

    if (!window.confirm('Initialize a Git repository in the active brain folder? This does not commit anything.')) {
      return
    }

    setGitLoading(true)
    try {
      const response = await fetch('/api/git/init', { method: 'POST' })
      if (!response.ok) {
        throw new Error(`Git init failed with ${response.status}.`)
      }
      setGitStatus(await response.json() as GitStatusResult)
      setGitStatusError(undefined)
      setGitLastCheckedAt(new Date().toLocaleString())
      setStatus('Initialized Git repository in the active brain folder.')
    } catch (error) {
      setGitStatusError(error instanceof Error ? error.message : 'Unable to initialize Git repository.')
    } finally {
      setGitLoading(false)
    }
  }

  async function exportBackup() {
    if (!desktopRuntime?.exportBrainBackup) {
      setBackupError('Backup import/export is available in the desktop app.')
      setBackupStatus(undefined)
      return
    }

    setBackupLoading('export')
    try {
      const result = await desktopRuntime.exportBrainBackup()
      if (result.canceled) {
        setBackupStatus(result.message || 'Backup export canceled.')
        setBackupError(undefined)
        return
      }
      setBackupStatus(result.message || `Exported ${result.exportedFiles ?? 0} brain files.`)
      setBackupError(undefined)
    } catch (error) {
      setBackupStatus(undefined)
      setBackupError(error instanceof Error ? error.message : 'Unable to export brain backup.')
    } finally {
      setBackupLoading(undefined)
    }
  }

  async function importBackup() {
    if (!desktopRuntime?.importBrainBackup) {
      setBackupError('Backup import/export is available in the desktop app.')
      setBackupStatus(undefined)
      return
    }

    setBackupLoading('import')
    try {
      const result = await desktopRuntime.importBrainBackup()
      if (result.canceled) {
        setBackupStatus(result.message || 'Backup import canceled.')
        setBackupError(undefined)
        return
      }
      await reloadFromSource()
      await refreshGitStatus()
      setBackupStatus(result.message || `Imported ${result.importedFiles ?? 0} brain files.`)
      setBackupError(undefined)
    } catch (error) {
      setBackupStatus(undefined)
      setBackupError(error instanceof Error ? error.message : 'Unable to import brain backup.')
    } finally {
      setBackupLoading(undefined)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Local brain storage" description="PerpetualBrain prefers the local file API and falls back to browser storage when the backend is unavailable." />
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-cyan-200">
              <MonitorCog size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Runtime and Storage</h2>
              <p className="text-xs text-slate-500">{runtimeLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="slate">{desktopRuntime ? 'Desktop runtime' : 'Browser runtime'}</Badge>
            <Badge tone={storageMode === 'api' ? 'cyan' : 'gold'}>{storageMode === 'api' ? 'File system mode' : 'Browser fallback mode'}</Badge>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">{storageMessage}</p>
        {activeBrainPath ? (
          <div className="gradient-border-soft mt-3 rounded-lg p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active brain path</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-300">{activeBrainPath}</p>
              </div>
              <CopyButton className="shrink-0" label="Copy Path" value={activeBrainPath} />
            </div>
          </div>
        ) : null}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="gradient-border-strong rounded-lg p-4">
            <p className="text-sm font-semibold text-teal-50">ApiBrainStorage</p>
            <p className="mt-2 text-sm leading-6 text-teal-100/75">Preferred adapter. Reads, writes, creates, and deletes Markdown files through the local Node API.</p>
          </div>
          <div className="gradient-border-soft rounded-lg p-4">
            <p className="text-sm font-semibold text-white">LocalStorageBrainStorage</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Fallback adapter. Keeps the app usable when the API is not running, but does not write to disk.</p>
          </div>
        </div>
        <div className="gradient-border-soft mt-4 rounded-lg p-4">
          <p className="text-sm font-semibold text-white">Packaged desktop brain folder</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            macOS builds store writable brain files in <span className="font-mono text-slate-300">~/Library/Application Support/PerpetualBrain/brain</span>. On first launch, seed files are copied there only if the folder does not already exist.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Recommended: use a Git-tracked folder for your brain so changes are versioned and easy to back up.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button icon={<RefreshCw size={16} />} onClick={() => void reload()}>Reload From Disk</Button>
          <Button
            icon={<FolderOpen size={16} />}
            onClick={() => void chooseBrainFolder()}
            disabled={!desktopRuntime?.chooseBrainFolder}
          >
            Choose Brain Folder
          </Button>
          <Button
            icon={<RotateCcw size={16} />}
            onClick={() => void resetBrainFolder()}
            disabled={!desktopRuntime?.resetBrainFolder}
          >
            Reset Default Folder
          </Button>
          {storageMode === 'localStorage' ? <Button icon={<RotateCcw size={16} />} variant="danger" onClick={reset}>Reset Seed Data</Button> : null}
          <span className="text-sm text-slate-500">{files.length} files currently loaded</span>
        </div>
        {!desktopRuntime ? <p className="mt-3 text-sm text-slate-500">Custom folder selection is available in the desktop app.</p> : null}
        {status ? <p className="mt-3 text-sm text-teal-100">{status}</p> : null}
      </Card>

      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-cyan-200">
              <Archive size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Brain Backup</h2>
              <p className="text-xs text-slate-500">Export or import portable brain ZIP archives.</p>
            </div>
          </div>
          <Badge tone={desktopRuntime ? 'cyan' : 'slate'}>{desktopRuntime ? 'Desktop only' : 'Unavailable in browser'}</Badge>
        </div>

        <div className="gradient-border-soft mt-4 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active brain path</p>
          <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-300">{activeBrainPath || 'Unknown'}</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="gradient-border-soft rounded-lg p-4">
            <p className="text-sm font-semibold text-white">Export backup</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Create a ZIP with supported files from the active brain folder. Git internals, temporary files, and unsupported binaries are excluded.</p>
          </div>
          <div className="gradient-border-soft rounded-lg p-4">
            <p className="text-sm font-semibold text-white">Import backup</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Validate a ZIP, extract supported files into a new timestamped folder, then switch to it after confirmation.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            icon={<Download size={16} />}
            disabled={!desktopRuntime?.exportBrainBackup || backupLoading !== undefined}
            onClick={() => void exportBackup()}
          >
            {backupLoading === 'export' ? 'Exporting' : 'Export Brain Backup'}
          </Button>
          <Button
            icon={<Upload size={16} />}
            disabled={!desktopRuntime?.importBrainBackup || backupLoading !== undefined}
            onClick={() => void importBackup()}
          >
            {backupLoading === 'import' ? 'Importing' : 'Import Brain Backup'}
          </Button>
        </div>

        {!desktopRuntime ? <p className="mt-3 text-sm text-slate-500">Backup import/export is available in the desktop app.</p> : null}
        {backupStatus ? <p className="mt-3 text-sm leading-6 text-teal-100">{backupStatus}</p> : null}
        {backupError ? <p className="mt-3 text-sm leading-6 text-rose-100">{backupError}</p> : null}
      </Card>

      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-cyan-200">
              <GitBranch size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Git Versioning</h2>
              <p className="text-xs text-slate-500">Lightweight status for the active brain folder.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {gitStatus ? <Badge tone={gitStatus.isGitRepo ? 'cyan' : 'gold'}>{gitStatus.isGitRepo ? 'Git repo' : 'Not initialized'}</Badge> : null}
            {gitStatus?.isGitRepo ? <Badge tone={gitStatus.clean ? 'slate' : 'rose'}>{gitStatus.clean ? 'Clean' : 'Changes'}</Badge> : null}
          </div>
        </div>

        {storageMode !== 'api' ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">Git integration is available when the local API is running.</p>
        ) : gitStatusError ? (
          <p className="mt-4 text-sm leading-6 text-rose-100">{gitStatusError}</p>
        ) : gitStatus ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <GitStat label="Branch" value={gitStatus.branch || 'No branch'} />
              <GitStat label="Changed" value={`${gitStatus.changedFiles.length}`} />
              <GitStat label="Untracked" value={`${gitStatus.untrackedFiles.length}`} />
            </div>

            {!gitStatus.gitAvailable ? (
              <p className="text-sm leading-6 text-rose-100">{gitStatus.error || 'Git is not available on this Mac.'}</p>
            ) : !gitStatus.isGitRepo ? (
              <div className="gradient-border-soft rounded-lg p-4">
                <p className="text-sm font-semibold text-white">Versioning is recommended</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Initialize Git in this brain folder to track Markdown changes over time. PerpetualBrain will not commit or push automatically.</p>
              </div>
            ) : gitStatus.clean ? (
              <div className="gradient-border-soft rounded-lg p-4 text-sm text-slate-300">No Git changes detected in the active brain folder.</div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-3">
                <GitFileList title="Staged files" files={gitStatus.stagedFiles} />
                <GitFileList title="Changed files" files={gitStatus.changedFiles} />
                <GitFileList title="Untracked files" files={gitStatus.untrackedFiles} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button icon={<RefreshCw size={16} />} disabled={gitLoading} onClick={() => void refreshGitStatus()}>{gitLoading ? 'Checking' : 'Refresh Git Status'}</Button>
              {gitStatus.gitAvailable && !gitStatus.isGitRepo ? <Button icon={<GitCommit size={16} />} variant="primary" onClick={() => void initializeGitRepo()}>Initialize Git Repo</Button> : null}
              <CopyButton label="Copy Git Commands" value={gitCommands} />
              {gitLastCheckedAt ? <span className="text-sm text-slate-500">Last checked {gitLastCheckedAt}</span> : null}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-400">Checking Git status...</p>
        )}
      </Card>
    </div>
  )
}

function GitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gradient-border-soft rounded-lg p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function GitFileList({ title, files }: { title: string; files: string[] }) {
  return (
    <div className="gradient-border-soft rounded-lg p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      {files.length ? (
        <div className="mt-3 max-h-52 space-y-2 overflow-auto">
          {files.map((file) => <p key={file} className="break-all font-mono text-xs leading-5 text-slate-300">{file}</p>)}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">None</p>
      )}
    </div>
  )
}

function shellQuotePath(path: string) {
  return `"${path.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function buildGitCommands(activeBrainPath?: string, gitStatus?: GitStatusResult) {
  const path = activeBrainPath && activeBrainPath !== 'Browser localStorage' ? activeBrainPath : '<active brain path>'
  const cd = `cd ${shellQuotePath(path)}`

  if (!gitStatus?.isGitRepo) {
    return [
      cd,
      'git init',
      'git add .',
      'git commit -m "Initialize PerpetualBrain notes"',
    ].join('\n')
  }

  return [
    cd,
    'git status',
    'git add .',
    'git commit -m "Update brain notes"',
  ].join('\n')
}
