import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "./session";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Для сторінок: без сесії — на логін. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export class AdminAuthError extends Error {
  constructor() {
    super("Сесія закінчилась. Увійди ще раз.");
  }
}

/** Для server actions і роутів: кидає помилку, якщо сесії немає. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new AdminAuthError();
}
