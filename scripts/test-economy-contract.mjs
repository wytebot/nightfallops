import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const catalog=await readFile(new URL('../src/catalog.ts',import.meta.url),'utf8');
const server=await readFile(new URL('../functions/index.js',import.meta.url),'utf8');
const client=await readFile(new URL('../src/serverEconomy.ts',import.meta.url),'utf8');
assert.match(server,/runTransaction\(async tx=>/,'spending must use a Firestore transaction');
assert.match(server,/tx\.create\(idem/,'idempotency receipt must be committed atomically');
assert.match(server,/tx\.create\(db\.collection\('nightfallLedger'\)/,'ledger must be committed atomically');
assert.match(server,/balanceBefore:before,balanceAfter:next\.coins/,'ledger records balances before and after');
assert.match(server,/before<cost/,'server rejects insufficient funds');
assert.match(server,/Number\.isSafeInteger\(cost\)/,'server validates safe integer prices');
assert.match(server,/const ownedArmyCount=Number\(w\.inventory\?\.armyCount\|\|w\.army\|\|0\)/,'upgrade prices use server-owned army count');
assert.doesNotMatch(server,/metadata\.armyCount/,'client metadata cannot alter army upgrade price');
assert.match(client,/localStorage\.getItem\(key\)/,'retry reuses a pending idempotency key');
assert.match(client,/localStorage\.removeItem\(key\)/,'successful purchase clears pending key');
for(const [id,price] of [['partner',1500],['army-10',12000],['army-20',22000]]){
 const catLine=catalog.split('\n').find(line=>line.includes(`id:'${id}'`));
 assert.ok(catLine,`catalog has ${id}`); assert.match(catLine,new RegExp(`coinPrice:${price}\\b`),`${id} client price`);
 const srvLine=server.split('\n').find(line=>line.includes(`'${id}':{count:`));
 assert.ok(srvLine,`server has ${id}`); assert.match(srvLine,new RegExp(`'${id}':\\{count:\\d+,coin:${price}\\b`),`${id} server price parity`);
}
console.log('Economy contract checks passed: atomic spend/ledger/idempotency, server-authoritative upgrade pricing, retry key reuse, and army coin-price parity.');

const paymentStatusRoute=server.match(/path==='payment-status'[\s\S]*?if\(path==='profile'/);
assert.ok(paymentStatusRoute,'server exposes authenticated payment-status reconciliation');
assert.match(paymentStatusRoute[0],/paymentSnap\.data\(\)\.uid!==uid/,'payment status is scoped to the authenticated owner');
assert.match(server,/Idempotency key was already used for a different purchase/,'idempotency key cannot be replayed for a different item');
assert.match(server,/nightfallDailyRewards/,'daily bonus is claimed transactionally on the server');
assert.match(server,/doc\(`cash_\$\{ref\}`\)/,'cash payment grants create a server ledger record');
assert.match(server,/already own this squad tier/,'cash checkout rejects already-owned squad tiers');
assert.match(client,/localStorage\.getItem\(key\)/,'purchase idempotency key survives WebView/app restarts');
console.log('Economy hardening checks passed: payload-bound idempotency, server daily reward, owner-scoped payment reconciliation and persistent retry keys.');
