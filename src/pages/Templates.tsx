import { Link } from 'react-router-dom'
import { FileStack } from 'lucide-react'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Templates() {
  const { files } = useBrain()
  const templates = files.filter((file) => file.kind === 'template')

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Templates" title="Reusable project and handoff templates" description="Start new project context, phase handoffs, kickoff prompts, and bug reports from consistent Markdown templates." />
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((file) => (
          <Card key={file.id} className="gradient-top-line p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="gradient-border-soft grid size-10 shrink-0 place-items-center rounded-lg text-cyan-200">
                  <FileStack size={18} />
                </span>
                <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">{file.title}</h2>
                <p className="mt-1 truncate text-xs text-slate-500">{file.path}</p>
                </div>
              </div>
              <CopyButton value={file.content} />
            </div>
            <p className="gradient-border-soft mt-4 line-clamp-6 whitespace-pre-line rounded-lg p-4 text-sm leading-6 text-slate-400">{file.content.replace(/^#\s+.+\n*/, '').trim()}</p>
            <Link className="mt-4 inline-flex rounded-md px-2 py-1 text-sm text-cyan-200 transition hover:bg-white/[0.06] hover:text-fuchsia-100" to={`/files/${file.id}`}>Open template</Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
