import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { deliverOrder, NoAvailableConfigError } from "@/lib/orderDelivery";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      plan: true,
      config: true,
      payment: true,
      subscription: true,
      coupon: true,
    },
  });
  if (!order) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  }
  const { user, ...rest } = order;
  const { passwordHash, ...safeUser } = user;
  return NextResponse.json({ ...rest, user: safeUser });
}

/**
 * Admin actions on an order:
 *  - action: "confirm_payment"  -> mark payment VERIFIED, order PAID, then
 *                                   auto-deliver (pick config, create sub)
 *  - action: "cancel"           -> order -> CANCELLED
 *  - action: "manual_deliver"   -> re-run delivery (e.g. after adding stock)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const action = body?.action;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  }

  if (action === "cancel") {
    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { error: "سفارش تحویل‌شده را نمی‌توان لغو کرد" },
        { status: 400 }
      );
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(updated);
  }

  if (action === "confirm_payment" || action === "manual_deliver") {
    if (action === "confirm_payment" && order.status === "PENDING") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          referenceCode: body?.referenceCode ?? undefined,
        },
      });
    }

    try {
      const delivered = await deliverOrder(order.id);
      return NextResponse.json(delivered);
    } catch (err) {
      if (err instanceof NoAvailableConfigError) {
        return NextResponse.json(
          {
            error:
              "موجودی کانفیگ خالی است. ابتدا از بخش Configs، کانفیگ AVAILABLE اضافه کنید.",
          },
          { status: 409 }
        );
      }
      throw err;
    }
  }

  return NextResponse.json({ error: "action نامعتبر است" }, { status: 400 });
}
