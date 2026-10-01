"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, ScrollText, SlidersHorizontal, Users } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Заявки", short: "Заявки", icon: Users },
  { href: "/admin/settings", label: "Турнір і тексти", short: "Турнір", icon: SlidersHorizontal },
  { href: "/admin/rules", label: "Правила", short: "Правила", icon: ScrollText },
  { href: "/admin/gallery", label: "Галерея", short: "Галерея", icon: Images },
];

export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label="Розділи адмінки">
      <ul className="grid grid-cols-4 gap-1 lg:flex lg:flex-col">
        {ITEMS.map(({ href, label, short, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={`flex flex-col items-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-[11px] font-medium transition lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm ${
                active(href) ? "bg-lilac-300 text-ink" : "text-lilac-100/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              <span className="lg:hidden">{short}</span>
              <span className="hidden lg:inline">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
