"use client";

import { useRef, useState } from "react";
import { ImageUp, LoaderCircle, X } from "lucide-react";
import { adminFileUrl, type PendingUpload, type UploadTarget } from "@/lib/admin/types";
import { uploadImage } from "./uploadImage";
import { Btn } from "./ui";

type Props = {
  label: string;
  value: string;
  onChange: (publicPath: string) => void;
  onUploaded: (upload: PendingUpload) => void;
  target: Exclude<UploadTarget, "gallery">;
  /** локальні превʼю щойно завантажених файлів: publicPath → objectURL */
  previews: Record<string, string>;
  onPreview: (publicPath: string, url: string) => void;
  error?: string;
  hint?: string;
};

export function ImageField({ label, value, onChange, onUploaded, target, previews, onPreview, error, hint }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const src = value ? previews[value] ?? adminFileUrl(value) : null;

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    const res = await uploadImage(file, target);
    setBusy(false);
    if (!res.ok) {
      setUploadError(res.error);
      return;
    }
    onPreview(res.publicPath, URL.createObjectURL(file));
    onUploaded({ repoPath: res.repoPath, sha: res.sha });
    onChange(res.publicPath);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-mute">{label}</p>
      <div className="flex items-center gap-4">
        <div className="relative grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-ink-3 dot-grid">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- превʼю з API адмінки
            <img src={src} alt="" className="size-full object-contain p-1" />
          ) : (
            <span className="text-[11px] text-mute-2">немає</span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-ink/70">
              <LoaderCircle className="size-5 animate-spin text-lilac-300" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => input.current?.click()} disabled={busy}>
            <ImageUp className="size-4" />
            {value ? "Замінити" : "Завантажити"}
          </Btn>
          {value && (
            <Btn variant="ghost" onClick={() => onChange("")} disabled={busy}>
              <X className="size-4" />
              Прибрати
            </Btn>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={target === "logo" ? "image/png,image/jpeg,image/webp,image/avif,image/svg+xml" : "image/png,image/jpeg,image/webp,image/avif"}
          className="hidden"
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {(uploadError || error) && <p className="mt-1.5 text-xs text-danger">{uploadError || error}</p>}
      {!uploadError && !error && hint && <p className="mt-1.5 text-xs text-mute-2">{hint}</p>}
    </div>
  );
}
