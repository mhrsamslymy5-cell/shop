"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const tabs = [
  { href: "/dashboard", label: "پروفایل" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/subscriptions", label: "اشتراک‌ها" },
  { href: "/dashboard/tickets", label: "پشتیبانی" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <main>
      <Navbar />
      <div className="mx-4 mt-8 sm:mx-8">
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-2 p-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  pathname === tab.href
                    ? "bg-brand-500/30 text-white"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <button onClick={logout} className="btn-danger text-sm">
            خروج
          </button>
        </div>
        <div className="pb-16">{children}</div>
      </div>
    </main>
  );
}
