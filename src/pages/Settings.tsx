import { FolderOpen, MonitorCog, RefreshCw, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Settings() {
  const { files, resetToSeed, reloadFromSource, storageMode, storageMessage, activeBrainPath } = useBrain()
  const [status, setStatus] = useState<string>()
  const desktopRuntime = typeof window !== 'undefined' ? window.perpetualBrainDesktop : undefined
  const runtimeLabel = desktopRuntime ? `Electron desktop (${desktopRuntime.platform})` : 'Browser/dev server'

  async function reset() {
    if (window.confirm('Reset local browser storage to the seeded /brain Markdown files? Unsaved local edits will be replaced.')) {
      await resetToSeed()
      setStatus('Fallback seed data reset.')
    }
  }

  async function reload() {
    await reloadFromSource()
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
    </div>
  )
}
