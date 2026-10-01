"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NAV } from "./nav";
import { Logo } from "./Logo";
import { buttonClass } from "@/components/ui/ButtonLink";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Головна навігація" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-white/[0.03] p-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-lilac-300 text-ink"
                      : "text-lilac-100/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {!isActive("/register") && (
            <Link href="/register" className={buttonClass("primary", "!px-4 !py-2 max-md:hidden")}>
              Зареєструватися
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-line text-lilac-100 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Закрити меню" : "Відкрити меню"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Мобільна навігація" className="h-[calc(100dvh-4rem)] border-t border-line bg-ink md:hidden">
          <ul className="flex flex-col gap-2 px-4 py-6">
            {NAV.map((item, i) => (
              <li key={item.href} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 font-display text-xl font-semibold ${
                    isActive(item.href) ? "border-lilac-300/60 bg-lilac-300/10 text-white" : "border-line text-lilac-100"
                  }`}
                >
                  {item.label}
                  <span className="font-mono text-xs text-mute-2">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
