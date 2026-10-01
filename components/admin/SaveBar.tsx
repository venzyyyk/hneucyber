"use client";

import { Check, ExternalLink, LoaderCircle, RotateCcw, Save } from "lucide-react";
import type { ActionResult } from "@/lib/admin/types";
import { Btn } from "./ui";

type Props = {
  dirty: boolean;
  pending: boolean;
  result: ActionResult | null;
  onSave: () => void;
  onReset: () => void;
  extra?: string;
};

/** Липка панель збереження внизу екрана. */
export function SaveBar({ dirty, pending, result, onSave, onReset, extra }: Props) {
  const show = dirty || pending || result;
  if (!show) return null;

  return (
    <div className="sticky bottom-4 z-30 mt-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-line-strong bg-ink/90 p-3 pl-5 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm">
          {pending ? (
            <span className="text-lilac-100">Зберігаю…</span>
          ) : result && !dirty ? (
            result.ok ? (
              <span className="flex flex-wrap items-center gap-2 text-ok">
                <Check className="size-4 shrink-0" />
                {result.message}
                {result.commitUrl && (
                  <a href={result.commitUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-mute underline-offset-4 hover:text-lilac-300 hover:underline">
                    коміт <ExternalLink className="size-3" />
                  </a>
                )}
              </span>
            ) : (
              <span className="text-danger">{result.error}</span>
            )
          ) : result && !result.ok ? (
            <span className="text-danger">{result.error}</span>
          ) : (
            <span className="text-lilac-100">
              Є незбережені зміни{extra ? <span className="text-mute"> · {extra}</span> : null}
            </span>
          )}
        </div>
        {dirty && (
          <div className="flex shrink-0 gap-2">
            <Btn variant="ghost" onClick={onReset} disabled={pending}>
              <RotateCcw className="size-4" />
              Скасувати
            </Btn>
            <Btn variant="primary" onClick={onSave} disabled={pending}>
              {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              Зберегти
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
