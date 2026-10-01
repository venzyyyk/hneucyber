import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <path d="M20 2 36 11v18L20 38 4 29V11L20 2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 9 30 14.5v11L20 31l-10-5.5v-11L20 9Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M20 13v5M20 22v5M13 20h5M22 20h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="KHNUE Cyber — на головну">
      <LogoMark className="size-8 text-lilac-300 transition-transform duration-500 group-hover:rotate-90" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-bold tracking-wide text-white">KHNUE</span>
        <span className="font-mono text-[10px] tracking-[0.35em] text-lilac-300">CYBER</span>
      </span>
    </Link>
  );
}
