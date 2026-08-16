import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { displayConfigName } from "@/lib/subscription";

/**
 * Public subscription endpoint consumed by client apps (v2ray/xray etc.)
 * via the opaque, unguessable `token` - not the internal numeric/DB id, and
 * with no session cookie required (clients cannot send cookies).
 *
 * Security: never log the raw config URIs here (spec section 16).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const sub = await prisma.subscription.findUnique({
    where: { token: params.token },
    include: { configs: true },
  });

  if (!sub || !sub.isActive) {
    return new NextResponse("Subscription not found", { status: 404 });
  }

  const isExpired = sub.expiresAt.getTime() < Date.now();
  const lines = isExpired
    ? []
    : sub.configs.map((c) => c.uri); // raw URIs go straight to the client, never to logs/console

  const body = lines.join("\n");
  const base64 = Buffer.from(body, "utf-8").toString("base64");

  return new NextResponse(base64, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Profile-Title": "AurevonFilter",
      "Subscription-Userinfo": `upload=0; download=${
        sub.usedVolumeGB * 1024 ** 3
      }; total=${sub.totalVolumeGB * 1024 ** 3}; expire=${Math.floor(
        sub.expiresAt.getTime() / 1000
      )}`,
    },
  });
}
