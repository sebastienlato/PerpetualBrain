import { ArrowRight, ClipboardList, FileText, FolderKanban, History, Library, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import { getDecisions, pinnedPromptFiles, recentFiles } from '../utils/brain'

export function Dashboard() {
  const { files, projects } = useBrain()
  const navigate = useNavigate()
  const decisions = getDecisions(files, projects).slice(0, 4)
  const recent = recentFiles(files, 5)
  const pinned = pinnedPromptFiles(files).slice(0, 4)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="AI command center"
        title="Structured context for sharper Codex work"
        description="Maintain project memory, standards, prompts, decisions, and copy-ready bundles without scattering context across random notes."
        actions={<Button icon={<Sparkles size={16} />} variant="primary" onClick={() => navigate('/context-builder')}>Build Context</Button>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<FolderKanban size={18} />} label="Active projects" value={projects.length.toString()} />
        <Metric icon={<FileText size={18} />} label="Brain files" value={files.length.toString()} />
        <Metric icon={<Library size={18} />} label="Pinned prompts" value={pinned.length.toString()} />
        <Metric icon={<History size={18} />} label="Recent decisions" value={decisions.length.toString()} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Active Projects</h2>
              <p className="mt-1 text-sm text-slate-500">Structured memory hubs ready for agent handoff.</p>
            </div>
            <Link className="rounded-md px-2 py-1 text-sm text-teal-200 transition hover:bg-teal-300/10 hover:text-teal-100" to="/projects">View all</Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="group rounded-lg border border-white/10 bg-slate-950/45 p-4 transition duration-200 hover:border-teal-300/35 hover:bg-teal-300/10">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <ArrowRight className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-teal-200" size={16} />
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{project.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                  {project.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="cyan">{tag}</Badge>)}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">Ready Bundles</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Start with a project, include standards and lessons, then copy one clean Codex kickoff.</p>
          <div className="mt-5 rounded-lg border border-teal-300/22 bg-[linear-gradient(135deg,rgba(45,212,191,0.18),rgba(96,165,250,0.08))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Badge tone="cyan">copy-ready</Badge>
            <h3 className="font-semibold text-teal-50">ShadowSpire phase context</h3>
            <p className="mt-2 text-sm leading-6 text-teal-100/75">Project memory, design rules, decisions, lessons, and prompt scaffolding are seeded and ready.</p>
            <Button className="mt-4" variant="primary" icon={<Sparkles size={16} />} onClick={() => navigate('/context-builder')}>Open Builder</Button>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white">Recently Edited</h2>
          <div className="mt-4 grid gap-2">
            {recent.map((file) => (
              <Link key={file.id} to={`/files/${file.id}`} className="block rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/16 hover:bg-white/[0.075]">
                <span className="block text-sm font-medium text-white">{file.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{file.path}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white">Pinned Prompts</h2>
          <div className="mt-4 grid gap-2">
            {pinned.map((file) => (
              <div key={file.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <span className="block text-sm font-medium text-white">{file.title}</span>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link className="rounded-md px-2 py-1 text-xs font-semibold text-teal-200 transition hover:bg-teal-300/10 hover:text-teal-100" to={`/files/${file.id}`}>Open</Link>
                  <CopyButton className="min-h-8 px-2.5 text-xs" label="Copy" value={file.content} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><ClipboardList size={18} /> Recent Decisions</h2>
          <div className="mt-4 grid gap-3">
            {decisions.map((decision) => (
              <div key={decision.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">{decision.date}</span>
                  <Badge tone="gold">{decision.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium leading-5 text-white">{decision.decision}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4 transition duration-200 hover:border-white/16 hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-lg border border-teal-300/18 bg-teal-300/10 text-teal-200">{icon}</span>
        <span className="text-3xl font-bold tracking-normal text-white">{value}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-400">{label}</p>
    </Card>
  )
}
