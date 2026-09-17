"use client";

import { useAuthContext } from "@/context/AuthContext";

/**
 * Custom React Hook for easy access to AuthContext
 */
export function useAuth() {
  return useAuthContext();
}
