import { AlertCircle, CheckCircle, Eye, FileText, PenLine, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { EmptyState } from '../components/EmptyState'
import { MarkdownView } from '../components/MarkdownView'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function FileEditor() {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const { files, saveFile, deleteFile } = useBrain()
  const file = files.find((item) => item.id === fileId)
  const [draft, setDraft] = useState(file?.content ?? '')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string>()

  const isDirty = useMemo(() => file ? draft !== file.content : false, [draft, file])
  const lastSynced = useRef<{ id?: string; content?: string }>({ id: file?.id, content: file?.content })

  useEffect(() => {
    if (!file) {
      return
    }
    const switchedFile = lastSynced.current.id !== file.id
    const hasUnsavedEdits = lastSynced.current.content !== undefined && draft !== lastSynced.current.content
    // Load the stored content when opening a different file, or when the same file changed on
    // disk and there is nothing unsaved to lose. Never overwrite pending edits underneath the user.
    if (switchedFile || !hasUnsavedEdits) {
      setDraft(file.content)
      setSaveStatus('idle')
      setSaveError(undefined)
    }
    lastSynced.current = { id: file.id, content: file.content }
  }, [file, draft])

  if (!file) {
    return <EmptyState title="File not found" body="The selected Markdown file could not be found in the active brain." />
  }

  const currentFile = file

  async function handleSave() {
    setSaveStatus('saving')
    setSaveError(undefined)
    try {
      await saveFile({ ...currentFile, content: draft })
      setSaveStatus('saved')
      window.setTimeout(() => setSaveStatus('idle'), 1400)
    } catch (error) {
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : 'Unable to save file.')
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${currentFile.path}? This removes the Markdown file from the active storage adapter.`)) {
      return
    }

    try {
      await deleteFile(currentFile)
      navigate(currentFile.projectId ? `/projects/${currentFile.projectId}` : '/')
    } catch (error) {
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : 'Unable to delete file.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={file.kind}
        title={file.title}
        description={file.path}
        actions={
          <>
            {file.projectId ? <Link className="gradient-border-soft inline-flex min-h-10 items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:text-white" to={`/projects/${file.projectId}`}>Project</Link> : null}
            <CopyButton value={draft} />
            <Button icon={saveStatus === 'saved' ? <CheckCircle size={16} /> : saveStatus === 'error' ? <AlertCircle size={16} /> : <Save size={16} />} variant={isDirty ? 'primary' : 'secondary'} disabled={saveStatus === 'saving'} onClick={() => void handleSave()}>
              {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Save'}
            </Button>
            <Button icon={<Trash2 size={16} />} variant="danger" onClick={() => void handleDelete()}>Delete</Button>
          </>
        }
      />

      <Card className="gradient-border-strong overflow-hidden">
        <div className="neon-edge flex flex-col gap-3 border-b border-white/10 bg-black/45 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button icon={<PenLine size={16} />} variant={mode === 'edit' ? 'primary' : 'ghost'} onClick={() => setMode('edit')}>Edit</Button>
            <Button icon={<Eye size={16} />} variant={mode === 'preview' ? 'primary' : 'ghost'} onClick={() => setMode('preview')}>Preview</Button>
          </div>
          <span className="gradient-border-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-300">
            <FileText size={13} />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save failed' : isDirty ? 'Unsaved changes' : `Saved ${new Date(file.updatedAt).toLocaleString()}`}
          </span>
        </div>
        {saveError ? <div className="border-b border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">{saveError}</div> : null}
        {mode === 'edit' ? (
          <textarea
            className="gradient-focus min-h-[38rem] w-full resize-y border border-transparent bg-[linear-gradient(180deg,rgba(2,3,5,0.96),rgba(8,10,15,0.92))] p-5 font-mono text-[0.92rem] leading-7 text-slate-100 outline-none placeholder:text-slate-600 md:p-6"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="min-h-[38rem] bg-[linear-gradient(180deg,rgba(2,3,5,0.94),rgba(8,10,15,0.9))] p-5 shadow-[inset_0_18px_60px_rgba(0,0,0,0.22)] md:p-6">
            <MarkdownView content={draft} />
          </div>
        )}
      </Card>
    </div>
  )
}
