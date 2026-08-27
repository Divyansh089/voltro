import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Head from "next/head";
import {
  ArrowUpRight,
  ArrowRight,
  Star,
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  Cable,
  Tablet,
  Plane,
  Cpu,
  BatteryCharging,
  Volume2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PRODUCTS, IMAGES } from "@/lib/data";
import { useCategories } from "@/modules/products/hooks/useManageProducts";
import { useProducts } from "@/modules/products/hooks/useProducts";

/* ---------- Hero (Flagship Interactive Animated Pedestal Carousel) ---------- */
const PEDESTAL_PRODUCTS = [
  {
    id: "lumen",
    name: "Lumen VR",
    label: "VR Headset",
    img: IMAGES.vr,
    link: "/product/lumen",
  },
  {
    id: "vphone",
    name: "Voltra Phone",
    label: "Phones",
    img: IMAGES.phoneBlack,
    link: "/product/vphone",
  },
  {
    id: "sequoia",
    name: "Sequoia Headphone",
    label: "Headphones",
    img: IMAGES.headphonesNavy,
    link: "/product/sequoia",
  },
  {
    id: "vbook",
    name: "Voltra Book M3",
    label: "New Release",
    img: IMAGES.laptopSilver,
    link: "/product/vbook",
  },
  {
    id: "xbudb",
    name: "Smart Speaker",
    label: "Smart Speaker",
    img: IMAGES.speaker,
    link: "/product/xbudb",
  },
];

const SLOT_CONFIGS = [
  { h: "h-40", w: "w-24", tilt: "-rotate-3", imgH: "h-28", zIndex: 10 },
  { h: "h-56", w: "w-28", tilt: "rotate-1", imgH: "h-32", zIndex: 20 },
  { h: "h-72", w: "w-36", tilt: "-rotate-1", imgH: "h-40", zIndex: 30, isApex: true },
  { h: "h-60", w: "w-28", tilt: "rotate-2", imgH: "h-24", zIndex: 20 },
  { h: "h-44", w: "w-24", tilt: "-rotate-2", imgH: "h-24", zIndex: 10 },
];

function Hero() {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle products along the pedestal arc every 2.8s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setOffset((prev) => (prev - 1 + 5) % 5);
  };

  const handleNext = () => {
    setOffset((prev) => (prev + 1) % 5);
  };

  // Click any pedestal to make it the highest center apex (slot 2)
  const handleItemClick = (prodIdx: number) => {
    const targetOffset = (2 - prodIdx + 5) % 5;
    setOffset(targetOffset);
  };

  return (
    <section className="glass relative col-span-12 overflow-hidden p-6 md:p-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#B8F2D8] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#CDE7FF] opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-neon/20 blur-3xl" />

      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <h1 className="font-display text-[56px] font-extrabold leading-[0.95] tracking-tight text-ink md:text-[80px]">
            VOLTRA.
            <br />
            NEXT-GEN
            <br />
            GADGETS.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Explore our curated ecosystem of cutting-edge phones, laptops, and spatial audio gear. Experience futuristic consumer hardware crafted for tomorrow.
          </p>

          <Link
            href="/categories/all"
            className="btn-neon mt-8 inline-flex items-center gap-3 py-3 pl-6 pr-2 text-sm shadow-[0_10px_30px_-10px_rgba(204,255,0,0.7)] font-extrabold"
          >
            Explore Collections
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white">
              <ArrowRight size={16} strokeWidth={2} />
            </span>
          </Link>
        </div>

        {/* RIGHT — interactive animated pedestal carousel */}
        <div
          className="relative h-[440px] md:h-[480px] group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Pedestals Array */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 md:gap-3 px-2">
            {PEDESTAL_PRODUCTS.map((prod, prodIdx) => {
              const slotIdx = (prodIdx + offset) % 5;
              const slotConfig = SLOT_CONFIGS[slotIdx];

              return (
                <div
                  key={prod.id}
                  onClick={() => handleItemClick(prodIdx)}
                  style={{ zIndex: slotConfig.zIndex }}
                  className={`cursor-pointer transition-all duration-700 ease-in-out transform hover:scale-105 ${slotConfig.h} ${slotConfig.w} ${slotConfig.tilt}`}
                >
                  <div
                    className={`absolute inset-0 rounded-md border transition-all duration-700 ${slotConfig.isApex
                      ? "border-white/80 bg-gradient-to-b from-white/85 via-white/60 to-slate-100/40 shadow-2xl"
                      : "border-white/60 bg-gradient-to-b from-white/55 to-white/15 shadow-lg backdrop-blur-sm"
                      }`}
                  />
                  <div className="absolute inset-x-1 top-2 h-2 rounded-sm bg-white/40" />

                  {/* Product Image */}
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className={`absolute left-1/2 ${slotConfig.imgH} w-auto -translate-x-1/2 object-contain drop-shadow-2xl transition-all duration-700 ${slotConfig.isApex ? "scale-110 drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)]" : ""
                      }`}
                    style={{ bottom: "calc(100% - 20px)" }}
                  />

                  {/* Label / Rich Rating Badge */}
                  {slotConfig.isApex ? (
                    <span className="absolute right-0 -top-4 translate-x-[20%] lg:translate-x-[60%] rounded-md bg-white/95 px-3 py-1.5 text-left text-[11px] font-bold text-ink shadow-xl border border-ink/10 z-50 whitespace-nowrap">
                      <div>{prod.name}</div>
                      <div className="mt-0.5 flex items-center gap-0.5 text-amber-400">
                        {[0, 1, 2, 3, 4].map((starIdx) => (
                          <Star key={starIdx} size={10} className="fill-amber-400" />
                        ))}
                        <span className="text-[9px] font-extrabold text-ink ml-1">4.9 ★</span>
                      </div>
                    </span>
                  ) : (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-ink shadow-sm border border-white/80 transition-all duration-700">
                      {prod.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Voltra Categories (Visual Card Showcase) ---------- */
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  laptops: "/category/laptop01.png",
  phones: "/category/phone9.png",
  tablets: "/category/tab01.png",
  drones: "/category/drone01.png",
  audio: "/category/audio01.png",
  accessories: "/category/acc01.png",
};

const ORDERED_SLUGS = ["accessories", "audio", "drones", "tablets", "phones", "laptops"];

const DEFAULT_CATEGORIES = [
  { id: "accessories", name: "Accessories", slug: "accessories", itemCount: 0, imgSrc: "/category/acc01.png" },
  { id: "audio", name: "Audio", slug: "audio", itemCount: 0, imgSrc: "/category/audio01.png" },
  { id: "drones", name: "Drones", slug: "drones", itemCount: 0, imgSrc: "/category/drone01.png" },
  { id: "tablets", name: "Tablets", slug: "tablets", itemCount: 0, imgSrc: "/category/tab01.png" },
  { id: "phones", name: "Phones", slug: "phones", itemCount: 0, imgSrc: "/category/phone9.png" },
  { id: "laptops", name: "Laptops", slug: "laptops", itemCount: 0, imgSrc: "/category/laptop01.png" },
];

function VoltraCategories() {
  const { data: dbCategories = [] } = useCategories();
  const { data: productsData } = useProducts({ limit: 100 });
  const allProducts = productsData?.data || [];

  const categoriesToDisplay = useMemo(() => {
    const listToUse = !dbCategories || dbCategories.length === 0 ? DEFAULT_CATEGORIES : dbCategories;

    const sorted = [...listToUse].sort((a: any, b: any) => {
      const aIndex = ORDERED_SLUGS.indexOf(a.slug.toLowerCase());
      const bIndex = ORDERED_SLUGS.indexOf(b.slug.toLowerCase());
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      return 0;
    });

    return sorted.map((c: any) => {
      const slugLower = c.slug.toLowerCase();
      // Count actual matching items from database product table
      const countInDb = allProducts.filter(
        (p: any) =>
          p.categoryId === c.id ||
          p.category?.id === c.id ||
          p.category?.slug?.toLowerCase() === slugLower
      ).length;

      const itemCount = countInDb > 0 ? countInDb : (c._count?.products ?? 0);
      const imgSrc = CATEGORY_IMAGE_MAP[slugLower] || c.imgSrc || "/category/acc01.png";

      return {
        id: c.id || c.slug,
        name: c.name,
        slug: c.slug,
        itemCount,
        imgSrc,
      };
    });
  }, [dbCategories, allProducts]);

  return (
    <section className="glass mt-8 p-6 md:p-8 rounded-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl md:text-2xl font-extrabold text-ink">Explore Voltra Categories</h2>
        <Link href="/categories/all" className="chip inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-ink/10 transition shadow-sm">
          View All <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {categoriesToDisplay.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group relative flex h-56 sm:h-64 flex-col justify-end overflow-hidden rounded-2xl md:rounded-[24px] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-white/80"
          >
            {/* Full Card Background Image */}
            <img
              src={c.imgSrc}
              alt={c.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />

            {/* Text Floating Directly Over the Image */}
            <div className="relative z-10">
              <span className="block font-display text-base font-extrabold text-ink drop-shadow-sm">{c.name}</span>
              <span className="block text-xs font-medium text-ink-soft mt-0.5 drop-shadow-sm">
                {c.itemCount} {c.itemCount === 1 ? "item" : "items"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Trending Now — Exact Bento Showcase Grid ---------- */
function TrendingNow() {
  return (
    <section className="glass mt-8 p-6 md:p-8 rounded-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink">
            Trending Now
          </h2>
        </div>

        <Link
          href="/categories/all"
          className="btn-neon px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          Explore All Products <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-12 gap-4">
        {/* ROW 1 & 2: LEFT BLOCK (Col 1-6) */}

        {/* Card 1: Voltra Book Pro M3 (Top Left Wide) */}
        <Link
          href="/categories/laptops"
          className="group relative col-span-12 lg:col-span-6 flex h-60 sm:h-64 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#D4D7DB] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/voltra-book3.png"
            alt="Voltra Book Pro M3"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              TRENDING
            </span>
            <span className="font-display text-xl font-extrabold text-ink">${1899}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-extrabold text-ink">
                Voltra Book Pro M3
              </h3>
              <p className="text-xs font-medium text-ink-soft mt-0.5 max-w-xs">
                Next-Gen M3 Max Processing &amp; Retina XDR Display
              </p>
              <div className="font-display text-xl font-extrabold text-ink mt-2">${1899}</div>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Card 2: Laser-Etched Processor (Tall Center Feature - Spans 2 Rows) */}
        <Link
          href="/categories/all"
          className="group relative col-span-12 md:col-span-6 lg:col-span-3 lg:row-span-2 flex h-80 lg:h-full min-h-[460px] flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#C5C8CC] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/voltra-sky.png"
            alt="Laser-Etched Processor"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="relative z-10 flex items-start justify-end">
            <span className="font-display text-xl font-extrabold text-ink">${1899}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-2">
            <h3 className="font-display text-xl md:text-2xl font-extrabold uppercase leading-tight text-ink">
              LASER-ETCHED
              <br />
              PROCESSOR
            </h3>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Card 3: Voltra Sound Pro Headphones & Buds (Top Right) */}
        <Link
          href="/categories/audio"
          className="group relative col-span-12 md:col-span-6 lg:col-span-3 flex h-60 sm:h-64 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#D4D7DB] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/voltra-headset.png"
            alt="Voltra Sound Pro Headphones & Buds"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              AUDIO COLLECTION
            </span>
            <span className="font-display text-xl font-extrabold text-ink">${179}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-2">
            <h3 className="font-display text-lg md:text-xl font-extrabold text-ink leading-tight max-w-[180px]">
              Voltra Sound Pro Headphones &amp; Buds
            </h3>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Card 4: Voltra X-Buds Pro (Middle Left A) */}
        <Link
          href="/categories/audio"
          className="group relative col-span-12 sm:col-span-6 lg:col-span-3 flex h-52 sm:h-56 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#333] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/X-buds.png"
            alt="Voltra X-Buds Pro"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              BEST SELLER
            </span>
            <span className="font-display text-xl font-extrabold text-white">${199}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-extrabold text-white uppercase leading-tight">
                VOLTRA X-BUDS PRO
              </h3>
              <p className="text-xs font-medium text-slate-200 mt-1 max-w-[200px]">
                Voltra X-Buds Pro - Active Noise Cancellation &amp; Spatial Audio.
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Card 5: Voltra Gaming Chip (Middle Left B) */}
        <Link
          href="/categories/all"
          className="group relative col-span-12 sm:col-span-6 lg:col-span-3 flex h-52 sm:h-56 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#222] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/voltra-sky.png"
            alt="Voltra Gaming Chip"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              GAMING TECH
            </span>
            <span className="font-display text-xl font-extrabold text-white">${199}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-extrabold text-white uppercase leading-tight">
                VOLTRA GAMING CHIP
              </h3>
              <p className="text-xs font-medium text-slate-200 mt-1 max-w-[190px]">
                Voltra Gaming Processing - Powering Immersive Graphics.
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Card 6: Voltra Pro Gaming Headset (Middle Right) */}
        <Link
          href="/categories/audio"
          className="group relative col-span-12 md:col-span-6 lg:col-span-3 flex h-52 sm:h-56 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#333] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/voltra-headset.png"
            alt="Voltra Pro Gaming Headset"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              AUDIO COLLECTION
            </span>
            <span className="font-display text-xl font-extrabold text-white">${149}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-extrabold text-white uppercase leading-tight">
                VOLTRA PRO GAMING HEADSET
              </h3>
              <p className="text-xs font-medium text-slate-200 mt-1 max-w-[190px]">
                Surround Sound &amp; Detachable Mic - Dominate the Lobby.
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* ROW 3: 3 CARDS (LEFT TABLET, CENTER CABLE, RIGHT PHONE WITH RIGHT-ALIGNED TEXT & NO LOGO) */}

        {/* Card 7: Voltra Creator Tablet (Bottom Left - Wide 5 Cols) */}
        <Link
          href="/categories/tablets"
          className="group relative col-span-12 lg:col-span-5 flex h-56 sm:h-60 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#D4D7DB] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/voltra-tablet.png"
            alt="Voltra Creator Tablet"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              TRENDING
            </span>
            <span className="font-display text-xl font-extrabold text-ink">${999}</span>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-extrabold text-ink leading-tight">
                VOLTRA CREATOR TABLET
              </h3>
              <p className="text-[11px] font-medium text-ink-soft mt-0.5 max-w-xs">
                Voltra Creator Tablet - High Precision &amp; Color Accuracy.
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Card 8: Voltra Creative Cable (Bottom Center - Small 2 Cols) */}
        <Link
          href="/categories/accessories"
          className="group relative col-span-12 sm:col-span-4 lg:col-span-2 flex h-56 sm:h-60 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#D4D7DB] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/category/acc01.png"
            alt="Creative Cable"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

          <div /> {/* Top spacer */}

          <div className="relative z-10 flex items-center justify-between">
            <span className="font-display text-base font-extrabold text-white drop-shadow-md">
              ${249}
            </span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900/90 text-white shadow-md transition-transform duration-300 group-hover:scale-110 border border-white/20">
              <ArrowUpRight size={15} />
            </span>
          </div>
        </Link>

        {/* Card 9: Voltra Phone 15 (Bottom Right - Wide 5 Cols, Right Aligned Text, No Logo) */}
        <Link
          href="/categories/phones"
          className="group relative col-span-12 lg:col-span-5 flex h-56 sm:h-60 flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-[#3A322C] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <img
            src="/trending/Voltra-phone3.png"
            alt="Voltra Phone 15"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink border border-white/80 shadow-sm">
              BEST SELLER
            </span>
            <span className="font-display text-xl font-extrabold text-white">${999}</span>
          </div>
          <div className="relative z-10 flex items-end justify-end gap-3 text-right">
            <div>
              <h3 className="font-display text-lg font-extrabold text-white leading-tight">
                Voltra Phone 15
              </h3>
              <p className="text-[11px] font-medium text-slate-200 mt-0.5">
                120Hz ProMotion &amp; Titanium Frame
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900/90 text-white shadow-md transition-transform duration-300 group-hover:scale-110 border border-white/20">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ---------- The Voltra Difference (Tech Feature Matrix) ---------- */
function TechSpecsMatrix() {
  const specs = [
    {
      icon: Cpu,
      title: "Quantum M3 Architecture",
      desc: "Up to 4.2x faster neural processing for real-time AI and graphics rendering.",
      tag: "Next-Gen Chip",
    },
    {
      icon: BatteryCharging,
      title: "100W GaN Ultra-Charge",
      desc: "Go from 0% to 80% charge in just 18 minutes with intelligent thermal dissipation.",
      tag: "Fast Charge",
    },
    {
      icon: Volume2,
      title: "Spatial Audio Engine",
      desc: "Custom 50mm drivers tuned for 360° immersive acoustic spatial resonance.",
      tag: "Lossless Audio",
    },
    {
      icon: ShieldCheck,
      title: "Voltra Titanium Shield",
      desc: "Military-grade aerospace titanium housing with IP68 extreme weather resistance.",
      tag: "Aerospace Build",
    },
  ];

  return (
    <section className="glass mt-8 p-6 md:p-8 rounded-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink">
          The Voltra Engineering Difference
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {specs.map((item) => (
          <div
            key={item.title}
            className="glass-soft p-5 rounded-2xl space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-white/60"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white shadow-md">
                <item.icon size={18} className="text-neon" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-neon/20 text-neon-dark px-2.5 py-0.5 rounded-full">
                {item.tag}
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-ink">{item.title}</h3>
            <p className="text-xs text-ink-soft leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- New Releases & Showcases ---------- */
const SHOWCASE = [
  {
    id: "lumen",
    name: "Lumen Pro VR",
    tag: "Just Dropped",
    color: "from-[#1E3A8A] to-[#94A3B8]",
    img: IMAGES.vr,
  },
  {
    id: "vphone",
    name: "Voltra Phone 15",
    tag: "Pre-order",
    color: "from-[#0EA5E9] to-[#A7F3D0]",
    img: IMAGES.phoneMint,
  },
  {
    id: "skye",
    name: "Skye Drone",
    tag: "New",
    color: "from-[#CBD5E1] to-[#E2E8F0]",
    img: IMAGES.drone,
  },
  {
    id: "ginon",
    name: "Ginon Camera",
    tag: "Limited",
    color: "from-[#0F172A] to-[#475569]",
    img: IMAGES.camera,
  },
];

function NewReleases() {
  const hero = SHOWCASE[0];
  return (
    <section className="glass mt-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">New Releases &amp; Showcases</h2>
        <Link href="/categories/all" className="chip inline-flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-3">
        <Link
          href={`/product/${hero.id}`}
          className="glass-soft relative col-span-12 md:col-span-6 row-span-2 h-[360px] overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${hero.color}`} />
          <img
            src={hero.img}
            alt={hero.name}
            className="absolute inset-0 m-auto h-[80%] w-auto object-contain drop-shadow-2xl"
            loading="lazy"
          />
          <span className="absolute left-4 top-4 chip bg-white/90">{hero.tag}</span>
          <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink">
            <ArrowUpRight size={14} />
          </span>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <div className="font-display text-2xl font-semibold drop-shadow">{hero.name}</div>
            <Sparkles size={18} />
          </div>
        </Link>

        {SHOWCASE.slice(1).map((s) => (
          <Link
            key={s.id}
            href={`/product/${s.id}`}
            className="glass-soft relative col-span-6 md:col-span-3 h-[174px] overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color}`} />
            <img
              src={s.img}
              alt={s.name}
              className="absolute inset-0 m-auto h-[78%] w-auto object-contain drop-shadow-xl"
              loading="lazy"
            />
            <span className="absolute left-3 top-3 chip bg-white/90 text-[10px]">{s.tag}</span>
            <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink">
              <ArrowUpRight size={12} />
            </span>
            <div className="absolute bottom-3 left-3 text-[13px] font-semibold text-white drop-shadow">
              {s.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <>
      <Head>
        <title>Voltra — Next-Gen Consumer Electronics</title>
        <meta
          name="description"
          content="Explore Voltra's curated ecosystem of phones, laptops and audio gear. Design your futuristic lifestyle today."
        />
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6" suppressHydrationWarning>
        <div className="grid grid-cols-12 gap-4">
          <Hero />
        </div>
        <VoltraCategories />
        <TrendingNow />
        <TechSpecsMatrix />
        <NewReleases />
      </div>
    </>
  );
}
