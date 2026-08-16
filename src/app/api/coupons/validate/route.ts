import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateCouponSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// Coupon validity is always re-checked server-side at order-creation time too
// (this endpoint is just for checkout UX feedback).
export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = validateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const { code, planId } = parsed.data;

  const [coupon, plan] = await Promise.all([
    prisma.coupon.findUnique({ where: { code } }),
    prisma.plan.findUnique({ where: { id: planId } }),
  ]);

  if (!plan) {
    return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 });
  }

  const now = new Date();
  const valid =
    coupon &&
    coupon.isActive &&
    (!coupon.startAt || coupon.startAt <= now) &&
    (!coupon.endAt || coupon.endAt >= now) &&
    (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

  if (!valid) {
    return NextResponse.json(
      { valid: false, error: "کد تخفیف نامعتبر یا منقضی شده است" },
      { status: 400 }
    );
  }

  const discountAmount =
    coupon!.type === "PERCENT"
      ? Math.floor((plan.price * coupon!.value) / 100)
      : Math.min(coupon!.value, plan.price);
  const finalPrice = Math.max(plan.price - discountAmount, 0);

  return NextResponse.json({
    valid: true,
    discountAmount,
    finalPrice,
  });
}
