import { GalleryManager, type ExistingPhoto } from "@/components/admin/GalleryManager";
import { LoadError, StoreMissing } from "@/components/admin/StoreMissing";
import { loadContent, type ContentData } from "@/lib/admin/content";
import { getStore } from "@/lib/admin/store";

const TITLE = "Галерея";
const PHOTO_RE = /^public\/gallery\/([^/]+)\/[^/]+\.(jpe?g|png|webp|avif|svg)$/i;

export default async function AdminGalleryPage() {
  const store = getStore();
  if (!store) return <StoreMissing title={TITLE} />;

  let loaded: { data: ContentData<"gallery">; sha: string | null } | null = null;
  const photos: Record<string, ExistingPhoto[]> = {};
  let error = "";

  try {
    const [content, files] = await Promise.all([loadContent(store, "gallery"), store.listTree("public/gallery")]);
    for (const f of files) {
      const m = PHOTO_RE.exec(f.path);
      if (!m) continue;
      (photos[m[1]] ??= []).push({ repoPath: f.path, publicPath: `/${f.path.replace(/^public\//, "")}` });
    }
    loaded = content;
  } catch (err) {
    error = err instanceof Error ? err.message : "Помилка завантаження";
  }

  if (!loaded) return <LoadError title={TITLE} error={error} />;
  return <GalleryManager initial={loaded.data} sha={loaded.sha} photos={photos} />;
}
