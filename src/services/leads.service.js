import axios from "./apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { storage } from "@/utils/storage";

const LEADS_ENDPOINT = API_ENDPOINTS.LEADS || "/api/v1/leads";

/**
 * Leads Service Module
 * Handles API calls for Leads management (/api/v1/leads and /leads).
 */

/**
 * Fetch All Leads API Call
 * GET /api/v1/leads (with fallback to /leads)
 *
 * @param {Object|string} paramsOrToken Query parameters or Bearer token
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
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
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "Content-Type": "application/json",
    };

    // Single GET API call - fetch leads from server
    const res = await axios.get(`${API_BASE_URL}${LEADS_ENDPOINT}`, {
      params: cleanParams,
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    const errorData = error.response?.data;
    return (
      errorData || {
        success: false,
        message:
          errorData?.message ||
          error.message ||
          "Failed to fetch leads from server",
        error: errorData?.error || error.message,
      }
    );
  }
};

/**
 * Create Lead API Call
 * POST /api/v1/leads (with fallback to /leads)
 *
 * Expected payload:
 * {
 *   "firstName": "Krishna",
 *   "lastName": "Sharma",
 *   "clientName": "Krishna Sharma",
 *   "contactNumber": "+91 9265684501",
 *   "contactNumbers": ["+91 9265684501"],
 *   "emails": ["krishna@example.com"],
 *   "preSalesAgent": "usr-emp-01",
 *   "salesAgent": "usr-emp-01",
 *   "coOwner": "usr-emp-02",
 *   "project": "Skyline Elegance",
 *   "leadSource": "housing.com",
 *   "source": "housing.com",
 *   "channelPartner": "usr-cp-01",
 *   "sourcingManager": "usr-admin-01",
 *   "remark": "Client requested Sunday afternoon 3 PM site visit.",
 *   "mode": "call",
 *   "approach": "direct",
 *   "budgetRange": "50L - 75L",
 *   "propertyType": "2 BHK"
 * }
 *
 * @param {Object} data Lead payload
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const createLead = async (data, token = null) => {
  try {
    const rawPayload = data?.data || data;
    const authToken = token || data?.token || storage.getToken();

    // Standardize body structure according to the requested API specification
    const firstName = rawPayload.firstName || "";
    const lastName = rawPayload.lastName || "";
    const clientName =
      rawPayload.clientName ||
      `${firstName} ${lastName}`.trim() ||
      "New Lead";

    const contactNumber =
      rawPayload.contactNumber ||
      (Array.isArray(rawPayload.contactNumbers) && rawPayload.contactNumbers[0]) ||
      rawPayload.mobile ||
      "";

    const contactNumbers =
      Array.isArray(rawPayload.contactNumbers) && rawPayload.contactNumbers.length > 0
        ? rawPayload.contactNumbers
        : contactNumber
        ? [contactNumber]
        : [];

    const email =
      rawPayload.email ||
      (Array.isArray(rawPayload.emails) && rawPayload.emails[0]) ||
      "";

    const emails =
      Array.isArray(rawPayload.emails) && rawPayload.emails.length > 0
        ? rawPayload.emails
        : email
        ? [email]
        : [];

    const payload = {
      firstName,
      lastName,
      clientName,
      contactNumber,
      contactNumbers,
      emails,
      preSalesAgent: rawPayload.preSalesAgent || "usr-emp-01",
      salesAgent: rawPayload.salesAgent || "usr-emp-01",
      coOwner: rawPayload.coOwner || "usr-emp-02",
      project: rawPayload.project || "Skyline Elegance",
      leadSource: rawPayload.leadSource || rawPayload.source || "housing.com",
      source: rawPayload.source || rawPayload.leadSource || "housing.com",
      channelPartner: rawPayload.channelPartner || "usr-cp-01",
      sourcingManager: rawPayload.sourcingManager || "usr-admin-01",
      remark: rawPayload.remark || rawPayload.remarks || "",
      mode: rawPayload.mode || "call",
      approach: rawPayload.approach || "direct",
      budgetRange: rawPayload.budgetRange || rawPayload.budget || "50L - 75L",
      propertyType: rawPayload.propertyType || "2 BHK",
      ...(rawPayload.stage ? { stage: rawPayload.stage } : {}),
      ...(rawPayload.status ? { status: rawPayload.status } : {}),
    };

    const headers = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "Content-Type": "application/json",
    };

    // Single POST API call - create lead once without fallback retries
    const res = await axios.post(`${API_BASE_URL}${LEADS_ENDPOINT}`, payload, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    const errorData = error.response?.data;
    return (
      errorData || {
        success: false,
        message:
          errorData?.message ||
          error.message ||
          "Failed to create lead on server",
        error: errorData?.error || error.message,
      }
    );
  }
};

export const updateLead = async (id, data, token = null) => {
  try {
    const rawPayload = data?.data || data || {};
    const authToken = token || data?.token || storage.getToken();

    const headers = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "Content-Type": "application/json",
    };

    // Standardize body structure for lead update
    const firstName = rawPayload.firstName || "";
    const lastName = rawPayload.lastName || "";
    const clientName =
      rawPayload.clientName ||
      `${firstName} ${lastName}`.trim() ||
      rawPayload.leadName ||
      "";

    const contactNumber =
      rawPayload.contactNumber ||
      (Array.isArray(rawPayload.contactNumbers) && rawPayload.contactNumbers[0]) ||
      rawPayload.mobile ||
      rawPayload.phone ||
      "";

    const contactNumbers =
      Array.isArray(rawPayload.contactNumbers) && rawPayload.contactNumbers.length > 0
        ? rawPayload.contactNumbers
        : contactNumber
        ? [contactNumber]
        : [];

    const email =
      rawPayload.email ||
      (Array.isArray(rawPayload.emails) && rawPayload.emails[0]) ||
      "";

    const emails =
      Array.isArray(rawPayload.emails) && rawPayload.emails.length > 0
        ? rawPayload.emails
        : email
        ? [email]
        : [];

    const payload = {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(clientName ? { clientName } : {}),
      ...(contactNumber ? { contactNumber } : {}),
      ...(contactNumbers.length ? { contactNumbers } : {}),
      ...(emails.length ? { emails } : {}),
      ...(rawPayload.preSalesAgent ? { preSalesAgent: rawPayload.preSalesAgent } : {}),
      ...(rawPayload.salesAgent ? { salesAgent: rawPayload.salesAgent } : {}),
      ...(rawPayload.coOwner ? { coOwner: rawPayload.coOwner } : {}),
      ...(rawPayload.project ? { project: rawPayload.project } : {}),
      ...(rawPayload.leadSource || rawPayload.source
        ? {
            leadSource: rawPayload.leadSource || rawPayload.source,
            source: rawPayload.source || rawPayload.leadSource,
          }
        : {}),
      ...(rawPayload.channelPartner ? { channelPartner: rawPayload.channelPartner } : {}),
      ...(rawPayload.sourcingManager ? { sourcingManager: rawPayload.sourcingManager } : {}),
      ...(rawPayload.remark !== undefined || rawPayload.remarks !== undefined
        ? { remark: rawPayload.remark ?? rawPayload.remarks }
        : {}),
      ...(rawPayload.mode ? { mode: rawPayload.mode } : {}),
      ...(rawPayload.approach ? { approach: rawPayload.approach } : {}),
      ...(rawPayload.budgetRange || rawPayload.budget
        ? { budgetRange: rawPayload.budgetRange || rawPayload.budget }
        : {}),
      ...(rawPayload.propertyType ? { propertyType: rawPayload.propertyType } : {}),
    };

    // Single PUT API call: PUT /api/v1/leads/${id}
    // Strictly NO patch calls, NO secondary PUT fallbacks. Called only one time.
    const res = await axios.put(`${API_BASE_URL}${LEADS_ENDPOINT}/${id}`, payload, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    const errorData = error.response?.data;
    return (
      errorData || {
        success: false,
        message:
          errorData?.message ||
          error.message ||
          "Failed to update lead on server",
        error: errorData?.error || error.message,
      }
    );
  }
};

/**
 * Single Delete Lead API Call
 * DELETE /leads/:id (with fallback to /api/v1/leads/:id)
 *
 * @param {string} id Lead ID
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const deleteLead = async (id, token = null) => {
  try {
    const authToken = token || storage.getToken();
    const headers = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "Content-Type": "application/json",
    };

    // Single DELETE API call: DELETE /api/v1/leads/${id}
    const res = await axios.delete(`${API_BASE_URL}${LEADS_ENDPOINT}/${id}`, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    const errorData = error.response?.data;
    return (
      errorData || {
        success: false,
        message:
          errorData?.message ||
          error.message ||
          "Failed to delete lead from server",
        error: errorData?.error || error.message,
      }
    );
  }
};

/**
 * Bulk Delete Leads API Call
 * POST /leads/bulk-delete
 * Body: { "ids": ["id1", "id2"] }
 *
 * @param {string[]|{ids: string[]}} idsOrPayload Array of lead IDs or object { ids }
 * @param {string|null} token Optional Bearer token
 * @returns {Promise<Object>} API Response
 */
export const bulkDeleteLeads = async (idsOrPayload, token = null) => {
  try {
    const ids = Array.isArray(idsOrPayload)
      ? idsOrPayload
      : idsOrPayload?.ids || [];

    const payload = { ids };
    const authToken = token || idsOrPayload?.token || storage.getToken();

    const headers = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      "Content-Type": "application/json",
    };

    // Single POST API call: POST /api/v1/leads/bulk-delete
    const res = await axios.post(`${API_BASE_URL}${LEADS_ENDPOINT}/bulk-delete`, payload, {
      withCredentials: true,
      headers,
    });
    return res.data;
  } catch (error) {
    const errorData = error.response?.data;
    return (
      errorData || {
        success: false,
        message:
          errorData?.message ||
          error.message ||
          "Failed to bulk delete leads from server",
        error: errorData?.error || error.message,
      }
    );
  }
};

export const leadsService = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  bulkDeleteLeads,
};

export default leadsService;
