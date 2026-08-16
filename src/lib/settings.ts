import { prisma } from "@/lib/prisma";

export const SETTINGS_KEYS = {
  CARD_NUMBER: "card_to_card_number",
  CARD_HOLDER: "card_to_card_holder_name",
  PAYMENT_NOTE: "card_to_card_note",
} as const;

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
