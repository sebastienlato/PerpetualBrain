import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { BrainFile, BrainFileKind } from '../types/brain'
import { createProjectTemplates } from '../templates/projectTemplates.js'
import { BrainPathError, resolveBrainFilePath, safeProjectSlug } from '../utils/brainPath.js'
import { titleFromMarkdown } from '../utils/markdown.js'

export interface CreateBrainFileInput {
  path: string
  content: string
}

export interface CreateProjectInput {
  name: string
  slug?: string
}

export class FileSystemBrainStorage {
  private readonly brainRoot: string

  constructor(brainRoot: string) {
    this.brainRoot = brainRoot
  }

  async listFiles() {
    await mkdir(this.brainRoot, { recursive: true })
    const files = await this.walk(this.brainRoot)
    return files.sort((a, b) => a.path.localeCompare(b.path))
  }

  async getFile(inputPath: string) {
    const { absolutePath } = resolveBrainFilePath(this.brainRoot, inputPath)
    return this.readBrainFile(absolutePath)
  }

  async saveFile(inputPath: string, content: string) {
    const { absolutePath } = resolveBrainFilePath(this.brainRoot, inputPath)
    await this.assertTextMarkdown(content)
    await mkdir(path.dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, content, 'utf8')
    return this.readBrainFile(absolutePath)
  }

  async createFile(input: CreateBrainFileInput) {
    const { absolutePath } = resolveBrainFilePath(this.brainRoot, input.path)
    await this.assertTextMarkdown(input.content)
    await mkdir(path.dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, input.content, { encoding: 'utf8', flag: 'wx' })
    return this.readBrainFile(absolutePath)
  }

  async deleteFile(inputPath: string) {
    const { absolutePath } = resolveBrainFilePath(this.brainRoot, inputPath)
    await rm(absolutePath)
  }

  async createProject(input: CreateProjectInput) {
    const slug = safeProjectSlug(input.slug || input.name)
    const projectsRoot = path.resolve(this.brainRoot, 'projects')
    const projectRoot = path.resolve(this.brainRoot, 'projects', slug)
    const relativeFromBrain = path.relative(this.brainRoot, projectRoot)

    if (relativeFromBrain.startsWith('..') || path.isAbsolute(relativeFromBrain)) {
      throw new BrainPathError('Project path escapes the brain directory.')
    }

    await mkdir(projectsRoot, { recursive: true })
    await mkdir(projectRoot, { recursive: false })
    const templates = createProjectTemplates(input.name.trim(), slug)
    const createdFiles: BrainFile[] = []

    for (const [fileName, content] of Object.entries(templates)) {
      const filePath = path.join(projectRoot, fileName)
      await writeFile(filePath, content, { encoding: 'utf8', flag: 'wx' })
      createdFiles.push(await this.readBrainFile(filePath))
    }

    return {
      slug,
      files: createdFiles.sort((a, b) => a.path.localeCompare(b.path)),
    }
  }

  private async walk(directory: string): Promise<BrainFile[]> {
    const entries = await readdir(directory, { withFileTypes: true })
    const nested = await Promise.all(entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return this.walk(absolutePath)
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [await this.readBrainFile(absolutePath)]
      }

      return []
    }))

    return nested.flat()
  }

  private async readBrainFile(absolutePath: string): Promise<BrainFile> {
    const relativePath = path.relative(this.brainRoot, absolutePath).split(path.sep).join('/')
    const content = await readFile(absolutePath, 'utf8')
    await this.assertTextMarkdown(content)
    const fileStats = await stat(absolutePath)
    const pathParts = relativePath.split('/')
    const name = path.basename(relativePath)
    const kind = this.kindFromParts(pathParts)

    return {
      id: relativePath.replace(/\.md$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
      path: `brain/${relativePath}`,
      name,
      title: titleFromMarkdown(content) || name.replace(/\.md$/, ''),
      kind,
      projectId: kind === 'project' ? pathParts[1] : undefined,
      category: name.replace(/\.md$/, ''),
      content,
      updatedAt: fileStats.mtime.toISOString(),
      pinned: relativePath.endsWith('global/PROMPT_LIBRARY.md') || relativePath.includes('CODEX_'),
    }
  }

  private kindFromParts(parts: string[]): BrainFileKind {
    if (parts[0] === 'projects') {
      return 'project'
    }
    if (parts[0] === 'global') {
      return 'global'
    }
    return 'template'
  }

  private async assertTextMarkdown(content: string) {
    if (content.includes('\u0000')) {
      throw new BrainPathError('Binary file content is not allowed.')
    }
  }
}
