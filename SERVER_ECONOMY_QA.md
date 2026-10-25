# Server economy QA / launch gate

- [ ] Configure Functions secrets and exact allowed origin; never use wildcard CORS in production.
- [ ] Verify unauthenticated wallet/spend/checkout requests fail.
- [ ] Verify Google access token is validated and expired tokens fail.
- [ ] Verify simultaneous spends cannot overdraw the same wallet (Firestore transaction).
- [ ] Replay the same `requestId`; balance and inventory must change only once.
- [ ] Verify insufficient balance, unknown IDs, duplicate weapon purchase and upgrade caps fail without deduction.
- [ ] Verify client Firestore access to wallet/payment/request collections is denied.
- [ ] Verify Flutterwave checkout amount comes from server catalog, not client-supplied amount.
- [ ] Invalid webhook hash, pending/failed transaction, mismatched ref/currency/amount must grant nothing.
- [ ] Replay successful webhook; grant must happen once only.
- [ ] Verify wallet refresh after payment redirect and on sign-in.
- [ ] Migrate daily reward, mission reward, recruitment, supplies, skin and every other coin change to server transactions before production.
- [ ] Test Flutterwave test mode before production credentials.


## Native Google / Firestore
- [ ] Enable Google provider in Firebase Authentication.
- [ ] Add debug and release SHA-1 fingerprints; refresh `google-services.json` so OAuth client entries are present.
- [ ] Confirm Capacitor app ID and Firebase Android package both equal `app.nightfallops.vercel`.
- [ ] Native account picker signs in; invalid/expired Firebase ID tokens are rejected by the server.
- [ ] First wallet request creates a server-owned wallet and `nightfallProfiles` document.
- [ ] App resume refreshes server wallet/entitlements after hosted checkout.
- [ ] Verify checkout using Flutterwave test credentials before production.
