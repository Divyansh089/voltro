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
  phoneMint,
  phoneBlack,
  headphonesNavy,
  earbudsWhite,
  earbudsBlack,
  laptopSilver,
  tablet,
  vr,
  speaker,
  lamp,
  watch,
  drone,
  controller,
  camera,
  cable,
};

export const CATEGORY_PREVIEWS: Record<string, string> = {
  laptops: "/category/laptop01.png",
  phones: "/category/phone1.png",
  tablets: "/category/tab01.png",
  drones: "/category/drone01.png",
  audio: "/category/audio01.png",
  accessories: "/category/acc01.png",
};

export type ProductData = {
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

export const PRODUCTS: ProductData[] = [
  {
    id: "vphone",
    name: "Voltra Phone 15",
    category: "Smartphones",
    price: 999,
    rating: 4.9,
    reviews: 412,
    tag: "Best Seller",
    color: "#60A5FA",
    image: phoneMint,
  },
  {
    id: "vbook",
    name: "Voltra Book Pro M3",
    category: "Laptops",
    price: 1899,
    rating: 5.0,
    reviews: 289,
    tag: "Trending #1",
    color: "#94A3B8",
    image: laptopSilver,
  },
  {
    id: "sequoia",
    name: "Sequoia Headphone Pro",
    category: "Audio",
    price: 148,
    rating: 4.8,
    reviews: 320,
    tag: "Hi-Res Audio",
    color: "#1E3A8A",
    image: headphonesNavy,
  },
  {
    id: "xbudb",
    name: "X-Bud Pro Active",
    category: "Audio",
    price: 179,
    rating: 4.7,
    reviews: 188,
    tag: "ANC Tech",
    color: "#0F172A",
    image: earbudsBlack,
  },
  {
    id: "vtab",
    name: "Voltra Tab Air 11",
    category: "Tablets",
    price: 799,
    rating: 4.8,
    reviews: 145,
    tag: "Retina Display",
    color: "#CBD5E1",
    image: tablet,
  },
  {
    id: "skye",
    name: "Voltra Sky Explorer 4K",
    category: "Drones",
    price: 499,
    rating: 4.9,
    reviews: 94,
    tag: "4K Aerial",
    color: "#BAE6FD",
    image: drone,
  },
  {
    id: "vcable",
    name: "Voltra 65W GaN Charger",
    category: "Accessories",
    price: 49,
    rating: 4.8,
    reviews: 512,
    tag: "Fast Charge",
    color: "#10B981",
    image: cable,
  },
];
