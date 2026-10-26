"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  Copy,
  Check,
  Briefcase,
  Users,
  Compass,
  FileText,
  Home,
  MessageSquare,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useCreateLeadMutation, useUpdateLeadMutation } from "@/hooks/useLeadsQuery";
import { useProjectsQuery } from "@/hooks/useProjectsQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { useAdminsQuery } from "@/hooks/useAdminsQuery";

const PRESET_PROJECTS = [
  "Skyline Elegance",
  "Shiv Pooja Heights",
  "Royal Palms Estate",
  "Emerald Towers",
  "Jigar Shah Park",
];

const PRESET_AGENTS = [
  { id: "usr-emp-01", name: "Jagdish Patel", role: "Sales Executive" },
  { id: "usr-emp-02", name: "Mahesh Chauhan", role: "Relationship Mgr" },
  { id: "usr-admin-01", name: "Aditi R.", role: "Pre-Sales Lead" },
  { id: "usr-cp-01", name: "Apex Realty Partners", role: "Channel Partner" },
];

const SAMPLE_LEAD_DATA = {
  firstName: "Krishna",
  lastName: "Sharma",
  clientName: "Krishna Sharma",
  contactNumber: "+91 9265684501",
  contactNumbers: ["+91 9265684501"],
  emails: ["krishna@example.com"],
  preSalesAgent: "usr-emp-01",
  salesAgent: "usr-emp-01",
  coOwner: "usr-emp-02",
  project: "Skyline Elegance",
  leadSource: "housing.com",
  source: "housing.com",
  channelPartner: "usr-cp-01",
  sourcingManager: "usr-admin-01",
  remark: "Client requested Sunday afternoon 3 PM site visit.",
  mode: "call",
  approach: "direct",
  budgetRange: "50L - 75L",
  propertyType: "2 BHK",
};

const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "SITE_VISIT_SCHEDULED",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const DEFAULT_CREATE_FORM_DATA = {
  firstName: "Krishna",
  lastName: "Sharma",
  clientName: "Krishna Sharma",
  contactNumber: "+91 9265684501",
  email: "krishna@example.com",
  preSalesAgent: "usr-emp-01",
  salesAgent: "usr-emp-01",
  coOwner: "usr-emp-02",
  project: "Skyline Elegance",
  source: "housing.com",
  leadSource: "housing.com",
  channelPartner: "usr-cp-01",
  sourcingManager: "usr-admin-01",
  remark: "Client requested Sunday afternoon 3 PM site visit.",
  mode: "call",
  approach: "direct",
  budgetRange: "50L - 75L",
  propertyType: "2 BHK",
  stage: "NEW",
  stageReason: "",
};

export default function CreateLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
  onLeadUpdated,
  lead = null,
  mode = "create",
}) {
  const isEditMode = mode === "edit" || Boolean(lead);
  const targetLead = lead?._raw || lead;
  const leadId =
    targetLead?.id ||
    targetLead?._id ||
    targetLead?.leadId ||
    "";

  const {
    data: projectsApiData,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useProjectsQuery({}, { enabled: Boolean(isOpen) });
  const { data: usersApiData, isLoading: isUsersLoading } = useUsersQuery(
    {},
    { enabled: Boolean(isOpen) },
  );
  const { data: adminsApiData, isLoading: isAdminsLoading } = useAdminsQuery(
    {},
    { enabled: Boolean(isOpen) },
  );
  const createLeadMutation = useCreateLeadMutation();
  const updateLeadMutation = useUpdateLeadMutation();

  // Extract real projects from GET /projects (or /api/v1/projects) API response
  const projectOptions = useMemo(() => {
    const list =
      projectsApiData?.data?.projects ||
      projectsApiData?.data?.data ||
      projectsApiData?.data ||
      projectsApiData?.projects ||
      (Array.isArray(projectsApiData) ? projectsApiData : []);

    if (Array.isArray(list) && list.length > 0) {
      return list.map((p) => {
        const name =
          p.name || p.projectName || p.title || p.code || "Unnamed Project";
        const id = p._id || p.id || p.code || name;
        return {
          id,
          name,
          code: p.code || "",
          projectType: p.projectType || p.type || "",
        };
      });
    }

    // Default preset projects ensuring smooth UX
    return [
      { id: "proj-skyline", name: "Skyline Elegance", code: "SKY-EL" },
      { id: "proj-shivpooja", name: "Shiv Pooja Heights", code: "SPH" },
      { id: "proj-royal", name: "Royal Palms Estate", code: "RPE" },
      { id: "proj-emerald", name: "Emerald Towers", code: "EMT" },
      { id: "proj-jigar", name: "Jigar Shah Park", code: "JSP" },
    ];
  }, [projectsApiData]);

  // Extract Employees, Admins, and Channel Partners dynamically from GET /users & /admins
  const { employeeOptions, adminOptions, channelPartnerOptions } = useMemo(() => {
    const rawUsers =
      usersApiData?.data?.users ||
      usersApiData?.data?.data ||
      usersApiData?.data ||
      usersApiData?.users ||
      (Array.isArray(usersApiData) ? usersApiData : []);

    const rawAdmins =
      adminsApiData?.data?.admins ||
      adminsApiData?.data?.data ||
      adminsApiData?.data ||
      adminsApiData?.admins ||
      (Array.isArray(adminsApiData) ? adminsApiData : []);

    const employees = [];
    const admins = [];
    const channelPartners = [];
    const seenIds = new Set();

    // 1. Process Users / Employees
    if (Array.isArray(rawUsers)) {
      rawUsers.forEach((u) => {
        const id = u.id || u._id || u.userId;
        if (!id || seenIds.has(String(id))) return;
        seenIds.add(String(id));

        const fn = u.firstName || "";
        const ln = u.lastName || "";
        const name =
          u.name ||
          (fn || ln ? `${fn} ${ln}`.trim() : null) ||
          u.userName ||
          u.email ||
          `Employee (${id})`;

        const rawRole = (u.role || u.designation || "Employee").toLowerCase();
        const roleLabel =
          u.designation ||
          (rawRole.includes("admin")
            ? "Admin"
            : rawRole.includes("channel")
            ? "Channel Partner"
            : rawRole.includes("pre_sales") || rawRole.includes("presales")
            ? "Pre-Sales Agent"
            : rawRole.includes("sales")
            ? "Sales Executive"
            : "Employee");

        const record = { id: String(id), name, role: roleLabel };

        if (rawRole.includes("channel")) {
          channelPartners.push(record);
        } else if (rawRole.includes("admin")) {
          admins.push(record);
        } else {
          employees.push(record);
        }
      });
    }

    // 2. Process Admins
    if (Array.isArray(rawAdmins)) {
      rawAdmins.forEach((a) => {
        const id = a.id || a._id || a.adminId;
        if (!id || seenIds.has(String(id))) return;
        seenIds.add(String(id));

        const fn = a.firstName || "";
        const ln = a.lastName || "";
        const name =
          a.name ||
          (fn || ln ? `${fn} ${ln}`.trim() : null) ||
          a.fullName ||
          a.email ||
          `Admin (${id})`;

        admins.push({
          id: String(id),
          name,
          role: a.role || a.designation || "Admin Lead",
        });
      });
    }

    // 3. Fallback standard presets to ensure mock/sample IDs ("usr-emp-01", "usr-emp-02", "usr-admin-01", "usr-cp-01") are always available
    const presetEmployees = [
      { id: "usr-emp-01", name: "Jagdish Patel", role: "Sales Executive" },
      { id: "usr-emp-02", name: "Mahesh Chauhan", role: "Relationship Mgr" },
      { id: "usr-emp-03", name: "Rahul Mehta", role: "Senior Sales Exec" },
    ];
    presetEmployees.forEach((pe) => {
      if (!seenIds.has(pe.id)) {
        seenIds.add(pe.id);
        employees.push(pe);
      }
    });

    const presetAdmins = [
      { id: "usr-admin-01", name: "Aditi R.", role: "Pre-Sales Lead / Admin" },
      { id: "usr-admin-02", name: "Vikram S.", role: "Sourcing Manager / Admin" },
    ];
    presetAdmins.forEach((pa) => {
      if (!seenIds.has(pa.id)) {
        seenIds.add(pa.id);
        admins.push(pa);
      }
    });

    const presetCPs = [
      { id: "usr-cp-01", name: "Apex Realty Partners", role: "Channel Partner Lead" },
      { id: "usr-cp-02", name: "Metro City Associates", role: "Channel Partner" },
    ];
    presetCPs.forEach((pcp) => {
      if (!seenIds.has(pcp.id)) {
        seenIds.add(pcp.id);
        channelPartners.push(pcp);
      }
    });

    return {
      employeeOptions: employees,
      adminOptions: admins,
      channelPartnerOptions: channelPartners,
    };
  }, [usersApiData, adminsApiData]);

  const [formData, setFormData] = useState(DEFAULT_CREATE_FORM_DATA);

  // Synchronize form state with lead data when opening in edit mode
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && targetLead) {
      const raw = targetLead;
      const fn =
        raw.firstName ||
        (raw.clientName ? raw.clientName.split(" ")[0] : "") ||
        "";
      const ln =
        raw.lastName ||
        (raw.clientName ? raw.clientName.split(" ").slice(1).join(" ") : "") ||
        "";
      const cName =
        raw.clientName ||
        `${fn} ${ln}`.trim() ||
        raw.leadName ||
        "";
      const contact =
        raw.contactNumber ||
        (Array.isArray(raw.contactNumbers) ? raw.contactNumbers[0] : null) ||
        raw.mobile ||
        raw.phone ||
        "";
      const mail =
        raw.email ||
        (Array.isArray(raw.emails) ? raw.emails[0] : null) ||
        "";

      setFormData({
        firstName: fn,
        lastName: ln,
        clientName: cName,
        contactNumber: contact,
        email: mail,
        preSalesAgent: raw.preSalesAgent || raw.preSalesAgentId || "usr-emp-01",
        salesAgent: raw.salesAgent || raw.salesAgentId || "usr-emp-01",
        coOwner: raw.coOwner || "usr-emp-02",
        project: raw.project || raw.projectName || "Skyline Elegance",
        source: raw.source || raw.leadSource || "housing.com",
        leadSource: raw.leadSource || raw.source || "housing.com",
        channelPartner: raw.channelPartner || "usr-cp-01",
        sourcingManager: raw.sourcingManager || "usr-admin-01",
        remark: raw.remark || raw.remarks || raw.stageReason || "",
        mode: raw.mode || "call",
        approach: raw.approach || "direct",
        budgetRange: raw.budgetRange || raw.budget || "50L - 75L",
        propertyType: raw.propertyType || "2 BHK",
        stage: (raw.stage || "NEW").toUpperCase(),
        stageReason: raw.stageReason || "",
      });
      setErrorMessage("");
      setSuccessMessage("");
    } else if (!isEditMode) {
      setFormData(DEFAULT_CREATE_FORM_DATA);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, isEditMode, targetLead]);

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'loading', message: string }
  const isSubmittingRef = useRef(false);

  const showToast = (type, message, duration = 4000) => {
    setToast({ type, message });
    if (duration > 0) {
      setTimeout(() => {
        setToast((curr) => (curr?.message === message ? null : curr));
      }, duration);
    }
  };

  // Construct real payload according to required JSON structure
  const currentPayload = useMemo(() => {
    const fn = (formData.firstName || "").trim();
    const ln = (formData.lastName || "").trim();
    const cName = formData.clientName?.trim() || `${fn} ${ln}`.trim() || "New Lead";
    const phone = formData.contactNumber?.trim() || "";
    const mail = formData.email?.trim() || "";

    return {
      firstName: fn,
      lastName: ln,
      clientName: cName,
      contactNumber: phone,
      contactNumbers: phone ? [phone] : [],
      emails: mail ? [mail] : [],
      preSalesAgent: formData.preSalesAgent || "usr-emp-01",
      salesAgent: formData.salesAgent || "usr-emp-01",
      coOwner: formData.coOwner || "usr-emp-02",
      project: formData.project || "Skyline Elegance",
      leadSource: formData.leadSource || formData.source || "housing.com",
      source: formData.source || formData.leadSource || "housing.com",
      channelPartner: formData.channelPartner || "usr-cp-01",
      sourcingManager: formData.sourcingManager || "usr-admin-01",
      remark: formData.remark || "",
      mode: formData.mode || "call",
      approach: formData.approach || "direct",
      budgetRange: formData.budgetRange || "50L - 75L",
      propertyType: formData.propertyType || "2 BHK",
      ...(!isEditMode && formData.stage ? { stage: formData.stage } : {}),
      ...(!isEditMode && formData.stageReason ? { stageReason: formData.stageReason } : {}),
    };
  }, [formData, isEditMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto sync clientName when firstName or lastName changes
      if (name === "firstName" || name === "lastName") {
        const fn = name === "firstName" ? value : prev.firstName;
        const ln = name === "lastName" ? value : prev.lastName;
        updated.clientName = `${fn || ""} ${ln || ""}`.trim();
      }
      // Auto sync source & leadSource
      if (name === "source") updated.leadSource = value;
      if (name === "leadSource") updated.source = value;
      return updated;
    });
    setErrorMessage("");
  };

  const handleFillSample = () => {
    if (isEditMode && targetLead) {
      const raw = targetLead;
      const fn =
        raw.firstName ||
        (raw.clientName ? raw.clientName.split(" ")[0] : "") ||
        "";
      const ln =
        raw.lastName ||
        (raw.clientName ? raw.clientName.split(" ").slice(1).join(" ") : "") ||
        "";
      setFormData({
        firstName: fn,
        lastName: ln,
        clientName: raw.clientName || `${fn} ${ln}`.trim() || raw.leadName || "",
        contactNumber:
          raw.contactNumber ||
          (Array.isArray(raw.contactNumbers) ? raw.contactNumbers[0] : null) ||
          raw.mobile ||
          "",
        email:
          raw.email ||
          (Array.isArray(raw.emails) ? raw.emails[0] : null) ||
          "",
        preSalesAgent: raw.preSalesAgent || raw.preSalesAgentId || "usr-emp-01",
        salesAgent: raw.salesAgent || raw.salesAgentId || "usr-emp-01",
        coOwner: raw.coOwner || "usr-emp-02",
        project: raw.project || raw.projectName || "Skyline Elegance",
        source: raw.source || raw.leadSource || "housing.com",
        leadSource: raw.leadSource || raw.source || "housing.com",
        channelPartner: raw.channelPartner || "usr-cp-01",
        sourcingManager: raw.sourcingManager || "usr-admin-01",
        remark: raw.remark || raw.remarks || raw.stageReason || "",
        mode: raw.mode || "call",
        approach: raw.approach || "direct",
        budgetRange: raw.budgetRange || raw.budget || "50L - 75L",
        propertyType: raw.propertyType || "2 BHK",
        stage: (raw.stage || "NEW").toUpperCase(),
        stageReason: raw.stageReason || "",
      });
      showToast("success", "Reset to original lead values!", 2000);
    } else {
      setFormData({
        ...SAMPLE_LEAD_DATA,
        email: SAMPLE_LEAD_DATA.emails[0] || "",
        stage: "NEW",
        stageReason: "",
      });
      showToast("success", "Sample lead details loaded!", 2500);
    }
    setErrorMessage("");
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
    setCopiedJson(true);
    showToast("success", "JSON payload copied to clipboard!", 2000);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      isSubmittingRef.current ||
      createLeadMutation.isPending ||
      updateLeadMutation.isPending
    )
      return;

    if (isEditMode && !leadId) {
      setErrorMessage("No valid Lead ID found for update.");
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage("");
    setSuccessMessage("");
    showToast(
      "loading",
      isEditMode
        ? `Calling PUT /leads/${leadId} to update...`
        : "Calling POST /leads to create...",
      0
    );

    try {
      if (isEditMode) {
        // Single PUT API call to update lead: PUT /api/v1/leads/:id
        const res = await updateLeadMutation.mutateAsync({
          id: leadId,
          data: currentPayload,
        });

        if (res && res.success === false) {
          const errMsg =
            res.message || res.error || "Failed to update lead on server";
          setErrorMessage(errMsg);
          showToast("error", errMsg);
          isSubmittingRef.current = false;
          return;
        }

        const clientName = currentPayload.clientName || "Lead";
        const successMsg = `Lead "${clientName}" updated successfully!`;
        setSuccessMessage(successMsg);
        showToast("success", successMsg);

        if (onLeadUpdated) {
          onLeadUpdated(
            res?.data?.lead || res?.data || { ...targetLead, ...currentPayload }
          );
        }

        setTimeout(() => {
          isSubmittingRef.current = false;
          onClose();
        }, 850);
      } else {
        // Single POST API call to create lead: POST /api/v1/leads
        const res = await createLeadMutation.mutateAsync(currentPayload);

        if (res && res.success === false) {
          const errMsg =
            res.message || res.error || "Failed to generate lead on server";
          setErrorMessage(errMsg);
          showToast("error", errMsg);
          isSubmittingRef.current = false;
          return;
        }

        const clientName = currentPayload.clientName || "Lead";
        const successMsg = `Lead "${clientName}" generated successfully!`;
        setSuccessMessage(successMsg);
        showToast("success", successMsg);

        if (onLeadCreated) {
          onLeadCreated(res?.data || currentPayload);
        }

        setTimeout(() => {
          isSubmittingRef.current = false;
          onClose();
        }, 850);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (isEditMode ? "Failed to update lead" : "Failed to generate lead");
      setErrorMessage(errMsg);
      showToast("error", errMsg);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Floating High-Priority Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-4 fade-in backdrop-blur-md max-w-md ${
            toast.type === "success"
              ? "bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-600/30"
              : toast.type === "error"
              ? "bg-red-600/95 text-white border-red-400 shadow-red-600/30"
              : "bg-slate-900/95 text-white border-slate-700 shadow-slate-900/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
          ) : toast.type === "error" ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-white" />
          ) : (
            <RefreshCw className="h-4 w-4 shrink-0 text-white animate-spin" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isEditMode ? "Edit Lead" : "Add / Generate Lead"}
                </h3>
                {isEditMode ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    PUT /leads/{leadId}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-orange-400 border border-primary/30">
                    POST /leads
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? `Update lead profile and pipeline stage for ID ${leadId}`
                  : "Register new prospect inquiry into master database"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSample}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Populate form with Krishna Sharma sample data"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Fill Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJsonPreview((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showJsonPreview
                  ? "bg-primary text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Toggle JSON Payload View"
            >
              <Code2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* JSON Payload Inspector (Collapsible) */}
        {showJsonPreview && (
          <div className="mx-6 mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-2 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {isEditMode
                  ? `PUT Payload Preview (/leads/${leadId})`
                  : "POST Payload Preview (/leads)"}
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto max-h-40 leading-relaxed">
              {JSON.stringify(currentPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section: Client Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Client Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Krishna"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Full Client Name <span className="text-slate-400 font-normal">(clientName)</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Krishna Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section: Contact Coordinates */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>Contact Coordinates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Primary Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    required
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+91 9265684501"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="krishna@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Project, Property Type & Budget */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <Building className="h-3.5 w-3.5 text-primary" />
              <span>Project & Property Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Project <span className="text-red-500">*</span>
                  </label>
                  {isProjectsLoading && (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 animate-pulse">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    name="project"
                    required
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>
                      Select Project
                    </option>
                    {projectOptions.map((p) => (
                      <option key={p.id || p.name} value={p.name}>
                        {p.name} {p.code ? `(${p.code})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {formData.project && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                    Selected: {formData.project}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Budget Range</label>
                <input
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  placeholder="50L - 75L"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Source, Mode & Approach */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>Channel & Sourcing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  <option value="housing.com">housing.com</option>
                  <option value="Google Form">Google Form</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="MagicBricks">MagicBricks</option>
                  <option value="99acres">99acres</option>
                  <option value="Direct Walk-in">Direct Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  <option value="call">Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="site_visit">Site Visit</option>
                  <option value="direct">Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Approach</label>
                <select
                  name="approach"
                  value={formData.approach}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  <option value="direct">Direct</option>
                  <option value="channel_partner">Channel Partner</option>
                  <option value="digital">Digital Campaign</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>

            {/* Pipeline Stage and Stage Reason (Only for new lead creation; omitted when editing lead) */}
            {!isEditMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    name="stage"
                    value={formData.stage || "NEW"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                  >
                    {LEAD_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Stage Reason / Follow-up Note
                  </label>
                  <input
                    type="text"
                    name="stageReason"
                    value={formData.stageReason || ""}
                    onChange={handleChange}
                    placeholder="e.g. Client interested in 2 BHK layout"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Agent & Manager Assignments */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Agent Assignments</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Pre-Sales Agent Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Pre-Sales Agent <span className="text-red-500">*</span>
                  </label>
                  {(isUsersLoading || isAdminsLoading) && (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 animate-pulse">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    name="preSalesAgent"
                    required
                    value={formData.preSalesAgent}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select Pre-Sales Agent</option>
                    <optgroup label="Employees / Agents">
                      {employeeOptions.map((u) => (
                        <option key={`ps-emp-${u.id}`} value={u.id}>
                          {u.name} ({u.role}) — {u.id}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Admins / Leads">
                      {adminOptions.map((a) => (
                        <option key={`ps-adm-${a.id}`} value={a.id}>
                          {a.name} ({a.role}) — {a.id}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {formData.preSalesAgent && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                    ID: {formData.preSalesAgent}
                  </span>
                )}
              </div>

              {/* Sales Agent Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Sales Agent <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    name="salesAgent"
                    required
                    value={formData.salesAgent}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select Sales Agent</option>
                    <optgroup label="Employees / Sales Agents">
                      {employeeOptions.map((u) => (
                        <option key={`sa-emp-${u.id}`} value={u.id}>
                          {u.name} ({u.role}) — {u.id}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Admins / Leads">
                      {adminOptions.map((a) => (
                        <option key={`sa-adm-${a.id}`} value={a.id}>
                          {a.name} ({a.role}) — {a.id}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {formData.salesAgent && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                    ID: {formData.salesAgent}
                  </span>
                )}
              </div>

              {/* Co-Owner Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Co-Owner</label>
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    name="coOwner"
                    value={formData.coOwner}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="">None / Select Co-Owner</option>
                    <optgroup label="Employees / Relationship Managers">
                      {employeeOptions.map((u) => (
                        <option key={`co-emp-${u.id}`} value={u.id}>
                          {u.name} ({u.role}) — {u.id}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Admins / Management">
                      {adminOptions.map((a) => (
                        <option key={`co-adm-${a.id}`} value={a.id}>
                          {a.name} ({a.role}) — {a.id}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {formData.coOwner && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                    ID: {formData.coOwner}
                  </span>
                )}
              </div>

              {/* Channel Partner Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Channel Partner</label>
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    name="channelPartner"
                    value={formData.channelPartner}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="">None / Select Channel Partner</option>
                    <optgroup label="Channel Partners">
                      {channelPartnerOptions.map((cp) => (
                        <option key={`cp-${cp.id}`} value={cp.id}>
                          {cp.name} ({cp.role}) — {cp.id}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Employees / Associates">
                      {employeeOptions.map((u) => (
                        <option key={`cp-emp-${u.id}`} value={u.id}>
                          {u.name} ({u.role}) — {u.id}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Admins">
                      {adminOptions.map((a) => (
                        <option key={`cp-adm-${a.id}`} value={a.id}>
                          {a.name} ({a.role}) — {a.id}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {formData.channelPartner && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                    ID: {formData.channelPartner}
                  </span>
                )}
              </div>

              {/* Sourcing Manager Dropdown */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Sourcing Manager</label>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    name="sourcingManager"
                    value={formData.sourcingManager}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select Sourcing Manager</option>
                    <optgroup label="Admins & Sourcing Leads">
                      {adminOptions.map((a) => (
                        <option key={`sm-adm-${a.id}`} value={a.id}>
                          {a.name} ({a.role}) — {a.id}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Employees & Managers">
                      {employeeOptions.map((u) => (
                        <option key={`sm-emp-${u.id}`} value={u.id}>
                          {u.name} ({u.role}) — {u.id}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {formData.sourcingManager && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                    ID: {formData.sourcingManager}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Remarks */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-bold mb-1">Remark / Client Notes</label>
            <textarea
              name="remark"
              rows={2}
              value={formData.remark}
              onChange={handleChange}
              placeholder="Client requested Sunday afternoon 3 PM site visit."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleFillSample}
              className="text-xs text-primary hover:text-orange-600 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{isEditMode ? "Reset to Lead Values" : "Reset to Sample Body"}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmittingRef.current ||
                  createLeadMutation.isPending ||
                  updateLeadMutation.isPending
                }
                className="px-5 py-2 rounded-xl text-white font-bold bg-primary hover:bg-orange-600 transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isEditMode
                    ? updateLeadMutation.isPending
                      ? "Updating Lead..."
                      : "Update Lead"
                    : createLeadMutation.isPending
                    ? "Generating Lead..."
                    : "Generate Lead"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
