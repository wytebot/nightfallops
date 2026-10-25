import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import ErrorBoundary from './ErrorBoundary';
import { installDiagnostics, logDiagnostic } from './diagnostics';
import { Capacitor } from '@capacitor/core';
installDiagnostics();
logDiagnostic('info','startup',`App booted (${navigator.userAgent.includes('wv')?'Android WebView or embedded browser':'browser runtime'})`);

createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);

if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && import.meta.env.PROD) { window.addEventListener('load', () => { void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(error => console.warn('[Nightfall] Offline cache unavailable', error)); }); }

// Best-effort landscape lock for installed PWAs and browsers that support the
// Screen Orientation API. Browsers may restrict this API to fullscreen/installed
// contexts; the native Android build is configured to sensorLandscape by
// scripts/configure-android.mjs, allowing either landscape side as the device turns.
const requestLandscapeWhenAllowed = async () => {
  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> };
    if (orientation?.lock) await orientation.lock('landscape');
  } catch {
    // A normal browser tab can reject orientation locking. Do not interrupt play;
    // the PWA manifest and native Android orientation configuration cover supported installs.
  }
};
if (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true) {
  void requestLandscapeWhenAllowed();
}
window.addEventListener('pointerdown', () => { void requestLandscapeWhenAllowed(); }, { once: true, passive: true });
window.addEventListener('keydown', () => { void requestLandscapeWhenAllowed(); }, { once: true, passive: true });
