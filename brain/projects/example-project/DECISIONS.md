# ShadowSpire Decision Log

| Date | Decision | Reason | Impact | Related Files | Status |
| --- | --- | --- | --- | --- | --- |
| 2026-06-20 | Use Phaser for simulation and React for overlays. | Phaser is strong for tile collision while React keeps UI iteration fast. | Requires a typed state bridge between game and UI. | `src/game`, `src/ui` | active |
| 2026-06-22 | Require screenshot approval before wiring generated sprite assets. | Previous asset batches caused inconsistent scale and anchor drift. | Adds a review step before runtime integration. | `public/assets/sprites` | active |
| 2026-06-24 | Keep review routes for level, HUD, and animation states. | Codex can validate visual regressions faster with direct routes. | Slightly more routing code, much better QA. | `src/routes/review` | active |
| 2026-06-27 | Use local JSON saves for Phase 1 and Phase 2. | Cloud save is unnecessary for the prototype. | Save schema must remain small and migration-friendly. | `src/game/save` | active |
