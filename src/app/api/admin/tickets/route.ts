import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const tickets = await prisma.ticket.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  return NextResponse.json(tickets);
}
