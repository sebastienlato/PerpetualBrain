import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { normalizeBrainRelativePath, resolveBrainFilePath, safeProjectSlug } from './brainPath'

describe('brain path safety', () => {
  it('normalizes brain-root paths', () => {
    expect(normalizeBrainRelativePath('brain/projects/app/PROJECT.md')).toBe('projects/app/PROJECT.md')
    expect(normalizeBrainRelativePath('/projects/app/PROJECT.md')).toBe('projects/app/PROJECT.md')
  })

  it('rejects traversal and non-markdown files', () => {
    expect(() => normalizeBrainRelativePath('../secret.md')).toThrow()
    expect(() => normalizeBrainRelativePath('projects/app/../../secret.md')).toThrow()
    expect(() => normalizeBrainRelativePath('projects/app/avatar.png')).toThrow()
  })

  it('resolves only inside the brain root', () => {
    const brainRoot = path.resolve('/tmp/perpetual-brain/brain')
    const resolved = resolveBrainFilePath(brainRoot, 'brain/projects/app/PROJECT.md')
    expect(resolved.absolutePath).toBe(path.join(brainRoot, 'projects/app/PROJECT.md'))
    expect(() => resolveBrainFilePath(brainRoot, 'brain/../package.json')).toThrow()
  })

  it('creates safe project slugs', () => {
    expect(safeProjectSlug('My New App!')).toBe('my-new-app')
    expect(() => safeProjectSlug('...')).toThrow()
  })
})
