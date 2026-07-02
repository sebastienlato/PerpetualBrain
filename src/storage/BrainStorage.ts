import type { BrainFile } from '../types/brain'
import { titleFromMarkdown } from '../utils/markdown'
import { createProjectFallbackFiles, safeProjectSlug } from '../utils/projectTemplates'

export interface CreateBrainFileInput {
  path: string
  title: string
  kind: BrainFile['kind']
  category: string
  content: string
  projectId?: string
}

export interface CreateProjectInput {
  name: string
  slug?: string
}

export interface CreateProjectResult {
  slug: string
  files: BrainFile[]
}

export interface BrainStorage {
  listFiles(): Promise<BrainFile[]>
  getFile(id: string): Promise<BrainFile | undefined>
  saveFile(file: BrainFile): Promise<BrainFile>
  createFile(input: CreateBrainFileInput): Promise<BrainFile>
  createProject(input: CreateProjectInput): Promise<CreateProjectResult>
  deleteFile(file: BrainFile): Promise<void>
  resetToSeed(): Promise<BrainFile[]>
}

export class LocalStorageBrainStorage implements BrainStorage {
  private readonly key = 'perpetual-brain.files.v1'
  private readonly seedFiles: BrainFile[]

  constructor(seedFiles: BrainFile[]) {
    this.seedFiles = seedFiles
  }

  async listFiles() {
    return this.read()
  }

  async getFile(id: string) {
    return this.read().find((file) => file.id === id)
  }

  async saveFile(file: BrainFile) {
    const files = this.read()
    const nextFile = { ...file, updatedAt: new Date().toISOString() }
    const nextFiles = files.map((current) => (current.id === file.id ? nextFile : current))
    this.write(nextFiles)
    return nextFile
  }

  async createFile(input: CreateBrainFileInput) {
    const files = this.read()
    const id = input.path.replace(/^brain\//, '').replace(/\.md$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    const file: BrainFile = {
      id,
      name: input.path.split('/').at(-1) ?? `${input.title}.md`,
      pinned: false,
      updatedAt: new Date().toISOString(),
      ...input,
    }
    this.write([...files.filter((current) => current.id !== id), file].sort((a, b) => a.path.localeCompare(b.path)))
    return file
  }

  async createProject(input: CreateProjectInput) {
    const slug = safeProjectSlug(input.slug || input.name)
    if (!slug) {
      throw new Error('Project name must produce a valid slug.')
    }

    const templates = createProjectFallbackFiles(input.name.trim(), slug)
    const createdFiles = Object.entries(templates).map(([name, content]) => this.toBrainFile(`brain/projects/${slug}/${name}`, content))
    const files = this.read()
    this.write([...files.filter((file) => file.projectId !== slug), ...createdFiles].sort((a, b) => a.path.localeCompare(b.path)))

    return {
      slug,
      files: createdFiles,
    }
  }

  async deleteFile(file: BrainFile) {
    this.write(this.read().filter((current) => current.id !== file.id))
  }

  async resetToSeed() {
    this.write(this.seedFiles)
    return this.seedFiles
  }

  private toBrainFile(filePath: string, content: string): BrainFile {
    const normalized = filePath.replace(/^\/+/, '')
    const pathParts = normalized.replace(/^brain\//, '').split('/')
    const name = pathParts.at(-1) ?? 'BRAIN.md'
    const kind = pathParts[0] === 'projects' ? 'project' : pathParts[0] === 'global' ? 'global' : 'template'

    return {
      id: normalized.replace(/^brain\//, '').replace(/\.md$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
      path: normalized,
      name,
      title: titleFromMarkdown(content) || name.replace(/\.md$/, ''),
      kind,
      projectId: kind === 'project' ? pathParts[1] : undefined,
      category: name.replace(/\.md$/, ''),
      content,
      updatedAt: new Date().toISOString(),
      pinned: normalized.endsWith('/global/PROMPT_LIBRARY.md') || normalized.includes('CODEX_'),
    }
  }

  private read() {
    const stored = window.localStorage.getItem(this.key)
    if (!stored) {
      this.write(this.seedFiles)
      return this.seedFiles
    }

    try {
      const parsed = JSON.parse(stored) as BrainFile[]
      return parsed
    } catch {
      this.write(this.seedFiles)
      return this.seedFiles
    }
  }

  private write(files: BrainFile[]) {
    window.localStorage.setItem(this.key, JSON.stringify(files))
  }
}
