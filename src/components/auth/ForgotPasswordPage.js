"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";

export default function ForgotPasswordPage({
  onSwitchToLogin,
  onSwitchToReset,
}) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setResponseMessage("");

    if (!email) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.forgotPassword({ email });

      if (result.success) {
        setResponseMessage(
          result.message ||
            "If that email exists, a password reset link has been dispatched."
        );
        setIsSubmitted(true);
      } else {
        setErrorMessage(
          result.error || "Failed to process request. Please try again."
        );
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-4 sm:p-6">
      <div className="rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-brand-card shadow-2xl border border-primary/20">
        <div className="w-full space-y-6">
          {/* Back link */}
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
              Forgot Password
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Provide your registered email address below to receive password recovery instructions.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="break-words">{errorMessage}</div>
            </div>
          )}

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
                    placeholder="sagarshah8090@apex.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success Response View */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white mx-auto">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-emerald-900">
                  Request Dispatched
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {responseMessage}
                </p>
              </div>

              {onSwitchToReset ? (
                <button
                  onClick={onSwitchToReset}
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Reset Password</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/reset-password"
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Reset Password</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
