import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { configUpsertSchema } from "@/lib/validators";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = configUpsertSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const config = await prisma.config.update({
    where: { id: params.id },
    data: parsed.data as any,
  });
  return NextResponse.json(config);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const config = await prisma.config.findUnique({ where: { id: params.id } });
  if (!config) {
    return NextResponse.json({ error: "کانفیگ یافت نشد" }, { status: 404 });
  }
  // Never hard-delete a SOLD config silently - it's tied to a real
  // customer's order/subscription. Disable it instead.
  if (config.status === "SOLD") {
    const updated = await prisma.config.update({
      where: { id: params.id },
      data: { status: "DISABLED" },
    });
    return NextResponse.json({
      ...updated,
      note: "این کانفیگ فروخته شده بود؛ به‌جای حذف، غیرفعال (DISABLED) شد.",
    });
  }
  await prisma.config.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
