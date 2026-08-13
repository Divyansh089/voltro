import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ArrowUpRight, Heart, Star, ChevronDown, Loader2, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { useWishlist } from "@/store/wishlist.store";
import { useCart } from "@/store/cart.store";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useCategories } from "@/modules/products/hooks/useManageProducts";
import { CATEGORY_PREVIEWS } from "@/lib/data";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const category = context.params?.category as string;
  return {
    props: {
      category: category || "all",
    },
  };
};

const SORTS = ["Newest", "Price: low to high", "Price: high to low"] as const;
type Sort = (typeof SORTS)[number];

export default function CategoryListing({ category: serverCategory }: { category: string }) {
  const router = useRouter();
  const category = (router.query.category as string) || serverCategory || "all";

  const { data: categories = [] } = useCategories();
  const isAll = !category || category === "all";
  const cat = categories.find((c) => c.slug === category || c.id === category);

  const searchQuery = (router.query.q as string) || "";

  // Fetch real database products. When isAll is true, categoryId is undefined to return ALL products
  const { data: productsData, isLoading } = useProducts({
    categoryId: isAll ? undefined : (cat?.id || category),
    search: searchQuery || undefined,
    limit: 100,
  });

  const rawProducts = productsData?.data ?? [];

  const wish = useWishlist();
  const cart = useCart();

  const [price, setPrice] = useState(2500);
  const [sort, setSort] = useState<Sort>("Newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let r = rawProducts.filter((p) => Number(p.basePrice) <= price);
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      r = r.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          (p.description && p.description.toLowerCase().includes(qLower)) ||
          (p.category && p.category.name && p.category.name.toLowerCase().includes(qLower))
      );
    }
    switch (sort) {
      case "Price: low to high":
        r = [...r].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
        break;
      case "Price: high to low":
        r = [...r].sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
        break;
      case "Newest":
      default:
        r = [...r].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
    return r;
  }, [rawProducts, price, sort, searchQuery]);

  const categoryName = isAll ? "All Products" : (cat?.name || category.charAt(0).toUpperCase() + category.slice(1));

  const handleResetFilters = () => {
    setPrice(2500);
    setSort("Newest");
    if (!isAll) {
      router.push("/categories/all");
    }
  };

  return (
    <>
      <Head>
        <title>{`${categoryName} — Voltra`}</title>
      </Head>

      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        <div className="grid grid-cols-12 gap-5">
          {/* Sidebar Filters */}
          <aside className="glass col-span-12 self-start p-5 lg:col-span-3 rounded-3xl">
            <h3 className="font-display text-lg font-semibold text-ink">Filters</h3>

            {/* Max Price Range Slider */}
            <div className="mt-5 border-t border-ink/5 pt-4">
              <div className="flex items-center justify-between text-sm font-semibold text-ink">
                <span>Max price</span>
                <span className="text-neon-dark font-bold">${price}</span>
              </div>
              <input
                type="range"
                min={10}
                max={2500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-3 w-full accent-[#CCFF00]"
              />
            </div>

            {/* Categories Selection List */}
            <div className="mt-6 border-t border-ink/5 pt-4">
              <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
                All Categories
              </div>
              <div className="space-y-1.5">
                <Link
                  href="/categories/all"
                  className={`block rounded-xl px-3 py-2 text-xs font-medium transition ${
                    isAll
                      ? "bg-neon/20 font-bold text-ink shadow-sm"
                      : "text-ink-soft hover:bg-white/60 hover:text-ink"
                  }`}
                >
                  All Products
                </Link>

                {categories.map((c) => {
                  const isSelected = !isAll && (c.slug === category || c.id === category);
                  return (
                    <Link
                      key={c.id || c.slug}
                      href={`/categories/${c.slug}`}
                      className={`block rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isSelected
                          ? "bg-neon/20 font-bold text-ink shadow-sm"
                          : "text-ink-soft hover:bg-white/60 hover:text-ink"
                      }`}
                    >
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Reset Filters Action Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white/70 py-2.5 text-xs font-bold text-ink hover:bg-white transition shadow-sm"
            >
              Reset filters
            </button>
          </aside>

          {/* Main Product Grid */}
          <section className="col-span-12 lg:col-span-9">
            <div className="glass mb-5 flex items-center justify-between p-5 rounded-3xl">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink capitalize">
                  {categoryName}
                </h2>
                <p className="text-xs text-ink-soft">
                  Showing {filtered.length} of {rawProducts.length} items from database
                </p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-ink hover:bg-white transition"
                >
                  Sort by: {sort} <ChevronDown size={14} />
                </button>
                {sortOpen && (
                  <div className="glass absolute right-0 z-20 mt-2 w-56 p-2 rounded-2xl shadow-xl">
                    {SORTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSort(s);
                          setSortOpen(false);
                        }}
                        className={`block w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition hover:bg-white/70 ${
                          sort === s ? "bg-white text-ink font-bold" : "text-ink-soft"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="glass flex items-center justify-center p-16 text-ink-soft gap-2 text-sm font-semibold rounded-3xl">
                <Loader2 size={18} className="animate-spin text-neon-dark" /> Loading products...
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass p-16 text-center text-ink-soft rounded-3xl space-y-3">
                <Tag size={32} className="mx-auto text-ink-muted" />
                <p className="font-bold text-ink">No products found in this category.</p>
                <p className="text-xs text-ink-muted">Try adjusting your price filter or resetting filters.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-neon px-4 py-2 text-xs font-bold mt-2"
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
                {filtered.map((p: any) => {
                  const primaryImage =
                    p.images?.find((img: any) => img.isPrimary)?.url ||
                    p.images?.find((img: any) => img.isPrimary)?.imageUrl ||
                    p.images?.[0]?.url ||
                    p.images?.[0]?.imageUrl ||
                    CATEGORY_PREVIEWS[p.category?.slug || "laptop"] ||
                    "/placeholder.png";

                  const firstVariant = p.variants?.[0];
                  const displayPrice = Number(firstVariant?.price ?? p.basePrice ?? 0);

                  return (
                    <div
                      key={p.id}
                      className="glass group relative flex flex-col justify-between p-4 rounded-3xl transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => wish.toggle(p.id)}
                        className={`absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur-md shadow-sm ${
                          wish.has(p.id) ? "text-rose-500" : "text-ink hover:text-rose-500"
                        }`}
                      >
                        <Heart size={14} fill={wish.has(p.id) ? "currentColor" : "none"} />
                      </button>

                      <Link
                        href={`/product/${p.id}`}
                        className="grid h-48 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-ink/5 to-ink/[0.02]"
                      >
                        <img
                          src={primaryImage}
                          alt={p.name}
                          loading="lazy"
                          className="h-36 w-36 object-contain drop-shadow-xl transition group-hover:scale-105"
                        />
                      </Link>

                      <div className="mt-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                          ))}
                          <span className="ml-1 text-xs font-semibold text-ink-muted">
                            {Number(p.averageRating || 5.0).toFixed(1)}
                          </span>
                        </div>

                        <Link
                          href={`/product/${p.id}`}
                          className="mt-2 block font-display text-base font-semibold text-ink hover:underline line-clamp-1"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-ink-soft line-clamp-2 mt-0.5">{p.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3">
                        <div>
                          <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-bold">From</span>
                          <span className="font-display text-lg font-bold text-ink">
                            ${displayPrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              cart.add({
                                id: p.id,
                                name: p.name,
                                price: displayPrice,
                                image: primaryImage,
                                variantId: firstVariant?.id,
                              } as any)
                            }
                            className="btn-neon px-3.5 py-1.5 text-xs font-semibold"
                          >
                            Add to Cart
                          </button>
                          <Link
                            href={`/product/${p.id}`}
                            className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white hover:bg-ink/80 transition"
                          >
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
