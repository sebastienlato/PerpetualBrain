import { describe, expect, it } from 'vitest'
import { fixtureFiles } from '../test/fixtures'
import { searchBrain } from './search'

describe('searchBrain', () => {
  it('finds files by title, content, tags, and path', () => {
    expect(searchBrain(fixtureFiles, 'ShadowSpire')[0]?.file.id).toBe('project')
    expect(searchBrain(fixtureFiles, 'simulation')[0]?.file.id).toBe('architecture')
    expect(searchBrain(fixtureFiles, 'phaser')[0]?.file.id).toBe('project')
    expect(searchBrain(fixtureFiles, 'global')[0]?.file.id).toBe('standards')
  })

  it('returns no results for empty queries', () => {
    expect(searchBrain(fixtureFiles, '')).toEqual([])
  })

  it('normalizes markdown punctuation in query terms', () => {
    expect(searchBrain(fixtureFiles, 'Phaser_platformer')[0]?.file.id).toBe('project')
  })
})
