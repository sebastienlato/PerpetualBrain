import type { BrainFile, SearchResult } from '../types/brain'
import { plainText } from './markdown'

export function searchBrain(files: BrainFile[], query: string): SearchResult[] {
  const terms = plainText(query).toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) {
    return []
  }

  return files
    .map((file) => scoreFile(file, terms))
    .filter((result): result is SearchResult => Boolean(result))
    .sort((a, b) => b.score - a.score)
}

function scoreFile(file: BrainFile, terms: string[]): SearchResult | undefined {
  const title = file.title.toLowerCase()
  const path = file.path.toLowerCase()
  const text = plainText(file.content).toLowerCase()
  const tagSection = file.content.match(/^##\s+Tags\s*\n([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1]?.toLowerCase() ?? ''

  let score = 0
  let matchType: SearchResult['matchType'] = 'content'

  for (const term of terms) {
    if (title.includes(term)) {
      score += 12
      matchType = 'title'
    }
    if (path.includes(term)) {
      score += 6
      matchType = matchType === 'title' ? matchType : 'path'
    }
    if (tagSection.includes(term)) {
      score += 8
      matchType = matchType === 'title' ? matchType : 'tag'
    }
    if (text.includes(term)) {
      score += 3
    }
  }

  if (score === 0) {
    return undefined
  }

  return {
    file,
    score,
    snippet: buildSnippet(file.content, terms),
    matchType,
  }
}

function buildSnippet(content: string, terms: string[]) {
  const normalized = plainText(content)
  const lower = normalized.toLowerCase()
  const firstIndex = terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? 0
  const start = Math.max(0, firstIndex - 70)
  const end = Math.min(normalized.length, firstIndex + 170)
  return `${start > 0 ? '...' : ''}${normalized.slice(start, end)}${end < normalized.length ? '...' : ''}`
}
