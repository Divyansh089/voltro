import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Search as SearchIcon } from "lucide-react";
import { ALL_CATEGORY_PRODUCTS, PRODUCTS } from "@/lib/data";
import { useWishlist } from "@/lib/store";
import { Heart } from "lucide-react";

type SearchSchema = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchSchema => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — Voltra" }] }),
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const wish = useWishlist();
  const pool = [...PRODUCTS, ...ALL_CATEGORY_PRODUCTS];
  const seen = new Set<string>();
  const all = pool.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  const query = q.trim().toLowerCase();
  const results = query
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query),
      )
    : all.slice(0, 24);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
      <div className="glass flex items-center gap-3 p-5">
        <SearchIcon size={18} className="text-ink-soft" />
        <div>
          <div className="font-display text-2xl font-bold text-ink">
            {query ? `Results for "${q}"` : "Browse products"}
          </div>
          <p className="text-xs text-ink-soft">{results.length} items</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="glass mt-6 p-10 text-center">
          <p className="text-ink-soft">No products matched your search.</p>
          <Link to="/categories" className="btn-neon mt-4 inline-flex px-5 py-2 text-sm">
            Browse categories
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          {results.map((p) => (
            <div key={p.id} className="glass group relative flex flex-col p-4 transition hover:-translate-y-0.5">
              <button
                onClick={() => wish.toggle(p.id)}
                className={`absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 ${
                  wish.has(p.id) ? "text-rose-500" : "text-ink hover:text-rose-500"
                }`}
              >
                <Heart size={14} fill={wish.has(p.id) ? "currentColor" : "none"} />
              </button>
              <div
                className="grid h-36 place-items-center overflow-hidden rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${p.color}25, ${p.color}05)` }}
              >
                <img src={p.image} alt={p.name} className="h-28 w-28 object-contain drop-shadow-xl" />
              </div>
              <div className="mt-3 text-sm font-semibold text-ink">{p.name}</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="font-display text-base font-bold text-ink">${p.price}</div>
                <Link
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition hover:bg-neon hover:text-ink"
                >
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
