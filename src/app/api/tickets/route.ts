import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createTicketSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const tickets = await prisma.ticket.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const { subject, message } = parsed.data;

  const ticket = await prisma.ticket.create({
    data: {
      userId: session.userId,
      subject,
      status: "OPEN",
      messages: {
        create: { senderType: "USER", message },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json(ticket, { status: 201 });
}
