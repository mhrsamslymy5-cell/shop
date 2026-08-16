import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { planUpsertSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = planUpsertSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const plan = await prisma.plan.update({
    where: { id: params.id },
    data: parsed.data as any,
  });
  return NextResponse.json(plan);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  // Soft-delete preferred over hard delete to avoid breaking historical
  // orders that reference this plan.
  const ordersCount = await prisma.order.count({
    where: { planId: params.id },
  });
  if (ordersCount > 0) {
    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json({
      ...plan,
      note: "این پلن سفارش دارد؛ به‌جای حذف کامل، غیرفعال شد.",
    });
  }
  await prisma.plan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
