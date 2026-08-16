import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const USER_COOKIE = "af_session";

// NOTE: intentionally NOT checked at module load time. Next.js evaluates
// this module during `next build` (page-data collection) when runtime env
// vars like JWT_SECRET are not yet injected (they only exist at deploy/
// runtime on platforms like Railway). Checking here would fail every build.
// The check instead happens lazily, the first time a token is actually
// signed or verified.
function assertSecretConfigured() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
}

export interface UserTokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signUserToken(payload: UserTokenPayload): string {
  assertSecretConfigured();
  // Cast to SignOptions: @types/jsonwebtoken types `expiresIn` as a branded
  // string/number union that a plain `process.env` string doesn't satisfy
  // at compile time, even though it's valid at runtime (e.g. "7d").
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  assertSecretConfigured();
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export const userCookieOptions = {
  name: USER_COOKIE,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** Read + verify the current user session from cookies (Server Components / Route Handlers). */
export async function getCurrentUser(): Promise<UserTokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

/** Same, but reads from a NextRequest (useful in middleware). */
export function getUserFromRequest(req: NextRequest): UserTokenPayload | null {
  const token = req.cookies.get(USER_COOKIE)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export { USER_COOKIE };
