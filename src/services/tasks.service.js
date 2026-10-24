import axios, { getAuthHeaders } from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";

const TASKS_ENDPOINT = API_ENDPOINTS.TASKS || "/api/v1/tasks";

/**
 * Tasks Service Module
 * Handles API calls for Tasks & Follow-up Activities management (/api/v1/tasks).
 */

/**
 * Fetch All Tasks API Call
 * GET /api/v1/tasks
 *
 * Supported query parameters:
 * - page: number (default: 1)
 * - pageSize: number (default: 20)
 * - projectId: string
 * - activityType: string (e.g. "call,meeting" or "call")
 * - dateRange: "today" | "yesterday" | "tomorrow" | "this_week" | "next_week" | "this_month" | "last_month" | "custom"
 * - startDate: string
 * - endDate: string
 * - preSalesAgentId: string
 * - team: string
 * - assignedTo: string
 * - assignedBy: string
 * - status: string
 * - entityType: string
 * - category: string
 * - search: string
 * - sortBy: string (default: "dueDate")
 * - sortOrder: "asc" | "desc" (default: "desc")
 *
 * @param {Object|string} paramsOrToken Query parameters or Bearer token
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const getTasks = async (paramsOrToken = {}, token = null) => {
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
        val !== "All Types" &&
        val !== "All Projects" &&
        val !== "All Agents"
      ) {
        cleanParams[key] = val;
      }
    });

    // Ensure default pagination & sorting if not explicitly specified
    if (!cleanParams.page) cleanParams.page = 1;
    if (!cleanParams.pageSize) cleanParams.pageSize = 20;
    if (!cleanParams.sortBy) cleanParams.sortBy = "dueDate";
    if (!cleanParams.sortOrder) cleanParams.sortOrder = "desc";

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}`, {
        params: cleanParams,
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (primaryErr) {
      if (primaryErr.response?.status === 404) {
        // Fallback endpoint checks
        try {
          const res2 = await axios.get(`${API_BASE_URL}/api/v1/task`, {
            params: cleanParams,
            withCredentials: true,
            headers,
          });
          return res2.data;
        } catch (e2) {
          const res3 = await axios.get(`${API_BASE_URL}/api/v1/admin/tasks`, {
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
          "Failed to fetch tasks",
      }
    );
  }
};

/**
 * Create New Task API Call
 * POST /api/v1/tasks
 *
 * Expected payload:
 * {
 *   activityType: "call",
 *   assignedTo: "usr-emp-01",
 *   leadId: "ld-0110201",
 *   title: "Call at Sep 26, 2026, 3:30 PM",
 *   remark: "Call client to discuss 3 BHK luxury layout and pricing",
 *   remindMe: true,
 *   isCompleted: false,
 *   dueDate: "2026-09-26T15:30:00.000Z",
 *   reminderTime: "15 Minute",
 *   reminderMinutesBefore: 15,
 *   projectId: "proj-skyline-01",
 *   entityType: "lead",
 *   team: "Sales",
 *   category: "Residential",
 *   stage: "site_visit_scheduled",
 *   preSalesAgentId: "usr-admin-01",
 *   priority: "high"
 * }
 *
 * @param {Object} data Task payload
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const createTask = async (data, token = null) => {
  try {
    const rawPayload = data?.data || data;
    const authToken = token || data?.token || storage.getToken();

    const payload = {
      activityType: rawPayload.activityType || "call",
      assignedTo: rawPayload.assignedTo || "",
      leadId: rawPayload.leadId || "",
      title: rawPayload.title || "",
      remark: rawPayload.remark || "",
      remindMe:
        typeof rawPayload.remindMe === "boolean" ? rawPayload.remindMe : true,
      isCompleted:
        typeof rawPayload.isCompleted === "boolean"
          ? rawPayload.isCompleted
          : false,
      dueDate: rawPayload.dueDate || new Date().toISOString(),
      reminderTime: rawPayload.reminderTime || "15 Minute",
      reminderMinutesBefore:
        Number(rawPayload.reminderMinutesBefore ?? 15),
      projectId: rawPayload.projectId || "",
      entityType: rawPayload.entityType || "lead",
      team: rawPayload.team || "Sales",
      category: rawPayload.category || "Residential",
      stage: rawPayload.stage || "site_visit_scheduled",
      preSalesAgentId: rawPayload.preSalesAgentId || "",
      priority: rawPayload.priority || "high",
    };

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${TASKS_ENDPOINT}`, payload, {
        withCredentials: true,
        headers,
      });
      return res.data;
    } catch (primaryErr) {
      if (primaryErr.response?.status === 404) {
        try {
          const res2 = await axios.post(
            `${API_BASE_URL}/api/v1/task`,
            payload,
            { withCredentials: true, headers }
          );
          return res2.data;
        } catch (e2) {
          const res3 = await axios.post(
            `${API_BASE_URL}/api/v1/admin/tasks`,
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
          "Failed to create task",
      }
    );
  }
};

/**
 * Fetch Single Task By ID
 * GET /api/v1/tasks/:id
 */
export const getTaskById = async (id, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}/${id}`, {
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
          "Failed to fetch task details",
      }
    );
  }
};

/**
 * Update Task API Call
 * PUT /api/v1/tasks/:id
 */
export const updateTask = async (id, data, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.put(
        `${API_BASE_URL}${TASKS_ENDPOINT}/${id}`,
        data,
        { withCredentials: true, headers }
      );
      return res.data;
    } catch (putErr) {
      if (putErr.response?.status === 404 || putErr.response?.status === 405) {
        const patchRes = await axios.patch(
          `${API_BASE_URL}${TASKS_ENDPOINT}/${id}`,
          data,
          { withCredentials: true, headers }
        );
        return patchRes.data;
      }
      throw putErr;
    }
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update task",
      }
    );
  }
};

/**
 * Delete Task API Call
 * DELETE /api/v1/tasks/:id
 */
export const deleteTask = async (id, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const res = await axios.delete(`${API_BASE_URL}${TASKS_ENDPOINT}/${id}`, {
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
          "Failed to delete task",
      }
    );
  }
};

export const tasksService = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};

export default tasksService;
