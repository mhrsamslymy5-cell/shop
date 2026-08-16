"use client";
import { useEffect, useState } from "react";

const empty = { code: "", type: "PERCENT", value: 10, usageLimit: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/admin/coupons").then((r) => r.json());
    setCoupons(data);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "خطا");
      return;
    }
    setForm(empty);
    load();
  }

  async function deactivate(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={submit} className="glass flex flex-col gap-3 p-4 lg:col-span-1">
        <h2 className="font-bold">کد تخفیف جدید</h2>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="glass-input"
          placeholder="کد (مثلا SUMMER20)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          required
        />
        <select
          className="glass-input"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="PERCENT">درصدی</option>
          <option value="FIXED">مبلغ ثابت</option>
        </select>
        <input
          className="glass-input"
          type="number"
          placeholder="مقدار"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          required
        />
        <input
          className="glass-input"
          type="number"
          placeholder="محدودیت تعداد استفاده (اختیاری)"
          value={form.usageLimit}
          onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
        />
        <button className="btn-primary">افزودن</button>
      </form>

      <div className="flex flex-col gap-3 lg:col-span-2">
        {coupons.map((c) => (
          <div key={c.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-mono font-medium">{c.code}</p>
              <p className="text-xs text-slate-400">
                {c.type === "PERCENT" ? `${c.value}%` : `${c.value.toLocaleString("fa-IR")} تومان`}{" "}
                - استفاده‌شده: {c.usedCount}
                {c.usageLimit ? ` / ${c.usageLimit}` : ""}
              </p>
            </div>
            <span
              className={`badge ${
                c.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {c.isActive ? "فعال" : "غیرفعال"}
            </span>
            {c.isActive && (
              <button className="btn-danger text-xs" onClick={() => deactivate(c.id)}>
                غیرفعال کن
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
