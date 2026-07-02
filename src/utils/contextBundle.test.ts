import { describe, expect, it } from 'vitest'
import { fixtureFiles, fixtureProjects, fixturePrompts } from '../test/fixtures'
import { generateContextBundle } from './contextBundle'

describe('generateContextBundle', () => {
  it('composes a structured Codex bundle from selected files and prompt template', () => {
    const bundle = generateContextBundle(
      {
        projectId: 'shadowspire',
        fileIds: ['project', 'architecture', 'standards'],
        promptTemplateId: 'phase',
        currentGoal: 'Add the next level review route.',
        activeTask: 'Implement and verify the route.',
        acceptanceCriteria: 'Build passes.',
      },
      fixtureFiles,
      fixtureProjects,
      fixturePrompts,
    )

    expect(bundle).toContain('# Project Context')
    expect(bundle).toContain('ShadowSpire')
    expect(bundle).toContain('# Current Goal')
    expect(bundle).toContain('Add the next level review route.')
    expect(bundle).toContain('# Prompt Template')
    expect(bundle).toContain('Phase Implementation')
  })
})
