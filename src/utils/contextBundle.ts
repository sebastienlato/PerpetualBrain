import type { BrainFile, BrainProject, ContextBundleOptions, PromptTemplate } from '../types/brain'
import { getFileByCategory } from './brain'

export function generateContextBundle(
  options: ContextBundleOptions,
  files: BrainFile[],
  projects: BrainProject[],
  prompts: PromptTemplate[],
) {
  const project = projects.find((item) => item.id === options.projectId)
  if (!project) {
    return ''
  }

  const selectedFiles = files.filter((file) => options.fileIds.includes(file.id))
  const prompt = prompts.find((item) => item.id === options.promptTemplateId)
  const architecture = getFileByCategory(files, project.id, 'ARCHITECTURE')
  const projectDesign = getFileByCategory(files, project.id, 'DESIGN_RULES')
  const projectIssues = getFileByCategory(files, project.id, 'TODO')
  const standards = files.find((file) => file.path.endsWith('/global/CODING_STANDARDS.md'))
  const designStandards = files.find((file) => file.path.endsWith('/global/DESIGN_STANDARDS.md'))
  const codexContext = getFileByCategory(files, project.id, 'CODEX_CONTEXT')

  return [
    '# Project Context',
    `Project: ${project.name}`,
    '',
    project.summary,
    '',
    `Status: ${project.status}`,
    '',
    project.techStack.length ? `Tech stack: ${project.techStack.join(', ')}` : '',
    '',
    '# Current Goal',
    options.currentGoal || 'Define the current implementation goal before starting.',
    '',
    '# Active Task',
    options.activeTask || 'No active task provided.',
    '',
    '# Architecture',
    architecture?.content ?? 'No architecture file selected.',
    '',
    '# Design Rules',
    [projectDesign?.content, designStandards?.content].filter(Boolean).join('\n\n'),
    '',
    '# Coding Standards',
    standards?.content ?? '',
    '',
    '# Known Issues',
    projectIssues?.content ?? 'No known issues file selected.',
    '',
    '# Relevant Project Files',
    selectedFiles.map((file) => `## ${file.title}\nPath: ${file.path}\n\n${file.content}`).join('\n\n'),
    '',
    '# Acceptance Criteria',
    options.acceptanceCriteria || 'Build succeeds and the primary workflow is verified.',
    '',
    '# Instructions for Codex',
    codexContext?.content ?? 'Read the relevant files, implement the requested change, verify it, and report the outcome.',
    '',
    prompt ? `# Prompt Template\n## ${prompt.title}\n${prompt.body}` : '',
  ]
    .filter((section) => section.trim().length > 0)
    .join('\n\n')
}
