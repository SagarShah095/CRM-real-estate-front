import axios, { getAuthHeaders } from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";

const USERS_ENDPOINT = API_ENDPOINTS.USERS || "/api/v1/users";

/**
 * Admin Users Service: Manage Users, Agents, and Teams
 */

/**
 * Fetch Users List API Call
 * GET /api/v1/users (with fallbacks if 404)
 */
export const getUsers = async (paramsOrToken = {}, token = null) => {
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
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        cleanParams[key] = val;
      }
    });

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.get(`${API_BASE_URL}${USERS_ENDPOINT}`, {
        params: cleanParams,
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (usersErr) {
      if (usersErr.response?.status === 404) {
        try {
          const res2 = await axios.get(`${API_BASE_URL}/api/v1/admin/user`, {
            params: cleanParams,
            withCredentials: true,
            headers,
          });
          return res2.data;
        } catch (e2) {
          const res3 = await axios.get(`${API_BASE_URL}/api/v1/admin/users`, {
            params: cleanParams,
            withCredentials: true,
            headers,
          });
          return res3.data;
        }
      }
      throw usersErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch users",
      }
    );
  }
};

/**
 * Create User API Call (Admin Only)
 * POST /api/v1/users (with fallback to /api/v1/admin/user if 404)
 */
export const createUser = async (data, token) => {
  try {
    const payload = data?.data || data;
    const authToken = token || data?.token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${USERS_ENDPOINT}`, payload, {
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (usersErr) {
      if (usersErr.response?.status === 404) {
        try {
          const res2 = await axios.post(
            `${API_BASE_URL}/api/v1/admin/user`,
            payload,
            { withCredentials: true, headers },
          );
          return res2.data;
        } catch (e2) {
          const res3 = await axios.post(
            `${API_BASE_URL}/api/v1/admin/users`,
            payload,
            { withCredentials: true, headers },
          );
          return res3.data;
        }
      }
      throw usersErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create user",
      }
    );
  }
};

/**
 * Update User API Call
 * PUT /api/v1/users/:id
 */
export const updateUser = async (id, data, token) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    try {
      const res = await axios.put(`${API_BASE_URL}${USERS_ENDPOINT}/${id}`, data, {
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (usersErr) {
      if (usersErr.response?.status === 404) {
        try {
          const res2 = await axios.put(
            `${API_BASE_URL}/api/v1/admin/user/${id}`,
            data,
            { withCredentials: true, headers },
          );
          return res2.data;
        } catch (e2) {
          const res3 = await axios.put(
            `${API_BASE_URL}/api/v1/admin/users/${id}`,
            data,
            { withCredentials: true, headers },
          );
          return res3.data;
        }
      }
      throw usersErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update user",
      }
    );
  }
};

/**
 * Delete User API Call
 * DELETE /api/v1/users/:id
 */
export const deleteUser = async (id, token) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    try {
      const res = await axios.delete(`${API_BASE_URL}${USERS_ENDPOINT}/${id}`, {
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (usersErr) {
      if (usersErr.response?.status === 404) {
        try {
          const res2 = await axios.delete(
            `${API_BASE_URL}/api/v1/admin/user/${id}`,
            { withCredentials: true, headers },
          );
          return res2.data;
        } catch (e2) {
          const res3 = await axios.delete(
            `${API_BASE_URL}/api/v1/admin/users/${id}`,
            { withCredentials: true, headers },
          );
          return res3.data;
        }
      }
      throw usersErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete user",
      }
    );
  }
};

export const adminUsersService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
