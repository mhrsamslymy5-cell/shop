import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { couponUpsertSchema } from "@/lib/validators";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = couponUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ورودی نامعتبر است", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { startAt, endAt, ...rest } = parsed.data;
  const coupon = await prisma.coupon.create({
    data: {
      ...rest,
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}
