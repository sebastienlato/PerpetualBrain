import type { BrainFile, BrainFileKind } from '../types/brain'
import { titleFromMarkdown } from '../utils/markdown'

const rawBrainFiles = import.meta.glob<string>('/brain/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const now = new Date().toISOString()

function classify(path: string): Pick<BrainFile, 'kind' | 'projectId' | 'category'> {
  const normalized = path.replace(/^\/brain\//, '')
  const parts = normalized.split('/')

  if (parts[0] === 'projects') {
    return {
      kind: 'project',
      projectId: parts[1],
      category: parts[2]?.replace(/\.md$/, '') ?? 'PROJECT',
    }
  }

  if (parts[0] === 'global') {
    return {
      kind: 'global',
      category: parts[1]?.replace(/\.md$/, '') ?? 'global',
    }
  }

  return {
    kind: 'template',
    category: parts[1]?.replace(/\.md$/, '') ?? 'template',
  }
}

function pathToId(path: string) {
  return path.replace(/^\/brain\//, '').replace(/\.md$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

function pathToName(path: string) {
  return path.split('/').at(-1) ?? 'BRAIN.md'
}

function isPinnedPrompt(file: BrainFile) {
  return file.path.endsWith('/global/PROMPT_LIBRARY.md') || file.path.includes('CODEX_')
}

export function getSeedBrainFiles(): BrainFile[] {
  return Object.entries(rawBrainFiles)
    .map(([path, content]) => {
      const classification = classify(path)
      const file: BrainFile = {
        id: pathToId(path),
        path: path.replace(/^\//, ''),
        name: pathToName(path),
        title: titleFromMarkdown(content) || pathToName(path).replace(/\.md$/, ''),
        content,
        updatedAt: now,
        pinned: false,
        ...classification,
      }
      return {
        ...file,
        pinned: isPinnedPrompt(file),
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

export const brainKinds: BrainFileKind[] = ['project', 'global', 'template']
