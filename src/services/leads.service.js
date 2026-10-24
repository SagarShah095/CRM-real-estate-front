import axios, { getAuthHeaders } from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";

const LEADS_ENDPOINT = API_ENDPOINTS.LEADS || "/api/v1/leads";

/**
 * Leads Service Module
 * Handles API calls for Leads management (/api/v1/leads).
 */

/**
 * Fetch All Leads API Call
 * GET /api/v1/leads
 */
export const getLeads = async (paramsOrToken = {}, token = null) => {
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
        val !== "All"
      ) {
        cleanParams[key] = val;
      }
    });

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.get(`${API_BASE_URL}${LEADS_ENDPOINT}`, {
        params: cleanParams,
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (primaryErr) {
      if (primaryErr.response?.status === 404) {
        try {
          const res2 = await axios.get(`${API_BASE_URL}/api/v1/lead`, {
            params: cleanParams,
            withCredentials: true,
            headers,
          });
          return res2.data;
        } catch (e2) {
          const res3 = await axios.get(`${API_BASE_URL}/api/v1/admin/leads`, {
            params: cleanParams,
            withCredentials: true,
            headers,
          });
          return res3.data;
        }
      }
      throw primaryErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch leads",
      }
    );
  }
};

/**
 * Create Lead API Call
 * POST /api/v1/leads
 */
export const createLead = async (data, token = null) => {
  try {
    const payload = data?.data || data;
    const authToken = token || data?.token || storage.getToken();

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${LEADS_ENDPOINT}`, payload, {
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (primaryErr) {
      if (primaryErr.response?.status === 404) {
        try {
          const res2 = await axios.post(`${API_BASE_URL}/api/v1/lead`, payload, {
            withCredentials: true,
            headers,
          });
          return res2.data;
        } catch (e2) {
          const res3 = await axios.post(
            `${API_BASE_URL}/api/v1/admin/leads`,
            payload,
            { withCredentials: true, headers }
          );
          return res3.data;
        }
      }
      throw primaryErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create lead",
      }
    );
  }
};

export const leadsService = {
  getLeads,
  createLead,
};

export default leadsService;
