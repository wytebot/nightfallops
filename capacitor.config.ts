import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = { appId: 'app.nightfallops.vercel', appName: 'Nightfall Ops', webDir: 'dist', android: { allowMixedContent: false }, plugins: { FirebaseAuthentication: { skipNativeAuth: false, providers: ['google.com'] } } };
export default config;
