# Nightfall Ops — Responsiveness & Performance Pass

## Changes
- Disabled renderer antialiasing and enabled high-performance GPU preference / round-pixel rendering for lower-cost mobile rendering.
- Kept the game targeting 60 FPS with non-timeout scheduling.
- Reduced ambient scenery, firefly, weather, and water-ripple particle counts to reduce draw/tween workload while retaining each location's weather identity.
- Replaced per-frame aim-assist array allocation/map/filter/sort with a single-pass nearest-target scan.
- Reduced the maximum active streamed enemy population from 70 to 42 and limited each spawn pulse to two enemies, reducing AI, line-of-sight, and rendering work.
- Reduced full-screen night-light redraw frequency from roughly 30 times/second to about 12 times/second.
- Throttled HUD and mission text layout updates to 8 times/second while movement and firing input remain on the frame loop.
- Removed temporary array allocation from the projectile cleanup scan.
- Reduced mobile card shadows, transitions, and backdrop blur compositing; honors reduced-motion preferences.

## Integrity
The following protected economy, payment, authentication, rules and app identity files were not intentionally edited: `functions/`, `firestore.rules`, `src/serverEconomy.ts`, `src/purchaseProvider.ts`, `src/nativeAuth.ts`, `google-services.json`, and `capacitor.config.ts`.

## Validation
- `npm run test:catalog`: passed.
- `npm run test:assets`: passed.
- Production build and real-device frame-time/touch latency measurements were not verified in this environment. Test on a physical Android device before release.
