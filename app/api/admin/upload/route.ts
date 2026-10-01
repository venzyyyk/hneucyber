import { randomBytes } from "node:crypto";
import { SLUG_RE } from "@/lib/content/schema";
import { isAdmin } from "@/lib/admin/auth";
import { StoreError, getStore } from "@/lib/admin/store";
import type { UploadResponse, UploadTarget } from "@/lib/admin/types";

const MAX_BYTES = 4 * 1024 * 1024; // запас під ліміт тіла запиту (на Vercel ~4.5 МБ); фото все одно стискається в браузері

const RASTER: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const ALLOWED: Record<UploadTarget, Record<string, string>> = {
  gallery: RASTER,
  hero: RASTER,
  logo: { ...RASTER, "image/svg+xml": "svg" },
};

const json = (body: UploadResponse, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  if (!(await isAdmin())) return json({ ok: false, error: "Потрібен вхід" }, 401);

  const store = getStore();
  if (!store) return json({ ok: false, error: "Сховище не налаштоване (GITHUB_TOKEN / GITHUB_REPO)" }, 503);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "Некоректний запит" }, 400);
  }

  const file = form.get("file");
  const target = String(form.get("target") ?? "") as UploadTarget;
  const slug = String(form.get("slug") ?? "");

  if (!(file instanceof File)) return json({ ok: false, error: "Файл не передано" }, 400);
  if (!(target in ALLOWED)) return json({ ok: false, error: "Невідомий тип завантаження" }, 400);
  if (file.size > MAX_BYTES) return json({ ok: false, error: "Файл більший за 4 МБ" }, 413);

  const ext = ALLOWED[target][file.type];
  if (!ext) return json({ ok: false, error: `Формат ${file.type || "невідомий"} не підтримується` }, 415);

  let dir: string;
  if (target === "gallery") {
    if (!SLUG_RE.test(slug)) return json({ ok: false, error: "Некоректна подія" }, 400);
    dir = `public/gallery/${slug}`;
  } else {
    dir = target === "logo" ? "public/logos" : "public/hero";
  }

  const name = `${Date.now().toString(36)}-${randomBytes(3).toString("hex")}.${ext}`;
  const repoPath = `${dir}/${name}`;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { sha } = await store.uploadBlob(repoPath, bytes);
    return json({ ok: true, repoPath, publicPath: `/${repoPath.replace(/^public\//, "")}`, sha });
  } catch (err) {
    console.error("[admin upload]", err);
    return json({ ok: false, error: err instanceof StoreError ? err.message : "Не вдалося завантажити файл" }, 502);
  }
}
