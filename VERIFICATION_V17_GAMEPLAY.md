# v17 Gameplay Changes — Verification

## Implemented in source
- Starter magic: 3 charges, granted once using `magicStarterGranted` save migration marker.
- Magic: 5 seconds of visual cloak and invulnerability; enemy sight logic suppresses detection during the effect; player attacks remain enabled.
- Refill: `Magic Charge ×1` costs 70 coins; existing multi-charge packs remain available.
- Mission timing: no time-expiry failure and HUD says `NO TIME LIMIT`.
- Completion payout: exactly 300 coins for a successful level; result screen includes an animated gold reward banner.

## Checks run
- `npm run test:gameplay-rules` — PASS
- `npm run test:catalog` — PASS
- `npm run test:assets` — PASS
- `npm run test:economy` — PASS
- `npm run test:ai-sim` — PASS

## Not verified
- `npm run build` — BLOCKED because dependencies are absent (`react`, `phaser`, Capacitor packages, and type declarations could not be resolved). No compiled web bundle or APK was produced.
- No physical-device playtest was performed; timing, visual fade, touch behavior, and native lifecycle still need device QA.


## Touch controls and camera follow-up
- `npm run test:touch-controls`: PASS. Confirms left movement zone, right aim/fire zone, distinct reticle, wider camera target, increased auto-aim range and reduced UI scale.
- Existing catalog, assets, economy, headless AI, and gameplay-rules scripts: PASS after these edits.
- Phaser runtime touch behavior and physical-device testing: NOT VERIFIED.
- TypeScript/Vite production build and Capacitor APK: NOT VERIFIED.
