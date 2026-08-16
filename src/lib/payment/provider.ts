/**
 * Payment provider abstraction.
 *
 * The goal is that adding a real gateway later (Zarinpal, Stripe, ...) only
 * means implementing this interface and registering it in getPaymentProvider() -
 * no changes to order/checkout logic elsewhere.
 */

export interface CreatePaymentInput {
  orderId: string;
  amount: number; // smallest currency unit
}

export interface CreatePaymentResult {
  // Where to send the user to complete payment. For CARD_TO_CARD this is an
  // internal page showing bank details; for a real gateway it would be the
  // gateway's redirect URL.
  redirectUrl: string;
  providerRef?: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  // Provider-specific verification payload (e.g. admin-submitted reference
  // code for CARD_TO_CARD, or a callback token for a real gateway).
  payload: Record<string, unknown>;
}

export interface VerifyPaymentResult {
  success: boolean;
  reason?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}
