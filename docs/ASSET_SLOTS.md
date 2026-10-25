# Asset slots

## Weapon audio
Each weapon supports `public/audio/weapons/<weapon-id>/fire.mp3`; optional files are `fire-2.mp3`, `fire-3.mp3`, `reload.mp3`, `empty.mp3`, `impact.mp3`, and `explosion.mp3` for explosive weapons. Use short mono/stereo MP3 or OGG samples (44.1/48 kHz; target 30–250 KB per shot, explosions may be larger). Missing per-weapon fire files fall back to shared recordings and synthesized SFX.

Weapon IDs: pistol, revolver, smg, assault-rifle, carbine, marksman, machine-gun, shotgun, anti-material-rifle, minigun, rpg, grenade-launcher, hand-grenade, flamethrower, plasma-rifle, rail-cannon, legendary.

## Shared audio
`public/audio/music-action-loop.mp3`, `sfx-bomb-explosion.mp3`, `sfx-bullet-whiz.mp3`, `sfx-enemy-pain.mp3`, `sfx-click.mp3`, `sfx-gun-1.mp3`, `sfx-gun-2.mp3`, `sfx-gun-3.mp3`, `sfx-gun-heavy.mp3`, and `sfx-step-1.mp3` through `sfx-step-6.mp3`.

## Visual assets
- Operator illustrations: `public/operators/*.png` (transparent RGBA PNG; source art currently static portraits).
- Weapon art: `public/weapons/*.png` (transparent RGBA PNG; horizontal weapon silhouettes).
- App master icon: `public/icons/nightfall.svg`; PWA metadata: `public/manifest.webmanifest`.
- Future recommended world atlases: WebP atlas + JSON metadata, 2048x2048 or smaller per atlas; target total first-load imagery under 25 MB. Keep texture keys in `public/assets/manifest.json` when the atlas pipeline is added.
- Future Android resources should be generated from a master vector in `resources/` with `@capacitor/assets`, including adaptive foreground/background and monochrome icon layers.

## Licensing
Only ship sounds and art where the actual license permits the intended distribution. See `LICENSES.md`; a sound filename or attribution alone is not proof of commercial redistribution rights.
