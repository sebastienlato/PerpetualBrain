import { ArrowRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function Projects() {
  const { projects, createProject } = useBrain()
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState<string>()

  async function handleNewProject() {
    if (!projectName.trim()) {
      setError('Project name is required.')
      return
    }

    try {
      const result = await createProject({ name: projectName.trim() })
      setProjectName('')
      setIsCreating(false)
      setError(undefined)
      navigate(`/projects/${result.slug}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create project.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Project memory hubs"
        description="Each project keeps architecture notes, design rules, decisions, active tasks, lessons, and copyable Codex context together."
        actions={<Button icon={<Plus size={16} />} onClick={() => setIsCreating(true)}>New Project</Button>}
      />

      {isCreating ? (
        <Card className="p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Project name
              <input
                autoFocus
                className="dark-input gradient-focus min-h-11 rounded-lg px-3 text-white placeholder:text-slate-600"
                placeholder="Example: My AI App"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleNewProject()
                  }
                  if (event.key === 'Escape') {
                    setIsCreating(false)
                  }
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => void handleNewProject()}>Create Project</Button>
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
        </Card>
      ) : null}

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" body="Add a project folder under /brain/projects or create one when the file-system adapter lands." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="group h-full p-5 transition hover:shadow-[0_0_22px_rgba(124,92,255,0.1)]">
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
