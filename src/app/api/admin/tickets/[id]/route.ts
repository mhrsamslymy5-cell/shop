import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { ticketMessageSchema } from "@/lib/validators";

// Admin reply (message + status="ANSWERED"), or close the ticket.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  if (body?.action === "close") {
    const updated = await prisma.ticket.update({
      where: { id: params.id },
      data: { status: "CLOSED" },
    });
    return NextResponse.json(updated);
  }

  const parsed = ticketMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      senderType: "ADMIN",
      message: parsed.data.message,
    },
  });
  const updated = await prisma.ticket.update({
    where: { id: params.id },
    data: { status: "ANSWERED" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(updated);
}
