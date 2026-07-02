import { CheckCircle, Eye, PenLine, Save } from 'lucide-react'
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
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex gap-2">
            <Button icon={<PenLine size={16} />} variant={mode === 'edit' ? 'primary' : 'ghost'} onClick={() => setMode('edit')}>Edit</Button>
            <Button icon={<Eye size={16} />} variant={mode === 'preview' ? 'primary' : 'ghost'} onClick={() => setMode('preview')}>Preview</Button>
          </div>
          <span className="text-xs text-slate-500">{isDirty ? 'Unsaved changes' : `Saved ${new Date(file.updatedAt).toLocaleString()}`}</span>
        </div>
        {mode === 'edit' ? (
          <textarea
            className="min-h-[34rem] w-full resize-y border-0 bg-slate-950/60 p-5 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="min-h-[34rem] p-5">
            <MarkdownView content={draft} />
          </div>
        )}
      </Card>
    </div>
  )
}
