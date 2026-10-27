"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/actions/auth-reset";

type Step = "EMAIL" | "OTP" | "PASSWORD" | "DONE";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("laknidut@gmail.com");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isPending, startTransition] = useTransition();

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Send OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your registered admin email address.");
      return;
    }

    startTransition(async () => {
      const res = await requestPasswordResetOtp(cleanEmail);
      if (!res.success) {
        setError(res.error || "Failed to generate verification code.");
        return;
      }

      setInfoMessage(res.message || "A 6-digit code was dispatched to your email.");
      setStep("OTP");
      setResendCooldown(60);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    });
  };

  // Handle OTP digit entry
  const handleOtpChange = (index: number, value: string) => {
    // Support pasting full 6 digits
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const nextOtp = [...otp];
        digits.forEach((d, i) => {
          if (index + i < 6) nextOtp[index + i] = d;
        });
        setOtp(nextOtp);
        const nextIndex = Math.min(index + digits.length, 5);
        otpInputRefs.current[nextIndex]?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    // Auto focus next box
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    startTransition(async () => {
      const res = await verifyPasswordResetOtp(email, fullOtp);
      if (!res.success) {
        setError(res.error || "Invalid verification code.");
        return;
      }

      setInfoMessage("Verification code approved! Now create your new password.");
      setStep("PASSWORD");
    });
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0 || isPending) return;
    setError(null);

    startTransition(async () => {
      const res = await requestPasswordResetOtp(email);
      if (!res.success) {
        setError(res.error || "Could not resend code.");
        return;
      }
      setInfoMessage(res.message || "A new code has been sent!");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    });
  };

  // Handle Step 3: Set New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    const fullOtp = otp.join("");
    startTransition(async () => {
      const res = await resetPasswordWithOtp(email, fullOtp, newPassword);
      if (!res.success) {
        setError(res.error || "Failed to update password.");
        return;
      }

      setStep("DONE");
    });
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4 border border-indigo-400/30">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Recovery Portal</h1>
          <p className="text-sm text-gray-400 mt-2">
            Secure OTP Verification for your Portfolio Admin Account
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "EMAIL"
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              1
            </div>
            <span className={`text-xs ${step === "EMAIL" ? "text-white font-medium" : "text-gray-400"}`}>
              Email
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-3 bg-white/10" />

          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "OTP"
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                  : step === "PASSWORD" || step === "DONE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              2
            </div>
            <span className={`text-xs ${step === "OTP" ? "text-white font-medium" : "text-gray-400"}`}>
              Verify OTP
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-3 bg-white/10" />

          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "PASSWORD"
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                  : step === "DONE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              3
            </div>
            <span className={`text-xs ${step === "PASSWORD" ? "text-white font-medium" : "text-gray-400"}`}>
              Password
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0b0c13]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-rose-300 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start space-x-3 text-indigo-300 text-sm">
              <Sparkles size={18} className="flex-shrink-0 mt-0.5 text-indigo-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: ENTER EMAIL */}
          {step === "EMAIL" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="laknidut@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  We will send a 6-digit one-time code to authorize resetting your credentials.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Sending code...</span>
                  </span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === "OTP" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  Enter the 6-digit code sent to <strong className="text-indigo-400">{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setError(null);
                  }}
                  className="text-xs text-gray-400 hover:text-white mt-1 underline"
                >
                  Change email address
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between items-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-white/[0.05] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all font-mono"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isPending}
                  className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isPending || otp.join("").length !== 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying code...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: CREATE NEW PASSWORD */}
          {step === "PASSWORD" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-12 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Quality Checklist */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      newPassword.length >= 8 ? "bg-emerald-400" : "bg-gray-600"
                    }`}
                  />
                  <span className={newPassword.length >= 8 ? "text-emerald-300" : ""}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      newPassword && newPassword === confirmPassword
                        ? "bg-emerald-400"
                        : "bg-gray-600"
                    }`}
                  />
                  <span
                    className={
                      newPassword && newPassword === confirmPassword ? "text-emerald-300" : ""
                    }
                  >
                    Passwords match
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Updating password...</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Save New Password & Finish</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "DONE" && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Password Reset Complete!</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Your credentials have been securely updated. You can now log into your Admin account.
                </p>
              </div>

              <button
                onClick={() => router.push("/admin/login?reset=success")}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Go to Admin Login</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Bottom Back Link */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <Link
              href="/admin/login"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Login</span>
            </Link>
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              Return to Portfolio &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
