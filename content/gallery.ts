import { galleryContentSchema, galleryKindLabels } from "@/lib/content/schema";
import galleryJson from "./gallery.json";

/**
 * Події галереї. Редагуються в /admin/gallery.
 * Фото лежать у /public/gallery/<slug>/ — сторінка підхоплює всі картинки з папки.
 */
export const galleryEvents = galleryContentSchema.parse(galleryJson);
export const galleryKinds = galleryKindLabels;
export type { GalleryEvent, GalleryKind } from "@/lib/content/schema";
