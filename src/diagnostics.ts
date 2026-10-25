import { Capacitor } from '@capacitor/core';
import { getFirebaseIdToken, getSignedInAccount } from './nativeAuth';

export type DiagnosticEntry = { at:string; level:'error'|'warn'|'info'; area:string; message:string };
const KEY='nightfall-diagnostics-v1';
const entries:DiagnosticEntry[]=[];
let installed=false;
const safe=(value:unknown)=>String(value instanceof Error?`${value.name}: ${value.message}`:value??'Unknown error').replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi,'$1[redacted]').replace(/(secret|token|authorization|api[_ -]?key)\s*[:=]\s*[^\s,;]+/gi,'$1=[redacted]').slice(0,500);
export function logDiagnostic(level:DiagnosticEntry['level'],area:string,error:unknown){
 const entry={at:new Date().toISOString(),level,area:area.slice(0,60),message:safe(error)};
 entries.push(entry);if(entries.length>60)entries.splice(0,entries.length-60);
 try{localStorage.setItem(KEY,JSON.stringify(entries));}catch{}
 if(level==='error')console.error(`[Nightfall:${area}]`,entry.message);else if(level==='warn')console.warn(`[Nightfall:${area}]`,entry.message);
}
export function installDiagnostics(){if(installed||typeof window==='undefined')return;installed=true;try{const stored=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(stored))entries.push(...stored.slice(-40));}catch{}
 window.addEventListener('error',e=>logDiagnostic('error','window',e.error||e.message));
 window.addEventListener('unhandledrejection',e=>logDiagnostic('error','promise',e.reason));
 window.addEventListener('online',()=>logDiagnostic('info','network','Network connection restored'));
 window.addEventListener('offline',()=>logDiagnostic('warn','network','Device is offline'));
 document.addEventListener('visibilitychange',()=>logDiagnostic('info','lifecycle',`document visibility: ${document.visibilityState}`));
}
export function getDiagnosticLog(){try{const stored=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(stored)?stored as DiagnosticEntry[]:[...entries];}catch{return [...entries];}}
export function exportDiagnosticReport(){const report={app:'Nightfall Ops',version:import.meta.env.VITE_APP_VERSION||'source-build',generatedAt:new Date().toISOString(),runtime:{platform:Capacitor.getPlatform(),native:Capacitor.isNativePlatform(),online:navigator.onLine,userAgent:navigator.userAgent,language:navigator.language,screen:{width:screen.width,height:screen.height,orientation:screen.orientation?.type||'unknown'},viewport:{width:innerWidth,height:innerHeight},memory:(performance as any).memory?{usedJSHeapSize:(performance as any).memory.usedJSHeapSize,totalJSHeapSize:(performance as any).memory.totalJSHeapSize}:undefined},recentEvents:getDiagnosticLog().slice(-60)};return JSON.stringify(report,null,2);}
export async function runDiagnostics(apiBase?:string){const checks:Array<{name:string;status:'PASS'|'WARN'|'FAIL';detail:string}> = [];
 checks.push({name:'Runtime',status:Capacitor.isNativePlatform()?'PASS':'WARN',detail:`${Capacitor.getPlatform()}${Capacitor.isNativePlatform()?' native runtime':' web runtime'}`});
 checks.push({name:'Network',status:navigator.onLine?'PASS':'FAIL',detail:navigator.onLine?'Browser reports online':'Device reports offline'});
 checks.push({name:'Local storage',status:(()=>{try{const k='__nfo_diag__';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch{return false;}})()?'PASS':'FAIL',detail:'localStorage write/read probe'});
 checks.push({name:'Game canvas',status:document.querySelector('canvas')?'PASS':'WARN',detail:document.querySelector('canvas')?'Canvas is mounted':'Canvas is not mounted (normal outside gameplay)'});
 try{const account=await getSignedInAccount();if(account){try{await getFirebaseIdToken();checks.push({name:'Firebase session',status:'PASS',detail:`Authenticated UID present (${account.uid.slice(0,6)}…)`});}catch(e){checks.push({name:'Firebase session',status:'FAIL',detail:safe(e)});}}else checks.push({name:'Firebase session',status:'WARN',detail:'No Google session; sign in to test wallet/payment'});}catch(e){checks.push({name:'Firebase session',status:'FAIL',detail:safe(e)});}
 if(!apiBase)checks.push({name:'Economy endpoint',status:'FAIL',detail:'VITE_ECONOMY_API_URL is missing'});else{try{const u=new URL(apiBase);if(u.protocol!=='https:')throw Error('Endpoint must use HTTPS');const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),8000);try{const r=await fetch(`${apiBase.replace(/\/$/,'')}/health`,{method:'GET',signal:controller.signal});const d=await r.json().catch(()=>({}));checks.push({name:'Economy endpoint',status:r.ok&&d.ok?'PASS':'FAIL',detail:r.ok?`Health endpoint responded (${d.region||'region unknown'})`:`Health check returned HTTP ${r.status}`});}finally{window.clearTimeout(timeout);}}catch(e){checks.push({name:'Economy endpoint',status:'FAIL',detail:safe(e)});}}
 checks.push({name:'Diagnostics capture',status:'PASS',detail:`${getDiagnosticLog().length} recent events available`});return checks;
}
