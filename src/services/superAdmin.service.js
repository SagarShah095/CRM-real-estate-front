import axios, { getAuthHeaders } from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";

const ADMINS_ENDPOINT = API_ENDPOINTS.ADMINS || "/api/v1/admins";

/**
 * Super Admin Service: Manage Admins / Tenants / Subscriptions
 */

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

    const res = await axios.get(`${API_BASE_URL}${ADMINS_ENDPOINT}`, {
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

    const res = await axios.post(`${API_BASE_URL}${ADMINS_ENDPOINT}`, payload, {
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
      `${API_BASE_URL}${ADMINS_ENDPOINT}/${id}/status`,
      { status },
      { headers, withCredentials: true },
    );
    return res.data;
  } catch (patchErr) {
    try {
      const res = await axios.put(
        `${API_BASE_URL}${ADMINS_ENDPOINT}/${id}/status`,
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
    const res = await axios.put(`${API_BASE_URL}${ADMINS_ENDPOINT}/${id}`, data, {
      headers,
      withCredentials: true,
    });
    return res.data;
  } catch (putErr) {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}${ADMINS_ENDPOINT}/${id}`,
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
    const res = await axios.delete(`${API_BASE_URL}${ADMINS_ENDPOINT}/${id}`, {
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

export const superAdminService = {
  getAdmins,
  createAdmin,
  updateAdminStatus,
  updateAdmin,
  deleteAdmin,
};
