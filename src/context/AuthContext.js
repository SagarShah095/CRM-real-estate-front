"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/utils/storage";
import { authService } from "@/services/auth.service";

import { isTokenExpired, triggerTokenExpiredRedirect } from "@/utils/token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate auth state on app load
    const savedToken = storage.getToken();
    const savedUser = storage.getUser();

    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        storage.clearAuth();
        setUser(null);
        setToken(null);
        triggerTokenExpiredRedirect("Your session has expired. Please log in again.");
      } else {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);

    // Listen for custom auth:expired broadcast events
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("auth:expired", handleAuthExpired);

    // Visibility change check: re-verify expiration when user returns to this browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const curToken = storage.getToken();
        if (curToken && isTokenExpired(curToken)) {
          triggerTokenExpiredRedirect("Your session has expired. Please log in again.");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Periodic check every 30 seconds for proactive redirection on expiry
    const intervalId = setInterval(() => {
      const curToken = storage.getToken();
      if (curToken && isTokenExpired(curToken)) {
        triggerTokenExpiredRedirect("Your session has expired. Please log in again.");
      }
    }, 30000);

    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    const result = await authService.login(credentials);

    if (result.success) {
      setUser(result.user);
      setToken(result.token);
    }
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const userRole =
    user?.role ||
    (user?.isSuperAdmin ? "super-admin" : user?.isAdmin ? "admin" : "user");

  const value = {
    user,
    token,
    role: userRole,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
    authService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
