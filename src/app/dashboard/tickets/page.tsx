"use client";
import { useEffect, useState } from "react";

const statusLabel: Record<string, string> = {
  OPEN: "باز",
  ANSWERED: "پاسخ داده شده",
  CLOSED: "بسته شده",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/tickets").then((r) => r.json());
    setTickets(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "خطا در ایجاد تیکت");
      return;
    }
    setSubject("");
    setMessage("");
    load();
  }

  async function sendReply(ticketId: string) {
    if (!reply.trim()) return;
    await fetch(`/api/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    setReply("");
    load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={createTicket} className="glass flex flex-col gap-3 p-4 lg:col-span-1">
        <h2 className="font-bold">تیکت جدید</h2>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="glass-input"
          placeholder="عنوان"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          className="glass-input min-h-[100px]"
          placeholder="متن پیام"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button className="btn-primary">ارسال تیکت</button>
      </form>

      <div className="flex flex-col gap-4 lg:col-span-2">
        {tickets.length === 0 && (
          <p className="text-slate-400">هنوز تیکتی ثبت نکرده‌اید.</p>
        )}
        {tickets.map((t) => (
          <div key={t.id} className="glass p-4">
            <div
              className="flex cursor-pointer items-center justify-between"
              onClick={() => setActiveId(activeId === t.id ? null : t.id)}
            >
              <span className="font-medium">{t.subject}</span>
              <span className="badge bg-white/10">{statusLabel[t.status]}</span>
            </div>
            {activeId === t.id && (
              <div className="mt-3 flex flex-col gap-2">
                {t.messages.map((m: any) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-xl p-2 text-sm ${
                      m.senderType === "USER"
                        ? "ml-auto bg-brand-500/30"
                        : "mr-auto bg-white/10"
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
                    <button
                      type="button"
                      className="btn-primary shrink-0"
                      onClick={() => sendReply(t.id)}
                    >
                      ارسال
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
