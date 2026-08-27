import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Lock,
  MapPin,
  CheckCircle2,
  CreditCard,
  Wallet,
  QrCode,
  Banknote,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useCart } from "@/store/cart.store";
import { useAuth } from "@/providers/AuthProvider";
import { useMyAddresses, useSaveAddress, type Address } from "@/modules/users/hooks/useMyAddresses";
import { useCustomerProfile } from "@/modules/users/hooks/useCustomerProfile";
import { ROUTES } from "@/lib/routes";
import { UnlockCardModal } from "@/components/customer/UnlockCardModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { getCountryFlagIcon } from "@/components/ui/CountryFlags";
import {
  COUNTRIES,
  getStatesForCountry,
  getCitiesForState,
} from "@/lib/locationData";

import api from "@/lib/api";

import { useQueryClient } from "@tanstack/react-query";

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      {label && <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>}
      <input
        type={type}
        required={required}
        value={value ?? ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-ink/15 bg-white/70 px-4 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/40 font-medium"
      />
    </div>
  );
}

export default function Checkout() {
  const { items: cartItems, subtotal: cartSubtotal, clear } = useCart();
  const { user } = useAuth();
  const { data: profileData } = useCustomerProfile();
  const { data: addresses = [] } = useMyAddresses();
  const router = useRouter();

  // Buy Now mode vs Cart mode isolation
  const isBuyNowMode = router.query.buyNow === "true";
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  useEffect(() => {
    if (isBuyNowMode) {
      try {
        const stored = sessionStorage.getItem("voltra_buy_now_item");
        if (stored) {
          setBuyNowItem(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }, [isBuyNowMode]);

  const isBuyNowActive = isBuyNowMode && !!buyNowItem;

  const activeCheckoutItems = useMemo(() => {
    if (isBuyNowActive) return [buyNowItem];
    try {
      const selectedRaw = typeof window !== "undefined" ? sessionStorage.getItem("voltra_selected_checkout_items") : null;
      if (selectedRaw) {
        const parsed = JSON.parse(selectedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return cartItems;
  }, [isBuyNowActive, buyNowItem, cartItems]);

  const activeSubtotal = useMemo(() => {
    if (isBuyNowActive) {
      return Number(buyNowItem.price || 0) * (buyNowItem.qty || 1);
    }
    return activeCheckoutItems.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  }, [isBuyNowActive, buyNowItem, activeCheckoutItems]);

  // Form State
  const [email, setEmail] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("USA");
  const [state, setState] = useState("California");
  const [city, setCity] = useState("San Francisco");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  const saveAddressMutation = useSaveAddress();
  const [originalAddress, setOriginalAddress] = useState<any>(null);
  const [addressToast, setAddressToast] = useState("");

  const availableStates = useMemo(() => getStatesForCountry(country), [country]);
  const availableCities = useMemo(() => getCitiesForState(state), [state]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const newStates = getStatesForCountry(newCountry);
    const nextState = newStates.includes(state) ? state : newStates[0] || "";
    setState(nextState);

    const newCities = getCitiesForState(nextState);
    const nextCity = newCities.includes(city) ? city : newCities[0] || "";
    setCity(nextCity);
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const newCities = getCitiesForState(newState);
    const nextCity = newCities.includes(city) ? city : newCities[0] || "";
    setCity(nextCity);
  };

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "PAYPAL" | "UPI" | "COD">("CARD");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Coupon Pipeline State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Pre-fill user profile info & phone number
  useEffect(() => {
    if (profileData) {
      const pPhone = profileData.customerProfile?.phone || profileData.staffProfile?.phone;
      if (pPhone) setPhone(pPhone);
    }
  }, [profileData]);

  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      const u = user as any;
      const uPhone = u.customerProfile?.phone || u.staffProfile?.phone || u.phone;
      if (uPhone && !phone) setPhone(uPhone);

      const name = `${user.firstName || u.customerProfile?.firstName || ""} ${user.lastName || u.customerProfile?.lastName || ""}`.trim();
      if (name) {
        setFullName(name);
        setCardName(name);
      }
    }
  }, [user]);

  // Pre-fill default address
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find((a: Address) => a.isDefault) || addresses[0];
      if (def.phone && !phone) setPhone(def.phone);
      setSelectedAddressId(def.id);
      populateAddressFields(def);
    }
  }, [addresses]);

  const populateAddressFields = (addr: Address) => {
    setAddressLabel(addr.label || "Home");
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");

    const c = addr.country || "USA";
    setCountry(c);

    const states = getStatesForCountry(c);
    const s = states.includes(addr.state) ? addr.state : states[0] || "California";
    setState(s);

    const cities = getCitiesForState(s);
    const ci = cities.includes(addr.city) ? addr.city : cities[0] || "San Francisco";
    setCity(ci);

    setPostalCode(addr.postalCode);

    setOriginalAddress({
      id: addr.id,
      label: addr.label || "Home",
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      country: c,
      state: s,
      city: ci,
      postalCode: addr.postalCode,
    });
  };

  const isAddressModified = useMemo(() => {
    if (!originalAddress) return false;
    return (
      addressLabel !== originalAddress.label ||
      fullName !== originalAddress.fullName ||
      phone !== originalAddress.phone ||
      addressLine1 !== originalAddress.addressLine1 ||
      (addressLine2 || "") !== (originalAddress.addressLine2 || "") ||
      country !== originalAddress.country ||
      state !== originalAddress.state ||
      city !== originalAddress.city ||
      postalCode !== originalAddress.postalCode
    );
  }, [addressLabel, fullName, phone, addressLine1, addressLine2, country, state, city, postalCode, originalAddress]);

  const handleCreateNewAddress = () => {
    saveAddressMutation.mutate(
      {
        label: addressLabel || "Home",
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        country,
        state,
        city,
        postalCode,
        isDefault: true,
      },
      {
        onSuccess: (saved: any) => {
          if (saved?.id) {
            setSelectedAddressId(saved.id);
          }
          setOriginalAddress({
            id: saved?.id || selectedAddressId,
            label: addressLabel || "Home",
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            country,
            state,
            city,
            postalCode,
          });
          setAddressToast("New address created & saved to your account!");
          setTimeout(() => setAddressToast(""), 3000);
        },
      }
    );
  };

  const handleUpdateAddress = () => {
    saveAddressMutation.mutate(
      {
        id: selectedAddressId !== "new" ? selectedAddressId : undefined,
        label: addressLabel || "Home",
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        country,
        state,
        city,
        postalCode,
        isDefault: true,
      },
      {
        onSuccess: (saved: any) => {
          setOriginalAddress({
            id: saved?.id || selectedAddressId,
            label: addressLabel || "Home",
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            country,
            state,
            city,
            postalCode,
          });
          setAddressToast("Address updated & saved successfully!");
          setTimeout(() => setAddressToast(""), 3000);
        },
      }
    );
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      clearAddressFields();
    } else {
      const selected = addresses.find((a: Address) => a.id === id);
      if (selected) populateAddressFields(selected);
    }
  };

  const clearAddressFields = () => {
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
  };

  const handleApplyUnlockedCard = (details: { expiry: string; cvv: string; cardNumber: string }) => {
    setCardNumber(details.cardNumber);
    setExpiry(details.expiry);
    setCvv(details.cvv);
    if (fullName) setCardName(fullName);
    setIsUnlocked(true);
  };

  // Coupon Validation Pipeline Function
  const handleApplyCoupon = async (overrideCode?: string) => {
    const code = (overrideCode || couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setIsValidatingCoupon(true);

    try {
      const res = await api.post("/coupons/validate", {
        code,
        orderAmount: activeSubtotal,
      });

      const data = res.data?.data || res.data;
      const discountVal = Number(data?.discountAmount || 0);

      setAppliedCoupon({
        code: data?.code || code,
        discountAmount: discountVal,
        description: data?.description || `Discount Applied`,
      });
      setCouponInput("");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid or expired coupon code";
      setCouponError(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // Financial Calculations with Coupon Discounts
  const shipping = 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = Math.max(0, activeSubtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = Math.max(0, Math.round((taxableAmount + shipping + tax) * 100) / 100);

  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onPlace = async (e: FormEvent) => {
    e.preventDefault();
    if (activeCheckoutItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const itemsPayload = activeCheckoutItems.map((item: any) => ({
        variantId: item.variantId || item.id,
        productName: item.name || item.title || "Voltra Product",
        variantName: item.color || item.variantName || "Standard",
        quantity: item.qty || 1,
        unitPrice: Number(item.price || 0),
      }));

      await api.post("/orders", {
        shippingAddressId: selectedAddressId !== "new" && selectedAddressId ? selectedAddressId : undefined,
        couponCode: appliedCoupon?.code || undefined,
        items: itemsPayload,
      });

      queryClient.invalidateQueries({ queryKey: ["my-orders"] });

      if (isBuyNowActive) {
        sessionStorage.removeItem("voltra_buy_now_item");
      } else {
        clear();
      }

      router.push("/order-confirmation");
    } catch (err) {
      if (isBuyNowActive) {
        sessionStorage.removeItem("voltra_buy_now_item");
      } else {
        clear();
      }
      router.push("/order-confirmation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeCheckoutItems.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout — Voltra</title>
        </Head>
        <div className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
          <div className="glass p-10 text-center">
            <h1 className="font-display text-2xl font-bold text-ink">No items for checkout</h1>
            <p className="mt-2 text-sm text-ink-soft">Add some products or select Buy Now before checking out.</p>
            <Link href={ROUTES.CATEGORIES} className="btn-neon mt-5 inline-flex px-5 py-2.5 text-sm">
              Explore Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout — Voltra</title>
      </Head>

      <form onSubmit={onPlace} className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink flex items-center gap-2">
              <Lock size={22} className="text-neon-dark" /> Checkout
              {isBuyNowActive && (
                <span className="ml-2 rounded-full bg-neon/30 px-3 py-1 text-xs font-extrabold text-neon-dark">
                  BUY NOW EXPRESS
                </span>
              )}
            </h1>
            <p className="mt-1 text-xs text-ink-soft">
              {isBuyNowActive
                ? "Direct checkout for your selected product"
                : "Review items and select payment method"}
            </p>
          </div>
          <Link
            href={isBuyNowActive ? "/product/1" : "/customer/cart"}
            className="text-xs font-semibold text-ink hover:underline"
          >
            ← {isBuyNowActive ? "Back to Product" : "Back to Cart"}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Main Checkout Inputs Column */}
          <div className="space-y-6 lg:col-span-3">
            {/* Contact Information */}
            <section className="glass p-6 rounded-3xl">
              <h3 className="font-display text-lg font-semibold text-ink">Contact Information</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Email"
                  placeholder="customer@voltra.io"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Field
                  label="Phone"
                  placeholder="+1 (415) 555 0123"
                  value={phone}
                  onChange={setPhone}
                  required
                />
              </div>
            </section>

            {/* Saved Addresses Selector */}
            {addresses.length > 0 && (
              <section className="glass p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                    <MapPin size={18} className="text-neon-dark" /> Saved Addresses
                  </h3>
                  <span className="text-xs font-bold text-ink-muted">{addresses.length} available</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {addresses.map((addr: Address) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr.id)}
                        className={`flex flex-col justify-between p-4 rounded-2xl border text-left text-xs transition ${
                          isSelected
                            ? "border-neon bg-neon/10 font-medium text-ink ring-2 ring-neon/40 shadow-sm"
                            : "border-ink/10 bg-white/50 text-ink-soft hover:bg-white hover:border-ink/20"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-ink">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-neon/30 px-2 py-0.5 text-[10px] font-extrabold text-neon-dark">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-ink-soft line-clamp-1">{addr.addressLine1}</p>
                          <p className="text-ink-muted">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-neon-dark">
                            <CheckCircle2 size={12} /> Selected for Delivery
                          </div>
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleSelectAddress("new")}
                    className={`flex items-center justify-center p-4 rounded-2xl border border-dashed text-xs font-bold transition ${
                      selectedAddressId === "new"
                        ? "border-neon bg-neon/10 text-ink ring-2 ring-neon/40"
                        : "border-ink/20 bg-white/40 text-ink-soft hover:bg-white"
                    }`}
                  >
                    + Enter New Delivery Address
                  </button>
                </div>
              </section>
            )}

            {/* Shipping Address Inputs */}
            <section className="glass p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Shipping Address</h3>
                  <p className="text-xs text-ink-soft">Enter or update your delivery location</p>
                </div>

                {isAddressModified && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateNewAddress}
                      disabled={saveAddressMutation.isPending}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-ink/15 bg-white text-ink hover:bg-slate-100 transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus size={13} /> Save as New Address
                    </button>

                    <button
                      type="button"
                      onClick={handleUpdateAddress}
                      disabled={saveAddressMutation.isPending}
                      className="btn-neon px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
                    >
                      {saveAddressMutation.isPending ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} /> Update Address
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {addressToast && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{addressToast}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Address Title / Label *"
                  placeholder="Home, Office, Apartment, etc."
                  value={addressLabel}
                  onChange={setAddressLabel}
                  required
                />
                <Field
                  label="Full Name *"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={setFullName}
                  required
                />

                <div className="md:col-span-2">
                  <PhoneInput
                    country={country}
                    onCountryChange={handleCountryChange}
                    phone={phone}
                    onPhoneChange={setPhone}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Address Line 1 *"
                    placeholder="123 Innovation Way"
                    value={addressLine1}
                    onChange={setAddressLine1}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label="Address Line 2 (Optional)"
                    placeholder="Apt 4B, Suite or Building"
                    value={addressLine2}
                    onChange={setAddressLine2}
                  />
                </div>

                {/* Country -> State -> City -> Postal Code Dropdowns Sequence */}
                <CustomSelect
                  label="Country / Region *"
                  options={COUNTRIES.map((c) => ({
                    value: c.code,
                    label: c.name,
                    icon: getCountryFlagIcon(c.code),
                  }))}
                  value={country}
                  onChange={handleCountryChange}
                />

                <CustomSelect
                  label="State / Province *"
                  options={availableStates.map((s) => ({ value: s, label: s }))}
                  value={state}
                  onChange={handleStateChange}
                />

                <CustomSelect
                  label="City *"
                  options={availableCities.map((ci) => ({ value: ci, label: ci }))}
                  value={city}
                  onChange={setCity}
                />

                <Field
                  label="Postal Code *"
                  placeholder="e.g. 94105 or 560001"
                  value={postalCode}
                  onChange={setPostalCode}
                  required
                />
              </div>
            </section>
          </div>

          {/* Payment & Order Summary Sidebar */}
          <aside className="lg:col-span-2">
            <div className="glass p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Payment Method</h3>
                <p className="text-xs text-ink-soft mt-0.5">Select how you want to pay</p>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition ${
                    paymentMethod === "CARD"
                      ? "border-neon bg-neon/20 text-ink shadow-sm ring-2 ring-neon/40"
                      : "border-ink/10 bg-white/60 text-ink-soft hover:bg-white"
                  }`}
                >
                  <CreditCard size={20} className="mb-1" />
                  Voltra Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAYPAL")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition ${
                    paymentMethod === "PAYPAL"
                      ? "border-neon bg-neon/20 text-ink shadow-sm ring-2 ring-neon/40"
                      : "border-ink/10 bg-white/60 text-ink-soft hover:bg-white"
                  }`}
                >
                  <Wallet size={20} className="mb-1" />
                  Digital Wallet
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition ${
                    paymentMethod === "UPI"
                      ? "border-neon bg-neon/20 text-ink shadow-sm ring-2 ring-neon/40"
                      : "border-ink/10 bg-white/60 text-ink-soft hover:bg-white"
                  }`}
                >
                  <QrCode size={20} className="mb-1" />
                  UPI / QR
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition ${
                    paymentMethod === "COD"
                      ? "border-neon bg-neon/20 text-ink shadow-sm ring-2 ring-neon/40"
                      : "border-ink/10 bg-white/60 text-ink-soft hover:bg-white"
                  }`}
                >
                  <Banknote size={20} className="mb-1" />
                  Pay on Delivery
                </button>
              </div>

              {/* CARD DETAILS TAB */}
              {paymentMethod === "CARD" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsUnlockModalOpen(true)}
                      className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl shadow-sm transition hover:scale-[1.01]"
                    >
                      <KeyRound size={14} /> Unlock Voltra Card
                    </button>
                  </div>

                  {isUnlocked && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-2.5 text-xs font-bold text-emerald-700">
                      <ShieldCheck size={16} /> Voltra Card details auto-filled & authenticated
                    </div>
                  )}

                  <Field
                    label="Cardholder Name"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={setCardName}
                    required
                  />

                  <Field
                    label="Card Number"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={cardNumber}
                    onChange={setCardNumber}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Expiry"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={setExpiry}
                      required
                    />
                    <Field
                      label="CVV"
                      placeholder="•••"
                      value={cvv}
                      onChange={setCvv}
                      required
                    />
                  </div>
                </div>
              )}

              {/* PAYPAL TAB */}
              {paymentMethod === "PAYPAL" && (
                <div className="rounded-2xl bg-white/60 p-4 text-center border border-ink/10 space-y-3">
                  <Wallet size={32} className="mx-auto text-sky-600" />
                  <p className="text-xs text-ink-soft font-medium">
                    You will be redirected to PayPal to complete your purchase securely.
                  </p>
                </div>
              )}

              {/* UPI TAB */}
              {paymentMethod === "UPI" && (
                <div className="rounded-2xl bg-white/60 p-4 text-center border border-ink/10 space-y-3">
                  <QrCode size={32} className="mx-auto text-emerald-600" />
                  <p className="text-xs text-ink-soft font-medium">
                    Scan QR code or enter your UPI ID upon clicking Place Order.
                  </p>
                </div>
              )}

              {/* COD TAB */}
              {paymentMethod === "COD" && (
                <div className="rounded-2xl bg-white/60 p-4 text-center border border-ink/10 space-y-3">
                  <Banknote size={32} className="mx-auto text-amber-600" />
                  <p className="text-xs text-ink-soft font-medium">
                    Pay in cash or card when your shipment arrives at your door.
                  </p>
                </div>
              )}

              {/* ── COUPON CODE & PROMO PIPELINE SECTION (ABOVE SUBTOTAL) ── */}
              <div className="border-t border-ink/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} className="text-neon-dark" /> Add Coupon / Promo Code
                  </span>
                </div>

                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME30"
                        className="h-10 flex-1 rounded-xl border border-ink/10 bg-white/70 px-3 text-xs font-mono uppercase text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/30"
                      />
                      <button
                        type="button"
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        onClick={() => handleApplyCoupon()}
                        className="btn-neon px-4 h-10 text-xs font-extrabold disabled:opacity-40"
                      >
                        {isValidatingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] font-medium text-rose-600">{couponError}</p>
                    )}

                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 border border-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-emerald-600" />
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-800">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] block font-semibold text-emerald-600">
                          {appliedCoupon.description}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Items List Being Purchased */}
              <div className="border-t border-ink/10 pt-4 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                  Items to Checkout ({activeCheckoutItems.length})
                </span>
                {activeCheckoutItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2 truncate pr-2">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="h-7 w-7 object-contain rounded-md" />
                      )}
                      <span className="font-medium text-ink truncate">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-ink">${Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Summary Breakdown */}
              <div className="border-t border-ink/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Subtotal</span>
                  <span className="text-ink font-medium">${activeSubtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Coupon Discount ({appliedCoupon.code})
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-ink-soft">Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-ink-soft">Tax (8%)</span>
                  <span className="text-ink font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="my-2 border-t border-ink/10" />

                <div className="flex justify-between text-base">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-display text-xl font-bold text-ink">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-neon inline-flex w-full items-center justify-center py-3 text-sm font-extrabold shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : `Place order ($${total.toFixed(2)})`}
              </button>
            </div>
          </aside>
        </div>
      </form>

      {/* Unlock Voltra Card Modal */}
      <UnlockCardModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        cardholderName={fullName || "JOHN DOE"}
        onApplyCard={handleApplyUnlockedCard}
      />
    </>
  );
}
