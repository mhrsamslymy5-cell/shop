"use client";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: "کاربران", value: stats.totalUsers },
        { label: "سفارش‌ها", value: stats.totalOrders },
        { label: "درآمد (تومان)", value: stats.revenue.toLocaleString("fa-IR") },
        { label: "کانفیگ موجود", value: stats.availableConfigs },
        { label: "کانفیگ فروخته‌شده", value: stats.soldConfigs },
        { label: "سفارش‌های در انتظار", value: stats.pendingOrders },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass p-5">
            <p className="text-sm text-slate-400">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-400">{c.value}</p>
          </div>
        ))}
        {!stats && <p className="text-slate-400">در حال بارگذاری...</p>}
      </div>
    </div>
  );
}
