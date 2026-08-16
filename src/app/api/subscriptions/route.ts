import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildSubscriptionView } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const subs = await prisma.subscription.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const views = await Promise.all(
    subs.map((s) => buildSubscriptionView(s.id, session.userId))
  );
  return NextResponse.json(views.filter(Boolean));
}
