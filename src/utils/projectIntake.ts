export const projectTypes = [
  'iOS app',
  'Electron app',
  'Web app',
  'Phaser game',
  'SpriteKit game',
  'Design/brand project',
  'Research/investment project',
  'Other',
] as const

export type ProjectType = typeof projectTypes[number]

export interface ProjectIntakeAnswers {
  projectName: string
  projectType: ProjectType
  shortDescription: string
  techStack: string
  visualDirection: string
  mainGoals: string
  mvpFeatures: string
  nonGoals: string
  constraints: string
  qaCommands: string
  codexPreferences: string
  assetRules: string
  gitReleaseNotes: string
}

export interface GeneratedProjectFile {
  fileName: string
  title: string
  category: string
  content: string
}

export interface ProjectIntakeCreationCheck {
  canCreate: boolean
  slug: string
  reason?: string
}

const genericQaCommands = 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build'

export function safeIntakeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function defaultProjectIntakeAnswers(): ProjectIntakeAnswers {
  return {
    projectName: '',
    projectType: 'Electron app',
    shortDescription: '',
    techStack: '',
    visualDirection: '',
    mainGoals: '',
    mvpFeatures: '',
    nonGoals: '',
    constraints: '',
    qaCommands: defaultQaCommandsForProjectType('Electron app'),
    codexPreferences: 'Work in clear phases. Preserve existing behavior. Run verification before handoff. Summarize files changed, checks run, known limitations, and git add / git commit commands.',
    assetRules: '',
    gitReleaseNotes: 'Use Git for project memory and source changes. Keep commits scoped and write clear commit messages.',
  }
}

export function checkProjectIntakeCreation(projectName: string, existingProjectIds: string[]): ProjectIntakeCreationCheck {
  const slug = safeIntakeSlug(projectName)
  if (!slug) {
    return { canCreate: false, slug, reason: 'Project name is required.' }
  }

  if (existingProjectIds.includes(slug)) {
    return {
      canCreate: false,
      slug,
      reason: `Project "${slug}" already exists. Rename this project to avoid overwriting existing brain files.`,
    }
  }

  return { canCreate: true, slug }
}

export function generateProjectIntakeFiles(answers: ProjectIntakeAnswers, date = new Date()): GeneratedProjectFile[] {
  const projectName = answers.projectName.trim() || 'Untitled Project'
  const slug = safeIntakeSlug(projectName) || 'untitled-project'
  const today = date.toISOString().slice(0, 10)
  const typeGuidance = projectTypeGuidance(answers.projectType)
  const normalizedQaCommands = answers.qaCommands.trim()
  const defaultQaCommandValues = new Set<string>([
    genericQaCommands,
    ...projectTypes.map((projectType) => defaultQaCommandsForProjectType(projectType)),
  ])
  const qaCommands = normalizedQaCommands && !defaultQaCommandValues.has(normalizedQaCommands)
    ? normalizedQaCommands
    : defaultQaCommandsForProjectType(answers.projectType)
  const techStack = lines(answers.techStack, typeGuidance.techStack)
  const goals = lines(answers.mainGoals, '- Define the first valuable outcome.')
  const mvp = lines(answers.mvpFeatures, typeGuidance.mvpFeatures)
  const nonGoals = lines(answers.nonGoals, '- Avoid unrelated features in the first phase.')
  const constraints = lines(answers.constraints, typeGuidance.constraints)
  const visualDirection = answers.visualDirection.trim() || typeGuidance.visualDirection
  const assetRules = answers.assetRules.trim() || typeGuidance.assetRules
  const codexPreferences = lines(answers.codexPreferences, '- Work in scoped phases.\n- Preserve existing behavior.\n- Verify before handoff.')
  const gitReleaseNotes = lines(answers.gitReleaseNotes, typeGuidance.gitReleaseNotes)
  const description = answers.shortDescription.trim() || `A project of type ${answers.projectType} created from the PerpetualBrain intake wizard.`

  return [
    {
      fileName: 'PROJECT.md',
      title: projectName,
      category: 'PROJECT',
      content: `# ${projectName}

## Summary
${description}

## Project Type
${answers.projectType}

## Tech Stack
${techStack}

## Current Status
Project intake complete. The next step is to run the kickoff prompt and implement the first scoped phase.

## Main Goals
${goals}

## MVP Features
${mvp}

## Non-Goals
${nonGoals}

## Important Constraints
${constraints}

## Visual Direction
${visualDirection}

## Active Tasks
- Review \`KICKOFF_PROMPT.md\`.
- Confirm the first phase scope.
- Implement the MVP slice without drifting into non-goals.
- Run the verification commands before handoff.

## Known Issues
- No implementation has been verified yet.
- Replace assumptions as soon as source files or designs exist.

## Acceptance Criteria
- First phase is scoped and implemented.
- Primary workflow is usable.
- Required verification commands pass or blockers are documented.
- Handoff includes files changed, checks run, known limitations, and git commands.

## Tags
${slug}, ${answers.projectType.toLowerCase().replaceAll('/', '-')}, codex-context, intake
`,
    },
    {
      fileName: 'ARCHITECTURE.md',
      title: `${projectName} Architecture`,
      category: 'ARCHITECTURE',
      content: `# ${projectName} Architecture

## Architecture Intent
${typeGuidance.architectureIntent}

## Proposed Boundaries
${typeGuidance.boundaries}

## Data and State Rules
${typeGuidance.stateRules}

## Key Modules To Define
${typeGuidance.modules}

## Constraints
${constraints}

## Verification Strategy
\`\`\`bash
${qaCommands}
\`\`\`
`,
    },
    {
      fileName: 'DESIGN_RULES.md',
      title: `${projectName} Design Rules`,
      category: 'DESIGN_RULES',
      content: `# ${projectName} Design Rules

## Visual Direction
${visualDirection}

## Product Feel
${typeGuidance.productFeel}

## UI Rules
${typeGuidance.uiRules}

## Asset Rules
${assetRules}

## Accessibility and QA
${typeGuidance.accessibility}
`,
    },
    {
      fileName: 'CODEX_CONTEXT.md',
      title: `Codex Context for ${projectName}`,
      category: 'CODEX_CONTEXT',
      content: `# Codex Context for ${projectName}

## Project Context
${description}

## Current Goal
Build the first scoped MVP phase for this ${answers.projectType.toLowerCase()}.

## Workflow Preferences
${codexPreferences}

## Important Constraints
${constraints}

## Verification Commands
\`\`\`bash
${qaCommands}
\`\`\`

## Instructions for Codex
- Read all project brain files before editing.
- Preserve phase boundaries and non-goals.
- Prefer existing stack conventions.
- Do not accept placeholder visuals for user-facing surfaces.
- Run verification commands and report blockers.
- Summarize files changed, checks run, known limitations, and git add / git commit commands.
`,
    },
    {
      fileName: 'DECISIONS.md',
      title: `${projectName} Decision Log`,
      category: 'DECISIONS',
      content: `# ${projectName} Decision Log

| Date | Decision | Reason | Impact | Related Files | Status |
| --- | --- | --- | --- | --- | --- |
| ${today} | Created project brain with Project Intake Wizard. | Start with structured context before implementation. | Codex can begin from a complete project brief. | \`brain/projects/${slug}\` | active |
| ${today} | Project type set to ${answers.projectType}. | Type-specific defaults shape architecture, QA, and kickoff instructions. | Generated files include ${answers.projectType}-specific guidance. | \`PROJECT.md\`, \`ARCHITECTURE.md\`, \`KICKOFF_PROMPT.md\` | active |
`,
    },
    {
      fileName: 'TODO.md',
      title: `${projectName} TODO`,
      category: 'TODO',
      content: `# ${projectName} TODO

## Now
${mvp}

## Next
- Convert the kickoff prompt into the first implementation phase.
- Add source files and update architecture notes as decisions become real.
- Capture every important tradeoff in \`DECISIONS.md\`.

## Later
${nonGoals}

## Verification
\`\`\`bash
${qaCommands}
\`\`\`
`,
    },
    {
      fileName: 'LESSONS.md',
      title: `${projectName} Lessons Learned`,
      category: 'LESSONS',
      content: `# ${projectName} Lessons Learned

- Keep future Codex work scoped to one phase at a time.
- Preserve non-goals unless the project owner explicitly changes scope.
- Update this file after each implementation phase with recurring constraints, mistakes, and project-specific rules.
- Keep screenshot or manual QA gates for user-facing work.
`,
    },
    {
      fileName: 'CONTEXT_HISTORY.md',
      title: `Context History for ${projectName}`,
      category: 'CONTEXT_HISTORY',
      content: `# Context History

Generated context bundle exports for this project.

## ${date.toISOString()} - Project Intake

Goal: Create a high-quality project brain and kickoff prompt.

Project type: ${answers.projectType}

Summary: ${description}

Verification commands:
\`\`\`bash
${qaCommands}
\`\`\`
`,
    },
    {
      fileName: 'KICKOFF_PROMPT.md',
      title: `${projectName} Kickoff Prompt`,
      category: 'KICKOFF_PROMPT',
      content: `# ${projectName} Kickoff Prompt

Use this prompt to start the first Codex implementation session.

## Project Context
${description}

## Goal
${goals}

## Tech Stack
${techStack}

## Desired Architecture
${typeGuidance.architectureIntent}

${typeGuidance.boundaries}

## Visual Direction
${visualDirection}

## MVP Scope
${mvp}

## Non-Goals
${nonGoals}

## Important Constraints
${constraints}

## Development Phases
${typeGuidance.phases}

## Acceptance Criteria
- MVP scope is implemented without drifting into non-goals.
- Existing generated brain files remain accurate after changes.
- User-facing surfaces meet the visual direction and QA bar.
- Verification commands pass or blockers are explained.

## Verification Commands
\`\`\`bash
${qaCommands}
\`\`\`

## Reporting Requirements
- Summarize files changed.
- Report verification results.
- Include manual QA or screenshot notes for visual work.
- List known limitations and residual risks.
- Recommend the next scoped phase.

## Git Commit Instructions
${gitReleaseNotes}

Provide exact commands:
\`\`\`bash
git status --short
git add <changed files>
git commit -m "<concise subject>"
\`\`\`
`,
    },
  ]
}

export function defaultQaCommandsForProjectType(projectType: ProjectType) {
  return projectTypeGuidance(projectType).defaultQaCommands
}

function lines(value: string, fallback: string) {
  return normalizeList(value.trim() || fallback)
}

function normalizeList(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.startsWith('- ') || line.startsWith('* ') ? `- ${line.slice(2).trim()}` : line)
    .join('\n')
}

function projectTypeGuidance(projectType: ProjectType) {
  switch (projectType) {
    case 'iOS app':
      return {
        techStack: '- SwiftUI\n- SwiftData where persistence is needed\n- MVVM or feature-focused view models\n- XCTest for focused coverage',
        mvpFeatures: '- Build a native SwiftUI shell.\n- Implement the first core workflow.\n- Add basic accessibility labels and dynamic type checks.',
        constraints: '- Keep pure models and helpers free of unnecessary MainActor isolation.\n- Prefer native SwiftUI controls.\n- Avoid introducing WidgetKit or ActivityKit unless explicitly required.',
        visualDirection: 'Clean native Apple-platform interface with calm hierarchy, strong spacing, accessible contrast, and no placeholder-looking screens.',
        assetRules: '- Use SF Symbols where appropriate.\n- Keep app icons and launch assets production-ready before release.\n- Verify visual states in simulator screenshots.',
        gitReleaseNotes: '- Run status before commit.\n- Keep implementation commits scoped by phase.\n- Mention simulator/device verification in commit body.',
        architectureIntent: 'Use SwiftUI for UI composition, small view models at feature boundaries, and pure value types for reusable logic.',
        boundaries: '- Views own layout and presentation.\n- View models own UI state and user actions.\n- Persistence adapters hide storage details.\n- Pure helpers stay testable outside UI isolation.',
        stateRules: '- Keep state explicit and localized.\n- Use SwiftData only when persistence is required.\n- Avoid broad actor isolation changes for pure helpers.',
        modules: '- App shell\n- Feature views\n- Persistence adapters\n- Shared models\n- Test targets',
        productFeel: 'Native, focused, and calm. Prefer platform conventions over custom chrome.',
        uiRules: '- Support Dynamic Type.\n- Keep touch targets comfortable.\n- Avoid placeholder copy and empty states.\n- Use SF Symbols for familiar actions.',
        accessibility: '- Add VoiceOver labels for custom controls.\n- Check contrast and Dynamic Type.\n- Use haptics only where they reinforce meaningful actions.',
        defaultQaCommands: 'xcodebuild -scheme <Scheme> -destination "platform=iOS Simulator,name=iPhone 17 Pro" build\nxcodebuild test -scheme <Scheme> -destination "platform=iOS Simulator,name=iPhone 17 Pro"',
        phases: '1. Build the native app shell and first workflow.\n2. Add persistence only when the workflow needs it.\n3. Add focused tests for pure logic and view models.\n4. Run simulator QA and capture screenshots.\n5. Prepare release notes and known limitations.',
      }
    case 'Electron app':
      return {
        techStack: '- Vite\n- React\n- TypeScript\n- Tailwind CSS\n- Electron\n- Local API or preload bridge only where needed',
        mvpFeatures: '- Build the desktop shell.\n- Implement the first local workflow.\n- Preserve browser/dev-server support.\n- Package a macOS build when release-ready.',
        constraints: '- Keep Electron secure: contextIsolation true, nodeIntegration false, sandboxed renderer.\n- Expose narrow preload methods only.\n- Do not expose arbitrary filesystem access.',
        visualDirection: 'Premium desktop command-center UI with dark surfaces, clear hierarchy, and restrained accent glow.',
        assetRules: '- Keep icons crisp at Dock sizes.\n- Avoid placeholder app icons for release.\n- Verify loading state has no white flash.',
        gitReleaseNotes: '- Commit app shell, API, and packaging changes separately when practical.\n- Include packaging output and limitations in release commits.',
        architectureIntent: 'Keep the renderer as a web app, keep filesystem behavior in Electron main or a local API, and expose only narrow safe preload methods.',
        boundaries: '- Renderer owns UI and storage adapter calls.\n- Electron main owns native dialogs, app lifecycle, and filesystem permissions.\n- Local API owns file validation.\n- Preload exposes minimal intent-based methods.',
        stateRules: '- Keep persistence behind adapters.\n- Keep renderer free of Node filesystem access.\n- Validate all user-provided paths server-side or in main.',
        modules: '- Electron main\n- Preload bridge\n- Vite renderer\n- Local API\n- Storage adapter\n- Packaging config',
        productFeel: 'Dense, polished, dark-mode-first, and operational.',
        uiRules: '- Avoid generic notes-app styling.\n- Keep panels sharp and readable.\n- Maintain mobile/browser fallback layouts.\n- Use status badges and copy actions consistently.',
        accessibility: '- Preserve contrast.\n- Keep focus states visible.\n- Ensure keyboard access for forms and dialogs.',
        defaultQaCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build\nnpm run electron:compile\nnpm run dist:mac',
        phases: '1. Preserve web mode and add desktop shell.\n2. Add secure local runtime boundaries.\n3. Implement the first feature through existing storage adapters.\n4. Verify dev, Electron dev, and packaged app.\n5. Document commands and limitations.',
      }
    case 'Web app':
      return {
        techStack: '- Vite or Next.js\n- React\n- TypeScript\n- Tailwind CSS\n- Vitest or Playwright as needed',
        mvpFeatures: '- Build the first usable route.\n- Add real navigation and empty states.\n- Verify desktop and mobile layouts.',
        constraints: '- Keep components typed and focused.\n- Avoid placeholder-looking UI.\n- Do not add backend complexity before the workflow requires it.',
        visualDirection: 'Polished web product interface with clear hierarchy, responsive layouts, and production-quality empty states.',
        assetRules: '- Use real or generated assets when visual context matters.\n- Avoid generic abstract placeholders.\n- Optimize images before shipping.',
        gitReleaseNotes: '- Keep UI and behavior changes scoped.\n- Include screenshots or manual QA notes for visual work.',
        architectureIntent: 'Use route-level pages, reusable components, typed utilities, and focused state ownership.',
        boundaries: '- Pages compose workflows.\n- Components own reusable UI.\n- Utilities own parsing and data transforms.\n- API/storage logic stays behind adapters.',
        stateRules: '- Prefer local state for local forms.\n- Introduce shared state only when multiple routes need it.\n- Keep derived data memoized and testable.',
        modules: '- App routes\n- Components\n- Hooks\n- Utilities\n- Tests',
        productFeel: 'Fast, readable, and product-specific rather than template-like.',
        uiRules: '- No horizontal overflow.\n- Use stable responsive constraints.\n- Preserve focus and hover states.\n- Avoid nested card clutter.',
        accessibility: '- Keep semantic headings.\n- Label form inputs.\n- Maintain contrast and keyboard flow.',
        defaultQaCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
        phases: '1. Build the app shell and core route.\n2. Add typed data flow and reusable components.\n3. Verify responsive behavior.\n4. Add tests around shared logic.\n5. Document behavior and limitations.',
      }
    case 'Phaser game':
      return {
        techStack: '- Vite\n- TypeScript\n- Phaser 3\n- Tiled maps if level design is needed\n- Browser screenshot QA',
        mvpFeatures: '- Build a first playable loop.\n- Include player movement, level bounds, win/fail state, and restart.\n- Add review routes or debug states for visual QA.',
        constraints: '- Keep simulation in Phaser.\n- Keep DOM/React overlays separate from game state.\n- Do not accept placeholder assets without explicit approval.',
        visualDirection: 'Readable gameplay first, with distinct silhouettes, clear HUD hierarchy, and screenshot-reviewed states.',
        assetRules: '- Define sprite sizes, anchors, and animation names.\n- Use review routes before wiring final assets.\n- Avoid placeholder art in screenshots unless clearly labeled for review.',
        gitReleaseNotes: '- Commit gameplay systems separately from asset swaps when practical.\n- Include playtest notes and screenshots in handoff.',
        architectureIntent: 'Use Phaser scenes for simulation and rendering, typed systems for gameplay rules, and isolated UI overlay state where needed.',
        boundaries: '- Phaser scene owns physics, collisions, camera, and sprite lifecycle.\n- UI overlay owns HUD and menus.\n- Asset pipeline owns dimensions, anchors, and naming.\n- Save data stays separate from scene internals.',
        stateRules: '- Keep player/gameplay state deterministic where possible.\n- Avoid hidden global mutable state.\n- Reset scene state cleanly on restart.',
        modules: '- Boot/preload scene\n- Gameplay scene\n- Entity systems\n- HUD overlay\n- Asset manifests\n- Review/debug routes',
        productFeel: 'Game-specific, readable, and responsive. Prioritize clear gameplay feedback over decorative UI.',
        uiRules: '- Protect the playfield.\n- Keep HUD readable at target resolutions.\n- Use consistent iconography and color language.\n- Verify screenshots for overlap.',
        accessibility: '- Provide readable contrast.\n- Avoid relying only on color for gameplay signals.\n- Support keyboard controls and document input.',
        defaultQaCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
        phases: '1. Build the first playable loop.\n2. Add review routes and debug overlays.\n3. Replace placeholder assets after approval.\n4. Tune controls and camera feel.\n5. Capture desktop/mobile screenshots and playtest notes.',
      }
    case 'SpriteKit game':
      return {
        techStack: '- Swift\n- SpriteKit\n- SwiftUI shell where useful\n- XCTest for pure systems',
        mvpFeatures: '- Build a first playable SpriteKit scene.\n- Add input, win/fail state, restart, and simple HUD.\n- Verify simulator screenshots.',
        constraints: '- Keep game simulation separate from SwiftUI shell.\n- Avoid placeholder assets in release-facing screenshots.\n- Keep physics categories documented.',
        visualDirection: 'Native Apple game feel with readable action, stable camera, and clear feedback.',
        assetRules: '- Define texture sizes and anchors.\n- Keep atlases organized.\n- Verify assets in-scene before approval.',
        gitReleaseNotes: '- Include simulator build/test notes.\n- Keep asset commits scoped when practical.',
        architectureIntent: 'Use SpriteKit scenes for gameplay, SwiftUI for shell/menu surfaces, and pure helpers for rules that need tests.',
        boundaries: '- SKScene owns nodes, physics, and camera.\n- SwiftUI owns menus and app navigation.\n- Models/helpers own reusable rules.\n- Asset catalog owns textures and app icons.',
        stateRules: '- Reset scene state explicitly.\n- Keep physics bitmasks documented.\n- Avoid coupling menus to scene internals.',
        modules: '- Game scene\n- Entity nodes\n- Physics/contact handling\n- SwiftUI shell\n- Asset catalog\n- Tests',
        productFeel: 'Responsive, tactile, and readable at device sizes.',
        uiRules: '- Keep HUD outside critical playfield areas.\n- Verify safe areas.\n- Use native controls in shell screens.',
        accessibility: '- Support clear contrast.\n- Provide reduced-motion considerations where relevant.\n- Document input affordances.',
        defaultQaCommands: 'xcodebuild -scheme <Scheme> -destination "platform=iOS Simulator,name=iPhone 17 Pro" build\nxcodebuild test -scheme <Scheme> -destination "platform=iOS Simulator,name=iPhone 17 Pro"',
        phases: '1. Build first scene loop.\n2. Add HUD and restart.\n3. Add asset review screenshots.\n4. Add tests for pure rules.\n5. Prepare device/simulator QA notes.',
      }
    case 'Design/brand project':
      return {
        techStack: '- Figma or design source files\n- Brand asset exports\n- Documentation in Markdown\n- Optional web prototype',
        mvpFeatures: '- Define brand foundations.\n- Create core components or templates.\n- Document usage rules and export requirements.',
        constraints: '- Keep source assets organized.\n- Avoid generic visual systems.\n- Document decisions and rationale.',
        visualDirection: 'Distinctive, consistent, and production-ready brand system with clear usage rules.',
        assetRules: '- Track source files and export sizes.\n- Document color, typography, spacing, and logo rules.\n- Keep review artifacts easy to inspect.',
        gitReleaseNotes: '- Commit docs and export manifests separately from bulky assets when practical.',
        architectureIntent: 'Treat the brand system as structured source assets, reusable components, and documented decisions.',
        boundaries: '- Foundations own color/type/spacing.\n- Components own reusable patterns.\n- Exports own delivery formats.\n- Docs own usage guidance.',
        stateRules: '- Version source and export artifacts clearly.\n- Avoid overwriting approved assets without notes.',
        modules: '- Foundations\n- Components\n- Templates\n- Export manifest\n- Decision log',
        productFeel: 'Specific, high-quality, and coherent across every touchpoint.',
        uiRules: '- Avoid placeholder-looking compositions.\n- Preserve spacing and type hierarchy.\n- Check small-size legibility.',
        accessibility: '- Check contrast.\n- Provide accessible color alternatives.\n- Document minimum sizes.',
        defaultQaCommands: 'npm run build',
        phases: '1. Define foundations.\n2. Build key components/templates.\n3. Export review assets.\n4. Document usage rules.\n5. Prepare delivery notes.',
      }
    case 'Research/investment project':
      return {
        techStack: '- Markdown research notes\n- Source tracking\n- Data tables where needed\n- Optional spreadsheet models',
        mvpFeatures: '- Define research question.\n- Collect cited sources.\n- Track assumptions and open questions.\n- Maintain decision log.',
        constraints: '- Cite sources and dates.\n- Verify freshness for time-sensitive facts.\n- Separate facts, assumptions, and opinions.',
        visualDirection: 'Analytical, dense, and source-forward. Prioritize traceability over decoration.',
        assetRules: '- Store charts/data exports with source and date.\n- Avoid uncited claims in deliverables.',
        gitReleaseNotes: '- Commit research updates with source/date summaries.\n- Note stale data risk in commit body.',
        architectureIntent: 'Structure research into source notes, thesis/decision logs, assumptions, risks, and update cadence.',
        boundaries: '- Sources own raw citations.\n- Analysis owns interpretation.\n- Decisions own actions and rationale.\n- Assumptions own uncertainty.',
        stateRules: '- Label dates clearly.\n- Recheck live data before high-stakes conclusions.\n- Keep source links near claims.',
        modules: '- Source log\n- Thesis notes\n- Assumptions\n- Risk register\n- Decision log',
        productFeel: 'Clear, audit-friendly, and explicit about uncertainty.',
        uiRules: '- Use tables for comparisons.\n- Keep citations visible.\n- Avoid burying assumptions.',
        accessibility: '- Keep charts readable without color-only encoding.\n- Provide text summaries for data visuals.',
        defaultQaCommands: 'git status --short',
        phases: '1. Define research question and scope.\n2. Gather current cited sources.\n3. Separate facts from assumptions.\n4. Draft thesis and risks.\n5. Review freshness and decision implications.',
      }
    case 'Other':
      return {
        techStack: '- Define the runtime\n- Define the primary tools\n- Define verification commands',
        mvpFeatures: '- Define the first useful workflow.\n- Keep the first phase small and verifiable.',
        constraints: '- Preserve scope.\n- Avoid unrelated features.\n- Document unknowns early.',
        visualDirection: 'Project-specific, polished, and free of placeholder-looking output.',
        assetRules: '- Define asset requirements before generating or importing files.',
        gitReleaseNotes: '- Keep commits scoped.\n- Include verification in handoff.',
        architectureIntent: 'Define clear boundaries before implementation and keep the first phase reversible.',
        boundaries: '- UI/presentation boundary\n- Data/storage boundary\n- Domain logic boundary\n- Verification boundary',
        stateRules: '- Keep ownership explicit.\n- Avoid global mutable state until a real need exists.',
        modules: '- App/workflow shell\n- Domain logic\n- Persistence or source data\n- Tests/docs',
        productFeel: 'Specific to the project, polished, and useful from the first screen or artifact.',
        uiRules: '- Keep hierarchy clear.\n- Avoid placeholders.\n- Verify responsive or target-format output.',
        accessibility: '- Preserve readable contrast and clear labels.',
        defaultQaCommands: 'npm run lint\nnpm test\nnpm run typecheck\nnpm run build',
        phases: '1. Define scope and first workflow.\n2. Build the smallest coherent implementation.\n3. Verify and document behavior.\n4. Capture decisions and lessons.\n5. Prepare next phase.',
      }
  }
}
