# Nightfall Ops v16 takeover audit (source inspection)

Date: 2026-10-25. This is a code inspection, not a runtime verification.

## 1. Coins and purchase deduction
- The server endpoint is `functions/index.js` (`POST /spend`) and has a Firestore transaction, a request-id document, and server-side price tables for weapons, supplies and upgrades.
- `src/App.tsx` calls the server for weapon, supply and upgrade purchases, then copies returned coin/inventory values into the local save. However, local `lives` and `magic` are incremented by the client after a successful supply response; server inventory is authoritative but game-use counts can drift unless reconciled consistently.
- `POST /spend` currently lacks a ledger entry. Unknown items return from the transaction callback without a clear in-transaction error; the route then returns an unknown-item response. Already-owned weapon/skin paths avoid deduction but are not recorded as idempotent requests.
- Army tiers and partner are cash-checkout-only in the UI. `squads` has no coin prices; server `/spend` has no squad purchase action. Cash checkout is Flutterwave v3 and webhook verifies through the v3 endpoint; this is not Google Play Billing and is a Play distribution policy risk.
- Coin packs, squad products, and a few paid weapons are defined in duplicated client/server price tables. There is no parity test. No Play purchase-token verification or Play refund/revoke handling was found.
- `crypto.randomUUID()` supplies request IDs on the client. Retries from a fresh call use a new ID, so transport-timeout retry semantics are not guaranteed to dedupe unless the same request ID is reused.
- Firestore rules deny client access to wallet/payment/request documents, which is a good baseline. Server transaction writes wallet and request response atomically, but no ledger exists in v16.

## 2. Billing and cash purchases
- `src/purchaseProvider.ts` delegates to `/checkout`; `src/App.tsx` opens the returned checkout URL using Capacitor Browser.
- `functions/index.js` creates pending Flutterwave transactions and grants after a successful webhook verification. The verification URL is explicitly Flutterwave `/v3/transactions/.../verify`.
- No Play Billing plugin, Play purchase recovery, product-details/store-price lookup, purchase-token verification, or Play order/refund deduplication was found.

## 3. Partner/team/enemy AI
- `src/game.ts` already includes patrol, alert, investigate/search, chase, flank, cover-seeking and squad formation/revive behaviour (also described in `CHANGELOG.md`).
- A full audit of the dense game loop and acceptance simulation has not yet been completed. No verified evidence yet of shared target assignment, a spatial grid, staggered AI ticks, stuck-unit headless simulation, or debug overlay covering all requested states/zones.

## 4. Graphics/animation
- Existing effects include muzzle flashes, shells, tracers, sparks, hit flashes, fog/weather, darkness/flashlight rendering and pooled bullet groups (per changelog and source structure).
- Requested surface-specific particles, pooled effects/tweens audit, adaptive quality by measured frame time and a unified visual guide remain unverified/not implemented as part of this pass.

## 5. UI/settings/loading
- React UI and a large `src/style.css` exist; settings include volume, haptics, aim assist, camera shake, reduced motion, FPS and control preferences.
- Shared reusable card component, settings search/sections, accessibility/touch-target audit across all four target viewports, and asset-loader progress wiring need further work. Existing loading/briefing notes are present but were not runtime-tested.

## 6. APK/AAB/Capacitor
- `index.html` exists and references `/src/main.tsx`; `capacitor.config.ts` uses `dist` and appId `app.nightfallops.vercel`. So the entry file is not missing in this archive.
- Capacitor 6 dependencies and `scripts/configure-android.mjs` exist. Android project presence, current Play target-SDK compliance, orientation/back/resume, WebGL context recovery, signing, R8, SHA fingerprints and bundletool installation were not verified. `node_modules` was absent at inspection time.

## Immediate code change in this pass
- Added server-written purchase ledger entries in the same Firestore transaction as successful coin deductions and idempotency response writes. Ledger records include uid, requestId, action, itemId, price, balance before/after and server timestamp.
- This is a narrow hardening step, not completion of the requested six workstreams. See v17 changelog and verification report.
