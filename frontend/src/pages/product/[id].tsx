import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import {
  ShoppingCart,
  Zap,
  Heart,
  Star,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Pencil,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/store/cart.store";
import { useWishlist } from "@/store/wishlist.store";
import { useAuth } from "@/providers/AuthProvider";
import { useProductDetail } from "@/modules/products/hooks/useProducts";
import { CATEGORY_PREVIEWS } from "@/lib/data";
import api from "@/lib/api";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  return {
    props: {
      productId: id || null,
    },
  };
};

const getColorSwatch = (name: string) => {
  if (!name) return "linear-gradient(135deg, #CBD5E1, #94A3B8)";
  const lower = name.toLowerCase().trim();

  const knownMap: Record<string, string> = {
    rose: "linear-gradient(135deg, #F4A460, #FFC0CB, #E8A7A1)",
    silver: "linear-gradient(135deg, #E2E8F0, #F8FAFC, #94A3B8)",
    emerald: "#059669",
    "phantom black": "#09090B",
    black: "#09090B",
    "space gray": "linear-gradient(135deg, #475569, #1E293B)",
    "space grey": "linear-gradient(135deg, #475569, #1E293B)",
    midnight: "#0F172A",
    starlight: "linear-gradient(135deg, #FAF5FF, #FEF08A, #FEF3C7)",
    gold: "linear-gradient(135deg, #FCD34D, #F59E0B, #B45309)",
    purple: "#7E22CE",
    "deep purple": "#581C87",
    titanium: "linear-gradient(135deg, #94A3B8, #475569)",
    "natural titanium": "linear-gradient(135deg, #CBD5E1, #94A3B8)",
    "desert titanium": "linear-gradient(135deg, #E2E8F0, #D97706)",
    red: "#EF4444",
    blue: "#3B82F6",
    "sierra blue": "#60A5FA",
    green: "#22C55E",
    white: "#FFFFFF",
    yellow: "#FACC15",
    pink: "#EC4899",
    orange: "#F97316",
  };

  for (const [k, v] of Object.entries(knownMap)) {
    if (lower.includes(k)) return v;
  }

  if (/^#([0-9a-f]{3}){1,2}$/i.test(name)) return name;
  return "linear-gradient(135deg, #CBD5E1, #64748B)";
};

function FormattedDescription({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="space-y-1.5 my-2.5 pl-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`list-${idx}`);
      return;
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      flushList(`list-${idx}`);
      const headingText = trimmed.replace(/^#+\s*/, "");
      elements.push(
        <h4 key={`h-${idx}`} className="font-display text-sm md:text-base font-bold text-ink mt-5 mb-2 uppercase tracking-wide">
          {parseInlineBold(headingText)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("* ") || trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      const itemText = trimmed.replace(/^[\*\•\-]\s*/, "");
      currentList.push(
        <li key={`item-${idx}`} className="flex items-start gap-2 text-sm text-ink-soft">
          <span className="text-neon-dark font-extrabold shrink-0 mt-0.5">•</span>
          <span>{parseInlineBold(itemText)}</span>
        </li>
      );
      return;
    }

    flushList(`list-${idx}`);
    elements.push(
      <p key={`p-${idx}`} className="text-sm leading-relaxed text-ink-soft my-1.5">
        {parseInlineBold(trimmed)}
      </p>
    );
  });

  flushList(`list-final`);

  return <div className="space-y-1">{elements}</div>;
}

export default function ProductDetailPage({ productId: serverProductId }: { productId: string }) {
  const router = useRouter();
  const id = (router.query.id as string) || serverProductId;

  const { data: product, isLoading, isError } = useProductDetail(id);
  const { user } = useAuth();

  const cart = useCart();
  const wish = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // Reviews State loaded dynamically from PostgreSQL Database
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch real product-specific reviews from PostgreSQL database
  const fetchProductReviews = async (prodId: string) => {
    if (!prodId) return;
    setIsLoadingReviews(true);
    try {
      const res: any = await api.get(`/reviews/product/${prodId}`);
      const payload = res.data?.data || res.data;
      const fetched = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.reviews)
        ? payload.reviews
        : [];

      if (Array.isArray(fetched)) {
        const formatted = fetched.map((r: any) => {
          const uProfile = r.user?.customerProfile || r.user?.staffProfile;
          const uName =
            `${uProfile?.firstName || ""} ${uProfile?.lastName || ""}`.trim() ||
            r.user?.email?.split("@")[0] ||
            "Verified Buyer";
          return {
            id: r.id,
            userId: r.userId || r.user?.id,
            author: uName,
            avatarUrl: r.user?.avatarUrl || null,
            rating: r.rating,
            date: new Date(r.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            verified: r.isVerifiedPurchase ?? true,
            title: r.title || "Verified Review",
            content: r.comment || "",
          };
        });
        setReviewsList(formatted);
      } else {
        setReviewsList([]);
      }
    } catch (err) {
      console.warn("Failed to fetch product reviews:", err);
      setReviewsList([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    const targetId = product?.id || id;
    if (targetId) {
      fetchProductReviews(targetId);
    }
  }, [id, product?.id]);

  // Auto fill logged in user name
  useEffect(() => {
    if (user) {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];
      setAuthorName(name);
    }
  }, [user]);

  const liked = product ? wish.has(product.id) : false;

  // Option Groups parsing
  const optionGroups = useMemo(() => {
    if (!product) return [];

    if (product.options && product.options.length > 0) {
      return product.options.map((opt: any) => ({
        name: opt.name || "Option",
        values: (opt.values || []).map((v: any) => v.value || v),
      }));
    }

    if (product.variants && product.variants.length > 0) {
      const groupsMap: Record<string, Set<string>> = {};

      product.variants.forEach((v: any) => {
        if (v.options && Array.isArray(v.options) && v.options.length > 0) {
          v.options.forEach((o: any) => {
            const key = o.optionName || "Option";
            if (!groupsMap[key]) groupsMap[key] = new Set();
            groupsMap[key].add(o.value);
          });
        } else if (v.name) {
          const parts = v.name.split("/").map((s: string) => s.trim());
          if (parts.length === 1) {
            const key = "Configuration";
            if (!groupsMap[key]) groupsMap[key] = new Set();
            groupsMap[key].add(parts[0]);
          } else {
            parts.forEach((part: string, idx: number) => {
              let key = "Option";
              if (idx === 0) key = "Color";
              else if (idx === 1) key = "RAM";
              else if (idx === 2) key = "Storage";
              else key = `Specification ${idx + 1}`;

              if (!groupsMap[key]) groupsMap[key] = new Set();
              groupsMap[key].add(part);
            });
          }
        }
      });

      return Object.entries(groupsMap).map(([name, valuesSet]) => ({
        name,
        values: Array.from(valuesSet),
      }));
    }

    return [];
  }, [product]);

  // Selections state
  const [selectedSelections, setSelectedSelections] = useState<Record<string, string>>({});

  const handleSelectOption = (groupName: string, val: string) => {
    setSelectedSelections((prev) => ({
      ...prev,
      [groupName]: val,
    }));
  };

  const isAllOptionsSelected = useMemo(() => {
    if (optionGroups.length === 0) return true;
    return optionGroups.every((g: any) => !!selectedSelections[g.name]);
  }, [optionGroups, selectedSelections]);

  const basePrice = useMemo(() => {
    if (product?.basePrice) return Number(product.basePrice);
    if (product?.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => Number(v.price));
      return Math.min(...prices);
    }
    return 0;
  }, [product]);

  const activeVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    if (product.variants.length === 1 && optionGroups.length === 0) {
      return product.variants[0];
    }

    if (!isAllOptionsSelected) return null;

    const selectedValuesList = Object.values(selectedSelections);

    const matched = product.variants.find((v: any) => {
      if (v.options && Array.isArray(v.options) && v.options.length > 0) {
        return v.options.every((o: any) => selectedSelections[o.optionName] === o.value);
      }
      if (v.name) {
        const parts = v.name.split("/").map((s: string) => s.trim().toLowerCase());
        return selectedValuesList.every((val: string) => parts.includes(val.toLowerCase()));
      }
      return false;
    });

    return matched || null;
  }, [product, optionGroups, selectedSelections, isAllOptionsSelected]);

  const hasValidVariant = !!activeVariant || (optionGroups.length === 0 && !!product?.variants?.[0]);

  const itemizedBreakdown = useMemo(() => {
    if (!product || !optionGroups) return [];
    const list: { groupName: string; valueName: string; delta: number; formattedDelta: string }[] = [];

    optionGroups.forEach((group: any) => {
      const selectedVal = selectedSelections[group.name];
      if (!selectedVal) return;

      let delta = 0;
      let foundDelta = false;

      if (activeVariant?.options) {
        const opt = activeVariant.options.find(
          (o: any) => o.optionName?.toLowerCase() === group.name.toLowerCase() && o.value?.toLowerCase() === selectedVal.toLowerCase()
        );
        if (opt && opt.priceDelta !== undefined) {
          delta = Number(opt.priceDelta);
          foundDelta = true;
        }
      }

      if (!foundDelta && product.options) {
        const optObj = product.options.find((o: any) => o.name?.toLowerCase() === group.name.toLowerCase());
        if (optObj) {
          const valObj = optObj.values?.find((v: any) => v.value?.toLowerCase() === selectedVal.toLowerCase());
          if (valObj && valObj.priceDelta !== undefined) {
            delta = Number(valObj.priceDelta);
            foundDelta = true;
          }
        }
      }

      let formattedDelta = "Included";
      if (delta > 0) {
        formattedDelta = `+$${delta.toFixed(2)}`;
      } else if (delta < 0) {
        formattedDelta = `-$${Math.abs(delta).toFixed(2)}`;
      }

      list.push({
        groupName: group.name,
        valueName: selectedVal,
        delta,
        formattedDelta,
      });
    });

    return list;
  }, [product, optionGroups, selectedSelections, activeVariant]);

  const sumOfOptionDeltas = useMemo(() => {
    return itemizedBreakdown.reduce((acc, item) => acc + (item.delta || 0), 0);
  }, [itemizedBreakdown]);

  const currentPrice = useMemo(() => {
    if (activeVariant) return Number(activeVariant.price);
    return basePrice + sumOfOptionDeltas;
  }, [activeVariant, basePrice, sumOfOptionDeltas]);

  const deltaPrice = Math.max(0, currentPrice - basePrice);

  const selectedSpecsText = useMemo(() => {
    const vals = Object.values(selectedSelections);
    return vals.length > 0 ? vals.join(" / ") : "Select options";
  }, [selectedSelections]);

  const stockAvailable = activeVariant?.inventory?.quantity ?? (activeVariant ? 15 : 0);
  const isOutOfStock = !hasValidVariant || stockAvailable <= 0;

  const getOptionPriceTag = (groupName: string, val: string) => {
    if (!product) return null;

    // 1. Look up in product.options for exact priceDelta
    const optObj = product.options?.find((o: any) => o.name?.toLowerCase() === groupName.toLowerCase());
    if (optObj) {
      const valObj = optObj.values?.find((v: any) => v.value?.toLowerCase() === val.toLowerCase());
      if (valObj && valObj.priceDelta !== undefined) {
        const delta = Number(valObj.priceDelta);
        if (delta > 0) return `+$${delta.toFixed(0)}`;
        if (delta === 0) return null;
      }
    }

    // 2. Check active variant's options
    if (activeVariant?.options) {
      const matchedOpt = activeVariant.options.find(
        (o: any) => o.optionName?.toLowerCase() === groupName.toLowerCase() && o.value?.toLowerCase() === val.toLowerCase()
      );
      if (matchedOpt && matchedOpt.priceDelta !== undefined) {
        const delta = Number(matchedOpt.priceDelta);
        if (delta > 0) return `+$${delta.toFixed(0)}`;
        if (delta === 0) return null;
      }
    }

    // Fallback: calculate baseline relative price
    const matching = (product.variants || []).filter((v: any) => {
      if (v.options && Array.isArray(v.options)) {
        return v.options.some((o: any) => o.value?.toLowerCase() === val.toLowerCase());
      }
      if (v.name) {
        const parts = v.name.split("/").map((s: string) => s.trim().toLowerCase());
        return parts.includes(val.toLowerCase());
      }
      return false;
    });

    if (matching.length === 0) return null;

    const minPrice = Math.min(...matching.map((v: any) => Number(v.price)));
    const diff = minPrice - basePrice;

    if (diff > 0) return `+$${diff.toFixed(0)}`;
    return null;
  };

  const images = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images.map((img: any) => img.url || img.imageUrl);
    }
    const catSlug = product.category?.slug || "laptop";
    return [CATEGORY_PREVIEWS[catSlug] || "/placeholder.png"];
  }, [product]);

  const activeImage = images[selectedImageIndex] || images[0] || "/placeholder.png";

  // Calculated average rating from PostgreSQL DB reviews
  const avgRating = useMemo(() => {
    if (reviewsList.length === 0) return Number(product?.averageRating || 5.0);
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviewsList.length).toFixed(1));
  }, [reviewsList, product]);

  const handleAddToCart = () => {
    if (!hasValidVariant || isOutOfStock) return;

    cart.add({
      id: product.id,
      name: `${product.name} (${selectedSpecsText})`,
      price: currentPrice,
      image: activeImage,
      variantId: activeVariant?.id,
    } as any);

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (!hasValidVariant || isOutOfStock) return;

    const buyNowPayload = {
      id: product.id,
      name: `${product.name} (${selectedSpecsText})`,
      price: currentPrice,
      image: activeImage,
      variantId: activeVariant?.id || product.id,
      qty: 1,
    };

    sessionStorage.setItem("voltra_buy_now_item", JSON.stringify(buyNowPayload));
    router.push("/customer/checkout?buyNow=true");
  };

  // Detect if current logged-in user already has a review on this product
  const myExistingReview = useMemo(() => {
    if (!user?.id) return null;
    return reviewsList.find((r: any) => r.userId === user.id) || null;
  }, [reviewsList, user?.id]);

  const isEditMode = !!myExistingReview;

  // Pre-fill form when switching to edit mode
  const handleOpenReviewForm = () => {
    if (isEditMode && myExistingReview) {
      setNewRating(myExistingReview.rating);
      setNewTitle(myExistingReview.title || "");
      setNewContent(myExistingReview.content || "");
    } else {
      setNewRating(5);
      setNewTitle("");
      setNewContent("");
    }
    setShowReviewForm(!showReviewForm);
  };

  // Post or Update review in PostgreSQL DB & reload reviews
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !authorName || isSubmittingReview) return;

    setIsSubmittingReview(true);

    try {
      if (isEditMode && myExistingReview) {
        await api.patch(`/reviews/${myExistingReview.id}`, {
          rating: newRating,
          title: newTitle,
          comment: newContent,
        });
      } else {
        await api.post("/reviews", {
          productId: product.id,
          rating: newRating,
          title: newTitle,
          comment: newContent,
        });
      }
      await fetchProductReviews(product.id);
      setNewTitle("");
      setNewContent("");
      setShowReviewForm(false);
    } catch (err: any) {
      console.warn("Review submit error:", err?.response?.data?.message || err);
      if (!isEditMode) {
        const newRevLocal = {
          id: `rev-${Date.now()}`,
          userId: user?.id,
          author: authorName,
          avatarUrl: user?.avatarUrl || null,
          rating: newRating,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          verified: true,
          title: newTitle,
          content: newContent,
        };
        setReviewsList([newRevLocal, ...reviewsList]);
      }
      setNewTitle("");
      setNewContent("");
      setShowReviewForm(false);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1400px] items-center justify-center px-4 py-20 text-ink-soft">
        <div className="flex items-center gap-3 font-semibold">
          <Loader2 size={24} className="animate-spin text-neon-dark" /> Loading product details...
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 text-center">
        <AlertCircle size={48} className="mx-auto mb-3 text-rose-500" />
        <h1 className="font-display text-2xl font-bold text-ink">Product Not Found</h1>
        <p className="mt-1 text-sm text-ink-soft">The product requested does not exist or was removed.</p>
        <Link href="/" className="btn-neon mt-6 inline-flex px-6 py-2.5 text-sm font-semibold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const categoryName = product.category?.name || "Hardware";
  const categorySlug = product.category?.slug || "all";

  return (
    <>
      <Head>
        <title>{`${product.name} — Voltra`}</title>
        <meta name="description" content={product.description} />
      </Head>

      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={18} className="text-[#CCFF00]" />
          <span className="text-xs font-bold">Item added to your cart!</span>
          <Link href="/customer/cart" className="ml-2 underline text-xs font-extrabold text-[#CCFF00]">
            View Cart
          </Link>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-20">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink-soft">
          <Link href="/" className="hover:text-ink transition">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href={`/categories/${categorySlug}`} className="hover:text-ink transition">
            {categoryName}
          </Link>
          <ChevronRight size={12} />
          <span className="text-ink truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Gallery Column */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="glass relative flex h-[460px] items-center justify-center overflow-hidden p-6 rounded-3xl">
              <button
                onClick={() => wish.toggle(product.id)}
                className={`absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md shadow-md transition ${
                  liked ? "text-rose-500" : "text-ink hover:text-rose-500"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
              </button>

              <img
                src={activeImage}
                alt={product.name}
                className="h-80 w-80 object-contain drop-shadow-2xl transition-all duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 transition ${
                      selectedImageIndex === idx
                        ? "border-neon bg-white shadow-md"
                        : "border-transparent bg-white/60 hover:bg-white"
                    }`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${idx}`} className="h-14 w-14 object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Overview & Specs */}
            <div className="glass p-6 md:p-8 rounded-3xl space-y-4">
              <FormattedDescription text={product.description} />

              {product.specifications && product.specifications.length > 0 && (
                <div className="mt-6 border-t border-ink/5 pt-4">
                  <h4 className="font-display text-base font-bold text-ink mb-3">Technical Specifications</h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    {product.specifications.map((spec: any, i: number) => (
                      <div key={i} className="flex justify-between py-1 border-b border-ink/5">
                        <dt className="text-ink-soft font-medium">{spec.key}</dt>
                        <dd className="font-bold text-ink">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Configurator Sidebar */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="glass p-6 md:p-8 rounded-3xl space-y-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-neon/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-neon-dark">
                    {product.brand || "Voltra"}
                  </span>

                  <a href="#reviews-section" className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)}</span>
                    <span className="text-ink-muted">({reviewsList.length} reviews)</span>
                  </a>
                </div>

                <h1 className="mt-3 font-display text-2xl md:text-3xl font-bold text-ink">
                  {product.name}
                </h1>
              </div>

              {/* Options */}
              {optionGroups.length > 0 && (
                <div className="space-y-5 border-t border-ink/5 pt-4">
                  {optionGroups.map((group: any) => {
                    const currentSelectedVal = selectedSelections[group.name];
                    const isColorGroup = /color|finish|hue|tone/i.test(group.name);

                    return (
                      <div key={group.name} className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-ink uppercase tracking-wider">
                            Choose {group.name}
                          </span>
                          {currentSelectedVal && (
                            <span className="font-semibold text-neon-dark text-[11px]">
                              {currentSelectedVal}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {group.values.map((val: any) => {
                            const isSelected = currentSelectedVal === val;
                            const colorSwatch = isColorGroup ? getColorSwatch(val) : null;
                            const priceTag = getOptionPriceTag(group.name, val);

                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectOption(group.name, val)}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 ${
                                  isSelected
                                    ? "border-neon bg-neon/15 ring-2 ring-neon/40 shadow-md font-bold text-ink scale-[1.02]"
                                    : "border-ink/10 bg-white/60 text-ink-soft hover:border-ink/30 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isColorGroup && (
                                    <span
                                      className="h-4 w-4 rounded-full border border-black/20 shadow-sm shrink-0"
                                      style={{ background: colorSwatch || undefined }}
                                    />
                                  )}
                                  <span className="text-xs font-semibold text-ink">{val}</span>
                                </div>

                                {priceTag && (
                                  <span className="mt-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    {priceTag}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price & Stock Section */}
              <div className="space-y-2 border-y border-ink/5 py-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-ink-muted block uppercase tracking-wider font-extrabold">
                      Base Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-extrabold text-ink">
                        ${basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    {!isAllOptionsSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-700">
                        Select options above
                      </span>
                    ) : !hasValidVariant ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-600 border border-rose-200">
                        <XCircle size={14} /> Not Available
                      </span>
                    ) : isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
                        <AlertCircle size={14} /> Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-extrabold text-emerald-700">
                        <CheckCircle2 size={14} /> {stockAvailable} available
                      </span>
                    )}
                  </div>
                </div>

                {isAllOptionsSelected && (
                  <div className="mt-4 rounded-2xl bg-white/80 p-4 border border-ink/10 space-y-2 text-xs shadow-sm">
                    <div className="flex justify-between items-center text-ink-soft font-medium pb-1">
                      <span>Base price</span>
                      <span className="font-mono font-bold text-ink">${basePrice.toFixed(2)}</span>
                    </div>

                    {itemizedBreakdown.map((item) => (
                      <div key={item.groupName} className="flex justify-between items-center text-ink-soft font-medium">
                        <span>{item.groupName}: {item.valueName}</span>
                        <span className={item.delta > 0 ? "font-mono font-bold text-emerald-700" : "font-mono font-medium text-ink-soft"}>
                          {item.formattedDelta}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-ink/15 pt-2.5 flex justify-between items-center text-ink">
                      <span className="font-extrabold text-xs text-ink uppercase tracking-wider">Total Price</span>
                      <span className="font-display text-xl font-extrabold text-ink">
                        ${currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={!isAllOptionsSelected || !hasValidVariant || isOutOfStock}
                  onClick={handleAddToCart}
                  className="btn-neon w-full py-3.5 text-xs font-extrabold shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40 transition hover:scale-[1.01]"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>

                <button
                  type="button"
                  disabled={!isAllOptionsSelected || !hasValidVariant || isOutOfStock}
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-2xl bg-ink text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 hover:bg-slate-800 transition disabled:opacity-40 hover:scale-[1.01]"
                >
                  <Zap size={16} className="text-neon" /> Buy Now
                </button>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-3 gap-2 border-t border-ink/5 pt-4 text-center text-[11px] text-ink-soft">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/40">
                  <Truck size={18} className="text-ink" />
                  <span className="font-semibold text-ink">Free Shipping</span>
                  <span>Express Global</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/40">
                  <ShieldCheck size={18} className="text-ink" />
                  <span className="font-semibold text-ink">2-Year Voltra</span>
                  <span>Official Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/40">
                  <RotateCcw size={18} className="text-ink" />
                  <span className="font-semibold text-ink">30-Day Returns</span>
                  <span>Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REAL POSTGRESQL CUSTOMER REVIEWS & RATINGS SECTION */}
        <div id="reviews-section" className="mt-16 glass p-6 md:p-10 rounded-3xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-ink">Customer Reviews</h3>
              <p className="text-xs text-ink-soft mt-1">Real ratings and reviews from verified Voltra buyers</p>
            </div>

            <button
              onClick={handleOpenReviewForm}
              className="btn-neon px-5 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              {isEditMode ? (
                <><Pencil size={15} /> Edit Your Review</>
              ) : (
                <><Plus size={15} /> Write a Review</>
              )}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleAddReview} className="rounded-2xl bg-white/80 p-6 border border-neon/40 shadow-xl space-y-4 animate-fadeIn">
              <h4 className="font-display text-base font-bold text-ink">
                {isEditMode ? "Update Your Review" : "Submit Your Product Review"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-10 w-full rounded-xl border border-ink/10 bg-white px-3 text-xs text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1">Rating</label>
                  <div className="flex items-center gap-1.5 h-10 px-2">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                      const isActive = starIdx <= (hoverRating || newRating);
                      return (
                        <button
                          key={starIdx}
                          type="button"
                          onClick={() => setNewRating(starIdx)}
                          onMouseEnter={() => setHoverRating(starIdx)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-all duration-200 hover:scale-125 focus:outline-none"
                        >
                          <Star
                            size={22}
                            className={`transition-all duration-200 ${
                              isActive
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                                : "text-slate-300 fill-transparent hover:text-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-extrabold text-ink">
                      {hoverRating || newRating} / 5 Stars
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1">Review Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Exceptional performance and battery life"
                  className="h-10 w-full rounded-xl border border-ink/10 bg-white px-3 text-xs text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1">Detailed Review</label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your detailed experience with this product..."
                  className="w-full rounded-xl border border-ink/10 bg-white p-3 text-xs text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover:bg-ink/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="btn-neon px-5 py-2 text-xs font-bold disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : isEditMode ? "Update Review" : "Post Review"}
                </button>
              </div>
            </form>
          )}

          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-white/50 border border-ink/5">
            <div className="md:col-span-4 text-center md:text-left border-r-0 md:border-r border-ink/10 pr-0 md:pr-6">
              <span className="font-display text-5xl font-extrabold text-ink block">
                {avgRating.toFixed(1)}
              </span>
              <div className="flex items-center justify-center md:justify-start gap-1 my-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={star <= Math.round(avgRating) ? "fill-amber-400" : "text-slate-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-ink-soft">Based on {reviewsList.length} verified ratings</span>
            </div>

            <div className="md:col-span-8 space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsList.filter((r) => r.rating === stars).length;
                const pct = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-ink-soft font-semibold">{stars} Stars</span>
                    <div className="h-2 flex-1 rounded-full bg-ink/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-ink-muted font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List from PostgreSQL DB */}
          {isLoadingReviews ? (
            <div className="flex justify-center py-8 text-xs text-ink-soft font-semibold gap-2 items-center">
              <Loader2 size={16} className="animate-spin text-neon-dark" /> Loading verified reviews from database...
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/40 border border-ink/5 space-y-2">
              <MessageSquare size={32} className="mx-auto text-ink-muted" />
              <p className="text-xs font-bold text-ink">No reviews yet for this product</p>
              <p className="text-[11px] text-ink-soft">Be the first verified customer to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-white/70 border border-ink/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-ink text-white font-bold text-xs grid place-items-center shadow-sm">
                        {rev.avatarUrl ? (
                          <img src={rev.avatarUrl} alt={rev.author} className="h-full w-full object-cover" />
                        ) : (
                          <span>{rev.author?.[0]?.toUpperCase() || "U"}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-ink text-xs block">{rev.author}</span>
                        {rev.verified && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-ink-muted font-mono">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= rev.rating ? "fill-amber-400" : "text-slate-300"}
                      />
                    ))}
                  </div>

                  <h5 className="font-display text-sm font-bold text-ink">{rev.title}</h5>
                  <p className="text-xs leading-relaxed text-ink-soft">{rev.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
