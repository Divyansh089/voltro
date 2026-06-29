import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { findProduct, ALL_CATEGORY_PRODUCTS, PRODUCTS } from "@/lib/data";
import { useCart, useWishlist } from "@/lib/store";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  const product = findProduct(id) || null;
  if (!product) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      product,
    },
  };
};

const COLOR_OPTIONS = ["#2563EB", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"];

const REVIEW_POOL = [
  { name: "Ryman Khan", rating: 4.6, text: "Sound stage is wide and natural. Battery life genuinely changed my routine on long flights.", ts: "1 month ago" },
  { name: "Anwen Davin", rating: 4.7, text: "Comfortable for long sessions and the companion app is incredibly clean. ANC is class-leading.", ts: "3 weeks ago" },
  { name: "Jenn Moyca", rating: 4.5, text: "Premium build and the matte finish feels great in hand. Wish the case was slightly smaller.", ts: "2 weeks ago" },
  { name: "Alula Osiza", rating: 4.7, text: "Setup took two minutes and it just works across every Voltra device I own.", ts: "1 month ago" },
];

/* Deterministic dummy detail generator per product */
function getProductDetails(p: { id: string; category: string; name: string; price: number }) {
  const seed = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = <T,>(arr: T[]) => arr[seed % arr.length];

  const materials = ["Aerospace aluminum", "Recycled titanium", "Soft-touch polymer", "Brushed steel", "Carbon-fiber composite"];
  const batteries = ["40h playtime", "26h playtime", "All-day battery", "60h standby", "Fast-charge 18W"];
  const warranties = ["2 years limited", "1 year limited", "3 years premium care", "1 year + 90d returns"];
  const origins = ["Designed in Oslo", "Designed in Tokyo", "Designed in Berlin", "Designed in Seoul"];
  const connectivity = ["Bluetooth 5.3 / USB-C", "Wi-Fi 6E / USB-C", "USB-C / 3.5mm", "Wireless + USB-C"];

  return {
    sku: `VLT-${p.id.toUpperCase()}-${(seed % 900) + 100}`,
    color: pick(["Midnight", "Cloud", "Mint", "Coral", "Aurum", "Pearl"]),
    brand: "Voltra",
    material: pick(materials),
    battery: pick(batteries),
    warranty: pick(warranties),
    origin: pick(origins),
    connectivity: pick(connectivity),
    inStock: (seed % 7) !== 0,
    description:
      `The ${p.name} is engineered for everyday brilliance — pairing the refined ${pick(materials).toLowerCase()} chassis with Voltra's signature tactile feedback. ` +
      `Each unit is calibrated in-house, tuned for the ${p.category.toLowerCase()} workflow you actually live in, and built to age gracefully across thousands of hours of use.`,
  };
}

export default function ProductDetail({ product }: { product: NonNullable<ReturnType<typeof findProduct>> }) {
  const cart = useCart();
  const wish = useWishlist();
  const router = useRouter();
  const liked = wish.has(product.id);
  const details = getProductDetails(product);

  /* Build a small thumbnail set from sibling products in the same category */
  const siblings = ALL_CATEGORY_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);
  const fallbackSiblings = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  const thumbs = [product, ...(siblings.length ? siblings : fallbackSiblings)].slice(0, 5);

  const [selectedThumb, setSelectedThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const activeImage = thumbs[selectedThumb]?.image ?? product.image;

  return (
    <>
      <Head>
        <title>{`${product.name} — Voltra`}</title>
        <meta name="description" content={details.description} />
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-ink-soft">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight size={12} />
          <Link href="/categories" className="hover:text-ink">Categories</Link>
          <ChevronRight size={12} />
          <span className="text-ink">{product.category}</span>
        </div>

        {/* Title bar */}
        <div className="glass mb-5 flex items-center justify-between p-5">
          <h1 className="font-display text-3xl font-bold text-ink capitalize">{product.category}</h1>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            Sort by: <button className="rounded-full bg-white/70 px-3 py-1.5 text-ink">New Access</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT — gallery + details */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            <div className="glass p-5">
              {/* Main image */}
              <div
                className="relative grid h-[420px] place-items-center overflow-hidden rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${product.color}28, #ffffff80 70%, #EEF2F7)`,
                }}
              >
                <div className="absolute h-72 w-72 rounded-full bg-white/70 blur-2xl" />
                <button
                  onClick={() => wish.toggle(product.id)}
                  className={`absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 shadow ${
                    liked ? "text-rose-500" : "text-ink hover:text-rose-500"
                  }`}
                  aria-label="Like"
                >
                  <Heart size={15} fill={liked ? "currentColor" : "none"} />
                </button>
                <img
                  src={activeImage}
                  alt={product.name}
                  width={768}
                  height={768}
                  className="relative h-80 w-80 object-contain drop-shadow-2xl"
                />
                <span className="absolute left-10 top-10 h-2 w-2 rounded-full bg-ink/20" />
                <span className="absolute right-12 top-20 h-1.5 w-1.5 rounded-full bg-ink/20" />
                <span className="absolute bottom-16 left-16 h-2.5 w-2.5 rounded-full bg-ink/20" />
              </div>

              {/* Horizontal thumbnail rail below main image */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setSelectedThumb((i) => Math.max(0, i - 1))}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-ink hover:bg-white"
                  aria-label="Previous"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex flex-1 gap-3 overflow-x-auto">
                  {thumbs.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedThumb(i)}
                      className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border transition ${
                        selectedThumb === i
                          ? "border-ink bg-white"
                          : "border-transparent bg-white/60 hover:bg-white"
                      }`}
                    >
                      <img src={t.image} alt={t.name} className="h-14 w-14 object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedThumb((i) => Math.min(thumbs.length - 1, i + 1))}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-ink hover:bg-white"
                  aria-label="Next"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Product Details panel */}
            <div className="glass p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-ink">Product Details</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{details.description}</p>

              <h3 className="mt-8 font-display text-xl font-bold text-ink">Details</h3>
              <dl className="mt-4 grid grid-cols-1 gap-y-3 text-sm md:grid-cols-2 md:gap-x-10">
                {[
                  ["Color", details.color],
                  ["Brand", details.brand],
                  ["Category", product.category],
                  ["Material", details.material],
                  ["Battery", details.battery],
                  ["Connectivity", details.connectivity],
                  ["Warranty", details.warranty],
                  ["Origin", details.origin],
                  ["SKU", details.sku],
                  ["Rating", `${product.rating} (${product.reviews} reviews)`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-ink/5 pb-2">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* RIGHT — buy box + reviews */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            <div className="glass p-6">
              <span className="chip">{product.category}</span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink">
                {product.name}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-ink/20"
                    }
                  />
                ))}
                <span className="text-xs text-ink-soft">{product.rating}</span>
              </div>

              <div className="mt-4 font-display text-4xl font-bold text-ink">
                ${product.price.toFixed(2)}
              </div>

              <button
                onClick={() => cart.add(product)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink/90"
              >
                <ShoppingCart size={16} /> add to cart
              </button>

              <div className="mt-6">
                <div className="text-sm font-semibold text-ink">Colors</div>
                <div className="mt-3 flex gap-3">
                  {COLOR_OPTIONS.map((c, i) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(i)}
                      aria-label={`Color ${i + 1}`}
                      className={`h-8 w-8 rounded-full border-2 shadow transition ${
                        selectedColor === i ? "border-ink scale-110" : "border-white"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => cart.add(product)}
                  className="btn-neon inline-flex flex-1 items-center justify-center gap-2 py-3 text-sm"
                >
                  add to cart
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white">
                    <ArrowUpRight size={14} />
                  </span>
                </button>
                <button
                  onClick={() => wish.toggle(product.id)}
                  className={`grid h-12 w-12 place-items-center rounded-full bg-white/70 ${
                    liked ? "text-rose-500" : "text-ink hover:text-rose-500"
                  }`}
                  aria-label="Save"
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                </button>
              </div>

              <button
                onClick={() => {
                  cart.add(product);
                  router.push("/checkout");
                }}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white/70 px-5 py-3 text-sm font-semibold text-ink hover:bg-white"
              >
                Buy now
              </button>

              <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
                <span>{details.inStock ? "✓ In stock — ships in 24h" : "Backorder — 5 days"}</span>
                <span>{details.sku}</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="glass p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">User Reviews &amp; Comments</h3>
              </div>
              <div className="mt-4 space-y-3">
                {REVIEW_POOL.map((r) => (
                  <div key={r.name} className="glass-soft flex gap-3 p-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xs font-semibold text-white">
                      {r.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-ink">{r.name}</div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> {r.rating}
                        </div>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{r.text}</p>
                      <div className="mt-1 text-[10px] text-ink-muted">{r.ts}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-ink hover:bg-white">
                Write a review
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
