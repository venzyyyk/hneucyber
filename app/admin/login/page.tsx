import { connection } from "next/server";
import { LogoMark } from "@/components/layout/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminConfigured, MIN_PASSWORD_LENGTH } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  await connection(); // env читаємо на запиті, а не на білді
  const configured = adminConfigured();

  return (
    <main className="noise relative grid flex-1 place-items-center overflow-hidden px-4 py-16">
      <div className="absolute -top-40 left-1/2 -z-0 size-[520px] -translate-x-1/2 rounded-full bg-lilac-500/20 blur-[130px]" aria-hidden />
      <div className="hud panel relative w-full max-w-sm rounded-3xl p-8">
        <div className="flex items-center gap-3">
          <LogoMark className="size-9 text-lilac-300" />
          <div>
            <p className="font-display text-lg font-bold text-white">Адмінка</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute-2">KHNUE Cyber</p>
          </div>
        </div>

        {configured ? (
          <LoginForm />
        ) : (
          <p className="mt-8 rounded-xl border border-amber-300/30 bg-amber-300/[0.07] px-4 py-3 text-sm leading-relaxed text-amber-100">
            Вхід вимкнено: задай змінну <code className="font-mono">ADMIN_PASSWORD</code> (мінімум {MIN_PASSWORD_LENGTH}{" "}
            символів) і перезапусти сайт.
          </p>
        )}
      </div>
    </main>
  );
}
