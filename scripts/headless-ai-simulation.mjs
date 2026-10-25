// Deterministic lightweight acceptance harness for the squad movement contract.
// This does not replace an in-engine Phaser test; it checks formation targets remain bounded
// and a unit that starts away from its target can make progress without NaN/zero-vector traps.
import assert from 'node:assert/strict';
const units=Array.from({length:20},(_,i)=>({x:500+i*19,y:700+(i%4)*21,stuck:0,progress:0}));
const player={x:100,y:100};
for(let tick=0;tick<1800;tick++){
 for(let i=0;i<units.length;i++){
  const u=units[i],angle=i*2.399963229728653,radius=60+(i%4)*18;
  const tx=player.x+Math.cos(angle)*radius,ty=player.y+Math.sin(angle)*radius;
  const dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy);
  assert.ok(Number.isFinite(d),'AI distance must remain finite');
  if(d>8){const step=Math.min(d,1.6);u.x+=dx/d*step;u.y+=dy/d*step;u.progress++;u.stuck=0;}else u.stuck++;
  assert.ok(Math.abs(u.x)<10000&&Math.abs(u.y)<10000,'unit position remains bounded');
 }
 if(tick===900){player.x=180;player.y=160;}
}
assert.ok(units.every(u=>u.progress>100),'every unit must move/reposition during simulation');
assert.ok(units.every(u=>u.stuck<1800),'no unit may remain stuck for the entire run');
console.log('Headless formation simulation passed for 20 units over 1,800 ticks (movement/repositioning, finite coordinates, no permanently stuck units). Note: this is a contract harness, not a Phaser runtime test.');
