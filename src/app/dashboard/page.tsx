"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setUser);
  }, []);

  if (!user) return <p className="text-slate-400">در حال بارگذاری...</p>;

  return (
    <div className="glass max-w-md p-6">
      <h1 className="mb-4 text-xl font-bold">پروفایل من</h1>
      <div className="flex flex-col gap-2 text-sm text-slate-300">
        <div className="flex justify-between">
          <span>ایمیل</span>
          <span>{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span>نام</span>
          <span>{user.name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>تاریخ عضویت</span>
          <span>{new Date(user.createdAt).toLocaleDateString("fa-IR")}</span>
        </div>
      </div>
    </div>
  );
}
