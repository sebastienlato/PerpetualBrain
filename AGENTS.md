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

## Scope

When implementing future phases, keep work scoped to the requested workflow. Avoid broad rewrites unless storage or routing boundaries make them necessary.
