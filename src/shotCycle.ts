import Phaser from 'phaser';
import { shotPose, kickFromRecoil } from './shotPose';

type Unit = Phaser.GameObjects.Container & Record<string, any>;
let liveFx = 0;

/** Pose 2 of the reference sheet (rifle shouldered, firing stance), cut out without its baked flash. Side-on, facing right. */
export const SHOOT_POSE = { key: 'pose-shoot', w: 373, h: 520, tipX: 372, tipY: 111, originX: 0.335, originY: 0.64 };
/** Weapons that read correctly with the shouldered-rifle art; heavy/exotic weapons keep their own held model. */
export const POSE_WEAPONS = new Set(['pistol', 'revolver', 'smg', 'assault-rifle', 'carbine', 'marksman', 'machine-gun', 'shotgun']);
const FX_CAP = 36;

/** Starburst muzzle flash + soft smoke puff, generated once (no extra image files needed). */
export function registerShotTextures(scene: Phaser.Scene) {
  if (!scene.textures.exists('fx-flash')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const W = 96, H = 64, cx = 10, cy = H / 2;
    // outer orange spikes pointing down the barrel axis (+x)
    g.fillStyle(0xff9a1f, 0.85);
    g.fillPoints([{x:cx,y:cy-5},{x:30,y:cy-20},{x:40,y:cy-7},{x:62,y:cy-12},{x:60,y:cy},{x:90,y:cy},{x:60,y:cy+2},{x:62,y:cy+12},{x:40,y:cy+7},{x:30,y:cy+20},{x:cx,y:cy+5}] as any, true);
    g.fillStyle(0xffd34a, 0.95);
    g.fillPoints([{x:cx,y:cy-4},{x:26,y:cy-12},{x:36,y:cy-3},{x:70,y:cy},{x:36,y:cy+3},{x:26,y:cy+12},{x:cx,y:cy+4}] as any, true);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(24, cy, 28, 11);
    g.generateTexture('fx-flash', W, H);
    g.destroy();
  }
  if (!scene.textures.exists('fx-smoke')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xc9c1b0, 0.35); g.fillCircle(16, 16, 15);
    g.fillStyle(0xd9d2c2, 0.5); g.fillCircle(13, 14, 10); g.fillCircle(20, 18, 8);
    g.generateTexture('fx-smoke', 32, 32);
    g.destroy();
  }
}

const GUN_FLASH: Record<string, number> = { pistol: .55, revolver: .8, smg: .6, shotgun: 1.15, 'assault-rifle': .85, carbine: .8, marksman: .95, 'machine-gun': 1, 'anti-material-rifle': 1.35, rpg: 1.4, minigun: 1.05 };

/** Call whenever any unit (player, partner, army member, enemy, boss) pulls the trigger. */
export function triggerShot(scene: Phaser.Scene, unit: Unit, angle: number, weaponId: string, recoil: number, intervalMs: number) {
  const now = scene.time.now, u = unit as any;
  const prev = Number(u.shotAt || -9999);
  u.shotAt = now;
  u.shotWeapon = weaponId;
  u.shotKick = kickFromRecoil(recoil);
  u.shotInterval = intervalMs;
  u.flashScale = GUN_FLASH[weaponId] ?? .8;
  // Off-screen units still animate their pose, but skip spawning world effects.
  const view = scene.cameras.main.worldView, m = 60;
  if (unit.x < view.x - m || unit.x > view.right + m || unit.y < view.y - m || unit.y > view.bottom + m) return;
  if (liveFx > FX_CAP) return;
  const gunLen = Number(u.gunLength || 40), c = Math.cos(angle), s = Math.sin(angle);
  const mx = unit.x + c * (10 + gunLen) - s * 0, my = unit.y + s * (10 + gunLen);
  const depth = unit.y + 6;
  // Smoke puff drifting forward off the muzzle (reference frame 2/3)
  const puff = scene.add.image(mx, my, 'fx-smoke').setDepth(depth).setAlpha(.7).setScale(.35 + (u.flashScale || .8) * .25).setRotation(Math.random() * 6);
  liveFx++;
  scene.tweens.add({ targets: puff, x: mx + c * 20 + Phaser.Math.Between(-4, 4), y: my + s * 20 - 6, alpha: 0, scale: puff.scale * 2.1, duration: 340, ease: 'Quad.easeOut', onComplete: () => { puff.destroy(); liveFx--; } });
  // Recoil motion lines behind the body (reference frame 3) – throttled so full-auto does not spam
  if (now - prev > 120) {
    const g = scene.add.graphics().setDepth(depth + 1);
    liveFx++;
    const bx = unit.x - c * 16, by = unit.y - s * 16, px = -s, py = c;
    g.lineStyle(1.6, 0x1b1b1b, .75);
    for (let i = -1; i <= 1; i++) {
      const ox = bx + px * i * 9, oy = by + py * i * 9;
      g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox - c * (10 + (i === 0 ? 5 : 0)), oy - s * (10 + (i === 0 ? 5 : 0))); g.strokePath();
    }
    scene.tweens.add({ targets: g, x: -c * 7, y: -s * 7, alpha: 0, duration: 170, onComplete: () => { g.destroy(); liveFx--; } });
  }
}

/**
 * Per-frame pose. Blends the firing cycle on top of the existing walk bob/sway.
 * @returns nothing; mutates sprite, held gun and muzzle flash of the unit.
 */
export function applyShotPose(scene: Phaser.Scene, unit: Unit, now: number, o: { moving: boolean; phase: number; a: number; reloadPose: boolean; fallbackShotAt: number }) {
  const u = unit as any;
  const shotAt = u.shotAt !== undefined ? Number(u.shotAt) : o.fallbackShotAt;
  const since = now - shotAt;
  const kick = Number(u.shotKick || 1), interval = Number(u.shotInterval || 400);
  const p = shotPose(since, interval, kick);
  const spr = u.characterSprite as Phaser.GameObjects.Image | undefined;
  const rot = unit.rotation;
  const facing = Math.cos(rot) >= 0 ? 1 : -1;
  // Pose 2 is held for as long as the unit keeps shooting (and a moment after), for every unit and every rifle-class weapon.
  const poseOn = !!spr && since >= 0 && since < 700 && !o.reloadPose && POSE_WEAPONS.has(String(u.shotWeapon)) && scene.textures.exists(SHOOT_POSE.key);
  let bs = 1;
  if (spr) {
    if (u.baseSprScale === undefined) { u.baseSprScale = spr.scaleX; u.idleKey = spr.texture.key; u.idleOX = spr.originX; u.idleOY = spr.originY; u.idleH = spr.height * spr.scaleX; }
    if (poseOn && !u.poseActive) { spr.setTexture(SHOOT_POSE.key); spr.setOrigin(SHOOT_POSE.originX, SHOOT_POSE.originY); u.poseActive = true; }
    else if (!poseOn && u.poseActive) { spr.setTexture(u.idleKey); spr.setOrigin(u.idleOX, u.idleOY); spr.setFlipX(false); u.poseActive = false; }
    bs = u.poseActive ? Number(u.idleH) / SHOOT_POSE.h : Number(u.baseSprScale);
    const base = u.baseSpriteY ?? spr.y; u.baseSpriteY = base;
    const bob = o.moving ? -Math.abs(Math.sin(o.phase)) * 2.6 * o.a : Math.sin(now * .0022 + o.phase) * .55;
    spr.y = base + bob + p.sprY;
    spr.x = p.sprX;
    spr.scaleX = bs * (1 + p.squash); spr.scaleY = bs * (1 - p.squash * .6);
    if (u.poseActive) {
      spr.setFlipX(facing < 0);
      // The art points straight along the screen's horizontal; tip it toward the real aim direction (up/down) so the rifle tracks the target.
      const elev = Phaser.Math.Angle.Wrap(facing > 0 ? rot : rot + Math.PI);
      u.shotTilt = Phaser.Math.Clamp(elev, -1.2, 1.2) * .75 - p.tilt * facing * .6;
    } else {
      u.shotTilt = -p.tilt * facing; // read by keepUpright()
    }
  }
  const unitLegs = [u.legL, u.legR] as (Phaser.GameObjects.Graphics | undefined)[];
  for (const l of unitLegs) if (l && l.visible === u.poseActive) l.setVisible(!u.poseActive); // pose art carries its own planted legs
  const gun = unit.getByName('held-gun') as Phaser.GameObjects.Image | null;
  if (gun) {
    gun.setVisible(!u.poseActive); // the shouldered rifle is part of the pose art
    const aiming = p.phase !== 'idle';
    const raise = aiming ? 0 : (o.moving ? 1.2 : 0);
    const sway = o.moving ? Math.sin(o.phase + Math.PI / 2) * 1.4 * o.a : 0;
    gun.x = 10 + p.gunX;
    gun.y = 10 + (aiming ? p.gunY : raise) + sway + (o.reloadPose ? 5 : 0);
    gun.rotation = (o.reloadPose ? .45 : 0) + p.gunRot + (o.moving && !aiming ? Math.sin(o.phase) * .03 * o.a : 0);
  }
  const flash = unit.getByName('muzzle') as Phaser.GameObjects.Image | null;
  if (flash) {
    const show = p.flash > 0;
    flash.setVisible(show);
    if (show) {
      flash.setScale((.55 + Math.random() * .25) * Number(u.flashScale || .8) * (0.6 + p.flash * .4));
      if (u.poseActive && spr) {
        // Put the flash on the pose art's barrel tip: sprite-local tip -> screen (tilt + flip) -> container-local.
        const th = Number(u.shotTilt || 0), ct = Math.cos(th), st = Math.sin(th);
        const tx = facing * (SHOOT_POSE.tipX - SHOOT_POSE.originX * SHOOT_POSE.w) * bs, ty = (SHOOT_POSE.tipY - SHOOT_POSE.originY * SHOOT_POSE.h) * bs;
        const cr = Math.cos(rot), sr = Math.sin(rot);
        const sx = spr.x * cr - spr.y * sr + (tx * ct - ty * st), sy = spr.x * sr + spr.y * cr + (tx * st + ty * ct);
        flash.x = sx * cr + sy * sr; flash.y = -sx * sr + sy * cr;
        flash.setRotation((facing > 0 ? 0 : Math.PI) + th - rot + (Math.random() - .5) * .25);
      } else {
        const len = Number(u.gunLength || 40);
        flash.setRotation((Math.random() - .5) * .35);
        flash.x = (gun ? gun.x : 10) + len; flash.y = (gun ? gun.y : 10) + len * Math.sin(gun ? gun.rotation : 0);
      }
    }
  }
}
