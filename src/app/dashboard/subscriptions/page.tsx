"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then(setSubs);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">اشتراک‌های من</h1>
      {subs.length === 0 && (
        <p className="text-slate-400">هنوز اشتراک فعالی ندارید.</p>
      )}
      {subs.map((s) => {
        const percentUsed = Math.min(
          100,
          Math.round((s.usedVolumeGB / s.totalVolumeGB) * 100)
        );
        return (
          <Link
            key={s.id}
            href={`/dashboard/subscriptions/${s.id}`}
            className="glass flex flex-col gap-2 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {s.isExpired ? "منقضی‌شده" : s.isActive ? "فعال" : "غیرفعال"}
              </span>
              <span className="text-xs text-slate-400">
                انقضا: {new Date(s.expiresAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-brand-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">
              {s.usedVolumeGB} از {s.totalVolumeGB} گیگابایت مصرف‌شده (
              {s.remainingVolumeGB} گیگابایت باقی‌مانده)
            </span>
          </Link>
        );
      })}
    </div>
  );
}
