import fs from 'node:fs';
import path from 'node:path';
const checks=[];const check=(name,ok,detail)=>checks.push({name,status:ok?'PASS':'WARN',detail});
const exists=p=>fs.existsSync(path.resolve(p));
check('Capacitor config',exists('capacitor.config.ts'),'capacitor.config.ts');
check('Firebase Android config',exists('google-services.json'),'Root google-services.json is copied by android:configure');
check('Generated Android platform',exists('android/app/src/main/AndroidManifest.xml'),'Run npx cap add android if missing');
check('Android app Gradle',exists('android/app/build.gradle')||exists('android/app/build.gradle.kts'),'Expected generated app Gradle file');
check('Android wrapper',exists('android/gradlew'),'Generated Gradle wrapper');
check('Vite build output',exists('dist/index.html'),'Run npm run build before syncing Capacitor');
check('Economy endpoint configured',Boolean(process.env.VITE_ECONOMY_API_URL),'VITE_ECONOMY_API_URL is checked without printing its value');
if(exists('android/app/src/main/AndroidManifest.xml')){const m=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8');check('Landscape orientation',/android:screenOrientation="sensorLandscape"/.test(m),'Expected sensorLandscape on MainActivity');check('WebView cleartext disabled',!/usesCleartextTraffic="true"/.test(m),'Do not enable cleartext traffic in production');}
if(exists('google-services.json')){try{const g=JSON.parse(fs.readFileSync('google-services.json','utf8'));const app=g.client?.some(c=>c.client_info?.android_client_info?.package_name==='app.nightfallops.vercel');check('Firebase package matches appId',Boolean(app),'Expected app.nightfallops.vercel');check('Google OAuth client entries',g.client?.some(c=>(c.oauth_client||[]).length>0), 'No OAuth client entries detected; native Google login may fail until SHA-1 and refreshed config are added');}catch{check('Firebase config JSON',false,'Invalid JSON');}}
for(const c of checks)console.log(`${c.status} ${c.name}: ${c.detail}`);
const warnings=checks.filter(c=>c.status!=='PASS');console.log(`\n${checks.length-warnings.length}/${checks.length} checks passed; ${warnings.length} warning(s).`);
if(checks.some(c=>c.name==='Firebase config JSON'&&c.status!=='PASS'))process.exitCode=1;
