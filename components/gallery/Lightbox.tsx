"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery";

type Props = {
  photos: GalleryPhoto[];
  title: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export function Lightbox({ photos, title, index, onIndex, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;
  const photo = photos[index];

  const go = useCallback((dir: 1 | -1) => onIndex((index + dir + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: фото ${index + 1} з ${count}`}
      className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur-xl animate-rise [animation-duration:250ms]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="truncate font-mono text-xs uppercase tracking-[0.2em] text-mute">
          <span className="text-lilac-300">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
          <span className="ml-3 hidden text-mute-2 sm:inline">{title}</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid size-10 place-items-center rounded-xl border border-line text-lilac-100 transition hover:border-lilac-300 hover:text-white"
          aria-label="Закрити"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="relative flex-1"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="pointer-events-none absolute inset-4 sm:inset-x-20 sm:inset-y-6">
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="100vw"
            className="object-contain"
            unoptimized={photo.src.toLowerCase().endsWith(".svg")}
            priority
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink/70 text-lilac-100 backdrop-blur transition hover:border-lilac-300 sm:left-5"
              aria-label="Попереднє фото"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink/70 text-lilac-100 backdrop-blur transition hover:border-lilac-300 sm:right-5"
              aria-label="Наступне фото"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <ul className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
        {photos.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative block h-12 w-16 overflow-hidden rounded-lg border transition ${
                i === index ? "border-lilac-300 opacity-100" : "border-line opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={p.src} alt="" fill sizes="64px" className="object-cover" unoptimized={p.src.toLowerCase().endsWith(".svg")} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
