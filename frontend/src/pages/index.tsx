import { useState, useEffect } from "react";
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
                    className={`absolute inset-0 rounded-md border transition-all duration-700 ${
                      slotConfig.isApex
                        ? "border-white/80 bg-gradient-to-b from-white/85 via-white/60 to-slate-100/40 shadow-2xl"
                        : "border-white/60 bg-gradient-to-b from-white/55 to-white/15 shadow-lg backdrop-blur-sm"
                    }`}
                  />
                  <div className="absolute inset-x-1 top-2 h-2 rounded-sm bg-white/40" />

                  {/* Product Image */}
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className={`absolute left-1/2 ${slotConfig.imgH} w-auto -translate-x-1/2 object-contain drop-shadow-2xl transition-all duration-700 ${
                      slotConfig.isApex ? "scale-110 drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)]" : ""
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

/* ---------- Voltra Categories ---------- */
const CAT_ICONS_MAP: Record<string, { Icon: any; tint: string }> = {
  phone: { Icon: Smartphone, tint: "from-[#A7F3D0] to-[#60A5FA]" },
  laptop: { Icon: Laptop, tint: "from-[#FDE68A] to-[#86EFAC]" },
  tablet: { Icon: Tablet, tint: "from-[#FBCFE8] to-[#C7D2FE]" },
  audio: { Icon: Headphones, tint: "from-[#E9D5FF] to-[#BFDBFE]" },
  accessories: { Icon: Cable, tint: "from-[#FBCFE8] to-[#FDE68A]" },
  drones: { Icon: Plane, tint: "from-[#BAE6FD] to-[#A7F3D0]" },
};

function VoltraCategories() {
  const { data: dbCategories = [] } = useCategories();
  const categories = dbCategories.length > 0 ? dbCategories : [];

  return (
    <section className="glass mt-6 p-5 rounded-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Explore Voltra Categories</h2>
        <Link href="/categories/all" className="chip inline-flex items-center gap-1 text-xs">
          View All <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c: any) => {
          const config = CAT_ICONS_MAP[c.slug] || { Icon: Headphones, tint: "from-[#BFDBFE] to-[#A7F3D0]" };
          const Icon = config.Icon;

          return (
            <Link
              key={c.id || c.slug}
              href={`/categories/${c.slug}`}
              className="glass-soft group flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md"
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${config.tint} shadow-sm`}
              >
                <Icon size={20} className="text-ink" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-ink block truncate">{c.name}</span>
                <span className="text-[10px] text-ink-muted font-medium">
                  {c._count?.products ?? 0} {c._count?.products === 1 ? "item" : "items"}
                </span>
              </div>
              <ArrowRight
                size={13}
                className="text-ink-soft shrink-0 transition group-hover:translate-x-1 group-hover:text-ink"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Trending Hardware — Modern Cyber-Minimal Bento Showcase ---------- */
function TrendingNow() {
  const laptop = PRODUCTS.find((p) => p.id === "vbook") || PRODUCTS[1];
  const phone = PRODUCTS.find((p) => p.id === "vphone") || PRODUCTS[0];
  const audio = PRODUCTS.find((p) => p.id === "sequoia") || PRODUCTS[2];
  const earbuds = PRODUCTS.find((p) => p.id === "xbudb") || PRODUCTS[3];
  const drone = PRODUCTS.find((p) => p.id === "skye") || PRODUCTS[5];
  const charger = PRODUCTS.find((p) => p.id === "vcable") || PRODUCTS[6];

  return (
    <section className="glass mt-8 p-6 md:p-8 rounded-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink">
            Trending Hardware
          </h2>
        </div>

        <Link href="/categories/all" className="btn-neon px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          Explore All Products <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Modern Bento Showcase Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Flagship Laptop Wide Showcase (7 Cols) */}
        <Link
          href={`/product/${laptop.id}`}
          className="glass-soft group relative col-span-12 lg:col-span-7 flex flex-col justify-between overflow-hidden p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-white/60"
        >
          <div className="flex items-center justify-between z-10">
            <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
              {laptop.tag || "Flagship M3"}
            </span>
            <span className="font-display text-2xl font-extrabold text-ink">
              ${laptop.price}
            </span>
          </div>

          <div className="my-6 grid h-52 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 p-4">
            <img
              src={laptop.image}
              alt={laptop.name}
              className="h-44 w-auto object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between z-10 pt-1 border-t border-ink/5">
            <div>
              <h3 className="font-display text-xl font-bold text-ink group-hover:text-neon-dark transition">
                {laptop.name}
              </h3>
              <p className="text-xs text-ink-soft">Next-Gen M3 Max Processing & Retina XDR Display</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white transition group-hover:bg-neon group-hover:text-ink shadow-md">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </Link>

        {/* Tall Smartphone Card (5 Cols) */}
        <Link
          href={`/product/${phone.id}`}
          className="glass-soft group relative col-span-12 lg:col-span-5 flex flex-col justify-between overflow-hidden p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-white/60"
        >
          <div className="flex items-center justify-between z-10">
            <span className="rounded-full bg-emerald-500/20 text-emerald-800 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
              {phone.tag || "Mint Edition"}
            </span>
            <span className="font-display text-xl font-bold text-ink">
              ${phone.price}
            </span>
          </div>

          <div className="my-4 grid h-52 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-4">
            <img
              src={phone.image}
              alt={phone.name}
              className="h-44 w-auto object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between z-10 pt-1 border-t border-ink/5">
            <div>
              <h3 className="font-display text-lg font-bold text-ink group-hover:text-neon-dark transition">
                {phone.name}
              </h3>
              <p className="text-xs text-ink-soft">120Hz ProMotion & Titanium Frame</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink text-white transition group-hover:bg-neon group-hover:text-ink shadow-md">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>

        {/* Satellite Row Cards */}
        <Link
          href={`/product/${audio.id}`}
          className="glass-soft group relative col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between overflow-hidden p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted bg-white/80 px-2.5 py-0.5 rounded-full">
              {audio.category}
            </span>
            <span className="font-display text-base font-bold text-ink">${audio.price}</span>
          </div>

          <div className="my-3 grid h-36 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-3">
            <img
              src={audio.image}
              alt={audio.name}
              className="h-28 w-auto object-contain drop-shadow-xl transition group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-sm font-bold text-ink truncate pr-2">{audio.name}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-white transition group-hover:bg-neon group-hover:text-ink">
              <ArrowUpRight size={14} />
            </span>
          </div>
        </Link>

        <Link
          href={`/product/${earbuds.id}`}
          className="glass-soft group relative col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between overflow-hidden p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted bg-white/80 px-2.5 py-0.5 rounded-full">
              {earbuds.category}
            </span>
            <span className="font-display text-base font-bold text-ink">${earbuds.price}</span>
          </div>

          <div className="my-3 grid h-36 place-items-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-3">
            <img
              src={earbuds.image}
              alt={earbuds.name}
              className="h-28 w-auto object-contain drop-shadow-xl transition group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-sm font-bold text-ink truncate pr-2">{earbuds.name}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-white transition group-hover:bg-neon group-hover:text-ink">
              <ArrowUpRight size={14} />
            </span>
          </div>
        </Link>

        <Link
          href={`/product/${drone.id}`}
          className="glass-soft group relative col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between overflow-hidden p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted bg-white/80 px-2.5 py-0.5 rounded-full">
              {drone.category}
            </span>
            <span className="font-display text-base font-bold text-ink">${drone.price}</span>
          </div>

          <div className="my-3 grid h-36 place-items-center rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-3">
            <img
              src={drone.image}
              alt={drone.name}
              className="h-28 w-auto object-contain drop-shadow-xl transition group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-sm font-bold text-ink truncate pr-2">{drone.name}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-white transition group-hover:bg-neon group-hover:text-ink">
              <ArrowUpRight size={14} />
            </span>
          </div>
        </Link>

        <Link
          href={`/product/${charger.id}`}
          className="glass-soft group relative col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between overflow-hidden p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted bg-white/80 px-2.5 py-0.5 rounded-full">
              {charger.category}
            </span>
            <span className="font-display text-base font-bold text-ink">${charger.price}</span>
          </div>

          <div className="my-3 grid h-36 place-items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
            <img
              src={charger.image}
              alt={charger.name}
              className="h-28 w-auto object-contain drop-shadow-xl transition group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-sm font-bold text-ink truncate pr-2">{charger.name}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-white transition group-hover:bg-neon group-hover:text-ink">
              <ArrowUpRight size={14} />
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

/* ---------- Voltra Ecosystem Banner ---------- */
function EcosystemBanner() {
  return (
    <section className="glass mt-8 relative overflow-hidden p-8 md:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-ink text-white">
      <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-neon/15 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
            One Unified Hardware &amp; Software Ecosystem.
          </h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            All Voltra devices connect seamlessly with zero latency. Hand off tasks between your Voltra Phone and Voltra Laptop, auto-sync spatial audio, and process payments instantly with the Voltra Platinum Card.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/categories/all"
              className="btn-neon px-6 py-3 text-xs font-extrabold inline-flex items-center gap-2"
            >
              Explore Voltra OS <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-ink">
          <div className="glass p-4 rounded-2xl bg-white/90 space-y-1">
            <div className="text-xs font-bold text-ink">Instant Handoff</div>
            <div className="text-[11px] text-ink-soft">Share clipboard &amp; tasks in 1 tap</div>
          </div>
          <div className="glass p-4 rounded-2xl bg-white/90 space-y-1">
            <div className="text-xs font-bold text-ink">Spatial Audio Sync</div>
            <div className="text-[11px] text-ink-soft">Low-latency acoustic streaming</div>
          </div>
          <div className="glass p-4 rounded-2xl bg-white/90 space-y-1">
            <div className="text-xs font-bold text-ink">Encrypted Voltra Key</div>
            <div className="text-[11px] text-ink-soft">Biometric hardware security</div>
          </div>
          <div className="glass p-4 rounded-2xl bg-white/90 space-y-1">
            <div className="text-xs font-bold text-ink">Global Care Warranty</div>
            <div className="text-[11px] text-ink-soft">24/7 express replacement</div>
          </div>
        </div>
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
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6">
        <div className="grid grid-cols-12 gap-4">
          <Hero />
        </div>
        <VoltraCategories />
        <TrendingNow />
        <TechSpecsMatrix />
        <NewReleases />
        <EcosystemBanner />
      </div>
    </>
  );
}
