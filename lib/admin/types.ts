/** Спільні типи для клієнтських і серверних частин адмінки. */

export type ActionResult =
  | { ok: true; message: string; sha?: string; commitUrl?: string }
  | { ok: false; error: string; fields?: Record<string, string> };

/** Файл, уже завантажений в сховище (blob), але ще не закомічений. */
export type PendingUpload = { repoPath: string; sha: string };

export type UploadTarget = "gallery" | "logo" | "hero";

export type UploadResponse =
  | { ok: true; repoPath: string; publicPath: string; sha: string }
  | { ok: false; error: string };

export type StoreMode = "github" | "local";

/** Превʼю файлу з репо (працює і до передеплою). */
export const adminFileUrl = (publicPath: string) =>
  `/api/admin/file?path=${encodeURIComponent(`public${publicPath.startsWith("/") ? "" : "/"}${publicPath}`)}`;
