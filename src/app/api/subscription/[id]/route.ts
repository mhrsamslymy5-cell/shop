import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildSubscriptionView } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// IDOR-safe: buildSubscriptionView enforces subscription.userId === session.userId.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const view = await buildSubscriptionView(params.id, session.userId);
  if (!view) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(view);
}
