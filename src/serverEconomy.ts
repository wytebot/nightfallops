import { getFirebaseIdToken } from './nativeAuth';

const API_BASE = (import.meta.env.VITE_ECONOMY_API_URL as string | undefined)?.replace(/\/$/, '');
export type Wallet = { coins:number; army?:number; ownedWeaponIds:string[]; upgradeLevels:Record<string,number>; inventory:{partnerCount:number;armyCount:number;lifePacks:number;magicPacks:number;ownedSkins:string[]}; equippedWeaponId:string; entitlements:string[] };
async function call<T>(path:string,body?:unknown):Promise<T>{
  if(!API_BASE) throw new Error('Server economy is not configured. Set VITE_ECONOMY_API_URL to the deployed HTTPS Functions URL.');
  const token=await getFirebaseIdToken();
  const response=await fetch(`${API_BASE}/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||`Server economy request failed (${response.status}).`);
  return data as T;
}
const pendingRequestKey=(action:string,itemId:string)=>`nightfall-purchase-request:${action}:${itemId}`;
const inFlightPurchases=new Map<string,Promise<{wallet:Wallet;message:string}>>();
export function spendCoins(action:string,itemId:string,metadata:Record<string,unknown>={}):Promise<{wallet:Wallet;message:string}>{const flightKey=`${action}:${itemId}`;const existing=inFlightPurchases.get(flightKey);if(existing)return existing;const pending=(async()=>{const key=pendingRequestKey(action,itemId);let requestId='';try{requestId=localStorage.getItem(key)||'';}catch{}if(!requestId){requestId=crypto.randomUUID();try{localStorage.setItem(key,requestId);}catch{}}const result=await call<{wallet:Wallet;message:string}>('spend',{action,itemId,metadata,requestId});try{localStorage.removeItem(key);}catch{}return result;})();inFlightPurchases.set(flightKey,pending);void pending.finally(()=>{if(inFlightPurchases.get(flightKey)===pending)inFlightPurchases.delete(flightKey);}).catch(()=>{});return pending;}
export const serverEconomy={wallet:()=>call<Wallet>('wallet'),spend:spendCoins,dailyBonus:()=>call<{claimed:boolean;reward:number;wallet:Wallet;message:string}>('daily-bonus',{}),paymentStatus:(txRef:string)=>call<{status:'pending'|'paid'|'failed';productId:string;wallet:Wallet}>('payment-status',{txRef}),checkout:(productId:string)=>call<{checkoutUrl:string;txRef:string}>('checkout',{productId}),entitlements:()=>call<{entitlements:string[]}>('entitlements'),saveProfile:(profile:unknown)=>call<{ok:boolean}>('profile',{profile}),loadProfile:()=>call<{profile:unknown|null}>('profile')};
