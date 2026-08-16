import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      orders: { include: { plan: true, config: true }, orderBy: { createdAt: "desc" } },
      subscriptions: { include: { configs: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }
  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

// Activate/deactivate a user.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { isActive: body.isActive },
    select: { id: true, isActive: true },
  });
  return NextResponse.json(user);
}
