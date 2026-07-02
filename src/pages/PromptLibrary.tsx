import { Copy, Pencil, TerminalSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import { getPromptTemplates } from '../utils/brain'
import { copyToClipboard } from '../utils/copy'

export function PromptLibrary() {
  const { files } = useBrain()
  const prompts = getPromptTemplates(files)
  const sourceFile = files.find((file) => file.name === 'PROMPT_LIBRARY.md')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Prompt Library"
        title="Reusable Codex prompts"
        description="Editable templates for kickoffs, phase work, bug fixes, UI polish, assets, refactors, QA, releases, and commit summaries."
        actions={sourceFile ? <Link className="gradient-border-soft inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:text-white" to={`/files/${sourceFile.id}`}><Pencil size={16} /> Edit Source</Link> : null}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="group p-5 transition hover:shadow-[0_0_22px_rgba(124,92,255,0.1)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="gradient-border-soft grid size-10 shrink-0 place-items-center rounded-lg text-cyan-200">
                  <TerminalSquare size={18} />
                </span>
                <h2 className="text-lg font-semibold text-white">{prompt.title}</h2>
              </div>
              <Button className="shrink-0" icon={<Copy size={16} />} onClick={() => void copyToClipboard(prompt.body)}>Copy</Button>
            </div>
            <p className="gradient-border-soft mt-4 whitespace-pre-line rounded-lg p-4 text-sm leading-6 text-slate-400">{prompt.body}</p>
            <div className="mt-4 flex justify-end">
              <CopyButton label="Copy Prompt" value={`## ${prompt.title}\n${prompt.body}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
