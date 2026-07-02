# PerpetualBrain

PerpetualBrain is a local-first AI Second Brain / Open Brain command center for working with Codex, Claude, ChatGPT, and other coding assistants. It keeps project memory, standards, decisions, lessons, prompts, and reusable context bundles in a structured Markdown-first system.

The app is intentionally not a generic notes app. It is organized around the context an AI coding agent needs to work well: project summaries, architecture, design rules, coding standards, active tasks, known issues, decision logs, lessons learned, prompt templates, and copy-ready handoff bundles.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Markdown source files under `/brain`
- Browser localStorage persistence for Phase 1
- Storage adapter boundary for future Electron or Node-backed file writes

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Quality Checks

```bash
npm run build
npm test
npm run lint
```

## What Is Included

- Dashboard with active projects, recent files, pinned prompts, recent decisions, and bundle entry points
- `/brain` Markdown structure with realistic seed content
- ShadowSpire example project
- Project pages with summary, tech stack, status, files, tasks, issues, decisions, lessons, and Codex readiness
- Markdown editor with edit/preview modes, save flow, and copy buttons
- Search across title, content, tags, project paths, prompts, decisions, and templates
- Prompt library with editable/copyable reusable prompts
- Decision log parsed from project Markdown tables
- Lessons page for recurring project-specific rules
- Context Bundle Generator for copy-ready Codex context
- Global standards and templates pages
- Settings page with local seed reset
- Basic Vitest coverage for search and bundle generation

## Brain Folder

The seeded knowledge base lives here:

```text
brain/
  projects/
    example-project/
      PROJECT.md
      ARCHITECTURE.md
      DESIGN_RULES.md
      CODEX_CONTEXT.md
      DECISIONS.md
      TODO.md
      LESSONS.md
  global/
    CODING_STANDARDS.md
    DESIGN_STANDARDS.md
    ASSET_RULES.md
    CODEX_WORKFLOW.md
    PROMPT_LIBRARY.md
  templates/
    PROJECT_TEMPLATE.md
    CODEX_KICKOFF_TEMPLATE.md
    PHASE_HANDOFF_TEMPLATE.md
    BUG_REPORT_TEMPLATE.md
```

Vite imports these files as raw Markdown on first load. Edits made in the app are persisted to browser localStorage in Phase 1.

## Phase 1 Storage Limitation

Browser-only Vite apps cannot write directly to arbitrary local files without using browser file-picker APIs or a local backend. This implementation keeps Markdown as the seed source of truth and provides:

- `LocalStorageBrainStorage` as the active Phase 1 adapter
- `FileSystemBrainStorage` as the explicit placeholder for an Electron or Node-backed adapter

The UI and domain logic depend on the `BrainStorage` interface, so later file-system persistence can be added without rewriting pages.

## Recommended Next Phase

Add a Node or Electron-backed file adapter that reads and writes the `/brain` Markdown files directly, then add project creation from templates without requiring browser prompts.
