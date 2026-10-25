# Vercel TypeScript build hotfix

## Errors addressed

1. `src/game.ts(146,57)`: weather particles are created as either Phaser `Arc` circles or `Rectangle` rain drops. The array now declares both allowed object types instead of only `Arc`.
2. `src/game.ts(328,674)`: removed an impossible `projectileKind === 'energy'` comparison. Catalog projectile types do not include `energy`; energy-like weapons use the standard bullet projectile with weapon-specific rendering.

## Checks actually run

Passed:
- `npm run test:catalog`
- `npm run test:assets`
- `npm run test:economy`
- `npm run test:ai-sim`
- `npm run test:gameplay-rules`

Not verified: `tsc -b && vite build`. `npm install --no-audit --no-fund` timed out in this environment, and the available `node_modules` is incomplete, so a full type check produces many missing-module errors unrelated to the two reported source errors.

## Vercel

Commit these changes, push to the branch Vercel deploys, then redeploy. If Vercel reports another TypeScript error, address the next actual error rather than suppressing the compiler.
