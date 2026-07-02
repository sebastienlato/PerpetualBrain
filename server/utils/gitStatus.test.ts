import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getGitStatus, initializeGitRepo, parseGitStatusPorcelain, runGit } from './gitStatus'

let tempRoot = ''

beforeEach(async () => {
  tempRoot = await mkdtemp(path.join(os.tmpdir(), 'perpetual-brain-git-'))
})

afterEach(async () => {
  await rm(tempRoot, { recursive: true, force: true })
})

describe('parseGitStatusPorcelain', () => {
  it('separates branch, staged, changed, and untracked files', () => {
    expect(parseGitStatusPorcelain([
      '## main...origin/main',
      ' M projects/demo/PROJECT.md',
      'M  global/CODING_STANDARDS.md',
      'A  templates/NEW.md',
      'R  old.md -> projects/demo/RENAMED.md',
      '?? projects/demo/NOTES.md',
    ].join('\n'))).toEqual({
      branch: 'main',
      changedFiles: ['projects/demo/PROJECT.md'],
      stagedFiles: ['global/CODING_STANDARDS.md', 'projects/demo/RENAMED.md', 'templates/NEW.md'],
      untrackedFiles: ['projects/demo/NOTES.md'],
    })
  })
})

describe('git status helpers', () => {
  it('reports non-Git folders without throwing', async () => {
    const status = await getGitStatus(tempRoot)

    expect(status.gitAvailable).toBe(true)
    expect(status.isGitRepo).toBe(false)
    expect(status.clean).toBe(true)
  })

  it('handles unavailable Git gracefully', async () => {
    const status = await getGitStatus(tempRoot, 'definitely-not-a-real-git-binary')

    expect(status.gitAvailable).toBe(false)
    expect(status.error).toContain('Git is not available')
  })

  it('initializes a repo and creates a non-overwriting .gitignore', async () => {
    await writeFile(path.join(tempRoot, '.gitignore'), 'custom\n')

    const status = await initializeGitRepo(tempRoot)

    expect(status.gitAvailable).toBe(true)
    expect(status.isGitRepo).toBe(true)
    expect(status.untrackedFiles).toContain('.gitignore')
  })

  it('limits status to the active brain root inside a larger Git repo', async () => {
    await runGit(tempRoot, ['init'])
    await writeFile(path.join(tempRoot, 'APP.md'), 'outside\n')

    const brainRoot = path.join(tempRoot, 'brain')
    await mkdir(brainRoot)
    await writeFile(path.join(brainRoot, 'PROJECT.md'), 'inside\n')

    const status = await getGitStatus(brainRoot)

    expect(status.isGitRepo).toBe(true)
    expect(status.untrackedFiles).toContain('PROJECT.md')
    expect(status.untrackedFiles).not.toContain('APP.md')
  })
})
