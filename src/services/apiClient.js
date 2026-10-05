import axios from "axios";
import { API_BASE_URL, API_CONFIG } from "@/config/api.config";
import { storage } from "@/utils/storage";
import { isTokenExpired, triggerTokenExpiredRedirect } from "@/utils/token";

/**
 * Configure Axios defaults globally
 */
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

// Request interceptor: Inject Bearer token and check client-side expiry
axios.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      if (isTokenExpired(token)) {
        triggerTokenExpiredRedirect("Your session has expired. Please log in again.");
        return Promise.reject(new Error("Token expired"));
      }
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Detect 401 or token expired messages and trigger redirect
axios.interceptors.response.use(
  (response) => {
    if (response?.data && response.data.success === false) {
      const msg = String(
        response.data.message || response.data.error || ""
      ).toLowerCase();
      if (
        msg.includes("token expired") ||
        msg.includes("jwt expired") ||
        msg.includes("session expired") ||
        msg.includes("invalid token") ||
        msg.includes("jwt malformed") ||
        msg.includes("unauthorized")
      ) {
        triggerTokenExpiredRedirect("Your session has expired. Please log in again.");
      }
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const msg = String(
      data?.message || data?.error || error.message || ""
    ).toLowerCase();

    if (
      status === 401 ||
      (status === 403 &&
        (msg.includes("token") ||
          msg.includes("expired") ||
          msg.includes("unauthorized"))) ||
      msg.includes("token expired") ||
      msg.includes("jwt expired") ||
      msg.includes("session expired") ||
      msg.includes("invalid token") ||
      msg.includes("jwt malformed") ||
      msg.includes("token is not valid")
    ) {
      triggerTokenExpiredRedirect("Your session has expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to retrieve Bearer token headers from cookies or client storage
 */
export const getAuthHeaders = (explicitToken = null) => {
  const token = explicitToken || storage.getToken();
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
    ...getAuthHeaders(options.token),
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

export default axios;
