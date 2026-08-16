"use client";
import { useEffect, useState } from "react";

const empty = { protocol: "", name: "", uri: "", status: "AVAILABLE" };

export default function AdminConfigsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [q, setQ] = useState("");
  const [protocol, setProtocol] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (protocol) params.set("protocol", protocol);
    if (status) params.set("status", status);
    const data = await fetch(`/api/admin/configs?${params}`).then((r) => r.json());
    setConfigs(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, protocol, status]);

  async function addConfig(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "خطا");
      return;
    }
    setForm(empty);
    load();
  }

  async function setConfigStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/configs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/configs/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={addConfig} className="glass flex flex-col gap-3 p-4 lg:col-span-1">
        <h2 className="font-bold">افزودن کانفیگ</h2>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="glass-input"
          placeholder="Protocol (مثلا vless)"
          value={form.protocol}
          onChange={(e) => setForm({ ...form, protocol: e.target.value })}
          required
        />
        <input
          className="glass-input"
          placeholder="نام"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="glass-input"
          dir="ltr"
          placeholder="uri"
          value={form.uri}
          onChange={(e) => setForm({ ...form, uri: e.target.value })}
          required
        />
        <button className="btn-primary">افزودن</button>
      </form>

      <div className="flex flex-col gap-3 lg:col-span-2">
        <div className="glass flex flex-wrap gap-2 p-3">
          <input
            className="glass-input max-w-[200px]"
            placeholder="جستجو نام..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            className="glass-input max-w-[160px]"
            placeholder="فیلتر Protocol"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
          />
          <select
            className="glass-input max-w-[160px]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="SOLD">SOLD</option>
            <option value="DISABLED">DISABLED</option>
          </select>
        </div>

        {configs.map((c) => (
          <div key={c.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-slate-400">{c.protocol}</p>
            </div>
            <span
              className={`badge ${
                c.status === "AVAILABLE"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : c.status === "SOLD"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {c.status}
            </span>
            <div className="flex gap-2">
              {c.status !== "DISABLED" && (
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setConfigStatus(c.id, "DISABLED")}
                >
                  غیرفعال کن
                </button>
              )}
              {c.status === "DISABLED" && (
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setConfigStatus(c.id, "AVAILABLE")}
                >
                  فعال کن
                </button>
              )}
              <button className="btn-danger text-xs" onClick={() => remove(c.id)}>
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
