"use client";

import type { UploadResponse, UploadTarget } from "@/lib/admin/types";

const MAX_UPLOAD = 4 * 1024 * 1024;

/**
 * Стискає фото в браузері перед завантаженням: довша сторона ≤ maxSide, WebP (або JPEG).
 * SVG і маленькі файли не чіпає.
 */
export async function compressImage(file: File, maxSide = 2400, quality = 0.85): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (file.size < 350 * 1024) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const toBlob = (type: string) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: blob.type });
}

export async function uploadImage(file: File, target: UploadTarget, slug?: string): Promise<UploadResponse> {
  const prepared = target === "logo" ? file : await compressImage(file);
  if (prepared.size > MAX_UPLOAD) return { ok: false, error: `${file.name}: більше 4 МБ навіть після стиснення` };

  const form = new FormData();
  form.set("file", prepared);
  form.set("target", target);
  if (slug) form.set("slug", slug);

  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as UploadResponse | null;
    return data ?? { ok: false, error: `Помилка ${res.status}` };
  } catch {
    return { ok: false, error: "Немає з'єднання" };
  }
}
