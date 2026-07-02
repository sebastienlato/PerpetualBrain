export type BrainFileKind = 'project' | 'global' | 'template'

export interface BrainFile {
  id: string
  path: string
  name: string
  title: string
  kind: BrainFileKind
  projectId?: string
  category: string
  content: string
  updatedAt: string
  pinned?: boolean
}
