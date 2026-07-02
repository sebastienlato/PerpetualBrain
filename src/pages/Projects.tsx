import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Projects() {
  const { projects } = useBrain()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Project memory hubs"
        description="Each project keeps architecture notes, design rules, decisions, active tasks, lessons, and copyable Codex context together."
        actions={<Button icon={<Plus size={16} />} onClick={() => alert('Create from the project template in Phase 1 by adding a project Markdown file from a project page.')}>New Project</Button>}
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" body="Add a project folder under /brain/projects or create one when the file-system adapter lands." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="group h-full p-5 transition hover:border-teal-300/30 hover:bg-teal-300/8">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                  <ArrowRight className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-teal-200" size={17} />
                </div>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">{project.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.techStack.slice(0, 4).map((tech) => <Badge key={tech}>{tech}</Badge>)}
                </div>
                <p className="mt-5 border-t border-white/10 pt-3 text-xs text-slate-500">{project.files.length} files in {project.path}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
