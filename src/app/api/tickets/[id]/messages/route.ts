import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ticketMessageSchema } from "@/lib/validators";

// User replying to their own ticket (IDOR-guarded by ticket.userId check).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket || ticket.userId !== session.userId) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }
  if (ticket.status === "CLOSED") {
    return NextResponse.json(
      { error: "این تیکت بسته شده است" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = ticketMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  const msg = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      senderType: "USER",
      message: parsed.data.message,
    },
  });
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: "OPEN" },
  });

  return NextResponse.json(msg, { status: 201 });
}
