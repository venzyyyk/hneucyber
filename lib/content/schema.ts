import { z } from "zod";

/** Схеми контенту. Ними валідуються JSON-файли в /content і все, що зберігає адмінка. */

const text = (max: number, label = "Поле") =>
  z.string().trim().max(max, `${label}: максимум ${max} символів`);
const required = (max: number, label = "Поле") => text(max, label).min(1, `${label}: обов'язкове`);

/** Посилання або порожньо. */
const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//.test(v), "Посилання має починатися з https://");

/** Шлях до картинки в /public або порожньо. */
const publicPath = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/"), "Шлях має починатися з /");

export const REGISTRATION_STATUSES = ["open", "soon", "closed"] as const;
export const registrationStatusLabels: Record<(typeof REGISTRATION_STATUSES)[number], string> = {
  open: "Відкрита",
  soon: "Скоро відкриється",
  closed: "Закрита",
};

export const siteContentSchema = z.object({
  name: required(40, "Назва сайту"),
  title: z.tuple([required(24, "Заголовок, рядок 1"), required(24, "Заголовок, рядок 2")]),
  tagline: required(120, "Підзаголовок"),
  description: required(400, "Опис"),
  url: link,
  heroImage: publicPath,

  tournament: z.object({
    discipline: required(60, "Дисципліна"),
    disciplineShort: required(12, "Коротко"),
    format: required(20, "Формат"),
    teamSize: z.number({ error: "Вкажи число" }).int("Ціле число").min(1, "Мінімум 1").max(10, "Максимум 10"),
    substitutes: z.number({ error: "Вкажи число" }).int().min(0).max(1, "Форма підтримує 0 або 1 запасного"),
    dateLabel: required(60, "Дата"),
    stages: required(80, "Етапи"),
  }),

  registration: z.object({
    status: z.enum(REGISTRATION_STATUSES),
    note: text(300, "Оголошення"),
  }),

  about: z.object({
    lead: required(400, "Лід"),
    body: text(800, "Текст"),
    steps: z
      .array(z.object({ title: required(40, "Назва етапу"), text: required(200, "Опис етапу") }))
      .max(8, "Максимум 8 етапів"),
    stats: z
      .array(z.object({ value: required(8, "Значення"), label: required(40, "Підпис") }))
      .max(4, "Максимум 4 цифри"),
  }),

  location: z.object({
    venue: required(40, "Місце"),
    kind: text(80, "Тип"),
    address: required(120, "Адреса"),
    hint: text(200, "Як дістатися"),
    mapsQuery: required(200, "Запит для карти"),
    mapsLink: link,
    features: z.array(required(40, "Фішка")).max(8),
  }),

  partners: z
    .array(
      z.object({
        name: required(80, "Назва партнера"),
        role: required(30, "Роль"),
        logo: publicPath,
        href: link,
        highlight: z.boolean(),
      }),
    )
    .max(8, "Максимум 8 партнерів"),

  contacts: z.object({
    telegram: link,
    telegramLabel: required(40, "Підпис"),
    instagram: link,
  }),
});

export const rulesSchema = z
  .array(
    z.object({
      title: required(80, "Назва розділу"),
      items: z.array(required(500, "Пункт")).min(1, "Хоча б один пункт"),
    }),
  )
  .max(30);

export const GALLERY_KINDS = ["hosted", "participated"] as const;
export const galleryKindLabels: Record<(typeof GALLERY_KINDS)[number], string> = {
  hosted: "Проводили",
  participated: "Брали участь",
};

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const galleryEventSchema = z.object({
  slug: z.string().regex(SLUG_RE, "Лише латиниця, цифри та дефіс").max(60),
  title: required(80, "Назва події"),
  date: required(40, "Дата"),
  kind: z.enum(GALLERY_KINDS),
  place: text(120, "Місце"),
  description: text(400, "Опис"),
});

export const galleryContentSchema = z
  .array(galleryEventSchema)
  .max(50)
  .refine((events) => new Set(events.map((e) => e.slug)).size === events.length, "Слаги подій мають бути унікальні");

export type SiteContent = z.output<typeof siteContentSchema>;
export type RulesContent = z.output<typeof rulesSchema>;
export type GalleryEvent = z.output<typeof galleryEventSchema>;
export type GalleryKind = GalleryEvent["kind"];
export type RegistrationStatus = SiteContent["registration"]["status"];
