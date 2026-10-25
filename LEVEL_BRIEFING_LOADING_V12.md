# Nightfall Ops v12 — Level briefing and cinematic loading

- Added a pre-deployment mission-intel screen showing the selected level, location artwork, mode, lighting condition, operator, squad size, and field advisory.
- Added a dedicated loading screen before gameplay starts, with a progress bar, rotating loading status, location artwork, moving light beam, dark vignette, and field tip.
- Uses existing location SVG art and the selected Day/Night setting; no new remote assets required.
- Existing mission selection and quick deploy now route through briefing → loading → gameplay. The game scene is only created after the loading sequence finishes.
- Economy, purchases, auth, server functions/rules, save key, and Capacitor app ID were not intentionally changed.

Validation: catalog tests, asset validation, service-worker syntax, and ZIP integrity passed. `npm run build` could not be verified because the local `node_modules` install is incomplete/missing React, Phaser, and Capacitor packages; this failure is an environment/dependency issue and is not represented as a successful build.
