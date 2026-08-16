import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;
const ADMIN_COOKIE = "af_admin_session";

// See the identical note in lib/auth.ts: checked lazily, not at module
// load time, because `next build` evaluates this file before runtime env
// vars exist on platforms like Railway.
function assertAdminSecretConfigured() {
  if (!ADMIN_JWT_SECRET) {
    throw new Error("ADMIN_JWT_SECRET is not set");
  }
}

export interface AdminTokenPayload {
  username: string;
  role: "admin";
}

/**
 * Admin credentials come exclusively from environment variables
 * (ADMIN_USERNAME / ADMIN_PASSWORD). There is no hardcoded fallback:
 * if either is missing, login is refused rather than silently permitted.
 */
export function checkAdminCredentials(
  username: string,
  password: string
): boolean {
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envUser || !envPass) return false;
  return username === envUser && password === envPass;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  assertAdminSecretConfigured();
  return jwt.sign(payload, ADMIN_JWT_SECRET, {
    expiresIn: "12h",
  } as jwt.SignOptions);
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  assertAdminSecretConfigured();
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export const adminCookieOptions = {
  name: ADMIN_COOKIE,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 12, // 12 hours
};

export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function getAdminFromRequest(
  req: NextRequest
): AdminTokenPayload | null {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export { ADMIN_COOKIE };
