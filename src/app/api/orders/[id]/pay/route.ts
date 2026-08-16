import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payment/cardToCard";

// Initiates payment for one of the user's own PENDING orders.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "این سفارش قابل پرداخت نیست" },
      { status: 400 }
    );
  }

  const provider = getPaymentProvider("CARD_TO_CARD");
  // Price is read from the order row (server-computed at creation time),
  // never trusted from the request body.
  const result = await provider.createPayment({
    orderId: order.id,
    amount: order.price,
  });

  return NextResponse.json(result);
}
