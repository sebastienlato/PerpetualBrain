# PerpetualBrain

PerpetualBrain is a local-first AI Second Brain / Open Brain command center for working with Codex, Claude, ChatGPT, and other coding assistants. It keeps project memory, standards, decisions, lessons, prompts, and reusable context bundles in a structured Markdown-first system.

The app is intentionally not a generic notes app. It is organized around the context an AI coding agent needs to work well: project summaries, architecture, design rules, coding standards, active tasks, known issues, decision logs, lessons learned, prompt templates, and copy-ready handoff bundles.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Express local API
- Zod API validation
- Markdown files under `/brain` as the source of truth
- Browser localStorage fallback when the API is unavailable

## Run Locally

```bash
npm install
npm run dev
```

`npm run dev` starts the local file API and Vite frontend together.

Useful split commands:

```bash
npm run dev:api
npm run dev:web
```

## Quality Checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

## Storage Behavior

The app prefers file-system mode:

1. Frontend calls `/api/health`.
2. If the local API is available, `ApiBrainStorage` reads and writes Markdown files in `/brain`.
3. If the API is unavailable, the app shows a fallback banner and uses `LocalStorageBrainStorage`.

In file-system mode, editor saves, project creation, file creation, file deletion, and Context Builder exports write to disk.

## API Routes

- `GET /api/health`
- `GET /api/brain/tree`
- `GET /api/brain/file?path=brain/projects/example-project/PROJECT.md`
- `PUT /api/brain/file`
- `POST /api/brain/file`
- `POST /api/brain/project`
- `DELETE /api/brain/file?path=brain/projects/example-project/TODO.md`

All write paths are validated server-side. The API only permits `.md` files inside `/brain` and rejects path traversal and binary content.

## What Is Included

- Dashboard with active projects, recent files, pinned prompts, recent decisions, and bundle entry points
- `/brain` Markdown structure with realistic seed content
- ShadowSpire example project
- Project pages with summary, tech stack, status, files, tasks, issues, decisions, lessons, and Codex readiness
- Markdown editor with edit/preview modes, disk-backed save flow, delete confirmation, and copy buttons
- Search across latest loaded brain content
- Prompt library with editable/copyable reusable prompts
- Decision log parsed from project Markdown tables
- Lessons page for recurring project-specific rules
- Context Bundle Generator with `CODEX_CONTEXT.md` export
- Global standards and templates pages
- Settings page with storage mode, reload from disk, and fallback reset
- Vitest coverage for search, bundle generation, path safety, and file-backed storage

## Brain Folder

The knowledge base lives here:

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

## Known Limitation

This is a local development app. The file API is intentionally bound to `127.0.0.1` and is meant for trusted local use against this repo’s `/brain` directory.
