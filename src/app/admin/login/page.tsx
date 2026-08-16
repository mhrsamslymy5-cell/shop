"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "خطا در ورود");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass flex w-full max-w-sm flex-col gap-4 p-6">
        <h1 className="text-center text-xl font-bold text-brand-400">
          ورود ادمین AurevonFilter
        </h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="glass-input"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="glass-input"
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </main>
  );
}
