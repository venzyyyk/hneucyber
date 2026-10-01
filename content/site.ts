import { siteContentSchema, type RegistrationStatus } from "@/lib/content/schema";
import siteJson from "./site.json";

/** Контент сайту. Редагується в /admin (або руками в site.json). */
export const site = siteContentSchema.parse(siteJson);
export type { RegistrationStatus };

export const siteUrl = site.url || "http://localhost:3000";

export const squadLabel = (t = site.tournament) =>
  t.substitutes > 0 ? `${t.teamSize} + ${t.substitutes} запасний` : `${t.teamSize} гравців`;
