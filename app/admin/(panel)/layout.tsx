import Link from "next/link";
import { ExternalLink, GitBranch, HardDrive, LogOut } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/admin/auth";
import { getStore } from "@/lib/admin/store";
import { logoutAction } from "../actions";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  const store = getStore();

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="border-b border-line bg-ink-2 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-4 p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <LogoMark className="size-7 text-lilac-300" />
              <span className="font-display text-sm font-bold text-white">Адмінка</span>
            </Link>
            <div className="flex items-center gap-1 lg:hidden">
              <Link href="/" target="_blank" className="grid size-9 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-white" aria-label="Відкрити сайт">
                <ExternalLink className="size-4" />
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="grid size-9 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-white" aria-label="Вийти">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>

          <AdminNav />

          <div className="mt-auto hidden space-y-3 lg:block">
            <div className="rounded-xl border border-line p-3 font-mono text-[11px] leading-relaxed text-mute">
              <p className="flex items-center gap-2 uppercase tracking-[0.15em] text-mute-2">
                {store?.mode === "github" ? <GitBranch className="size-3.5" /> : <HardDrive className="size-3.5" />}
                Сховище
              </p>
              <p className="mt-1 break-all text-lilac-200">{store ? store.label : "не налаштоване"}</p>
            </div>
            <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mute hover:bg-white/5 hover:text-white">
              <ExternalLink className="size-4" />
              Відкрити сайт
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mute hover:bg-white/5 hover:text-danger">
                <LogOut className="size-4" />
                Вийти
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
