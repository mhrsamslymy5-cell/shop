import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/adminAuth";

// Protects Admin PAGE routes (not the login page itself, and not
// /api/admin/* which already verify the session in each handler).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
