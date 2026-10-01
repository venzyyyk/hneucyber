import Link from "next/link";
import { ArrowUpRight, Images, ScrollText } from "lucide-react";
import { squadLabel } from "@/content/site";

const tiles = [
  {
    href: "/register",
    icon: ScrollText,
    kicker: "Крок 01",
    title: "Реєстрація",
    text: `Правила турніру і форма для соло-гравців та команд ${squadLabel()}.`,
    accent: true,
  },
  {
    href: "/gallery",
    icon: Images,
    kicker: "Крок 02",
    title: "Галерея",
    text: "Фото з турнірів, які ми проводили, і тих, де грали самі.",
    accent: false,
  },
];

export function NextSteps() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 sm:py-28">
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-[800px] -translate-x-1/2 rounded-full bg-lilac-500/15 blur-[120px]" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-lilac-300">Куди далі</p>
        <h2 className="mt-4 text-center font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Готовий зайти на сервер?
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {tiles.map(({ href, icon: Icon, kicker, title, text, accent }) => (
            <Link
              key={href}
              href={href}
              className={`hud group relative flex min-h-[260px] flex-col overflow-hidden rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 sm:p-10 ${
                accent
                  ? "border-lilac-300/50 bg-lilac-300 text-ink"
                  : "border-line bg-ink-2 text-white hover:border-lilac-300/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`font-mono text-xs uppercase tracking-[0.25em] ${accent ? "text-ink/60" : "text-mute-2"}`}>
                  {kicker}
                </span>
                <span
                  className={`grid size-12 place-items-center rounded-full border transition group-hover:rotate-45 ${
                    accent ? "border-ink/20 bg-ink text-lilac-300" : "border-line text-lilac-300"
                  }`}
                >
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
              <Icon className={`mt-8 size-8 ${accent ? "text-ink/80" : "text-lilac-300"}`} />
              <h3 className="mt-auto pt-6 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">{title}</h3>
              <p className={`mt-3 max-w-sm text-sm leading-relaxed ${accent ? "text-ink/70" : "text-mute"}`}>{text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
