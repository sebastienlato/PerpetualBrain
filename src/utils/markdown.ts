import type { BrainFile, DecisionRecord, DecisionStatus, PromptTemplate } from '../types/brain'

export function titleFromMarkdown(content: string) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim()
}

export function sectionFromMarkdown(content: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = content.match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, 'im'))
  return match?.[1]?.trim() ?? ''
}

export function listFromSection(content: string, heading: string) {
  return sectionFromMarkdown(content, heading)
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)
}

export function firstParagraph(content: string) {
  return content
    .replace(/^#\s+.+$/m, '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !block.startsWith('##'))
    ?.replace(/\n/g, ' ') ?? ''
}

export function plainText(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[>|*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseDecisionLog(file: BrainFile, projectName = 'Global'): DecisionRecord[] {
  const lines = file.content.split('\n').filter((line) => line.trim().startsWith('|'))
  const bodyRows = lines.slice(2)

  return bodyRows
    .map((line, index) => {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
      if (cells.length < 6) {
        return undefined
      }

      const [date, decision, reason, impact, relatedFiles, status] = cells
      return {
        id: `${file.id}-${index}`,
        projectId: file.projectId ?? 'global',
        projectName,
        date,
        decision,
        reason,
        impact,
        relatedFiles,
        status: normalizeDecisionStatus(status),
      }
    })
    .filter((record): record is DecisionRecord => Boolean(record))
}

export function parsePromptTemplates(file: BrainFile): PromptTemplate[] {
  const matches = [...file.content.matchAll(/^##\s+(.+)\n([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm)]
  return matches.map((match) => ({
    id: `${file.id}-${slugify(match[1])}`,
    title: match[1].trim(),
    body: match[2].trim(),
    sourceFileId: file.id,
  }))
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function normalizeDecisionStatus(status: string): DecisionStatus {
  const lowered = status.toLowerCase()
  if (lowered === 'changed' || lowered === 'deprecated') {
    return lowered
  }
  return 'active'
}
