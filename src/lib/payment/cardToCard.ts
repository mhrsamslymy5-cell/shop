import { prisma } from "@/lib/prisma";
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./provider";

/**
 * CARD_TO_CARD provider: the user transfers money manually to a card number
 * configured by the admin (Settings), then an admin verifies the payment by
 * hand from Admin > Orders. There is no automatic verification.
 */
export const cardToCardProvider: PaymentProvider = {
  name: "CARD_TO_CARD",

  async createPayment(
    input: CreatePaymentInput
  ): Promise<CreatePaymentResult> {
    await prisma.payment.upsert({
      where: { orderId: input.orderId },
      create: {
        orderId: input.orderId,
        provider: "CARD_TO_CARD",
        status: "PENDING",
        amount: input.amount,
      },
      update: {
        amount: input.amount,
        status: "PENDING",
      },
    });

    return { redirectUrl: `/checkout/card-to-card/${input.orderId}` };
  },

  async verifyPayment(
    input: VerifyPaymentInput
  ): Promise<VerifyPaymentResult> {
    // Manual verification only: an admin marks the order/payment as PAID
    // through the admin orders endpoint. This function exists so the
    // interface is uniform, but CARD_TO_CARD never self-verifies.
    return {
      success: false,
      reason: "CARD_TO_CARD requires manual admin verification",
    };
  },
};

export function getPaymentProvider(providerName: string): PaymentProvider {
  switch (providerName) {
    case "CARD_TO_CARD":
      return cardToCardProvider;
    default:
      throw new Error(`Unknown payment provider: ${providerName}`);
  }
}
