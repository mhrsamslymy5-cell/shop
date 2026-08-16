import { prisma } from "@/lib/prisma";

export class NoAvailableConfigError extends Error {
  constructor() {
    super("No AVAILABLE config in stock");
    this.name = "NoAvailableConfigError";
  }
}

/**
 * Runs the "successful payment" flow described in spec section 2:
 * order -> PAID, pick one AVAILABLE config, mark it SOLD, attach it to a
 * new Subscription for the user, order -> DELIVERED.
 *
 * Wrapped in a single transaction so a race between two orders can never
 * hand out the same config twice, and a failure never leaves the order
 * half-delivered.
 */
export async function deliverOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.status === "DELIVERED") return order; // idempotent

    // Pick one AVAILABLE config, locking it against concurrent delivery.
    const config = await tx.config.findFirst({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "asc" },
    });
    if (!config) throw new NoAvailableConfigError();

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + order.durationDays * 24 * 60 * 60 * 1000
    );

    const subscription = await tx.subscription.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        totalVolumeGB: order.volumeGB,
        usedVolumeGB: 0,
        expiresAt,
        isActive: true,
      },
    });

    await tx.config.update({
      where: { id: config.id },
      data: {
        status: "SOLD",
        orderId: order.id,
        subscriptionId: subscription.id,
      },
    });

    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "DELIVERED",
        paidAt: order.paidAt ?? now,
        deliveredAt: now,
      },
    });

    return updatedOrder;
  });
}
