/**
 * Application API Configuration
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://crm-real-estate-backend.onrender.com";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },
};

export const API_CONFIG = {
  TIMEOUT: 15000, // 15 seconds
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
