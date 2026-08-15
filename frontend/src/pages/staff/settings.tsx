import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAuth } from "@/providers/AuthProvider";
import { useUpdateMe } from "@/modules/users/hooks/useUpdateMe";
import { useUploadAvatar } from "@/modules/users/hooks/useUploadAvatar";
import { useCustomerProfile } from "@/modules/users/hooks/useCustomerProfile";
import { useMyAddresses, useSaveAddress } from "@/modules/users/hooks/useMyAddresses";
import { Mail, Phone, Lock, Save, Shield, UserCircle, KeyRound, MapPin, Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/router";

export default function StaffSettingsPage() {
  const { user, logout } = useAuth();
  const { data: profileData } = useCustomerProfile();
  const updateMe = useUpdateMe();
  const uploadAvatar = useUploadAvatar();
  const { data: addresses = [] } = useMyAddresses();
  const saveAddress = useSaveAddress();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryAddress = addresses[0];

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.staffProfile?.phone || "");
  
  // Address state inside contact information
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("IN");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // Synchronize email and phone state when user or profileData finishes loading
  useEffect(() => {
    if (user?.email) setEmail(user.email);
    const userPhone = user?.staffProfile?.phone || (user as any)?.customerProfile?.phone || profileData?.staffProfile?.phone || profileData?.customerProfile?.phone;
    if (userPhone) setPhone(userPhone);
  }, [user, profileData]);

  // Populate address inputs when primaryAddress loads
  useEffect(() => {
    if (primaryAddress) {
      setAddressLine1(primaryAddress.addressLine1 || "");
      setAddressLine2(primaryAddress.addressLine2 || "");
      setCity(primaryAddress.city || "");
      setState(primaryAddress.state || "");
      setPostalCode(primaryAddress.postalCode || "");
      setCountry(primaryAddress.country || "IN");
    }
  }, [primaryAddress]);

  if (!user) return null;

  const firstName = user.firstName || user.staffProfile?.firstName || (user as any).customerProfile?.firstName;
  const lastName = user.lastName || user.staffProfile?.lastName || (user as any).customerProfile?.lastName;
  const displayName = firstName ? `${firstName} ${lastName ?? ""}`.trim() : user.email.split("@")[0];

  const currentAvatarUrl = profileData?.avatarUrl || user.avatarUrl;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");

    try {
      // 1. Update User Email & Phone
      await updateMe.mutateAsync({ email, phone });

      // 2. Update/Save Address if addressLine1 is filled out
      if (addressLine1) {
        await saveAddress.mutateAsync({
          id: primaryAddress?.id,
          label: "Office",
          fullName: displayName,
          phone: phone || "0000000000",
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          state,
          postalCode,
          country,
          isDefault: true,
        });
      }

      if (email !== user.email) {
        alert("Email changed successfully. Please log in again.");
        logout();
        router.push("/auth/login");
      } else {
        setProfileMsg("Contact & Address information updated successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      }
    } catch (err: any) {
      setProfileMsg(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
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
    updateMe.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordMsg("Password updated successfully!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => setPasswordMsg(""), 3000);
        },
        onError: (err: any) => {
          setPasswordMsg(err?.response?.data?.message || "Failed to update password");
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Settings — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="mx-auto max-w-3xl space-y-6 pb-10">

          {/* Hidden File Input for Avatar Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />

          {/* ── Profile Header ── */}
          <div className="glass px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentAvatarUrl ? (
                  <img
                    src={currentAvatarUrl}
                    alt={displayName}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md border border-white/40"
                  />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] font-display text-xl font-bold text-white shadow-md">
                    {displayName[0]?.toUpperCase()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatar.isPending}
                  className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-neon text-ink shadow-md transition hover:scale-110 disabled:opacity-50"
                  title="Upload Profile Picture"
                >
                  {uploadAvatar.isPending ? (
                    <Loader2 size={11} className="animate-spin text-ink" />
                  ) : (
                    <Camera size={11} />
                  )}
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-xl font-bold text-ink truncate">{displayName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-neon/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink">
                    <Shield size={10} /> {user.role.replace("_", " ")}
                  </span>
                  <span className="text-xs text-ink-soft">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Contact Information (Includes Address) ── */}
          <form onSubmit={handleUpdateProfile} className="glass overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink/5 bg-white/30 px-6 py-4">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon/15">
                <UserCircle size={16} className="text-ink" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Contact & Address Information</h2>
                <p className="text-xs text-ink-muted">Update your email, phone, and office address</p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Read-only name display */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    First Name
                  </label>
                  <div className="flex h-10 items-center rounded-xl border border-ink/5 bg-ink/[0.02] px-3 text-sm text-ink-soft">
                    {user.firstName || "—"}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Last Name
                  </label>
                  <div className="flex h-10 items-center rounded-xl border border-ink/5 bg-ink/[0.02] px-3 text-sm text-ink-soft">
                    {user.lastName || "—"}
                  </div>
                </div>
              </div>

              <hr className="border-ink/5" />

              {/* Email & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-ink-muted">
                    Changing your email will require re-login.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-ink/5" />

              {/* Address Fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <MapPin size={14} className="text-neon" /> Address Details
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Street Address (Line 1)
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Voltra HQ, Suite 400"
                    className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Apartment, suite, etc. (Line 2)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Optional"
                    className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="400001"
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="IN"
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {profileMsg && (
                  <p className={`text-xs font-medium ${profileMsg.includes("success") ? "text-emerald-600" : "text-rose-500"}`}>
                    {profileMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={updateMe.isPending || saveAddress.isPending}
                  className="btn-neon ml-auto inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
                >
                  <Save size={14} />
                  {updateMe.isPending || saveAddress.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          {/* ── Security ── */}
          <form onSubmit={handleUpdatePassword} className="glass overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink/5 bg-white/30 px-6 py-4">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon/15">
                <KeyRound size={16} className="text-ink" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Security</h2>
                <p className="text-xs text-ink-muted">Change your password</p>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-ink/10 bg-white/60 px-3 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-1 focus:ring-neon/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {passwordMsg && (
                  <p className={`text-xs font-medium ${passwordMsg.includes("success") ? "text-emerald-600" : "text-rose-500"}`}>
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
      </StaffShell>
    </>
  );
}
