import { Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { MarkdownView } from '../components/MarkdownView'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Lessons() {
  const { files, projects } = useBrain()
  const lessonFiles = files.filter((file) => file.name === 'LESSONS.md')

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Lessons" title="Rules learned the hard way" description="Capture mistakes, recurring constraints, and future Codex instructions per project." />
      {lessonFiles.length === 0 ? (
        <EmptyState title="No lessons yet" body="Create a LESSONS.md file inside a project folder to start preserving learning." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lessonFiles.map((file) => {
            const project = projects.find((item) => item.id === file.projectId)
            return (
              <Card key={file.id} className="gradient-top-line p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-amber-100">
                      <Lightbulb size={18} />
                    </span>
                    <h2 className="text-lg font-semibold text-white">{project?.name ?? file.title}</h2>
                  </div>
                  <Link className="rounded-md px-2 py-1 text-sm text-cyan-200 transition hover:bg-white/[0.06] hover:text-fuchsia-100" to={`/files/${file.id}`}>Edit</Link>
                </div>
                <div className="gradient-border-soft mt-5 rounded-lg p-4">
                  <MarkdownView content={file.content.replace(/^#\s+.+\n*/, '')} />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
