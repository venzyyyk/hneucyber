import Link from "next/link";
import { Send } from "lucide-react";
import { site } from "@/content/site";
import { Logo } from "./Logo";
import { NAV } from "./nav";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">{site.tagline}.</p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-mute-2">Навігація</p>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-lilac-100/90 transition hover:text-lilac-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-mute-2">Зв&apos;язок</p>
          <ul className="mt-4 space-y-2 text-sm">
            {site.contacts.telegram && (
              <li>
                <a
                  href={site.contacts.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-lilac-100/90 transition hover:text-lilac-300"
                >
                  <Send className="size-4" />
                  {site.contacts.telegramLabel}
                </a>
              </li>
            )}
            {site.contacts.instagram && (
              <li>
                <a
                  href={site.contacts.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lilac-100/90 transition hover:text-lilac-300"
                >
                  Instagram
                </a>
              </li>
            )}
            <li className="text-mute">{site.location.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.2em] text-mute-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>ХНЕУ ім. С. Кузнеця × Cyberion</span>
        </div>
      </div>
    </footer>
  );
}
