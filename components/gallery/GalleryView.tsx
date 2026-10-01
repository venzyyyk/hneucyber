"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Maximize2 } from "lucide-react";
import { galleryKinds, type GalleryKind } from "@/content/gallery";
import type { GalleryEventWithPhotos } from "@/lib/gallery";
import { Lightbox } from "./Lightbox";

type Filter = "all" | GalleryKind;

const isSvg = (src: string) => src.toLowerCase().endsWith(".svg");

export function GalleryView({ events }: { events: GalleryEventWithPhotos[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<{ event: number; photo: number } | null>(null);

  const filters = useMemo(() => {
    const counts = events.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.kind]: (acc[e.kind] ?? 0) + 1 }), {});
    return [
      { value: "all" as Filter, label: "Усі", count: events.length },
      ...(Object.keys(galleryKinds) as GalleryKind[])
        .filter((k) => counts[k])
        .map((k) => ({ value: k as Filter, label: galleryKinds[k], count: counts[k] })),
    ];
  }, [events]);

  const visible = events
    .map((e, index) => ({ e, index }))
    .filter(({ e }) => filter === "all" || e.kind === filter);

  return (
    <>
      <div role="group" aria-label="Фільтр подій" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? "border-lilac-300 bg-lilac-300 text-ink"
                  : "border-line text-lilac-100 hover:border-lilac-300/50 hover:bg-white/5"
              }`}
            >
              {f.label}
              <span className={`font-mono text-[11px] ${active ? "text-ink/60" : "text-mute-2"}`}>{f.count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 space-y-20">
        {visible.map(({ e, index }) => (
          <section key={e.slug} aria-labelledby={`ev-${e.slug}`}>
            <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span
                  className={`inline-block rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                    e.kind === "hosted" ? "bg-lilac-300 text-ink" : "border border-line text-lilac-200"
                  }`}
                >
                  {galleryKinds[e.kind]}
                </span>
                <h2 id={`ev-${e.slug}`} className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                  {e.title}
                </h2>
                {e.description && <p className="mt-2 max-w-xl text-mute">{e.description}</p>}
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-mute">
                <li className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-lilac-300" />
                  {e.date}
                </li>
                {e.place && (
                  <li className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-lilac-300" />
                    {e.place}
                  </li>
                )}
                <li>{e.photos.length} фото</li>
              </ul>
            </header>

            <ul className="mt-6 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-3 lg:grid-cols-4">
              {e.photos.map((p, i) => (
                <li key={p.src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                  <button
                    type="button"
                    onClick={() => setOpen({ event: index, photo: i })}
                    className="group relative block size-full overflow-hidden rounded-2xl border border-line bg-ink-3"
                    aria-label={`Відкрити: ${p.alt}`}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized={isSvg(p.src)}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-lg bg-ink/70 text-lilac-200 opacity-0 backdrop-blur transition group-hover:opacity-100">
                      <Maximize2 className="size-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {open && (
        <Lightbox
          photos={events[open.event].photos}
          title={events[open.event].title}
          index={open.photo}
          onIndex={(photo) => setOpen({ event: open.event, photo })}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
