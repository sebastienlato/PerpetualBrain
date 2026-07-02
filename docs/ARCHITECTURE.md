# PerpetualBrain Architecture

## Overview

PerpetualBrain is a Vite React app backed by a small local Express API. Markdown files in `/brain` are the source of truth when the API is running. The browser app talks to the API through `ApiBrainStorage`; if the API is unavailable, it falls back to `LocalStorageBrainStorage` and shows a clear banner.

## Data Flow

1. Markdown files live under `/brain`.
2. `server/storage/FileSystemBrainStorage.ts` walks the brain tree and converts Markdown files into typed `BrainFile` records.
3. `server/index.ts` exposes validated `/api` routes for tree reads, file reads, writes, creates, deletes, and project creation.
4. `BrainProvider` probes `/api/health`, selects `ApiBrainStorage` or `LocalStorageBrainStorage`, then exposes storage actions to pages.
5. Pages use provider actions and domain utilities in `src/utils` to parse project sections, decisions, prompts, search results, and context bundles.

## Key Directories

```text
server/           Local Express API and file-system storage
src/components/   Reusable UI primitives and shared controls
src/data/         Browser seed Markdown import for fallback mode
src/hooks/        Brain provider and app-level storage mode state
src/layout/       Sidebar shell and routed outlet
src/pages/        Product workflows and screens
src/storage/      Frontend storage interface and adapters
src/types/        Shared domain types
src/utils/        Markdown parsing, search, bundle generation, copy helpers
src/test/         Test fixtures
brain/            Portable Markdown knowledge base
docs/             Project documentation
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

## API Routes

- `GET /api/health`
- `GET /api/brain/tree`
- `GET /api/brain/file?path=...`
- `PUT /api/brain/file`
- `POST /api/brain/file`
- `POST /api/brain/project`
- `DELETE /api/brain/file?path=...`

## File Safety

The server validates all write inputs with Zod and normalizes paths through `server/utils/brainPath.ts`.

Rules:

- Paths must resolve inside `/brain`.
- Only `.md` files are accepted.
- Path traversal segments are rejected.
- Binary content with null bytes is rejected.
- Project slugs are normalized before folder creation.

## Context Bundle Generation

`src/utils/contextBundle.ts` creates the copy-ready Codex bundle from selected project memory, global standards, known issues, acceptance criteria, project Codex instructions, and optional prompt templates.

The Context Builder can also export the generated bundle directly to:

```text
brain/projects/<project-slug>/CODEX_CONTEXT.md
```
