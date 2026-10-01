import { site } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  const { about } = site;

  return (
    <section id="about" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionHeading index="01" kicker="Система турнірів" title={<>Як працюють кібертурніри&nbsp;ХНЕУ</>} />
          <div className="space-y-4 text-mute lg:pb-1">
            <p className="text-lg leading-relaxed text-lilac-100">{about.lead}</p>
            <p className="leading-relaxed">{about.body}</p>
          </div>
        </div>

        <div className="mt-16">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.steps.map((step, i) => (
            <li
              key={step.title}
              className="panel group relative rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-lilac-300/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.25em] text-mute-2">ЕТАП</span>
                <span className="relative z-10 grid size-11 place-items-center rounded-xl border border-lilac-300/40 bg-ink font-display text-sm font-bold text-lilac-300 transition group-hover:bg-lilac-300 group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-8 font-display text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{step.text}</p>
            </li>
          ))}
          </ol>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-ink-2">
          {about.stats.map((s) => (
            <div key={s.label} className="px-4 py-6 text-center sm:px-8">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-2xl font-bold text-lilac-300 sm:text-4xl">{s.value}</dd>
              <dd className="mt-1 text-xs text-mute sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
