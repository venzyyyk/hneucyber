import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Partners() {
  return (
    <section id="partners" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="03" kicker="Партнери" title="Хто стоїть за турніром" />

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {site.partners.map((p) => {
            const sponsor = p.highlight;
            const body = (
              <>
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                      sponsor ? "bg-lilac-300 text-ink" : "border border-line text-lilac-200"
                    }`}
                  >
                    {p.role}
                  </span>
                  {p.href && (
                    <ArrowUpRight className="size-5 text-mute-2 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lilac-300" />
                  )}
                </div>
                <div className="relative mx-auto my-10 h-24 w-full max-w-[220px]">
                  {p.logo ? (
                    <Image src={p.logo} alt={`Логотип: ${p.name}`} fill sizes="220px" className="object-contain" unoptimized />
                  ) : (
                    <span className="grid size-full place-items-center font-display text-2xl font-bold text-lilac-200">{p.name}</span>
                  )}
                </div>
                <p className="font-display text-base font-semibold text-white">{p.name}</p>
              </>
            );
            const cls = `panel group flex h-full flex-col rounded-3xl p-6 transition duration-300 ${
              sponsor ? "border-lilac-300/40 shadow-[0_0_80px_-30px_rgb(170_140_255/0.7)]" : ""
            } ${p.href ? "hover:-translate-y-1 hover:border-lilac-300/50" : ""}`;

            return (
              <li key={p.name}>
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noreferrer" className={cls}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
