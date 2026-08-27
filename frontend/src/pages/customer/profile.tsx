import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/store/cart.store";
import { useWishlist } from "@/store/wishlist.store";
import { useCustomerProfile } from "@/modules/users/hooks/useCustomerProfile";
import { useMyOrders } from "@/modules/orders/hooks/useMyOrders";
import { useMyAddresses, useSaveAddress, type Address } from "@/modules/users/hooks/useMyAddresses";
import { useUpdateMe } from "@/modules/users/hooks/useUpdateMe";
import { useUploadAvatar } from "@/modules/users/hooks/useUploadAvatar";
import { useMyNotifications, type NotificationItem } from "@/modules/notifications/hooks/useNotifications";
import { OrderTrackingModal } from "@/components/customer/OrderTrackingModal";
import { SupportQueryModal } from "@/components/customer/SupportQueryModal";
import { OtpModal } from "@/components/shared/OtpModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { getCountryFlagIcon } from "@/components/ui/CountryFlags";
import {
  COUNTRIES,
  getStatesForCountry,
  getCitiesForState,
} from "@/lib/locationData";
import api from "@/lib/api";
import {
  LogOut,
  Package,
  Heart,
  MapPin,
  Settings,
  Mail,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  Lock,
  Save,
  ShoppingBag,
  ArrowRight,
  Camera,
  Loader2,
  Headset,
  MessageSquare,
  AlertCircle,
  Bell,
  CheckCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

type ActiveTab = "overview" | "notifications" | "orders" | "addresses" | "support" | "settings";

export default function Profile() {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicketForChat, setSelectedTicketForChat] = useState<any>(null);
  const [showNewQueryModal, setShowNewQueryModal] = useState(false);

  // Real Notifications Hook
  const {
    notifications,
    unreadCount: notifUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useMyNotifications({ limit: 100 });
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<string>("ALL");

  // Read tab parameter from URL query if present
  useEffect(() => {
    if (router.query.tab) {
      const t = String(router.query.tab).toLowerCase();
      if (["overview", "notifications", "orders", "addresses", "support", "settings"].includes(t)) {
        setActiveTab(t as ActiveTab);
      }
    }
  }, [router.query.tab]);

  const fetchMyTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res: any = await api.get("/tickets/me");
      const payload = res.data?.data || res.data;
      if (Array.isArray(payload)) setMyTickets(payload);
      else if (Array.isArray(payload?.tickets || payload?.items)) setMyTickets(payload?.tickets || payload?.items);
      else setMyTickets([]);
    } catch (err) {
      console.warn("Failed to fetch tickets:", err);
      setMyTickets([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  // Live Backend Data
  const { data: profileData, isLoading: profileLoading } = useCustomerProfile();
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useMyOrders();
  const { data: addresses = [], isLoading: addressLoading } = useMyAddresses();
  const updateMe = useUpdateMe();
  const saveAddress = useSaveAddress();
  const uploadAvatar = useUploadAvatar();

  // Settings State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrCountry, setAddrCountry] = useState("IN");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");

  // OTP Security Modal State
  const [isSecurityOtpOpen, setIsSecurityOtpOpen] = useState(false);
  const [pendingSecurityAction, setPendingSecurityAction] = useState<"PROFILE" | "PASSWORD" | null>(null);

  // Sync settings state when live profile loads
  useEffect(() => {
    if (profileData) {
      setEmail(profileData.email || "");
      setPhone(profileData.customerProfile?.phone || "");
    } else if (user) {
      setEmail(user.email || "");
    }
  }, [profileData, user]);

  if (!user) return null;

  const activeCustomerProfile = profileData?.customerProfile;
  const firstName = activeCustomerProfile?.firstName || user.firstName || "Customer";
  const lastName = activeCustomerProfile?.lastName || user.lastName || "";
  const displayName = `${firstName} ${lastName}`.trim();
  const phoneDisplay = activeCustomerProfile?.phone || addresses[0]?.phone || "Not provided";
  
  const formattedDob = activeCustomerProfile?.dateOfBirth
    ? new Date(activeCustomerProfile.dateOfBirth).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not provided";

  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "May 2026";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");

    // If email is changing, trigger 6-digit OTP verification
    if (email !== user.email) {
      try {
        await api.post("/users/me/request-otp");
        setPendingSecurityAction("PROFILE");
        setIsSecurityOtpOpen(true);
      } catch (err: any) {
        setProfileMsg(err?.response?.data?.message || "Failed to send verification OTP.");
      }
      return;
    }

    // Otherwise update phone directly
    updateMe.mutate(
      { phone },
      {
        onSuccess: () => {
          setProfileMsg("Contact info updated successfully!");
          setTimeout(() => setProfileMsg(""), 3000);
        },
        onError: (err: any) => {
          setProfileMsg(err?.response?.data?.message || "Failed to update profile");
        },
      }
    );
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordMsg("All password fields are required");
      return;
    }

    try {
      await api.post("/users/me/request-otp");
      setPendingSecurityAction("PASSWORD");
      setIsSecurityOtpOpen(true);
    } catch (err: any) {
      setPasswordMsg(err?.response?.data?.message || "Failed to send verification OTP.");
    }
  };

  const handleVerifySecurityOtp = async (otpCode: string) => {
    if (pendingSecurityAction === "PROFILE") {
      await new Promise((resolve, reject) => {
        updateMe.mutate(
          { email, phone, otpCode },
          {
            onSuccess: () => {
              setIsSecurityOtpOpen(false);
              alert("Email updated successfully. Please log in again.");
              logout();
              router.push("/auth/login");
              resolve(true);
            },
            onError: (err: any) => {
              reject(err);
            },
          }
        );
      });
    } else if (pendingSecurityAction === "PASSWORD") {
      await new Promise((resolve, reject) => {
        updateMe.mutate(
          { currentPassword, newPassword, otpCode },
          {
            onSuccess: () => {
              setIsSecurityOtpOpen(false);
              setPasswordMsg("Password updated successfully!");
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setTimeout(() => setPasswordMsg(""), 3000);
              resolve(true);
            },
            onError: (err: any) => {
              reject(err);
            },
          }
        );
      });
    }
  };

  const openAddressForm = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrLabel(addr.label);
      setAddrFullName(addr.fullName);
      setAddrPhone(addr.phone);
      setAddrLine1(addr.addressLine1);
      setAddrLine2(addr.addressLine2 || "");
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrPostal(addr.postalCode);
      setAddrCountry(addr.country);
      setAddrIsDefault(addr.isDefault);
    } else {
      setEditingAddress(null);
      setAddrLabel("Home");
      setAddrFullName(displayName);
      setAddrPhone(phoneDisplay !== "Not provided" ? phoneDisplay : "");
      setAddrLine1("");
      setAddrLine2("");
      setAddrCity("");
      setAddrState("");
      setAddrPostal("");
      setAddrCountry("IN");
      setAddrIsDefault(addresses.length === 0);
    }
    setShowAddressForm(true);
    setAddressMsg("");
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressMsg("");
    saveAddress.mutate(
      {
        id: editingAddress?.id,
        label: addrLabel,
        fullName: addrFullName,
        phone: addrPhone,
        addressLine1: addrLine1,
        addressLine2: addrLine2 || undefined,
        city: addrCity,
        state: addrState,
        postalCode: addrPostal,
        country: addrCountry,
        isDefault: addrIsDefault,
      },
      {
        onSuccess: () => {
          setShowAddressForm(false);
          setAddressMsg("Address saved!");
          setTimeout(() => setAddressMsg(""), 3000);
        },
        onError: (err: any) => {
          setAddressMsg(err?.response?.data?.message || "Failed to save address");
        },
      }
    );
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const currentAvatarUrl = profileData?.avatarUrl || user.avatarUrl;

  return (
    <>
      <Head>
        <title>{displayName} — Voltra Account</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-20 print:hidden">
        
        {/* Hidden File Input for Avatar Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFileChange}
          className="hidden"
        />

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">My Profile</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Manage your personal information, order history, and saved addresses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ── Left Sidebar Identity Card ── */}
          <aside className="space-y-6 lg:col-span-4">
            
            <div className="glass overflow-hidden p-6 text-center sm:text-left">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative">
                  {currentAvatarUrl ? (
                    <img
                      src={currentAvatarUrl}
                      alt={displayName}
                      className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-md border border-white/40"
                    />
                  ) : (
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FCD9B6] via-[#D89C68] to-[#3B2A20] font-display text-2xl font-bold text-white shadow-md">
                      {displayName[0]?.toUpperCase()}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                    className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-neon text-ink shadow-md transition hover:scale-110 disabled:opacity-50"
                    title="Upload Profile Picture"
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 size={12} className="animate-spin text-ink" />
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-bold text-ink truncate">{displayName}</h2>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-ink-soft sm:justify-start">
                    <Mail size={13} className="text-ink-muted shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neon/15 px-3 py-0.5 text-[11px] font-semibold text-ink">
                    <ShieldCheck size={12} /> Customer Account
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="glass-soft p-3 transition hover:border-neon/50 hover:bg-white"
                >
                  <div className="font-display text-xl font-bold text-ink">
                    {ordersLoading ? "..." : orders.length}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">Orders</div>
                </button>

                <Link
                  href={ROUTES.CUSTOMER_WISHLIST}
                  className="glass-soft p-3 transition hover:border-neon/50 hover:bg-white"
                >
                  <div className="font-display text-xl font-bold text-ink">{wishCount}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">Wishlist</div>
                </Link>

                <Link
                  href={ROUTES.CUSTOMER_CART}
                  className="glass-soft p-3 transition hover:border-neon/50 hover:bg-white"
                >
                  <div className="font-display text-xl font-bold text-ink">{cartCount}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">In Cart</div>
                </Link>
              </div>

              {/* Navigation Tabs Menu */}
              <nav className="mt-6 flex overflow-x-auto lg:flex-col gap-1.5 border-t border-ink/5 pt-4 pb-1 lg:pb-0 scrollbar-none">
                {[
                  { id: "overview", label: "Overview", icon: User },
                  { id: "notifications", label: "Notifications", icon: Bell, badge: notifUnreadCount },
                  { id: "orders", label: "My Orders", icon: Package, badge: orders.length },
                  { id: "addresses", label: "Saved Addresses", icon: MapPin, badge: addresses.length },
                  { id: "support", label: "Customer Support", icon: Headset, badge: myTickets.length },
                  { id: "settings", label: "Settings & Security", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "bg-ink text-white shadow-sm"
                          : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 whitespace-nowrap">
                        <Icon size={16} className={isActive ? "text-neon" : "text-ink-muted"} />
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive ? "bg-white/20 text-white" : "bg-ink/5 text-ink-muted"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => {
                  logout();
                  router.push(ROUTES.HOME);
                }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white/50 py-2.5 text-xs font-semibold text-ink-soft transition hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>

          </aside>

          {/* ── Right Column Content Area ── */}
          <main className="lg:col-span-8">

            {/* ── TAB 1: Account Overview ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">

                {/* Account Details Card */}
                <div className="glass overflow-hidden">
                  <div className="flex items-center justify-between border-b border-ink/5 bg-white/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-ink">Personal Details</h3>
                        <p className="text-xs text-ink-muted">Your registered customer information</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-ink/10"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                    <div className="glass-soft p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">First Name</span>
                      <div className="mt-1 text-sm font-bold text-ink">{firstName}</div>
                    </div>

                    <div className="glass-soft p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Last Name</span>
                      <div className="mt-1 text-sm font-bold text-ink">{lastName || "—"}</div>
                    </div>

                    <div className="glass-soft p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Email Address</span>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
                        <Mail size={14} className="text-ink-muted shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>

                    <div className="glass-soft p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Phone Number</span>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
                        <Phone size={14} className="text-ink-muted shrink-0" />
                        <span>{phoneDisplay}</span>
                      </div>
                    </div>

                    <div className="glass-soft p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Date of Birth</span>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
                        <Calendar size={14} className="text-ink-muted shrink-0" />
                        <span>{formattedDob}</span>
                      </div>
                    </div>

                    <div className="glass-soft p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Member Since</span>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
                        <Clock size={14} className="text-ink-muted shrink-0" />
                        <span>{memberSince}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="glass overflow-hidden">
                  <div className="flex items-center justify-between border-b border-ink/5 bg-white/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                        <Package size={18} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-ink">Recent Orders</h3>
                        <p className="text-xs text-ink-muted">Track your recent purchases</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline"
                    >
                      View All <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="p-6">
                    {ordersLoading ? (
                      <p className="text-xs text-ink-muted">Loading orders...</p>
                    ) : orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 2).map((order: any) => {
                          const amount = Number(order.total ?? order.totalAmount ?? order.subtotal ?? 0);
                          const itemsQty = order.orderItems?.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0) || order.orderItems?.length || 1;
                          const statusStr = (order.orderStatus || order.status || "PENDING").toUpperCase();

                          return (
                            <div
                              key={order.id}
                              onClick={() => setSelectedOrderForTracking(order)}
                              className="glass-soft flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/80 transition"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-ink">#{order.orderNumber || order.id?.slice(0, 8)}</span>
                                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                    {statusStr}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-ink-soft">
                                  {new Date(order.createdAt || Date.now()).toLocaleDateString()} • {itemsQty} item(s)
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-display text-base font-bold text-ink">
                                  ${amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <ShoppingBag size={28} className="mx-auto text-ink-muted/50" />
                        <p className="mt-2 text-xs font-medium text-ink-muted">No orders placed yet</p>
                        <Link href="/categories/all" className="btn-neon mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold">
                          Explore Products
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 2: Notifications Center ── */}
            {activeTab === "notifications" && (
              <div className="glass p-6 md:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/20 text-ink">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">Notification Center</h3>
                      <p className="text-xs text-ink-muted">
                        Real-time Notifications
                      </p>
                    </div>
                  </div>

                  {notifUnreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllAsRead()}
                      className="btn-neon px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCheck size={14} /> Mark All as Read
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "ALL", label: "All" },
                    { id: "UNREAD", label: `Unread (${notifUnreadCount})` },
                    { id: "SUCCESS", label: "Success" },
                    { id: "CANCEL", label: "Cancelled" },
                    { id: "MAINTENANCE", label: "System Alerts" },
                    { id: "GENERAL", label: "Promos & CS" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setNotifFilter(f.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        notifFilter === f.id
                          ? "bg-ink text-white shadow-sm"
                          : "bg-white/60 text-ink-soft hover:bg-white hover:text-ink"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Notification Items List */}
                <div className="space-y-3">
                  {(() => {
                    const filteredNotifs = notifications.filter((n: NotificationItem) => {
                      if (notifFilter === "UNREAD") return !n.isRead;
                      if (notifFilter === "SUCCESS") return n.type === "SUCCESS";
                      if (notifFilter === "CANCEL") return n.type === "CANCEL";
                      if (notifFilter === "MAINTENANCE") return n.type === "MAINTENANCE";
                      if (notifFilter === "GENERAL") return n.type === "GENERAL";
                      return true;
                    });

                    if (filteredNotifs.length === 0) {
                      return (
                        <div className="glass-soft p-10 text-center space-y-2">
                          <Bell size={24} className="mx-auto text-ink-muted" />
                          <p className="text-xs font-bold text-ink">No notifications found in this view.</p>
                        </div>
                      );
                    }

                    return filteredNotifs.map((n: NotificationItem) => {
                      const isExpanded = expandedNotifId === n.id;
                      const getStripeBg = (type: string) => {
                        switch (type) {
                          case "SUCCESS":
                            return "bg-emerald-500";
                          case "CANCEL":
                            return "bg-rose-500";
                          case "MAINTENANCE":
                            return "bg-amber-500";
                          case "GENERAL":
                          default:
                            return "bg-sky-500";
                        }
                      };

                      return (
                        <div
                          key={n.id}
                          className={`flex items-stretch overflow-hidden rounded-xl border border-ink/10 bg-white transition cursor-pointer hover:bg-slate-50 ${
                            !n.isRead ? "shadow-sm ring-1 ring-ink/10" : "opacity-80"
                          }`}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                            setExpandedNotifId(isExpanded ? null : n.id);
                          }}
                        >
                          {/* Dedicated Narrow Left Color Stripe Only */}
                          <div className={`w-1.5 shrink-0 ${getStripeBg(n.type)}`} />

                          <div className="flex-1 p-4 flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-sm font-bold text-ink">{n.title}</span>
                                {!n.isRead && (
                                  <span className="bg-neon text-ink text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-xs text-ink-soft leading-relaxed ${
                                  isExpanded ? "" : "line-clamp-2"
                                }`}
                              >
                                {n.message}
                              </p>

                              {/* Notification Data Attributes */}
                              {n.data && isExpanded && (
                                <div className="mt-2 pt-2 border-t border-ink/5 flex flex-wrap gap-2 text-[11px] font-mono text-ink-muted">
                                  {n.data.orderNumber && (
                                    <span className="bg-white/80 px-2 py-0.5 rounded border border-ink/5">
                                      Order: #{n.data.orderNumber}
                                    </span>
                                  )}
                                  {n.data.couponCode && (
                                    <span className="bg-neon/30 text-ink font-bold px-2 py-0.5 rounded">
                                      Code: {n.data.couponCode}
                                    </span>
                                  )}
                                  {n.data.ticketId && (
                                    <span className="bg-white/80 px-2 py-0.5 rounded border border-ink/5">
                                      Ticket: #{n.data.ticketId.slice(0, 8)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-ink-muted font-medium">
                                {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="p-1 text-ink-muted hover:text-rose-500 transition"
                                title="Delete Notification"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* ── TAB 3: My Orders ── */}
            {activeTab === "orders" && (
              <div className="glass overflow-hidden">
                <div className="flex items-center gap-3 border-b border-ink/5 bg-white/30 px-6 py-4">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">My Orders</h3>
                    <p className="text-xs text-ink-muted">Click any order to open live package tracking timeline</p>
                  </div>
                </div>

                <div className="p-6">
                  {ordersLoading ? (
                    <p className="text-xs text-ink-muted">Loading your orders...</p>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => {
                        const statusStr = (order.orderStatus || order.status || "PENDING").toUpperCase();
                        const totalCost = Number(order.total ?? order.totalAmount ?? order.subtotal ?? 0);
                        const itemsCount = order.orderItems?.length || order._count?.orderItems || 1;

                        return (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrderForTracking(order)}
                            className="glass-soft group flex flex-col p-5 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-lg border border-ink/5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/5 pb-4">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-base font-bold text-ink">
                                  #{order.orderNumber || order.id?.slice(0, 8)}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                    statusStr === "DELIVERED"
                                      ? "bg-emerald-500/20 text-emerald-700"
                                      : statusStr === "CANCELLED"
                                      ? "bg-rose-500/20 text-rose-700"
                                      : "bg-neon/30 text-neon-dark"
                                  }`}
                                >
                                  {statusStr}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-[10px] font-bold uppercase text-ink-muted block">Total Paid</span>
                                  <span className="font-display text-lg font-extrabold text-ink">
                                    ${totalCost.toFixed(2)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrderForTracking(order);
                                  }}
                                  className="btn-neon px-4 py-2 text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0"
                                >
                                  Track Order <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
                              <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-ink-muted" />
                                <span>
                                  Placed on{" "}
                                  {new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <span className="font-semibold text-ink">
                                {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <ShoppingBag size={36} className="mx-auto text-ink-muted/40" />
                      <h4 className="mt-3 font-display text-base font-bold text-ink">No orders found</h4>
                      <p className="mt-1 text-xs text-ink-soft">You haven't placed any orders with Voltra yet.</p>
                      <Link href="/categories/all" className="btn-neon mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold">
                        Start Shopping <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 3: Saved Addresses ── */}
            {activeTab === "addresses" && (
              <div className="glass overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink/5 bg-white/30 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-ink">Saved Addresses</h3>
                      <p className="text-xs text-ink-muted">Manage your shipping and billing addresses</p>
                    </div>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => openAddressForm()}
                      className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                    >
                      <Plus size={14} /> Add Address
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {addressLoading ? (
                    <p className="text-xs text-ink-muted">Loading addresses...</p>
                  ) : showAddressForm ? (
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Address Label</label>
                          <input
                            value={addrLabel}
                            onChange={(e) => setAddrLabel(e.target.value)}
                            placeholder="Home, Office, etc."
                            className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Full Name *</label>
                          <input
                            required
                            value={addrFullName}
                            onChange={(e) => setAddrFullName(e.target.value)}
                            className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                          />
                        </div>
                      </div>

                      <PhoneInput
                        country={addrCountry || "USA"}
                        onCountryChange={(c) => {
                          setAddrCountry(c);
                          const states = getStatesForCountry(c);
                          const nextState = states.includes(addrState) ? addrState : states[0] || "";
                          setAddrState(nextState);
                          const cities = getCitiesForState(nextState);
                          setAddrCity(cities.includes(addrCity) ? addrCity : cities[0] || "");
                        }}
                        phone={addrPhone}
                        onPhoneChange={setAddrPhone}
                        required
                      />

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Address Line 1 *</label>
                        <input
                          required
                          value={addrLine1}
                          onChange={(e) => setAddrLine1(e.target.value)}
                          placeholder="Street address or P.O. Box"
                          className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Address Line 2</label>
                        <input
                          value={addrLine2}
                          onChange={(e) => setAddrLine2(e.target.value)}
                          placeholder="Apt, suite, unit, building (optional)"
                          className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Country *</label>
                          <CustomSelect
                            options={COUNTRIES.map((c) => ({
                              value: c.code,
                              label: c.name,
                              icon: getCountryFlagIcon(c.code),
                            }))}
                            value={addrCountry || "USA"}
                            onChange={(c) => {
                              setAddrCountry(c);
                              const states = getStatesForCountry(c);
                              const nextState = states.includes(addrState) ? addrState : states[0] || "";
                              setAddrState(nextState);
                              const cities = getCitiesForState(nextState);
                              setAddrCity(cities.includes(addrCity) ? addrCity : cities[0] || "");
                            }}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">State *</label>
                          <CustomSelect
                            options={getStatesForCountry(addrCountry || "USA").map((s) => ({ value: s, label: s }))}
                            value={addrState || "California"}
                            onChange={(s) => {
                              setAddrState(s);
                              const cities = getCitiesForState(s);
                              setAddrCity(cities.includes(addrCity) ? addrCity : cities[0] || "");
                            }}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">City *</label>
                          <CustomSelect
                            options={getCitiesForState(addrState || "California").map((ci) => ({ value: ci, label: ci }))}
                            value={addrCity || "San Francisco"}
                            onChange={setAddrCity}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Postal Code *</label>
                          <input
                            required
                            value={addrPostal}
                            onChange={(e) => setAddrPostal(e.target.value)}
                            placeholder="e.g. 94105 or 560001"
                            className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="inline-flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addrIsDefault}
                            onChange={(e) => setAddrIsDefault(e.target.checked)}
                            className="h-4 w-4 rounded border-ink/20 accent-neon cursor-pointer"
                          />
                          <span className="text-xs font-medium text-ink">Set as default shipping address</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="rounded-xl border border-ink/10 px-4 py-2 text-xs font-semibold text-ink-soft transition hover:bg-ink/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saveAddress.isPending}
                          className="btn-neon inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
                        >
                          <Save size={14} />
                          {saveAddress.isPending ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="glass-soft p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-bold text-ink">{addr.fullName}</span>
                                <span className="rounded-full bg-neon/20 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                                  {addr.label}
                                </span>
                                {addr.isDefault && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    <CheckCircle2 size={10} /> Default Address
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-xs font-medium text-ink-soft">
                                {addr.addressLine1}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                              </p>
                              <p className="text-xs text-ink-soft">
                                {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                              </p>
                              <p className="mt-1.5 text-xs text-ink-muted">Phone: {addr.phone}</p>
                            </div>
                            <button
                              onClick={() => openAddressForm(addr)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3.5 py-1 text-xs font-semibold text-ink shadow-sm transition hover:border-neon hover:bg-neon hover:text-ink"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MapPin size={32} className="mx-auto text-ink-muted/40" />
                      <p className="mt-2 text-xs font-medium text-ink-muted">No address saved yet</p>
                      <button
                        onClick={() => openAddressForm()}
                        className="btn-neon mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                      >
                        <Plus size={14} /> Add Your Address
                      </button>
                    </div>
                  )}

                  {addressMsg && (
                    <p className={`mt-3 text-xs font-semibold ${addressMsg.includes("saved") ? "text-emerald-600" : "text-rose-500"}`}>
                      {addressMsg}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 4: Customer Support ── */}
            {activeTab === "support" && (
              <div className="glass overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink/5 bg-white/30 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                      <Headset size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-ink">Customer Support Desk</h3>
                      <p className="text-xs text-ink-muted">Create Query, Track inquiries, refund requests & chat feature</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicketForChat(null);
                      setShowNewQueryModal(true);
                    }}
                    className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                  >
                    <Plus size={14} /> New Query
                  </button>
                </div>

                <div className="p-6">
                  {isLoadingTickets ? (
                    <p className="text-xs text-ink-muted">Loading support tickets...</p>
                  ) : myTickets.length > 0 ? (
                    <div className="space-y-3">
                      {myTickets.map((t: any) => (
                        <div key={t.id} className="glass-soft p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-bold text-ink">{t.subject}</span>
                                <span className="rounded-full bg-neon/20 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                                  {t.category}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    t.status === "CLOSED"
                                      ? "bg-slate-200 text-slate-700"
                                      : t.status === "IN_PROGRESS"
                                      ? "bg-blue-500/15 text-blue-700"
                                      : "bg-neon/30 text-neon-dark"
                                  }`}
                                >
                                  {t.status || "OPEN"}
                                </span>
                              </div>
                              <p className="mt-2 text-xs font-medium text-ink-soft">
                                Query ID: #{t.id?.slice(0, 8)?.toUpperCase()} {t.orderId ? `• Order: #${t.orderId}` : ""}
                              </p>
                              <p className="mt-1 text-xs text-ink-muted">
                                Created on {new Date(t.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedTicketForChat(t);
                                setShowNewQueryModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3.5 py-1 text-xs font-semibold text-ink shadow-sm transition hover:border-neon hover:bg-neon hover:text-ink"
                            >
                              Chat <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MessageSquare size={32} className="mx-auto text-ink-muted/40" />
                      <p className="mt-2 text-xs font-medium text-ink-muted">No support queries found</p>
                      <button
                        onClick={() => {
                          setSelectedTicketForChat(null);
                          setShowNewQueryModal(true);
                        }}
                        className="btn-neon mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                      >
                        <Plus size={14} /> Submit First Query
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 5: Settings & Security ── */}
            {activeTab === "settings" && (
              <div className="space-y-6">

                {/* Contact Settings */}
                <form onSubmit={handleUpdateProfile} className="glass overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-ink/5 bg-white/30 px-6 py-4">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-ink">Contact Settings</h3>
                      <p className="text-xs text-ink-muted">Update your email address and phone number</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Email Address</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-ink-muted">Changing email requires re-login.</p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Phone Number</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {profileMsg && (
                        <p className={`text-xs font-semibold ${profileMsg.includes("updated") ? "text-emerald-600" : "text-rose-500"}`}>
                          {profileMsg}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={updateMe.isPending}
                        className="btn-neon ml-auto inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
                      >
                        <Save size={14} />
                        {updateMe.isPending ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Password & Security */}
                <form onSubmit={handleUpdatePassword} className="glass overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-ink/5 bg-white/30 px-6 py-4">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-ink">Password & Security</h3>
                      <p className="text-xs text-ink-muted">Change your account password</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {passwordMsg && (
                        <p className={`text-xs font-semibold ${passwordMsg.includes("updated") ? "text-emerald-600" : "text-rose-500"}`}>
                          {passwordMsg}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={updateMe.isPending}
                        className="btn-neon ml-auto inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
                      >
                        <Lock size={14} />
                        {updateMe.isPending ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            )}

          </main>

        </div>
      </div>

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={!!selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
        onOrderUpdated={() => {
          refetchOrders();
        }}
      />

      {/* Customer Support Query Chat Modal */}
      <SupportQueryModal
        isOpen={showNewQueryModal}
        onClose={() => {
          setShowNewQueryModal(false);
          setSelectedTicketForChat(null);
        }}
        initialTicket={selectedTicketForChat}
        onTicketCreated={fetchMyTickets}
      />

      {/* Security Update 6-Digit OTP Verification Modal */}
      <OtpModal
        isOpen={isSecurityOtpOpen}
        onClose={() => {
          setIsSecurityOtpOpen(false);
          setPendingSecurityAction(null);
        }}
        email={user.email}
        onVerify={handleVerifySecurityOtp}
        onResend={async () => {
          await api.post("/users/me/request-otp");
        }}
        title="Security Action Verification"
        subtitle={`Enter the 6-digit code sent to ${user.email} to authorize changes.`}
      />
    </>
  );
}
