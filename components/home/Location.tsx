import { ExternalLink, MapPin, TrainFront } from "lucide-react";
import { site } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/ButtonLink";

export function Location() {
  const loc = site.location;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(loc.mapsQuery)}&z=16&output=embed`;

  return (
    <section id="location" className="relative scroll-mt-20 border-t border-line bg-ink-2/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="02" kicker="Офлайн-частина" title="Де проходить LAN-фінал">
          Онлайн-етап граєш звідки завгодно. Фінальні матчі — наживо, на турнірних ПК.
        </SectionHeading>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <div className="panel flex flex-col rounded-3xl p-7 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-lilac-300">{loc.kind}</p>
            <h3 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-white">{loc.venue}</h3>

            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-start gap-3 text-lilac-100">
                <MapPin className="mt-0.5 size-4 shrink-0 text-lilac-300" />
                {loc.address}
              </p>
              <p className="flex items-start gap-3 text-mute">
                <TrainFront className="mt-0.5 size-4 shrink-0 text-lilac-300" />
                {loc.hint}
              </p>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {loc.features.map((f) => (
                <li key={f} className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-lilac-200">
                  {f}
                </li>
              ))}
            </ul>

            {loc.mapsLink && (
              <div className="mt-auto pt-8">
                <a href={loc.mapsLink} target="_blank" rel="noreferrer" className={buttonClass("outline", "w-full")}>
                  Прокласти маршрут
                  <ExternalLink className="size-4" />
                </a>
              </div>
            )}
          </div>

          <div className="hud relative min-h-[340px] overflow-hidden rounded-3xl border border-line bg-ink-3 lg:min-h-[460px]">
            {/* Фолбек, поки карта вантажиться або якщо її заблоковано */}
            <div className="dot-grid absolute inset-0 grid place-items-center" aria-hidden>
              <div className="grid place-items-center gap-3 text-center">
                <span className="grid size-14 place-items-center rounded-full border border-lilac-300/50 bg-lilac-300/10">
                  <MapPin className="size-6 text-lilac-300" />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-mute">{loc.address}</span>
              </div>
            </div>
            <iframe
              title={`Карта: ${loc.venue}, ${loc.address}`}
              src={embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-dark absolute inset-0 size-full border-0"
            />
            <div className="pointer-events-none absolute inset-0 bg-lilac-500/10 mix-blend-color" aria-hidden />
            <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-line bg-ink/85 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-lilac-200 backdrop-blur">
              <span className="text-mute-2">GEO /</span> {loc.venue}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
