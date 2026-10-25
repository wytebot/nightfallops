## v15 - Player Upgrade screen, life/magic/coin art
- See UPGRADE_UI_V15.md.

# Nightfall Ops — Upgrade Changelog

## Phase 1 — Bug fixes and native foundations
- Replaced the duplicate Phaser touch-movement/shoot handlers with one React pointer-event joystick, pointer capture, a moving knob, and up/cancel/lost-capture resets. The shoot-held state is no longer overwritten by a React effect.
- Added a real pause flow with Resume, Settings, Restart Mission, and Quit to Base; the game canvas stays mounted while pause/settings overlays are shown. Escape and Android Back open/preserve the pause flow.
- Removed touchstart handling from Bomb; the action uses `onPointerDown`.
- Initialized enemy patrol/search timestamps and last-known-player coordinates; added investigate/search movement and alert bubbles.
- Bombs cannot damage the commander until the objective is complete. Coin upgrades now check caps and owned skins switch without charging again; removed the unfinished Invulnerability purchase row.
- Hydrated audio, haptics, and control preferences from the IndexedDB/localStorage profile without wiping old saves.
- Added reusable Phaser bullet groups/pools and dead/out-of-bounds bullet pruning. Shift is sprint; C/button is stealth. Movement normalization uses `Math.max(1, magnitude)`.
- Replaced the visual-only night glow with a RenderTexture darkness layer and flashlight-cone cutout plus a fixed vignette. Phaser's duplicate text HUD is hidden/removed in favor of the React HUD.
- Added a shared mission reward function used by game settlement and app failure settlement.
- Added distinct Survival waves, Rescue captive/escort-to-exit, and Sabotage plant/defend objectives.
- Added Capacitor App and Haptics dependencies, removed `bundledWebRuntime`, and added an Android configuration script for `sensorLandscape` and immersive sticky fullscreen.

## Phase 2 — Game feel, camera, and controls
- Added lerped camera zoom, aim look-ahead, aim-cone assist, hit/bomb shake, and a short physics hit-stop.
- Added Assault/Shotgun fire rates and spread, muzzle flash, shell casings, tracers, sparks, and blood-free hit flashes.
- Expanded enemy AI with patrol, alert, investigate/search, chase, flank, and cover-seeking states; added faint vision wedges and alert indicators.
- Added basic gamepad movement/fire support and R-to-revive for downed squadmates; squad members use formation following and seek cover when hurt.

## Phase 3 — Graphics and interface
- Baked repeated tree, log, rock, and fern art into a small local texture set; reduced per-tree tweens and repeated Graphics objects.
- Added location-tinted parallax fog, low-cost rain/ash/water particles, water ripples, and local procedural weather.
- Added a React-only tactical radar, enemy pings, objective compass, animated health damage trail, optional FPS estimate, animated result stars, and store hover/portrait treatments.
- Added settings for volume buses, haptics, aim assist, camera shake, reduce motion, FPS display, language preference, drag-to-position action controls, and confirmed local reset.
- Removed Google Fonts runtime imports and bundled local font files under `public/fonts`.

## Phase 4 — Procedural offline audio
- Added a master gain, music/SFX buses, dynamics compressor/limiter, cached procedural noise buffers, and per-location ambience layers.
- Added ambience intensity changes during combat, location-aware wind/cricket/frog/river/thunder-style layers, and procedural assault/shotgun/reload/hit/explosion/heartbeat/alert/coin/level-up sounds.

## Phase 5 — Cloud-save safety
- Debounced and serialized cloud writes; coalesces queued profiles, keeps one write in flight, and caches the Drive file ID before subsequent writes.
- Background sync never opens a sign-in prompt after authorization expires; reconnect is initiated by an explicit account-button tap.
- Profile conflicts now choose the newest timestamp per field instead of `Math.max`-merging coin balances. Append-only histories are unioned, and skin ownership is unioned.
- Added a native account-provider interface seam. Paid entitlements remain server-owned; the client purchase-provider is UI-only and cannot grant paid inventory.

## Verification status
- TypeScript/TSX syntax transpilation: passed for all source modules.
- Android configuration script syntax check: passed.
- Reward formula smoke test and archive integrity: see final delivery notes.
- `npm run build` was attempted after each phase but could not complete because the environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`); dependencies are absent, so a real TypeScript semantic build, Vite production build, and Android build remain unverified.

## Auto-shoot upgrade (Phase 2 follow-up)
- Added free AUTO toggle for touch and the `T` key, with saved default/last state and a React HUD AUTO ON/OFF chip.
- Added Short / Medium / Long target range, adjustable aim-assist strength, 100 ms target scans, line-of-fire cover checks, target scoring and 25% / 400 ms target stickiness.
- Auto aim leads moving targets at 740 px/s, rotates smoothly, respects the 6-degree firing gate, weapon cadence/spread/damage and boss shield immunity.
- Manual mouse movement and FIRE/Space input temporarily override auto aim; sprint suspends auto-fire; stealth breaks when firing.
- Added target lock reticle, faint aim tracer, green animated mobile lock ring, haptic tick and click feedback. No billing or Flutterwave code changed.

## Catalog, upgrades and armory extension (requested Phases 1–6)

### Phase 1 — Catalog and pricing
- Added `src/catalog.ts` as the single source for coin packs, cash squad offers, coin supplies, skins, geometric upgrade costs, weapon rarity, USD/NGN prices and combat stats. `NGN_PER_USD` is defined once at 1,200.
- Added one cash-price formatter/component; coin packs show coins per dollar and the 50,000 pack has a BEST VALUE ribbon. All cash prices show USD and NGN.
- Replaced the purchase stub with the required `PurchaseProvider.startCheckout(productId)` / `getEntitlements()` interface. Its mock only returns “checkout not connected”; it contains no payment SDK, keys, webhook, billing mutation or client-side cash grant.
- Cash coin packs and squads are display/checkout stubs. Coin-only supplies, recruitment, skins, weapons and upgrades spend local coins, with owned items switching/equipping without another charge.

### Phase 2 — Operator upgrades
- Added SOLDIER / PARTNER / ARMY tabs, stat pips, current-to-next previews, level caps, cost curves, insufficient-coin reasons and total power rating.
- Added hold-to-repeat upgrades with a delay, per-repeat affordability checks, coin counter pulse/particles, haptics and ding feedback.
- Persisted per-track levels and applied health, damage, fire rate, movement speed, stealth signature and squad accuracy multipliers in combat. Existing saves are migrated; legacy `weaponLevel` maps to the assault-rifle unlock when nonzero.

### Phase 3 — Weapon store
- Added the horizontal snap shelf for Pistol, SMG, Assault Rifle, Shotgun, Marksman, Machine Gun, Plasma Rifle, Rail Cannon and Aether Reaver, with rarity art treatments, owned/equipped badges, wheel-to-horizontal, mouse drag, arrows and page dots.
- Added a dismissible detail modal with catalog-driven DPS, stat bars, spread/pellets/splash/crit/recoil details, coin/cash price display, comparison direction, Buy/Equip and Cancel.
- The scene reads weapon stats directly from the catalog. Damage, rate, range, spread/accuracy, pellet count, pierce, splash, crit and recoil all affect projectile combat. Added `npm run test:catalog` to check price parity, DPS ordering, upgrade cost growth and shared catalog/scene values.
- Server-only cash entitlements are read from the provider boundary and never written into the locally owned-weapon list by a checkout click.

### Phase 4 — Endless difficulty and AI
- Expanded the map to 3,800 × 3,200 and added deterministic level-seeded landmark patches while retaining connected, traversable terrain.
- Enemy health, damage, accuracy and reaction cadence scale with level. Spawn streaming maintains a maximum of 70 active hostiles including the boss; squad size gains a level-tier reinforcement allowance.
- Improved alert propagation/call-for-help, cover retreat at low health, flashlight/daylight visibility and line-of-sight checks for enemy fire and player projectiles. Enemy patrol/search timestamps are initialized on creation.

### Phase 5 — Transitions and progression
- Added a shared fade-to-black/reveal curtain with transition sound for deployment, result, death and return-to-base paths; Phaser fades into the mission camera.
- Added the ordered next-level checklist (result, coins, upgrade suggestion, zone, deploy) with animated completed/current states and tap-to-skip.
- Results animate elimination and coin counts and show a star rating.

### Phase 6 — Consistency and QA
- Reused the app’s existing visual tokens, locally bundled font stack, button/popup frame, modal backdrop and sound feedback.
- Added the catalog regression script and expanded the manual QA list for price parity, coin math, upgrade caps, modal cancel, weapon-stat parity, levels 50/100, transitions, landscape and offline play.
- Billing remains a disconnected provider stub; no Flutterwave v4 logic was added or changed.

## v9 — Combat response, explosives and flow hardening (2026-10-25)
- Expanded the armory from 9 to 13 weapons: Hand Grenade, Grenade Launcher, RPG-7 and Flamethrower. Every weapon's projectile type and combat stats are catalog-defined, reflected in the shelf and detail modal, and consumed by the game scene.
- Added impact/fuse blast handling for grenade and rocket projectiles, radial damage falloff, flame splash, unique launcher/flame procedural audio, distinct projectile tint/scale, and detonation on range expiry for rockets/grenades.
- Improved frame-time resilience by clamping very large `dt` after app resume, moving joystick input directly into the Phaser scene rather than triggering React state updates for every pointer movement, avoiding duplicate pooled bullet references, checking projectile distance before expensive line-of-sight work, and removing a global physics pause / timer race from each enemy kill.
- Hardened coin-spend flows for weapon, recruitment, supplies and skins to read the latest local profile before deductions and prevent duplicate owned-item charges. Cash checkout remains a disconnected mock and does not grant coins, squad members or weapons.
- Added regression assertions for the new weapon IDs/projectile types, blast wiring, pooled-bullet uniqueness and purchase-provider isolation.

## v9 verification boundary
- `npm run test:catalog`: passed for all 13 weapons, DPS ordering, projectile types, catalog-to-scene wiring, upgrade cost curves, requested prices and checkout isolation.
- Global TypeScript `transpileModule` syntax checks: passed for App, game, catalog, audio, purchase provider, storage, cloud and reward modules; both Node script syntax checks passed.
- Full `npm run build` was attempted but remains blocked by missing React/Phaser/Capacitor/Lucide dependencies; registry DNS was unavailable in this environment. No claim of a successful Vite or Android build, on-device performance test, or live checkout test is made.


## v11 — Native Google account + Firestore profile
- Added Capacitor Firebase Authentication Google sign-in and switched economy authorization to Firebase ID tokens verified by Firebase Admin.
- Added server-owned minimal Firestore profile persistence and automatic initial wallet creation.
- Added Capacitor Browser hosted checkout on Android and wallet/entitlement refresh when the app resumes.
- Aligned Capacitor app ID with the supplied Firebase Android package and added Google Services Gradle setup to the Android configuration script.
- Important: the uploaded `google-services.json` currently has no OAuth client entries. Add SHA-1 fingerprints and download the refreshed config before expecting native Google sign-in to succeed.
- Flutterwave checkout currently uses Standard `/v3` API endpoints; production Flutterwave API v4 compliance is not claimed.

## v12 — Standalone diagnostics and payment credential hardening
- Added a React error boundary so render-time failures show a recoverable screen instead of a blank UI, with one-tap diagnostic JSON export and reload.
- Added persistent, bounded client diagnostics for unhandled JS errors/rejections, network changes, lifecycle transitions, sign-in failures and wallet refresh failures. Diagnostic text redacts common token/secret patterns and does not include payment secrets.
- Added Settings → Standalone APK / AAB diagnostics: runtime/native status, network, local storage, Firebase session, canvas state and HTTPS economy health check.
- Added `GET /health` to the Firebase economy function. It reports service status and whether Flutterwave server secrets are present, never their values.
- Added server-secret slots for `FLW_CLIENT_ID`, `FLW_SECRET_KEY`, `FLW_ENCRYPTION_KEY`, and `FLW_WEBHOOK_HASH`; webhook hash comparison now uses a length check and constant-time comparison.
- Added `npm run android:diagnose` to inspect generated Capacitor/Android artifacts, landscape config, Firebase package alignment, economy endpoint presence and missing Google OAuth client entries.
- No Flutterwave credentials are embedded in Vite variables, source, APK, AAB, or repository files.


## Vercel TypeScript build fixes (2026-10-25)
- Added `src/vite-env.d.ts` so Vite's `import.meta.env` and the project's environment variables are typed during `tsc -b`.
- Removed impossible `Recon` comparisons from the paid-skin list; Recon is the default/free skin and is not part of the paid `skins` array.
- Replaced invalid Phaser `Container.setTint()` / `clearTint()` calls with helpers that tint the container's tint-capable children, preserving container transforms and physics.
- Removed the unsupported `add` option from Phaser `make.graphics()` configurations (these creator calls are non-added texture-generation graphics by default).
- Switched the active-pointer touch check to Phaser's supported `wasTouch` flag.

## v16 — Weapon art, recorded audio and character validation
- **Weapon art:** the armory chart was cut into transparent, horizontal PNGs under `public/weapons/` (pistol, revolver, SMG, shotgun, AK assault rifle, M4 carbine, DMR marksman, LMG machine gun, anti-material rifle, rocket launcher, minigun). The store shelf, the weapon popup and the soldiers' hands now use them; weapons without chart art (grenades, plasma, rail, Aether Reaver, flamethrower) keep their CSS drawing.
- **Four new weapons from the chart:** Revolver, Carbine (M4), Anti-Material Rifle and Minigun, added to `catalog.ts` in ascending DPS/price order and to the server price table in `functions/index.js`. `npm run test:catalog` now checks 17 weapons.
- **Audio:** the action trailer loops seamlessly (16 s, equal-power wrap) as background music — softly in menus, full level in missions and lifted slightly in combat. Recorded gunshots (per-weapon pitch/volume, voice-limited), footsteps (earth/rock) and UI clicks replace the synth versions, which remain as automatic fallbacks. Audio starts on the first tap/key, pauses when the app is hidden and respects the Sound toggle and volume sliders.
- **Characters validated:** removed the stray "NO. 06" label from `recon.png`; kept the front-facing art upright while a soldier aims (it previously rotated with the aim angle, so soldiers appeared sideways/upside-down); enemies get a light red tint so they read differently from allies.
- **New check:** `npm run test:assets` validates operator/weapon PNGs (transparency, stray fragments), audio files and server weapon prices.


## 2026-10-25 — Audio slot preparation and audit
- Added `docs/AUDIT.md`, `docs/ASSET_SLOTS.md`, and `docs/INSTALL.md` to document the initial source audit, planned replaceable assets, and installation/release workflow.
- Added supplied sound effects to per-weapon `fire.mp3` slots and shared explosion, bullet-whiz, and enemy-pain assets. These slots are staged for integration; the existing audio runtime has not yet been changed to read per-weapon slots.
- Build verification attempted, but dependency installation timed out in this environment. A clean build is not verified.
- The referenced copyright certificate was not included in the uploaded files; licensing remains unverified.

## 2026-10-25 — Command deck and audio-slot integration
- Replaced the long home-page presentation with a fixed landscape command deck and sequential Mission → Zone → Operator cards; selection panels animate in/out instead of extending the page vertically.
- Added persistent command-deck access to armory, upgrades, settings and sign-in; added quick deploy and daily bonus actions.
- Removed the React `onPointerMove` hack that manually overwrote Phaser's `activePointer` coordinates. A complete twin-stick aim bridge is still outstanding.
- Added on-demand per-weapon fire sample loading with shared/synth fallback, and connected supplied explosion/pain samples to shared SFX actions.
- Added a PWA manifest, master SVG icon, basic service worker, install metadata, and implementation/asset/install audit documents.
- Verification: `npm run test:catalog` and `npm run test:assets` pass. `npm install` timed out and `npm run build` fails in this environment because installed dependencies/types are unavailable; no gameplay browser test or Android build was run.


## 2026-10-25 — Battlefield controls, ammo economy, and location artwork

- Added Phaser-native multitouch dual-stick input: the left-side drag aims and fires; the right-side drag moves. Both sticks are rendered in screen space and support simultaneous touch. Existing tactical action buttons remain available.
- Removed the infinite-ammunition HUD and player ammunition behavior. Weapons now have weapon-specific magazine sizes, finite reserve ammunition, reload timing, and a visible magazine/reserve counter. The default pistol is no longer an endless-ammo weapon.
- Added weapon-specific projectile colors, radii, and rail/experimental weapon streak effects; enemy takedowns now use a short fade/fall animation and trigger the configured pain/death sound.
- Added ten original lightweight SVG battlefield panoramas and wired them to the corresponding insertion-zone cards: Blackroot Jungle, Abandoned School, Ghost Street, Misty Highlands, Sunken Camp, River Outpost, Broken Quarry, Redwood Basin, Flooded Village, and Ashen Forest.
- Kept wallet, coin spending, checkout, purchase-provider, server economy, Firebase rules, native auth, and Google service configuration untouched. Existing coin and verified-payment purchase paths remain in place.
- Validation: `node scripts/check-catalog.mjs`, `node scripts/validate-assets.mjs`, and `node --check public/sw.js` pass. Full dependency install/build and live browser/device playtest remain unverified because npm installation timed out in this environment.


## Field-overhaul visual pass
- Added illustrated, location-specific backgrounds to mission, zone, and operator cards using bundled artwork.
- Added procedural battlefield dressing: supply crates, sandbag emplacements, stacked stone cover, field tents, and taller perimeter trees.
- Added lightweight stride animation for player and combat units, visible carried weapons for enemy units, and short bullet tracers to make automatic fire read as a burst rather than isolated dots.
- Preserved economy, billing, authentication, and Firebase security files.
- Validation: asset and catalog tests pass. Full production build and device gameplay remain unverified in this environment.

## Field Overhaul v4 — combat polish pass
- Added brief weapon kick/recovery animation to the held weapon sprite on shots.
- Added ejected brass for automatic rifles, SMGs and machine guns, with short-lived pooled-scene effects.
- Added stride-linked weapon bob and stronger foot/leg cadence while units move.
- Added soft collision resolution around battlefield cover pockets so units are pushed around logs, rocks and fern cover rather than passing straight through their footprint.
- Preserved the existing weapon catalogue, ammo/reload logic, server economy and verified billing modules.

### Verification status
- `npm run test:catalog`: passed.
- `npm run test:assets`: passed.
- `node --check scripts/validate-assets.mjs`: passed.
- `node --check public/sw.js`: passed.
- Full TypeScript/Vite build remains unverified: dependency installation timed out in this environment.

## v16
See MOVEMENT_VIEW_V16.md: faster movement, alternating-leg walk cycle and firing/reload poses, muzzle flash, ground detail + fog per location, redrawn location art, performance fixes.


## v17 — Economy audit and transactional ledger (2026-10-25)
- Added `AUDIT_V16.md`, a source-based audit of the six requested workstreams and the key release blockers found.
- Added `WORKSTREAM_DESIGN_NOTES_V17.md` documenting architecture decisions, trade-offs and incomplete work.
- Successful `/spend` coin transactions now write a server-side ledger row (user, request ID, action, item, price, balance before/after, server timestamp) atomically with the wallet and idempotency response.
- This is a partial hardening release, not a claim that Play Billing, reconciliation, army coin purchases, AI, graphics, UI or Android release verification are complete.

## v17 follow-up hardening (2026-10-25)

### Workstream 1 — Economy safety
- Added server-priced coin purchase support for Partner ×1 (1,500), Strike Squad ×10 (12,000), and Battalion ×20 (22,000), with matching client catalog values and a parity check.
- Server upgrade pricing now derives army size from the stored wallet rather than caller-supplied metadata.
- Purchase request IDs persist in local storage across a timeout/retry and identical in-flight purchases share one promise. Server request IDs are hashed before use as Firestore document IDs.
- Coin spends, idempotency response and ledger entry remain in one Firestore transaction. Unknown catalog items and invalid balances/prices now fail closed.

### Workstream 2 — Billing
- Existing hosted checkout and Flutterwave webhook code were intentionally left unchanged per distribution instruction. This ZIP's checked-in implementation still calls Flutterwave `/v3/payments` and `/v3/transactions/.../verify`; it is not evidence of a verified Flutterwave v4 integration. No Google Play Billing migration was added.

### Workstream 3 — AI verification
- Added a deterministic headless formation contract harness for 20 units and 1,800 ticks. This is a lightweight movement contract test, not a Phaser runtime AI simulation.

### Workstream 5 — Native WebView and entry path
- Changed the Vite entry script to a relative path for packaged/base-path resilience.
- Service-worker registration is now skipped in native Capacitor builds, avoiding stale offline shell interception in the APK.

### Workstream 6 — Capacitor lifecycle
- Added Android back-button routing and app background/foreground pause/resume handling for the Phaser scene, with wallet/entitlement reconciliation on resume.
- Made generated MainActivity output idempotent in `scripts/configure-android.mjs`.

### Verification limits
- Catalog, asset, economy-contract and headless formation tests were run after these changes. TypeScript/Vite build and Android APK/AAB were not verified because project dependencies could not be installed in this environment.


## v17 follow-up wiring (2026-10-25)
- Added an authenticated payment-status endpoint so a native WebView can reconcile a checkout after app resume without granting from client claims.
- Persisted pending payment references and coin-purchase idempotency keys in localStorage so retries can survive WebView recreation.
- Added server-transactional daily bonus claims and ledger records; the UI now uses the server wallet result instead of directly minting the 100-coin bonus.
- Bound replayed idempotency keys to the original action and item, rejecting key reuse for another purchase.
- Prevented checkout initiation for already-owned squad tiers and weapons.
- Added a ledger entry for webhook-verified cash purchases, including payment reference, NGN amount, transaction ID, and coin balance before/after.
- Billing provider calls were intentionally not migrated or rewritten. Audit note: the currently checked-in backend uses Flutterwave `/v3` endpoints, so it does not substantiate the requested v4 billing claim.

## v17 gameplay completion update (2026-10-25)
- Added a one-time starter grant of 3 Phase Veil magic charges for new and legacy saves, tracked by a save migration marker.
- Phase Veil now makes the soldier visually translucent and undetectable/invulnerable for exactly 5 seconds; enemies remain killable by the player. Additional single charges can be purchased for 70 coins, with existing multi-charge packs retained.
- Removed level time-expiry failure for non-Survival missions and removed the countdown from the HUD; levels have no time limit.
- Successful level completion now grants exactly 300 coins, displayed in a custom animated mission-complete reward banner.
- Added `npm run test:gameplay-rules` static contract checks for the requested rules.

### Build hotfix — Vercel TypeScript errors (2026-10-25)
- Corrected weather particle storage to accept both Phaser `Arc` (circles) and `Rectangle` (rain/drizzle) objects, matching the actual objects created by the weather renderer.
- Removed the impossible `projectileKind === 'energy'` comparison; the catalog's inferred projectile union does not include `energy`, and energy-style weapons already use the `bullet` projectile type with weapon-specific visuals.
- Verification: catalog/assets/economy/AI/gameplay-rule scripts passed. Full `tsc -b` remains unverified because dependencies could not be installed in this environment.


## v17 — Touch controls, camera and aim polish (2026-10-25)
- Swapped touch zones: left half controls movement; right half controls facing/aim and fires while held.
- Replaced the second joystick-style aim indicator with a distinct crosshair, direction tick and subtle line from player to aim point.
- Widened the default camera view on phones and tablets to show more of the battlefield; focus zoom remains available.
- Strengthened auto-targeting by extending Short/Medium/Long acquisition ranges to 380/680/900 world units and improving close-target weighting.
- Reduced utility button and radar sizing moderately, respecting safe-area bottom inset and reduced-motion preference.
- Added `test:touch-controls` source contract test.
- Preserved Flutterwave checkout and existing game economy behavior.
- Build status: source contract and existing script checks pass; TypeScript/Vite and native APK builds not run in this environment.
