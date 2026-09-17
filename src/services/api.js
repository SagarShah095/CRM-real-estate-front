import { API_BASE_URL, API_CONFIG } from "@/config/api.config";
import { storage } from "@/utils/storage";

/**
 * Core HTTP API Fetch Client
 * Uses try...catch method for error handling across all backend API calls.
 * Automatically appends Base URL, JSON headers, and Auth Bearer tokens when available.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const token = storage.getToken();

  const headers = {
    ...API_CONFIG.HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout || API_CONFIG.TIMEOUT
  );

  try {
    const config = {
      ...options,
      headers,
      signal: controller.signal,
    };

    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
        data?.error ||
        `HTTP Error ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Log for debugging
    console.error(`[API Fetch Error] ${options.method || "GET"} ${url}:`, error);

    // Format error message for callers if needed
    if (error.name === "AbortError") {
      throw new Error("Server request timed out. Please try again.");
    }

    throw error;
  }
}
