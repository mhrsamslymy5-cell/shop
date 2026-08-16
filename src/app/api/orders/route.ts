import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// GET: current user's own orders only (IDOR-safe: scoped by session userId).
export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { plan: true, config: true },
  });
  return NextResponse.json(orders);
}

// POST: create an order. Price/volume/duration are ALWAYS read from the
// Plan row in the DB - never trusted from the client (spec section 16).
export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const { planId, couponCode } = parsed.data;

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 });
  }

  let finalPrice = plan.price;
  let couponId: string | null = null;
  let discountAmount: number | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    const now = new Date();
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.startAt || coupon.startAt <= now) &&
      (!coupon.endAt || coupon.endAt >= now) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

    if (!valid) {
      return NextResponse.json(
        { error: "کد تخفیف نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    discountAmount =
      coupon!.type === "PERCENT"
        ? Math.floor((plan.price * coupon!.value) / 100)
        : Math.min(coupon!.value, plan.price);
    finalPrice = Math.max(plan.price - discountAmount, 0);
    couponId = coupon!.id;
  }

  const order = await prisma.order.create({
    data: {
      userId: session.userId,
      planId: plan.id,
      price: finalPrice,
      volumeGB: plan.volumeGB,
      durationDays: plan.durationDays,
      status: "PENDING",
      couponId,
      discountAmount,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
