import path from 'node:path'

export class BrainPathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BrainPathError'
  }
}

export function normalizeBrainRelativePath(input: string) {
  const raw = input.trim().replaceAll('\\', '/').replace(/^\/+/, '')
  const withoutRoot = raw.startsWith('brain/') ? raw.slice('brain/'.length) : raw

  if (withoutRoot.split('/').includes('..')) {
    throw new BrainPathError('Path must stay inside the brain directory.')
  }

  const normalized = path.posix.normalize(withoutRoot)

  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized === '..' || path.posix.isAbsolute(normalized)) {
    throw new BrainPathError('Path must stay inside the brain directory.')
  }

  if (!normalized.endsWith('.md')) {
    throw new BrainPathError('Only Markdown .md files are allowed.')
  }

  if (normalized.split('/').some((part) => part.length === 0 || part === '..')) {
    throw new BrainPathError('Invalid brain file path.')
  }

  return normalized
}

export function resolveBrainFilePath(brainRoot: string, input: string) {
  const relativePath = normalizeBrainRelativePath(input)
  const absolutePath = path.resolve(brainRoot, relativePath)
  const relativeFromRoot = path.relative(brainRoot, absolutePath)

  if (relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot)) {
    throw new BrainPathError('Path escapes the brain directory.')
  }

  return {
    absolutePath,
    relativePath,
    appPath: `brain/${relativePath}`,
  }
}

export function safeProjectSlug(input: string) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

  if (!slug) {
    throw new BrainPathError('Project name must produce a valid slug.')
  }

  return slug
}
