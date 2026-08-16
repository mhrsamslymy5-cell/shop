import { NextRequest, NextResponse } from "next/server";

// Protects Admin PAGE routes for UX (redirect to login if there's no
// session cookie at all). This intentionally does NOT verify the JWT
// signature here: middleware runs on the Edge Runtime, and the
// `jsonwebtoken` package relies on Node.js crypto APIs that Edge Runtime
// doesn't support. Real, cryptographic verification of the admin session
// happens in every /api/admin/* route handler (via getCurrentAdmin(), which
// runs in the normal Node.js runtime) and in the admin page data fetches -
// so an attacker can't bypass auth by forging a cookie value, they'd just
// reach a page shell that fails every API call.
const ADMIN_COOKIE = "af_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const hasSessionCookie = Boolean(req.cookies.get(ADMIN_COOKIE)?.value);
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
