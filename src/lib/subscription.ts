import { prisma } from "@/lib/prisma";

/**
 * Display-only cleanup of a config's name for the Subscription page.
 * IMPORTANT: this NEVER touches the database - it only affects what is
 * rendered/returned to the client. The real Config.name in the DB is
 * left untouched, per spec section 10.
 */
export function displayConfigName(rawName: string): string {
  // Strip a legacy "x4g" prefix (e.g. "x4g-Germany-01" -> "Germany-01").
  // Only a leading prefix is stripped; anything else is left as-is.
  return rawName.replace(/^x4g[-_]?/i, "").trim() || "کانفیگ";
}

export interface SubscriptionView {
  id: string;
  token: string;
  subscriptionUrl: string;
  totalVolumeGB: number;
  usedVolumeGB: number;
  remainingVolumeGB: number;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
  configs: {
    id: string;
    protocol: string;
    displayName: string;
    uri: string;
  }[];
}

export async function buildSubscriptionView(
  subscriptionId: string,
  userId?: string
): Promise<SubscriptionView | null> {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { configs: true },
  });
  if (!sub) return null;
  // IDOR guard: if a userId is provided, it must own this subscription.
  if (userId && sub.userId !== userId) return null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const isExpired = sub.expiresAt.getTime() < Date.now();

  return {
    id: sub.id,
    token: sub.token,
    subscriptionUrl: `${baseUrl}/api/sub/${sub.token}`,
    totalVolumeGB: sub.totalVolumeGB,
    usedVolumeGB: sub.usedVolumeGB,
    remainingVolumeGB: Math.max(sub.totalVolumeGB - sub.usedVolumeGB, 0),
    expiresAt: sub.expiresAt.toISOString(),
    isActive: sub.isActive && !isExpired,
    isExpired,
    configs: sub.configs.map((c) => ({
      id: c.id,
      protocol: c.protocol,
      displayName: displayConfigName(c.name),
      uri: c.uri,
    })),
  };
}
