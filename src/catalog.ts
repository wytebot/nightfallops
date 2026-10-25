/** Single source of truth for displayed prices and combat/upgrade balance. */
export const NGN_PER_USD = 1200;
export type Tier = 'Common'|'Uncommon'|'Rare'|'Epic'|'Legendary';
export type CashPrice = { usdPrice:number; ngnPrice:number };
export type CatalogItem = { id:string; name:string; coinPrice?:number; usdPrice?:number; ngnPrice?:number; tier:Tier; description:string };
export const coinPacks: Array<CatalogItem & CashPrice & {coins:number}> = [
 {id:'coins-5000',name:'Field Cache',coins:5000,usdPrice:1.99,ngnPrice:2400,tier:'Common',description:'5,000 coins · 2,513 coins per dollar'},
 {id:'coins-10000',name:'Supply Crate',coins:10000,usdPrice:2.99,ngnPrice:3600,tier:'Uncommon',description:'10,000 coins · 3,344 coins per dollar'},
 {id:'coins-20000',name:'War Chest',coins:20000,usdPrice:3.99,ngnPrice:4800,tier:'Rare',description:'20,000 coins · 5,013 coins per dollar'},
 {id:'coins-50000',name:'Command Vault',coins:50000,usdPrice:6.99,ngnPrice:8400,tier:'Epic',description:'50,000 coins · 7,153 coins per dollar'}
];
export const squads: Array<CatalogItem & CashPrice & {count:number}> = [
 {id:'partner',name:'Partner ×1',count:1,coinPrice:1500,usdPrice:.99,ngnPrice:1200,tier:'Common',description:'One tactical partner'},
 {id:'army-10',name:'Strike Squad ×10',count:10,coinPrice:12000,usdPrice:4.99,ngnPrice:6000,tier:'Rare',description:'Ten additional soldiers'},
 {id:'army-20',name:'Battalion ×20',count:20,coinPrice:22000,usdPrice:8.99,ngnPrice:10800,tier:'Epic',description:'Twenty additional soldiers'}
];
export type ProjectileKind = 'bullet'|'rocket'|'grenade'|'flame';
export type WeaponStats = {damage:number; fireRate:number; range:number; accuracy:number; spread:number; pellets:number; pierce:number; splash:number; crit:number; recoil:number; speed:number; projectile?:ProjectileKind};
export type Weapon = CatalogItem & {stats:WeaponStats; coinPrice?:number; usdPrice?:number; ngnPrice?:number; special:string; /** Horizontal transparent art (barrel pointing right) used by the store, popup and held-weapon sprite. */ image?:string};
export const weapons: Weapon[] = [
 {id:'pistol',image:'/weapons/pistol.png',name:'Pistol',tier:'Common',description:'Reliable sidearm for first deployment.',coinPrice:0,stats:{damage:1,fireRate:2.8,range:520,accuracy:.94,spread:.018,pellets:1,pierce:0,splash:0,crit:.04,recoil:.08,speed:740},special:'Balanced'},
 {id:'revolver',image:'/weapons/revolver.png',name:'Revolver',tier:'Common',description:'Heavy six-shooter: slow, accurate and dependable at medium range.',coinPrice:200,stats:{damage:3.2,fireRate:1.5,range:560,accuracy:.95,spread:.014,pellets:1,pierce:0,splash:0,crit:.12,recoil:.3,speed:780},special:'Heavy rounds'},
 {id:'smg',image:'/weapons/smg.png',name:'SMG',tier:'Uncommon',description:'Fast handling at close range.',coinPrice:350,stats:{damage:1.2,fireRate:6.5,range:470,accuracy:.78,spread:.065,pellets:1,pierce:0,splash:0,crit:.06,recoil:.16,speed:740},special:'Rapid fire'},
 {id:'assault-rifle',image:'/weapons/assault-rifle.png',name:'Assault Rifle',tier:'Rare',description:'All-purpose automatic rifle.',coinPrice:900,stats:{damage:2,fireRate:5.2,range:680,accuracy:.88,spread:.035,pellets:1,pierce:0,splash:0,crit:.08,recoil:.2,speed:740},special:'Reliable automatic'},
 {id:'shotgun',image:'/weapons/shotgun.png',name:'Shotgun',tier:'Rare',description:'Wide pellet spread and brutal close-range impact.',coinPrice:1400,stats:{damage:1.15,fireRate:1.9,range:300,accuracy:.58,spread:.105,pellets:5,pierce:0,splash:0,crit:.08,recoil:.62,speed:560},special:'5-pellet spread'},
 {id:'hand-grenade',name:'Hand Grenade',tier:'Epic',description:'Throwable explosive with a short fuse and a wide blast radius.',coinPrice:2200,stats:{damage:20,fireRate:.56,range:560,accuracy:.94,spread:.012,pellets:1,pierce:0,splash:120,crit:0,recoil:.12,speed:430,projectile:'grenade'},special:'Timed explosive'},
 {id:'carbine',image:'/weapons/carbine.png',name:'Carbine (M4)',tier:'Epic',description:'Lightweight modular rifle with better range and handling than the AK.',coinPrice:2300,stats:{damage:2.3,fireRate:5,range:760,accuracy:.93,spread:.024,pellets:1,pierce:0,splash:0,crit:.1,recoil:.14,speed:800},special:'Stable handling'},
 {id:'marksman',image:'/weapons/marksman.png',name:'Marksman',tier:'Epic',description:'Accurate, high-damage precision weapon.',coinPrice:2600,stats:{damage:8.5,fireRate:1.4,range:900,accuracy:.98,spread:.008,pellets:1,pierce:1,splash:0,crit:.22,recoil:.48,speed:980},special:'Piercing precision'},
 {id:'machine-gun',image:'/weapons/machine-gun.png',name:'Machine Gun',tier:'Epic',description:'Sustained heavy fire with stronger recoil.',coinPrice:4200,stats:{damage:2.3,fireRate:7.1,range:720,accuracy:.72,spread:.075,pellets:1,pierce:0,splash:0,crit:.06,recoil:.55,speed:760},special:'Suppressive fire'},
 {id:'plasma-rifle',name:'Plasma Rifle',tier:'Epic',description:'Energetic shots with small impact bursts.',coinPrice:7000,usdPrice:3.99,ngnPrice:4800,stats:{damage:5.5,fireRate:3.2,range:760,accuracy:.9,spread:.025,pellets:1,pierce:0,splash:36,crit:.12,recoil:.28,speed:650},special:'Splash damage'},
 {id:'rail-cannon',name:'Rail Cannon',tier:'Legendary',description:'Heavy projectile that punches through targets.',coinPrice:12000,usdPrice:6.99,ngnPrice:8400,stats:{damage:22,fireRate:.85,range:1100,accuracy:.995,spread:.003,pellets:1,pierce:3,splash:0,crit:.2,recoil:.85,speed:1200},special:'Triple pierce'},
 {id:'anti-material-rifle',image:'/weapons/anti-material-rifle.png',name:'Anti-Material Rifle',tier:'Legendary',description:'Bolt-action long-range rifle that punches through two targets.',coinPrice:14000,stats:{damage:26,fireRate:.8,range:1300,accuracy:.995,spread:.004,pellets:1,pierce:2,splash:0,crit:.24,recoil:1,speed:1250},special:'Double pierce'},
 {id:'legendary',name:'Aether Reaver',tier:'Legendary',description:'Experimental endgame weapon. Server entitlements remain authoritative.',usdPrice:9.99,ngnPrice:12000,stats:{damage:18,fireRate:1.2,range:1200,accuracy:.96,spread:.012,pellets:1,pierce:2,splash:64,crit:.28,recoil:.7,speed:1150},special:'Pierce + splash'},
 {id:'grenade-launcher',name:'Grenade Launcher',tier:'Legendary',description:'Lobbed explosive rounds for groups and cover-clearing.',coinPrice:16000,stats:{damage:18,fireRate:1.3,range:850,accuracy:.91,spread:.018,pellets:1,pierce:0,splash:150,crit:.04,recoil:.62,speed:540,projectile:'grenade'},special:'Large-radius blast'},
 {id:'rpg',image:'/weapons/rpg.png',name:'RPG-7',tier:'Legendary',description:'Heavy rocket launcher built for high-impact explosive strikes.',coinPrice:26000,stats:{damage:32,fireRate:.9,range:1250,accuracy:.94,spread:.01,pellets:1,pierce:0,splash:190,crit:.08,recoil:.9,speed:780,projectile:'rocket'},special:'Heavy rocket blast'},
 {id:'flamethrower',name:'Flamethrower',tier:'Legendary',description:'Close-range flame burst with persistent area damage.',coinPrice:32000,stats:{damage:4,fireRate:6,range:300,accuracy:.8,spread:.045,pellets:3,pierce:0,splash:46,crit:.02,recoil:.15,speed:390,projectile:'flame'},special:'Close-range flame cone'},
 {id:'minigun',image:'/weapons/minigun.png',name:'Minigun',tier:'Legendary',description:'Maximum firepower: a spinning Gatling barrel that shreds everything in front of you.',coinPrice:45000,stats:{damage:4.2,fireRate:18,range:760,accuracy:.7,spread:.085,pellets:1,pierce:0,splash:0,crit:.05,recoil:.72,speed:820},special:'Maximum firepower'}
];
export type UpgradeStat = 'health'|'damage'|'fireRate'|'moveSpeed'|'stealth'|'squadAccuracy';
export type UpgradeTrack = {id:UpgradeStat;name:string;icon:string;unit:string;base:number;step:number;maxLevel:number;baseCost:number;growth:number;description:string};
export const upgradeTracks: Record<'SOLDIER'|'PARTNER'|'ARMY', UpgradeTrack[]> = {
 SOLDIER:[
  {id:'health',name:'Field Health',icon:'♥',unit:'HP',base:10,step:1,maxLevel:10,baseCost:60,growth:1.32,description:'Increase player survivability'},
  {id:'damage',name:'Weapon Handling',icon:'✦',unit:'× damage',base:1,step:.12,maxLevel:12,baseCost:75,growth:1.35,description:'Boost damage without changing weapon identity'},
  {id:'fireRate',name:'Trigger Control',icon:'⚡',unit:'× rate',base:1,step:.06,maxLevel:10,baseCost:90,growth:1.34,description:'Shorten time between shots'},
  {id:'moveSpeed',name:'Mobility',icon:'➤',unit:'× speed',base:1,step:.035,maxLevel:10,baseCost:70,growth:1.3,description:'Move faster in the field'},
  {id:'stealth',name:'Shadow Training',icon:'◉',unit:'× stealth',base:1,step:.08,maxLevel:8,baseCost:95,growth:1.36,description:'Extend stealth window'},
  {id:'squadAccuracy',name:'Aim Precision',icon:'◎',unit:'%',base:55,step:4,maxLevel:10,baseCost:100,growth:1.32,description:'Reduce weapon spread and improve hit consistency'},
 ],
 PARTNER:[
  {id:'health',name:'Partner Health',icon:'♥',unit:'HP',base:10,step:2,maxLevel:10,baseCost:110,growth:1.36,description:'Keep your partner in the fight'},
  {id:'damage',name:'Partner Damage',icon:'✦',unit:'× damage',base:1,step:.18,maxLevel:10,baseCost:140,growth:1.4,description:'Increase partner weapon damage'},
  {id:'fireRate',name:'Partner Fire Rate',icon:'⚡',unit:'× rate',base:1,step:.08,maxLevel:8,baseCost:160,growth:1.4,description:'Improve partner firing cadence'},
  {id:'squadAccuracy',name:'Partner Accuracy',icon:'◎',unit:'%',base:55,step:4,maxLevel:10,baseCost:130,growth:1.38,description:'Improve partner target accuracy'},
  {id:'moveSpeed',name:'Partner Mobility',icon:'➤',unit:'× speed',base:1,step:.03,maxLevel:8,baseCost:145,growth:1.4,description:'Improve partner movement speed'},
  {id:'stealth',name:'Partner Fieldcraft',icon:'◉',unit:'× stealth',base:1,step:.06,maxLevel:8,baseCost:150,growth:1.4,description:'Reduce partner firing signature'},
 ],
 ARMY:[
  {id:'health',name:'Squad Armour',icon:'♥',unit:'HP',base:10,step:2,maxLevel:10,baseCost:85,growth:1.38,description:'Increase army unit health'},
  {id:'damage',name:'Squad Damage',icon:'✦',unit:'× damage',base:1,step:.14,maxLevel:10,baseCost:95,growth:1.42,description:'Increase army weapon damage'},
  {id:'fireRate',name:'Squad Drill',icon:'⚡',unit:'× rate',base:1,step:.06,maxLevel:8,baseCost:110,growth:1.42,description:'Improve army firing cadence'},
  {id:'squadAccuracy',name:'Squad Accuracy',icon:'◎',unit:'%',base:55,step:3,maxLevel:10,baseCost:120,growth:1.4,description:'Increase squad hit consistency'},
  {id:'moveSpeed',name:'Squad Mobility',icon:'➤',unit:'× speed',base:1,step:.025,maxLevel:8,baseCost:125,growth:1.42,description:'Improve squad movement speed'},
  {id:'stealth',name:'Squad Fieldcraft',icon:'◉',unit:'× stealth',base:1,step:.05,maxLevel:8,baseCost:135,growth:1.42,description:'Reduce squad firing signature'},
 ]
};
export function upgradeCost(track:UpgradeTrack,level:number,armyCount=1,group?:'SOLDIER'|'PARTNER'|'ARMY'){const groupFactor=group==='ARMY'?Math.max(1,Math.ceil(armyCount/5)):group==='PARTNER'?1.35:1;return Math.ceil(track.baseCost*Math.pow(track.growth,Math.max(0,level))*groupFactor);}
export function upgradeValue(track:UpgradeTrack,level:number){return track.base+track.step*level;}
export function getWeapon(id:string|undefined):Weapon{return weapons.find(w=>w.id===id)||weapons[0];}
export function formatNgn(value:number){return `₦${Math.round(value).toLocaleString('en-NG')}`;}
export function formatCash(item:{usdPrice?:number;ngnPrice?:number}){if(item.usdPrice==null&&item.ngnPrice==null)return 'FREE';const ngn=item.ngnPrice??Math.round((item.usdPrice??0)*NGN_PER_USD);const usd=item.usdPrice??ngn/NGN_PER_USD;return `$${usd.toFixed(2)} / ${formatNgn(ngn)}`;}
export function weaponDps(weapon:Weapon){return weapon.stats.damage*weapon.stats.pellets*weapon.stats.fireRate;}
export const supplies: Array<CatalogItem & {amount:number;kind:'life'|'magic';maxStack?:number}> = [
 {id:'life-1',name:'Extra Life',coinPrice:80,tier:'Common',description:'One reserve life',amount:1,kind:'life'},
 {id:'life-2',name:'Life Pack ×2',coinPrice:160,tier:'Uncommon',description:'Two reserve lives',amount:2,kind:'life'},
 {id:'life-4',name:'Life Pack ×4',coinPrice:300,tier:'Rare',description:'Four reserve lives',amount:4,kind:'life'},
 {id:'life-10',name:'Life Pack ×10',coinPrice:600,tier:'Epic',description:'Ten reserve lives',amount:10,kind:'life'},
 {id:'life-20',name:'Life Pack ×20',coinPrice:1000,tier:'Legendary',description:'Twenty reserve lives',amount:20,kind:'life'},
 {id:'magic-1',name:'Magic Charge ×1',coinPrice:70,tier:'Common',description:'One 5-second invisibility and invulnerability charge',amount:1,kind:'magic'},
 {id:'magic-2',name:'Magic Pack ×2',coinPrice:120,tier:'Uncommon',description:'Two magic charges',amount:2,kind:'magic'},
 {id:'magic-4',name:'Magic Pack ×4',coinPrice:240,tier:'Rare',description:'Four magic charges',amount:4,kind:'magic'},
 {id:'magic-10',name:'Magic Pack ×10',coinPrice:500,tier:'Epic',description:'Ten magic charges',amount:10,kind:'magic'},
 {id:'magic-20',name:'Magic Pack ×20',coinPrice:900,tier:'Legendary',description:'Twenty magic charges',amount:20,kind:'magic'}
];
export const skins: Array<CatalogItem & {skin:'Recon'|'Heavy'|'Shadow'}> = [
 {id:'skin-recon',name:'Recon',coinPrice:0,tier:'Common',description:'Balanced field kit',skin:'Recon'},
 {id:'skin-heavy',name:'Heavy',coinPrice:250,tier:'Uncommon',description:'Armoured profile',skin:'Heavy'},
 {id:'skin-shadow',name:'Shadow',coinPrice:400,tier:'Rare',description:'Dark camouflage',skin:'Shadow'}
];
export const coinRecruitment: CatalogItem = {id:'recruit-soldier',name:'Recruit Soldier',coinPrice:200,tier:'Uncommon',description:'Recruit one additional squad member'};
