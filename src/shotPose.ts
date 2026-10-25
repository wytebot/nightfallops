/**
 * Four-beat firing cycle taken from the soldier reference sheet:
 *   1. AIM     – rifle shouldered, body leaning into the sight line
 *   2. FIRE    – muzzle flash + smoke, rifle punches forward
 *   3. RECOIL  – rifle kicks back/up, torso jolts and twists, motion lines
 *   4. RECOVER – rifle drops to a lowered ready position, then settles back to AIM
 * Pure maths (no Phaser) so it can be unit-tested in Node.
 * Units: px in the unit's local space (aim axis = +x), radians, ms.
 */
export type ShotPhase = 'idle' | 'aim' | 'fire' | 'recoil' | 'recover';
export type ShotPose = {
  phase: ShotPhase;
  gunX: number; gunY: number; gunRot: number; // held weapon offsets
  sprX: number; sprY: number;                  // body shift (negative x = pushed back)
  tilt: number;                                // + = leaning backwards, − = leaning into the shot
  squash: number;                              // + = wider/shorter body
  flash: number;                               // 0..1 muzzle flash strength
  lines: number;                               // 0..1 motion-line strength (recoil beat)
};

export const SHOT_TIMING = { fire: 55, recoil: 170, recover: 380, aimHold: 700, relax: 950 };

type Key = [number, number, number, number, number, number, number, number]; // t, gunX, gunY, gunRot, sprX, sprY, tilt, squash

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** @param since ms since the trigger was pulled  @param interval ms between shots (rapid fire never fully lowers the rifle)  @param kick 0.65–1.5 weapon recoil scale */
export function shotPose(since: number, interval: number, kick: number): ShotPose {
  const idle: ShotPose = { phase: 'idle', gunX: 0, gunY: 0, gunRot: 0, sprX: 0, sprY: 0, tilt: 0, squash: 0, flash: 0, lines: 0 };
  if (!(since >= 0) || since >= SHOT_TIMING.relax) return idle;
  const dip = Math.max(0, Math.min(1, (interval - 260) / 500));      // lowered-rifle depth for slow weapons
  const k = kick;
  const keys: Key[] = [
    [0,   1.5, -2.2, 0,          0.6,  0,       -0.03, 0.010],
    [55, -7 * k, -2.2 - 0.8 * k, -0.16 * k, -3.2 * k, 1.2 * k, 0.11 * k, -0.020 * k],
    [170, -3 * k, -2.2, -0.07 * k, -1.4 * k, 0.4 * k, 0.05 * k, 0],
    [290, -0.6, -2.2 + 3 * dip, 0.30 * dip, 0, 0, -0.01, 0],
    [380, 0, -2.2, 0, 0, 0, -0.04, 0],
    [SHOT_TIMING.aimHold, 0, -2.2, 0, 0, 0, -0.04, 0],
    [SHOT_TIMING.relax, 0, 0, 0, 0, 0, 0, 0],
  ];
  let i = 0;
  while (i < keys.length - 2 && since > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1];
  const t = smooth(Math.max(0, Math.min(1, (since - a[0]) / Math.max(1, b[0] - a[0]))));
  const phase: ShotPhase = since < SHOT_TIMING.fire ? 'fire' : since < SHOT_TIMING.recoil ? 'recoil' : since < SHOT_TIMING.recover ? 'recover' : 'aim';
  return {
    phase,
    gunX: lerp(a[1], b[1], t), gunY: lerp(a[2], b[2], t), gunRot: lerp(a[3], b[3], t),
    sprX: lerp(a[4], b[4], t), sprY: lerp(a[5], b[5], t), tilt: lerp(a[6], b[6], t), squash: lerp(a[7], b[7], t),
    flash: since < SHOT_TIMING.fire ? 1 - since / SHOT_TIMING.fire * 0.45 : 0,
    lines: since >= SHOT_TIMING.fire && since < SHOT_TIMING.recoil ? 1 - (since - SHOT_TIMING.fire) / (SHOT_TIMING.recoil - SHOT_TIMING.fire) : 0,
  };
}

/** Weapon recoil stat (0.08–1) → body/rifle kick scale. */
export const kickFromRecoil = (recoil: number) => Math.max(0.65, Math.min(1.5, 0.65 + recoil * 0.9));
