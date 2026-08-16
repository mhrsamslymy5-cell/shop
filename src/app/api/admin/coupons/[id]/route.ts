import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { couponUpsertSchema } from "@/lib/validators";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = couponUpsertSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const { startAt, endAt, ...rest } = parsed.data;
  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(startAt !== undefined
        ? { startAt: startAt ? new Date(startAt) : null }
        : {}),
      ...(endAt !== undefined ? { endAt: endAt ? new Date(endAt) : null } : {}),
    },
  });
  return NextResponse.json(coupon);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  await prisma.coupon.update({
    where: { id: params.id },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
