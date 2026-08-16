import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { getAllSettings, setSetting, SETTINGS_KEYS } from "@/lib/settings";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const settings = await getAllSettings();
  return NextResponse.json(settings);
}

// Body: { cardNumber?, cardHolder?, note? } - maps to card-to-card settings.
export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  if (typeof body.cardNumber === "string") {
    await setSetting(SETTINGS_KEYS.CARD_NUMBER, body.cardNumber);
  }
  if (typeof body.cardHolder === "string") {
    await setSetting(SETTINGS_KEYS.CARD_HOLDER, body.cardHolder);
  }
  if (typeof body.note === "string") {
    await setSetting(SETTINGS_KEYS.PAYMENT_NOTE, body.note);
  }

  const settings = await getAllSettings();
  return NextResponse.json(settings);
}
