import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signUserToken, userCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "ایمیل یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  }
  if (!user.isActive) {
    return NextResponse.json(
      { error: "حساب کاربری شما غیرفعال شده است" },
      { status: 403 }
    );
  }

  const token = signUserToken({ userId: user.id, email: user.email });
  const res = NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
  res.cookies.set(userCookieOptions.name, token, userCookieOptions);
  return res;
}
