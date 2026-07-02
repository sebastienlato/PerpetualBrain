import { RefreshCw, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Settings() {
  const { files, resetToSeed, reloadFromSource, storageMode, storageMessage, activeBrainPath } = useBrain()
  const [status, setStatus] = useState<string>()

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

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Local brain storage" description="PerpetualBrain prefers the local file API and falls back to browser storage when the backend is unavailable." />
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Storage Adapter</h2>
          <Badge tone={storageMode === 'api' ? 'cyan' : 'gold'}>{storageMode === 'api' ? 'File system mode' : 'Browser fallback mode'}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">{storageMessage}</p>
        {activeBrainPath ? (
          <p className="gradient-border-soft mt-2 break-all rounded-lg px-3 py-2 font-mono text-xs text-slate-300">
            {activeBrainPath}
          </p>
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
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button icon={<RefreshCw size={16} />} onClick={() => void reload()}>Reload From Disk</Button>
          {storageMode === 'localStorage' ? <Button icon={<RotateCcw size={16} />} variant="danger" onClick={reset}>Reset Seed Data</Button> : null}
          <span className="text-sm text-slate-500">{files.length} files currently loaded</span>
        </div>
        {status ? <p className="mt-3 text-sm text-teal-100">{status}</p> : null}
      </Card>
    </div>
  )
}
