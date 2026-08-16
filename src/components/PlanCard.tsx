"use client";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  volumeGB: number;
  durationDays: number;
}

export default function PlanCard({
  plan,
  inStock,
}: {
  plan: Plan;
  inStock: boolean;
}) {
  const router = useRouter();
  return (
    <div className="glass flex flex-col gap-4 p-6">
      <div>
        <h3 className="text-xl font-bold">{plan.title}</h3>
        {plan.description && (
          <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-brand-400">
          {plan.price.toLocaleString("fa-IR")}
        </span>
        <span className="text-sm text-slate-400">تومان</span>
      </div>
      <div className="flex gap-2 text-sm text-slate-300">
        <span className="badge bg-white/10">{plan.volumeGB} گیگابایت</span>
        <span className="badge bg-white/10">{plan.durationDays} روز</span>
        <span
          className={`badge ${
            inStock ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
          }`}
        >
          {inStock ? "موجود" : "ناموجود"}
        </span>
      </div>
      <button
        disabled={!inStock}
        onClick={() => router.push(`/checkout/${plan.id}`)}
        className="btn-primary mt-2"
      >
        خرید
      </button>
    </div>
  );
}
