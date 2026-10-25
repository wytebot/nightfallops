import { serverEconomy } from './serverEconomy';
export type PaidEntitlement = Readonly<{ productId:string; verifiedAt:string; issuer:'server' }>;
export interface PurchaseProvider { startCheckout(productId:string):Promise<{status:'started'|'unavailable';message:string;checkoutUrl?:string}>; getEntitlements():Promise<ReadonlyArray<PaidEntitlement>>; reconcilePendingPayment():Promise<import('./serverEconomy').Wallet|null>; }
export const purchaseProvider:PurchaseProvider={
 async startCheckout(productId){const result=await serverEconomy.checkout(productId);try{localStorage.setItem('nightfall-pending-payment-ref',result.txRef);}catch{}return {status:'started',message:'Secure checkout opened. Items are granted only after the server verifies payment.',checkoutUrl:result.checkoutUrl};},
 async getEntitlements(){const result=await serverEconomy.entitlements();return result.entitlements.map(productId=>({productId,verifiedAt:'server',issuer:'server' as const}));},
 async reconcilePendingPayment(){let ref='';try{ref=localStorage.getItem('nightfall-pending-payment-ref')||'';}catch{}if(!ref)return null;const result=await serverEconomy.paymentStatus(ref);if(result.status==='paid'){try{localStorage.removeItem('nightfall-pending-payment-ref');}catch{}return result.wallet;}return null;}
};
