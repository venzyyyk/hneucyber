import type { ReactNode } from "react";

type Props = {
  index?: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({ index, kicker, title, children, align = "left" }: Props) {
  const center = align === "center";
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-lilac-300 ${
          center ? "justify-center" : ""
        }`}
      >
        {index && <span className="text-mute-2">{index}</span>}
        <span className="h-px w-8 bg-lilac-300/50" aria-hidden />
        {kicker}
      </p>
      <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {children && <div className="mt-4 text-base leading-relaxed text-mute sm:text-lg">{children}</div>}
    </div>
  );
}
