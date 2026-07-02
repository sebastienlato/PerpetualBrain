import { FilePlus, Sparkles } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { MarkdownView } from '../components/MarkdownView'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import { getDecisions, getFileByCategory } from '../utils/brain'
import { sectionFromMarkdown } from '../utils/markdown'

export function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { files, projects, createFile } = useBrain()
  const project = projects.find((item) => item.id === projectId)

  if (!project) {
    return <EmptyState title="Project not found" body="The requested project does not exist in the current brain files." />
  }

  const currentProject = project
  const projectFile = getFileByCategory(files, project.id, 'PROJECT')
  const design = getFileByCategory(files, project.id, 'DESIGN_RULES')
  const codex = getFileByCategory(files, project.id, 'CODEX_CONTEXT')
  const lessons = getFileByCategory(files, project.id, 'LESSONS')
  const decisions = getDecisions(files, projects).filter((decision) => decision.projectId === project.id).slice(0, 4)

  async function createProjectNote() {
    const title = window.prompt('New Markdown file title')
    if (!title) {
      return
    }

    const category = title.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
    const file = await createFile({
      path: `brain/projects/${currentProject.id}/${category}.md`,
      title,
      kind: 'project',
      category,
      projectId: currentProject.id,
      content: `# ${title}\n\n## Notes\n\nCapture project-specific context here.\n`,
    })
    navigate(`/files/${file.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.summary}
        actions={
          <>
            <Button icon={<FilePlus size={16} />} onClick={() => void createProjectNote()}>New File</Button>
            <Button icon={<Sparkles size={16} />} variant="primary" onClick={() => navigate('/context-builder')}>Build Bundle</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <h2 className="text-lg font-semibold text-white">Current Status</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{project.status || 'No current status captured yet.'}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.techStack.map((tech) => <Badge key={tech} tone="cyan">{tech}</Badge>)}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Project Tags</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.length ? project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : <span className="text-sm text-slate-500">No tags yet</span>}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.2fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Brain Files</h2>
          <div className="mt-4 grid gap-2">
            {project.files.map((file) => (
              <Link key={file.id} to={`/files/${file.id}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:bg-white/[0.07]">
                <span className="block text-sm font-medium text-white">{file.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{file.name}</span>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Active Tasks</h2>
            <MarkdownView content={sectionFromMarkdown(projectFile?.content ?? '', 'Active Tasks') || 'No active tasks captured.'} />
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Known Issues</h2>
            <MarkdownView content={sectionFromMarkdown(projectFile?.content ?? '', 'Known Issues') || 'No known issues captured.'} />
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Design Direction</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{sectionFromMarkdown(projectFile?.content ?? '', 'Visual Direction') || design?.title || 'No design direction yet.'}</p>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Recent Decisions</h2>
          <div className="mt-3 grid gap-3">
            {decisions.map((decision) => <p key={decision.id} className="text-sm leading-6 text-slate-300">{decision.decision}</p>)}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Codex Ready</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{codex ? 'Project-specific instructions are ready for bundles.' : 'Add CODEX_CONTEXT.md to improve generated bundles.'}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{lessons ? 'Lessons learned are available for future work.' : 'No lessons file found.'}</p>
        </Card>
      </section>
    </div>
  )
}
