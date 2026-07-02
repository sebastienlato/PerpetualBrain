export function safeProjectSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function createProjectFallbackFiles(projectName: string, slug: string) {
  const today = new Date().toISOString().slice(0, 10)

  return {
    'PROJECT.md': `# ${projectName}

## Summary
Describe what this project is, who it serves, and what outcome the current phase should produce.

## Tech Stack
- Runtime:
- UI:
- Data:
- Testing:

## Current Status
New project context created. Fill in the current phase, what works now, and what should remain out of scope.

## Important Files
- \`path/to/important-file\`

## Visual Direction
Describe the product feel, primary workflows, and non-negotiable UI rules.

## Active Tasks
- Define the first scoped implementation task.

## Known Issues
- Capture current risks or defects here.

## Acceptance Criteria
- Build succeeds.
- Primary workflow is verified.

## Tags
${slug}, project, codex-context
`,
    'ARCHITECTURE.md': `# ${projectName} Architecture

## Boundaries
Describe runtime boundaries, ownership rules, and data flow.
`,
    'DESIGN_RULES.md': `# ${projectName} Design Rules

## Product Feel
Describe the intended tone, density, and interaction style.
`,
    'CODEX_CONTEXT.md': `# Codex Context for ${projectName}

## Project Context
Fill in durable context for future Codex sessions.

## Instructions for Codex
Read relevant files, keep work scoped, verify changes, and report results.
`,
    'DECISIONS.md': `# ${projectName} Decision Log

| Date | Decision | Reason | Impact | Related Files | Status |
| --- | --- | --- | --- | --- | --- |
| ${today} | Project created in PerpetualBrain. | Start with explicit project memory for AI-assisted work. | Codex sessions can begin with structured context. | \`brain/projects/${slug}\` | active |
`,
    'TODO.md': `# ${projectName} TODO

## Now
- Define the next scoped task.

## Next
- Add follow-up work after the first task is complete.

## Later
- Capture lower-priority ideas here.
`,
    'LESSONS.md': `# ${projectName} Lessons Learned

- Keep future Codex work scoped and explicit.
- Add project-specific constraints here after each phase.
`,
  }
}
