import { storage } from "@/utils/storage";

let isRedirecting = false;

/**
 * Checks whether a given JWT or auth token is expired.
 * Safely decodes base64 payload if it's a JWT.
 * Returns false if it's not a standard JWT (delegating verification to backend).
 *
 * @param {string} token
 * @returns {boolean} True if token is expired, false otherwise.
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;

  try {
    const parts = token.split(".");
    // Standard JWT has 3 parts: header.payload.signature
    if (parts.length !== 3) {
      return false;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) {
      return false;
    }

    // Add a 5-second buffer to proactively catch expiring tokens
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= currentTimeSeconds + 5;
  } catch (err) {
    console.warn("[Token Check] Unable to parse token payload:", err);
    return false;
  }
}

/**
 * Safely decodes token payload without validation
 */
export function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Clears stored authentication data and redirects the user to /login
 * with an expired flag and the previous URL as redirect target.
 *
 * @param {string} reason Optional message
 * @param {string} fallbackPath Path to redirect to after re-login
 */
export function triggerTokenExpiredRedirect(
  reason = "Your session has expired. Please log in again.",
  fallbackPath = null
) {
  if (typeof window === "undefined") return;

  // Prevent duplicate redirect execution loops
  if (isRedirecting) return;

  const currentPath = window.location.pathname;

  // Skip if user is already on auth entry pages
  if (
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/forgot-password") ||
    currentPath.startsWith("/reset-password")
  ) {
    return;
  }

  isRedirecting = true;

  // Clear all local auth credentials immediately
  storage.clearAuth();

  // Dispatch custom window event for reactive React contexts
  try {
    window.dispatchEvent(
      new CustomEvent("auth:expired", {
        detail: { reason, timestamp: Date.now() },
      })
    );
  } catch (e) {
    // Fallback for older browsers
    window.dispatchEvent(new Event("auth:expired"));
  }

  const returnPath =
    fallbackPath ||
    currentPath + (window.location.search || "");
  const encodedRedirect = encodeURIComponent(returnPath);

  // Full browser navigation ensures complete reset of in-memory states and React Query cache
  window.location.href = `/login?expired=true&redirect=${encodedRedirect}`;
}
