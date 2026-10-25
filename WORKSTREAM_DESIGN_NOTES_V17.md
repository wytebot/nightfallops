# v17 design notes and trade-offs

## 1 — Economy
The existing Admin SDK Firestore transaction remains the source of truth. A ledger row is created in the same transaction as the wallet mutation and idempotency record, preventing a successful deduction from being committed without its ledger row. Ledger is server-write-only under the existing deny-all rules. The client still needs a full shared purchase-state/reconciliation refactor and stable retry IDs; this pass does not claim those are complete.

## 2 — Billing
The existing Flutterwave checkout is retained for web compatibility in this narrow pass, but it must not be treated as Play-compliant for digital goods. Android Play Billing remains a release blocker; do not publish this build to Play as a monetized release until a maintained Capacitor plugin, Play product IDs, backend purchase-token verification, pending recovery, acknowledgement/consumption and refund/revoke flows are implemented and tested.

## 3 — AI
Keep Phaser's existing AI and avoid adding heavy dependencies. The next safe step is instrumentation and a deterministic headless simulation before changing combat behaviour; not completed here.

## 4 — Graphics
Reuse Phaser pools/tweens and quality-gate effects rather than introducing a rendering dependency. Adaptive quality and the requested visual-style pass are not completed here.

## 5 — UI
Prefer one shared card primitive and CSS tokens with existing React/Lucide dependencies. A full responsive/accessibility pass is not completed here.

## 6 — Android
Preserve Capacitor 6 and existing configuration rather than upgrading major versions during the economy hardening step. Current Play target SDK and native lifecycle/signing checks require an Android toolchain and should be verified before release.

## Follow-up implementation notes

- **Economy:** The server remains the only authority for coin deductions. A session-stored idempotency key lets retry attempts reuse the same request after a timeout; an in-memory promise map collapses concurrent taps in the current WebView. This does not replace deployed Firestore concurrency tests. Army upgrade price multipliers use server wallet army counts, never the `metadata` field.
- **Army coin tiers:** Coin tiers are 1,500 / 12,000 / 22,000. Coin and cash paths use the same tier product IDs and entitlement list. Existing cash prices were not changed.
- **Capacitor:** Native builds no longer register the web service worker. The Phaser scene pauses when Android backgrounds the app and resumes only if the UI was still in gameplay. Android back routes to pause/home rather than accidentally exiting from the gameplay screen.
- **Billing constraint:** Checkout implementation was left untouched. Audit of this archive shows `/v3/payments` and `/v3/transactions/.../verify`; therefore this archive does not contain a verified Flutterwave v4 API implementation. Keep credentials server-side and do not describe the integration as v4 until OAuth/token and payment verification have been tested against the account's actual v4 contract.
