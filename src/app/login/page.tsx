"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "خطا در ورود");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto mt-16 max-w-sm px-4">
        <form onSubmit={onSubmit} className="glass flex flex-col gap-4 p-6">
          <h1 className="text-xl font-bold">ورود به حساب کاربری</h1>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <input
            className="glass-input"
            type="email"
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <p className="text-center text-sm text-slate-400">
            حساب ندارید؟{" "}
            <Link href="/register" className="text-brand-400">
              ثبت‌نام کنید
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
