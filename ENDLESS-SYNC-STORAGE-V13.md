# Nightfall Ops v13 — Endless progression, account sync & storage safeguards

## Gameplay
- Survival waves continue without a five-wave completion cap.
- Every fifth Survival wave is an elite/commander wave; defeating the commander advances the run into the next wave cycle.
- Wave pressure increases gradually: wave intervals tighten with a floor, reinforcement batches scale to a cap, and the existing active-hostile limit remains in place for device performance.
- Enemy durability and accuracy already scale with level; reinforcement pacing now also scales with the selected level. Campaign, Rescue, and Sabotage continue to progress through the existing level sequence.

## Accounts and cloud sync
- Existing Google account sign-in, Firestore/server wallet, server-verified purchase flow, and private Google Drive appDataFolder backup remain intact.
- Cloud profile writes trim history arrays before upload, reducing repeated payload size.
- Existing debounced/serialized Drive writes are retained so rapid changes coalesce instead of creating a new file for each change.
- Local/remote profile history arrays are bounded when merged. Wallet/payment server authority is unchanged.

## Storage safeguards
- IndexedDB remains the primary local profile store.
- Compatibility snapshots are compacted to the latest 120 mission records, 160 activity records, and 120 purchase records; owned-skin duplicates are removed and the list is capped at 80.
- App-level saves apply the same history bounds before persistence and cloud backup.
- Quota errors are caught; the app does not crash when browser storage is unavailable or full.

## Validation
- `npm run test:catalog` passed.
- `npm run test:assets` passed.
- `node --check public/sw.js` passed.
- ZIP integrity checked after packaging.
- Full TypeScript/Vite build was not run because project dependencies are not installed in this environment. Gameplay needs a real-device smoke test, especially repeated elite waves and long-run memory use.
