# Location and weather overhaul

Each of the ten named locations now gets its own weather signature and additional landmark dressing in `src/game.ts`:

- **Blackroot Jungle** — fireflies/pollen-like glow and dense forest mood.
- **Abandoned School** — drizzle, ruined wall blocks, window openings and street lamps.
- **Ghost Street** — drifting ash, dark urban ruins and cool lamp glow.
- **Misty Highlands** — pale snow fall and drifting lateral movement.
- **Sunken Camp** — dusty air and field-camp radio masts.
- **River Outpost** — rain, reflective ripples and camp communications masts.
- **Broken Quarry** — dust and a higher density of exposed boulders.
- **Redwood Basin** — warm pollen-like particles with forest dressing.
- **Flooded Village** — heavy rain, a winding water channel, ripples and raised village houses.
- **Ashen Forest** — ash fall and muted warm-grey atmosphere.

The weather remains procedural and lightweight: no external image downloads or new dependencies are required. Existing stride animation, carried-weapon artwork, shell casings, recoil, tracer effects and cover resolution remain enabled. The coin and billing code paths were not edited in this pass.

## Verification limits

Catalog and asset validation scripts pass. A full TypeScript/Vite build and on-device performance test have not been completed in this environment because `node_modules` is absent and dependency installation previously timed out. Weather particles and landmark density should be profiled on a physical low-memory Android device before release.
