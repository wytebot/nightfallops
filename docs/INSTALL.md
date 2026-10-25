# Install and release checklist

## Web / PWA
1. Use Node.js 20 or 22 and a working network connection.
2. Run `npm install`, then `npm run build`, `npm run test:catalog`, and `npm run test:assets`.
3. Deploy the generated `dist/` directory over HTTPS. Verify `manifest.webmanifest`, `icons/nightfall.svg`, and `sw.js` load from the deployed base path.
4. Test offline by loading the app online first, then using airplane mode. The current service worker caches the shell and dynamically caches eligible resources as they are requested; it is not yet a guaranteed full-game precache.

## Android (not yet generated in this project)
1. Install Android Studio, Android SDK, and a compatible JDK.
2. Run `npx cap add android` only if the `android/` folder does not already exist, then `npm run build` and `npx cap sync android`.
3. Run `npm run android:configure` and inspect the generated manifest/activity configuration.
4. In Android Studio, build a debug APK first and test touch controls on a real device. Generate launcher/adaptive/monochrome icons from `resources/` with `@capacitor/assets` once all resource layers exist.
5. For release: create and securely back up your own keystore, configure signing in Android Studio/Gradle without committing passwords, build a signed AAB, and test the release artifact.
6. Follow the Firebase SHA-1/SHA-256 instructions in the project README and register the signing certificate fingerprints in Firebase before testing Google sign-in in a signed build.

Do not describe Android as release-ready until debug APK installation, sign-in, purchases, landscape behavior and offline gameplay have been tested on device.
