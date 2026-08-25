import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, KeyRound, ArrowUpRight } from 'lucide-react';
import api from '../../lib/api';
import { OtpModal } from '../../components/shared/OtpModal';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'REQUEST_EMAIL' | 'RESET_PASSWORD'>('REQUEST_EMAIL');
  
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.post('/auth/forgot-password/request-otp', { email });
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP callback from OtpModal
  const handleVerifyOtp = async (code: string) => {
    const res = await api.post('/auth/forgot-password/verify-otp', { email, code });
    const token = res.data?.data?.resetToken;
    if (!token) throw new Error('Reset token missing from response.');

    setResetToken(token);
    setIsOtpModalOpen(false);
    setStep('RESET_PASSWORD');
    setSuccessMsg('OTP verified successfully! Please enter your new password.');
  };

  // Resend OTP callback from OtpModal
  const handleResendOtp = async () => {
    await api.post('/auth/forgot-password/request-otp', { email });
  };

  // Step 3: Submit New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/forgot-password/reset-password', {
        resetToken,
        newPassword,
      });

      setSuccessMsg('Password updated successfully! Redirecting to login...');

      setTimeout(() => {
        router.push('/auth/login');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16">
        <div className="glass p-8 md:p-10">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/logo/voltra_logo.png" alt="Voltra Logo" className="h-9 w-auto object-contain shrink-0" />
              <span className="font-display text-2xl font-bold tracking-tight text-ink">
                Voltra<span className="text-neon">.</span>
              </span>
            </Link>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {step === 'REQUEST_EMAIL' ? 'Forgot Password' : 'Set New Password'}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {step === 'REQUEST_EMAIL'
                ? 'Enter your account email address to receive a 6-digit verification code.'
                : 'Enter your new password below to recover account access.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-700 font-medium">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 'REQUEST_EMAIL' && (
            <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold text-ink">
                Account Email Address
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ryman@voltra.io"
                    className="h-11 w-full rounded-xl bg-white/70 px-4 text-xs text-ink placeholder:text-ink-muted outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-neon/60"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-neon inline-flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 font-bold"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification OTP'} <ArrowUpRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: Password Reset Form */}
          {step === 'RESET_PASSWORD' && (
            <form onSubmit={handleResetPasswordSubmit} className="mt-6 space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-ink/5 p-3 text-xs text-ink-soft font-medium">
                <KeyRound size={16} className="text-ink shrink-0" />
                <span>Verified: <strong className="text-ink">{email}</strong></span>
              </div>

              <label className="block text-xs font-semibold text-ink">
                New Password
                <div className="relative mt-1">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl bg-white/70 px-4 text-xs text-ink placeholder:text-ink-muted outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-neon/60"
                  />
                </div>
              </label>

              <label className="block text-xs font-semibold text-ink">
                Confirm New Password
                <div className="relative mt-1">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl bg-white/70 px-4 text-xs text-ink placeholder:text-ink-muted outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-neon/60"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-neon inline-flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 font-bold"
              >
                {isLoading ? 'Updating Password...' : 'Reset Password & Sign In'} <ArrowUpRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-ink transition"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* 6-Digit OTP Pop-up Modal */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={email}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        title="Forgot Password Verification"
      />
    </>
  );
}
