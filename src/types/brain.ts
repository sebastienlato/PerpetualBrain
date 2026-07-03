export type BrainFileKind = 'project' | 'global' | 'template'

export type DecisionStatus = 'active' | 'changed' | 'deprecated'

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

export interface BrainProject {
  id: string
  name: string
  path: string
  summary: string
  status: string
  techStack: string[]
  tags: string[]
  files: BrainFile[]
  updatedAt: string
}

export interface DecisionRecord {
  id: string
  projectId: string
  projectName: string
  date: string
  decision: string
  reason: string
  impact: string
  relatedFiles: string
  status: DecisionStatus
}

export interface PromptTemplate {
  id: string
  title: string
  body: string
  sourceFileId: string
}

export interface SearchResult {
  file: BrainFile
  score: number
  snippet: string
  matchType: 'title' | 'content' | 'tag' | 'path'
}

export interface ContextBundleOptions {
  projectId: string
  fileIds: string[]
  promptTemplateId?: string
  presetId?: string
  currentGoal: string
  activeTask: string
  issueOrProblem?: string
  acceptanceCriteria: string
  verificationCommands?: string
}
