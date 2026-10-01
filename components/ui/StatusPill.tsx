import { site } from "@/content/site";

const labels = {
  open: "Реєстрація відкрита",
  soon: "Реєстрація скоро",
  closed: "Реєстрацію закрито",
} as const;

export function StatusPill() {
  const status = site.registration.status;
  const live = status === "open";

  return (
    <p className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-white/[0.04] py-1.5 pl-3 pr-4 font-mono text-[10px] uppercase tracking-[0.12em] text-lilac-100 backdrop-blur sm:gap-3 sm:text-[11px] sm:tracking-[0.2em]">
      <span className="relative flex size-2">
        {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok/70" />}
        <span className={`relative inline-flex size-2 rounded-full ${live ? "bg-ok" : "bg-mute-2"}`} />
      </span>
      {labels[status]}
      <span className="text-mute-2">/</span>
      <span className="text-mute">{site.tournament.dateLabel}</span>
    </p>
  );
}
