import { createContext } from 'react'
import type { CreateBrainFileInput, CreateProjectInput, CreateProjectResult } from '../storage/BrainStorage'
import type { BrainFile } from '../types/brain'
import type { buildProjects } from '../utils/brain'

export type StorageMode = 'api' | 'localStorage'

export interface BrainContextValue {
  files: BrainFile[]
  loading: boolean
  error?: string
  storageMode: StorageMode
  storageMessage?: string
  projects: ReturnType<typeof buildProjects>
  saveFile(file: BrainFile): Promise<BrainFile>
  createFile(input: CreateBrainFileInput): Promise<BrainFile>
  createProject(input: CreateProjectInput): Promise<CreateProjectResult>
  deleteFile(file: BrainFile): Promise<void>
  reloadFromSource(): Promise<BrainFile[]>
  resetToSeed(): Promise<void>
}

export const BrainContext = createContext<BrainContextValue | undefined>(undefined)
