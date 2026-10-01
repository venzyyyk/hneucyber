import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  crumb: string;
  kicker: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
};

export function PageHeader({ crumb, kicker, title, children, aside }: Props) {
  return (
    <section className="noise relative isolate overflow-hidden border-b border-line pt-16">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -right-32 -top-48 size-[520px] rounded-full bg-lilac-500/20 blur-[130px]" />
        <div className="dot-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
        <nav aria-label="Хлібні крихти" className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute-2">
          <Link href="/" className="transition hover:text-lilac-300">
            Головна
          </Link>
          <span className="mx-2">/</span>
          <span className="text-lilac-200">{crumb}</span>
        </nav>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-lilac-300">{kicker}</p>
            <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
              {title}
            </h1>
            {children && <div className="mt-5 text-base leading-relaxed text-mute sm:text-lg">{children}</div>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
