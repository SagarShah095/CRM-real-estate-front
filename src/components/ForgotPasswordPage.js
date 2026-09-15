"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Send,
  KeyRound,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function ForgotPasswordPage({
  onSwitchToLogin,
  onSwitchToReset,
}) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      startResendCountdown();
    }, 1200);
  };

  const startResendCountdown = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="w-fit max-w-5xl mx-auto my-auto p-4 sm:p-6 lg:p-8">
      {/* RIGHT COLUMN: Form Area */}
      <div className="lg:col-span-7 rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-brand-card shadow-2xl border border-primary/20">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Top Back Navigation Link */}
          <div>
            {onSwitchToLogin ? (
              <button
                onClick={onSwitchToLogin}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            )}

            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
              Reset Password Request
            </h2>
            <p className="text-sm text-brand-muted mt-2">
              Provide your registered email address below to receive password
              recovery instructions.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@shivpooja-residency.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Sending Security Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Recovery Code</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success Confirmation View */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white mx-auto shadow-brand-orange">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recovery Code Sent!
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  We've emailed a 6-digit security verification code to{" "}
                  <span className="font-bold underline">{email}</span>.
                </p>
              </div>

              {onSwitchToReset ? (
                <button
                  onClick={onSwitchToReset}
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Enter OTP Code</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/reset-password"
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Enter OTP Code</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                <span>Didn't receive the email?</span>
                {resendTimer > 0 ? (
                  <span className="font-medium text-primary">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend Code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

