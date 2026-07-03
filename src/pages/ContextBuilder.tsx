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
import { appendContextHistory, buildContextHistoryEntry, contextPresets, generateContextBundle, getContextPreset } from '../utils/contextBundle'

export function ContextBuilder() {
  const { files, projects, reloadFromSource, saveFile, createFile } = useBrain()
  const prompts = useMemo(() => getPromptTemplates(files), [files])
  const [exportStatus, setExportStatus] = useState<string>()
  const defaultProjectId = projects[0]?.id ?? ''
  const defaultPreset = contextPresets[1]
  const [options, setOptions] = useState<ContextBundleOptions>({
    projectId: defaultProjectId,
    fileIds: [],
    promptTemplateId: prompts[0]?.id,
    presetId: defaultPreset.id,
    currentGoal: defaultPreset.defaultGoal,
    activeTask: defaultPreset.defaultTask,
    issueOrProblem: '',
    acceptanceCriteria: defaultPreset.defaultAcceptanceCriteria,
    verificationCommands: defaultPreset.defaultVerificationCommands,
  })

  const selectedPreset = getContextPreset(options.presetId)
  const selectedProject = projects.find((project) => project.id === options.projectId)
  const projectFiles = files.filter((file) => file.projectId === options.projectId)
  const globalDefaults = files.filter((file) => ['CODING_STANDARDS.md', 'DESIGN_STANDARDS.md', 'CODEX_WORKFLOW.md', 'CONTEXT_PRESETS.md'].includes(file.name))
  const relevantFiles = [...projectFiles, ...globalDefaults]
  const selectedIds = options.fileIds.length ? options.fileIds : relevantFiles.filter((file) => ['PROJECT.md', 'ARCHITECTURE.md', 'DESIGN_RULES.md', 'CODEX_CONTEXT.md', 'DECISIONS.md', 'LESSONS.md', 'TODO.md', 'CODING_STANDARDS.md', 'DESIGN_STANDARDS.md', 'CODEX_WORKFLOW.md', 'CONTEXT_PRESETS.md'].includes(file.name)).map((file) => file.id)
  const bundle = generateContextBundle({ ...options, fileIds: selectedIds }, files, projects, prompts)

  useEffect(() => {
    void reloadFromSource()
  }, [reloadFromSource])

  useEffect(() => {
    setOptions((current) => ({
      ...current,
      projectId: current.projectId || defaultProjectId,
      promptTemplateId: current.promptTemplateId || prompts[0]?.id,
    }))
  }, [defaultProjectId, prompts])

  function update<K extends keyof ContextBundleOptions>(key: K, value: ContextBundleOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  function selectPreset(presetId: string) {
    const preset = getContextPreset(presetId)
    setOptions((current) => ({
      ...current,
      presetId,
      currentGoal: preset.defaultGoal,
      activeTask: preset.defaultTask,
      acceptanceCriteria: preset.defaultAcceptanceCriteria,
      verificationCommands: preset.defaultVerificationCommands,
    }))
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
      const latestOptions = { ...options, fileIds: selectedIds }
      const latestBundle = generateContextBundle(latestOptions, latestFiles, latestProjects, latestPrompts)
      const existing = getFileByCategory(latestFiles, selectedProject.id, 'CODEX_CONTEXT')
      const existingHistory = getFileByCategory(latestFiles, selectedProject.id, 'CONTEXT_HISTORY')

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

      const latestProjectFiles = latestFiles.filter((file) => selectedIds.includes(file.id))
      const historyEntry = buildContextHistoryEntry(latestOptions, getContextPreset(options.presetId), latestBundle, latestProjectFiles)
      const historyContent = appendContextHistory(existingHistory?.content, historyEntry)

      if (existingHistory) {
        await saveFile({ ...existingHistory, content: historyContent })
      } else {
        await createFile({
          path: `brain/projects/${selectedProject.id}/CONTEXT_HISTORY.md`,
          title: `Context History for ${selectedProject.name}`,
          kind: 'project',
          category: 'CONTEXT_HISTORY',
          projectId: selectedProject.id,
          content: historyContent,
        })
      }

      await reloadFromSource()
      setExportStatus('Exported CODEX_CONTEXT.md and appended CONTEXT_HISTORY.md.')
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
        description="Choose a workflow preset, select project memory, and generate a structured prompt bundle for Codex."
        actions={
          <>
            <Button icon={<Save size={16} />} onClick={() => void exportCodexContext()}>Export CODEX_CONTEXT.md</Button>
            <CopyButton label="Copy Bundle" value={bundle} />
          </>
        }
      />
      {exportStatus ? <div className="gradient-border-soft rounded-lg px-4 py-3 text-sm text-cyan-100">{exportStatus}</div> : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="min-w-0 space-y-5">
          <Card className="gradient-top-line p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-cyan-200">
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
                  className="dark-input gradient-focus min-h-11 min-w-0 rounded-lg px-3 text-white"
                  value={options.projectId}
                  onChange={(event) => setOptions((current) => ({ ...current, projectId: event.target.value, fileIds: [] }))}
                >
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
                Workflow Preset
                <select
                  className="dark-input gradient-focus min-h-11 min-w-0 rounded-lg px-3 text-white"
                  value={selectedPreset.id}
                  onChange={(event) => selectPreset(event.target.value)}
                >
                  {contextPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title}</option>)}
                </select>
              </label>
              <div className="gradient-border-soft rounded-lg p-4">
                <p className="text-sm font-semibold text-white">{selectedPreset.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{selectedPreset.description}</p>
              </div>
              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-300">
                Prompt Template
                <select
                  className="dark-input gradient-focus min-h-11 min-w-0 rounded-lg px-3 text-white"
                  value={options.promptTemplateId}
                  onChange={(event) => update('promptTemplateId', event.target.value)}
                >
                  {prompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.title}</option>)}
                </select>
              </label>
              <TextArea label="Current Goal" value={options.currentGoal} onChange={(value) => update('currentGoal', value)} />
              <TextArea label="Active Task" value={options.activeTask} onChange={(value) => update('activeTask', value)} />
              <TextArea label={selectedPreset.issueLabel || 'Issue / Problem / Notes'} value={options.issueOrProblem ?? ''} onChange={(value) => update('issueOrProblem', value)} rows={4} />
              <TextArea label="Acceptance Criteria" value={options.acceptanceCriteria} onChange={(value) => update('acceptanceCriteria', value)} rows={5} />
              <TextArea label="Verification Commands" value={options.verificationCommands ?? ''} onChange={(value) => update('verificationCommands', value)} rows={5} />
            </div>
          </Card>

          <Card className="gradient-top-line p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-slate-200">
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

        <Card className="gradient-border-strong overflow-hidden xl:sticky xl:top-8 xl:self-start">
          <div className="neon-edge flex flex-col gap-3 border-b border-white/10 bg-black/45 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white">Codex Context Bundle</h2>
              <p className="text-xs text-slate-500">{bundle.length.toLocaleString()} characters</p>
              <p className="mt-1 text-xs text-cyan-100/80">{selectedPreset.title}</p>
            </div>
            <CopyButton label="Copy" value={bundle} />
          </div>
          <pre className="max-h-[58rem] overflow-auto whitespace-pre-wrap bg-[linear-gradient(180deg,rgba(2,3,5,0.96),rgba(8,10,15,0.92))] p-5 font-mono text-[0.82rem] leading-6 text-slate-200 shadow-[inset_0_18px_70px_rgba(0,0,0,0.28)] md:p-6">{bundle}</pre>
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
        className="dark-input gradient-focus min-w-0 resize-y rounded-lg px-3 py-2 text-sm leading-6 text-white placeholder:text-slate-600"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
