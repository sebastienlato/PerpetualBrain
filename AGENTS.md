# Codex Working Rules

## Product Intent

PerpetualBrain is a structured AI context system. Preserve the distinction between project memory, standards, decisions, lessons, prompts, and generated context bundles. Do not flatten the product into a generic notes interface.

## Implementation Rules

- Keep TypeScript strict and do not relax compiler settings to hide errors.
- Keep persistence behind `BrainStorage`.
- Keep Markdown files as the primary portable data format.
- Keep parser and bundle logic in `src/utils` instead of embedding it in page components.
- Use reusable components from `src/components` for buttons, cards, badges, Markdown rendering, copy actions, and empty states.
- Keep UI dense, polished, dark-mode first, and devtool-oriented.

## Verification

Before handing off changes, run the smallest relevant checks:

```bash
npm run build
npm test
```

For visual changes, start the Vite dev server and inspect the affected routes in a browser.

## Scope

When implementing future phases, keep work scoped to the requested workflow. Avoid broad rewrites unless storage or routing boundaries make them necessary.
