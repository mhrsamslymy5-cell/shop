"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QrCode from "@/components/QrCode";
import CopyButton from "@/components/CopyButton";

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/subscription/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error);
        return r.json();
      })
      .then(setSub)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!sub) return <p className="text-slate-400">در حال بارگذاری...</p>;

  const percentUsed = Math.min(
    100,
    Math.round((sub.usedVolumeGB / sub.totalVolumeGB) * 100)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex flex-col items-center gap-4 p-6 text-center">
        <h1 className="text-xl font-bold">Subscription</h1>
        <QrCode value={sub.subscriptionUrl} />
        <div className="flex w-full max-w-md items-center gap-2">
          <input
            readOnly
            value={sub.subscriptionUrl}
            className="glass-input truncate text-left text-xs"
            dir="ltr"
          />
          <CopyButton text={sub.subscriptionUrl} />
        </div>
      </div>

      <div className="glass grid grid-cols-2 gap-4 p-6 text-sm sm:grid-cols-4">
        <div>
          <p className="text-slate-400">حجم کل</p>
          <p className="font-bold">{sub.totalVolumeGB} GB</p>
        </div>
        <div>
          <p className="text-slate-400">مصرف‌شده</p>
          <p className="font-bold">{sub.usedVolumeGB} GB</p>
        </div>
        <div>
          <p className="text-slate-400">باقی‌مانده</p>
          <p className="font-bold">{sub.remainingVolumeGB} GB</p>
        </div>
        <div>
          <p className="text-slate-400">انقضا</p>
          <p className="font-bold">
            {new Date(sub.expiresAt).toLocaleDateString("fa-IR")}
          </p>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-brand-500" style={{ width: `${percentUsed}%` }} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">کانفیگ‌ها</h2>
        {sub.configs.length === 0 && (
          <p className="text-slate-400">کانفیگی برای این اشتراک ثبت نشده است.</p>
        )}
        {sub.configs.map((c: any) => (
          <div key={c.id} className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{c.displayName}</p>
              <p className="text-xs text-slate-400">{c.protocol}</p>
            </div>
            <div className="flex items-center gap-2">
              <QrCode value={c.uri} size={96} />
              <div className="flex flex-col gap-2">
                <input
                  readOnly
                  value={c.uri}
                  className="glass-input w-40 truncate text-left text-xs"
                  dir="ltr"
                />
                <CopyButton text={c.uri} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
