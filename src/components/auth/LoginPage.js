"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
import { isTokenExpired } from "@/utils/token";
import { authService } from "@/services/auth.service";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function LoginPage({ onSwitchToForgot }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated } = useAuth();

  const isExpiredParam = searchParams.get("expired") === "true";
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-redirect only if user has a valid unexpired token
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedToken = storage.getToken();
    const savedUser = user || storage.getUser();

    if (savedToken && !isTokenExpired(savedToken) && savedUser) {
      if (
        redirectParam &&
        redirectParam.startsWith("/") &&
        !redirectParam.includes("/login")
      ) {
        router.replace(redirectParam);
        return;
      }
      const userRole =
        savedUser?.role ||
        (savedUser?.isSuperAdmin
          ? "super-admin"
          : savedUser?.isAdmin
            ? "admin"
            : "user");
      const destPath = authService.getRoleRedirectPath(userRole);
      router.replace(destPath);
    }
  }, [user, router, redirectParam]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        let destPath = result.redirectPath || "/dashboard";

        if (
          redirectParam &&
          redirectParam.startsWith("/") &&
          !redirectParam.includes("/login")
        ) {
          destPath = redirectParam;
        } else if (destPath === "/admin") {
          destPath = "/admin/dashboard";
        }

        setSuccessMessage(`Login successful! Redirecting...`);
        setTimeout(() => {
          router.push(destPath);
        }, 700);
      } else {
        setErrorMessage(
          result.error || "Login failed. Please check your credentials.",
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
      <div className="rounded-3xl bg-brand-card shadow-2xl border border-primary/20 p-6 sm:p-8 lg:p-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Shiv Pooja Residency Real Estate CRM
            </p>
          </div>

          {/* Session Expired Banner */}
          {isExpiredParam && !errorMessage && !successMessage && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-semibold animate-in fade-in duration-200">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Your session has expired. Please sign in again to continue.
              </span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="break-words">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                {onSwitchToForgot ? (
                  <button
                    type="button"
                    onClick={onSwitchToForgot}
                    className="text-xs font-semibold text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded-lg border border-gray-300 bg-white peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-primary" />
                  <CheckCircle2 className="h-4 w-4 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
