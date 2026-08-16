import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") || undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      plan: { select: { id: true, title: true } },
      config: { select: { id: true, name: true, protocol: true } },
      payment: true,
    },
  });
  return NextResponse.json(orders);
}
