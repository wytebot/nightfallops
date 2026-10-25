# Nightfall Ops implementation audit (2026-10-25)

## Confirmed source architecture
- React 18 / TypeScript owns the lobby, settings, shop, upgrades, save migration and overlays.
- Phaser 3 owns the `JungleScene`, combat simulation, world, AI and HUD/gameplay effects in `src/game.ts`.
- `src/audio.ts` owns Web Audio buses, shared recorded samples and synth fallbacks; `src/catalog.ts` is the weapon/mode catalogue; `src/storage.ts` owns local profile persistence.
- Existing save key remains `nightfall-ops-save-v1`; economy/auth provider modules and `functions/`, `firestore.rules`, `google-services.json`, and Capacitor app ID were not edited.

## Confirmed / visible findings
- The current scene remains largely procedural and its map dimensions are 3800x3200. The character art is static illustrations, not a full directional skeletal rig.
- Movement uses a `moveVector`; the scene's aim still reads Phaser's active pointer, so this update removes the React pointer-coordinate override but does not claim a completed twin-stick input bridge.
- The scene uses a RenderTexture night-vision/light-mask approach and per-frame Phaser effects. Object pooling and the proposed typed `Unit` refactor have not been completed.
- Existing home UI previously presented the hero, modes, operator roster, locations and bonus panels in a long scrolling page. It has now been replaced by a fixed-height command deck with sequential mission → zone → operator selection and animated transitions.
- Weapon audio now attempts a per-weapon `fire.mp3` slot and falls back to shared profiles/synth. Slots are loaded on demand. Explosion and pain samples are wired into shared SFX helpers.
- PWA manifest, SVG master icon and a basic cache-first service worker are present. This is not yet a full asset precache; it dynamically caches eligible same-origin resources after they are requested.

## Not yet implemented / not verified
- No complete module split (`Unit`, world, effects, weapon FX, AI, controls, UI), spatial hash, AI throttling or adaptive quality tiers.
- No completed left-side aim/right-side move twin-stick implementation, right-stick gamepad aiming, or touch REVIVE button.
- No baked realistic forest atlas, WebGL post-processing, full collision map, larger 6400x5200 map, eight-direction animation rig, corpse pool or cinematic death system.
- No real Phaser preload progress scene, complete tutorial flow, full custom HUD icon set, Android platform folder, adaptive Android icon layers, APK/AAB or Playwright screenshots.
- Build verification is blocked because dependency installation timed out in this execution environment; do not consider the production build verified until `npm install` and `npm run build` complete successfully in a connected environment.
