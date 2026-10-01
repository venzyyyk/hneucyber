import { Plus } from "lucide-react";
import { rules } from "@/content/rules";

export function Rules() {
  return (
    <section id="rules" aria-labelledby="rules-title" className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4">
        <h2 id="rules-title" className="font-display text-xl font-bold text-white">
          Правила турніру
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute-2">{rules.length} розділів</span>
      </div>

      <div className="mt-5 space-y-2">
        {rules.map((section, i) => (
          <details
            key={section.title}
            open={i === 0}
            className="group rounded-2xl border border-line bg-ink-2/70 transition open:border-lilac-300/30 open:bg-ink-3/70"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-mono text-xs text-lilac-300">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 font-display text-sm font-semibold text-lilac-50">{section.title}</span>
              <Plus className="size-4 text-mute transition-transform duration-300 group-open:rotate-45 group-open:text-lilac-300" />
            </summary>
            <ul className="space-y-2.5 px-5 pb-5 pl-[3.25rem]">
              {section.items.map((item) => (
                <li key={item} className="relative text-sm leading-relaxed text-mute before:absolute before:-left-4 before:top-[0.6em] before:size-1.5 before:rotate-45 before:bg-lilac-300/60">
                  {item}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
