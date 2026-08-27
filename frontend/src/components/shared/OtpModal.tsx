import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, X, CheckCircle2, ShieldAlert, Edit2 } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  title?: string;
  subtitle?: string;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  title = 'Email Security Verification',
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(120); // 2 minutes countdown
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 2-minute countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      setTimer(120);
      setDigits(['', '', '', '', '', '']);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);

      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...digits];
    newDigits[index] = cleanVal.slice(-1); // Take last entered digit
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance focus to next input box
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    setErrorMsg(null);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      await onVerify(fullCode);
      setSuccessMsg('OTP verified successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid or expired 6-digit verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendClick = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await onResend();
      setTimer(120); // Reset 2-min timer
      setDigits(['', '', '', '', '', '']);
      setSuccessMsg('A new 6-digit code has been sent to your email.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 md:p-8 shadow-2xl text-ink">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink-muted hover:bg-ink/10 hover:text-ink transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neon/20 text-ink mb-3 shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink tracking-tight">{title}</h3>
          <div className="text-xs text-ink-soft mt-1.5 flex items-center justify-center flex-wrap gap-1">
            <span>Enter the 6-digit code sent to</span>
            <strong className="font-bold text-ink">{email}</strong>
            <button
              type="button"
              onClick={onClose}
              title="Edit email address"
              className="inline-flex items-center p-1 text-ink-muted hover:text-ink hover:bg-ink/5 rounded transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-2.5 mb-6">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-mono font-bold bg-slate-50 border border-ink/20 focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/60 rounded-md text-ink outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          {/* 2-Minute Timer & Resend (Clean inline without background box or clock icon) */}
          <div className="flex items-center justify-between text-xs text-ink-soft mb-6 px-1">
            <div className="font-mono font-medium">
              Expires in: <strong className={timer > 0 ? 'text-amber-600 font-bold' : 'text-rose-600 font-bold'}>{formatTimer(timer)}</strong>
            </div>

            <button
              type="button"
              onClick={handleResendClick}
              disabled={timer > 0 || isResending}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                timer > 0 || isResending
                  ? 'text-ink-muted cursor-not-allowed opacity-50'
                  : 'text-ink hover:text-neon-dark underline'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend OTP</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying || digits.join('').length !== 6}
            className="btn-neon inline-flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50 font-extrabold shadow-md"
          >
            {isVerifying ? 'Verifying Code...' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};
