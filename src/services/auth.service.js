import { apiFetch } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";
import { parseApiError } from "@/utils/errorHandler";

/**
 * Authentication Service Module
 * Handles all API calls for Login, Forgot Password, Reset Password, and Role Redirection logic.
 */
export const authService = {
  /**
   * Login API call
   * @param {Object} credentials { email, password }
   * @returns {Promise<Object>} { user, token, role, redirectPath }
   */
  login: async ({ email, password }) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        body: { email, password },
      });

      // Extract token and user details from backend response format
      // Support various common backend payload structures (data.token, token, data.accessToken, etc.)
      const data = response?.data || response;
      const token = data?.token || data?.accessToken || response?.token || response?.accessToken;
      const user = data?.user || response?.user || data;
      
      // Determine role from user object or top level
      const role =
        user?.role ||
        data?.role ||
        response?.role ||
        (user?.isSuperAdmin ? "super-admin" : user?.isAdmin ? "admin" : "user");

      // Save session into storage
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
    } catch (error) {
      console.error("[authService.login Error]:", error);
      return {
        success: false,
        error: parseApiError(error),
      };
    }
  },

  /**
   * Forgot Password API call
   * @param {Object} payload { email }
   * @returns {Promise<Object>} { success, message, data }
   */
  forgotPassword: async ({ email }) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: "POST",
        body: { email },
      });

      return {
        success: response?.success !== false,
        message:
          response?.message ||
          "If that email exists, a password reset link has been dispatched.",
        data: response?.data || null,
      };
    } catch (error) {
      console.error("[authService.forgotPassword Error]:", error);
      return {
        success: false,
        error: parseApiError(error),
      };
    }
  },

  /**
   * Reset Password API call
   * @param {Object} payload { token, newPassword }
   * @returns {Promise<Object>} { success, message, data }
   */
  resetPassword: async ({ token, newPassword }) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: "POST",
        body: { token, newPassword },
      });

      return {
        success: response?.success !== false,
        message:
          response?.message ||
          "Password has been reset successfully. You can now log in.",
        data: response?.data || null,
      };
    } catch (error) {
      console.error("[authService.resetPassword Error]:", error);
      return {
        success: false,
        error: parseApiError(error),
      };
    }
  },

  /**
   * Resolves the navigation route according to user role.
   * @param {string} role 
   * @returns {string} Route path
   */
  getRoleRedirectPath: (role) => {
    if (!role) return "/dashboard";
    const normalizedRole = String(role).toLowerCase().trim().replace(/_/g, "-");

    if (
      normalizedRole === "super-admin" ||
      normalizedRole === "superadmin" ||
      normalizedRole === "super_admin"
    ) {
      return "/super-admin";
    }

    if (normalizedRole === "admin") {
      return "/admin";
    }

    return "/dashboard";
  },

  /**
   * Logout helper
   */
  logout: () => {
    storage.clearAuth();
  },
};
