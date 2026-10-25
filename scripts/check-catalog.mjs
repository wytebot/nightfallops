import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
let ts;
try { ts=require('typescript'); }
catch { throw new Error('Install project dependencies first (`npm install`) to run the catalog checks.'); }
const catalogSource=await readFile(new URL('../src/catalog.ts',import.meta.url),'utf8');
const js=ts.transpileModule(catalogSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const api=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const gameSource=await readFile(new URL('../src/game.ts',import.meta.url),'utf8');
assert.equal(api.NGN_PER_USD,1200,'NGN conversion constant');
assert.deepEqual(api.coinPacks.map(x=>[x.coins,x.usdPrice,x.ngnPrice]),[[5000,1.99,2400],[10000,2.99,3600],[20000,3.99,4800],[50000,6.99,8400]],'coin pack prices');
assert.deepEqual(api.squads.map(x=>[x.count,x.coinPrice,x.usdPrice,x.ngnPrice]),[[1,1500,.99,1200],[10,12000,4.99,6000],[20,22000,8.99,10800]],'squad prices');
const serverSourceForPrices=await readFile(new URL('../functions/index.js',import.meta.url),'utf8');
for (const [id,price] of [['partner',1500],['army-10',12000],['army-20',22000]]) { const start=serverSourceForPrices.indexOf(`'${id}':{`); assert.ok(start>=0,`server coin price for ${id} exists`); const fragment=serverSourceForPrices.slice(start,start+70); const match=fragment.match(/coin:(\d+)/); assert.ok(match,`server coin field for ${id} exists`); assert.equal(Number(match[1]),price,`${id} client/server coin price parity`); }
for(const weapon of api.weapons){
  assert.deepEqual(api.getWeapon(weapon.id).stats,weapon.stats,`${weapon.id} combat stats must come from the catalog`);
  assert.equal(api.weaponDps(api.getWeapon(weapon.id)),weapon.stats.damage*weapon.stats.pellets*weapon.stats.fireRate,`${weapon.id} DPS uses the catalog stats`);
}
for(let i=1;i<api.weapons.length;i++) assert.ok(api.weaponDps(api.weapons[i])>=api.weaponDps(api.weapons[i-1]),`${api.weapons[i].name} should not be weaker in displayed base DPS than previous shelf item`);
const coinPriced=api.weapons.filter(w=>w.coinPrice!=null);
for(let i=1;i<coinPriced.length;i++) assert.ok(coinPriced[i].coinPrice>=coinPriced[i-1].coinPrice,`${coinPriced[i].name} should not cost fewer coins than the previous coin-priced weapon`);
for(const id of ['hand-grenade','grenade-launcher','rpg','flamethrower']) assert.ok(api.weapons.some(w=>w.id===id),`missing requested weapon: ${id}`);
assert.equal(api.getWeapon('rpg').stats.projectile,'rocket','RPG must use rocket projectile behavior');
assert.equal(api.getWeapon('hand-grenade').stats.projectile,'grenade','hand grenade must use timed explosive behavior');
assert.equal(api.getWeapon('grenade-launcher').stats.projectile,'grenade','grenade launcher must use explosive projectile behavior');
assert.equal(api.getWeapon('flamethrower').stats.projectile,'flame','flamethrower must use flame projectile behavior');
for(const group of ['SOLDIER','PARTNER','ARMY']) {
  assert.deepEqual(new Set(api.upgradeTracks[group].map(track=>track.id)),new Set(['health','damage','fireRate','moveSpeed','stealth','squadAccuracy']),`${group} should expose all six upgrade stats`);
  for(const track of api.upgradeTracks[group]) assert.ok(api.upgradeCost(track,1,10,group)>api.upgradeCost(track,0,10,group),`${group} ${track.id} upgrade cost must grow per level`);
}
assert.match(gameSource,/getWeapon\(this\.equippedWeaponId\)/,'scene combat reads equipped weapon stats from catalog');
assert.match(gameSource,/bullet\.setData\('damage',weapon\.stats\.damage/,'catalog damage is used by scene projectiles');
assert.match(gameSource,/weapon\.stats\.fireRate/,'catalog fire rate is used by scene combat');
assert.match(gameSource,/weapon\.stats\.range/,'catalog range is used by scene projectile lifetime');
assert.match(gameSource,/detonateAt\(/,'explosive weapons must have an impact / fuse detonation path');
assert.match(gameSource,/projectileKind==='rocket'\|\|projectileKind==='grenade'/,'rocket and grenade collisions must trigger blast damage');
assert.match(gameSource,/!list\.includes\(b\)/,'pooled bullets must not be duplicated in the update array');
assert.match(gameSource,/dt=Math\.min\(50,Math\.max\(0,dt\)\)/,'large frame gaps must be clamped after app resume');
assert.doesNotMatch(gameSource,/physics\.world\.pause\(\)/,'enemy kill effects must not freeze the entire simulation');
const providerSource=await readFile(new URL('../src/purchaseProvider.ts',import.meta.url),'utf8');
assert.match(providerSource,/serverEconomy\.checkout/,'cash checkout must call the server provider');
assert.doesNotMatch(providerSource,/flutterwave|secretKey|secret_key/i,'no payment credentials or Flutterwave implementation in client provider');
const serverSource=await readFile(new URL('../functions/index.js',import.meta.url),'utf8');
assert.match(serverSource,/runTransaction/,'coin deductions must use Firestore transactions');
assert.match(serverSource,/FLW_SECRET_KEY/,'Flutterwave secret must stay server-side');
assert.match(serverSource,/charge\.completed/,'payment grants must be webhook-driven');
assert.match(serverSource,/nightfallRequests/,'spend requests must be idempotent');
console.log(`Catalog checks passed: ${api.weapons.length} weapons including RPG/grenades/flamethrower, projectile behavior, stat wiring, DPS ordering, upgrade cost curves, price parity and checkout isolation.`);
