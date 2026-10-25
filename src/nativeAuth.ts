import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export type SignedInAccount = { uid: string; email: string; displayName: string };

/** Uses the Android native Google account chooser in the APK and the plugin's Google popup on web. */
export async function signInWithGoogleNative(): Promise<SignedInAccount> {
  const result = await FirebaseAuthentication.signInWithGoogle();
  const user = result.user;
  if (!user?.uid) throw new Error('Google sign-in completed without a Firebase user. Check Firebase Auth and OAuth setup.');
  return { uid: user.uid, email: user.email || '', displayName: user.displayName || '' };
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string> {
  const result = await FirebaseAuthentication.getIdToken({ forceRefresh });
  if (!result.token) throw new Error('Sign in with Google first to use your secure wallet.');
  return result.token;
}

export async function getSignedInAccount(): Promise<SignedInAccount | null> {
  try {
    const result = await FirebaseAuthentication.getCurrentUser();
    const user = result.user;
    return user?.uid ? { uid: user.uid, email: user.email || '', displayName: user.displayName || '' } : null;
  } catch {
    // The native plugin may not have a session yet.
    return null;
  }
}

export async function signOutNative(): Promise<void> {
  await FirebaseAuthentication.signOut();
}

export const isNativeRuntime = (): boolean => Capacitor.isNativePlatform();
