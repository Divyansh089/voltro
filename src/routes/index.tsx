import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight, ArrowRight, Star, Heart, Sparkles,
  Smartphone, Laptop, Headphones, Home, Cable, Gamepad2,
} from "lucide-react";
import { PRODUCTS, IMAGES } from "@/lib/data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Voltra — Next-gen consumer electronics" },
      { name: "description", content: "Explore Voltra's curated ecosystem of phones, laptops and audio gear. Design your futuristic lifestyle today." },
    ],
  }),
});

/* ---------- Hero (sample 5 — real product photos on pedestals) ---------- */
function Hero() {
  return (
    <section className="glass relative col-span-12 overflow-hidden p-6 md:p-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#B8F2D8] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#CDE7FF] opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-neon/20 blur-3xl" />

      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <h1 className="font-display text-[64px] font-extrabold leading-[0.95] tracking-tight text-ink md:text-[88px]">
            VOLTRA.<br />NEXT-GEN<br />GADGETS.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Explore our curated ecosystem of cutting-edge phones, laptops, and audio gear.
            Design your futuristic lifestyle today.
          </p>

          <Link
            to="/categories"
            className="btn-neon mt-8 inline-flex items-center gap-3 py-2 pl-6 pr-2 text-sm shadow-[0_10px_30px_-10px_rgba(204,255,0,0.7)]"
          >
            Explore Collections
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
              <ArrowRight size={16} strokeWidth={2} />
            </span>
          </Link>
        </div>

        {/* RIGHT — pedestal collage with real images */}
        <div className="relative h-[480px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 480" fill="none" aria-hidden>
            <path d="M40 380 C 120 120, 380 80, 470 300" stroke="#CCFF00" strokeWidth="2" opacity="0.7" />
          </svg>
          <span className="absolute right-2 top-24 h-8 w-8 rounded-full bg-white/70 shadow-lg ring-1 ring-white" />
          <span className="absolute left-6 top-6 h-4 w-4 rounded-full bg-white/80 ring-1 ring-white" />
          <span className="absolute bottom-10 right-24 h-3 w-3 rounded-full bg-white/80 ring-1 ring-white" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-3 px-2">
            <Pedestal h="h-40" w="w-24" tilt="-rotate-3" img={IMAGES.vr} imgH="h-28" label="VR Headset" />
            <Pedestal h="h-56" w="w-28" tilt="rotate-1" img={IMAGES.phoneBlack} imgH="h-32" label="Phones" />
            <Pedestal
              h="h-72" w="w-36" tilt="-rotate-1" img={IMAGES.headphonesNavy} imgH="h-40"
              richChip={{ title: "Sequoia\nHeadphone", stars: true }}
            />
            <Pedestal h="h-60" w="w-28" tilt="rotate-2" img={IMAGES.laptopSilver} imgH="h-24" label="New Release" />
            <Pedestal h="h-44" w="w-24" tilt="-rotate-2" img={IMAGES.speaker} imgH="h-24" label="Smart Speaker" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pedestal({
  h, w, tilt, img, imgH, label, richChip,
}: {
  h: string; w: string; tilt: string;
  img: string; imgH: string;
  label?: string;
  richChip?: { title: string; stars?: boolean };
}) {
  return (
    <div className={`relative ${h} ${w} ${tilt}`}>
      <div className="absolute inset-0 rounded-md border border-white/70 bg-gradient-to-b from-white/55 to-white/15 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)] backdrop-blur-sm" />
      <div className="absolute inset-x-1 top-2 h-3 rounded-sm bg-white/40" />

      <img
        src={img}
        alt=""
        className={`absolute left-1/2 ${imgH} w-auto -translate-x-1/2 object-contain drop-shadow-xl`}
        style={{ bottom: "calc(100% - 20px)" }}
      />

      {label && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium text-ink shadow-md ring-1 ring-white">
          {label}
        </span>
      )}
      {richChip && (
        <span className="absolute right-0 top-2 translate-x-[110%] rounded-2xl bg-white/90 px-3 py-2 text-left text-[11px] font-semibold text-ink shadow-md ring-1 ring-white">
          {richChip.title.split("\n").map((l, i) => <div key={i}>{l}</div>)}
          {richChip.stars && (
            <div className="mt-0.5 flex gap-0.5 text-amber-400">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={9} className="fill-amber-400" />)}
            </div>
          )}
        </span>
      )}
    </div>
  );
}

/* ---------- Voltra Categories ---------- */
const CAT_ICONS = [
  { slug: "phone", name: "Phones", Icon: Smartphone, tint: "from-[#A7F3D0] to-[#60A5FA]" },
  { slug: "laptop", name: "Laptops", Icon: Laptop, tint: "from-[#FDE68A] to-[#86EFAC]" },
  { slug: "audio", name: "Audio", Icon: Headphones, tint: "from-[#E9D5FF] to-[#BFDBFE]" },
  { slug: "smart-home", name: "Smart Home", Icon: Home, tint: "from-[#BAE6FD] to-[#A7F3D0]" },
  { slug: "accessories", name: "Accessories", Icon: Cable, tint: "from-[#FBCFE8] to-[#FDE68A]" },
  { slug: "gaming", name: "Gaming Gears", Icon: Gamepad2, tint: "from-[#C7D2FE] to-[#A5F3FC]" },
];

function VoltraCategories() {
  return (
    <section className="glass mt-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Voltra Categories</h2>
        <Link to="/categories" className="chip inline-flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CAT_ICONS.map(({ slug, name, Icon, tint }) => (
          <Link
            key={slug}
            to="/categories/$category"
            params={{ category: slug }}
            className="glass-soft group relative flex flex-col items-start gap-4 p-4 transition hover:scale-[1.02]"
          >
            <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${tint}`}>
              <Icon size={28} className="text-ink" strokeWidth={1.6} />
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-ink">{name}</span>
              <ArrowRight size={14} className="text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Trending Now — collage of product photos ---------- */
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
const TRENDING_IDS = ["vphone", "vbook", "xbud", "xbudb", "vwatch", "vmini", "vcable"];

function TrendingNow() {
  const items = TRENDING_IDS.map(byId);
  return (
    <section className="glass mt-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Trending Now</h2>
        <Link to="/categories" className="chip inline-flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-3">
        {/* tall phone */}
        <ProductTile className="col-span-6 sm:col-span-4 lg:col-span-2 row-span-2 h-full" product={items[0]} tall />
        {/* wide laptop */}
        <ProductTile className="col-span-12 sm:col-span-8 lg:col-span-5 row-span-1" product={items[1]} wide />
        {/* x-bud */}
        <ProductTile className="col-span-6 sm:col-span-4 lg:col-span-2" product={items[2]} />
        {/* popular colors */}
        <div className="glass-soft col-span-6 sm:col-span-4 lg:col-span-3 row-span-2 p-4">
          <div className="text-[13px] font-semibold text-ink">Popular Colors</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"].map((c) => (
              <span key={c} className="h-7 w-7 rounded-full ring-2 ring-white" style={{ background: c }} />
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white/60 p-3">
            <div className="text-[12px] font-semibold text-ink">New Gen<br />X-Bud</div>
            <div className="mt-2 grid h-24 place-items-center rounded-xl bg-gradient-to-br from-white to-[#E2E8F0]">
              <img src={IMAGES.earbudsWhite} alt="" className="h-20 w-auto object-contain" loading="lazy" />
            </div>
          </div>
        </div>

        <ProductTile className="col-span-6 sm:col-span-4 lg:col-span-3" product={items[3]} />
        <ProductTile className="col-span-6 sm:col-span-4 lg:col-span-2" product={items[4]} />
        <ProductTile className="col-span-6 sm:col-span-4 lg:col-span-2" product={items[5]} />
        <ProductTile className="col-span-12 sm:col-span-4 lg:col-span-3" product={items[6]} wide />
      </div>
    </section>
  );
}

function ProductTile({
  product, className = "", wide = false, tall = false,
}: { product: ReturnType<typeof byId>; className?: string; wide?: boolean; tall?: boolean }) {
  const mediaH = tall ? "h-full min-h-[220px]" : wide ? "h-32" : "h-28";
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className={`glass-soft group relative flex flex-col overflow-hidden p-3 transition hover:scale-[1.01] ${className}`}
    >
      <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink shadow-sm">
        <Heart size={10} className="fill-rose-500 text-rose-500" /> Popular
      </span>
      <div
        className={`mt-7 flex-1 grid place-items-center overflow-hidden rounded-2xl ${mediaH}`}
        style={{
          background: `linear-gradient(135deg, ${product.color}40, ${product.color}10)`,
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-[88%] w-auto object-contain transition group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">{product.name}</span>
        <span className="text-[13px] font-semibold text-ink">${product.price}</span>
      </div>
    </Link>
  );
}

/* ---------- New Releases & Showcases ---------- */
const SHOWCASE = [
  { id: "lumen", name: "Lumen Pro VR", tag: "Just Dropped", color: "from-[#1E3A8A] to-[#94A3B8]", img: IMAGES.vr },
  { id: "vphone", name: "Voltra Phone 15", tag: "Pre-order", color: "from-[#0EA5E9] to-[#A7F3D0]", img: IMAGES.phoneMint },
  { id: "skye", name: "Skye Drone", tag: "New", color: "from-[#CBD5E1] to-[#E2E8F0]", img: IMAGES.drone },
  { id: "ginon", name: "Ginon Camera", tag: "Limited", color: "from-[#0F172A] to-[#475569]", img: IMAGES.camera },
];

function NewReleases() {
  const hero = SHOWCASE[0];
  return (
    <section className="glass mt-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">New Releases &amp; Showcases</h2>
        <Link to="/categories" className="chip inline-flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-3">
        <Link
          to="/product/$id" params={{ id: hero.id }}
          className="glass-soft relative col-span-12 md:col-span-6 row-span-2 h-[360px] overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${hero.color}`} />
          <img src={hero.img} alt={hero.name} className="absolute inset-0 m-auto h-[80%] w-auto object-contain drop-shadow-2xl" loading="lazy" />
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
            key={s.id} to="/product/$id" params={{ id: s.id }}
            className="glass-soft relative col-span-6 md:col-span-3 h-[174px] overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color}`} />
            <img src={s.img} alt={s.name} className="absolute inset-0 m-auto h-[78%] w-auto object-contain drop-shadow-xl" loading="lazy" />
            <span className="absolute left-3 top-3 chip bg-white/90 text-[10px]">{s.tag}</span>
            <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink">
              <ArrowUpRight size={12} />
            </span>
            <div className="absolute bottom-3 left-3 text-[13px] font-semibold text-white drop-shadow">{s.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- User Reviews ---------- */
const REVIEWS = [
  { name: "Ryman Man", rating: 4.6, text: "Build quality is unreal — the headphones feel like jewelry." },
  { name: "Asman Ashan", rating: 4.7, text: "The Voltra Phone battery life genuinely changed my routine." },
  { name: "Rymar Ashan", rating: 4.6, text: "Bento layout, fast checkout, premium packaging. 10/10." },
  { name: "Acm Mayca", rating: 4.7, text: "Speaker fills the whole apartment with crisp lows." },
  { name: "Aomn Ashan", rating: 4.6, text: "VR setup took two minutes. Instantly immersive." },
  { name: "Alale Ooka", rating: 4.7, text: "Tab Air is the perfect travel companion for designers." },
];

function Reviews() {
  return (
    <section className="glass mt-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">User Reviews &amp; Ratings</h2>
        <a className="chip inline-flex items-center gap-1" href="#">View all <ArrowUpRight size={12} /></a>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r) => (
          <div key={r.name} className="glass-soft p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xs font-semibold text-white">
                  {r.name[0]}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-ink">{r.name}</div>
                  <div className="text-[10px] text-ink-muted">1 mins ago</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-ink">
                <Star size={11} className="fill-amber-400 text-amber-400" /> {r.rating}
              </div>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
function Index() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-6">
      <div className="grid grid-cols-12 gap-4">
        <Hero />
      </div>
      <VoltraCategories />
      <TrendingNow />
      <NewReleases />
      <Reviews />
    </div>
  );
}
