# PerpetualBrain Architecture

## Overview

PerpetualBrain is a Vite React app backed by a small local Express API. Markdown files in `/brain` are the source of truth when the API is running. The browser app talks to the API through `ApiBrainStorage`; if the API is unavailable, it falls back to `LocalStorageBrainStorage` and shows a clear banner.

Electron is an additional desktop runtime. It hosts the same built Vite frontend, starts or connects to the same local API, and keeps the renderer on the existing storage adapter boundary.

## Data Flow

1. Markdown files live under `/brain`.
2. `server/storage/FileSystemBrainStorage.ts` walks the brain tree and converts Markdown files into typed `BrainFile` records.
3. `server/app.ts` creates the Express API and `server/index.ts` starts it for browser development.
4. `BrainProvider` probes `/api/health`, selects `ApiBrainStorage` or `LocalStorageBrainStorage`, then exposes storage actions to pages.
5. Pages use provider actions and domain utilities in `src/utils` to parse project sections, decisions, prompts, search results, and context bundles.

In Electron:

1. `electron/main.ts` resolves the active brain root.
2. Electron starts `createApiApp({ getBrainRoot })` on `127.0.0.1`.
3. `electron/preload.cjs` exposes only the API base URL, platform metadata, folder selection actions, and backup import/export actions.
4. The renderer uses the same `ApiBrainStorage` and `/api` routes as browser mode.

## Key Directories

```text
electron/        Electron main and preload entrypoints
server/           Local Express API and file-system storage
src/components/   Reusable UI primitives and shared controls
src/data/         Browser seed Markdown import for fallback mode
src/hooks/        Brain provider and app-level storage mode state
src/layout/       Sidebar shell and routed outlet
src/pages/        Product workflows and screens
src/storage/      Frontend storage interface and adapters
src/types/        Shared domain types
src/utils/        Markdown parsing, search, bundle generation, project intake, copy helpers
src/test/         Test fixtures
brain/            Portable Markdown knowledge base
docs/             Project documentation
dist-electron/    Generated Electron build output
build/            Release icon source assets and generated macOS icon files
scripts/          Release helper scripts such as icon generation
```

## Storage Boundary

`BrainStorage` is the frontend persistence boundary:

```ts
interface BrainStorage {
  listFiles(): Promise<BrainFile[]>
  getFile(id: string): Promise<BrainFile | undefined>
  saveFile(file: BrainFile): Promise<BrainFile>
  createFile(input: CreateBrainFileInput): Promise<BrainFile>
  createProject(input: CreateProjectInput): Promise<CreateProjectResult>
  deleteFile(file: BrainFile): Promise<void>
  resetToSeed(): Promise<BrainFile[]>
}
```

`ApiBrainStorage` is preferred. `LocalStorageBrainStorage` remains a fallback if the backend is unavailable.

## Electron Runtime

The desktop app uses a secure Electron shell:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- no remote module
- minimal preload bridge
- external links opened through the system browser

Development loads the Vite dev server and uses the repo-local `brain/` folder by default. Production loads `dist/index.html` from the packaged app and uses a writable user data brain folder by default.

Release metadata lives in `package.json`:

- product name: `PerpetualBrain`
- app id: `com.latodev.perpetualbrain`
- version: `0.1.0`
- macOS category: `public.app-category.productivity`
- macOS icon: `build/icon.icns`

## Desktop Brain Seeding

The packaged app includes the repo `brain/` folder as `brain-seed` through `electron-builder` `extraResources`.

On first packaged launch:

1. Electron resolves `app.getPath('userData')/brain`.
2. If that folder does not exist, the bundled `brain-seed` is copied into it.
3. If the folder already exists, the seed copy is skipped so user files are not overwritten.

On macOS, the default packaged location is:

```text
~/Library/Application Support/PerpetualBrain/brain
```

The API reports this path through `GET /api/health`, and Settings displays it when file-system mode is active.

## Custom Brain Folders

Electron desktop mode supports selecting a custom brain folder from Settings. Browser mode does not expose this capability.

Security model:

- The renderer calls a minimal preload bridge method: `chooseBrainFolder()`.
- Electron main opens the native macOS folder picker.
- Electron main validates the selected folder and persists the selected path.
- The renderer never receives arbitrary filesystem primitives.
- The API continues to validate every read/write path against the active brain root.

The selected folder is stored in:

```text
~/Library/Application Support/PerpetualBrain/settings.json
```

On startup, Electron loads that settings file. If the saved folder exists, it becomes the active brain root. If it was deleted or moved, Electron falls back to the default Application Support brain folder and reports that fallback through `/api/health`.

Folder initialization:

- Empty folder: the user can initialize it with seed brain files, use it empty, or cancel.
- Existing brain folder: folders containing `projects`, `global`, `templates`, or root Markdown files are used without overwriting.
- Mixed folder: Electron warns that the folder does not look like a brain folder and asks for confirmation.
- Existing user files are never overwritten when seed files are copied.

Recommended operating model: use a Git-tracked folder as the custom brain root so Markdown changes are versioned outside the app.

## Desktop Commands

```bash
npm run icons:generate
npm run electron:dev
npm run electron:compile
npm run electron:pack
npm run electron:build
npm run dist:mac
```

`electron:pack` creates an unpacked app under `release/`. `dist:mac` creates macOS distributables under `release/`.

## Icon Pipeline

`scripts/generate-icons.py` creates the app icon assets from a deterministic Pillow drawing:

- `build/icon.png` is the 1024x1024 source icon.
- `build/icon-512.png` and `build/icon-256.png` are PNG fallbacks.
- `build/icon.iconset/` contains the macOS iconset sizes.
- `build/icon.icns` is generated with macOS `iconutil` and consumed by electron-builder.

The icon uses the same black surface and cyan to violet to magenta to orange edge language as the app UI. Regenerate icons with `npm run icons:generate` before release packaging if the artwork changes.

## API Routes

- `GET /api/health`
- `GET /api/brain/tree`
- `GET /api/brain/file?path=...`
- `PUT /api/brain/file`
- `POST /api/brain/file`
- `POST /api/brain/project`
- `DELETE /api/brain/file?path=...`
- `GET /api/git/status`
- `POST /api/git/init`
- `GET /api/git/diff-summary`

## File Safety

The server validates all write inputs with Zod and normalizes paths through `server/utils/brainPath.ts`.

Rules:

- Paths must resolve inside `/brain`.
- Only `.md` files are accepted.
- Path traversal segments are rejected.
- Binary content with null bytes is rejected.
- Project slugs are normalized before folder creation.

## Git Status Boundary

`server/utils/gitStatus.ts` owns lightweight Git awareness for the active brain folder. It uses `child_process.execFile` with `cwd` set to the active brain root and a short timeout. It never executes raw shell strings and does not accept arbitrary Git commands from the renderer.

Allowed backend commands:

- `git --version`
- `git rev-parse --is-inside-work-tree`
- `git status --porcelain=v1 -b -uall -- .`
- `git diff --shortstat -- .`
- `git init`

The app does not run:

- `git commit`
- `git push`
- `git pull`
- remote configuration
- arbitrary user-provided Git arguments

Settings shows branch/status information and copies suggested commit commands for the user to run manually. If Git is unavailable, the API returns a graceful status object instead of throwing to the renderer. If the active folder is not a Git repo, the app can initialize one after explicit confirmation and creates `.gitignore` only when missing.

## Backup Boundary

`server/utils/brainBackup.ts` owns ZIP backup filtering, archive creation, ZIP entry validation, and safe extraction. Electron main owns native dialogs and active brain switching.

Preload exposes only these backup methods:

- `exportBrainBackup()`
- `importBrainBackup()`

The renderer does not receive generic filesystem APIs or arbitrary path access.

Export rules:

- Walk only the active brain root.
- Include `.md`, `.txt`, `.json`, and `.gitignore`.
- Exclude `.git`, `node_modules`, `.DS_Store`, temp files, unsupported binary files, and files over the per-file backup limit.
- Create the ZIP at the path selected by the native save dialog.

Import rules:

- Load a user-selected ZIP from the native open dialog.
- Validate entry names before extraction.
- Reject zip-slip/path traversal, absolute paths, Windows drive paths, null bytes, and `.git` internals.
- Import only `.md`, `.txt`, `.json`, and `.gitignore`.
- Ignore unsupported files and report them in the result.
- Extract into a new timestamped folder under `~/Library/Application Support/PerpetualBrain/brain-imports/`.
- Switch the active brain root only after user confirmation.
- Never overwrite the current active brain folder silently.

Backups are portable snapshots. Git remains the recommended primary versioning and history workflow.

## Context Bundle Generation

`src/utils/contextBundle.ts` creates copy-ready Codex bundles from selected project memory, global standards, known issues, acceptance criteria, project Codex instructions, optional prompt templates, and a workflow preset.

Built-in presets:

- New Project Kickoff
- Continue Existing Project
- Phase Implementation
- Bug Fix
- Visual Polish Pass
- Refactor Pass
- QA / Verification Pass
- Release Prep
- Asset Generation Pass
- Documentation Update
- Git Commit Summary

The executable preset definitions live in `src/utils/contextBundle.ts` so generation is deterministic and testable. Editable operating guidance lives in:

```text
brain/global/CONTEXT_PRESETS.md
```

The generated bundle includes the selected preset, user-entered goal/problem/acceptance/verification fields, selected file content, global preset guidance, and a selected prompt template when present. This is local prompt generation only; PerpetualBrain does not call external AI APIs.

The Context Builder can also export the generated bundle directly to:

```text
brain/projects/<project-slug>/CODEX_CONTEXT.md
```

On export, the app appends a concise history entry to:

```text
brain/projects/<project-slug>/CONTEXT_HISTORY.md
```

The history entry records timestamp, preset, goal, selected files, acceptance criteria, verification commands, and bundle length. It is appended through the existing `BrainStorage` provider actions and does not overwrite previous history.

## Project Intake Generation

`src/utils/projectIntake.ts` owns deterministic Project Intake Wizard generation. It accepts typed wizard answers and returns the Markdown files to create. The page layer previews those generated files, blocks existing project slugs by default, then writes files through `BrainProvider.createFile`.

The wizard does not call external AI APIs and does not bypass the storage adapter. Browser mode uses the same provider boundary, so file-system mode writes through `ApiBrainStorage` and fallback mode writes to `LocalStorageBrainStorage`.

Supported project types:

- iOS app
- Electron app
- Web app
- Phaser game
- SpriteKit game
- Design/brand project
- Research/investment project
- Other

Each type supplies default stack guidance, architecture boundaries, QA commands, asset rules, accessibility expectations, and phase guidance. Examples include secure Electron preload rules, Phaser review-route and screenshot QA guidance, SwiftUI/SwiftData expectations, and research source/freshness rules.

Wizard-created projects write:

```text
brain/projects/<project-slug>/PROJECT.md
brain/projects/<project-slug>/ARCHITECTURE.md
brain/projects/<project-slug>/DESIGN_RULES.md
brain/projects/<project-slug>/CODEX_CONTEXT.md
brain/projects/<project-slug>/DECISIONS.md
brain/projects/<project-slug>/TODO.md
brain/projects/<project-slug>/LESSONS.md
brain/projects/<project-slug>/CONTEXT_HISTORY.md
brain/projects/<project-slug>/KICKOFF_PROMPT.md
```

`KICKOFF_PROMPT.md` is surfaced on the project detail page with a copy action so the generated project can immediately start a scoped Codex implementation session. Because the files are normal Markdown under the project folder, Search and Context Builder can use them immediately after creation.

## Known Limitations

- Desktop notarization is not configured yet.
- Backup import/export is desktop-only.
- Backup import does not import `.git` history or unsupported binary attachments.
- Git integration is status/init/copy-only; commits, pushes, pulls, and remotes remain manual.
- Context presets are local/offline prompt generation only; no external AI API calls are made.
- Project Intake Wizard blocks slug collisions rather than merging with or overwriting existing project folders.
