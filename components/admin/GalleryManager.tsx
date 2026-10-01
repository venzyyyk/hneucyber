"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { ImagePlus, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { GALLERY_KINDS, galleryKindLabels, type GalleryEvent } from "@/lib/content/schema";
import { adminFileUrl, type ActionResult } from "@/lib/admin/types";
import { saveGalleryAction } from "@/app/admin/actions";
import { useDraft } from "./useDraft";
import { SaveBar } from "./SaveBar";
import { uploadImage } from "./uploadImage";
import { AddButton, Btn, Notice, PageTitle, RowTools, SelectInput, TextArea, TextInput, move } from "./ui";

export type ExistingPhoto = { repoPath: string; publicPath: string };
type NewPhoto = ExistingPhoto & { sha: string; preview: string };

const omit = <T,>(obj: Record<string, T>, key: string) => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};

const newSlug = () => `event-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function GalleryManager({
  initial,
  sha: initialSha,
  photos: initialPhotos,
}: {
  initial: GalleryEvent[];
  sha: string | null;
  photos: Record<string, ExistingPhoto[]>;
}) {
  const draft = useDraft<GalleryEvent[]>(initial);
  const { value: events, set, errors } = draft;
  const [sha, setSha] = useState(initialSha);
  const [existing, setExisting] = useState(initialPhotos);
  const [fresh, setFresh] = useState<Record<string, NewPhoto[]>>({});
  const [trash, setTrash] = useState<Set<string>>(new Set());
  const [discarded, setDiscarded] = useState<string[]>([]);
  const [busy, setBusy] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const liveSlugs = useMemo(() => new Set(events.map((e) => e.slug)), [events]);
  const freshCount = Object.entries(fresh).reduce((n, [slug, list]) => n + (liveSlugs.has(slug) ? list.length : 0), 0);
  const orphaned = Object.entries(existing)
    .filter(([slug]) => !liveSlugs.has(slug))
    .flatMap(([, list]) => list.map((p) => p.repoPath));
  const dirty = draft.dirty || trash.size > 0 || freshCount > 0;
  const uploading = Object.keys(busy).length > 0;

  const upload = async (slug: string, files: FileList) => {
    const list = [...files];
    const errs: string[] = [];
    for (let i = 0; i < list.length; i++) {
      setBusy((b) => ({ ...b, [slug]: `${i + 1}/${list.length}` }));
      const file = list[i];
      const res = await uploadImage(file, "gallery", slug);
      if (!res.ok) {
        errs.push(`${file.name}: ${res.error}`);
        continue;
      }
      const photo: NewPhoto = { repoPath: res.repoPath, publicPath: res.publicPath, sha: res.sha, preview: URL.createObjectURL(file) };
      setFresh((f) => ({ ...f, [slug]: [...(f[slug] ?? []), photo] }));
    }
    setBusy((b) => omit(b, slug));
    setUploadErrors(errs);
  };

  const removeFresh = (slug: string, repoPath: string) => {
    setFresh((f) => ({ ...f, [slug]: (f[slug] ?? []).filter((p) => p.repoPath !== repoPath) }));
    setDiscarded((d) => [...d, repoPath]);
  };

  const toggleTrash = (repoPath: string) =>
    setTrash((t) => {
      const next = new Set(t);
      if (next.has(repoPath)) next.delete(repoPath);
      else next.add(repoPath);
      return next;
    });

  const removeEvent = (index: number) => {
    const slug = events[index].slug;
    (fresh[slug] ?? []).forEach((p) => setDiscarded((d) => [...d, p.repoPath]));
    setFresh((f) => omit(f, slug));
    draft.update((prev) => prev.filter((_, j) => j !== index));
  };

  const save = () =>
    startTransition(async () => {
      setResult(null);
      const uploads = Object.entries(fresh)
        .filter(([slug]) => liveSlugs.has(slug))
        .flatMap(([, list]) => list.map(({ repoPath, sha: blobSha }) => ({ repoPath, sha: blobSha })));
      const deletes = [...trash, ...discarded, ...orphaned];

      const res = await saveGalleryAction({ data: events, sha, uploads, deletes });
      setResult(res);
      if (!res.ok) {
        if (res.fields) draft.setErrors(res.fields);
        return;
      }

      // Приводимо локальний стан до збереженого
      setSha(res.sha ?? sha);
      setExisting((prev) => {
        const next: Record<string, ExistingPhoto[]> = {};
        for (const slug of liveSlugs) {
          const kept = (prev[slug] ?? []).filter((p) => !trash.has(p.repoPath));
          const added = (fresh[slug] ?? []).map(({ repoPath, publicPath }) => ({ repoPath, publicPath }));
          next[slug] = [...kept, ...added];
        }
        return next;
      });
      setFresh({});
      setTrash(new Set());
      setDiscarded([]);
      draft.markSaved();
    });

  const pendingBits = [
    freshCount && `+${freshCount} фото`,
    trash.size && `−${trash.size} фото`,
    orphaned.length && `−${orphaned.length} фото видалених подій`,
  ].filter(Boolean);

  return (
    <>
      <PageTitle title="Галерея">
        Події й фото на сторінці «Галерея». Перше фото події — велике. Фото стискаються в браузері перед завантаженням.
      </PageTitle>

      {uploadErrors.length > 0 && (
        <div className="mb-6">
          <Notice tone="error">
            Не всі фото завантажились:
            <ul className="mt-1 list-disc pl-5">
              {uploadErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      <ol className="space-y-5">
        {events.map((event, i) => {
          const saved = existing[event.slug] ?? [];
          const added = fresh[event.slug] ?? [];
          const total = saved.filter((p) => !trash.has(p.repoPath)).length + added.length;

          return (
            <li key={event.slug} className="rounded-2xl border border-line bg-ink-2/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-mute-2">
                  <span className="text-lilac-300">{String(i + 1).padStart(2, "0")}</span> · {total} фото · /{event.slug}
                </p>
                <RowTools
                  index={i}
                  count={events.length}
                  label={`Подія ${i + 1}`}
                  onMove={(a, b) => draft.update((prev) => move(prev, a, b))}
                  onRemove={() => removeEvent(i)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <TextInput className="sm:col-span-2" label="Назва" value={event.title} onChange={(x) => set(`${i}.title`, x)} error={errors[`${i}.title`]} />
                <TextInput label="Дата" value={event.date} onChange={(x) => set(`${i}.date`, x)} error={errors[`${i}.date`]} placeholder="Квітень 2026" />
                <SelectInput
                  label="Тип"
                  value={event.kind}
                  onChange={(x) => set(`${i}.kind`, x)}
                  options={GALLERY_KINDS.map((k) => ({ value: k, label: galleryKindLabels[k] }))}
                />
                <TextInput className="sm:col-span-2" label="Місце" value={event.place} onChange={(x) => set(`${i}.place`, x)} error={errors[`${i}.place`]} />
                <TextArea className="sm:col-span-2" rows={2} label="Опис" value={event.description} onChange={(x) => set(`${i}.description`, x)} error={errors[`${i}.description`]} />
              </div>

              <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {saved.map((p) => {
                  const removed = trash.has(p.repoPath);
                  return (
                    <li key={p.repoPath} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-ink-3">
                      {/* eslint-disable-next-line @next/next/no-img-element -- превʼю з API адмінки */}
                      <img src={adminFileUrl(p.publicPath)} alt="" loading="lazy" className={`size-full object-cover transition ${removed ? "opacity-20 grayscale" : ""}`} />
                      <button
                        type="button"
                        onClick={() => toggleTrash(p.repoPath)}
                        aria-label={removed ? "Повернути фото" : "Видалити фото"}
                        className={`absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg backdrop-blur transition ${
                          removed ? "bg-lilac-300 text-ink" : "bg-ink/70 text-lilac-100 opacity-100 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
                        }`}
                      >
                        {removed ? <RotateCcw className="size-4" /> : <Trash2 className="size-4" />}
                      </button>
                    </li>
                  );
                })}
                {added.map((p) => (
                  <li key={p.repoPath} className="group relative aspect-square overflow-hidden rounded-xl border border-lilac-300/60 bg-ink-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- локальне превʼю */}
                    <img src={p.preview} alt="" className="size-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-lilac-300 px-1.5 py-0.5 font-mono text-[10px] text-ink">нове</span>
                    <button
                      type="button"
                      onClick={() => removeFresh(event.slug, p.repoPath)}
                      aria-label="Прибрати нове фото"
                      className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg bg-ink/70 text-lilac-100 backdrop-blur hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
                <li>
                  <UploadTile busy={busy[event.slug]} onFiles={(files) => void upload(event.slug, files)} />
                </li>
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="mt-5">
        <AddButton
          onClick={() =>
            draft.update((prev) => [
              ...prev,
              { slug: newSlug(), title: "", date: String(new Date().getFullYear()), kind: "hosted", place: "", description: "" },
            ])
          }
          disabled={events.length >= 50}
        >
          Додати подію
        </AddButton>
      </div>

      {uploading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-mute">
          <LoaderCircle className="size-4 animate-spin" /> Завантажую фото — не закривай сторінку.
        </p>
      )}

      <SaveBar
        dirty={dirty}
        pending={pending || uploading}
        result={result}
        onSave={save}
        extra={pendingBits.join(", ")}
        onReset={() => {
          Object.values(fresh).flat().forEach((p) => setDiscarded((d) => [...d, p.repoPath]));
          setFresh({});
          setTrash(new Set());
          draft.reset();
          draft.setErrors({});
          setResult(null);
        }}
      />
    </>
  );
}

function UploadTile({ busy, onFiles }: { busy?: string; onFiles: (files: FileList) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Btn
        onClick={() => input.current?.click()}
        disabled={Boolean(busy)}
        className="aspect-square w-full flex-col !gap-1 !rounded-xl border-dashed !border-lilac-300/40 !px-2 text-xs text-lilac-200 hover:!border-lilac-300"
      >
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        {busy ? busy : "Додати фото"}
      </Btn>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}
