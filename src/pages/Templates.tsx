import { Link } from 'react-router-dom'
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
          <Card key={file.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{file.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{file.path}</p>
              </div>
              <CopyButton value={file.content} />
            </div>
            <p className="mt-4 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-400">{file.content.replace(/^#\s+.+\n*/, '').trim()}</p>
            <Link className="mt-4 inline-flex text-sm text-teal-200 hover:text-teal-100" to={`/files/${file.id}`}>Open template</Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
