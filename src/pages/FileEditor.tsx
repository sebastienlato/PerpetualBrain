import { CheckCircle, Eye, FileText, PenLine, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { EmptyState } from '../components/EmptyState'
import { MarkdownView } from '../components/MarkdownView'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function FileEditor() {
  const { fileId } = useParams()
  const { files, saveFile } = useBrain()
  const file = files.find((item) => item.id === fileId)
  const [draft, setDraft] = useState(file?.content ?? '')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [saved, setSaved] = useState(false)

  const isDirty = useMemo(() => file ? draft !== file.content : false, [draft, file])

  useEffect(() => {
    setDraft(file?.content ?? '')
    setSaved(false)
  }, [file?.id, file?.content])

  if (!file) {
    return <EmptyState title="File not found" body="The selected Markdown file does not exist in local storage." />
  }

  const currentFile = file

  async function handleSave() {
    await saveFile({ ...currentFile, content: draft })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1400)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={file.kind}
        title={file.title}
        description={file.path}
        actions={
          <>
            {file.projectId ? <Link className="inline-flex min-h-10 items-center rounded-lg border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm font-semibold text-slate-100" to={`/projects/${file.projectId}`}>Project</Link> : null}
            <CopyButton value={draft} />
            <Button icon={saved ? <CheckCircle size={16} /> : <Save size={16} />} variant={isDirty ? 'primary' : 'secondary'} onClick={() => void handleSave()}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button icon={<PenLine size={16} />} variant={mode === 'edit' ? 'primary' : 'ghost'} onClick={() => setMode('edit')}>Edit</Button>
            <Button icon={<Eye size={16} />} variant={mode === 'preview' ? 'primary' : 'ghost'} onClick={() => setMode('preview')}>Preview</Button>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-400">
            <FileText size={13} />
            {isDirty ? 'Unsaved changes' : `Saved ${new Date(file.updatedAt).toLocaleString()}`}
          </span>
        </div>
        {mode === 'edit' ? (
          <textarea
            className="min-h-[38rem] w-full resize-y border-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.82),rgba(15,23,42,0.72))] p-5 font-mono text-[0.92rem] leading-7 text-slate-100 outline-none placeholder:text-slate-600 md:p-6"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="min-h-[38rem] bg-slate-950/28 p-5 md:p-6">
            <MarkdownView content={draft} />
          </div>
        )}
      </Card>
    </div>
  )
}
