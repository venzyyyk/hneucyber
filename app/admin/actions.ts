"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { galleryContentSchema, rulesSchema, siteContentSchema, SLUG_RE } from "@/lib/content/schema";
import { AdminAuthError, assertAdmin } from "@/lib/admin/auth";
import { CONTENT, issuesToFields, serialize } from "@/lib/admin/content";
import {
  ADMIN_COOKIE,
  SESSION_TTL_S,
  adminConfigured,
  createSessionToken,
  passwordMatches,
} from "@/lib/admin/session";
import { StoreError, assertSafePath, getStore, gitBlobSha, type Change, type Store } from "@/lib/admin/store";
import type { ActionResult, PendingUpload } from "@/lib/admin/types";
import { createRateLimiter, ipFromHeaders } from "@/lib/server/rate-limit";
import { deleteRegistration, sheetsEnabled } from "@/lib/server/sheets";

/* ---------- вхід / вихід ---------- */

export type LoginState = { error: string | null };

const allowLogin = createRateLimiter(10, 15 * 60 * 1000);

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: "Адмінка не налаштована: задай ADMIN_PASSWORD у змінних середовища." };

  const h = await headers();
  const ip = ipFromHeaders(h);
  if (!allowLogin(ip)) return { error: "Забагато спроб. Зачекай 15 хвилин." };

  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 500));
    return { error: "Невірний пароль" };
  }

  (await cookies()).set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    // secure лише на https (Render/Vercel дають https через проксі): локально по http кука інакше не збережеться
    secure: (h.get("x-forwarded-proto") ?? "").split(",")[0].trim() === "https",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ---------- обгортка для всіх дій ---------- */

async function guarded(fn: (store: Store) => Promise<ActionResult>, needStore = true): Promise<ActionResult> {
  try {
    await assertAdmin();
    const store = getStore();
    if (needStore && !store) {
      return { ok: false, error: "Сховище не налаштоване: на хостингу задай GITHUB_TOKEN і GITHUB_REPO." };
    }
    return await fn(store as Store);
  } catch (err) {
    if (err instanceof AdminAuthError || err instanceof StoreError) return { ok: false, error: err.message };
    console.error("[admin]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Помилка сервера" };
  }
}

async function checkNotStale(store: Store, path: string, expectedSha: string | null): Promise<ActionResult | null> {
  const current = await store.readText(path);
  if (current && expectedSha && current.sha !== expectedSha) {
    return {
      ok: false,
      error: "Файл уже змінили в іншій вкладці або інший адмін. Онови сторінку — твої незбережені правки загубляться.",
    };
  }
  return null;
}

function blobChanges(uploads: PendingUpload[], allowed: (repoPath: string) => boolean): Change[] {
  return uploads
    .filter((u) => /^[0-9a-f]{40}$/.test(u.sha))
    .map((u) => ({ ...u, repoPath: assertSafePath(u.repoPath) }))
    .filter((u) => allowed(u.repoPath))
    .map((u) => ({ type: "blob" as const, path: u.repoPath, sha: u.sha }));
}

const doneMessage = (store: Store) =>
  store.mode === "github"
    ? "Збережено — коміт у репозиторій пішов. Сайт оновиться за 1–2 хвилини, коли хостинг перезбере його."
    : "Збережено у файли проєкту.";

/* ---------- налаштування і тексти ---------- */

export async function saveSiteAction(input: {
  data: unknown;
  sha: string | null;
  uploads: PendingUpload[];
}): Promise<ActionResult> {
  return guarded(async (store) => {
    const parsed = siteContentSchema.safeParse(input.data);
    if (!parsed.success) {
      return { ok: false, error: "Перевір поля з помилками", fields: issuesToFields(parsed.error.issues) };
    }
    const stale = await checkNotStale(store, CONTENT.site.path, input.sha);
    if (stale) return stale;

    const used = new Set(
      [parsed.data.heroImage, ...parsed.data.partners.map((p) => p.logo)].filter(Boolean).map((p) => `public${p}`),
    );
    const content = serialize(parsed.data);
    const { url } = await store.commit(
      [
        { type: "text", path: CONTENT.site.path, content },
        ...blobChanges(input.uploads, (p) => used.has(p) && /^public\/(logos|hero)\//.test(p)),
      ],
      "admin: налаштування і тексти сайту",
    );
    return { ok: true, message: doneMessage(store), sha: gitBlobSha(content), commitUrl: url };
  });
}

/* ---------- правила ---------- */

export async function saveRulesAction(input: { data: unknown; sha: string | null }): Promise<ActionResult> {
  return guarded(async (store) => {
    const parsed = rulesSchema.safeParse(input.data);
    if (!parsed.success) {
      return { ok: false, error: "Перевір поля з помилками", fields: issuesToFields(parsed.error.issues) };
    }
    const stale = await checkNotStale(store, CONTENT.rules.path, input.sha);
    if (stale) return stale;

    const content = serialize(parsed.data);
    const { url } = await store.commit([{ type: "text", path: CONTENT.rules.path, content }], "admin: правила турніру");
    return { ok: true, message: doneMessage(store), sha: gitBlobSha(content), commitUrl: url };
  });
}

/* ---------- галерея ---------- */

export async function saveGalleryAction(input: {
  data: unknown;
  sha: string | null;
  uploads: PendingUpload[];
  deletes: string[];
}): Promise<ActionResult> {
  return guarded(async (store) => {
    const parsed = galleryContentSchema.safeParse(input.data);
    if (!parsed.success) {
      return { ok: false, error: "Перевір поля з помилками", fields: issuesToFields(parsed.error.issues) };
    }
    const stale = await checkNotStale(store, CONTENT.gallery.path, input.sha);
    if (stale) return stale;

    const slugs = new Set(parsed.data.map((e) => e.slug));
    const inLiveEvent = (p: string) => {
      const m = /^public\/gallery\/([^/]+)\/[^/]+$/.exec(p);
      return Boolean(m && SLUG_RE.test(m[1]) && slugs.has(m[1]));
    };

    // Видаляємо лише файли, які реально є в сховищі.
    const existing = new Set((await store.listTree("public/gallery/")).map((f) => f.path));
    const deletes: Change[] = [...new Set(input.deletes)]
      .map((p) => assertSafePath(p))
      .filter((p) => p.startsWith("public/gallery/") && existing.has(p))
      .map((p) => ({ type: "delete", path: p }));

    const content = serialize(parsed.data);
    const { url } = await store.commit(
      [{ type: "text", path: CONTENT.gallery.path, content }, ...blobChanges(input.uploads, inLiveEvent), ...deletes],
      "admin: галерея",
    );
    return { ok: true, message: doneMessage(store), sha: gitBlobSha(content), commitUrl: url };
  });
}

/* ---------- заявки ---------- */

export async function deleteRegistrationAction(id: string): Promise<ActionResult> {
  return guarded(async () => {
    if (!sheetsEnabled) return { ok: false, error: "Google Sheets не налаштований" };
    if (!/^KC-[A-Z0-9]{6}$/.test(id)) return { ok: false, error: "Некоректний ID" };
    const deleted = await deleteRegistration(id);
    return deleted > 0
      ? { ok: true, message: `Заявку ${id} видалено (${deleted} рядків)` }
      : { ok: false, error: "Заявку не знайдено — можливо, її вже видалили" };
  }, false);
}
