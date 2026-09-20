import { API_BASE_URL, API_CONFIG } from "@/config/api.config";
import { storage } from "@/utils/storage";
import axios from "axios";
import Cookies from "js-cookie";

/**
 * Configure Axios defaults globally to send and receive cookies on all API requests.
 */
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

/**
 * Helper to retrieve Bearer token headers from cookies or client storage
 */
const getAuthHeaders = () => {
  const token = storage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Core HTTP API Fetch Client using Axios with withCredentials: true
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const method = (options.method || "GET").toUpperCase();
  const headers = {
    ...API_CONFIG.HEADERS,
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  const payload = options.body || options.data;
  const config = {
    headers,
    withCredentials: true,
    timeout: options.timeout || API_CONFIG.TIMEOUT,
  };

  try {
    let res;
    if (method === "POST") {
      res = await axios.post(url, payload, config);
    } else if (method === "PUT") {
      res = await axios.put(url, payload, config);
    } else if (method === "PATCH") {
      res = await axios.patch(url, payload, config);
    } else if (method === "DELETE") {
      res = await axios.delete(url, config);
    } else {
      res = await axios.get(url, config);
    }
    return res.data;
  } catch (error) {
    console.error(`[API Fetch Error] ${method} ${url}:`, error);
    return (
      error.response?.data || {
        success: false,
        message: error.message || "An unexpected error occurred",
      }
    );
  }
}

/**
 * Login API Call
 */
export const login = async (data) => {
  try {
    const payload = data?.data || data;
    const res = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, payload, {
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
 * Forgot Password API Call
 */
export const forgotPassword = async (data) => {
  try {
    const payload = data?.data || data;
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/forgot-password`,
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
 * Reset Password API Call
 */
export const resetPassword = async (data) => {
  try {
    const payload = data?.data || data;
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/reset-password`,
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
 * Get All Admins / Tenants API Call (Super Admin)
 */
export const getAdmins = async (paramsOrToken = {}, token = null) => {
  try {
    let params = {};
    let authToken = null;

    if (typeof paramsOrToken === "string") {
      authToken = paramsOrToken;
    } else {
      params = paramsOrToken || {};
      authToken = token || storage.getToken();
    }

    if (!authToken) {
      authToken = storage.getToken();
    }

    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        val !== "All" &&
        val !== "All Plans" &&
        val !== "All Modules"
      ) {
        cleanParams[key] = val;
      }
    });

    const res = await axios.get(`${API_BASE_URL}/api/v1/admins`, {
      params: cleanParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to fetch admins",
      }
    );
  }
};

/**
 * Create Admin / Provision Tenant API Call (Super Admin)
 */
export const createAdmin = async (data, token) => {
  try {
    const payload = data?.data || data;
    const authToken = token || data?.token || storage.getToken();

    const res = await axios.post(`${API_BASE_URL}/api/v1/admins`, payload, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to create admin",
      }
    );
  }
};

/**
 * Update Admin / Tenant Status API Call (Super Admin)
 */
export const updateAdminStatus = async (id, status, token) => {
  const authToken = token || storage.getToken();

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.patch(
      `${API_BASE_URL}/api/v1/admins/${id}/status`,
      { status },
      { headers, withCredentials: true },
    );
    return res.data;
  } catch (patchErr) {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/admins/${id}/status`,
        { status },
        { headers, withCredentials: true },
      );
      return res.data;
    } catch (putErr) {
      return (
        patchErr.response?.data ||
        putErr.response?.data || {
          success: false,
          message: putErr.message || "Failed to update admin status",
        }
      );
    }
  }
};

/**
 * Update Admin / Tenant API Call (Super Admin)
 */
export const updateAdmin = async (id, data, token) => {
  const authToken = token || storage.getToken();
  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.put(`${API_BASE_URL}/api/v1/admins/${id}`, data, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (putErr) {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/admins/${id}`,
        data,
        { headers, withCredentials: true },
      );
      return res.data;
    } catch (patchErr) {
      return (
        putErr.response?.data ||
        patchErr.response?.data || {
          success: false,
          message: patchErr.message || "Failed to update admin",
        }
      );
    }
  }
};

/**
 * Delete Admin / Tenant API Call (Super Admin)
 */
export const deleteAdmin = async (id, token) => {
  try {
    const authToken = token || storage.getToken();
    const res = await axios.delete(`${API_BASE_URL}/api/v1/admins/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to delete admin",
      }
    );
  }
};
