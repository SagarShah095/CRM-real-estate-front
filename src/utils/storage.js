import Cookies from "js-cookie";

/**
 * Safe Local Storage & Cookie Utility Helpers for Next.js SSR & Browser Client
 */

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

export const storage = {
  /**
   * Retrieve token (Primary: Browser Cookie via js-cookie, Fallback: LocalStorage)
   */
  getToken: () => {
    if (typeof window === "undefined") return null;
    try {
      const cookieToken =
        Cookies.get(TOKEN_KEY) ||
        Cookies.get("access_token") ||
        Cookies.get("auth_token") ||
        Cookies.get("userSession");

      if (cookieToken) return cookieToken;

      const value =
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("userSession");
      if (!value) return null;

      if (typeof value === "string" && value.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(value);
          return parsed.token || parsed.accessToken || value;
        } catch {
          return value;
        }
      }
      return value;
    } catch {
      return null;
    }
  },

  /**
   * Store token (Primary: Browser Cookie, Sync: LocalStorage)
   */
  setToken: (token) => {
    if (typeof window === "undefined") return;
    try {
      if (token) {
        let tokenStr = token;
        if (typeof token === "object" && token !== null) {
          tokenStr =
            token.token ||
            token.accessToken ||
            token.tokens?.accessToken ||
            token.data?.token ||
            token.data?.accessToken ||
            token.data?.tokens?.accessToken ||
            token;
          if (typeof tokenStr === "object") {
            try {
              tokenStr = JSON.stringify(tokenStr);
            } catch {
              tokenStr = String(tokenStr);
            }
          }
        } else if (typeof token === "string" && token.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(token);
            tokenStr =
              parsed.token ||
              parsed.accessToken ||
              parsed.tokens?.accessToken ||
              token;
          } catch {
            tokenStr = token;
          }
        }

        if (typeof tokenStr !== "string") {
          tokenStr = String(tokenStr);
        }

        // Store in cookies (7 days expiry, SameSite Lax)
        Cookies.set(TOKEN_KEY, tokenStr, { expires: 7, path: "/", sameSite: "Lax" });
        Cookies.set("access_token", tokenStr, { expires: 7, path: "/", sameSite: "Lax" });
        Cookies.set("auth_token", tokenStr, { expires: 7, path: "/", sameSite: "Lax" });

        // Sync with LocalStorage
        localStorage.setItem(TOKEN_KEY, tokenStr);
      } else {
        storage.removeToken();
      }
    } catch (error) {
      console.error("Error setting token:", error);
    }
  },

  /**
   * Remove token from cookies & LocalStorage
   */
  removeToken: () => {
    if (typeof window === "undefined") return;
    try {
      Cookies.remove(TOKEN_KEY, { path: "/" });
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("auth_token", { path: "/" });
      Cookies.remove("userSession", { path: "/" });

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userSession");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  getUser: () => {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    if (typeof window === "undefined") return;
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.error("Error setting user in localStorage:", error);
    }
  },

  removeUser: () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error removing user from localStorage:", error);
    }
  },

  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
  },
};
