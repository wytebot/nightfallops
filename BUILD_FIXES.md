# Vercel / Capacitor TypeScript build fixes

This pass addresses the reported `ImportMeta.env` typing failures and Phaser pointer/tint typing incompatibilities without changing the wallet, verified-payment, Firebase configuration, Firestore rules, or Capacitor app identity.

## Apply to the Vercel repository
1. Replace the repository source with this ZIP (or copy the updated `src/vite-env.d.ts`, `src/App.tsx`, and `src/game.ts`).
2. In Vercel, keep the existing project settings and environment variables. Do not remove `VITE_ECONOMY_API_URL` or Firebase configuration.
3. Redeploy and review `npm run build` output.

## Android safety
- `capacitor.config.ts` and `scripts/configure-android.mjs` are retained.
- Rebuild web assets first: `npm run build`.
- Then sync the existing Android project: `npx cap sync android`.
- Apply the existing orientation configuration only if the Android platform has already been generated: `npm run android:configure`.
- Build the APK from Android Studio/Gradle after sync; do not use an old `dist/` folder.

## Validation limitation
The package manager could not finish installing dependencies in this environment, so this source bundle is not represented as a successfully compiled production build. Run `npm ci` and `npm run build` in Vercel or a machine with package-registry access to confirm the remaining Phaser-version-specific errors against the exact deployed commit.
