import { ArrowRight, ChevronLeft, ChevronRight, FileText, Plus, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import { checkProjectIntakeCreation, defaultProjectIntakeAnswers, defaultQaCommandsForProjectType, generateProjectIntakeFiles, projectTypes, safeIntakeSlug, type ProjectIntakeAnswers } from '../utils/projectIntake'

export function Projects() {
  const { projects, createProject, createFile } = useBrain()
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
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
        actions={
          <>
            <Button icon={<Plus size={16} />} onClick={() => setIsCreating(true)}>New Project</Button>
            <Button icon={<Sparkles size={16} />} variant="primary" onClick={() => setIsWizardOpen(true)}>New Project Wizard</Button>
          </>
        }
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

      {isWizardOpen ? (
        <ProjectIntakeWizard
          existingProjectIds={projects.map((project) => project.id)}
          onCancel={() => setIsWizardOpen(false)}
          onCreate={async (answers) => {
            const creationCheck = checkProjectIntakeCreation(answers.projectName, projects.map((project) => project.id))
            if (!creationCheck.canCreate) {
              throw new Error(creationCheck.reason ?? 'Unable to create project.')
            }

            const slug = creationCheck.slug
            const generatedFiles = generateProjectIntakeFiles(answers)
            let createdFileCount = 0
            for (const file of generatedFiles) {
              await createFile({
                path: `brain/projects/${slug}/${file.fileName}`,
                title: file.title,
                kind: 'project',
                category: file.category,
                projectId: slug,
                content: file.content,
              })
              createdFileCount += 1
            }

            setIsWizardOpen(false)
            navigate(`/projects/${slug}`)
            return createdFileCount
          }}
        />
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

const wizardSteps = ['Basics', 'Scope', 'Workflow', 'Preview'] as const

function ProjectIntakeWizard({
  existingProjectIds,
  onCancel,
  onCreate,
}: {
  existingProjectIds: string[]
  onCancel(): void
  onCreate(answers: ProjectIntakeAnswers): Promise<number>
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<ProjectIntakeAnswers>(defaultProjectIntakeAnswers())
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const slug = safeIntakeSlug(answers.projectName)
  const generatedFiles = useMemo(() => generateProjectIntakeFiles(answers), [answers])
  const kickoff = generatedFiles.find((file) => file.fileName === 'KICKOFF_PROMPT.md')
  const creationCheck = checkProjectIntakeCreation(answers.projectName, existingProjectIds)
  const existingProject = slug ? !creationCheck.canCreate && creationCheck.reason?.includes('already exists') : false

  function update<K extends keyof ProjectIntakeAnswers>(key: K, value: ProjectIntakeAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }))
    setError(undefined)
  }

  function selectProjectType(projectType: ProjectIntakeAnswers['projectType']) {
    setAnswers((current) => ({
      ...current,
      projectType,
      qaCommands: defaultQaCommandsForProjectType(projectType),
    }))
    setError(undefined)
  }

  function next() {
    if (step === 0 && !slug) {
      setError('Project name is required.')
      return
    }
    setStep((current) => Math.min(current + 1, wizardSteps.length - 1))
  }

  async function create() {
    if (!creationCheck.canCreate) {
      setError(creationCheck.reason ?? 'Unable to create project.')
      return
    }

    setIsSubmitting(true)
    try {
      const count = await onCreate(answers)
      setError(`Created ${count} project files.`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create project.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="gradient-top-line p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">New Project Wizard</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Create a complete project brain, kickoff prompt, decision log, and context history from a structured intake. No external AI calls are made.</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>Close</Button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        {wizardSteps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`gradient-border-soft rounded-lg px-3 py-2 text-left text-sm transition ${index === step ? 'text-cyan-100 shadow-[0_0_18px_rgba(49,200,255,0.12)]' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setStep(index)}
          >
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step {index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {step === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <TextInput label="Project name" value={answers.projectName} onChange={(value) => update('projectName', value)} placeholder="Example: OrbitKit" autoFocus />
            <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
              Project type
              <select className="dark-input gradient-focus min-h-11 rounded-lg px-3 text-white" value={answers.projectType} onChange={(event) => selectProjectType(event.target.value as ProjectIntakeAnswers['projectType'])}>
                {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <div className="lg:col-span-2">
              <TextArea label="Short description" value={answers.shortDescription} onChange={(value) => update('shortDescription', value)} rows={4} placeholder="What this project is, who it serves, and the outcome you want." />
            </div>
            <div className="gradient-border-soft rounded-lg p-4 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Project folder</p>
              <p className="mt-2 break-all font-mono text-sm text-slate-300">brain/projects/{slug || 'project-slug'}</p>
              {existingProject ? <p className="mt-2 text-sm text-rose-100">This project already exists. The wizard blocks overwrite by default.</p> : null}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea label="Tech stack" value={answers.techStack} onChange={(value) => update('techStack', value)} placeholder="- Vite&#10;- TypeScript&#10;- Phaser 3" />
            <TextArea label="Visual direction" value={answers.visualDirection} onChange={(value) => update('visualDirection', value)} />
            <TextArea label="Main goals" value={answers.mainGoals} onChange={(value) => update('mainGoals', value)} rows={5} />
            <TextArea label="MVP features" value={answers.mvpFeatures} onChange={(value) => update('mvpFeatures', value)} rows={5} />
            <TextArea label="Non-goals" value={answers.nonGoals} onChange={(value) => update('nonGoals', value)} rows={5} />
            <TextArea label="Important constraints" value={answers.constraints} onChange={(value) => update('constraints', value)} rows={5} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea label="QA/build commands" value={answers.qaCommands} onChange={(value) => update('qaCommands', value)} rows={6} />
            <TextArea label="Codex workflow preferences" value={answers.codexPreferences} onChange={(value) => update('codexPreferences', value)} rows={6} />
            <TextArea label="Asset rules" value={answers.assetRules} onChange={(value) => update('assetRules', value)} rows={5} />
            <TextArea label="Git/release notes" value={answers.gitReleaseNotes} onChange={(value) => update('gitReleaseNotes', value)} rows={5} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="gradient-border-soft rounded-lg p-4">
                <p className="text-sm font-semibold text-white">Generated structure</p>
                <div className="mt-3 grid gap-2">
                  {generatedFiles.map((file) => (
                    <div key={file.fileName} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                      <FileText size={15} className="text-cyan-200" />
                      <span className="font-mono text-xs">brain/projects/{slug || 'project-slug'}/{file.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gradient-border-soft rounded-lg p-4">
                <p className="text-sm font-semibold text-white">Creation safety</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">The wizard creates new Markdown files through the existing storage adapter. Existing project folders are blocked by default and are not overwritten silently.</p>
                {existingProject ? <p className="mt-3 text-sm text-rose-100">Rename this project before creation. Existing folder: brain/projects/{slug}</p> : null}
              </div>
            </div>
            <div className="gradient-border-strong overflow-hidden rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/45 px-4 py-3">
                <div>
                  <h3 className="font-semibold text-white">Kickoff Prompt Preview</h3>
                  <p className="text-xs text-slate-500">{kickoff?.content.length.toLocaleString() ?? 0} characters</p>
                </div>
                {kickoff ? <CopyButton label="Copy Kickoff" value={kickoff.content} /> : null}
              </div>
              <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap bg-black/40 p-4 font-mono text-xs leading-5 text-slate-200">{kickoff?.content}</pre>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className={`mt-4 text-sm ${error.startsWith('Created') ? 'text-teal-100' : 'text-rose-100'}`}>{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" icon={<ChevronLeft size={16} />} disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>Back</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          {step < wizardSteps.length - 1 ? (
            <Button variant="primary" icon={<ChevronRight size={16} />} onClick={next}>Next</Button>
          ) : (
            <Button variant="primary" icon={<Sparkles size={16} />} disabled={isSubmitting || existingProject} onClick={() => void create()}>{isSubmitting ? 'Creating' : 'Create Project Brain'}</Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function TextInput({ label, value, onChange, placeholder, autoFocus }: { label: string; value: string; onChange(value: string): void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
      {label}
      <input
        autoFocus={autoFocus}
        className="dark-input gradient-focus min-h-11 rounded-lg px-3 text-white placeholder:text-slate-600"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({ label, value, onChange, rows = 4, placeholder }: { label: string; value: string; onChange(value: string): void; rows?: number; placeholder?: string }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
      {label}
      <textarea
        className="dark-input gradient-focus min-w-0 resize-y rounded-lg px-3 py-2 text-sm leading-6 text-white placeholder:text-slate-600"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
