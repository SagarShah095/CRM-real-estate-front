import axios, { getAuthHeaders } from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";

const PROJECTS_ENDPOINT = API_ENDPOINTS.PROJECTS || "/api/v1/projects";

/**
 * Projects Service Module
 * Handles all API calls for Real Estate Projects management (/api/v1/projects).
 */

/**
 * Fetch All Projects API Call
 * GET /api/v1/projects
 *
 * @param {Object|string} paramsOrToken Query filters (page, limit, status, projectType, etc.) or token
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const getProjects = async (paramsOrToken = {}, token = null) => {
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
        val !== "All Status" &&
        val !== "All Types"
      ) {
        cleanParams[key] = val;
      }
    });

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const res = await axios.get(`${API_BASE_URL}${PROJECTS_ENDPOINT}`, {
      params: cleanParams,
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch projects",
      }
    );
  }
};

/**
 * Create New Project API Call
 * POST /api/v1/projects
 *
 * Payload format:
 * {
 *   name: "Skyline Pinnacle",
 *   code: "SKPIN",
 *   projectType: "residential",
 *   status: "under_construction",
 *   location: { address, city, state, pincode, latitude, longitude },
 *   reraNumber: "PRM/KA/RERA/...",
 *   totalTowers: 3,
 *   totalUnits: 120,
 *   amenities: ["Swimming Pool", "Clubhouse", ...],
 *   towers: ["Tower A", "Tower B", ...],
 *   startDate: "2024-01-01",
 *   expectedCompletionDate: "2026-12-31",
 *   description: "..."
 * }
 *
 * @param {Object} data Project payload
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const createProject = async (data, token = null) => {
  try {
    const payload = data?.data || data;
    const authToken = token || data?.token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const res = await axios.post(`${API_BASE_URL}${PROJECTS_ENDPOINT}`, payload, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create project",
      }
    );
  }
};

/**
 * Get Single Project by ID
 * GET /api/v1/projects/:id
 */
export const getProjectById = async (id, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const res = await axios.get(`${API_BASE_URL}${PROJECTS_ENDPOINT}/${id}`, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch project details",
      }
    );
  }
};

/**
 * Update Project API Call
 * PUT /api/v1/projects/:id (fallback to PATCH)
 */
export const updateProject = async (id, data, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.put(`${API_BASE_URL}${PROJECTS_ENDPOINT}/${id}`, data, {
        headers,
        withCredentials: true,
      });
      return res.data;
    } catch (putErr) {
      const res2 = await axios.patch(
        `${API_BASE_URL}${PROJECTS_ENDPOINT}/${id}`,
        data,
        { headers, withCredentials: true }
      );
      return res2.data;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update project",
      }
    );
  }
};

/**
 * Delete Project API Call
 * DELETE /api/v1/projects/:id
 */
export const deleteProject = async (id, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const res = await axios.delete(`${API_BASE_URL}${PROJECTS_ENDPOINT}/${id}`, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete project",
      }
    );
  }
};

export const projectsService = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
