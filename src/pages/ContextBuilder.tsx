import { FileCheck2, Save, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { EmptyState } from '../components/EmptyState'
import { FilePicker } from '../components/FilePicker'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import type { ContextBundleOptions } from '../types/brain'
import { buildProjects, getFileByCategory, getPromptTemplates } from '../utils/brain'
import { generateContextBundle } from '../utils/contextBundle'

export function ContextBuilder() {
  const { files, projects, reloadFromSource, saveFile, createFile } = useBrain()
  const prompts = useMemo(() => getPromptTemplates(files), [files])
  const [exportStatus, setExportStatus] = useState<string>()
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

  useEffect(() => {
    void reloadFromSource()
  }, [reloadFromSource])

  function update<K extends keyof ContextBundleOptions>(key: K, value: ContextBundleOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  if (projects.length === 0) {
    return <EmptyState title="No projects available" body="Create a project brain first so the context builder has a target." />
  }

  async function exportCodexContext() {
    if (!selectedProject) {
      return
    }

    try {
      const latestFiles = await reloadFromSource()
      const latestProjects = buildProjects(latestFiles)
      const latestPrompts = getPromptTemplates(latestFiles)
      const latestBundle = generateContextBundle({ ...options, fileIds: selectedIds }, latestFiles, latestProjects, latestPrompts)
      const existing = getFileByCategory(latestFiles, selectedProject.id, 'CODEX_CONTEXT')

      if (existing) {
        await saveFile({ ...existing, content: latestBundle })
      } else {
        await createFile({
          path: `brain/projects/${selectedProject.id}/CODEX_CONTEXT.md`,
          title: `Codex Context for ${selectedProject.name}`,
          kind: 'project',
          category: 'CODEX_CONTEXT',
          projectId: selectedProject.id,
          content: latestBundle,
        })
      }

      setExportStatus('Exported CODEX_CONTEXT.md to disk.')
      window.setTimeout(() => setExportStatus(undefined), 1800)
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Unable to export CODEX_CONTEXT.md.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Context Builder"
        title="Generate Codex-ready project bundles"
        description="Select project memory, standards, decisions, lessons, and a prompt template, then copy a clean structured context bundle into Codex."
        actions={
          <>
            <Button icon={<Save size={16} />} onClick={() => void exportCodexContext()}>Export CODEX_CONTEXT.md</Button>
            <CopyButton label="Copy Bundle" value={bundle} />
          </>
        }
      />
      {exportStatus ? <div className="rounded-lg border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">{exportStatus}</div> : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border border-teal-300/18 bg-teal-300/10 text-teal-200">
                <Sparkles size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Bundle Inputs</h2>
                <p className="text-xs text-slate-500">Goal, task, acceptance criteria, and prompt framing.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
                Project
                <select
                  className="min-h-11 min-w-0 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-white outline-none focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
                  value={options.projectId}
                  onChange={(event) => setOptions((current) => ({ ...current, projectId: event.target.value, fileIds: [] }))}
                >
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
                Prompt Template
                <select
                  className="min-h-11 min-w-0 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-white outline-none focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
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

          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-300">
                  <FileCheck2 size={18} />
                </span>
                <h2 className="text-lg font-semibold text-white">Included Files</h2>
              </div>
              <Button icon={<Sparkles size={16} />} onClick={() => update('fileIds', relevantFiles.map((file) => file.id))}>Select All</Button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selectedProject?.name} files plus global standards. Defaults include the core project context.</p>
            <div className="mt-4">
              <FilePicker files={relevantFiles} selectedIds={selectedIds} onChange={(ids) => update('fileIds', ids)} />
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden xl:sticky xl:top-8 xl:self-start">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white">Codex Context Bundle</h2>
              <p className="text-xs text-slate-500">{bundle.length.toLocaleString()} characters</p>
            </div>
            <CopyButton label="Copy" value={bundle} />
          </div>
          <pre className="max-h-[58rem] overflow-auto whitespace-pre-wrap bg-[linear-gradient(180deg,rgba(2,6,23,0.88),rgba(15,23,42,0.74))] p-5 font-mono text-[0.82rem] leading-6 text-slate-200 md:p-6">{bundle}</pre>
        </Card>
      </div>
    </div>
  )
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange(value: string): void; rows?: number }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
      {label}
      <textarea
        className="min-w-0 resize-y rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
