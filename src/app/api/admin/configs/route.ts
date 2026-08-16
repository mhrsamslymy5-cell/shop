import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { configUpsertSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const protocol = req.nextUrl.searchParams.get("protocol") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;

  const configs = await prisma.config.findMany({
    where: {
      ...(protocol ? { protocol } : {}),
      ...(status ? { status: status as any } : {}),
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // URIs are admin-only viewing (never logged), fine to return here since
  // this route already requires admin auth.
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = configUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ورودی نامعتبر است", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const config = await prisma.config.create({
    data: {
      protocol: parsed.data.protocol,
      name: parsed.data.name,
      uri: parsed.data.uri,
      metadata: parsed.data.metadata ?? undefined,
      status: parsed.data.status ?? "AVAILABLE",
    },
  });
  return NextResponse.json(config, { status: 201 });
}
