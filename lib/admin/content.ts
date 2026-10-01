import "server-only";
import type { z } from "zod";
import { galleryContentSchema, rulesSchema, siteContentSchema } from "@/lib/content/schema";
import type { Store } from "./store";

export const CONTENT = {
  site: { path: "content/site.json", schema: siteContentSchema },
  rules: { path: "content/rules.json", schema: rulesSchema },
  gallery: { path: "content/gallery.json", schema: galleryContentSchema },
} as const;

export type ContentKey = keyof typeof CONTENT;
export type ContentData<K extends ContentKey> = z.output<(typeof CONTENT)[K]["schema"]>;

export const serialize = (data: unknown) => `${JSON.stringify(data, null, 2)}\n`;

/** Читає актуальну версію JSON зі сховища (не з білда) + sha для захисту від перезапису. */
export async function loadContent<K extends ContentKey>(
  store: Store,
  key: K,
): Promise<{ data: ContentData<K>; sha: string | null }> {
  const { path, schema } = CONTENT[key];
  const file = await store.readText(path);
  if (!file) throw new Error(`Файл ${path} не знайдено в сховищі`);
  const parsed = schema.safeParse(JSON.parse(file.content));
  if (!parsed.success) throw new Error(`Файл ${path} має некоректний формат: ${parsed.error.issues[0]?.message}`);
  return { data: parsed.data as ContentData<K>, sha: file.sha };
}

/** zod-помилки → { "about.steps.1.title": "..." } */
export function issuesToFields(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
