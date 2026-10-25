# Player Upgrade screen + life / magic / coin art (v15)

- New art in `public/ui/`: `life-heart.png`, `magic-potion.png`, `coin-stack.png` (transparent) and `operator-upgrade.webp`.
- Store: wallet strip (coins / lives / magic), coin packs show the coin stack (bigger for bigger packs), life and magic supplies use the heart and potion art with your current counts.
- Play page: top bar shows coins (plus mission earnings), reserve lives and magic charges; the health bar uses the heart; the MAGIC button uses the potion.
- Home top bar coin pill uses the coin stack.
- `src/PlayerUpgrade.tsx` replaces the old upgrade dialog with the Player Upgrade layout (stats, soldier, skill tree, weapon slots, equip / confirm).
  - Every stat and skill node is a real upgrade track (SOLDIER / PARTNER / ARMY tabs) read by `game.ts`, so upgrades change gameplay. Only stats the game really has are shown: health, damage, fire rate, speed, stealth, aim.
  - Purchases still go through the existing `upgradeOne` / `serverEconomy.spend` path (hold a node to repeat). No wallet, payment, auth or backend file changed.
  - Weapon slots: PRIMARY is the equipped weapon (arrows cycle owned weapons, EQUIP LOADOUT applies it), SECONDARY is the weapon you switch to in a mission, GEAR shows lives and magic with a shortcut to the store.
  - Armor, crit chance, stamina, spare points and weapon attachments from the reference image do not exist in the game, so they are not shown as fake stats.
- `scripts/validate-assets.mjs` now checks the new art. `validate-assets` and `test:catalog` pass.

Not verified: full `tsc -b && vite build` (dependencies not installed here) and on-device play. The upgrade layout was checked in a browser with the real CSS at 844x390, 667x360 and 390x844.
