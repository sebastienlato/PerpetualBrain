# Coding Standards

## Scope
Keep changes tightly scoped to the requested behavior. Avoid opportunistic refactors unless they remove immediate risk or are required by the implementation.

## TypeScript
- Use strict types and narrow interfaces at boundaries.
- Prefer pure helpers for parsing, formatting, and transformation logic.
- Keep React components focused on presentation and user interaction.
- Model persistence behind adapters so storage can change without reshaping UI code.

## Verification
- Run the smallest meaningful check before reporting completion.
- For visual work, include screenshot or browser verification when feasible.
- Report checks that could not be run.

## Reviews
When reviewing code, list findings first with file and line references, then summarize only after the risks are clear.
