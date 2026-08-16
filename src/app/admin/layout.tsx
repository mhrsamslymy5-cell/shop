"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/configs", label: "Configs" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "af_admin_session=; path=/; max-age=0";
    router.push("/admin/login");
  }

  const SidebarLinks = (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setDrawerOpen(false)}
          className={`rounded-xl px-4 py-2.5 text-sm transition ${
            pathname === l.href
              ? "bg-brand-500/30 text-white"
              : "text-slate-300 hover:bg-white/10"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass sticky top-4 m-4 hidden h-[calc(100vh-2rem)] w-56 shrink-0 flex-col justify-between p-4 lg:flex">
        <div>
          <p className="mb-6 text-lg font-bold text-brand-400">AurevonFilter</p>
          {SidebarLinks}
        </div>
        <button onClick={logout} className="btn-danger text-sm">
          خروج
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="glass absolute right-0 top-0 flex h-full w-64 flex-col justify-between p-4">
            <div>
              <p className="mb-6 text-lg font-bold text-brand-400">AurevonFilter</p>
              {SidebarLinks}
            </div>
            <button onClick={logout} className="btn-danger text-sm">
              خروج
            </button>
          </aside>
        </div>
      )}

      <div className="flex-1 p-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="glass mb-4 px-4 py-2 text-sm lg:hidden"
        >
          ☰ منو
        </button>
        {children}
      </div>
    </div>
  );
}
