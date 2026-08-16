"use client";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any>(null);

  async function load(query = "") {
    const data = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`).then((r) =>
      r.json()
    );
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function openUser(id: string) {
    const data = await fetch(`/api/admin/users/${id}`).then((r) => r.json());
    setSelected(data);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load(q);
    if (selected?.id === id) openUser(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Users</h1>
        <input
          className="glass-input max-w-xs"
          placeholder="جستجو..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            load(e.target.value);
          }}
        />
      </div>

      <div className="glass overflow-x-auto p-2">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="text-right text-slate-400">
              <th className="p-3">ایمیل</th>
              <th className="p-3">نام</th>
              <th className="p-3">سفارش‌ها</th>
              <th className="p-3">اشتراک‌ها</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">تاریخ ثبت‌نام</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.name || "-"}</td>
                <td className="p-3">{u._count.orders}</td>
                <td className="p-3">{u._count.subscriptions}</td>
                <td className="p-3">
                  <span
                    className={`badge ${
                      u.isActive
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {u.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                </td>
                <td className="flex gap-2 p-3">
                  <button className="btn-secondary text-xs" onClick={() => openUser(u.id)}>
                    جزئیات
                  </button>
                  <button
                    className="btn-danger text-xs"
                    onClick={() => toggleActive(u.id, u.isActive)}
                  >
                    {u.isActive ? "غیرفعال کن" : "فعال کن"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="glass p-4">
          <h2 className="mb-3 font-bold">جزئیات {selected.email}</h2>
          <h3 className="mb-1 text-sm text-slate-400">سفارش‌ها</h3>
          <ul className="mb-3 text-sm">
            {selected.orders.map((o: any) => (
              <li key={o.id}>
                {o.plan.title} - {o.status} - {o.price.toLocaleString("fa-IR")} تومان
              </li>
            ))}
          </ul>
          <h3 className="mb-1 text-sm text-slate-400">اشتراک‌ها</h3>
          <ul className="text-sm">
            {selected.subscriptions.map((s: any) => (
              <li key={s.id}>
                {s.totalVolumeGB}GB - انقضا:{" "}
                {new Date(s.expiresAt).toLocaleDateString("fa-IR")} - {s.configs.length} کانفیگ
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
