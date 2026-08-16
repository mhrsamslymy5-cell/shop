import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }

  const [
    totalUsers,
    totalOrders,
    revenueAgg,
    availableConfigs,
    soldConfigs,
    pendingOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { price: true },
      where: { status: "DELIVERED" },
    }),
    prisma.config.count({ where: { status: "AVAILABLE" } }),
    prisma.config.count({ where: { status: "SOLD" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalOrders,
    revenue: revenueAgg._sum.price ?? 0,
    availableConfigs,
    soldConfigs,
    pendingOrders,
  });
}
