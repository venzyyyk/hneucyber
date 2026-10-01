import "server-only";
import fs from "node:fs";
import path from "node:path";
import { galleryEvents, type GalleryEvent } from "@/content/gallery";

const IMAGE_RE = /\.(jpe?g|png|webp|avif|svg)$/i;
const ROOT = path.join(process.cwd(), "public", "gallery");

export type GalleryPhoto = { src: string; alt: string };
export type GalleryEventWithPhotos = GalleryEvent & { photos: GalleryPhoto[] };

/** Читає /public/gallery/<slug>/ на білді. Порожні події не показуються. */
export function loadGallery(): GalleryEventWithPhotos[] {
  return galleryEvents
    .map((event) => {
      const dir = path.join(ROOT, event.slug);
      let files: string[] = [];
      try {
        files = fs.readdirSync(dir).filter((f) => IMAGE_RE.test(f));
      } catch {
        files = [];
      }
      files.sort((a, b) => a.localeCompare(b, "uk", { numeric: true }));

      return {
        ...event,
        photos: files.map((file, i) => ({
          src: `/gallery/${event.slug}/${encodeURIComponent(file)}`,
          alt: `${event.title} — фото ${i + 1}`,
        })),
      };
    })
    .filter((e) => e.photos.length > 0);
}
