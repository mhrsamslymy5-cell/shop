"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
};
const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  PAID: "bg-blue-500/20 text-blue-300",
  DELIVERED: "bg-emerald-500/20 text-emerald-300",
  CANCELLED: "bg-red-500/20 text-red-300",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">سفارش‌های من</h1>
      {orders.length === 0 && (
        <p className="text-slate-400">هنوز سفارشی ثبت نکرده‌اید.</p>
      )}
      {orders.map((o) => (
        <div key={o.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium">{o.plan?.title}</p>
            <p className="text-xs text-slate-400">
              {new Date(o.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
          <span className={`badge ${statusColor[o.status]}`}>
            {statusLabel[o.status]}
          </span>
          <span className="text-sm">{o.price.toLocaleString("fa-IR")} تومان</span>
          {o.status === "DELIVERED" && (
            <Link href="/dashboard/subscriptions" className="btn-secondary text-sm">
              مشاهده اشتراک
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
