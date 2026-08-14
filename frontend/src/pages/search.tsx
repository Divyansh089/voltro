import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowUpRight, Search as SearchIcon, Heart, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useWishlist } from "@/store/wishlist.store";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { CATEGORY_PREVIEWS } from "@/lib/data";

export default function SearchPage() {
  const router = useRouter();
  const wish = useWishlist();

  const initialQuery = (router.query.q as string) || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  // Sync state when router query changes
  useEffect(() => {
    if (router.query.q !== undefined) {
      setSearchTerm(router.query.q as string);
    }
  }, [router.query.q]);

  // Fetch real database products from backend search API
  const { data: productsData, isLoading, isError } = useProducts({
    search: searchTerm,
    limit: 50,
  });

  const products = productsData?.data || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: "/search",
      query: { q: searchTerm },
    });
  };

  return (
    <>
      <Head>
        <title>{searchTerm ? `Search "${searchTerm}" — Voltra` : "Browse Products — Voltra"}</title>
      </Head>

      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-20 space-y-6">
        {/* Header & Live Search Bar */}
        <div className="glass p-6 md:p-8 rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
                {searchTerm ? `Search Results for "${searchTerm}"` : "Browse Product Catalog"}
              </h1>
              <p className="text-xs text-ink-soft mt-1">
                {isLoading ? "Searching catalog..." : `${products.length} database items found`}
              </p>
            </div>

            <Link href="/categories/all" className="btn-neon px-4 py-2 text-xs font-bold">
              View All Categories
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-xl pt-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, category, or brand..."
              className="h-12 w-full rounded-2xl bg-white/80 pl-11 pr-24 text-sm text-ink placeholder:text-ink-muted outline-none border border-ink/10 focus:border-neon focus:ring-2 focus:ring-neon/40 shadow-sm"
            />
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-neon px-4 py-1.5 text-xs font-extrabold rounded-xl"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="mx-auto flex min-h-[40vh] items-center justify-center p-12 text-ink-soft">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Loader2 size={24} className="animate-spin text-neon-dark" /> Searching products...
            </div>
          </div>
        ) : isError ? (
          <div className="glass p-12 text-center rounded-3xl">
            <AlertCircle size={40} className="mx-auto mb-3 text-rose-500" />
            <p className="text-sm font-bold text-ink">Failed to load catalog products</p>
            <p className="text-xs text-ink-soft mt-1">Check your connection or try again.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl space-y-3">
            <ShoppingBag size={40} className="mx-auto text-ink-muted" />
            <h3 className="font-display text-xl font-bold text-ink">No products found</h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              We couldn't find any products matching "{searchTerm}". Try checking for spelling errors or searching for broader terms like "laptop", "phone", or "audio".
            </p>
            <div className="pt-2">
              <Link href="/categories/all" className="btn-neon inline-flex px-5 py-2.5 text-xs font-bold">
                Browse Full Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid displaying real Database Products */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((prod: any) => {
              const liked = wish.has(prod.id);
              const mainImg = prod.images?.[0]?.url || prod.images?.[0]?.imageUrl || CATEGORY_PREVIEWS[prod.category?.slug || "laptop"] || "/placeholder.png";
              const price = Number(prod.basePrice || prod.variants?.[0]?.price || 0);

              return (
                <div
                  key={prod.id}
                  className="glass group relative flex flex-col justify-between p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => wish.toggle(prod.id)}
                    className={`absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur-md shadow-sm transition ${
                      liked ? "text-rose-500" : "text-ink hover:text-rose-500"
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  </button>

                  <div>
                    <div className="relative grid h-44 place-items-center overflow-hidden rounded-2xl bg-white/50 p-4">
                      <img
                        src={mainImg}
                        alt={prod.name}
                        className="h-36 w-36 object-contain drop-shadow-xl transition-all duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 space-y-1">
                      <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-neon-dark">
                        {prod.category?.name || prod.brand || "Voltra"}
                      </span>
                      <h3 className="font-display text-base font-bold text-ink line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-ink-soft line-clamp-2">{prod.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3">
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block font-bold">Price</span>
                      <span className="font-display text-lg font-extrabold text-ink">
                        ${price.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href={`/product/${prod.id}`}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white transition-all hover:bg-neon hover:text-ink hover:scale-105 shadow-md"
                      aria-label="View product"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
