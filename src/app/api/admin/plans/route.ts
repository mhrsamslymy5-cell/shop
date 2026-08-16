import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { planUpsertSchema } from "@/lib/validators";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = planUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ورودی نامعتبر است", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const plan = await prisma.plan.create({ data: parsed.data as any });
  return NextResponse.json(plan, { status: 201 });
}
