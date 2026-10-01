"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Send } from "lucide-react";
import { site } from "@/content/site";
import { buttonClass } from "@/components/ui/ButtonLink";

type Props = { id: string; mode: "solo" | "team"; onReset: () => void };

export function SuccessState({ id, mode, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* буфер недоступний — ID і так видно */
    }
  };

  return (
    <div className="hud panel relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
      <div className="absolute left-1/2 top-0 -z-10 size-72 -translate-x-1/2 rounded-full bg-lilac-500/30 blur-3xl" aria-hidden />

      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-lilac-300 text-ink shadow-[0_0_60px_-10px_rgb(170_140_255)]">
        <Check className="size-8" strokeWidth={3} />
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-2xl font-bold text-white outline-none sm:text-3xl">
        {mode === "team" ? "Команду зареєстровано" : "Заявку прийнято"}
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-mute">
        Організатори перевірять дані і напишуть {mode === "team" ? "капітану" : "тобі"} в Telegram. Збережи номер заявки.
      </p>

      <div className="mx-auto mt-8 flex max-w-xs items-center justify-between gap-3 rounded-xl border border-line-strong bg-ink-2 py-2 pl-5 pr-2">
        <span className="font-mono text-lg font-semibold tracking-[0.15em] text-lilac-200">{id}</span>
        <button
          type="button"
          onClick={copy}
          className="grid size-10 place-items-center rounded-lg text-mute transition hover:bg-white/5 hover:text-lilac-300"
          aria-label="Скопіювати номер заявки"
        >
          {copied ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
        </button>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        {site.contacts.telegram && (
          <a href={site.contacts.telegram} target="_blank" rel="noreferrer" className={buttonClass("primary")}>
            <Send className="size-4" />
            {site.contacts.telegramLabel}
          </a>
        )}
        <button type="button" onClick={onReset} className={buttonClass("outline")}>
          Ще одна заявка
        </button>
        <Link href="/" className={buttonClass("ghost")}>
          На головну
        </Link>
      </div>
    </div>
  );
}
