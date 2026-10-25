import fs from 'node:fs';
import assert from 'node:assert/strict';
const game=fs.readFileSync(new URL('../src/game.ts',import.meta.url),'utf8');
assert.match(game,/triggerShot\(this,shooter,angle/,'player/partner/army shots must trigger the firing cycle');
assert.match(game,/triggerShot\(this,e,shotAngle/,'enemy and boss shots must trigger the firing cycle');
assert.match(game,/applyShotPose\(this,unit,now/,'pose must be applied to every unit each frame');
assert.match(game,/shotTilt/,'torso tilt must be applied in keepUpright');
console.log('Shot-cycle wiring checks passed.');
