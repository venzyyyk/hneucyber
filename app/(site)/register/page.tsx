import type { Metadata } from "next";
import { Info } from "lucide-react";
import { site, squadLabel } from "@/content/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { Rules } from "@/components/register/Rules";
import { RegistrationPanel } from "@/components/register/RegistrationPanel";

export const metadata: Metadata = {
  title: "Реєстрація",
  description: `Правила та реєстрація на ${site.tournament.discipline}-турнір ХНЕУ: соло або командою ${squadLabel()}.`,
};

export default function RegisterPage() {
  const t = site.tournament;
  const facts = [
    { k: "Дисципліна", v: t.discipline },
    { k: "Формат", v: t.format },
    { k: "Склад", v: squadLabel(t) },
    { k: "Етапи", v: t.stages },
    { k: "Дата", v: t.dateLabel },
  ];

  return (
    <>
      <PageHeader crumb="Реєстрація" kicker="Турнір / CS2" title="Реєстрація" aside={<StatusPill />}>
        Ознайомся з правилами і заповни форму — соло або одразу всією командою.
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {facts.map((f) => (
            <div key={f.k} className="bg-ink-2 px-5 py-4 last:col-span-2 sm:last:col-span-1">
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute-2">{f.k}</dt>
              <dd className="mt-1.5 text-sm font-semibold text-lilac-100">{f.v}</dd>
            </div>
          ))}
        </dl>

        {site.registration.note && (
          <p className="mt-4 flex items-start gap-3 rounded-2xl border border-lilac-300/25 bg-lilac-300/[0.06] px-5 py-4 text-sm text-lilac-100">
            <Info className="mt-0.5 size-4 shrink-0 text-lilac-300" />
            {site.registration.note}
          </p>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2 [scrollbar-width:thin]">
            <Rules />
            <a
              href="#form"
              className="mt-6 inline-flex font-mono text-xs uppercase tracking-[0.2em] text-lilac-300 underline-offset-4 hover:underline lg:hidden"
            >
              ↓ До форми реєстрації
            </a>
          </aside>

          <section id="form" aria-label="Форма реєстрації" className="scroll-mt-24">
            <RegistrationPanel />
          </section>
        </div>
      </div>
    </>
  );
}
