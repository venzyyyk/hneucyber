import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { GalleryView } from "@/components/gallery/GalleryView";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { loadGallery } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Галерея",
  description: "Фото з кібертурнірів ХНЕУ: події, які ми проводили, і турніри, де грали наші команди.",
};

export default function GalleryPage() {
  const events = loadGallery();
  const total = events.reduce((n, e) => n + e.photos.length, 0);

  return (
    <>
      <PageHeader
        crumb="Галерея"
        kicker="Архів турнірів"
        title="Галерея"
        aside={
          <div className="flex gap-6 font-mono">
            <div>
              <p className="text-3xl font-bold text-lilac-300">{events.length}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-mute-2">подій</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-lilac-300">{total}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-mute-2">фото</p>
            </div>
          </div>
        }
      >
        Турніри, які ми проводили, і ті, де грали самі. Для знайомства — щоб бачити, як це виглядає наживо.
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {events.length > 0 ? (
          <GalleryView events={events} />
        ) : (
          <div className="hud panel rounded-3xl p-12 text-center">
            <p className="font-display text-xl font-semibold text-white">Фото скоро з&apos;являться</p>
            <p className="mt-2 text-mute">Поки що можна зареєструватися на наступний турнір.</p>
            <ButtonLink href="/register" className="mt-6">
              Реєстрація
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );
}
