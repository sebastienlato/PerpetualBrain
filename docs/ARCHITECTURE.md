# PerpetualBrain Architecture

## Overview

PerpetualBrain is a Vite React app that imports Markdown files from `/brain`, turns them into typed `BrainFile` records, and exposes them through a storage adapter. Pages compose those records into project views, logs, search results, prompt cards, and Codex context bundles.

## Data Flow

1. Markdown seed files live under `/brain`.
2. `src/data/seedBrain.ts` imports all Markdown files with `import.meta.glob`.
3. `LocalStorageBrainStorage` seeds localStorage on first load.
4. `BrainProvider` exposes files, projects, save/create/reset actions, loading state, and errors.
5. Pages use domain utilities in `src/utils` to parse project sections, decisions, prompts, search results, and context bundles.

## Key Directories

```text
src/components/   Reusable UI primitives and shared controls
src/data/         Seed Markdown import and classification
src/hooks/        Brain provider and app-level state
src/layout/       Sidebar shell and routed outlet
src/pages/        Product workflows and screens
src/storage/      Storage interface and adapters
src/types/        Shared domain types
src/utils/        Markdown parsing, search, bundle generation, copy helpers
src/test/         Test fixtures
brain/            Portable Markdown knowledge base
docs/             Project documentation
```

## Storage Boundary

`BrainStorage` is the core persistence boundary:

```ts
interface BrainStorage {
  listFiles(): Promise<BrainFile[]>
  getFile(id: string): Promise<BrainFile | undefined>
  saveFile(file: BrainFile): Promise<BrainFile>
  createFile(input: Pick<BrainFile, 'path' | 'title' | 'kind' | 'category' | 'content' | 'projectId'>): Promise<BrainFile>
  resetToSeed(): Promise<BrainFile[]>
}
```

Phase 1 uses `LocalStorageBrainStorage`. A future desktop build should implement `FileSystemBrainStorage` with direct Markdown reads and writes.

## Context Bundle Generation

`src/utils/contextBundle.ts` creates the copy-ready Codex bundle from:

- Selected project
- Selected Markdown files
- Project architecture
- Project design rules
- Global coding standards
- Global design standards
- Known issues
- Acceptance criteria
- Project Codex instructions
- Optional prompt template

The generated output intentionally uses plain Markdown headings so it can be pasted into Codex without formatting loss.
