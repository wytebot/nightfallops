# V18 – Shooting motions (soldier, partners/army, enemies, bosses)
Four-beat cycle from the reference sheet, driven by `src/shotPose.ts` (timing) and `src/shotCycle.ts` (visuals):
1. AIM – rifle raised, torso leans into the sight line (holds ~0.7 s after a shot, then relaxes)
2. FIRE (0–55 ms) – starburst muzzle flash + smoke puff, rifle punches forward
3. RECOIL (55–170 ms) – rifle kicks back/up, body jolts back with a tilt and squash, motion lines behind the body
4. RECOVER (170–380 ms) – rifle dips to a lowered position on slow weapons (rapid-fire weapons stay up), then settles to AIM
Kick strength scales with each weapon's `recoil` stat; flash size scales per weapon. Enemies now fire from the muzzle (not body centre). Effects are capped and skipped off-screen.
Test: `npm run test:shot`

# V18 – Large war zones
- Every war zone is now 3× wider and 3× taller (≈11,400 × 9,600 px, 9× the area). One constant, `MAP_SCALE` in `src/game.ts`, controls it.
- Trees, props, camps, cover, ruins, boulders, houses, lamps, masts and fireflies scale with `MAP_DENSITY` (5×, below the 9× area so phones stay smooth). Edge tree walls scale with the perimeter. Hills and the main trail are stretched to the new size.
- Enemy cap 30 → 54; minimum level population 8 → 20. Reinforcements now arrive in a ring 760–1,350 px from the player instead of at far-away map edges.
- Camera bounds, physics bounds, radar, objective, boss and exit positions already derive from the map size and scale automatically.

# V18 – Battlefield props (burnt house, wreck car, tank, sandbags, wire, ammo crate, crater, log)
- Art lives in `public/props/*.png` (transparent cut-outs of the supplied sheet) and is loaded as `prop-<name>`.
- `placeWarProps()` in `src/game.ts` builds ~35 strongpoints per war zone (armoured firing position, roadblock, burnt homestead) plus loose craters, logs, crates, sandbags, wire and wrecks. Layout is seeded per level, so it is stable within a level.
- Everything except craters is solid cover (units slide around it, bullets/line-of-sight are blocked, standing at its edge hides you). Craters are ground decals.
- Start point, objective and exit are kept clear of props.
