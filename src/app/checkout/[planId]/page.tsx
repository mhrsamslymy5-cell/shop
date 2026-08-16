"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        const found = data.plans.find((p: any) => p.id === planId);
        setPlan(found || null);
      });
  }, [planId]);

  async function applyCoupon() {
    setError("");
    setCouponResult(null);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, planId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "کد تخفیف نامعتبر است");
      return;
    }
    setCouponResult(data);
  }

  async function submitOrder() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        couponCode: couponResult ? coupon : undefined,
      }),
    });
    const order = await res.json();
    if (!res.ok) {
      setLoading(false);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      setError(order.error || "خطا در ثبت سفارش");
      return;
    }

    const payRes = await fetch(`/api/orders/${order.id}/pay`, {
      method: "POST",
    });
    const payData = await payRes.json();
    setLoading(false);
    if (payRes.ok) {
      router.push(payData.redirectUrl);
    } else {
      setError(payData.error || "خطا در آغاز پرداخت");
    }
  }

  if (!plan) {
    return (
      <main>
        <Navbar />
        <p className="mt-16 text-center text-slate-400">در حال بارگذاری...</p>
      </main>
    );
  }

  const finalPrice = couponResult ? couponResult.finalPrice : plan.price;

  return (
    <main>
      <Navbar />
      <div className="mx-auto mt-12 max-w-md px-4">
        <div className="glass flex flex-col gap-4 p-6">
          <h1 className="text-xl font-bold">تسویه حساب</h1>
          <div className="flex justify-between text-sm text-slate-300">
            <span>پلن</span>
            <span>{plan.title}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-300">
            <span>حجم</span>
            <span>{plan.volumeGB} گیگابایت</span>
          </div>
          <div className="flex justify-between text-sm text-slate-300">
            <span>مدت اعتبار</span>
            <span>{plan.durationDays} روز</span>
          </div>

          <div className="flex gap-2">
            <input
              className="glass-input"
              placeholder="کد تخفیف (اختیاری)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="btn-secondary shrink-0"
            >
              اعمال
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {couponResult && (
            <p className="text-sm text-emerald-400">
              تخفیف اعمال شد: {couponResult.discountAmount.toLocaleString("fa-IR")} تومان
            </p>
          )}

          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
            <span>مبلغ نهایی</span>
            <span>{finalPrice.toLocaleString("fa-IR")} تومان</span>
          </div>

          <button
            onClick={submitOrder}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "در حال پردازش..." : "پرداخت (کارت‌به‌کارت)"}
          </button>
        </div>
      </div>
    </main>
  );
}
