"use client";

import { useState, type KeyboardEvent } from "react";
import { User, Users } from "lucide-react";
import { site, squadLabel } from "@/content/site";
import { SoloForm } from "./SoloForm";
import { TeamForm } from "./TeamForm";
import { SuccessState } from "./SuccessState";

type Mode = "solo" | "team";

const tabs: { mode: Mode; label: string; sub: string; icon: typeof User }[] = [
  { mode: "solo", label: "Соло", sub: "Один гравець", icon: User },
  {
    mode: "team",
    label: "Команда",
    sub: squadLabel(),
    icon: Users,
  },
];

export function RegistrationPanel() {
  const [mode, setMode] = useState<Mode>("solo");
  const [done, setDone] = useState<{ id: string; mode: Mode } | null>(null);
  const [round, setRound] = useState(0);

  if (site.registration.status !== "open") {
    return (
      <div className="hud panel rounded-3xl p-8 text-center sm:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-lilac-300">
          {site.registration.status === "soon" ? "Скоро" : "Закрито"}
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold text-white">
          {site.registration.status === "soon" ? "Реєстрація відкриється згодом" : "Реєстрацію завершено"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-mute">Слідкуй за оголошеннями в Telegram-каналі турніру.</p>
      </div>
    );
  }

  if (done) {
    return (
      <SuccessState
        id={done.id}
        mode={done.mode}
        onReset={() => {
          setDone(null);
          setRound((r) => r + 1);
        }}
      />
    );
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: Mode = mode === "solo" ? "team" : "solo";
    setMode(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <div className="panel rounded-3xl p-5 sm:p-8">
      <div role="tablist" aria-label="Тип реєстрації" className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-ink-2 p-1.5">
        {tabs.map(({ mode: m, label, sub, icon: Icon }) => {
          const active = mode === m;
          return (
            <button
              key={m}
              id={`tab-${m}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${m}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setMode(m)}
              onKeyDown={onTabKey}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                active ? "bg-lilac-300 text-ink shadow-[0_8px_30px_-10px_rgb(170_140_255)]" : "text-lilac-100 hover:bg-white/5"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex flex-col">
                <span className="font-display text-sm font-semibold">{label}</span>
                <span className={`text-xs ${active ? "text-ink/70" : "text-mute-2"}`}>{sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tabs.map(({ mode: m }) => (
          <div key={`${m}-${round}`} id={`panel-${m}`} role="tabpanel" aria-labelledby={`tab-${m}`} hidden={mode !== m}>
            {m === "solo" ? (
              <SoloForm onSuccess={(id) => setDone({ id, mode: "solo" })} />
            ) : (
              <TeamForm onSuccess={(id) => setDone({ id, mode: "team" })} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
