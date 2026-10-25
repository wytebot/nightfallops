import { useMemo, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { upgradeTracks, upgradeCost, upgradeValue, weapons, getWeapon, weaponDps, type UpgradeStat, type UpgradeTrack } from './catalog';

type Group = 'SOLDIER' | 'PARTNER' | 'ARMY';

export type PlayerUpgradeProps = {
  coins: number;
  lives: number;
  magic: number;
  army: number;
  skin: string;
  bestLevel: number;
  upgradeLevels: Record<string, number>;
  equippedWeaponId: string;
  ownedWeaponIds: string[];
  group: Group;
  setGroup: (group: Group) => void;
  onUpgrade: (id: UpgradeStat, group: Group) => void;
  onHoldStart: (id: UpgradeStat, group: Group) => void;
  onHoldEnd: () => void;
  skipClick: MutableRefObject<boolean>;
  onEquip: (weaponId: string) => void;
  onClose: () => void;
  onStore: () => void;
  onSaved: () => void;
  asset: (path: string) => string;
  coinBurn: boolean;
};

/** Skill-tree branches. Every node is a real upgrade track that the game reads during missions. */
const BRANCHES: Array<{ name: string; ids: UpgradeStat[] }> = [
  { name: 'COMBAT', ids: ['damage', 'fireRate'] },
  { name: 'DEFENSE', ids: ['health'] },
  { name: 'MOBILITY', ids: ['moveSpeed', 'stealth'] },
  { name: 'PRECISION', ids: ['squadAccuracy'] },
];

const fmt = (track: UpgradeTrack, value: number) => `${value.toFixed(track.unit === '%' || track.unit === 'HP' ? 0 : 2)} ${track.unit}`;

export default function PlayerUpgrade(p: PlayerUpgradeProps) {
  const tracks = upgradeTracks[p.group];
  const level = (id: UpgradeStat) => p.upgradeLevels[`${p.group}:${id}`] || 0;
  const track = (id: UpgradeStat) => tracks.find(t => t.id === id)!;
  const costOf = (t: UpgradeTrack) => upgradeCost(t, level(t.id), p.group === 'ARMY' ? Math.max(1, p.army) : 1, p.group);

  const owned = useMemo(() => {
    const ids = weapons.filter(w => p.ownedWeaponIds.includes(w.id)).map(w => w.id);
    return ids.length ? ids : ['pistol'];
  }, [p.ownedWeaponIds]);
  const [pick, setPick] = useState(p.equippedWeaponId);
  const pickId = owned.includes(pick) ? pick : owned[0];
  const pickIndex = owned.indexOf(pickId);
  const weapon = getWeapon(pickId);
  const reserveWeapon = owned.length > 1 ? getWeapon(owned[(owned.indexOf(p.equippedWeaponId) + 1) % owned.length]) : null;

  const dmg = upgradeValue(track('damage'), level('damage'));
  const rate = upgradeValue(track('fireRate'), level('fireRate'));
  const effectiveDps = weaponDps(weapon) * dmg * rate;
  const power = Math.round(100 + Object.values(p.upgradeLevels).reduce<number>((sum, v) => sum + Number(v), 0) * 12 + p.army * 8);

  const affordable = tracks
    .filter(t => level(t.id) < t.maxLevel && costOf(t) <= p.coins)
    .sort((a, b) => costOf(a) - costOf(b));
  const cheapest = affordable[0];

  const nodeButtonProps = (t: UpgradeTrack, capped: boolean, short: boolean) => ({
    disabled: capped || short,
    onPointerDown: (e: ReactPointerEvent) => { e.preventDefault(); p.onHoldStart(t.id, p.group); },
    onPointerUp: p.onHoldEnd,
    onPointerCancel: p.onHoldEnd,
    onPointerLeave: p.onHoldEnd,
    onClick: () => { if (p.skipClick.current) { p.skipClick.current = false; return; } p.onUpgrade(t.id, p.group); },
  });

  const equippedChanged = pickId !== p.equippedWeaponId;

  return (
    <div className="pu-screen" role="dialog" aria-label="Player upgrade">
      <header className="pu-head">
        <div className="pu-title">
          <h2>PLAYER UPGRADE</h2>
          <small>{p.group === 'SOLDIER' ? 'SOLDIER' : p.group === 'PARTNER' ? 'PARTNER' : `ARMY ×${p.army}`} — {p.skin.toUpperCase()} · POWER {power} · BEST LEVEL {p.bestLevel}</small>
        </div>
        <nav className="pu-tabs">
        {(['SOLDIER', 'PARTNER', 'ARMY'] as const).map(g => (
          <button key={g} className={p.group === g ? 'active' : ''} onClick={() => p.setGroup(g)}>{g}</button>
        ))}
      </nav>
        <div className="pu-wallet">
          <span className={`pu-chip pu-coins ${p.coinBurn ? 'burn' : ''}`}><img src={p.asset('ui/coin-stack.png')} alt="" /><b>{p.coins.toLocaleString()}</b><small>COINS</small></span>
          <span className="pu-chip"><img src={p.asset('ui/life-heart.png')} alt="" /><b>{p.lives}</b><small>LIVES</small></span>
          <span className="pu-chip"><img src={p.asset('ui/magic-potion.png')} alt="" /><b>{p.magic}</b><small>MAGIC</small></span>
        </div>
        <button className="pu-close" onClick={p.onClose} aria-label="Close upgrades"><X size={20} /></button>
      </header>


      <div className="pu-body">
        <section className="pu-panel pu-stats">
          <h3>STATS</h3>
          {tracks.map(t => {
            const lv = level(t.id);
            return (
              <div className="pu-stat" key={t.id}>
                <div className="pu-stat-top"><span>{t.name.toUpperCase()}</span><b>{fmt(t, upgradeValue(t, lv))}</b></div>
                <div className="pu-bar"><i style={{ width: `${(lv / t.maxLevel) * 100}%` }} /></div>
              </div>
            );
          })}
          <div className="pu-dps"><span>DPS · {weapon.name.toUpperCase()}</span><b>{effectiveDps.toFixed(1)}</b></div>
          <button className="pu-wide" disabled={!cheapest} onClick={() => cheapest && p.onUpgrade(cheapest.id, p.group)}>
            <Plus size={14} /> {cheapest ? `UPGRADE ${cheapest.name.toUpperCase()} · ${costOf(cheapest).toLocaleString()}` : 'NOTHING AFFORDABLE'}
          </button>
        </section>

        <section className="pu-hero" aria-hidden="true">
          <div className="pu-rings" />
          <img src={p.asset('ui/operator-upgrade.webp')} alt="" />
          <span className="pu-skin-tag">{p.skin.toUpperCase()}</span>
        </section>

        <section className="pu-panel pu-tree">
          <h3>SKILL TREE</h3>
          {BRANCHES.map(branch => (
            <div className="pu-branch" key={branch.name}>
              <small>{branch.name}</small>
              {branch.ids.map(id => {
                const t = track(id);
                const lv = level(id);
                const capped = lv >= t.maxLevel;
                const cost = costOf(t);
                const short = !capped && p.coins < cost;
                return (
                  <button key={id} className={`pu-node ${capped ? 'maxed' : lv > 0 ? 'active' : ''} ${short ? 'short' : ''}`} {...nodeButtonProps(t, capped, short)}>
                    <span className="pu-node-icon">{capped ? <Check size={16} /> : lv}</span>
                    <span className="pu-node-main">
                      <b>{t.name}</b>
                      <em>LV {lv}/{t.maxLevel} · {fmt(t, upgradeValue(t, lv))}{capped ? '' : ` → ${fmt(t, upgradeValue(t, lv + 1))}`}</em>
                      <i className="pu-pips">{Array.from({ length: t.maxLevel }, (_, i) => <u key={i} className={i < lv ? 'on' : ''} />)}</i>
                    </span>
                    <span className="pu-node-cost">{capped ? 'MAX' : short ? `NEED ${(cost - p.coins).toLocaleString()}` : <><img src={p.asset('ui/coin-stack.png')} alt="" />{cost.toLocaleString()}</>}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </section>
      </div>

      <section className="pu-slots">
        <h3>WEAPON UPGRADE SLOTS</h3>
        <div className="pu-slot-row">
          <article className={`pu-slot ${equippedChanged ? 'pending' : ''}`}>
            <img className="pu-weapon-img" src={weapon.image ? p.asset(weapon.image) : p.asset('ui/coin-stack.png')} alt="" style={weapon.image ? undefined : { opacity: 0.25 }} />
            <div>
              <small>PRIMARY{equippedChanged ? ' · NOT EQUIPPED' : ' · EQUIPPED'}</small>
              <b>{weapon.name.toUpperCase()}</b>
              <em>{weapon.tier} · DMG {weapon.stats.damage} · RNG {weapon.stats.range}</em>
            </div>
            <div className="pu-slot-actions">
              <button disabled={owned.length < 2} onClick={() => setPick(owned[(pickIndex - 1 + owned.length) % owned.length])} aria-label="Previous weapon">‹</button>
              <button disabled={owned.length < 2} onClick={() => setPick(owned[(pickIndex + 1) % owned.length])} aria-label="Next weapon">›</button>
            </div>
          </article>
          <article className="pu-slot">
            {reserveWeapon?.image ? <img className="pu-weapon-img" src={p.asset(reserveWeapon.image)} alt="" /> : <span className="pu-weapon-img" />}
            <div>
              <small>SECONDARY · SWITCH IN MISSION</small>
              <b>{reserveWeapon ? reserveWeapon.name.toUpperCase() : 'EMPTY'}</b>
              <em>{reserveWeapon ? `${reserveWeapon.tier} · DMG ${reserveWeapon.stats.damage}` : 'Buy another weapon in the store'}</em>
            </div>
            <div className="pu-slot-actions"><button onClick={p.onStore} aria-label="Open store"><Plus size={14} /></button></div>
          </article>
          <article className="pu-slot">
            <span className="pu-supply"><img src={p.asset('ui/life-heart.png')} alt="" /><b>×{p.lives}</b></span>
            <span className="pu-supply"><img src={p.asset('ui/magic-potion.png')} alt="" /><b>×{p.magic}</b></span>
            <div>
              <small>GEAR · SUPPLIES</small>
              <b>LIVES &amp; MAGIC</b>
              <em>2 bombs every mission</em>
            </div>
            <div className="pu-slot-actions"><button onClick={p.onStore} aria-label="Buy supplies"><Plus size={14} /></button></div>
          </article>
        </div>
      </section>

      <footer className="pu-actions">
        <button className="pu-ghost" disabled={!equippedChanged} onClick={() => p.onEquip(pickId)}>[ EQUIP LOADOUT ]</button>
        <button className="pu-confirm" onClick={p.onSaved}>[ CONFIRM &amp; SAVE LOADOUT ]</button>
      </footer>
    </div>
  );
}
