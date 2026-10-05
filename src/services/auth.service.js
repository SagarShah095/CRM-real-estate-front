import axios from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";
import { parseApiError } from "@/utils/errorHandler";

const AUTH_ENDPOINTS = API_ENDPOINTS.AUTH || {
  LOGIN: "/api/v1/auth/login",
  FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
  RESET_PASSWORD: "/api/v1/auth/reset-password",
};

/**
 * Raw Login API Call
 */
export const login = async (data) => {
  try {
    const payload = data?.data || data;
    const res = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, payload, {
      withCredentials: true,
    });
    if (res?.data?.success) {
      const token =
        res.data.data?.token ||
        res.data.token ||
        res.data.data?.accessToken ||
        res.data.accessToken ||
        res.data.data?.tokens?.accessToken ||
        res.data.tokens?.accessToken;
      const user = res.data.data?.user || res.data.user;

      if (token) storage.setToken(token);
      if (user) storage.setUser(user);
      return res.data;
    }
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Login failed",
      }
    );
  }
};

/**
 * Raw Forgot Password API Call
 */
export const forgotPassword = async (data) => {
  try {
    const payload = data?.data || data;
    const res = await axios.post(
      `${API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`,
      payload,
      { withCredentials: true },
    );
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Forgot password request failed",
      }
    );
  }
};

/**
 * Raw Reset Password API Call
 */
export const resetPassword = async (data) => {
  try {
    const payload = data?.data || data;
    const res = await axios.post(
      `${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`,
      payload,
      { withCredentials: true },
    );
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Reset password request failed",
      }
    );
  }
};

/**
 * Authentication Service Module
 * Handles all API calls for Login, Forgot Password, Reset Password, and Role Redirection logic.
 */
export const authService = {
  login: async ({ email, password }) => {
    try {
      const response = await login({ email, password });

      if (response?.success) {
        const data = response?.data || response;
        const token =
          data?.tokens?.accessToken ||
          data?.token ||
          data?.accessToken ||
          response?.tokens?.accessToken ||
          response?.token ||
          response?.accessToken;
        const user = data?.user || response?.user || data;

        const role =
          user?.role ||
          data?.role ||
          data?.portal ||
          response?.role ||
          (user?.isSuperAdmin
            ? "super-admin"
            : user?.isAdmin
              ? "admin"
              : "user");

        if (token) {
          storage.setToken(token);
        }
        if (user) {
          storage.setUser(user);
        }

        const redirectPath = authService.getRoleRedirectPath(role);

        return {
          success: true,
          user,
          token,
          role,
          redirectPath,
          rawResponse: response,
        };
      }

      return {
        success: false,
        error: parseApiError(response),
      };
    } catch (error) {
      console.error("[authService.login Error]:", error);
      return {
        success: false,
        error: parseApiError(error),
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      const response = await forgotPassword({ email });

      if (response?.success !== false && !response?.error) {
        return {
          success: true,
          message:
            response?.message ||
            "If that email exists, a password reset link has been dispatched.",
          data: response?.data || null,
        };
      }

      return {
        success: false,
        error: parseApiError(response),
      };
    } catch (error) {
      console.error("[authService.forgotPassword Error]:", error);
      return {
        success: false,
        error: parseApiError(error),
      };
    }
  },

  resetPassword: async ({ token, newPassword }) => {
    try {
      const response = await resetPassword({ token, newPassword });

      if (response?.success !== false && !response?.error) {
        return {
          success: true,
          message:
            response?.message ||
            "Password has been reset successfully. You can now log in.",
          data: response?.data || null,
        };
      }

      return {
        success: false,
        error: parseApiError(response),
      };
    } catch (error) {
      console.error("[authService.resetPassword Error]:", error);
      return {
        success: false,
        error: parseApiError(error),
      };
    }
  },

  getRoleRedirectPath: (role) => {
    if (!role) return "/login";
    const normalizedRole = String(role).toLowerCase().trim().replace(/_/g, "-");

    if (
      normalizedRole === "super-admin" ||
      normalizedRole === "superadmin" ||
      normalizedRole === "super_admin"
    ) {
      return "/super-admin/dashboard";
    }

    if (
      normalizedRole === "admin" ||
      normalizedRole === "administrator" ||
      normalizedRole === "tenant-admin" ||
      normalizedRole === "sub-admin" ||
      normalizedRole === "sub_admin"
    ) {
      return "/admin/dashboard";
    }

    return "/dashboard";
  },

  logout: () => {
    storage.clearAuth();
  },
};

export default authService;
