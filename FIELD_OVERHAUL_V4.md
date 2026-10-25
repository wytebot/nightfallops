# Nightfall Ops — Field Overhaul v4

This pass builds on the illustrated battlefield v3 package with additional combat feedback and cover movement.

## Included
- Tactical illustrated lobby and battlefield location art from v3.
- Ten procedural battlefield zones, trees, tents, crates, sandbags, stone stacks, weather and cover pockets from v3.
- Existing dual-touch controls, finite magazines/reserve ammunition, reloads, 17-weapon catalogue and coin/billing integration retained.
- New held-weapon recoil, ejected brass on automatic weapons, gait-linked weapon bob and soft cover-footprint collision resolution.

## Verification
Catalogue and asset validation scripts pass. A full production build and device gameplay session could not be run because `npm install --no-audit --no-fund` timed out in the execution environment. Do not treat this archive as a signed Android release.

## Protected billing/economy paths
No intentional changes were made to `functions/`, `firestore.rules`, `src/serverEconomy.ts`, `src/purchaseProvider.ts`, `src/nativeAuth.ts`, `google-services.json`, or `capacitor.config.ts`.
