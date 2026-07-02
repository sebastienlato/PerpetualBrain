import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

export interface BrainFolderSettings {
  brainRoot?: string
}

export type BrainFolderState = 'missing' | 'empty' | 'brain' | 'mixed'

export interface ResolvedBrainRoot {
  brainRoot: string
  source: 'configured' | 'default'
  message?: string
}

export async function pathExists(targetPath: string) {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

export async function isDirectory(targetPath: string) {
  try {
    return (await stat(targetPath)).isDirectory()
  } catch {
    return false
  }
}

export async function loadBrainFolderSettings(settingsPath: string): Promise<BrainFolderSettings> {
  try {
    const raw = await readFile(settingsPath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || !('brainRoot' in parsed)) {
      return {}
    }

    const brainRoot = (parsed as { brainRoot?: unknown }).brainRoot
    return typeof brainRoot === 'string' && brainRoot.trim() ? { brainRoot: path.resolve(brainRoot) } : {}
  } catch {
    return {}
  }
}

export async function saveBrainFolderSettings(settingsPath: string, settings: BrainFolderSettings) {
  await mkdir(path.dirname(settingsPath), { recursive: true })
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8')
}

export async function clearBrainFolderSettings(settingsPath: string) {
  await rm(settingsPath, { force: true })
}

export async function inspectBrainFolder(folderPath: string): Promise<BrainFolderState> {
  if (!(await isDirectory(folderPath))) {
    return 'missing'
  }

  const entries = await readdir(folderPath, { withFileTypes: true })
  if (entries.length === 0) {
    return 'empty'
  }

  const hasBrainDirectory = entries.some((entry) => entry.isDirectory() && ['projects', 'global', 'templates'].includes(entry.name))
  const hasMarkdown = entries.some((entry) => entry.isFile() && entry.name.endsWith('.md'))
  return hasBrainDirectory || hasMarkdown ? 'brain' : 'mixed'
}

export async function initializeBrainFolder(targetRoot: string, seedRoot: string) {
  await mkdir(targetRoot, { recursive: true })
  if (await pathExists(seedRoot)) {
    await cp(seedRoot, targetRoot, { recursive: true, errorOnExist: false, force: false })
  }
}

export async function ensureDefaultBrainRoot(defaultRoot: string, seedRoot: string) {
  if (!(await pathExists(defaultRoot))) {
    await initializeBrainFolder(defaultRoot, seedRoot)
  }
  await mkdir(defaultRoot, { recursive: true })
  return defaultRoot
}

export async function resolveConfiguredBrainRoot(settingsPath: string, defaultRoot: string, seedRoot: string): Promise<ResolvedBrainRoot> {
  const settings = await loadBrainFolderSettings(settingsPath)
  if (settings.brainRoot && await isDirectory(settings.brainRoot)) {
    return {
      brainRoot: settings.brainRoot,
      source: 'configured',
    }
  }

  const brainRoot = await ensureDefaultBrainRoot(defaultRoot, seedRoot)
  return {
    brainRoot,
    source: 'default',
    message: settings.brainRoot ? `Saved brain folder was unavailable: ${settings.brainRoot}` : undefined,
  }
}
