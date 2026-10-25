import { serverEconomy } from './serverEconomy';
export type PaidEntitlement = Readonly<{ productId:string; verifiedAt:string; issuer:'server' }>;
export interface PurchaseProvider { startCheckout(productId:string):Promise<{status:'started'|'unavailable';message:string;checkoutUrl?:string}>; getEntitlements():Promise<ReadonlyArray<PaidEntitlement>>; }
export const purchaseProvider:PurchaseProvider={
 async startCheckout(productId){const result=await serverEconomy.checkout(productId);return {status:'started',message:'Secure checkout opened. Items are granted only after the server verifies payment.',checkoutUrl:result.checkoutUrl};},
 async getEntitlements(){const result=await serverEconomy.entitlements();return result.entitlements.map(productId=>({productId,verifiedAt:'server',issuer:'server' as const}));}
};
