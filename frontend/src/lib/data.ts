const phoneMint = "/assets/products/phone-mint.png";
const phoneBlack = "/assets/products/phone-black.png";
const headphonesNavy = "/assets/products/headphones-navy.png";
const earbudsWhite = "/assets/products/earbuds-white.png";
const earbudsBlack = "/assets/products/earbuds-black.png";
const laptopSilver = "/assets/products/laptop-silver.png";
const tablet = "/assets/products/tablet.png";
const vr = "/assets/products/vr.png";
const speaker = "/assets/products/speaker.png";
const lamp = "/assets/products/lamp.png";
const watch = "/assets/products/watch.png";
const drone = "/assets/products/drone.png";
const controller = "/assets/products/controller.png";
const camera = "/assets/products/camera.png";
const cable = "/assets/products/cable.png";

export const IMAGES = {
  phoneMint, phoneBlack, headphonesNavy, earbudsWhite, earbudsBlack,
  laptopSilver, tablet, vr, speaker, lamp, watch, drone, controller, camera, cable,
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  tag?: string;
  color: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  { id: "sequoia", name: "Sequoia Headphone", category: "Audio", price: 148, rating: 4.7, reviews: 320, tag: "Music is Classic", color: "#2563EB", image: headphonesNavy },
  { id: "xbud", name: "New Gen X-Bud", category: "Audio", price: 86, rating: 4.6, reviews: 210, color: "#E2E8F0", image: earbudsWhite },
  { id: "xbudb", name: "X-Bud Pro", category: "Audio", price: 179, rating: 4.6, reviews: 188, color: "#0F172A", image: earbudsBlack },
  { id: "vmini", name: "Voltra Mini Speaker", category: "Audio", price: 124, rating: 4.5, reviews: 142, color: "#0F172A", image: speaker },
  { id: "lumen", name: "Lumen Pro VR", category: "Smart Home", price: 549, rating: 4.8, reviews: 88, color: "#A8B2C1", image: vr },
  { id: "halo", name: "Halo Smart Lamp", category: "Smart Home", price: 64, rating: 4.4, reviews: 56, color: "#F59E0B", image: lamp },
  { id: "vphone", name: "Voltra Phone 15", category: "Phone", price: 999, rating: 4.9, reviews: 1284, color: "#10B981", image: phoneMint },
  { id: "vphoneb", name: "Voltra Phone X", category: "Phone", price: 1199, rating: 4.8, reviews: 612, color: "#0F172A", image: phoneBlack },
  { id: "vtab", name: "Voltra Tab Air", category: "Tablet", price: 749, rating: 4.7, reviews: 412, color: "#EF4444", image: tablet },
  { id: "vbook", name: "Voltra Book Pro", category: "Laptop", price: 1899, rating: 4.8, reviews: 220, color: "#0F172A", image: laptopSilver },
  { id: "vwatch", name: "Voltra Watch", category: "Wearables", price: 299, rating: 4.7, reviews: 540, color: "#10B981", image: watch },
  { id: "skye", name: "Skye Drone", category: "Drones", price: 899, rating: 4.6, reviews: 96, color: "#94A3B8", image: drone },
  { id: "vpad", name: "Voltra Pad", category: "Gaming", price: 79, rating: 4.5, reviews: 312, color: "#CCFF00", image: controller },
  { id: "ginon", name: "Ginon Mirrorless", category: "Camera", price: 1499, rating: 4.9, reviews: 144, color: "#0F172A", image: camera },
  { id: "vcable", name: "Voltra Braid Cable", category: "Accessories", price: 24, rating: 4.4, reviews: 980, color: "#A7F3D0", image: cable },
];

export const CATEGORIES = [
  { slug: "phone", name: "Phone", count: 42 },
  { slug: "tablet", name: "Tablet", count: 28 },
  { slug: "laptop", name: "Laptop", count: 36 },
  { slug: "audio", name: "Audio", count: 120 },
  { slug: "smart-home", name: "Smart Home", count: 64 },
  { slug: "accessories", name: "Accessories", count: 210 },
  { slug: "drones", name: "Drones", count: 18 },
  { slug: "gaming", name: "Gaming Gears", count: 92 },
];

/* ---------- Generated catalog: 10 products per category (80 total) ---------- */

const PHONE_NAMES = [
  "Voltra Mint 15", "Voltra Onyx X", "Voltra Titan", "Voltra Sky", "Voltra Aurum",
  "Voltra Coral", "Voltra Lumen", "Voltra Forest", "Voltra Pearl", "Voltra Navy Max",
];
const TABLET_NAMES = [
  "Voltra Tab Air", "Voltra Tab Pro", "Voltra Tab Rose", "Voltra Tab Mint", "Voltra Tab Studio",
  "Voltra Tab Sky", "Voltra Tab Graphite", "Voltra Tab Mini", "Voltra Tab Coral", "Voltra Tab Max",
];
const LAPTOP_NAMES = [
  "Voltra Book Air", "Voltra Book Pro", "Voltra Strike RGB", "Voltra Book Rose", "Voltra Book Cloud",
  "Voltra Flex 2-in-1", "Voltra Book Slim", "Voltra Book Aurum", "Voltra Book Mint", "Voltra Book Pro 17",
];
const AUDIO_NAMES = [
  "Sequoia Royal", "X-Bud Snow", "Voltra Mini Boom", "Sequoia Rose", "X-Bud Pro",
  "Voltra Pico Mint", "Sequoia Studio", "Voltra Echo Home", "X-Bud Coral", "Sequoia Cloud",
];
const SMART_HOME_NAMES = [
  "Voltra Echo", "Halo Thermo", "Halo Lamp Warm", "Lumen Cam", "Halo Doorbell",
  "Lumen Pro VR", "Voltra Roomba", "Voltra Hub", "Voltra Purify", "Halo Ambient",
];
const ACCESSORIES_NAMES = [
  "Voltra Braid Cable", "MagPad Wireless", "Voltra Brick 30W", "Voltra Riser", "Voltra Powerbank 20K",
  "Voltra Hub 4-in-1", "Voltra Dock Stand", "Voltra Leather Case", "Voltra Tag", "Voltra Pencil",
];
const DRONES_NAMES = [
  "Skye One", "Skye Mini", "Skye Pro", "Skye FPV", "Skye Combo",
  "Skye Cinema 6", "Skye Junior", "Skye Stealth", "Skye Selfie", "Skye Range",
];
const GAMING_NAMES = [
  "Voltra Pad Onyx", "Voltra Mecha TKL", "Voltra Glide Mouse", "Voltra Pulse Headset", "Voltra Pad Snow",
  "Voltra Handheld", "Voltra Apex Wheel", "Voltra Stick", "Voltra Mic RGB", "Voltra Mat RGB",
];

const COLOR_POOL = ["#10B981", "#0F172A", "#A8B2C1", "#06B6D4", "#F59E0B", "#EC4899", "#A78BFA", "#22C55E", "#F8FAFC", "#1E3A8A"];

function makeCategoryProducts(slug: string, names: string[], categoryLabel: string, basePrice: number, priceStep: number): Product[] {
  return names.map((name, i) => ({
    id: `${slug}-${i + 1}`,
    name,
    category: categoryLabel,
    price: Math.round(basePrice + i * priceStep + (i % 3) * 19),
    rating: Number((4.3 + ((i * 7) % 6) / 10).toFixed(1)),
    reviews: 40 + ((i * 53) % 900),
    color: COLOR_POOL[i % COLOR_POOL.length],
    image: `/products/${slug}/${slug}-${i + 1}.png`,
    tag: i === 0 ? "Bestseller" : i === 3 ? "New" : undefined,
  }));
}

export const CATEGORY_PRODUCTS: Record<string, Product[]> = {
  phone: makeCategoryProducts("phone", PHONE_NAMES, "Phone", 699, 80),
  tablet: makeCategoryProducts("tablet", TABLET_NAMES, "Tablet", 399, 70),
  laptop: makeCategoryProducts("laptop", LAPTOP_NAMES, "Laptop", 1099, 140),
  audio: makeCategoryProducts("audio", AUDIO_NAMES, "Audio", 89, 35),
  "smart-home": makeCategoryProducts("smart-home", SMART_HOME_NAMES, "Smart Home", 79, 40),
  accessories: makeCategoryProducts("accessories", ACCESSORIES_NAMES, "Accessories", 19, 12),
  drones: makeCategoryProducts("drones", DRONES_NAMES, "Drone", 449, 180),
  gaming: makeCategoryProducts("gaming", GAMING_NAMES, "Gaming", 59, 45),
};

export const ALL_CATEGORY_PRODUCTS: Product[] = Object.values(CATEGORY_PRODUCTS).flat();

export function findProduct(id: string): Product | undefined {
  return ALL_CATEGORY_PRODUCTS.find((p) => p.id === id) ?? PRODUCTS.find((p) => p.id === id);
}

/** First-image preview per category slug, for category hub cards. */
export const CATEGORY_PREVIEWS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_PRODUCTS).map(([slug, items]) => [slug, items[0].image]),
);

