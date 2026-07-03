import { describe, expect, it } from 'vitest'
import { checkProjectIntakeCreation, defaultProjectIntakeAnswers, generateProjectIntakeFiles, safeIntakeSlug, type ProjectIntakeAnswers } from './projectIntake'

function answers(overrides: Partial<ProjectIntakeAnswers> = {}): ProjectIntakeAnswers {
  return {
    ...defaultProjectIntakeAnswers(),
    projectName: 'Shadow Forge',
    shortDescription: 'A compact fantasy action project.',
    ...overrides,
  }
}

describe('safeIntakeSlug', () => {
  it('creates stable project slugs', () => {
    expect(safeIntakeSlug(' Shadow Forge! ')).toBe('shadow-forge')
    expect(safeIntakeSlug('Client "Alpha" / 2026')).toBe('client-alpha-2026')
    expect(safeIntakeSlug('---')).toBe('')
  })
})

describe('generateProjectIntakeFiles', () => {
  it('generates the required project brain files', () => {
    const files = generateProjectIntakeFiles(answers(), new Date('2026-07-02T12:00:00.000Z'))

    expect(files.map((file) => file.fileName)).toEqual([
      'PROJECT.md',
      'ARCHITECTURE.md',
      'DESIGN_RULES.md',
      'CODEX_CONTEXT.md',
      'DECISIONS.md',
      'TODO.md',
      'LESSONS.md',
      'CONTEXT_HISTORY.md',
      'KICKOFF_PROMPT.md',
    ])
    expect(files.find((file) => file.fileName === 'PROJECT.md')?.content).toContain('A compact fantasy action project.')
    expect(files.find((file) => file.fileName === 'KICKOFF_PROMPT.md')?.content).toContain('## Git Commit Instructions')
  })

  it('adds Phaser-specific architecture, asset, and QA guidance', () => {
    const files = generateProjectIntakeFiles(answers({
      projectType: 'Phaser game',
      projectName: 'Glyph Runner',
    }))
    const allContent = files.map((file) => file.content).join('\n\n')

    expect(allContent).toContain('Phaser scenes')
    expect(allContent).toContain('review routes')
    expect(allContent).toContain('Do not accept placeholder assets')
    expect(allContent).toContain('Browser screenshot QA')
  })

  it('adds Electron-specific secure runtime guidance', () => {
    const files = generateProjectIntakeFiles(answers({
      projectType: 'Electron app',
      projectName: 'Desk Vault',
    }))
    const allContent = files.map((file) => file.content).join('\n\n')

    expect(allContent).toContain('contextIsolation true')
    expect(allContent).toContain('nodeIntegration false')
    expect(allContent).toContain('narrow safe preload methods')
    expect(allContent).toContain('npm run electron:compile')
  })

  it('formats empty optional fields with useful defaults', () => {
    const files = generateProjectIntakeFiles({
      ...defaultProjectIntakeAnswers(),
      projectName: 'Blank Slate',
      projectType: 'Other',
      shortDescription: '',
      techStack: '',
      visualDirection: '',
      mainGoals: '',
      mvpFeatures: '',
      nonGoals: '',
      constraints: '',
      qaCommands: '',
      codexPreferences: '',
      assetRules: '',
      gitReleaseNotes: '',
    })
    const kickoff = files.find((file) => file.fileName === 'KICKOFF_PROMPT.md')?.content ?? ''

    expect(kickoff).toContain('A project of type Other created from the PerpetualBrain intake wizard.')
    expect(kickoff).toContain('Define the first useful workflow.')
    expect(kickoff).not.toContain('undefined')
  })
})

describe('checkProjectIntakeCreation', () => {
  it('blocks empty names and existing project slugs', () => {
    expect(checkProjectIntakeCreation('', [])).toMatchObject({
      canCreate: false,
      slug: '',
      reason: 'Project name is required.',
    })

    expect(checkProjectIntakeCreation('Shadow Forge', ['shadow-forge'])).toMatchObject({
      canCreate: false,
      slug: 'shadow-forge',
    })
  })

  it('allows a new project slug', () => {
    expect(checkProjectIntakeCreation('New Build', ['shadow-forge'])).toEqual({
      canCreate: true,
      slug: 'new-build',
    })
  })
})
