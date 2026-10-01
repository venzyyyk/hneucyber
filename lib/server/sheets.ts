import "server-only";
import { SHEET_HEADERS, toSheetRows, type StoredRegistration } from "./format";

const url = process.env.SHEETS_WEBHOOK_URL;
const secret = process.env.SHEETS_WEBHOOK_SECRET;

export const sheetsEnabled = Boolean(url && secret);

type ScriptResponse = { ok?: boolean; error?: string; rows?: string[][]; deleted?: number };

/** Виклик Google Apps Script (google-apps-script/Code.gs). */
async function callScript(payload: Record<string, unknown>, timeoutMs = 12000): Promise<ScriptResponse> {
  if (!sheetsEnabled) throw new Error("Google Sheets не налаштований");

  // Apps Script відповідає 302 на googleusercontent — fetch сам іде за редіректом.
  const res = await fetch(url!, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret, ...payload }),
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const data = (await res.json().catch(() => null)) as ScriptResponse | null;
  if (!res.ok || !data?.ok) throw new Error(`Sheets: ${data?.error ?? res.statusText}`);
  return data;
}

export async function appendToSheet(reg: StoredRegistration): Promise<void> {
  await callScript({ action: "append", headers: SHEET_HEADERS, rows: toSheetRows(reg) });
}

/* ---------- для адмінки ---------- */

export type AdminPlayer = {
  role: string;
  fullName: string;
  group: string;
  course: string;
  institute: string;
  email: string;
  telegram: string;
  nickname: string;
};

export type AdminRegistration = {
  id: string;
  date: string;
  type: string;
  team: string;
  inKharkiv: string;
  players: AdminPlayer[];
};

/** Рядки таблиці → заявки, згруповані за ID. Найновіші першими. */
export async function listRegistrations(): Promise<AdminRegistration[]> {
  const data = await callScript({ action: "list" }, 20000);
  const byId = new Map<string, AdminRegistration>();

  for (const row of data.rows ?? []) {
    const [date, id, type, team, inKharkiv, role, fullName, group, course, institute, email, telegram, nickname] =
      SHEET_HEADERS.map((_, i) => String(row[i] ?? "").trim());
    if (!id) continue;

    let reg = byId.get(id);
    if (!reg) {
      reg = { id, date, type, team: team === "—" ? "" : team, inKharkiv, players: [] };
      byId.set(id, reg);
    }
    reg.players.push({ role, fullName, group, course, institute, email, telegram, nickname });
  }

  return [...byId.values()].reverse();
}

export async function deleteRegistration(id: string): Promise<number> {
  const data = await callScript({ action: "delete", ids: [id] });
  return data.deleted ?? 0;
}
