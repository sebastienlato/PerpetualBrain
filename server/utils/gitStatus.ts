import { execFile } from 'node:child_process'
import { access, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const gitTimeoutMs = 5_000

export interface GitStatusResult {
  gitAvailable: boolean
  isGitRepo: boolean
  branch?: string
  clean: boolean
  changedFiles: string[]
  untrackedFiles: string[]
  stagedFiles: string[]
  error?: string
}

export interface GitDiffSummary {
  gitAvailable: boolean
  isGitRepo: boolean
  summary?: string
  error?: string
}

export class GitCommandError extends Error {
  readonly code?: string | number
  readonly stdout: string
  readonly stderr: string

  constructor(message: string, options: { code?: string | number; stdout?: string; stderr?: string } = {}) {
    super(message)
    this.name = 'GitCommandError'
    this.code = options.code
    this.stdout = options.stdout ?? ''
    this.stderr = options.stderr ?? ''
  }
}

function normalizeGitPath(file: string, rootPrefix = '') {
  let normalized = file.replace(/^\.\//, '')

  if (rootPrefix && normalized.startsWith(rootPrefix)) {
    normalized = normalized.slice(rootPrefix.length)
  }

  return normalized
}

function fileFromStatusLine(line: string, rootPrefix = '') {
  const raw = line.slice(3).trim()
  const renamed = raw.split(' -> ')
  return normalizeGitPath(renamed[renamed.length - 1] || raw, rootPrefix)
}

export function parseGitStatusPorcelain(output: string, rootPrefix = '') {
  const changedFiles = new Set<string>()
  const untrackedFiles = new Set<string>()
  const stagedFiles = new Set<string>()
  let branch: string | undefined

  for (const line of output.split(/\r?\n/)) {
    if (!line.trim()) {
      continue
    }

    if (line.startsWith('## ')) {
      branch = line.slice(3).split('...')[0]?.trim() || undefined
      continue
    }

    if (line.startsWith('?? ')) {
      untrackedFiles.add(fileFromStatusLine(line, rootPrefix))
      continue
    }

    const stagedStatus = line[0]
    const worktreeStatus = line[1]
    const file = fileFromStatusLine(line, rootPrefix)

    if (stagedStatus && stagedStatus !== ' ') {
      stagedFiles.add(file)
    }

    if (worktreeStatus && worktreeStatus !== ' ') {
      changedFiles.add(file)
    }
  }

  return {
    branch,
    changedFiles: [...changedFiles].sort(),
    untrackedFiles: [...untrackedFiles].sort(),
    stagedFiles: [...stagedFiles].sort(),
  }
}

export async function runGit(brainRoot: string, args: string[], gitBinary = 'git') {
  try {
    const { stdout, stderr } = await execFileAsync(gitBinary, args, {
      cwd: brainRoot,
      timeout: gitTimeoutMs,
      maxBuffer: 256 * 1024,
      windowsHide: true,
    })

    return { stdout, stderr }
  } catch (error) {
    const execError = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string }
    throw new GitCommandError(execError.message, {
      code: execError.code,
      stdout: execError.stdout,
      stderr: execError.stderr,
    })
  }
}

export async function isGitAvailable(gitBinary = 'git') {
  try {
    await execFileAsync(gitBinary, ['--version'], { timeout: gitTimeoutMs, windowsHide: true })
    return true
  } catch {
    return false
  }
}

export async function isGitRepo(brainRoot: string, gitBinary = 'git') {
  try {
    const { stdout } = await runGit(brainRoot, ['rev-parse', '--is-inside-work-tree'], gitBinary)
    return stdout.trim() === 'true'
  } catch {
    return false
  }
}

export async function getGitStatus(brainRoot: string, gitBinary = 'git'): Promise<GitStatusResult> {
  if (!(await isGitAvailable(gitBinary))) {
    return {
      gitAvailable: false,
      isGitRepo: false,
      clean: true,
      changedFiles: [],
      untrackedFiles: [],
      stagedFiles: [],
      error: 'Git is not available on this Mac.',
    }
  }

  if (!(await isGitRepo(brainRoot, gitBinary))) {
    return {
      gitAvailable: true,
      isGitRepo: false,
      clean: true,
      changedFiles: [],
      untrackedFiles: [],
      stagedFiles: [],
    }
  }

  try {
    const [{ stdout }, { stdout: rootPrefix }] = await Promise.all([
      runGit(brainRoot, ['status', '--porcelain=v1', '-b', '-uall', '--', '.'], gitBinary),
      runGit(brainRoot, ['rev-parse', '--show-prefix'], gitBinary),
    ])
    const parsed = parseGitStatusPorcelain(stdout, rootPrefix.trim())
    return {
      gitAvailable: true,
      isGitRepo: true,
      branch: parsed.branch,
      clean: parsed.changedFiles.length === 0 && parsed.untrackedFiles.length === 0 && parsed.stagedFiles.length === 0,
      changedFiles: parsed.changedFiles,
      untrackedFiles: parsed.untrackedFiles,
      stagedFiles: parsed.stagedFiles,
    }
  } catch (error) {
    return {
      gitAvailable: true,
      isGitRepo: true,
      clean: false,
      changedFiles: [],
      untrackedFiles: [],
      stagedFiles: [],
      error: error instanceof Error ? error.message : 'Unable to read Git status.',
    }
  }
}

export async function initializeGitRepo(brainRoot: string, gitBinary = 'git') {
  if (!(await isGitAvailable(gitBinary))) {
    return {
      gitAvailable: false,
      isGitRepo: false,
      clean: true,
      changedFiles: [],
      untrackedFiles: [],
      stagedFiles: [],
      error: 'Git is not available on this Mac.',
    } satisfies GitStatusResult
  }

  if (!(await isGitRepo(brainRoot, gitBinary))) {
    await runGit(brainRoot, ['init'], gitBinary)
  }

  await createBrainGitignore(brainRoot)
  return getGitStatus(brainRoot, gitBinary)
}

export async function createBrainGitignore(brainRoot: string) {
  const gitignorePath = path.join(brainRoot, '.gitignore')
  try {
    await access(gitignorePath)
  } catch {
    await writeFile(gitignorePath, '.DS_Store\n*.tmp\n', { encoding: 'utf8', flag: 'wx' })
  }
}

export async function getGitDiffSummary(brainRoot: string, gitBinary = 'git'): Promise<GitDiffSummary> {
  if (!(await isGitAvailable(gitBinary))) {
    return {
      gitAvailable: false,
      isGitRepo: false,
      error: 'Git is not available on this Mac.',
    }
  }

  if (!(await isGitRepo(brainRoot, gitBinary))) {
    return {
      gitAvailable: true,
      isGitRepo: false,
    }
  }

  try {
    const { stdout } = await runGit(brainRoot, ['diff', '--shortstat', '--', '.'], gitBinary)
    return {
      gitAvailable: true,
      isGitRepo: true,
      summary: stdout.trim() || 'No unstaged diff.',
    }
  } catch (error) {
    return {
      gitAvailable: true,
      isGitRepo: true,
      error: error instanceof Error ? error.message : 'Unable to read Git diff summary.',
    }
  }
}
