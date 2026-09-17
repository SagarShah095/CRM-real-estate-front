"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/utils/storage";
import { authService } from "@/services/auth.service";

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
      setToken(savedToken);
    }
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
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
