"use client";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s) => {
        setCardNumber(s.card_to_card_number || "");
        setCardHolder(s.card_to_card_holder_name || "");
        setNote(s.card_to_card_note || "");
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardNumber, cardHolder, note }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-xl font-bold">Settings - پرداخت کارت‌به‌کارت</h1>
      <form onSubmit={save} className="glass flex flex-col gap-3 p-4">
        <input
          className="glass-input"
          dir="ltr"
          placeholder="شماره کارت"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <input
          className="glass-input"
          placeholder="نام صاحب حساب"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
        />
        <textarea
          className="glass-input"
          placeholder="توضیحات پرداخت"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="btn-primary">{saved ? "ذخیره شد!" : "ذخیره"}</button>
      </form>
    </div>
  );
}
