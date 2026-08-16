"use client";
import { useEffect, useState } from "react";

const statusLabel: Record<string, string> = {
  OPEN: "باز",
  ANSWERED: "پاسخ داده شده",
  CLOSED: "بسته شده",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  async function load() {
    const data = await fetch("/api/admin/tickets").then((r) => r.json());
    setTickets(data);
  }
  useEffect(() => {
    load();
  }, []);

  async function sendReply(id: string) {
    if (!reply.trim()) return;
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    setReply("");
    load();
  }

  async function close(id: string) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close" }),
    });
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Tickets</h1>
      {tickets.map((t) => (
        <div key={t.id} className="glass p-4">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setActiveId(activeId === t.id ? null : t.id)}
          >
            <div>
              <p className="font-medium">{t.subject}</p>
              <p className="text-xs text-slate-400">{t.user.email}</p>
            </div>
            <span className="badge bg-white/10">{statusLabel[t.status]}</span>
          </div>
          {activeId === t.id && (
            <div className="mt-3 flex flex-col gap-2">
              {t.messages.map((m: any) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-xl p-2 text-sm ${
                    m.senderType === "ADMIN" ? "ml-auto bg-brand-500/30" : "mr-auto bg-white/10"
                  }`}
                >
                  {m.message}
                </div>
              ))}
              {t.status !== "CLOSED" && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="glass-input"
                    placeholder="پاسخ..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button className="btn-primary shrink-0" onClick={() => sendReply(t.id)}>
                    ارسال
                  </button>
                  <button className="btn-danger shrink-0" onClick={() => close(t.id)}>
                    بستن تیکت
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
