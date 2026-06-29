import Head from "next/head";
import Link from "next/link";
import { Smartphone, Tablet, Laptop, Headphones, Home, Cable, Plane, Gamepad2, ChevronRight } from "lucide-react";
import { CATEGORIES, CATEGORY_PREVIEWS } from "@/lib/data";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  phone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  audio: Headphones,
  "smart-home": Home,
  accessories: Cable,
  drones: Plane,
  gaming: Gamepad2,
};

export default function CategoriesHub() {
  return (
    <>
      <Head>
        <title>Categories — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6">
        <div className="glass p-8 md:p-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink">Voltra Categories</h1>
              <p className="mt-1 text-sm text-ink-soft">8 hardware classes • Curated globally</p>
            </div>
            <button className="rounded-full bg-white/70 px-4 py-2 text-sm text-ink">View All</button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {CATEGORIES.map((c) => {
              const Icon = ICONS[c.slug] ?? Headphones;
              const preview = CATEGORY_PREVIEWS[c.slug];
              return (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="glass-soft group relative flex aspect-square flex-col justify-between overflow-hidden p-5 transition hover:scale-[1.03] hover:bg-white/70"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 text-ink">
                    <Icon size={22} strokeWidth={1.4} />
                  </div>
                  {preview && (
                    <img
                      src={preview}
                      alt={c.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="pointer-events-none absolute inset-0 m-auto h-3/5 w-3/5 object-contain opacity-90 drop-shadow-xl transition group-hover:scale-105"
                    />
                  )}
                  <div className="relative flex items-end justify-between">
                    <div>
                      <div className="font-display text-lg font-semibold text-ink">{c.name}</div>
                      <div className="text-xs text-ink-muted">{c.count} items</div>
                    </div>
                    <ChevronRight size={18} className="text-ink-soft transition group-hover:translate-x-1 group-hover:text-ink" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
