"use client";
import { useEffect, useState } from "react";

const statusLabel: Record<string, string> = {
  PENDING: "در انتظار",
  PAID: "پرداخت‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  async function load(status = "") {
    const data = await fetch(`/api/admin/orders${status ? `?status=${status}` : ""}`).then(
      (r) => r.json()
    );
    setOrders(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: string) {
    setError("");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "خطا");
      return;
    }
    load(filter);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Orders</h1>
        <select
          className="glass-input max-w-xs"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            load(e.target.value);
          }}
        >
          <option value="">همه</option>
          <option value="PENDING">در انتظار</option>
          <option value="PAID">پرداخت‌شده</option>
          <option value="DELIVERED">تحویل‌شده</option>
          <option value="CANCELLED">لغوشده</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="glass overflow-x-auto p-2">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="text-right text-slate-400">
              <th className="p-3">شماره</th>
              <th className="p-3">کاربر</th>
              <th className="p-3">پلن</th>
              <th className="p-3">مبلغ</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">کانفیگ</th>
              <th className="p-3">تاریخ</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/5">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">{o.user.email}</td>
                <td className="p-3">{o.plan.title}</td>
                <td className="p-3">{o.price.toLocaleString("fa-IR")}</td>
                <td className="p-3">{statusLabel[o.status]}</td>
                <td className="p-3">{o.config?.name || "-"}</td>
                <td className="p-3">{new Date(o.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="flex flex-wrap gap-2 p-3">
                  {o.status === "PENDING" && (
                    <>
                      <button
                        className="btn-secondary text-xs"
                        onClick={() => act(o.id, "confirm_payment")}
                      >
                        تأیید پرداخت
                      </button>
                      <button
                        className="btn-danger text-xs"
                        onClick={() => act(o.id, "cancel")}
                      >
                        لغو
                      </button>
                    </>
                  )}
                  {o.status === "PAID" && (
                    <button
                      className="btn-secondary text-xs"
                      onClick={() => act(o.id, "manual_deliver")}
                    >
                      تحویل دستی
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
