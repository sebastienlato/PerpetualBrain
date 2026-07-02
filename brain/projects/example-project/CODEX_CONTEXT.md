# Codex Context for ShadowSpire

## Working Agreement
Implement one phase at a time. Keep gameplay, UI, and asset-pipeline changes scoped to the current phase. Do not introduce broad architecture changes when fixing a concrete bug.

## Preferred Workflow
1. Read the relevant scene and system files before editing.
2. Make the smallest coherent implementation.
3. Run `npm run build`.
4. Verify the playable screen with screenshots when the change is visual.
5. Report files changed, checks run, known limitations, and next phase.

## Recurring Instructions
- Do not accept placeholder visuals as final.
- Do not hide broken states behind loading screens.
- Keep review routes available for every major scene.
- Prefer typed pure helpers over scene-global mutable state.
