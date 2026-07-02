# ShadowSpire

## Summary
ShadowSpire is a Phaser dark fantasy wizard platformer where the player climbs a cursed tower, collects spell sigils, and unlocks traversal magic while avoiding hostile spirits and collapsing platforms.

## Tech Stack
- Vite
- TypeScript
- Phaser 3
- Tiled maps
- Local JSON save data
- Browser-first QA with screenshots

## Current Status
Phase 2 is in progress. The prototype has player movement, a test level, basic spell pickup state, and a rough HUD. The next milestone is to replace placeholder art and validate combat readability.

## Important Files
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/LevelScene.ts`
- `src/game/systems/PlayerController.ts`
- `src/game/systems/SpellInventory.ts`
- `src/ui/HudOverlay.tsx`
- `public/assets/levels/spire-entry.tmj`

## Visual Direction
Use sharp silhouettes, cold moonlit stone, readable spell colors, and restrained particle effects. The world should feel threatening but still support instant gameplay scanning.

## Active Tasks
- Replace placeholder player sprite with screenshot-approved wizard run and idle animations.
- Add a review route for the first playable level.
- Tune jump forgiveness and coyote time.
- Document asset naming conventions before importing the next sprite batch.

## Known Issues
- HUD spell icons compete with enemy projectile colors.
- Level restart can leave stale spell pickup state.
- Camera easing feels heavy during vertical jumps.

## Acceptance Criteria
- `npm run build` succeeds.
- Desktop and mobile screenshots show the full HUD without overlap.
- Player, hazards, pickups, and exit portal are visually distinct.
- Phase handoff includes QA notes and remaining risks.

## Tags
game, phaser, dark-fantasy, platformer, ui-polish
