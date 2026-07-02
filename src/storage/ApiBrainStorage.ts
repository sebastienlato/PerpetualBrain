import type { BrainFile } from '../types/brain'
import type { BrainStorage, CreateBrainFileInput, CreateProjectInput, CreateProjectResult } from './BrainStorage'

interface TreeResponse {
  files: BrainFile[]
}

interface FileResponse {
  file: BrainFile
}

export class ApiBrainStorage implements BrainStorage {
  private readonly baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  async health() {
    const response = await fetch(`${this.baseUrl}/api/health`)
    if (!response.ok) {
      throw new Error('File persistence API is unavailable.')
    }
    return response.json() as Promise<{ ok: boolean; mode: string; brainRoot: string; brainRootSource?: string; brainRootMessage?: string }>
  }

  async listFiles() {
    const response = await this.request('/api/brain/tree')
    const data = await response.json() as TreeResponse
    return data.files
  }

  async getFile(id: string) {
    return (await this.listFiles()).find((file) => file.id === id)
  }

  async saveFile(file: BrainFile) {
    const response = await this.request('/api/brain/file', {
      method: 'PUT',
      body: JSON.stringify({ path: file.path, content: file.content }),
    })
    const data = await response.json() as FileResponse
    return data.file
  }

  async createFile(input: CreateBrainFileInput) {
    const response = await this.request('/api/brain/file', {
      method: 'POST',
      body: JSON.stringify({ path: input.path, content: input.content }),
    })
    const data = await response.json() as FileResponse
    return data.file
  }

  async createProject(input: CreateProjectInput) {
    const response = await this.request('/api/brain/project', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return response.json() as Promise<CreateProjectResult>
  }

  async deleteFile(file: BrainFile) {
    await this.request(`/api/brain/file?path=${encodeURIComponent(file.path)}`, {
      method: 'DELETE',
    })
  }

  async resetToSeed() {
    return this.listFiles()
  }

  private async request(path: string, init?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })

    if (!response.ok) {
      const message = await this.errorMessage(response)
      throw new Error(message)
    }

    return response
  }

  private async errorMessage(response: Response) {
    try {
      const data = await response.json() as { error?: string }
      return data.error || `Request failed with ${response.status}.`
    } catch {
      return `Request failed with ${response.status}.`
    }
  }
}
