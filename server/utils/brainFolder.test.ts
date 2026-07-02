import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearBrainFolderSettings,
  initializeBrainFolder,
  inspectBrainFolder,
  loadBrainFolderSettings,
  resolveConfiguredBrainRoot,
  saveBrainFolderSettings,
} from './brainFolder'

let tempRoot = ''

beforeEach(async () => {
  tempRoot = await mkdtemp(path.join(os.tmpdir(), 'perpetual-brain-folder-'))
})

afterEach(async () => {
  await rm(tempRoot, { recursive: true, force: true })
})

describe('brain folder settings', () => {
  it('loads and clears a configured brain root', async () => {
    const settingsPath = path.join(tempRoot, 'settings.json')
    const brainRoot = path.join(tempRoot, 'custom-brain')

    await saveBrainFolderSettings(settingsPath, { brainRoot })
    expect(await loadBrainFolderSettings(settingsPath)).toEqual({ brainRoot })

    await clearBrainFolderSettings(settingsPath)
    expect(await loadBrainFolderSettings(settingsPath)).toEqual({})
  })

  it('falls back to the default root when configured path is missing', async () => {
    const settingsPath = path.join(tempRoot, 'settings.json')
    const defaultRoot = path.join(tempRoot, 'default-brain')
    const seedRoot = path.join(tempRoot, 'seed')
    await mkdir(seedRoot, { recursive: true })
    await writeFile(path.join(seedRoot, 'README.md'), '# Seed')
    await saveBrainFolderSettings(settingsPath, { brainRoot: path.join(tempRoot, 'missing') })

    const resolved = await resolveConfiguredBrainRoot(settingsPath, defaultRoot, seedRoot)

    expect(resolved.source).toBe('default')
    expect(resolved.brainRoot).toBe(defaultRoot)
    expect(await readFile(path.join(defaultRoot, 'README.md'), 'utf8')).toBe('# Seed')
  })
})

describe('brain folder initialization', () => {
  it('classifies empty, brain-like, and mixed folders', async () => {
    const empty = path.join(tempRoot, 'empty')
    const brain = path.join(tempRoot, 'brain')
    const mixed = path.join(tempRoot, 'mixed')
    await mkdir(empty)
    await mkdir(path.join(brain, 'projects'), { recursive: true })
    await mkdir(mixed)
    await writeFile(path.join(mixed, 'notes.txt'), 'not a brain')

    expect(await inspectBrainFolder(empty)).toBe('empty')
    expect(await inspectBrainFolder(brain)).toBe('brain')
    expect(await inspectBrainFolder(mixed)).toBe('mixed')
  })

  it('initializes from seed files without overwriting existing files', async () => {
    const seed = path.join(tempRoot, 'seed')
    const target = path.join(tempRoot, 'target')
    await mkdir(path.join(seed, 'projects', 'demo'), { recursive: true })
    await writeFile(path.join(seed, 'projects', 'demo', 'PROJECT.md'), '# Demo')
    await mkdir(path.join(target, 'projects', 'demo'), { recursive: true })
    await writeFile(path.join(target, 'projects', 'demo', 'PROJECT.md'), '# Existing')

    await initializeBrainFolder(target, seed)

    expect(await readFile(path.join(target, 'projects', 'demo', 'PROJECT.md'), 'utf8')).toBe('# Existing')
  })
})
