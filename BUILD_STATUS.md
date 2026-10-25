# Build status — v12

## Passed
- `node --check functions/index.js`
- `node --check scripts/check-catalog.mjs`
- `node --check scripts/configure-android.mjs`
- `node --check scripts/diagnose-android.mjs`
- `npm run test:catalog` — 13 weapon catalog, pricing, DPS and upgrade invariants pass.
- TypeScript `transpileModule` syntax checks pass for App, main, diagnostics, ErrorBoundary, serverEconomy, nativeAuth, game and catalog.
- `npm run test:diagnostics` runs and correctly warns that this source archive does not contain generated Android files, built dist, runtime environment URL, and refreshed OAuth client entries.
- ZIP archive integrity checked after packaging.

## Blocked / not verified
- `npm run build` cannot complete in this environment because dependencies are not installed (`react`, `phaser`, Capacitor plugins and others); npm registry/network access is unavailable. Type errors following missing module/type declarations are not a valid full semantic compile result.
- No Android platform is generated in this source archive, so APK/AAB build, installation, native Google sign-in, app-resume and process-death tests remain unverified.
- No Firebase deployment, live Firestore test, Flutterwave test transaction or webhook delivery was performed.
- The existing hosted checkout/verification implementation still calls Flutterwave Standard v3 endpoints. Four server-only secret names are prepared and reported by the health check, but this is **not** a verified Flutterwave v4 implementation. Do not switch production payments until the exact merchant v4 contract is implemented and tested.

## Next release gate
Install dependencies on a network-enabled machine, generate Android platform, refresh Firebase OAuth config after SHA-1 setup, run `npm run build`, `npm run android:sync`, `npm run android:diagnose`, build both APK and AAB, then complete `QA_CHECKLIST.md` using test credentials.
