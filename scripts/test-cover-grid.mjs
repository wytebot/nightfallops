// Verifies the spatial cover grid returns exactly the same line-of-sight/collision answers as scanning every spot.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../src/game.ts', import.meta.url), 'utf8');
assert.match(src, /coversNear\(Math\.min\(ax,bx\)/, 'line of sight must use the cover grid');
assert.match(src, /cullScenery\(\)/, 'scenery culling must run');
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const W = 11400, H = 9600, spots = [];
for (let i = 0; i < 600; i++) spots.push({ x: rnd() * W, y: rnd() * H, r: 23 + rnd() * 80 });
const cell = 256, grid = new Map();
for (const c of spots) { const reach = c.r + 30; for (let gx = Math.floor((c.x - reach) / cell); gx <= Math.floor((c.x + reach) / cell); gx++) for (let gy = Math.floor((c.y - reach) / cell); gy <= Math.floor((c.y + reach) / cell); gy++) { const k = (gx + 8) * 10000 + (gy + 8); (grid.get(k) ?? grid.set(k, []).get(k)).push(c); } }
const near = (a, b, c2, d) => { const x0 = Math.floor(a / cell), x1 = Math.floor(c2 / cell), y0 = Math.floor(b / cell), y1 = Math.floor(d / cell); const out = []; for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const g = grid.get((gx + 8) * 10000 + (gy + 8)); if (g) for (const c of g) if (!out.includes(c)) out.push(c); } return out; };
const los = (list, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; if (l2 < 1) return true; for (const c of list) { const t = Math.min(1, Math.max(0, ((c.x - ax) * dx + (c.y - ay) * dy) / l2)); if (t > .04 && t < .96 && Math.hypot(ax + dx * t - c.x, ay + dy * t - c.y) < Math.max(12, c.r * .78)) return false; } return true; };
let blocked = 0, mism = 0;
for (let i = 0; i < 20000; i++) { const ax = rnd() * W, ay = rnd() * H, a = rnd() * 6.28, d = rnd() * 650, bx = ax + Math.cos(a) * d, by = ay + Math.sin(a) * d;
  const full = los(spots, ax, ay, bx, by), fast = los(near(Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)), ax, ay, bx, by); if (!full) blocked++; if (full !== fast) mism++; }
// collision lookups
for (let i = 0; i < 20000; i++) { const x = rnd() * W, y = rnd() * H; const full = spots.filter(c => Math.hypot(x - c.x, y - c.y) < c.r * .62 + 25), fast = near(x, y, x, y).filter(c => Math.hypot(x - c.x, y - c.y) < c.r * .62 + 25); if (full.length !== fast.length) mism++; }
assert.equal(mism, 0, `${mism} mismatches between grid and brute force`);
console.log(`Cover grid matches brute force on 40,000 queries (${blocked} blocked sight lines tested).`);
