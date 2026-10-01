import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <main className="relative grid flex-1 place-items-center px-4 py-24">
      <div className="absolute left-4 top-4 sm:left-8">
        <Logo />
      </div>
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lilac-300">Помилка 404</p>
        <h1 className="gradient-text mt-4 font-display text-7xl font-black sm:text-9xl">404</h1>
        <p className="mt-4 text-mute">Такої сторінки немає. Схоже, це був фейк-пік.</p>
        <ButtonLink href="/" className="mt-8">
          На головну
        </ButtonLink>
      </div>
    </main>
  );
}
