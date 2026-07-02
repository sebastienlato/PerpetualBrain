import { createContext } from 'react'
import type { BrainFile } from '../types/brain'
import type { buildProjects } from '../utils/brain'

export interface BrainContextValue {
  files: BrainFile[]
  loading: boolean
  error?: string
  projects: ReturnType<typeof buildProjects>
  saveFile(file: BrainFile): Promise<void>
  createFile(input: Pick<BrainFile, 'path' | 'title' | 'kind' | 'category' | 'content' | 'projectId'>): Promise<BrainFile>
  resetToSeed(): Promise<void>
}

export const BrainContext = createContext<BrainContextValue | undefined>(undefined)
