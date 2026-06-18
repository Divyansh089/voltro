import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, Star, ChevronDown } from "lucide-react";
import { CATEGORIES, CATEGORY_PRODUCTS } from "@/lib/data";
import { useMemo, useState } from "react";
import { useWishlist, useCart } from "@/lib/store";

export const Route = createFileRoute("/categories/$category")({
  component: CategoryListing,
});

const SORTS = ["Newest", "Price: low to high", "Price: high to low", "Top rated"] as const;
type Sort = (typeof SORTS)[number];

function CategoryListing() {
  const { category } = Route.useParams();
  const cat = CATEGORIES.find((c) => c.slug === category);
  const items = CATEGORY_PRODUCTS[category] ?? [];

  const wish = useWishlist();
  const cart = useCart();

  const [price, setPrice] = useState(2000);
  const [sort, setSort] = useState<Sort>("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    let r = items.filter((p) => p.price <= price && p.rating >= minRating);
    switch (sort) {
      case "Price: low to high": r = [...r].sort((a, b) => a.price - b.price); break;
      case "Price: high to low": r = [...r].sort((a, b) => b.price - a.price); break;
      case "Top rated": r = [...r].sort((a, b) => b.rating - a.rating); break;
    }
    return r;
  }, [items, price, sort, minRating]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
      <div className="grid grid-cols-12 gap-5">
        <aside className="glass col-span-12 self-start p-5 lg:col-span-3">
          <h3 className="font-display text-lg font-semibold text-ink">Filters</h3>

          <div className="mt-5 border-t border-ink/5 pt-4">
            <div className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>Max price</span>
              <span className="text-ink-soft">${price}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2500}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[#CCFF00]"
            />
          </div>

          <div className="mt-5 border-t border-ink/5 pt-4">
            <div className="text-sm font-semibold text-ink">Min rating</div>
            <div className="mt-3 flex gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    minRating === r ? "bg-ink text-white" : "bg-white/70 text-ink hover:bg-white"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setPrice(2000);
              setMinRating(0);
              setSort("Newest");
            }}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white/70 py-2 text-xs font-medium text-ink hover:bg-white"
          >
            Clear filters
          </button>
        </aside>

        <section className="col-span-12 lg:col-span-9">
          <div className="glass mb-5 flex items-center justify-between p-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink capitalize">
                {cat?.name ?? category}
              </h2>
              <p className="text-xs text-ink-soft">{filtered.length} of {items.length} items</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setSortOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-ink hover:bg-white"
              >
                Sort by: {sort} <ChevronDown size={14} />
              </button>
              {sortOpen && (
                <div className="glass absolute right-0 z-10 mt-2 w-56 p-2">
                  {SORTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/70 ${
                        sort === s ? "bg-white text-ink" : "text-ink-soft"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass p-10 text-center text-ink-soft">No products match these filters.</div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {filtered.map((p) => (
                <div key={p.id} className="glass group relative flex flex-col p-4 transition hover:-translate-y-0.5">
                  <button
                    onClick={() => wish.toggle(p.id)}
                    className={`absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 ${
                      wish.has(p.id) ? "text-rose-500" : "text-ink hover:text-rose-500"
                    }`}
                  >
                    <Heart size={14} fill={wish.has(p.id) ? "currentColor" : "none"} />
                  </button>
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="grid h-44 place-items-center overflow-hidden rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${p.color}25, ${p.color}05)` }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-36 w-36 object-contain drop-shadow-xl transition group-hover:scale-105"
                    />
                  </Link>
                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-xs text-ink-muted">{p.rating}</span>
                  </div>
                  <Link to="/product/$id" params={{ id: p.id }} className="mt-2 font-display text-base font-semibold text-ink hover:underline">{p.name}</Link>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="font-display text-lg font-bold text-ink">${p.price}</div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => cart.add(p)}
                        className="rounded-full bg-neon px-3 py-1.5 text-xs font-semibold text-ink hover:bg-[#B8E600]"
                      >
                        Add
                      </button>
                      <Link
                        to="/product/$id"
                        params={{ id: p.id }}
                        className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white"
                      >
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
