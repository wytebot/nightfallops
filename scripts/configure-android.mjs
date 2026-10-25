import fs from 'node:fs';
import path from 'node:path';
const manifestPath=path.resolve('android/app/src/main/AndroidManifest.xml');
const configText=fs.existsSync('capacitor.config.ts')?fs.readFileSync('capacitor.config.ts','utf8'):'';
const appId=(configText.match(/appId:\s*['\"]([^'\"]+)['\"]/)||[])[1]||'app.nightfallops.vercel';
const javaPackage=appId;
if(!fs.existsSync(manifestPath)){
  console.error('Android platform is not generated. Run `npx cap add android` first.');
  process.exit(1);
}
let manifest=fs.readFileSync(manifestPath,'utf8');
manifest=manifest.replace(/(<activity\b[^>]*android:name="[^"]*MainActivity"[^>]*)(>)/s,(all,opening,close)=>{
  let next=opening.replace(/\sandroid:screenOrientation="[^"]*"/,'');
  next=next.replace(/\sandroid:configChanges="[^"]*"/,'');
  next+=' android:screenOrientation="sensorLandscape" android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|screenLayout|uiMode|navigation"';
  return next+close;
});
fs.writeFileSync(manifestPath,manifest);
const javaPath=path.resolve('android/app/src/main/java/'+javaPackage.replaceAll('.','/')+'/MainActivity.java');
fs.mkdirSync(path.dirname(javaPath),{recursive:true});
fs.writeFileSync(javaPath,`package ${javaPackage};\n\nimport android.os.Build;\nimport android.os.Bundle;\nimport android.view.View;\nimport android.view.Window;\nimport android.view.WindowInsets;\nimport android.view.WindowInsetsController;\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {\n  @Override public void onCreate(Bundle savedInstanceState) { super.onCreate(savedInstanceState); hideSystemBars(); }\n  @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideSystemBars(); }\n  private void hideSystemBars() {\n    Window window=getWindow();\n    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {\n      WindowInsetsController controller=window.getInsetsController();\n      if (controller != null) { controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()); controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE); }\n    } else {\n      window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);\n    }\n  }\n}\n`);
// Firebase Authentication native Google sign-in requires the matching client config and Gradle plugin.
const googleServicesSource=path.resolve('google-services.json');
const googleServicesTarget=path.resolve('android/app/google-services.json');
if(fs.existsSync(googleServicesSource)) fs.copyFileSync(googleServicesSource,googleServicesTarget);
const rootGradle=path.resolve('android/build.gradle');
if(fs.existsSync(rootGradle)){
  let gradle=fs.readFileSync(rootGradle,'utf8');
  if(!gradle.includes('com.google.gms:google-services')){
    if(/dependencies\s*\{/.test(gradle)) gradle=gradle.replace(/dependencies\s*\{/,m=>m+"\n        classpath 'com.google.gms:google-services:4.4.2'");
  }
  fs.writeFileSync(rootGradle,gradle);
}
const appGradle=path.resolve('android/app/build.gradle');
if(fs.existsSync(appGradle)){
  let gradle=fs.readFileSync(appGradle,'utf8');
  if(!gradle.includes("com.google.gms.google-services")) gradle="apply plugin: 'com.google.gms.google-services'\n"+gradle;
  fs.writeFileSync(appGradle,gradle);
}
console.log('Applied landscape/fullscreen config, generated the matching Java package, and configured Firebase Google sign-in when google-services.json is present.');
