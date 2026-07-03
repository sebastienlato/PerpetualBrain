import type { BrainFile, BrainProject, ContextBundleOptions, PromptTemplate } from '../types/brain'
import { getFileByCategory } from './brain'

export interface ContextPreset {
  id: string
  title: string
  description: string
  issueLabel?: string
  defaultGoal: string
  defaultTask: string
  defaultAcceptanceCriteria: string
  defaultVerificationCommands: string
  sections: string[]
}

interface BundleContext {
  options: ContextBundleOptions
  project: BrainProject
  selectedFiles: BrainFile[]
  prompt?: PromptTemplate
  architecture?: BrainFile
  projectDesign?: BrainFile
  projectIssues?: BrainFile
  decisions?: BrainFile
  lessons?: BrainFile
  standards?: BrainFile
  designStandards?: BrainFile
  workflow?: BrainFile
  assetRules?: BrainFile
  presetGuidance?: BrainFile
  codexContext?: BrainFile
  preset: ContextPreset
}

export const contextPresets: ContextPreset[] = [
  {
    id: 'new-project-kickoff',
    title: 'New Project Kickoff',
    description: 'Start a project from a clear brief, constraints, first milestone, and verification plan.',
    defaultGoal: 'Create the first scoped implementation plan and build the smallest coherent project foundation.',
    defaultTask: 'Read the brief and standards, identify the stack, implement the first usable slice, and verify it.',
    defaultAcceptanceCriteria: '- Product structure is established.\n- First workflow is usable.\n- Build, typecheck, and tests pass where available.\n- Files changed, verification, and limitations are summarized.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Project Context', 'New Project Brief', 'Product Intent', 'Tech Stack', 'Standards', 'Relevant Files', 'Current Goal', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'continue-existing-project',
    title: 'Continue Existing Project',
    description: 'Resume work with current status, decisions, known issues, relevant files, and concrete acceptance criteria.',
    defaultGoal: 'Continue the existing project from the selected context and complete the next scoped change.',
    defaultTask: 'Read the selected context, preserve existing behavior, implement the requested change, and verify it.',
    defaultAcceptanceCriteria: '- Existing functionality remains intact.\n- The requested workflow is complete.\n- Relevant checks pass.\n- Files changed, verification, risks, and git commands are reported.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Project Context', 'Current Status', 'Tech Stack', 'Relevant Files', 'Recent Decisions', 'Known Issues', 'Current Goal', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'phase-implementation',
    title: 'Phase Implementation',
    description: 'Execute one clearly bounded phase without drifting into later product work.',
    defaultGoal: 'Implement this phase only while preserving current routes, storage, and existing behavior.',
    defaultTask: 'Keep the patch scoped to the phase, update tests where risk warrants it, and stop after verification.',
    defaultAcceptanceCriteria: '- Phase requirements are implemented.\n- No unrelated features are added.\n- Existing behavior is preserved.\n- Required checks pass and manual QA is summarized.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Phase Goal', 'Project Context', 'Phase Scope', 'Do Not Change', 'Relevant Files', 'Decisions and Lessons', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'bug-fix',
    title: 'Bug Fix',
    description: 'Focus Codex on root cause, reproduction, constraints, and a small safe fix.',
    issueLabel: 'Problem / Reproduction',
    defaultGoal: 'Fix the described bug only.',
    defaultTask: 'Reproduce or reason through the failure, identify root cause, patch the smallest safe area, and verify the fix.',
    defaultAcceptanceCriteria: '- Root cause is identified.\n- The bug is fixed without unrelated changes.\n- Regression coverage is added or explained.\n- Relevant verification passes.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Problem Summary', 'Expected Behavior', 'Current Behavior', 'Relevant Files', 'Constraints', 'Reproduction Steps', 'Debugging Instructions', 'Acceptance Criteria', 'Verification Commands'],
  },
  {
    id: 'visual-polish-pass',
    title: 'Visual Polish Pass',
    description: 'Improve interface quality with screenshot gates, responsive checks, and strict non-placeholder standards.',
    issueLabel: 'Visual Direction / Screens',
    defaultGoal: 'Make the selected surface feel polished, premium, and production-ready without changing product behavior.',
    defaultTask: 'Improve hierarchy, spacing, typography, empty states, responsive behavior, and visual consistency.',
    defaultAcceptanceCriteria: '- No placeholder-looking UI remains on the target screens.\n- Desktop and mobile layouts have no horizontal overflow.\n- Text remains readable and controls remain usable.\n- Screenshots or manual visual QA are reported.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Visual Direction', 'Screens to Review', 'Current Design Rules', 'Do Not Change', 'Quality Bar', 'Screenshot / QA Requirements', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'refactor-pass',
    title: 'Refactor Pass',
    description: 'Reduce concrete complexity while preserving behavior and tests.',
    defaultGoal: 'Refactor the selected area to improve maintainability without changing user-facing behavior.',
    defaultTask: 'Read existing patterns, make the smallest coherent structural improvement, and verify behavior is preserved.',
    defaultAcceptanceCriteria: '- Behavior is unchanged.\n- Complexity or duplication is meaningfully reduced.\n- Tests are added or updated where behavior could regress.\n- Relevant checks pass.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Refactor Goal', 'Current Architecture', 'Behavior to Preserve', 'Relevant Files', 'Constraints', 'Testing Strategy', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'qa-verification-pass',
    title: 'QA / Verification Pass',
    description: 'Drive a structured verification pass with prioritized findings and concrete evidence.',
    defaultGoal: 'Verify the selected workflow and report prioritized issues with concrete reproduction notes.',
    defaultTask: 'Run checks, manually inspect the target routes, validate responsive behavior, and separate findings from summaries.',
    defaultAcceptanceCriteria: '- Required commands are run or blockers are reported.\n- Manual checks are listed.\n- Findings are prioritized with reproduction details.\n- Residual risk is clearly stated.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['QA Target', 'Project Context', 'Workflows to Verify', 'Known Risks', 'Verification Commands', 'Manual QA Checklist', 'Finding Format', 'Acceptance Criteria', 'Instructions for Codex'],
  },
  {
    id: 'release-prep',
    title: 'Release Prep',
    description: 'Prepare a local app for release with packaging, docs, limitations, and rollback notes.',
    defaultGoal: 'Prepare this project for a release-quality handoff.',
    defaultTask: 'Validate build, docs, packaging, known limitations, and final release notes without adding unrelated features.',
    defaultAcceptanceCriteria: '- Release commands pass.\n- Documentation reflects current behavior.\n- Known limitations are explicit.\n- Packaging outputs and install/open flow are reported.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build\nnpm run electron:compile\nnpm run dist:mac',
    sections: ['Release Goal', 'Current Product State', 'Release Checklist', 'Packaging Commands', 'Documentation Updates', 'Known Limitations', 'Rollback Risks', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'asset-generation-pass',
    title: 'Asset Generation Pass',
    description: 'Prepare or generate assets with naming, dimensions, review gates, and integration constraints.',
    issueLabel: 'Asset Brief',
    defaultGoal: 'Generate or prepare assets for the selected feature without prematurely wiring unreviewed assets into production.',
    defaultTask: 'Define asset specs, generate or normalize assets, document review expectations, and verify in context when applicable.',
    defaultAcceptanceCriteria: '- Asset names, dimensions, and intended usage are clear.\n- Review artifacts are produced.\n- Production wiring is limited to approved scope.\n- Visual QA notes are reported.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Asset Brief', 'Project Context', 'Asset Specifications', 'Relevant Files', 'Do Not Change', 'Review Requirements', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'documentation-update',
    title: 'Documentation Update',
    description: 'Update project docs to match current implementation without changing runtime behavior.',
    defaultGoal: 'Update documentation so it accurately reflects the current project behavior and limitations.',
    defaultTask: 'Read the implementation and docs, update only relevant documentation, and verify links/commands where practical.',
    defaultAcceptanceCriteria: '- Docs match actual behavior.\n- Commands and paths are accurate.\n- Known limitations are clear.\n- No runtime behavior changes are introduced.',
    defaultVerificationCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
    sections: ['Documentation Goal', 'Current Implementation Behavior', 'Docs to Update', 'Facts to Preserve', 'Relevant Files', 'Acceptance Criteria', 'Verification Commands', 'Instructions for Codex'],
  },
  {
    id: 'git-commit-summary',
    title: 'Git Commit Summary',
    description: 'Generate a concise commit summary and staging commands after implementation.',
    defaultGoal: 'Summarize the current changes into a clear commit-ready handoff.',
    defaultTask: 'Inspect changed files, summarize the intent, list verification, and provide git add / git commit commands.',
    defaultAcceptanceCriteria: '- Commit subject is concise.\n- Body explains meaningful changes and verification.\n- Known limitations are included.\n- Git commands are copy-ready.',
    defaultVerificationCommands: 'git status --short\ngit diff --stat',
    sections: ['Change Summary Goal', 'Changed Areas', 'Verification Evidence', 'Known Limitations', 'Commit Message Draft', 'Git Commands', 'Instructions for Codex'],
  },
]

export function getContextPreset(presetId?: string) {
  return contextPresets.find((preset) => preset.id === presetId) ?? contextPresets[1]
}

export function generateContextBundle(
  options: ContextBundleOptions,
  files: BrainFile[],
  projects: BrainProject[],
  prompts: PromptTemplate[],
) {
  const project = projects.find((item) => item.id === options.projectId)
  if (!project) {
    return ''
  }

  const selectedFiles = files.filter((file) => options.fileIds.includes(file.id))
  const prompt = prompts.find((item) => item.id === options.promptTemplateId)
  const architecture = getFileByCategory(files, project.id, 'ARCHITECTURE')
  const projectDesign = getFileByCategory(files, project.id, 'DESIGN_RULES')
  const projectIssues = getFileByCategory(files, project.id, 'TODO')
  const decisions = getFileByCategory(files, project.id, 'DECISIONS')
  const lessons = getFileByCategory(files, project.id, 'LESSONS')
  const standards = files.find((file) => file.path.endsWith('/global/CODING_STANDARDS.md'))
  const designStandards = files.find((file) => file.path.endsWith('/global/DESIGN_STANDARDS.md'))
  const workflow = files.find((file) => file.path.endsWith('/global/CODEX_WORKFLOW.md'))
  const assetRules = files.find((file) => file.path.endsWith('/global/ASSET_RULES.md'))
  const presetGuidance = files.find((file) => file.path.endsWith('/global/CONTEXT_PRESETS.md'))
  const codexContext = getFileByCategory(files, project.id, 'CODEX_CONTEXT')
  const context: BundleContext = {
    options,
    project,
    selectedFiles,
    prompt,
    architecture,
    projectDesign,
    projectIssues,
    decisions,
    lessons,
    standards,
    designStandards,
    workflow,
    assetRules,
    presetGuidance,
    codexContext,
    preset: getContextPreset(options.presetId),
  }

  return buildPresetBundle(context)
}

function buildPresetBundle(context: BundleContext) {
  const { preset, project, selectedFiles } = context
  const sections = preset.sections.flatMap((section) => renderSection(section, context))
  const selectedFilePaths = selectedFiles.map((file) => `- ${file.path}`).join('\n') || '- No files selected.'

  return [
    `# ${preset.title}`,
    '',
    `Preset: ${preset.title}`,
    `Project: ${project.name}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    sections.join('\n\n'),
    '',
    '# Selected File Inventory',
    selectedFilePaths,
    '',
    renderPromptTemplate(context),
  ]
    .filter((section) => section.trim().length > 0)
    .join('\n\n')
}

function renderSection(section: string, context: BundleContext) {
  const { options, project, selectedFiles, architecture, projectDesign, projectIssues, decisions, lessons, standards, designStandards, workflow, assetRules, presetGuidance, preset } = context
  const issue = options.issueOrProblem?.trim()
  const goal = options.currentGoal.trim() || preset.defaultGoal
  const task = options.activeTask.trim() || preset.defaultTask
  const acceptance = options.acceptanceCriteria.trim() || preset.defaultAcceptanceCriteria
  const verification = options.verificationCommands?.trim() || preset.defaultVerificationCommands
  const designRules = [projectDesign?.content, designStandards?.content].filter(Boolean).join('\n\n') || 'No design rules selected.'
  const standardsText = [standards?.content, workflow?.content].filter(Boolean).join('\n\n') || 'No standards selected.'
  const decisionsAndLessons = [decisions?.content, lessons?.content].filter(Boolean).join('\n\n') || 'No decisions or lessons selected.'

  const map: Record<string, string> = {
    'Project Context': projectContext(project),
    'Current Status': project.status || 'No current status found in PROJECT.md.',
    'Tech Stack': project.techStack.length ? project.techStack.map((item) => `- ${item}`).join('\n') : 'No tech stack listed.',
    'Relevant Files': selectedFiles.map((file) => `## ${file.title}\nPath: ${file.path}\n\n${file.content}`).join('\n\n') || 'No relevant files selected.',
    'Recent Decisions': decisions?.content ?? 'No decisions file selected.',
    'Known Issues': projectIssues?.content ?? issue ?? 'No known issues provided.',
    'Current Goal': goal,
    'Active Task': task,
    'Acceptance Criteria': acceptance,
    'Verification Commands': fence(verification, 'bash'),
    'Instructions for Codex': codexInstructions(context),
    'New Project Brief': [goal, issue].filter(Boolean).join('\n\n') || 'No brief provided.',
    'Product Intent': project.summary || 'Define product intent before implementation.',
    'Standards': standardsText,
    'Phase Goal': goal,
    'Phase Scope': task,
    'Do Not Change': [
      '- Do not add unrelated product features.',
      '- Do not change storage, routing, Electron, backup, Git, or file persistence behavior unless explicitly requested.',
      '- Preserve existing behavior and data flow.',
    ].join('\n'),
    'Decisions and Lessons': decisionsAndLessons,
    'Problem Summary': issue || goal,
    'Expected Behavior': issue ? 'Describe the desired behavior from the issue/problem statement before editing.' : 'Add expected behavior before starting if it is not obvious from context.',
    'Current Behavior': issue || 'Describe the current failing behavior before editing.',
    'Constraints': [
      '- Fix the described issue only.',
      '- Prefer the smallest safe patch.',
      '- Do not mask errors by relaxing TypeScript or validation rules.',
    ].join('\n'),
    'Reproduction Steps': issue || 'Add exact reproduction steps before or during debugging.',
    'Debugging Instructions': [
      '- Identify the root cause before patching.',
      '- Inspect nearby tests and add regression coverage when practical.',
      '- Report what was verified and what remains uncertain.',
    ].join('\n'),
    'Visual Direction': issue || 'Use the existing black/glow command-center visual language. Improve polish without redesigning the product model.',
    'Screens to Review': selectedFiles.map((file) => `- ${file.title} (${file.path})`).join('\n') || '- Dashboard\n- Project page\n- Context Builder\n- Settings\n- Mobile viewport',
    'Current Design Rules': designRules,
    'Quality Bar': [
      '- Avoid placeholder-looking UI.',
      '- Preserve readable contrast and focus states.',
      '- No horizontal overflow at mobile widths.',
      '- Verify important screens manually or with screenshots.',
    ].join('\n'),
    'Screenshot / QA Requirements': 'Manually review desktop and mobile viewports. Capture or report screenshots when visual changes are made.',
    'Refactor Goal': goal,
    'Current Architecture': architecture?.content ?? 'No architecture file selected.',
    'Behavior to Preserve': 'Preserve existing routes, data flow, storage adapters, API contracts, and user-facing workflows unless explicitly requested.',
    'Testing Strategy': 'Run relevant tests before and after the refactor. Add focused tests where behavior could regress.',
    'QA Target': goal,
    'Workflows to Verify': issue || selectedFiles.map((file) => `- ${file.title}`).join('\n') || '- Primary workflow',
    'Known Risks': [projectIssues?.content, decisionsAndLessons].filter(Boolean).join('\n\n') || 'No known risks selected.',
    'Manual QA Checklist': [
      '- Dashboard',
      '- Project page',
      '- Markdown editor',
      '- Search',
      '- Context Builder',
      '- Settings',
      '- Mobile viewport / no horizontal overflow',
    ].join('\n'),
    'Finding Format': 'List findings first, ordered by severity, with file/route references and reproduction notes. If no issues are found, say that clearly and mention residual risk.',
    'Release Goal': goal,
    'Current Product State': projectContext(project),
    'Release Checklist': [
      '- Build and test commands pass.',
      '- Documentation matches current behavior.',
      '- Packaging output is inspected.',
      '- Known limitations are explicit.',
      '- Install/open flow is verified when applicable.',
    ].join('\n'),
    'Packaging Commands': fence('npm run electron:compile\nnpm run dist:mac', 'bash'),
    'Documentation Updates': 'Update README.md, AGENTS.md, and docs/ARCHITECTURE.md when behavior, commands, or limitations change.',
    'Known Limitations': 'List limitations honestly. Do not imply unimplemented AI APIs, remote sync, or automation exists.',
    'Rollback Risks': 'Call out migrations, data writes, packaging changes, or irreversible operations. Prefer reversible changes.',
    'Asset Brief': issue || goal,
    'Asset Specifications': [assetRules?.content, presetGuidance?.content].filter(Boolean).join('\n\n') || 'Define dimensions, naming, review route, and usage before generating assets.',
    'Review Requirements': 'Preview assets in context before production use. Include naming, dimensions, anchors, and approval screenshots where relevant.',
    'Documentation Goal': goal,
    'Current Implementation Behavior': projectContext(project),
    'Docs to Update': selectedFiles.map((file) => `- ${file.path}`).join('\n') || '- README.md\n- AGENTS.md\n- docs/ARCHITECTURE.md',
    'Facts to Preserve': 'Keep docs aligned with actual commands, paths, storage behavior, known limitations, and verification results.',
    'Change Summary Goal': goal,
    'Changed Areas': 'Inspect git status and diff before writing the summary.',
    'Verification Evidence': fence(verification, 'bash'),
    'Commit Message Draft': 'Write a concise imperative subject and a short body covering meaningful changes and verification.',
    'Git Commands': fence('git status --short\ngit diff --stat\ngit add <changed files>\ngit commit -m "<concise subject>"', 'bash'),
  }

  return [`# ${section}`, map[section] ?? 'No content provided for this section.']
}

function projectContext(project: BrainProject) {
  return [
    `Project: ${project.name}`,
    '',
    project.summary,
    '',
    `Status: ${project.status || 'No status listed.'}`,
    '',
    project.techStack.length ? `Tech stack: ${project.techStack.join(', ')}` : '',
    project.tags.length ? `Tags: ${project.tags.join(', ')}` : '',
  ].filter(Boolean).join('\n')
}

function codexInstructions(context: BundleContext) {
  const { codexContext, presetGuidance, preset } = context
  return [
    codexContext?.content ?? 'Read the relevant files, implement the requested change, verify it, and report the outcome.',
    '',
    'Preset operating rules:',
    '- Work in clear phases and keep scope tight.',
    '- Preserve existing behavior unless explicitly asked to change it.',
    '- Do not accept placeholder visuals on UI work.',
    '- Run the requested verification commands or explain blockers.',
    '- Summarize files changed, verification results, known issues, and git add / git commit commands.',
    '',
    presetGuidance ? `Editable preset guidance from CONTEXT_PRESETS.md:\n\n${presetGuidance.content}` : '',
    '',
    `Selected preset: ${preset.title}`,
  ].filter((item) => item.trim().length > 0).join('\n')
}

function renderPromptTemplate({ prompt }: BundleContext) {
  return prompt ? `# Prompt Template\n## ${prompt.title}\n${prompt.body}` : ''
}

function fence(value: string, language = '') {
  return `\`\`\`${language}\n${value.trim()}\n\`\`\``
}

export function buildContextHistoryEntry(options: ContextBundleOptions, preset: ContextPreset, bundle: string, selectedFiles: BrainFile[], date = new Date()) {
  const goal = options.currentGoal.trim() || preset.defaultGoal
  const acceptance = options.acceptanceCriteria.trim() || preset.defaultAcceptanceCriteria
  const verification = options.verificationCommands?.trim() || preset.defaultVerificationCommands

  return [
    `## ${date.toISOString()} - ${preset.title}`,
    '',
    `Goal: ${goal}`,
    '',
    `Preset: ${preset.title}`,
    `Bundle length: ${bundle.length.toLocaleString()} characters`,
    '',
    'Selected files:',
    selectedFiles.map((file) => `- ${file.path}`).join('\n') || '- No files selected.',
    '',
    'Acceptance criteria:',
    acceptance,
    '',
    'Verification commands:',
    fence(verification, 'bash'),
  ].join('\n')
}

export function appendContextHistory(existingContent: string | undefined, entry: string) {
  const header = existingContent?.trim()
    ? existingContent.trim()
    : '# Context History\n\nGenerated context bundle exports for this project.'

  return `${header}\n\n${entry.trim()}\n`
}
