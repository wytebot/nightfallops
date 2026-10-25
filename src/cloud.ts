/** Account-bound cloud saves stored in the signed-in user's private Google Drive appDataFolder.
 * No folder ID is needed. The file is private to this app and account. */
let accessToken = '';
let accountEmail = '';
let cachedFileId = '';
let tokenClient: any;
let scriptPromise: Promise<void> | undefined;
let tokenWaiter: { resolve:(token:string)=>void; reject:(error:Error)=>void } | undefined;
let tokenExpiry = 0;
let pendingProfile:unknown=undefined;
let writeTimer:number|undefined;
let writeInFlight:Promise<void>|null=null;
let writeWaiters:Array<{resolve:()=>void;reject:(error:Error)=>void}>=[];
declare global { interface Window { google?: any } }
export function isCloudAuthorized():boolean { return Boolean(accessToken && tokenExpiry > Date.now()+30_000); }
export function getCloudAccountEmail():string { return accountEmail; }
/** Access token is only exposed to authenticated server endpoints; never persist it. */
export async function getCloudServerToken():Promise<string>{if(!isCloudAuthorized())throw new Error('Sign in with Google first to enable secure purchases and wallet sync.');return accessToken;}
function loadGoogleIdentity():Promise<void>{
 if(window.google?.accounts?.oauth2)return Promise.resolve();
 if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{
  const existing=document.querySelector<HTMLScriptElement>('script[data-google-identity]');
  if(existing){existing.addEventListener('load',()=>resolve(),{once:true});existing.addEventListener('error',()=>reject(new Error('Google sign-in could not load. Check your connection.')),{once:true});return;}
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.dataset.googleIdentity='true';script.onload=()=>resolve();script.onerror=()=>reject(new Error('Google sign-in could not load. Check your connection.'));document.head.appendChild(script);
 });return scriptPromise;
}
async function getAccessToken(forceConsent=false):Promise<string>{
 if(isCloudAuthorized()&&!forceConsent)return accessToken;
 if(!forceConsent)throw new Error('Google authorization is missing or expired. Tap SIGN IN WITH GOOGLE to reconnect; background sync never opens a sign-in prompt.');
 const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID as string|undefined;
 if(!clientId)throw new Error('Cloud saves need VITE_GOOGLE_CLIENT_ID. Configure a Google OAuth web client and enable the Google Drive API.');
 await loadGoogleIdentity();
 return new Promise((resolve,reject)=>{
  tokenWaiter={resolve,reject};
  tokenClient=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email',include_granted_scopes:true,callback:(response:any)=>{
   const waiter=tokenWaiter;tokenWaiter=undefined;
   if(response?.error){waiter?.reject(new Error(response.error_description||response.error));return;}
   accessToken=response.access_token;tokenExpiry=Date.now()+Math.max(60,Number(response.expires_in||3600))*1000;
   waiter?.resolve(accessToken);
  },error_callback:(error:any)=>{const waiter=tokenWaiter;tokenWaiter=undefined;waiter?.reject(new Error(error?.message||'Google sign-in was cancelled.'));}});
  // Use account selection on first connection; subsequent connections try a quiet token refresh first.
  tokenClient.requestAccessToken({prompt:forceConsent?'select_account':'',hint:accountEmail||undefined});
 });
}
async function request(url:string,token:string,init:RequestInit={}):Promise<Response>{const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${token}`,...(init.headers||{})}});if(response.status===401){accessToken='';tokenExpiry=0;throw new Error('Google authorization expired. Reconnect your account to sync.');}if(!response.ok){let detail='';try{detail=(await response.clone().json()).error?.message||'';}catch{}throw new Error(`Google cloud save failed (${response.status}). ${detail}`.trim());}return response;}
async function loadAccount(token:string):Promise<void>{try{const response=await request('https://www.googleapis.com/oauth2/v2/userinfo',token);const data=await response.json();accountEmail=String(data.email||'');}catch{/* email is informative only; token still scopes the save to the signed-in account */}}
async function findSave(token:string):Promise<string>{if(cachedFileId)return cachedFileId;const q=encodeURIComponent("name='nightfall-ops-save.json' and 'appDataFolder' in parents and trashed=false");const response=await request(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=appDataFolder&fields=files(id,name)&pageSize=10`,token);const data=await response.json();cachedFileId=data.files?.[0]?.id||'';return cachedFileId;}
export async function connectCloudAccount<T>(_currentProfile:T):Promise<{profile:T|null;email:string}>{cachedFileId='';accountEmail='';accessToken='';tokenExpiry=0;const token=await getAccessToken(true);await loadAccount(token);const profile=await restoreWithToken<T>(token);return {profile,email:accountEmail};}
export function syncProfileToDrive(profile:unknown,_legacyFolderId=''):Promise<void>{pendingProfile=profile;if(writeTimer!==undefined)window.clearTimeout(writeTimer);const promise=new Promise<void>((resolve,reject)=>writeWaiters.push({resolve,reject}));writeTimer=window.setTimeout(()=>{writeTimer=undefined;void flushWrites();},350);return promise;}
async function flushWrites():Promise<void>{if(writeInFlight)return writeInFlight;if(pendingProfile===undefined)return;writeInFlight=(async()=>{while(pendingProfile!==undefined){const snapshot=pendingProfile;pendingProfile=undefined;const waiters=writeWaiters;writeWaiters=[];try{const token=await getAccessToken();if(!accountEmail)await loadAccount(token);await writeWithToken(snapshot,token);waiters.forEach(w=>w.resolve());}catch(error){const e=error instanceof Error?error:new Error('Cloud sync failed');waiters.forEach(w=>w.reject(e));}}})().finally(()=>{writeInFlight=null;if(pendingProfile!==undefined)void flushWrites();});return writeInFlight as Promise<void>;}
export function mergeProfilesByFieldTimestamp<T extends Record<string,unknown>>(local:T,remote:T):T{const localTimes=(local._fieldTimestamps as Record<string,number>|undefined)||{};const remoteTimes=(remote._fieldTimestamps as Record<string,number>|undefined)||{};const localBase=Number(local.updatedAt||0),remoteBase=Number(remote.updatedAt||0);const merged:Record<string,unknown>={...remote};for(const key of new Set([...Object.keys(remote),...Object.keys(local)])){if(key==='_fieldTimestamps')continue;const lt=Number(localTimes[key]||localBase),rt=Number(remoteTimes[key]||remoteBase);if(key in local&&lt>=rt)merged[key]=local[key];}merged._fieldTimestamps={...remoteTimes,...localTimes};merged.updatedAt=Math.max(localBase,remoteBase);return merged as T;}
async function writeWithToken(profile:unknown,token:string):Promise<void>{const fileId=await findSave(token);const metadata={name:'nightfall-ops-save.json',mimeType:'application/json',...(fileId?{}:{parents:['appDataFolder']})};const boundary='nfo_'+Math.random().toString(36).slice(2);const payload=JSON.stringify({schemaVersion:3,savedAt:new Date().toISOString(),accountEmail,profile});const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${payload}\r\n--${boundary}--`;const url=fileId?`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`:'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';const response=await request(url,token,{method:fileId?'PATCH':'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body});const saved=await response.json();cachedFileId=saved.id||fileId;}
export async function restoreProfileFromDrive<T>(_legacyFolderId=''):Promise<T|null>{const token=await getAccessToken(true);await loadAccount(token);return restoreWithToken<T>(token);}
async function restoreWithToken<T>(token:string):Promise<T|null>{const fileId=await findSave(token);if(!fileId)return null;const response=await request(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,token);const data=await response.json();accountEmail=String(data.accountEmail||accountEmail);const profile=(data.profile??data) as T & {updatedAt?:number};if(!profile.updatedAt&&data.savedAt)profile.updatedAt=Date.parse(data.savedAt)||0;return profile as T;}
export function disconnectCloudSession():void{accessToken='';tokenExpiry=0;accountEmail='';cachedFileId='';}
