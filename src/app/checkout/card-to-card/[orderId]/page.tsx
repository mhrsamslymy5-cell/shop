"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function CardToCardPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // Public settings are not exposed via /api/admin/settings (admin-only),
    // so this page shows static guidance; admin can share card info directly
    // or this can be wired to a public settings endpoint if desired.
  }, []);

  return (
    <main>
      <Navbar />
      <div className="mx-auto mt-12 max-w-md px-4">
        <div className="glass flex flex-col gap-4 p-6 text-center">
          <h1 className="text-xl font-bold">پرداخت کارت‌به‌کارت</h1>
          <p className="text-slate-300">
            سفارش شما با شماره{" "}
            <span className="font-mono text-brand-400">{orderId}</span> ثبت
            شد و در وضعیت «در انتظار پرداخت» قرار دارد.
          </p>
          <p className="text-sm text-slate-400">
            لطفاً مبلغ سفارش را به شماره کارت اعلام‌شده توسط پشتیبانی واریز
            کرده و رسید را از طریق تیکت پشتیبانی ارسال کنید. پس از تأیید
            ادمین، اشتراک شما به‌صورت خودکار فعال می‌شود.
          </p>
          <a href="/dashboard/orders" className="btn-primary">
            مشاهده وضعیت سفارش
          </a>
        </div>
      </div>
    </main>
  );
}
