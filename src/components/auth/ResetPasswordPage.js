"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  XCircle,
} from "lucide-react";

export default function ResetPasswordPage({ onSwitchToLogin }) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams ? searchParams.get("token") || "" : "";

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token || !token.trim()) {
      setErrorMessage("Reset token is required.");
      return;
    }

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.resetPassword({
        token: token.trim(),
        newPassword,
      });

      if (result.success) {
        setResponseMessage(
          result.message ||
            "Password has been reset successfully. You can now log in."
        );
        setIsSuccess(true);
      } else {
        setErrorMessage(
          result.error || "Failed to reset password. Token may be invalid or expired."
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
          {/* Header & Back Link */}
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
              Reset Password
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your reset token and your new secure password.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="break-words">{errorMessage}</div>
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Reset Token Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Reset Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-mono text-gray-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-700">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Passwords do not match yet</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success View */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-extrabold text-emerald-900">
                  Password Reset Successful!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {responseMessage}
                </p>
              </div>

              {onSwitchToLogin ? (
                <button
                  onClick={onSwitchToLogin}
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:opacity-90 active:opacity-100 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
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
