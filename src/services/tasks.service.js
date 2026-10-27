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

    // Single GET API call: GET /api/v1/tasks
    const res = await axios.get(`${API_BASE_URL}${TASKS_ENDPOINT}`, {
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
      reminderMinutesBefore: Number(rawPayload.reminderMinutesBefore ?? 15),
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

    // Single POST API call: POST /api/v1/tasks
    const res = await axios.post(`${API_BASE_URL}${TASKS_ENDPOINT}`, payload, {
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
 * PATCH /api/v1/tasks/:id (or /tasks/:id)
 *
 * Supports partial or full task payload updates:
 * {
 *   title?: string,
 *   activityType?: string,
 *   dueDate?: string (ISO),
 *   status?: "pending" | "completed" | "in_progress" | "cancelled" | "overdue",
 *   isCompleted?: boolean,
 *   remark?: string,
 *   assignedTo?: string,
 *   preSalesAgentId?: string,
 *   projectId?: string,
 *   leadId?: string,
 *   priority?: string,
 *   category?: string,
 *   team?: string,
 *   stage?: string,
 *   remindMe?: boolean,
 *   reminderTime?: string,
 *   reminderMinutesBefore?: number
 * }
 *
 * @param {string|number|Object} id Task ID (e.g. "tsk-123" or "64f1...") or Task Object
 * @param {Object} data Partial or full task updates
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const updateTask = async (id, data = {}, token = null) => {
  try {
    const rawPayload = data?.data || data || {};
    const authToken = token || data?.token || storage.getToken();

    // Sanitize ID
    const cleanId = String(
      typeof id === "object" && id !== null
        ? id.id || id._id || id.taskId
        : id || "",
    )
      .replace(/^.*\/tasks\//, "")
      .trim();

    if (!cleanId) {
      return {
        success: false,
        message: "A valid Task ID is required to update the task.",
      };
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    // Construct cleaned payload (strip undefined while preserving false, null, 0, "")
    const payload = {};
    Object.keys(rawPayload).forEach((key) => {
      if (rawPayload[key] !== undefined) {
        payload[key] = rawPayload[key];
      }
    });

    // If dueDate is a Date object or valid date string, ensure ISO format
    if (payload.dueDate) {
      try {
        const d = new Date(payload.dueDate);
        if (!isNaN(d.getTime())) {
          payload.dueDate = d.toISOString();
        }
      } catch (_) {}
    }

    // Keep isCompleted and status in sync if one is provided
    if (
      typeof payload.isCompleted === "boolean" &&
      payload.status === undefined
    ) {
      payload.status = payload.isCompleted ? "completed" : "pending";
    } else if (payload.status && typeof payload.isCompleted !== "boolean") {
      if (payload.status.toLowerCase() === "completed") {
        payload.isCompleted = true;
      } else if (payload.status.toLowerCase() === "pending") {
        payload.isCompleted = false;
      }
    }

    // Primary PATCH API call: PATCH /api/v1/tasks/:id
    const targetUrl = `${API_BASE_URL}${TASKS_ENDPOINT}/${cleanId}`;
    let res;

    try {
      res = await axios.patch(targetUrl, payload, {
        withCredentials: true,
        headers,
      });
    } catch (patchErr) {
      // If /api/v1/tasks/:id returns 404, fallback to /tasks/:id endpoint
      if (patchErr.response?.status === 404 && TASKS_ENDPOINT !== "/tasks") {
        try {
          res = await axios.patch(`${API_BASE_URL}/tasks/${cleanId}`, payload, {
            withCredentials: true,
            headers,
          });
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      } else {
        throw patchErr;
      }
    }

    return res.data;
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
 * Alias for updateTask using PATCH
 */
export const patchTask = updateTask;

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
  patchTask,
  deleteTask,
};

export default tasksService;
