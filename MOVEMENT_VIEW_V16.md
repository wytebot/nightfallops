# v16 — game speed, poses/walking, location view, animations

## Game speed / performance (`src/game.ts`)
- Player base speed 190 -> 215 and sprint 1.4x -> 1.5x (`PLAYER_BASE_SPEED`, `SPRINT_MULTIPLIER` at top of file; tune freely).
- Off-screen soldiers skip all pose/animation work (cover collision still runs for everyone).
- Cover collision does a cheap box reject before `Math.hypot`.
- Bullet-vs-enemy / player / squad hit tests use squared distance (no `sqrt`).
- Life bars redraw only when the displayed value changes.
- Night-light render texture is only redrawn when the player/camera/aim actually moved (still refreshed at least every 400 ms).
- Physics fixed at 60 Hz, `fps.smoothStep` enabled.

## Poses and walking
- Legs are now two hip-pivoted legs that alternate (swing + foot lift + knee-ish shortening) inside an upright leg rig, replacing the single rotating stick pair.
- Stride rate scales with real speed (sprint looks faster); legs ease back to rest when stopping.
- Torso bobs on each footstep, leans into the direction of travel, sways slightly, and "breathes" when idle.
- Firing pose: weapon raised, recoil kick on gun and body, brief additive muzzle flash (player, squad and enemies).
- Reload pose: weapon lowered and tilted (player).
- Fixed: the held gun used to get the container's aim rotation applied twice (world angle 2x aim); it now follows the aim exactly.
- Removed an old infinite tween that fought the leg animation.

## Location view
- Every map gets a baked, seamless ground-detail tile (grass blades / rock chips / wet streaks / ash flecks) on one tileSprite.
- Drifting ground-fog layer (parallax, per-location tint and density) and a subtle per-location colour grade; both resize with the window.
- The 10 location illustrations in `public/locations/*.svg` (menu, briefing, loading) were redrawn with layered ridges, moon/stars, lit buildings, tents + campfire, river reflections, flooded houses, giant redwoods, dead trees, rain/snow/embers and fog.

## Other
- `index.html` was 0 bytes in the v15 zip; restored the standard Vite entry file.

## Not verified here
`tsc -b && vite build` and on-device play could not be run (no node_modules, no network). `game.ts` parses cleanly and `check-catalog` / `validate-assets` pass. Test on a real device, especially frame time with many enemies and the new fog/ground layers.
