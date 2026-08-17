import Head from "next/head";
import Link from "next/link";
import { ArrowUpRight, Check, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRegister } from "@/modules/auth/hooks/useRegister";

import { DatePicker } from "@/components/ui/DatePicker";
import { AxiosError } from "axios";

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <div className="relative mt-1.5">
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-ink/10 bg-white/70 pl-4 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/40 ${
            isPasswordField ? "pr-11" : "pr-4"
          }`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink transition"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </label>
  );
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const registerMutation = useRegister();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (!email || !password || !firstName || !lastName || !phone || !dateOfBirth) {
      setErrorMsg("Please fill out all required fields");
      return;
    }

    // Age 18+ check
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      setErrorMsg("You must be at least 18 years old to register");
      return;
    }

    registerMutation.mutate({ email, password, firstName, lastName, phone, dateOfBirth });
  };

  return (
    <>
      <Head>
        <title>Create account — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16">
        <div className="glass p-8 md:p-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">Join Voltra</h2>
            <p className="mt-1 text-sm text-ink-soft">Create a customer account to unlock the ecosystem.</p>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-2">
            {["Secure checkout", "Order dashboard", "Priority support"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-neon text-ink">
                  <Check size={11} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name *"
                placeholder="John"
                value={firstName}
                onChange={setFirstName}
                required
              />
              <Field
                label="Last name *"
                placeholder="Doe"
                value={lastName}
                onChange={setLastName}
                required
              />
            </div>
            <Field
              label="Email *"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={setEmail}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Phone number *"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={setPhone}
                required
              />
              <DatePicker
                label="Date of birth *"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                required
              />
            </div>
            <Field
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />
            <Field
              label="Confirm password *"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />

            {(errorMsg || registerMutation.isError) && (
              <div className="rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700">
                {errorMsg ||
                  (registerMutation.error as AxiosError<{ message: string }>)?.response?.data
                    ?.message ||
                  "Registration failed."}
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-neon inline-flex w-full items-center justify-center gap-3 py-3 text-sm disabled:opacity-50"
            >
              {registerMutation.isPending ? "Creating..." : "Create account"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-ink/10" /> or continue with{" "}
            <span className="h-px flex-1 bg-ink/10" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Google", "GitHub", "Apple"].map((l) => (
              <button
                key={l}
                type="button"
                className="grid h-11 place-items-center rounded-xl bg-white/70 text-xs font-semibold text-ink hover:bg-white"
              >
                {l}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-xs text-ink-soft">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-ink hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
