import Image from "next/image";
import { ArrowRight, Images } from "lucide-react";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StatusPill } from "@/components/ui/StatusPill";
import { HeroArt } from "./HeroArt";

const marquee = ["CS2", "5×5", "ХНЕУ ім. С. Кузнеця", "Cyberion", "LAN-фінал", "Соло / команда", "Онлайн-відбір"];

export function Hero() {
  const t = site.tournament;
  const chips = [`${t.disciplineShort} · ${t.format}`, "Соло або команда", t.stages];

  return (
    <section className="noise relative isolate overflow-hidden pt-16">
      {/* Фон */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {site.heroImage && (
          <>
            <Image src={site.heroImage} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
          </>
        )}
        <div className="absolute -right-40 -top-40 size-[640px] rounded-full bg-lilac-500/25 blur-[140px]" />
        <div className="absolute -left-32 top-1/3 size-[420px] rounded-full bg-lilac-300/10 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] overflow-hidden">
          <div className="grid-floor absolute -left-1/2 top-0 h-[180%] w-[200%] animate-grid-run" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:min-h-[calc(100svh-4rem-3.25rem)] lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:pb-16">
        <div className="animate-rise">
          <StatusPill />

          <h1 className="mt-7 font-display font-black uppercase leading-[0.92] tracking-tight">
            <span className="text-glow block text-[clamp(3rem,10vw,7.25rem)] text-white">{site.title[0]}</span>
            <span className="gradient-text block pb-1 text-[clamp(2.1rem,7vw,5.25rem)]">{site.title[1]}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg font-medium text-lilac-100 sm:text-xl">{site.tagline}</p>
          <p className="mt-3 max-w-xl leading-relaxed text-mute">{site.description}</p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li
                key={c}
                className="rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-lilac-200"
              >
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" className="sm:!px-7 sm:!py-3.5">
              Реєстрація на турнір
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/gallery" variant="outline" className="sm:!px-7 sm:!py-3.5">
              <Images className="size-4" />
              Фото з турнірів
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md animate-rise [animation-delay:150ms] lg:max-w-none">
          <HeroArt />
        </div>
      </div>

      {/* Бігучий рядок */}
      <div className="relative border-y border-line bg-ink/70 backdrop-blur" aria-hidden>
        <div className="flex overflow-hidden py-3.5">
          {[0, 1].map((k) => (
            <ul key={k} className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
              {[...marquee, ...marquee].map((w, i) => (
                <li key={`${k}-${i}`} className="flex items-center gap-8 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-wider text-lilac-200/80">
                  {w}
                  <span className="size-1.5 rotate-45 bg-lilac-300" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
