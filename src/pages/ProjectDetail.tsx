import { ArrowRight, CheckCircle2, FilePlus, Files, Sparkles } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
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
  const kickoff = getFileByCategory(files, project.id, 'KICKOFF_PROMPT')
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
        <Card className="gradient-top-line p-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-cyan-200">
              <CheckCircle2 size={18} />
            </span>
            <h2 className="text-lg font-semibold text-white">Current Status</h2>
          </div>
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
          <div className="flex items-center gap-3">
              <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-slate-200">
              <Files size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Brain Files</h2>
              <p className="text-xs text-slate-500">{project.files.length} Markdown context files</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {project.files.map((file) => (
              <Link key={file.id} to={`/files/${file.id}`} className="gradient-border-soft group flex items-center justify-between gap-3 rounded-lg p-3 transition hover:shadow-[0_0_18px_rgba(124,92,255,0.1)]">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{file.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{file.name}</span>
                </span>
                <ArrowRight className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-teal-200" size={15} />
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">Active Tasks</h2>
            <div className="gradient-divider mt-3 opacity-70" />
            <div className="mt-4">
            <MarkdownView content={sectionFromMarkdown(projectFile?.content ?? '', 'Active Tasks') || 'No active tasks captured.'} />
            </div>
          </Card>
          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">Known Issues</h2>
            <div className="gradient-divider mt-3 opacity-70" />
            <div className="mt-4">
            <MarkdownView content={sectionFromMarkdown(projectFile?.content ?? '', 'Known Issues') || 'No known issues captured.'} />
            </div>
          </Card>
        </div>
      </section>

      {kickoff ? (
        <Card className="gradient-top-line p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Kickoff Prompt</h2>
              <p className="mt-1 text-sm text-slate-500">Copy this prompt into Codex to start the first scoped implementation session.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton label="Copy Kickoff Prompt" value={kickoff.content} />
              <Button icon={<ArrowRight size={16} />} onClick={() => navigate(`/files/${kickoff.id}`)}>Open Prompt</Button>
            </div>
          </div>
          <div className="gradient-border-soft mt-4 max-h-72 overflow-auto rounded-lg p-4">
            <MarkdownView content={kickoff.content} />
          </div>
        </Card>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Design Direction</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{sectionFromMarkdown(projectFile?.content ?? '', 'Visual Direction') || design?.title || 'No design direction yet.'}</p>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white">Recent Decisions</h2>
          <div className="mt-3 grid gap-2">
            {decisions.map((decision) => <p key={decision.id} className="gradient-border-soft rounded-md px-3 py-2 text-sm leading-6 text-slate-300">{decision.decision}</p>)}
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
