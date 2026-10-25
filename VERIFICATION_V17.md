# Nightfall Ops v17 verification report

## Checks actually run in this environment

| Check | Result | Notes |
|---|---|---|
| `node --check functions/index.js` | PASS | Server source parses |
| `node --check scripts/configure-android.mjs` | PASS | Android configurator parses |
| `node --check scripts/check-catalog.mjs` | PASS | Catalog test script parses |
| `node --check scripts/validate-assets.mjs` | PASS | Asset test script parses |
| `npm run test:catalog` | PASS | Weapon/upgrade/catalog checks and army coin price parity |
| `npm run test:assets` | PASS | Existing asset validation |
| `npm run test:economy` | PASS | Static economy contract checks |
| `npm run test:ai-sim` | PASS | 20-unit, 1,800-tick deterministic formation contract harness; not Phaser runtime |
| `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` | BLOCKED | Command timed out; no lockfile was produced |
| `npm ci` | NOT RUN | No `package-lock.json` is present |
| `npm run build` (`tsc -b && vite build`) | FAIL/BLOCKED | TypeScript cannot resolve React, Phaser, Capacitor and other project dependencies because install did not complete; emitted cascading JSX/Phaser type errors |
| `npm run android:diagnose` | 3/9 PASS; 6 warnings | Android platform directory is absent; Google OAuth client entries are missing; build output/Gradle wrapper are not generated |
| APK / AAB | NOT RUN | Requires generated Android platform, Android SDK/Gradle and release signing setup |
| Physical-device lifecycle and billing | NOT RUN | Requires installed APK, Firebase staging and test payment account |

## Verified vs not verified

### Verified
- Catalog and asset scripts pass.
- Server/client army coin prices match for Partner (1,500), Strike Squad (12,000), and Battalion (22,000).
- Static economy contract checks confirm Firestore transaction use, ledger/idempotency writes, server-owned army count for upgrade pricing, and retry key reuse.
- Standalone Capacitor builds skip service-worker registration at runtime in the source code.
- Android back-button and app-state listeners are present in source.

### Not verified
- TypeScript type correctness and Vite production output.
- Live Firestore transaction concurrency, request replay and race tests.
- End-to-end payment verification, refund/revocation handling, and the actual Flutterwave v4 contract. The checked-in source still uses Flutterwave v3 endpoints.
- AI behaviours in the Phaser runtime, actual stuck-unit acceptance, or FPS with large armies.
- Visual QA across 844×390, 667×360, 390×844 and 1280×720.
- Native Android build, signing, OAuth SHA fingerprints, target SDK compliance, WebGL context restoration, and physical device tests.

## Remaining high-priority risks

1. **Billing contract mismatch:** existing endpoint paths are v3 despite the desired v4 system. Preserved without modification to avoid silently changing live billing.
2. **Client-owned gameplay state:** lives, magic and mission reward flows still need complete server-authoritative reconciliation, not just purchase transaction hardening.
3. **Deployment dependencies:** no lockfile means reproducible install and `npm ci` are not ready.
4. **Android project absent:** APK/AAB cannot be produced from this archive without generating/syncing the platform and supplying valid OAuth/SDK configuration.
5. **AI/performance:** existing AI is substantial but has not been profiled or validated on a low-end Android device.


## Follow-up wiring added
- Server now has a `daily-bonus` Firestore transaction with one claim per UTC date and a ledger entry.
- Server now has an authenticated `payment-status` endpoint that only reveals a payment belonging to the caller.
- Checkout initiation rejects already-owned non-consumable squad/weapon items.
- Successful webhook-verified cash purchases now write a ledger record in the same Firestore transaction as the wallet/payment status update.
- Existing idempotency key replay must match the original action and item.
- Client keeps pending payment references and coin-purchase retry keys in localStorage, then reconciles a paid checkout on app resume.

These are source-level changes. The dependency install timed out in this environment; TypeScript/Vite and Android compilation remain unverified. Flutterwave live webhook delivery, duplicate-checkout races, Firestore concurrency, and device resume tests remain unverified.
