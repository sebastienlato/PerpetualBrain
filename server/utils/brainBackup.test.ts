import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import JSZip from 'jszip'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  collectBackupEntries,
  createBrainBackupZip,
  importBrainBackupZip,
  inspectBrainBackupZip,
  isAllowedBackupFile,
  validateBackupEntryName,
} from './brainBackup'

let tempRoot = ''

beforeEach(async () => {
  tempRoot = await mkdtemp(path.join(os.tmpdir(), 'perpetual-brain-backup-'))
})

afterEach(async () => {
  await rm(tempRoot, { recursive: true, force: true })
})

async function writeZip(zipPath: string, entries: Record<string, string | Buffer>) {
  const zip = new JSZip()
  for (const [entryPath, content] of Object.entries(entries)) {
    zip.file(entryPath, content)
  }
  await writeFile(zipPath, await zip.generateAsync({ type: 'nodebuffer' }))
}

describe('backup file filtering', () => {
  it('includes brain text files and excludes git, temp, system, and binary files', async () => {
    await mkdir(path.join(tempRoot, 'projects', 'demo'), { recursive: true })
    await mkdir(path.join(tempRoot, '.git', 'objects'), { recursive: true })
    await writeFile(path.join(tempRoot, 'projects', 'demo', 'PROJECT.md'), '# Demo')
    await writeFile(path.join(tempRoot, '.gitignore'), '.DS_Store\n')
    await writeFile(path.join(tempRoot, 'metadata.json'), '{}')
    await writeFile(path.join(tempRoot, 'scratch.tmp'), 'temporary')
    await writeFile(path.join(tempRoot, '.DS_Store'), 'system')
    await writeFile(path.join(tempRoot, 'image.png'), Buffer.from([0, 1, 2]))
    await writeFile(path.join(tempRoot, '.git', 'config'), 'private')

    const collection = await collectBackupEntries(tempRoot)
    const archivePaths = collection.entries.map((entry) => entry.archivePath)

    expect(archivePaths).toEqual(['.gitignore', 'metadata.json', 'projects/demo/PROJECT.md'])
    expect(collection.skippedFiles).toEqual(['.DS_Store', 'image.png', 'scratch.tmp'])
  })

  it('allows only safe text backup file types', () => {
    expect(isAllowedBackupFile('README.md', 100)).toBe(true)
    expect(isAllowedBackupFile('.gitignore', 100)).toBe(true)
    expect(isAllowedBackupFile('notes.txt', 100)).toBe(true)
    expect(isAllowedBackupFile('metadata.json', 100)).toBe(true)
    expect(isAllowedBackupFile('.git/config', 100)).toBe(false)
    expect(isAllowedBackupFile('image.png', 100)).toBe(false)
  })
})

describe('backup zip validation', () => {
  it('rejects path traversal and absolute zip entries', () => {
    expect(validateBackupEntryName('projects/demo/PROJECT.md')).toBe('projects/demo/PROJECT.md')
    expect(validateBackupEntryName('../outside.md')).toBeUndefined()
    expect(validateBackupEntryName('/outside.md')).toBeUndefined()
    expect(validateBackupEntryName('C:/outside.md')).toBeUndefined()
    expect(validateBackupEntryName('projects/../../outside.md')).toBeUndefined()
  })

  it('separates supported, unsupported, and unsafe entries', async () => {
    const zipPath = path.join(tempRoot, 'backup.zip')
    await writeZip(zipPath, {
      'projects/demo/PROJECT.md': '# Demo',
      'metadata.json': '{}',
      'image.png': Buffer.from([0, 1, 2]),
      '../outside.md': 'unsafe',
      '.git/config': 'private',
    })

    const inspection = await inspectBrainBackupZip(zipPath)

    expect(inspection.validEntries.map((entry) => entry.archivePath)).toEqual(['metadata.json', 'projects/demo/PROJECT.md'])
    expect(inspection.unsupportedEntries).toEqual(['image.png'])
    expect(inspection.rejectedEntries).toContain('../outside.md')
    expect(inspection.rejectedEntries).toContain('.git/config')
  })
})

describe('backup export and import', () => {
  it('creates a zip that excludes git internals', async () => {
    await mkdir(path.join(tempRoot, 'brain', 'projects', 'demo'), { recursive: true })
    await mkdir(path.join(tempRoot, 'brain', '.git'), { recursive: true })
    await writeFile(path.join(tempRoot, 'brain', 'projects', 'demo', 'PROJECT.md'), '# Demo')
    await writeFile(path.join(tempRoot, 'brain', '.git', 'config'), 'private')

    const zipPath = path.join(tempRoot, 'export.zip')
    const summary = await createBrainBackupZip(path.join(tempRoot, 'brain'), zipPath)
    const inspection = await inspectBrainBackupZip(zipPath)

    expect(summary.exportedFiles).toBe(1)
    expect(inspection.validEntries.map((entry) => entry.archivePath)).toEqual(['projects/demo/PROJECT.md'])
  })

  it('imports supported files into a new destination without writing rejected entries outside it', async () => {
    const zipPath = path.join(tempRoot, 'backup.zip')
    const destination = path.join(tempRoot, 'imported')
    await writeZip(zipPath, {
      'projects/demo/PROJECT.md': '# Imported',
      'notes.txt': 'safe',
      '../outside.md': 'unsafe',
      'image.png': Buffer.from([0, 1, 2]),
    })

    const summary = await importBrainBackupZip(zipPath, destination)

    expect(summary.importedFiles).toBe(2)
    expect(summary.unsupportedEntries).toEqual(['image.png'])
    expect(summary.rejectedEntries).toEqual(['../outside.md'])
    expect(await readFile(path.join(destination, 'projects', 'demo', 'PROJECT.md'), 'utf8')).toBe('# Imported')
    await expect(readFile(path.join(tempRoot, 'outside.md'), 'utf8')).rejects.toThrow()
  })
})
