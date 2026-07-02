const decisionTable = `| Date | Decision | Reason | Impact | Related Files | Status |
| --- | --- | --- | --- | --- | --- |
| ${new Date().toISOString().slice(0, 10)} | Project created in PerpetualBrain. | Start with explicit project memory for AI-assisted work. | Codex sessions can begin with structured context. | \`brain/projects/[slug]\` | active |`

export function createProjectTemplates(projectName: string, slug: string) {
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
- Handoff includes files changed, checks run, and limitations.

## Tags
${slug}, project, codex-context
`,
    'ARCHITECTURE.md': `# ${projectName} Architecture

## Boundaries
Describe the main runtime boundaries, ownership rules, and data flow.

## Key Modules
- \`src/module\`: purpose

## State Rules
- Keep state ownership explicit.
- Prefer typed boundaries between systems.

## Testing Strategy
- Typecheck and build for every phase.
- Use visual verification for UI-facing changes.
`,
    'DESIGN_RULES.md': `# ${projectName} Design Rules

## Product Feel
Describe the intended tone, density, and interaction style.

## Layout Rules
- Keep hierarchy clear.
- Avoid placeholder-looking UI.
- Make important workflows efficient and scannable.

## Visual QA
- Check desktop and mobile.
- Confirm text does not overlap or overflow.
`,
    'CODEX_CONTEXT.md': `# Codex Context for ${projectName}

## Project Context
Fill in the durable project context that Codex should receive before implementation work.

## Current Working Agreement
- Read relevant files first.
- Keep changes scoped to the current request.
- Preserve existing architecture unless a change is required.
- Run verification and report results.

## Instructions for Codex
Implement the requested change, verify it, and report files changed, checks run, known limitations, and next recommended steps.
`,
    'DECISIONS.md': `# ${projectName} Decision Log

${decisionTable.replace('[slug]', slug)}
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
- Capture recurring mistakes as rules.
`,
  }
}
