import { useRouterState } from "@tanstack/react-router";

export function Footer() {
  const { location } = useRouterState();
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/dealer")) return null;

  return (
    <footer className="mx-auto mt-16 w-full max-w-[1400px] px-4 pb-10">
      <div className="glass flex flex-col items-start gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-2xl font-bold text-ink">
            Voltra<span className="text-neon">.</span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Next-gen consumer electronics, delivered globally.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-ink-soft">
          <a href="#" className="hover:text-ink">About</a>
          <a href="#" className="hover:text-ink">Press</a>
          <a href="#" className="hover:text-ink">Careers</a>
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Terms</a>
        </div>
        <div className="text-xs text-ink-muted">© 2026 Voltra Inc.</div>
      </div>
    </footer>
  );
}
