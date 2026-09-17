/**
 * Safe local storage utility helpers for Next.js SSR & Browser Client
 */

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const storage = {
  getToken: () => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    if (typeof window === "undefined") return;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error("Error setting token in localStorage:", error);
    }
  },

  removeToken: () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing token from localStorage:", error);
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
