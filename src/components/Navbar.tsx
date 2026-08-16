"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <nav className="glass mx-4 mt-4 flex items-center justify-between px-5 py-3 sm:mx-8">
      <Link href="/" className="text-lg font-bold text-brand-400">
        AurevonFilter
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <Link href="/dashboard" className="btn-secondary py-1.5">
            پنل کاربری
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn-secondary py-1.5">
              ورود
            </Link>
            <Link href="/register" className="btn-primary py-1.5">
              ثبت‌نام
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
