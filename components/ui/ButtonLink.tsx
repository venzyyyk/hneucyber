import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-wide transition duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-lilac-300 text-ink shadow-[0_0_0_1px_rgb(198_177_255/0.5),0_10px_40px_-10px_rgb(170_140_255/0.8)] hover:bg-lilac-200 hover:shadow-[0_0_0_1px_rgb(221_208_255/0.7),0_14px_50px_-10px_rgb(170_140_255/1)] active:translate-y-px",
  outline:
    "border border-line-strong bg-white/[0.03] text-lilac-50 hover:border-lilac-300/60 hover:bg-lilac-300/10 active:translate-y-px",
  ghost: "text-lilac-100 hover:bg-white/5 hover:text-white",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

type Props = ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode };

export function ButtonLink({ variant = "primary", className = "", children, ...props }: Props) {
  return (
    <Link {...props} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
