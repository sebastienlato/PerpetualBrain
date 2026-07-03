# Context Presets

These presets define the operating style for AI-ready Codex context bundles. They are intentionally local, editable Markdown guidance. The app uses built-in preset structure for reliable generation and includes this file as extra guidance in generated bundles.

## Shared Codex Rules

- Work in clear phases.
- Keep scope tight and do not drift into later phases.
- Preserve existing behavior unless explicitly asked to change it.
- Do not change storage, Electron, backup, Git, or persistence behavior unless the phase asks for it.
- Do not accept placeholder-looking UI for visual work.
- Prefer existing project patterns over new abstractions.
- Run the requested verification commands.
- Report files changed, verification results, known limitations, and git add / git commit commands.

## New Project Kickoff

Use this when starting a new local-first app, tool, game, or structured project. The bundle should give Codex enough context to create the first usable slice without overbuilding. Include product intent, first workflow, stack constraints, seed structure, and verification commands.

## Continue Existing Project

Use this to resume work after a previous phase. Include current status, relevant files, recent decisions, known issues, the current goal, acceptance criteria, verification commands, and explicit instructions to preserve existing behavior.

## Phase Implementation

Use this when a phase has a strict boundary. Repeat what is in scope and what is out of scope. Tell Codex to stop after the requested phase and avoid future-phase work.

## Bug Fix

Use this for a narrow defect. Include problem summary, expected behavior, current behavior, reproduction steps, constraints, debugging instructions, acceptance criteria, and verification commands. Do not add unrelated features.

## Visual Polish Pass

Use this when the priority is UI quality. Include visual direction, screens to review, design rules, things not to change, quality bar, screenshot or manual QA requirements, and mobile no-overflow checks.

## Refactor Pass

Use this when reducing complexity while preserving behavior. Include behavior to preserve, current architecture, relevant files, testing strategy, and rollback risks. Do not rewrite broad areas unless required.

## QA / Verification Pass

Use this for structured testing. Ask for findings first, ordered by severity, then residual risk and verification summary. Include exact commands and manual routes/screens to inspect.

## Release Prep

Use this when preparing a build or desktop package. Include release commands, docs updates, packaging outputs, install/open checks, known limitations, and rollback risks.

## Asset Generation Pass

Use this for visual or media assets. Include naming, dimensions, intended usage, review requirements, screenshots, and approval gates before production wiring.

## Documentation Update

Use this when docs need to match implementation. Tell Codex to verify commands, paths, storage behavior, and known limitations. Avoid runtime behavior changes.

## Git Commit Summary

Use this after implementation. Ask for changed files, concise commit subject, commit body bullets, verification results, known limitations, and exact git add / git commit commands.
