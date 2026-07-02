import { RotateCcw } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Settings() {
  const { files, resetToSeed } = useBrain()

  async function reset() {
    if (window.confirm('Reset local browser storage to the seeded /brain Markdown files? Unsaved local edits will be replaced.')) {
      await resetToSeed()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Local brain storage" description="Phase 1 uses the Markdown files under /brain as seed data, then persists edits in browser localStorage." />
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-white">Storage Adapter</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-teal-300/25 bg-teal-300/10 p-4">
            <p className="text-sm font-semibold text-teal-50">LocalStorageBrainStorage</p>
            <p className="mt-2 text-sm leading-6 text-teal-100/75">Active adapter. Supports create, edit, save, search, and bundle generation in the browser.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">FileSystemBrainStorage</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Reserved adapter for a future Electron or Node-backed build that writes directly to local Markdown files.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button icon={<RotateCcw size={16} />} variant="danger" onClick={reset}>Reset Seed Data</Button>
          <span className="text-sm text-slate-500">{files.length} files currently loaded</span>
        </div>
      </Card>
    </div>
  )
}
