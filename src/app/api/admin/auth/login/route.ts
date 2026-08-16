import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminCredentials,
  signAdminToken,
  adminCookieOptions,
} from "@/lib/adminAuth";
import { adminLoginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }
  const { username, password } = parsed.data;

  if (!checkAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "نام کاربری یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  }

  const token = signAdminToken({ username, role: "admin" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieOptions.name, token, adminCookieOptions);
  return res;
}
