import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public: list active plans, sourced from DB (not hardcoded).
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      volumeGB: true,
      durationDays: true,
    },
  });

  // "وضعیت موجودی": count of AVAILABLE configs overall, shown as a simple
  // in-stock indicator per plan volume tier is not modeled 1:1 (configs are
  // generic, not plan-specific), so we surface a global availability flag.
  const availableConfigs = await prisma.config.count({
    where: { status: "AVAILABLE" },
  });

  return NextResponse.json({
    plans,
    inStock: availableConfigs > 0,
  });
}
