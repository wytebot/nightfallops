/** Future native Google Sign-In adapter contract. Current cloud module uses the web OAuth fallback. */
export type AccountIdentity={email:string;accessToken?:string;idToken?:string};
export interface AccountProvider { readonly kind:'native'|'web'; connectFromUserGesture():Promise<AccountIdentity>; disconnect?():Promise<void>; }
/** No native plugin or credentials are bundled here; install a compatible native adapter separately. */
export const nativeAccountProvider:AccountProvider={kind:'native',async connectFromUserGesture(){throw new Error('Native Google Sign-In adapter is not configured. Use the Google account button while online.');}};
