import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { Heart, Trash2, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/store/wishlist.store";
import { useCart } from "@/store/cart.store";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { ROUTES } from "@/lib/routes";
import { CATEGORY_PREVIEWS } from "@/lib/data";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const cart = useCart();
  const { data: productsData } = useProducts({ limit: 100 });

  const allProducts = productsData?.data || [];
  const wishlistedProducts = allProducts.filter((p: any) => ids.includes(p.id));

  return (
    <>
      <Head>
        <title>Wishlist — Voltra</title>
      </Head>

      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-20 space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="text-rose-500 fill-rose-500" size={28} />
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Your Wishlist</h1>
            <p className="text-xs text-ink-soft">Items you've saved for later</p>
          </div>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl space-y-3">
            <ShoppingBag size={40} className="mx-auto text-ink-muted" />
            <h3 className="font-display text-xl font-bold text-ink">Your wishlist is empty</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">
              Tap the heart icon on any product page or catalog card to save products to your wishlist.
            </p>
            <div className="pt-2">
              <Link href={ROUTES.CATEGORIES} className="btn-neon inline-flex px-5 py-2.5 text-xs font-bold">
                Discover Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map((p: any) => {
              const primaryImage =
                p.images?.find((img: any) => img.isPrimary)?.url ||
                p.images?.find((img: any) => img.isPrimary)?.imageUrl ||
                p.images?.[0]?.url ||
                p.images?.[0]?.imageUrl ||
                CATEGORY_PREVIEWS[p.category?.slug || "laptop"] ||
                "/placeholder.png";

              const displayPrice = Number(p.basePrice || p.variants?.[0]?.price || 0);

              return (
                <div
                  key={p.id}
                  className="glass group relative flex flex-col justify-between p-5 rounded-3xl transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div className="relative grid h-44 place-items-center overflow-hidden rounded-2xl bg-white/50 p-4">
                      <img
                        src={primaryImage}
                        alt={p.name}
                        className="h-36 w-36 object-contain drop-shadow-xl transition group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 space-y-1">
                      <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-neon-dark">
                        {p.category?.name || p.brand || "Voltra"}
                      </span>
                      <h3 className="font-display text-base font-bold text-ink line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-ink-soft line-clamp-2">{p.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-ink/5 pt-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-ink-muted uppercase block font-bold">Price</span>
                      <span className="font-display text-lg font-extrabold text-ink">
                        ${displayPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          cart.add({
                            id: p.id,
                            name: p.name,
                            price: displayPrice,
                            image: primaryImage,
                          } as any)
                        }
                        className="btn-neon flex-1 py-2 text-xs font-bold"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() => toggle(p.id)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink-soft hover:text-rose-500 transition shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>

                      <Link
                        href={`/product/${p.id}`}
                        className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white hover:bg-neon hover:text-ink transition shadow-sm"
                        title="View details"
                      >
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
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
