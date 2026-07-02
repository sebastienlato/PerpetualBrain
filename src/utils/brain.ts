import type { BrainFile, BrainProject, DecisionRecord, PromptTemplate } from '../types/brain'
import { firstParagraph, listFromSection, parseDecisionLog, parsePromptTemplates, sectionFromMarkdown } from './markdown'

export function buildProjects(files: BrainFile[]): BrainProject[] {
  const projectIds = [...new Set(files.filter((file) => file.kind === 'project' && file.projectId).map((file) => file.projectId as string))]

  return projectIds.map((projectId) => {
    const projectFiles = files.filter((file) => file.projectId === projectId)
    const projectFile = projectFiles.find((file) => file.name === 'PROJECT.md') ?? projectFiles[0]
    const title = projectFile?.title ?? projectId
    const summary = sectionFromMarkdown(projectFile?.content ?? '', 'Summary') || firstParagraph(projectFile?.content ?? '')
    const status = sectionFromMarkdown(projectFile?.content ?? '', 'Current Status')
    const techStack = listFromSection(projectFile?.content ?? '', 'Tech Stack')
    const tags = sectionFromMarkdown(projectFile?.content ?? '', 'Tags')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    return {
      id: projectId,
      name: title,
      path: `brain/projects/${projectId}`,
      summary,
      status,
      techStack,
      tags,
      files: projectFiles.sort((a, b) => a.name.localeCompare(b.name)),
      updatedAt: projectFiles.map((file) => file.updatedAt).sort().at(-1) ?? new Date().toISOString(),
    }
  })
}

export function getFileByCategory(files: BrainFile[], projectId: string, category: string) {
  return files.find((file) => file.projectId === projectId && file.category.toUpperCase() === category.toUpperCase())
}

export function getDecisions(files: BrainFile[], projects: BrainProject[]): DecisionRecord[] {
  const projectNameById = new Map(projects.map((project) => [project.id, project.name]))
  return files
    .filter((file) => file.name === 'DECISIONS.md')
    .flatMap((file) => parseDecisionLog(file, projectNameById.get(file.projectId ?? '') ?? 'Global'))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPromptTemplates(files: BrainFile[]): PromptTemplate[] {
  return files
    .filter((file) => file.name === 'PROMPT_LIBRARY.md' || file.kind === 'template')
    .flatMap((file) => {
      if (file.name === 'PROMPT_LIBRARY.md') {
        return parsePromptTemplates(file)
      }

      return [
        {
          id: file.id,
          title: file.title,
          body: file.content.replace(/^#\s+.+\n*/, '').trim(),
          sourceFileId: file.id,
        },
      ]
    })
}

export function recentFiles(files: BrainFile[], limit = 6) {
  return [...files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit)
}

export function pinnedPromptFiles(files: BrainFile[]) {
  return files.filter((file) => file.pinned || file.name.includes('CODEX') || file.name === 'PROMPT_LIBRARY.md')
}
