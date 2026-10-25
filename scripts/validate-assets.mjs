// Validates character art, weapon art and audio files referenced by the game. No dependencies required.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root));
const exists = async (p) => { try { await access(new URL(p, root)); return true; } catch { return false; } };

function decodePng(buf) {
  assert.equal(buf.subarray(1, 4).toString(), 'PNG', 'not a PNG');
  let pos = 8, w = 0, h = 0, depth = 0, type = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), kind = buf.subarray(pos + 4, pos + 8).toString(), data = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; assert.equal(data[12], 0, 'interlaced PNG not supported'); }
    if (kind === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  assert.equal(depth, 8, 'expected 8-bit PNG'); assert.equal(type, 6, 'expected RGBA PNG (colour type 6)');
  const raw = inflateSync(Buffer.concat(idat)), bpp = 4, stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, px: out };
}
// Connected components of visible pixels (8-neighbour, on a 2px grid with a small bridge) to detect stray labels/fragments.
function components(img) {
  const gw = Math.ceil(img.w / 2), gh = Math.ceil(img.h / 2), solid = new Uint8Array(gw * gh);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (img.px[(y * img.w + x) * 4 + 3] > 40) solid[(y >> 1) * gw + (x >> 1)] = 1;
  const bridged = new Uint8Array(gw * gh);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (solid[y * gw + x]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < gw && ny < gh) bridged[ny * gw + nx] = 1; }
  const seen = new Uint8Array(gw * gh), sizes = [];
  for (let i = 0; i < gw * gh; i++) {
    if (!bridged[i] || seen[i]) continue; let size = 0; const stack = [i]; seen[i] = 1;
    while (stack.length) { const c = stack.pop(); if (solid[c]) size++; const cx = c % gw, cy = (c / gw) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue; const n = ny * gw + nx; if (bridged[n] && !seen[n]) { seen[n] = 1; stack.push(n); } } }
    sizes.push(size);
  }
  return sizes.sort((a, b) => b - a);
}
const problems = [];
// ---- Characters: every operator the game or menus load
const gameSource = (await read('src/game.ts')).toString(), appSource = (await read('src/App.tsx')).toString();
const referenced = new Set([...(gameSource + appSource).matchAll(/\/operators\/([a-z0-9-]+)\.png/g)].map(m => m[1]));
for (const skin of ['recon', 'heavy', 'shadow']) referenced.add(skin);
for (let n = 4; n <= 9; n++) referenced.add(`operator-0${n}`);
for (const name of [...referenced].sort()) {
  const file = `public/operators/${name}.png`;
  if (!(await exists(file))) { problems.push(`${file}: missing`); continue; }
  const img = decodePng(await read(file));
  const corner = [0, (img.w - 1) * 4, (img.h - 1) * img.w * 4, ((img.h - 1) * img.w + img.w - 1) * 4].map(i => img.px[i + 3]);
  if (corner.some(a => a > 8)) problems.push(`${file}: corners are not transparent (background not removed)`);
  const parts = components(img);
  if (parts.length > 1 && parts[1] > parts[0] * 0.003) problems.push(`${file}: ${parts.length} separate pieces — stray label or fragment (sizes ${parts.slice(0, 4).join(', ')})`);
  if (img.h < 600 || img.h / img.w < 1.6) problems.push(`${file}: unexpected size ${img.w}x${img.h} (expected a tall standing figure)`);
}
// ---- Weapons: every catalog image exists, is RGBA, transparent, one piece and wider than tall (barrel to the right)
const catalogSource = (await read('src/catalog.ts')).toString();
for (const m of catalogSource.matchAll(/image:'(\/weapons\/[a-z0-9-]+\.png)'/g)) {
  const file = `public${m[1]}`;
  if (!(await exists(file))) { problems.push(`${file}: missing`); continue; }
  const img = decodePng(await read(file));
  if (img.px[3] > 8) problems.push(`${file}: top-left pixel is opaque (background not removed)`);
  if (img.w < img.h) problems.push(`${file}: expected horizontal art (barrel pointing right)`);
  const parts = components(img);
  if (parts.length > 1 && parts[1] > parts[0] * 0.01) problems.push(`${file}: ${parts.length} separate pieces`);
}
// ---- Audio: every file the audio engine loads must exist and be non-trivial
const audioSource = (await read('src/audio.ts')).toString();
for (const m of audioSource.matchAll(/'(\/audio\/[a-z0-9-]+\.mp3)'/g)) {
  const file = `public${m[1]}`;
  if (!(await exists(file))) problems.push(`${file}: missing`);
  else if ((await read(file)).length < 1000) problems.push(`${file}: suspiciously small`);
}
// ---- Per-weapon audio slots: every catalog weapon must have a fire sample.
const weaponIds = ['pistol','revolver','smg','assault-rifle','carbine','marksman','machine-gun','shotgun','anti-material-rifle','minigun','rpg','grenade-launcher','hand-grenade','flamethrower','plasma-rifle','rail-cannon','legendary'];
for (const id of weaponIds) {
  const file = `public/audio/weapons/${id}/fire.mp3`;
  if (!(await exists(file))) problems.push(`${file}: missing required weapon fire slot`);
  else if ((await read(file)).length < 1000) problems.push(`${file}: suspiciously small`);
}
for (const file of ['public/audio/sfx-bomb-explosion.mp3','public/audio/sfx-bullet-whiz.mp3','public/audio/sfx-enemy-pain.mp3']) {
  if (!(await exists(file))) problems.push(`${file}: missing shared supplied sound`);
}
// ---- Server price table must contain every coin-priced weapon at the catalog price
const server = (await read('functions/index.js')).toString();
for (const m of catalogSource.matchAll(/\{id:'([a-z-]+)',(?:image:'[^']*',)?name:'[^']*',tier:'[A-Za-z]+',description:'[^']*',coinPrice:(\d+)/g)) {
  if (!['hand-grenade'].includes(m[1]) && !new RegExp(`['"]?${m[1]}['"]?:\\{coin:${m[2]}[,}]`).test(server)) problems.push(`server weapon table is missing ${m[1]} at ${m[2]} coins`);
}
// ---- v15 UI art: life heart, magic potion, coin stack and the upgrade-screen operator must ship and be referenced
for (const file of ['public/ui/life-heart.png','public/ui/magic-potion.png','public/ui/coin-stack.png']) {
  if (!(await exists(file))) { problems.push(`${file}: missing`); continue; }
  const img = decodePng(await read(file));
  if ([0, (img.w - 1) * 4, (img.h - 1) * img.w * 4, ((img.h - 1) * img.w + img.w - 1) * 4].some(i => img.px[i + 3] > 8)) problems.push(`${file}: corners are not transparent`);
}
if (!(await exists('public/ui/operator-upgrade.webp'))) problems.push('public/ui/operator-upgrade.webp: missing');
for (const ref of ['ui/life-heart.png','ui/magic-potion.png','ui/coin-stack.png']) if (!appSource.includes(ref)) problems.push(`App.tsx does not use ${ref}`);
if (problems.length) { console.error('Asset validation FAILED:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`Asset validation passed: ${referenced.size} characters, weapon art, audio files and server weapon prices are consistent.`);
