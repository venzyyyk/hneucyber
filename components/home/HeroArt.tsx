import { site } from "@/content/site";

const ticks = Array.from({ length: 72 }, (_, i) => i);

/** Згенерований «прицільний» арт замість фото — поки немає заглавної картинки. */
export function HeroArt() {
  const t = site.tournament;
  const meta = [
    { k: "Дисципліна", v: t.disciplineShort, pos: "left-4 top-4" },
    { k: "Формат", v: t.format, pos: "right-4 top-4 text-right" },
    { k: "Етапи", v: "Online → LAN", pos: "left-4 bottom-4" },
    { k: "Локація", v: site.location.venue, pos: "right-4 bottom-4 text-right" },
  ];

  return (
    <div className="hud panel relative aspect-square w-full overflow-hidden rounded-3xl">
      <div className="dot-grid absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lilac-500/30 blur-3xl animate-pulse-glow"
        aria-hidden
      />

      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eee6ff" />
            <stop offset="1" stopColor="#8f6cff" />
          </linearGradient>
        </defs>

        <g className="origin-center animate-spin-slow" style={{ transformBox: "fill-box" }}>
          {ticks.map((i) => {
            const long = i % 6 === 0;
            return (
              <line
                key={i}
                x1="200"
                y1="36"
                x2="200"
                y2={long ? 54 : 44}
                stroke="#c6b1ff"
                strokeOpacity={long ? 0.9 : 0.35}
                strokeWidth={long ? 2 : 1}
                transform={`rotate(${i * 5} 200 200)`}
              />
            );
          })}
        </g>

        <circle cx="200" cy="200" r="128" fill="none" stroke="url(#ring)" strokeWidth="1.5" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="96" fill="none" stroke="#c6b1ff" strokeOpacity="0.25" />
        <path
          d="M200 104 283 152v96l-83 48-83-48v-96z"
          fill="#c6b1ff"
          fillOpacity="0.06"
          stroke="#c6b1ff"
          strokeOpacity="0.7"
          strokeWidth="1.5"
        />

        <g stroke="#f7f3ff" strokeWidth="3" strokeLinecap="round">
          <line x1="200" y1="150" x2="200" y2="182" />
          <line x1="200" y1="218" x2="200" y2="250" />
          <line x1="150" y1="200" x2="182" y2="200" />
          <line x1="218" y1="200" x2="250" y2="200" />
        </g>
        <circle cx="200" cy="200" r="4" fill="#f7f3ff" />

        <g fill="none" stroke="#c6b1ff" strokeWidth="2">
          <path d="M60 90V60h30" />
          <path d="M340 90V60h-30" />
          <path d="M60 310v30h30" />
          <path d="M340 310v30h-30" />
        </g>
      </svg>

      {meta.map((m) => (
        <div key={m.k} className={`absolute ${m.pos} font-mono`}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-mute-2">{m.k}</p>
          <p className="mt-1 text-sm font-semibold text-lilac-100">{m.v}</p>
        </div>
      ))}
    </div>
  );
}
