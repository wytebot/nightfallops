# Manual QA Checklist — Nightfall Ops

Use a physical Android phone in landscape and a laptop/desktop browser. Mark each item only after observing it on-device.

## Install, orientation, and offline
- [ ] Run `npm install` and `npm run build`; confirm zero TypeScript/Vite errors.
- [ ] Run `npx cap add android` once, then `npm run android:sync`; confirm generated manifest has `android:screenOrientation="sensorLandscape"`.
- [ ] Install the APK and confirm status/navigation bars hide; swiping from an edge reveals them temporarily.
- [ ] Rotate the device to portrait; confirm the “ROTATE YOUR DEVICE” overlay appears and gameplay remains landscape.
- [ ] Launch with airplane mode enabled; confirm splash, base, gameplay, fonts, and procedural audio all work without remote assets.
- [ ] Confirm no network requests are required for core gameplay or local saves.

## First run and backward-compatible save
- [ ] First launch creates a default profile and enters the base.
- [ ] Upgrade an existing v1/localStorage profile; confirm coins, level, location, inventory, and settings are preserved.
- [ ] Relaunch and confirm IndexedDB data hydrates the UI, sound levels, haptics, and control layout.
- [ ] Reset progress; confirm the confirmation step appears and only local profile data is reset; confirm the cloud backup is not silently deleted.

## Pause and keyboard/gamepad
- [ ] Tap MENU; confirm simulation pauses and Resume, Settings, Restart Mission, and Quit to Base are available.
- [ ] Resume; confirm the same canvas/session continues rather than a blank canvas or new mission.
- [ ] Open Settings from pause and return; confirm the current mission is preserved.
- [ ] Press Escape; confirm pause. Press Android Back during gameplay; confirm pause. Press Back from pause; confirm resume.
- [ ] Laptop: WASD/arrows move, mouse aims, Space/click fires, Shift sprints, C stealths, Q switches weapon, E throws a bomb, Escape pauses.
- [ ] Gamepad: left stick moves and primary button fires.

## Touch controls and combat
- [ ] Hold and drag the joystick; confirm the knob follows the pointer and movement speed is analog.
- [ ] Lift finger, cancel pointer, and force lost pointer capture; confirm joystick resets to center.
- [ ] Use both thumbs simultaneously: move with left thumb while aiming/firing with right thumb.
- [ ] Hold FIRE; confirm continuous fire and immediate release on pointer up/cancel/lost capture.
- [ ] Tap BOMB on touch; confirm it fires once without a stuck pointer or accidental browser gesture.
- [ ] Confirm a bomb cannot hurt the commander before the objective is completed, but can afterward.
- [ ] Confirm owned skins switch without coin charge; buying at the weapon/squad cap does not charge coins; Invulnerability is not sold as an unfinished item.
- [ ] Confirm shotgun spread/recoil/casings differ from rapid assault fire; hit flashes are blood-free.
- [ ] Confirm alert cones, investigate/search, chase/flank/cover, companion formation, downed notices, and R-to-revive work.
- [ ] Confirm Survival has waves and a final commander, Rescue requires captive pickup and escort to exit, and Sabotage requires planting/defending before commander elimination.

## Save/cloud conflicts
- [ ] Make progress offline, reconnect the same Google account from a user tap, and confirm it backs up.
- [ ] Uninstall/reinstall, sign into the same account, and confirm levels, coin balance, settings, inventory, mission history, and activity history restore.
- [ ] Play offline on two devices, then sync in both orders; verify per-field newest timestamp wins and coin balance is never merged using `Math.max`.
- [ ] Let OAuth expire; make local progress and confirm background sync does not pop a sign-in prompt. Tap account reconnect and retry.
- [ ] Confirm rapid changes result in serialized/debounced writes and do not create duplicate Drive save files.
- [ ] Confirm client-only shop selection never grants paid partner/army entitlements; only server-verified state may do so.

## Performance / visual
- [ ] On a mid-range Android device, run a 5-minute mission and watch the optional FPS counter; target stable 60fps, investigate sustained drops below 50fps.
- [ ] Check night darkness, flashlight cone cutout, vignette, day lighting, weather, water ripples, and different location palettes.
- [ ] Confirm radar enemy pings, objective compass, health damage trail, mission results, and count-up/stars are legible at narrow and wide landscape sizes.
- [ ] Confirm local fonts render without a network connection and no Google Fonts URL is requested.

## Build pipeline/native integration
- [ ] `npm run android:sync` succeeds after the Android platform has been generated.
- [ ] Verify generated `MainActivity.java` package matches `com.wyteboy.nightfallops` and `AndroidManifest.xml` contains sensorLandscape.
- [ ] Build and install debug APK; test Android Back, fullscreen, haptics preference, and app resume.

## Auto-shoot checks
- [ ] AUTO starts OFF for a legacy profile; saved ON/OFF state survives app restart.
- [ ] Touch AUTO button toggles state, emits a light haptic tick, and glows green when enabled.
- [ ] Laptop `T` toggles AUTO; React HUD chip updates to AUTO ON/OFF.
- [ ] No visible/in-range/line-of-sight target means AUTO does not fire.
- [ ] Shielded boss is never targeted until the objective is complete.
- [ ] Lock remains stable; a new target must score >25% higher for 400 ms before switching.
- [ ] Mouse aim / manual FIRE overrides AUTO for 1.5 seconds; manual firing still works.
- [ ] Moving and shooting works simultaneously; holding sprint pauses auto-fire.
- [ ] Assault/shotgun cadence, spread and weapon-level damage match manual fire.
- [ ] Run with 70 enemies and verify stable FPS and acceptable battery/heat on a mid-range phone.

## Catalog, pricing and upgrade economy
- [ ] Run `npm run test:catalog`; confirm all thirteen weapon stat objects match `getWeapon`, base DPS is ascending, upgrade cost curves grow, and all specified coin-pack/squad prices match exactly.
- [ ] Verify coin packs show USD + NGN, coins per dollar, and BEST VALUE on 50,000; confirm cash checkout always says “checkout not connected” and never adds coins.
- [ ] Verify Partner ×1, Strike Squad ×10 and Battalion ×20 show USD and NGN; checkout never changes squad size or inventory.
- [ ] Recruit soldiers with coins; verify balance falls by catalog price and the 20-soldier cap prevents a charge.
- [ ] Tap an owned weapon and skin; confirm equip/switch is free and never charges twice.
- [ ] In SOLDIER / PARTNER / ARMY, upgrade once and hold to repeat. Confirm costs grow, balance never becomes negative, max-level buttons disable with a reason, and coin/ding feedback occurs.
- [ ] Confirm each upgrade level persists after reload and a legacy profile with `weaponLevel > 0` migrates to the assault-rifle unlock without losing other fields.

## Weapon shelf and combat parity
- [ ] Drag the shelf with a mouse, use the wheel, arrow buttons, dots and touch swipe; confirm snap and last card are fully reachable with safe-area padding.
- [ ] Open each weapon modal; tap X, Cancel and outside backdrop. Confirm each closes without purchase or state change.
- [ ] Compare popup damage, fire rate, range, accuracy, spread/pellets, pierce, splash, crit and recoil with the values in `src/catalog.ts` and the scene's `getWeapon()` data.
- [ ] Confirm pistol/SMG cadence, shotgun spread and recoil, marksman pierce, plasma splash, rail-cannon pierce and legendary splash/crit behaviour.
- [ ] Confirm cash-only weapons cannot be equipped from a modified local `ownedWeaponIds` list; only a provider-returned server entitlement permits equip.
- [ ] Play through level 50 and 100; confirm difficulty grows, active enemy count never exceeds 70, map objectives remain reachable, and no enemy timer becomes `NaN`.

## Transitions and progression
- [ ] Confirm deploy, victory, death, restart and quit use the shared curtain and transition sound.
- [ ] Complete a level; verify checklist steps complete in order, next step glows, tap-to-skip works, and the next level starts only after the checklist finishes.
- [ ] Confirm results animate kills/coins and star rating without duplicate reward grants.


## v9 explosive weapons and response regression
- [ ] Hand Grenade and Grenade Launcher projectiles detonate on fuse/range expiry or enemy impact; blast radius falloff is visible and damage is applied once per affected enemy per blast.
- [ ] RPG-7 rocket detonates on impact/range expiry and damages nearby hostiles; boss shield remains respected until objective completion.
- [ ] Flamethrower shots use flame sound and close-range splash; no projectile remains active after expiry.
- [ ] Verify all 13 weapons are scroll-reachable, labels/prices/stats match the catalog, and Q cycles only through owned weapons.
- [ ] On Android, joystick updates movement without visible UI jitter; pointer cancel/lost capture releases movement and fire immediately.
- [ ] Rapid taps on weapon/recruitment/supply/skin purchases cannot double-deduct, buy an already-owned weapon, exceed squad cap, or produce a negative coin balance.
- [ ] Kill several enemies with one blast; verify game continues without global physics freeze, stuck input, duplicate kills, or delayed resume race.
- [ ] Test background/resume with a large frame gap; movement does not jump across the map.
- [ ] Confirm cash checkout buttons remain mock-only, return “checkout not connected”, and grant no coins, inventory or squad units.

## v12 standalone diagnostics and payment-secret checks
- [ ] Trigger a controlled React render error in a test build; confirm the recovery screen offers export and reload.
- [ ] Settings → Run checks: online/offline, local storage, signed-in Firebase session, and `/health` results match device state.
- [ ] Export diagnostics JSON; inspect that no ID token, Authorization header, Flutterwave secret, encryption key, or webhook hash is present.
- [ ] Turn off network, resume the APK, restore network, and confirm events are captured without crashing the game.
- [ ] Confirm `GET /health` returns credential presence booleans only and no secret values.
- [ ] Configure all four Firebase Functions secrets using the Firebase CLI; never use `VITE_` prefixes for payment credentials.
- [ ] Confirm the APK/AAB bundle and source map do not contain Flutterwave credentials.
- [ ] Run `npm run android:diagnose` after `npx cap add android`, `npm run build`, and `npm run android:sync`.
- [ ] Complete native Google sign-in tests on debug and release-signed APK/AAB after registering both SHA-1 fingerprints and refreshing `google-services.json`.
- [ ] Complete end-to-end payment tests with Flutterwave test credentials, duplicate webhook delivery, invalid hash, cancelled checkout, and resume-from-checkout scenarios.

## v16 additions
- [ ] Music starts after the first tap, loops with no audible gap, is quieter in menus and stops when the Sound toggle is off or the app is backgrounded.
- [ ] Each weapon sounds different (pitch/volume); minigun and squad fire do not distort or pile up.
- [ ] Footsteps play on earth/rock; water keeps the synth splash.
- [ ] Store shelf shows chart art for 11 weapons, scrolls horizontally on touch and mouse; popup shows large art with Cancel.
- [ ] Soldiers stay upright while aiming; the held weapon follows the aim and flips when aiming left; enemies look reddish.
- [ ] Buy Revolver/Carbine/AMR/Minigun with coins against the deployed server function (new prices must be deployed).

## Field overhaul verification — 2026-10-25

- [x] Catalog verification: 17 weapon entries, weapon balance ordering, server coin-price parity, upgrade curves and checkout isolation (`npm run test:catalog`).
- [x] Asset verification: operator art, weapon art, weapon audio slots, shared combat sounds and server weapon-price parity (`npm run test:assets`).
- [x] Ten custom zone SVG files parse as valid XML.
- [x] Service worker and asset validation scripts pass Node syntax checks.
- [x] Verified unchanged protected paths against the preceding project archive: `functions/`, `firestore.rules`, `src/serverEconomy.ts`, `src/purchaseProvider.ts`, `src/nativeAuth.ts`, `google-services.json`, and `capacitor.config.ts`.
- [ ] Production build / full TypeScript typecheck: blocked because `npm install --no-audit --no-fund` timed out and dependencies were not installed in this environment.
- [ ] Browser playtest, two-finger phone test, reload edge cases, and Android build/device test remain required before publishing.

## v17 follow-up: standalone Capacitor APK checks

1. Confirm `index.html` points to the relative `./src/main.tsx` entry and that `vite build` emits a working `dist/index.html`.
2. Confirm native Capacitor does not register `public/sw.js`; web/PWA builds may still register it.
3. Install the debug APK, launch offline, and verify the app opens without a blank screen. Test again after clearing app data.
4. During gameplay, press Android Back: it should pause to the pause screen. Background the app, wait, and foreground it: gameplay should resume only if the app was still on the game screen.
5. Sign in and check wallet sync. Background/foreground after a purchase and confirm wallet/entitlements reconcile from the server.
6. Double-tap coin purchase buttons; verify only one in-flight request is made. Simulate timeout then retry; verify the same idempotency key is reused.
7. Test purchase paths with insufficient balance, offline, replayed request, modified client metadata, and already-owned squad tiers against the deployed Functions emulator/staging project.
8. Test all target sizes and cutouts on physical devices; this was not performed in this environment.

## Billing scope warning

The repository version audited here uses Flutterwave `/v3/payments` and `/v3/transactions/.../verify` endpoints. The billing code was preserved unchanged by the v17 follow-up; do not assume Flutterwave v4 compatibility without confirming the integration contract and running live test-mode verification.

## Reproducible build commands (after dependencies and Android SDK are available)

```bash
npm ci
npm run test:catalog
npm run test:assets
npm run test:economy
npm run test:ai-sim
npm run build
npx cap add android   # only if android/ does not exist
npx cap sync android
npm run android:configure
cd android
./gradlew assembleDebug
./gradlew bundleRelease
```

For a bundletool device install test, download a current `bundletool-all-*.jar` from the official Android bundletool releases, then:

```bash
java -jar bundletool-all.jar build-apks --bundle=app/build/outputs/bundle/release/app-release.aab --output=/tmp/nightfall.apks --mode=universal
java -jar bundletool-all.jar install-apks --apks=/tmp/nightfall.apks
```

`npm ci` is currently blocked because this ZIP has no lockfile; generate and review `package-lock.json` with a working npm registry before using the commands above. Release bundle generation also requires a configured signing setup.
