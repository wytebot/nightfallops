# Landscape orientation

- The PWA manifest requests `orientation: landscape` for installed web apps.
- The app makes a best-effort `screen.orientation.lock('landscape')` request on first interaction and in standalone mode. Some mobile browsers prohibit this outside installed/fullscreen contexts; the app continues normally if rejected.
- Run `npm run android:configure` after `npx cap add android` or after regenerating Android. The script configures Android `MainActivity` to `sensorLandscape`, which allows both landscape-left and landscape-right rotation as the player turns the device, while preventing portrait orientation.
- The previous “ROTATE YOUR DEVICE” blocking overlay has been removed. The web app no longer tells users to rotate as a prerequisite.

Web limitations: a website cannot universally rotate the physical display from an ordinary browser tab. For reliable automatic landscape with both landscape directions, install the PWA where the browser supports manifest orientation or distribute the Capacitor Android app configured by the script.
