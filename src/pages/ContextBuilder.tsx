import { Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { EmptyState } from '../components/EmptyState'
import { FilePicker } from '../components/FilePicker'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import type { ContextBundleOptions } from '../types/brain'
import { getPromptTemplates } from '../utils/brain'
import { generateContextBundle } from '../utils/contextBundle'

export function ContextBuilder() {
  const { files, projects } = useBrain()
  const prompts = useMemo(() => getPromptTemplates(files), [files])
  const defaultProjectId = projects[0]?.id ?? ''
  const [options, setOptions] = useState<ContextBundleOptions>({
    projectId: defaultProjectId,
    fileIds: [],
    promptTemplateId: prompts[0]?.id,
    currentGoal: 'Implement the next scoped phase while preserving existing project constraints.',
    activeTask: 'Read the selected context, make the smallest coherent change, and verify it.',
    acceptanceCriteria: '- Build succeeds.\n- Primary workflow is verified.\n- Files changed and limitations are reported.',
  })

  const selectedProject = projects.find((project) => project.id === options.projectId)
  const projectFiles = files.filter((file) => file.projectId === options.projectId)
  const globalDefaults = files.filter((file) => ['CODING_STANDARDS.md', 'DESIGN_STANDARDS.md', 'CODEX_WORKFLOW.md'].includes(file.name))
  const relevantFiles = [...projectFiles, ...globalDefaults]
  const selectedIds = options.fileIds.length ? options.fileIds : relevantFiles.filter((file) => ['PROJECT.md', 'ARCHITECTURE.md', 'DESIGN_RULES.md', 'CODEX_CONTEXT.md', 'DECISIONS.md', 'LESSONS.md', 'CODING_STANDARDS.md', 'DESIGN_STANDARDS.md'].includes(file.name)).map((file) => file.id)
  const bundle = generateContextBundle({ ...options, fileIds: selectedIds }, files, projects, prompts)

  function update<K extends keyof ContextBundleOptions>(key: K, value: ContextBundleOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  if (projects.length === 0) {
    return <EmptyState title="No projects available" body="Create a project brain first so the context builder has a target." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Context Builder"
        title="Generate Codex-ready project bundles"
        description="Select project memory, standards, decisions, lessons, and a prompt template, then copy a clean structured context bundle into Codex."
        actions={<CopyButton label="Copy Bundle" value={bundle} />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Bundle Inputs</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Project
                <select
                  className="min-h-11 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-white outline-none"
                  value={options.projectId}
                  onChange={(event) => setOptions((current) => ({ ...current, projectId: event.target.value, fileIds: [] }))}
                >
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Prompt Template
                <select
                  className="min-h-11 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-white outline-none"
                  value={options.promptTemplateId}
                  onChange={(event) => update('promptTemplateId', event.target.value)}
                >
                  {prompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.title}</option>)}
                </select>
              </label>
              <TextArea label="Current Goal" value={options.currentGoal} onChange={(value) => update('currentGoal', value)} />
              <TextArea label="Active Task" value={options.activeTask} onChange={(value) => update('activeTask', value)} />
              <TextArea label="Acceptance Criteria" value={options.acceptanceCriteria} onChange={(value) => update('acceptanceCriteria', value)} rows={5} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Included Files</h2>
              <Button icon={<Sparkles size={16} />} onClick={() => update('fileIds', relevantFiles.map((file) => file.id))}>Select All</Button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selectedProject?.name} files plus global standards. Defaults include the core project context.</p>
            <div className="mt-4">
              <FilePicker files={relevantFiles} selectedIds={selectedIds} onChange={(ids) => update('fileIds', ids)} />
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Codex Context Bundle</h2>
              <p className="text-xs text-slate-500">{bundle.length.toLocaleString()} characters</p>
            </div>
            <CopyButton label="Copy" value={bundle} />
          </div>
          <pre className="max-h-[58rem] overflow-auto whitespace-pre-wrap bg-slate-950/72 p-5 text-sm leading-6 text-slate-200">{bundle}</pre>
        </Card>
      </div>
    </div>
  )
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange(value: string): void; rows?: number }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-300">
      {label}
      <textarea
        className="resize-y rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
