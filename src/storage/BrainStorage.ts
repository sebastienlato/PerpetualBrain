import type { BrainFile } from '../types/brain'

export interface BrainStorage {
  listFiles(): Promise<BrainFile[]>
  getFile(id: string): Promise<BrainFile | undefined>
  saveFile(file: BrainFile): Promise<BrainFile>
  createFile(input: Pick<BrainFile, 'path' | 'title' | 'kind' | 'category' | 'content' | 'projectId'>): Promise<BrainFile>
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

  async createFile(input: Pick<BrainFile, 'path' | 'title' | 'kind' | 'category' | 'content' | 'projectId'>) {
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

  async resetToSeed() {
    this.write(this.seedFiles)
    return this.seedFiles
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

export class FileSystemBrainStorage implements BrainStorage {
  async listFiles(): Promise<BrainFile[]> {
    throw new Error('FileSystemBrainStorage is reserved for the Electron or Node-backed adapter.')
  }

  async getFile(): Promise<BrainFile | undefined> {
    throw new Error('FileSystemBrainStorage is reserved for the Electron or Node-backed adapter.')
  }

  async saveFile(): Promise<BrainFile> {
    throw new Error('FileSystemBrainStorage is reserved for the Electron or Node-backed adapter.')
  }

  async createFile(): Promise<BrainFile> {
    throw new Error('FileSystemBrainStorage is reserved for the Electron or Node-backed adapter.')
  }

  async resetToSeed(): Promise<BrainFile[]> {
    throw new Error('FileSystemBrainStorage is reserved for the Electron or Node-backed adapter.')
  }
}
