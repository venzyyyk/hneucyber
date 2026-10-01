import { z } from "zod";
import { site } from "@/content/site";
import { courseValues, inKharkivValues, instituteValues } from "./options";

const NAME_RE = /^[\p{L}\s'’ʼ.-]+$/u;
const GROUP_RE = /^[\p{L}\d\s./-]+$/u;
const TELEGRAM_RE = /^@?[A-Za-z0-9_]{5,32}$/;

export const participantSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Вкажи ПІБ")
    .max(120, "Задовго")
    .regex(NAME_RE, "Лише літери, пробіли та дефіс")
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, "Мінімум прізвище та ім'я"),
  group: z
    .string()
    .trim()
    .min(1, "Вкажи групу")
    .max(40, "Задовго")
    .regex(GROUP_RE, "Некоректна назва групи"),
  course: z.enum(courseValues, { error: "Обери курс" }),
  institute: z.enum(instituteValues, { error: "Обери інститут" }),
  email: z
    .string()
    .trim()
    .min(1, "Вкажи пошту")
    .max(120, "Задовго")
    .pipe(z.email({ error: "Некоректна пошта" })),
  telegram: z
    .string()
    .trim()
    .min(1, "Вкажи Telegram")
    .regex(TELEGRAM_RE, "Формат: @username (5–32 символи)"),
  nickname: z.string().trim().max(40, "Задовго"),
});

const inKharkivSchema = z.enum(inKharkivValues, { error: "Обери варіант" });
const consentSchema = z.literal(true, { error: "Потрібна згода з правилами" });
/** Honeypot: реальні люди це поле не бачать і не заповнюють. */
const honeypotSchema = z.string().max(0).optional();

const soloFields = z.object({
  inKharkiv: inKharkivSchema,
  player: participantSchema,
  consent: consentSchema,
  website: honeypotSchema,
});

const teamFields = z.object({
  teamName: z.string().trim().min(2, "Мінімум 2 символи").max(32, "Максимум 32 символи"),
  inKharkiv: inKharkivSchema,
  players: z.array(participantSchema).length(site.tournament.teamSize),
  substitute: participantSchema.optional(),
  consent: consentSchema,
  website: honeypotSchema,
});

/** Один Telegram / пошта — один гравець у межах заявки. */
function checkDuplicates(team: z.output<typeof teamFields>, ctx: z.RefinementCtx) {
  const roster: { p: Participant; path: (string | number)[] }[] = [
    ...team.players.map((p, i) => ({ p, path: ["players", i] })),
    ...(team.substitute ? [{ p: team.substitute, path: ["substitute"] }] : []),
  ];
  const seen = { email: new Set<string>(), telegram: new Set<string>() };

  for (const { p, path } of roster) {
    const keys = { email: p.email.toLowerCase(), telegram: normalizeTelegram(p.telegram).toLowerCase() };
    for (const field of ["email", "telegram"] as const) {
      const value = keys[field];
      if (!value) continue;
      if (seen[field].has(value)) {
        ctx.addIssue({
          code: "custom",
          path: [...path, field],
          message: field === "email" ? "Ця пошта вже є в заявці" : "Цей Telegram вже є в заявці",
        });
      } else {
        seen[field].add(value);
      }
    }
  }
}

/** Схеми для клієнтських форм (без поля type). */
export const soloFormSchema = soloFields;
export const teamFormSchema = teamFields.superRefine(checkDuplicates);

/** Схеми для API. */
export const soloSchema = soloFields.extend({ type: z.literal("solo") });
export const teamSchema = teamFields.extend({ type: z.literal("team") }).superRefine(checkDuplicates);

export const registrationSchema = z.discriminatedUnion("type", [soloSchema, teamSchema]);

export type Participant = z.output<typeof participantSchema>;
export type SoloFormInput = z.input<typeof soloFormSchema>;
export type TeamFormInput = z.input<typeof teamFormSchema>;
export type Registration = z.output<typeof registrationSchema>;

export function normalizeTelegram(value: string) {
  const v = value.trim();
  if (!v) return "";
  return v.startsWith("@") ? v : `@${v}`;
}

/** Порожній учасник для defaultValues. course/institute не задаємо — select стартує з плейсхолдера. */
export const emptyParticipant = () => ({
  fullName: "",
  group: "",
  email: "",
  telegram: "",
  nickname: "",
});
