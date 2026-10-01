import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Сесія адмінки: підписаний HMAC-токен у httpOnly-куці.
 * Без server-only — модуль імпортує proxy.ts.
 * Ключ підпису виводиться з ADMIN_PASSWORD: змінив пароль — усі сесії злетіли.
 */

export const ADMIN_COOKIE = "khnue_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 7;
export const MIN_PASSWORD_LENGTH = 8;

export function adminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD ?? "").length >= MIN_PASSWORD_LENGTH;
}

function signingKey(): Buffer | null {
  if (!adminConfigured()) return null;
  return createHash("sha256")
    .update(`khnue-admin|${process.env.ADMIN_PASSWORD}|${process.env.ADMIN_SESSION_SECRET ?? ""}`)
    .digest();
}

export function createSessionToken(now = Date.now()): string {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD не заданий");
  const payload = `v1.${Math.floor(now / 1000) + SESSION_TTL_S}`;
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const key = signingKey();
  if (!key) return false;

  const [version, expRaw, sig] = token.split(".");
  if (version !== "v1" || !expRaw || !sig) return false;

  const exp = Number(expRaw);
  if (!Number.isSafeInteger(exp) || exp * 1000 < Date.now()) return false;

  const expected = createHmac("sha256", key).update(`${version}.${expRaw}`).digest();
  const given = Buffer.from(sig, "base64url");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function passwordMatches(input: string): boolean {
  if (!adminConfigured()) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest();
  return timingSafeEqual(a, b);
}
