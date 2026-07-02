# ShadowSpire Architecture

## Runtime Boundaries
Phaser owns simulation, collision, camera, and scene lifecycle. React owns menus, overlays, settings, and developer review routes. Shared state crosses the boundary through small typed adapters instead of direct component access to Phaser objects.

## Scene Flow
1. `BootScene` loads minimal boot assets and registers constants.
2. `PreloadScene` loads level, sprite, audio, and UI assets.
3. `LevelScene` creates tile layers, actors, spell pickups, triggers, and debug hooks.
4. React overlays subscribe to lightweight game state snapshots.

## State Rules
- Player input state resets on every scene restart.
- Persistent progress is serializable JSON.
- Scene systems should expose explicit reset methods.
- UI state must not mutate Phaser entities directly.

## Testing Strategy
- Typecheck and production build on every phase.
- Use browser screenshots for HUD and level readability.
- Keep small pure helpers for inventory, damage, and unlock logic.
