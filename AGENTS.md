# Codex Working Rules

## Product Intent

PerpetualBrain is a structured AI context system. Preserve the distinction between project memory, standards, decisions, lessons, prompts, and generated context bundles. Do not flatten the product into a generic notes interface.

## Implementation Rules

- Keep TypeScript strict and do not relax compiler settings to hide errors.
- Keep persistence behind `BrainStorage`.
- Prefer `ApiBrainStorage` for real local persistence and preserve `LocalStorageBrainStorage` only as fallback/demo mode.
- Keep Markdown files as the primary portable data format.
- Server writes must stay inside `/brain`, allow only `.md`, reject path traversal, and validate API input with Zod.
- Do not bypass the storage adapter from pages. Use provider actions for save, create, delete, reload, and project creation.
- Preserve browser/dev-server support when changing Electron. `npm run dev`, `npm run dev:web`, and `npm run dev:api` must keep working.
- Keep Electron secure: `contextIsolation: true`, `nodeIntegration: false`, sandboxed renderer, no remote module, and no arbitrary filesystem access from the renderer.
- Electron main may start or connect to the local API, but the renderer should continue using `ApiBrainStorage` and the existing `/api` routes.
- Packaged Electron builds must use a writable brain folder and must not overwrite existing user brain files when seeding.
- Custom brain folder selection is Electron-only. Keep it behind a minimal preload bridge; do not expose raw filesystem APIs to the renderer.
- When changing folder-selection behavior, preserve safe fallback to the default brain folder if the saved path is missing.
- Git integration must remain lightweight and local: status/init only, no automatic commits, pushes, pulls, remotes, or arbitrary Git arguments.
- Run Git with `execFile` or equivalent safe APIs scoped to the active brain root; never build shell command strings from user input.
- Backup import/export must remain Electron-only behind narrow preload methods. Do not expose generic filesystem APIs to the renderer.
- Backup ZIP import must reject path traversal and `.git` internals, extract into a new folder, and never overwrite the active brain silently.
- Context presets are local/offline prompt generation only. Do not add external AI API calls for preset generation.
- Keep context preset generation and history formatting in `src/utils/contextBundle.ts`; pages should wire inputs and provider actions, not embed large prompt templates.
- Keep production metadata in `package.json` current for Electron releases: product name, app id, description, author, version, copyright, category, and icon path.
- Regenerate app icons with `npm run icons:generate` after changing `scripts/generate-icons.py` or icon source assets.
- Keep parser and bundle logic in `src/utils` instead of embedding it in page components.
- Use reusable components from `src/components` for buttons, cards, badges, Markdown rendering, copy actions, and empty states.
- Keep UI dense, polished, dark-mode first, and devtool-oriented.

## Verification

Before handing off changes, run the smallest relevant checks:

```bash
npm run build
npm test
npm run typecheck
```

For file persistence changes, run `npm run dev` and manually verify disk writes in `/brain`.

For Electron changes, also run `npm run electron:compile` and verify `npm run electron:dev` opens the app in file-backed mode.

For release packaging changes, run `npm run dist:mac` and inspect the resulting `release/` artifacts.

For custom brain folder changes, verify selecting an empty folder, selecting an existing brain folder, resetting to default, and relaunching Electron with the saved folder.

For Git/versioning changes, verify non-Git folders, Git repo folders, changed Markdown files, copied command text, and browser fallback behavior.

For backup/import changes, verify export ZIP contents, `.git` exclusion, import into a new folder, browser-disabled behavior, and Markdown saves after import.

For context preset changes, verify preset-specific output, CODEX_CONTEXT.md export, CONTEXT_HISTORY.md append, copy behavior, search visibility, and mobile no-overflow.

## Scope

When implementing future phases, keep work scoped to the requested workflow. Avoid broad rewrites unless storage or routing boundaries make them necessary.
