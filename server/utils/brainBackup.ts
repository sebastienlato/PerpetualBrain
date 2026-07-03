import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'

const maxBackupFileBytes = 5 * 1024 * 1024
const supportedImportExtensions = new Set(['.md', '.txt', '.json'])
const excludedDirectoryNames = new Set(['.git', 'node_modules'])
const excludedFileNames = new Set(['.DS_Store'])
const excludedExtensions = new Set(['.tmp', '.temp', '.swp'])

export interface BackupEntry {
  absolutePath: string
  archivePath: string
  size: number
}

export interface BackupFileCollection {
  entries: BackupEntry[]
  skippedFiles: string[]
}

export interface BrainBackupSummary {
  outputPath: string
  exportedFiles: number
  skippedFiles: string[]
}

export interface ImportableBackupEntry {
  archivePath: string
  size: number
}

export interface BrainBackupInspection {
  zipPath: string
  validEntries: ImportableBackupEntry[]
  unsupportedEntries: string[]
  rejectedEntries: string[]
}

export interface BrainImportSummary {
  destinationRoot: string
  importedFiles: number
  unsupportedEntries: string[]
  rejectedEntries: string[]
}

function toArchivePath(relativePath: string) {
  return relativePath.split(path.sep).join('/')
}

function hasExcludedPathSegment(archivePath: string) {
  return archivePath.split('/').some((segment) => excludedDirectoryNames.has(segment))
}

function isTempFile(fileName: string) {
  return excludedExtensions.has(path.posix.extname(fileName).toLowerCase()) || fileName.endsWith('~')
}

export function isAllowedBackupFile(archivePath: string, size: number) {
  const fileName = path.posix.basename(archivePath)
  const extension = path.posix.extname(fileName).toLowerCase()

  if (size > maxBackupFileBytes) {
    return false
  }

  if (excludedFileNames.has(fileName) || isTempFile(fileName) || hasExcludedPathSegment(archivePath)) {
    return false
  }

  return fileName === '.gitignore' || supportedImportExtensions.has(extension)
}

export function validateBackupEntryName(entryName: string) {
  const archivePath = entryName.replaceAll('\\', '/')

  if (!archivePath || archivePath.startsWith('/') || archivePath.includes('\0')) {
    return undefined
  }

  if (/^[a-zA-Z]:\//.test(archivePath)) {
    return undefined
  }

  const normalized = path.posix.normalize(archivePath)
  if (normalized === '.' || normalized.startsWith('../') || normalized === '..' || path.posix.isAbsolute(normalized)) {
    return undefined
  }

  if (hasExcludedPathSegment(normalized)) {
    return undefined
  }

  return normalized
}

function originalZipEntryName(entry: JSZip.JSZipObject, fallback: string) {
  const unsafeOriginalName = (entry as JSZip.JSZipObject & { unsafeOriginalName?: unknown }).unsafeOriginalName
  return typeof unsafeOriginalName === 'string' ? unsafeOriginalName : fallback
}

export async function collectBackupEntries(brainRoot: string): Promise<BackupFileCollection> {
  const root = path.resolve(brainRoot)
  const entries: BackupEntry[] = []
  const skippedFiles: string[] = []

  async function walk(directory: string) {
    const dirents = await readdir(directory, { withFileTypes: true })

    for (const dirent of dirents) {
      const absolutePath = path.join(directory, dirent.name)
      const relativePath = path.relative(root, absolutePath)
      const archivePath = toArchivePath(relativePath)

      if (dirent.isDirectory()) {
        if (excludedDirectoryNames.has(dirent.name)) {
          continue
        }
        await walk(absolutePath)
        continue
      }

      if (!dirent.isFile()) {
        skippedFiles.push(archivePath)
        continue
      }

      const fileStat = await stat(absolutePath)
      if (isAllowedBackupFile(archivePath, fileStat.size)) {
        entries.push({ absolutePath, archivePath, size: fileStat.size })
      } else {
        skippedFiles.push(archivePath)
      }
    }
  }

  await walk(root)
  entries.sort((a, b) => a.archivePath.localeCompare(b.archivePath))
  skippedFiles.sort()
  return { entries, skippedFiles }
}

export async function createBrainBackupZip(brainRoot: string, outputPath: string): Promise<BrainBackupSummary> {
  const { entries, skippedFiles } = await collectBackupEntries(brainRoot)
  const zip = new JSZip()

  for (const entry of entries) {
    zip.file(entry.archivePath, await readFile(entry.absolutePath))
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, buffer)

  return {
    outputPath,
    exportedFiles: entries.length,
    skippedFiles,
  }
}

export async function inspectBrainBackupZip(zipPath: string): Promise<BrainBackupInspection> {
  const zip = await JSZip.loadAsync(await readFile(zipPath))
  const validEntries: ImportableBackupEntry[] = []
  const unsupportedEntries: string[] = []
  const rejectedEntries: string[] = []

  for (const [entryName, entry] of Object.entries(zip.files)) {
    if (entry.dir) {
      continue
    }

    const originalName = originalZipEntryName(entry, entryName)
    const normalizedOriginalName = validateBackupEntryName(originalName)
    if (!normalizedOriginalName) {
      rejectedEntries.push(originalName)
      continue
    }

    const normalized = validateBackupEntryName(entryName)
    if (!normalized) {
      rejectedEntries.push(entryName)
      continue
    }

    const size = await entry.async('nodebuffer').then((buffer) => buffer.byteLength)
    if (isAllowedBackupFile(normalized, size)) {
      validEntries.push({ archivePath: normalized, size })
    } else {
      unsupportedEntries.push(normalized)
    }
  }

  validEntries.sort((a, b) => a.archivePath.localeCompare(b.archivePath))
  unsupportedEntries.sort()
  rejectedEntries.sort()
  return { zipPath, validEntries, unsupportedEntries, rejectedEntries }
}

export async function importBrainBackupZip(zipPath: string, destinationRoot: string): Promise<BrainImportSummary> {
  const destination = path.resolve(destinationRoot)
  const inspection = await inspectBrainBackupZip(zipPath)

  if (inspection.validEntries.length === 0) {
    throw new Error('Backup ZIP does not contain supported brain files.')
  }

  const zip = await JSZip.loadAsync(await readFile(zipPath))
  await mkdir(destination, { recursive: false })

  for (const entry of inspection.validEntries) {
    const zipEntry = zip.file(entry.archivePath)
    if (!zipEntry) {
      continue
    }

    const outputPath = path.resolve(destination, entry.archivePath)
    const relativeToDestination = path.relative(destination, outputPath)
    if (relativeToDestination.startsWith('..') || path.isAbsolute(relativeToDestination)) {
      throw new Error(`Unsafe backup path: ${entry.archivePath}`)
    }

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, await zipEntry.async('nodebuffer'), { flag: 'wx' })
  }

  return {
    destinationRoot: destination,
    importedFiles: inspection.validEntries.length,
    unsupportedEntries: inspection.unsupportedEntries,
    rejectedEntries: inspection.rejectedEntries,
  }
}

export function backupTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `-${pad(date.getHours())}${pad(date.getMinutes())}`
}
