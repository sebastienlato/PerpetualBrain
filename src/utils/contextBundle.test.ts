import { describe, expect, it } from 'vitest'
import { fixtureFiles, fixtureProjects, fixturePrompts } from '../test/fixtures'
import { appendContextHistory, buildContextHistoryEntry, contextPresets, generateContextBundle, getContextPreset } from './contextBundle'

describe('generateContextBundle', () => {
  it('composes a structured Codex bundle from selected files and prompt template', () => {
    const bundle = generateContextBundle(
      {
        projectId: 'shadowspire',
        fileIds: ['project', 'architecture', 'standards'],
        promptTemplateId: 'phase',
        presetId: 'continue-existing-project',
        currentGoal: 'Add the next level review route.',
        activeTask: 'Implement and verify the route.',
        acceptanceCriteria: 'Build passes.',
        verificationCommands: 'npm run build',
      },
      fixtureFiles,
      fixtureProjects,
      fixturePrompts,
    )

    expect(bundle).toContain('# Project Context')
    expect(bundle).toContain('ShadowSpire')
    expect(bundle).toContain('# Current Goal')
    expect(bundle).toContain('Add the next level review route.')
    expect(bundle).toContain('# Verification Commands')
    expect(bundle).toContain('npm run build')
    expect(bundle).toContain('# Prompt Template')
    expect(bundle).toContain('Phase Implementation')
  })

  it('generates required bug-fix sections and handles empty optional fields safely', () => {
    const bundle = generateContextBundle(
      {
        projectId: 'shadowspire',
        fileIds: ['project', 'todo'],
        presetId: 'bug-fix',
        currentGoal: 'Fix restart jump state.',
        activeTask: '',
        issueOrProblem: '',
        acceptanceCriteria: '',
        verificationCommands: '',
      },
      fixtureFiles,
      fixtureProjects,
      fixturePrompts,
    )

    expect(bundle).toContain('# Problem Summary')
    expect(bundle).toContain('# Expected Behavior')
    expect(bundle).toContain('# Current Behavior')
    expect(bundle).toContain('# Reproduction Steps')
    expect(bundle).toContain('Fix restart jump state.')
    expect(bundle).toContain('npm run lint')
    expect(bundle).not.toContain('undefined')
  })

  it('generates distinct visual polish and release prep outputs', () => {
    const visualBundle = generateContextBundle(
      {
        projectId: 'shadowspire',
        fileIds: ['project', 'lessons', 'preset-guidance'],
        presetId: 'visual-polish-pass',
        currentGoal: 'Polish the HUD.',
        activeTask: 'Improve hierarchy and mobile fit.',
        issueOrProblem: 'Screens: dashboard, gameplay review, mobile viewport.',
        acceptanceCriteria: 'No horizontal overflow.',
        verificationCommands: 'npm run build',
      },
      fixtureFiles,
      fixtureProjects,
      fixturePrompts,
    )
    const releaseBundle = generateContextBundle(
      {
        projectId: 'shadowspire',
        fileIds: ['project', 'standards'],
        presetId: 'release-prep',
        currentGoal: 'Prepare release.',
        activeTask: 'Validate packaging.',
        acceptanceCriteria: 'DMG opens.',
        verificationCommands: 'npm run dist:mac',
      },
      fixtureFiles,
      fixtureProjects,
      fixturePrompts,
    )

    expect(visualBundle).toContain('# Visual Direction')
    expect(visualBundle).toContain('# Screenshot / QA Requirements')
    expect(visualBundle).toContain('No horizontal overflow.')
    expect(releaseBundle).toContain('# Release Checklist')
    expect(releaseBundle).toContain('# Packaging Commands')
    expect(releaseBundle).toContain('npm run dist:mac')
    expect(visualBundle).not.toEqual(releaseBundle)
  })

  it('defines the requested preset set', () => {
    expect(contextPresets.map((preset) => preset.title)).toEqual([
      'New Project Kickoff',
      'Continue Existing Project',
      'Phase Implementation',
      'Bug Fix',
      'Visual Polish Pass',
      'Refactor Pass',
      'QA / Verification Pass',
      'Release Prep',
      'Asset Generation Pass',
      'Documentation Update',
      'Git Commit Summary',
    ])
  })
})

describe('context history helpers', () => {
  it('appends export history without overwriting existing entries', () => {
    const preset = getContextPreset('phase-implementation')
    const entry = buildContextHistoryEntry(
      {
        projectId: 'shadowspire',
        fileIds: ['project'],
        presetId: preset.id,
        currentGoal: 'Ship phase 8.',
        activeTask: 'Add presets.',
        acceptanceCriteria: 'Tests pass.',
        verificationCommands: 'npm test',
      },
      preset,
      '# Phase Implementation\n\nBundle body',
      fixtureFiles.filter((file) => file.id === 'project'),
      new Date('2026-07-02T20:00:00.000Z'),
    )

    const first = appendContextHistory(undefined, entry)
    const second = appendContextHistory(first, entry)

    expect(first).toContain('# Context History')
    expect(first).toContain('2026-07-02T20:00:00.000Z - Phase Implementation')
    expect(first).toContain('Ship phase 8.')
    expect(second.match(/Ship phase 8\./g)).toHaveLength(2)
  })
})
