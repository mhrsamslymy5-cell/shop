"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "خطا در ثبت‌نام");
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
          <h1 className="text-xl font-bold">ساخت حساب کاربری</h1>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <input
            className="glass-input"
            placeholder="نام (اختیاری)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            placeholder="رمز عبور (حداقل ۸ کاراکتر)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
          <p className="text-center text-sm text-slate-400">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/login" className="text-brand-400">
              وارد شوید
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
