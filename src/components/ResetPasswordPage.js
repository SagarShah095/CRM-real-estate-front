"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Check,
} from "lucide-react";

export default function ResetPasswordPage({ onSwitchToLogin }) {
  const [otpCode, setOtpCode] = useState("849201"); // Pre-filled default demo OTP for easy testing
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Live Password Validation Criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  const passedCriteriaCount = [
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  // Calculate Strength Label & Percentage
  const getStrengthInfo = () => {
    if (newPassword.length === 0)
      return { label: "", percent: 0, color: "bg-gray-200" };
    if (passedCriteriaCount <= 1)
      return { label: "Weak Password", percent: 25, color: "bg-red-500" };
    if (passedCriteriaCount <= 3)
      return { label: "Medium Password", percent: 65, color: "bg-amber-500" };
    return { label: "Strong Password", percent: 100, color: "bg-brand-500" };
  };

  const strength = getStrengthInfo();
  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage("Please enter a valid security OTP code.");
      return;
    }

    if (passedCriteriaCount < 4) {
      setErrorMessage(
        "Please fulfill all security requirements for the new password.",
      );
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1300);
  };

  return (
    <div className="w-fit max-w-5xl mx-auto my-auto p-4 sm:p-6 lg:p-8">
      {/* RIGHT COLUMN: Password Reset Form */}
      <div className="lg:col-span-7 rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-brand-card">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header & Back Button */}
          <div>
            {onSwitchToLogin ? (
              <button
                onClick={onSwitchToLogin}
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            )}

            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
              Reset Password
            </h2>
            <p className="text-sm text-brand-muted mt-2">
              Enter your security OTP and choose a strong new password.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Security OTP Code Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  6-Digit Security OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 849201"
                    required
                    maxLength={8}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold tracking-widest text-brand-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all"
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
                    placeholder="Enter new password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Bar */}
                {newPassword.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-500">Strength:</span>
                      <span
                        className={`font-bold ${passedCriteriaCount >= 4 ? "text-brand-600" : "text-amber-600"}`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                  </div>
                )}
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
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Match State Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-700">
                          Passwords match!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">
                          Passwords do not match yet
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Reset Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success View */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 rounded-3xl bg-brand-50 border border-brand-200 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white mx-auto shadow-brand-orange">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-extrabold text-brand-900">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-brand-800 leading-relaxed max-w-sm mx-auto">
                  Your password has been updated securely. You can now log in to
                  the Shiv Pooja Residency CRM portal using your new
                  credentials.
                </p>
              </div>

              {onSwitchToLogin ? (
                <button
                  onClick={onSwitchToLogin}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm shadow-brand-orange hover:shadow-lg transition-all flex items-center justify-center gap-2"
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
