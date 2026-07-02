import type { BrainFile, BrainProject, PromptTemplate } from '../types/brain'

export const fixtureFiles: BrainFile[] = [
  {
    id: 'project',
    path: 'brain/projects/shadowspire/PROJECT.md',
    name: 'PROJECT.md',
    title: 'ShadowSpire',
    kind: 'project',
    projectId: 'shadowspire',
    category: 'PROJECT',
    updatedAt: '2026-07-01T00:00:00.000Z',
    content: '# ShadowSpire\n\n## Summary\nA Phaser wizard platformer.\n\n## Tags\nphaser, platformer',
  },
  {
    id: 'architecture',
    path: 'brain/projects/shadowspire/ARCHITECTURE.md',
    name: 'ARCHITECTURE.md',
    title: 'Architecture',
    kind: 'project',
    projectId: 'shadowspire',
    category: 'ARCHITECTURE',
    updatedAt: '2026-07-01T00:00:00.000Z',
    content: '# Architecture\n\nPhaser owns simulation. React owns overlays.',
  },
  {
    id: 'standards',
    path: 'brain/global/CODING_STANDARDS.md',
    name: 'CODING_STANDARDS.md',
    title: 'Coding Standards',
    kind: 'global',
    category: 'CODING_STANDARDS',
    updatedAt: '2026-07-01T00:00:00.000Z',
    content: '# Coding Standards\n\nKeep changes scoped and typed.',
  },
]

export const fixtureProjects: BrainProject[] = [
  {
    id: 'shadowspire',
    name: 'ShadowSpire',
    path: 'brain/projects/shadowspire',
    summary: 'A Phaser wizard platformer.',
    status: 'Prototype',
    techStack: ['Vite', 'TypeScript', 'Phaser'],
    tags: ['phaser', 'platformer'],
    files: fixtureFiles.filter((file) => file.projectId === 'shadowspire'),
    updatedAt: '2026-07-01T00:00:00.000Z',
  },
]

export const fixturePrompts: PromptTemplate[] = [
  {
    id: 'phase',
    title: 'Phase Implementation',
    body: 'Implement this phase only and verify it.',
    sourceFileId: 'prompts',
  },
]
