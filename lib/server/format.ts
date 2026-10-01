import "server-only";
import { COURSES, INSTITUTES, IN_KHARKIV, labelOf } from "@/lib/registration/options";
import { normalizeTelegram, type Participant, type Registration } from "@/lib/registration/schema";

export type StoredRegistration = Registration & { id: string; createdAt: string };

type Role = "Соло" | "Капітан" | "Гравець" | "Запасний";

export type RosterEntry = { role: Role; slot: number; person: Participant };

export function rosterOf(reg: Registration): RosterEntry[] {
  if (reg.type === "solo") return [{ role: "Соло", slot: 1, person: reg.player }];
  const list: RosterEntry[] = reg.players.map((person, i) => ({
    role: i === 0 ? "Капітан" : "Гравець",
    slot: i + 1,
    person,
  }));
  if (reg.substitute) list.push({ role: "Запасний", slot: list.length + 1, person: reg.substitute });
  return list;
}

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** HTML-повідомлення для Telegram (parse_mode=HTML). */
export function toTelegramMessage(reg: StoredRegistration): string {
  const kharkiv = labelOf(IN_KHARKIV, reg.inKharkiv);
  const head =
    reg.type === "solo"
      ? `<b>Нова заявка · СОЛО</b>`
      : `<b>Нова заявка · КОМАНДА</b>\nКоманда: <b>${esc(reg.teamName)}</b>`;

  const people = rosterOf(reg)
    .map(({ role, slot, person: p }) => {
      const tg = normalizeTelegram(p.telegram);
      const lines = [
        `<b>${reg.type === "team" ? `${slot}. ` : ""}${esc(p.fullName)}</b> — ${role.toLowerCase()}`,
        `${esc(p.group)} · ${labelOf(COURSES, p.course)} · ${labelOf(INSTITUTES, p.institute)}`,
        `${esc(p.email)} · ${esc(tg)}${p.nickname ? ` · нік: ${esc(p.nickname)}` : ""}`,
      ];
      return lines.join("\n");
    })
    .join("\n\n");

  return [head, `ID: <code>${reg.id}</code>`, `У Харкові: ${esc(kharkiv)}`, "", people].join("\n");
}

export { SHEET_HEADERS } from "@/lib/registration/sheet";

/** Один рядок таблиці на кожного учасника заявки. */
export function toSheetRows(reg: StoredRegistration): string[][] {
  const date = new Date(reg.createdAt).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });
  const team = reg.type === "team" ? reg.teamName : "—";
  const type = reg.type === "team" ? "Команда" : "Соло";
  const kharkiv = labelOf(IN_KHARKIV, reg.inKharkiv);

  return rosterOf(reg).map(({ role, person: p }) => [
    date,
    reg.id,
    type,
    team,
    kharkiv,
    role,
    p.fullName,
    p.group,
    labelOf(COURSES, p.course),
    labelOf(INSTITUTES, p.institute),
    p.email,
    normalizeTelegram(p.telegram),
    p.nickname || "",
  ]);
}
