"use client";
import { useEffect, useState } from "react";

const empty = {
  title: "",
  description: "",
  price: 0,
  volumeGB: 0,
  durationDays: 0,
  sortOrder: 0,
  isActive: true,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/admin/plans").then((r) => r.json());
    setPlans(data);
  }
  useEffect(() => {
    load();
  }, []);

  function edit(p: any) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      price: p.price,
      volumeGB: p.volumeGB,
      durationDays: p.durationDays,
      sortOrder: p.sortOrder,
      isActive: p.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      volumeGB: Number(form.volumeGB),
      durationDays: Number(form.durationDays),
      sortOrder: Number(form.sortOrder),
    };
    const res = await fetch(
      editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "خطا");
      return;
    }
    resetForm();
    load();
  }

  async function toggleActive(p: any) {
    await fetch(`/api/admin/plans/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={submit} className="glass flex flex-col gap-3 p-4 lg:col-span-1">
        <h2 className="font-bold">{editingId ? "ویرایش پلن" : "افزودن پلن"}</h2>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="glass-input"
          placeholder="عنوان"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="glass-input"
          placeholder="توضیحات"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="glass-input"
          type="number"
          placeholder="قیمت (تومان)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          className="glass-input"
          type="number"
          placeholder="حجم (گیگابایت)"
          value={form.volumeGB}
          onChange={(e) => setForm({ ...form, volumeGB: e.target.value })}
          required
        />
        <input
          className="glass-input"
          type="number"
          placeholder="مدت اعتبار (روز)"
          value={form.durationDays}
          onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
          required
        />
        <input
          className="glass-input"
          type="number"
          placeholder="ترتیب نمایش"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editingId ? "ذخیره" : "افزودن"}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              انصراف
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3 lg:col-span-2">
        {plans.map((p) => (
          <div key={p.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-slate-400">
                {p.volumeGB}GB / {p.durationDays} روز / {p.price.toLocaleString("fa-IR")} تومان
              </p>
            </div>
            <span
              className={`badge ${
                p.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {p.isActive ? "فعال" : "غیرفعال"}
            </span>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs" onClick={() => edit(p)}>
                ویرایش
              </button>
              <button className="btn-secondary text-xs" onClick={() => toggleActive(p)}>
                {p.isActive ? "غیرفعال کن" : "فعال کن"}
              </button>
              <button className="btn-danger text-xs" onClick={() => remove(p.id)}>
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
