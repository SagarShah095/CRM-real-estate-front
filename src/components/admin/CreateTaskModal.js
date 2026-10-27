"use client";

import { useState, useId, useMemo, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Bell,
  Building,
  Flag,
  FileText,
  Users,
  Layers,
  ChevronDown,
  Code2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { createTask, updateTask, patchTask } from "@/services/tasks.service";
import { useDropdownData } from "@/hooks/useDropdownData";
import { storage } from "@/utils/storage";

const REMINDER_OPTIONS = [
  { label: "5 Minute", minutes: 5 },
  { label: "10 Minute", minutes: 10 },
  { label: "15 Minute", minutes: 15 },
  { label: "30 Minute", minutes: 30 },
  { label: "45 Minute", minutes: 45 },
  { label: "1 Hour", minutes: 60 },
  { label: "2 Hours", minutes: 120 },
  { label: "1 Day", minutes: 1440 },
];

const PRESET_PROJECTS = [
  { id: "proj-skyline-01", name: "Skyline Pinnacle (Residential)" },
  { id: "proj-shivpooja-01", name: "Shiv Pooja Heights" },
  { id: "proj-royal-01", name: "Royal Palms Estate" },
  { id: "proj-emerald-01", name: "Emerald Towers" },
  { id: "proj-jigar-01", name: "Jigar Shah Park" },
];

const PRESET_USERS = [
  { id: "usr-emp-01", name: "Jagdish Patel (Sales Executive)" },
  { id: "usr-emp-02", name: "Mahesh Chauhan (Relationship Mgr)" },
  { id: "usr-emp-03", name: "Rahul Mehta (Senior Sales)" },
  { id: "usr-admin-01", name: "Aditi R. (Pre-Sales Lead)" },
  { id: "usr-admin-02", name: "Vikram S. (Pre-Sales Rep)" },
];

export default function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  onError,
  task = null,
  mode = "create",
  projectOptions: propProjectOptions,
  userOptions: propUserOptions,
}) {
  const isEditMode = mode === "edit" || Boolean(task);
  const targetTask = task?._raw || task;
  const taskId = targetTask?.id || targetTask?._id || targetTask?.taskId || "";
  const currentAdmin = typeof window !== "undefined" ? storage.getUser() : null;
  const currentAdminId =
    currentAdmin?.id || currentAdmin?._id || currentAdmin?.userId;

  /**
   * Cache-first: all three lists come from the shared TanStack cache populated
   * by AdminTasksView (or whoever opened first).  Network is only hit when
   * the relevant cache bucket is empty.
   */
  const {
    projectsList: cachedProjects,
    usersList: cachedUsers,
    leadsList: cachedLeads,
    isLeadsLoading,
  } = useDropdownData({ enabled: Boolean(isOpen), currentAdminId });

  const [isCustomLeadInput, setIsCustomLeadInput] = useState(false);

  // Resolve Projects: prefer prop → cache → empty
  const availableProjects = useMemo(() => {
    if (propProjectOptions && propProjectOptions.length > 0)
      return propProjectOptions;
    return cachedProjects;
  }, [propProjectOptions, cachedProjects]);

  // Resolve Users: prefer prop → cache → empty
  const availableUsers = useMemo(() => {
    if (propUserOptions && propUserOptions.length > 0) return propUserOptions;
    return cachedUsers;
  }, [propUserOptions, cachedUsers]);

  // Leads always come from cache (no prop override)
  const availableLeads = cachedLeads;

  // Helper to format default datetime input string (YYYY-MM-DDTHH:mm)
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(15, 30, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dueDateTimeInput, setDueDateTimeInput] =
    useState(getDefaultDateTime());
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [apiStatus, setApiStatus] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Exact fields according to requested schema
  const [formData, setFormData] = useState({
    activityType: "call",
    assignedTo: "usr-emp-01",
    leadId: "",
    leadName: "Rahul Sharma",
    mobile: "+91 9978928637",
    title: "Call at Sep 26, 2026, 3:30 PM",
    remark: "Call client to discuss 3 BHK luxury layout and pricing",
    remindMe: true,
    isCompleted: false,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    reminderTime: "15 Minute",
    reminderMinutesBefore: 15,
    projectId: "proj-skyline-01",
    entityType: "lead",
    team: "Sales",
    category: "Residential",
    stage: "site_visit_scheduled",
    preSalesAgentId: "usr-admin-01",
    priority: "high",
    status: "pending",
  });

  // Initialize / Sync form data when editing an existing task
  useEffect(() => {
    if (isOpen && isEditMode && targetTask) {
      const rawDate =
        targetTask.dueDate || targetTask.scheduledForDate || targetTask.date;
      let dtString = getDefaultDateTime();
      let isoDate = new Date(Date.now() + 86400000).toISOString();
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            isoDate = d.toISOString();
            const pad = (n) => String(n).padStart(2, "0");
            dtString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          }
        } catch (_) {}
      }
      setDueDateTimeInput(dtString);

      const st = String(targetTask.status || "").toLowerCase();
      const isDone = Boolean(targetTask.isCompleted || st === "completed");

      setFormData({
        activityType: (targetTask.activityType || "call").toLowerCase(),
        assignedTo: targetTask.assignedTo || "",
        leadId: targetTask.leadId || "",
        leadName: targetTask.leadName || "",
        mobile: targetTask.mobile || targetTask.phone || "",
        title: targetTask.title || "",
        remark: targetTask.remark || "",
        remindMe:
          typeof targetTask.remindMe === "boolean" ? targetTask.remindMe : true,
        isCompleted: isDone,
        status: isDone ? "completed" : targetTask.status || "pending",
        dueDate: isoDate,
        reminderTime: targetTask.reminderTime || "15 Minute",
        reminderMinutesBefore: Number(targetTask.reminderMinutesBefore ?? 15),
        projectId: targetTask.projectId || "",
        entityType: targetTask.entityType || "lead",
        team: targetTask.team || "Sales",
        category: targetTask.category || "Residential",
        stage: targetTask.stage || "site_visit_scheduled",
        preSalesAgentId: targetTask.preSalesAgentId || "",
        priority: (targetTask.priority || "high").toLowerCase(),
      });
      setIsCustomLeadInput(true);
    }
  }, [isOpen, isEditMode, targetTask]);

  // Automatically sync form defaults when projects/users/leads load in create mode
  useEffect(() => {
    if (isOpen && !isEditMode && availableLeads.length > 0) {
      setFormData((prev) => {
        const hasLead = availableLeads.some(
          (l) => String(l.id) === String(prev.leadId),
        );
        if (hasLead || isCustomLeadInput) return prev;
        const firstLead = availableLeads[0];
        return {
          ...prev,
          leadId: firstLead.id,
          leadName: firstLead.name,
          mobile: firstLead.mobile || prev.mobile,
        };
      });
    }
  }, [isOpen, isEditMode, availableLeads, isCustomLeadInput]);

  useEffect(() => {
    if (isOpen && !isEditMode && availableProjects.length > 0) {
      setFormData((prev) => {
        const hasProject = availableProjects.some(
          (p) => String(p.id) === String(prev.projectId),
        );
        return hasProject
          ? prev
          : { ...prev, projectId: availableProjects[0].id };
      });
    }
  }, [isOpen, isEditMode, availableProjects]);

  useEffect(() => {
    if (isOpen && !isEditMode && availableUsers.length > 0) {
      setFormData((prev) => {
        const hasAssigned = availableUsers.some(
          (u) => String(u.id) === String(prev.assignedTo),
        );
        const hasPreSales = availableUsers.some(
          (u) => String(u.id) === String(prev.preSalesAgentId),
        );
        return {
          ...prev,
          assignedTo: hasAssigned
            ? prev.assignedTo
            : availableUsers[0]?.id || prev.assignedTo,
          preSalesAgentId: hasPreSales
            ? prev.preSalesAgentId
            : availableUsers[1]?.id ||
              availableUsers[0]?.id ||
              prev.preSalesAgentId,
        };
      });
    }
  }, [isOpen, isEditMode, availableUsers]);

  if (!isOpen) return null;

  // Format title from activity and date
  const generateTitle = (actType, dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      const formattedDate = d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const typeLabel = actType.charAt(0).toUpperCase() + actType.slice(1);
      return `${typeLabel} at ${formattedDate}`;
    } catch {
      return `${actType} scheduled`;
    }
  };

  const handleDateTimeChange = (e) => {
    const val = e.target.value;
    setDueDateTimeInput(val);
    try {
      const iso = new Date(val).toISOString();
      setFormData((prev) => {
        const next = { ...prev, dueDate: iso };
        // Auto-update title if user hasn't explicitly set a custom one
        if (
          !prev.title ||
          prev.title.startsWith("Call at") ||
          prev.title.startsWith("Site_visit at") ||
          prev.title.startsWith("Meeting at")
        ) {
          next.title = generateTitle(prev.activityType, val);
        }
        return next;
      });
    } catch (err) {
      // Keep input value
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: finalValue };

      // Synchronize reminderMinutesBefore when reminderTime changes
      if (name === "reminderTime") {
        const found = REMINDER_OPTIONS.find((opt) => opt.label === value);
        if (found) {
          next.reminderMinutesBefore = found.minutes;
        }
      }

      // Synchronize title if activityType changes
      if (name === "activityType") {
        if (!prev.title || prev.title.includes(" at ")) {
          next.title = generateTitle(value, dueDateTimeInput);
        }
      }

      return next;
    });
  };

  // Build the clean payload matching user's exact specification
  const buildPayload = () => {
    return {
      activityType: formData.activityType,
      assignedTo: formData.assignedTo,
      leadId: formData.leadId,
      title:
        formData.title ||
        generateTitle(formData.activityType, dueDateTimeInput),
      remark: formData.remark,
      remindMe: Boolean(formData.remindMe),
      isCompleted: Boolean(formData.isCompleted),
      status:
        formData.status || (formData.isCompleted ? "completed" : "pending"),
      dueDate: formData.dueDate || new Date(dueDateTimeInput).toISOString(),
      reminderTime: formData.reminderTime,
      reminderMinutesBefore: Number(formData.reminderMinutesBefore),
      projectId: formData.projectId,
      entityType: formData.entityType,
      team: formData.team,
      category: formData.category,
      stage: formData.stage,
      preSalesAgentId: formData.preSalesAgentId,
      priority: formData.priority,
    };
  };

  const handleCopyJson = () => {
    const payload = buildPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setApiStatus(null);

    const payload = buildPayload();

    // Client-side validations for creation
    if (!isEditMode && (!payload.leadId || !String(payload.leadId).trim())) {
      const msg =
        "A valid Lead ID from your tenant is required. Please select a lead from the list or enter a registered Lead ID.";
      setApiStatus({
        type: "error",
        message: msg,
        details:
          "The backend POST /api/v1/tasks endpoint requires a leadId that belongs to your tenant.",
      });
      if (onError) onError(msg);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!payload.projectId) {
      const msg = "Please select a Project for this task.";
      setApiStatus({ type: "error", message: msg });
      if (onError) onError(msg);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!payload.assignedTo) {
      const msg = "Please assign this task to an agent or user.";
      setApiStatus({ type: "error", message: msg });
      if (onError) onError(msg);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        // Send details in task PATCH API: PATCH /api/v1/tasks/:id (or /tasks/:id)
        const result = await updateTask(taskId, payload);

        if (result && result.success !== false && !result.error) {
          setApiStatus({
            type: "success",
            message:
              result.message ||
              `Task updated successfully via PATCH /tasks/${taskId}!`,
          });

          const assignedUserObj = availableUsers.find(
            (u) => String(u.id) === String(formData.assignedTo),
          );
          const preSalesUserObj = availableUsers.find(
            (u) => String(u.id) === String(formData.preSalesAgentId),
          );
          const projectObj = availableProjects.find(
            (p) => String(p.id) === String(formData.projectId),
          );

          const updatedTaskForUI = {
            ...targetTask,
            ...payload,
            id: taskId,
            leadName:
              formData.leadName || targetTask.leadName || formData.leadId,
            mobile: formData.mobile || targetTask.mobile || "",
            assignedToName: assignedUserObj?.name || formData.assignedTo,
            preSalesAgent: preSalesUserObj?.name || formData.preSalesAgentId,
            projectName: projectObj?.name || formData.projectId,
            scheduledFor: new Date(payload.dueDate).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            activityType: payload.activityType.toUpperCase(),
            status: payload.isCompleted
              ? "completed"
              : payload.status || "pending",
          };

          if (onTaskUpdated) {
            onTaskUpdated(updatedTaskForUI);
          }

          setTimeout(() => {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            onClose();
          }, 900);
          return;
        } else {
          const errorMsg =
            result?.message ||
            result?.error ||
            result?.data?.message ||
            `Failed to update task via PATCH /tasks/${taskId}`;

          setApiStatus({
            type: "error",
            message: errorMsg,
            details: `The server rejected PATCH /tasks/${taskId}. Please verify fields.`,
          });

          if (onError) onError(errorMsg);
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
      }

      // Send details in task POST API
      const result = await createTask(payload);

      if (result && result.success !== false && !result.error) {
        setApiStatus({
          type: "success",
          message: result.message || "Task created successfully on server!",
        });

        const assignedUserObj = availableUsers.find(
          (u) => String(u.id) === String(formData.assignedTo),
        );
        const preSalesUserObj = availableUsers.find(
          (u) => String(u.id) === String(formData.preSalesAgentId),
        );
        const projectObj = availableProjects.find(
          (p) => String(p.id) === String(formData.projectId),
        );

        const createdTaskForUI = {
          id:
            result?.data?.id ||
            result?.data?._id ||
            `TSK-${Date.now().toString().slice(-4)}`,
          createdDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          leadName: formData.leadName || formData.leadId,
          mobile: formData.mobile || "+91 9978928637",
          assignedBy: currentAdmin?.name || "Admin",
          assignedTo: formData.assignedTo,
          assignedToName: assignedUserObj?.name || formData.assignedTo,
          preSalesAgentId: formData.preSalesAgentId,
          preSalesAgent: preSalesUserObj?.name || formData.preSalesAgentId,
          projectId: formData.projectId,
          projectName: projectObj?.name || formData.projectId,
          scheduledFor: new Date(payload.dueDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          activityType: payload.activityType.toUpperCase(),
          category: payload.category,
          title: payload.title,
          remark: payload.remark,
          stage: payload.stage,
          status: payload.isCompleted ? "Completed" : "Pending",
          ...payload,
        };

        if (onTaskCreated) {
          onTaskCreated(createdTaskForUI);
        }

        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 1200);
      } else {
        // Real API Error from backend (e.g. "Lead [ld-01] not found in your tenant.")
        const errorMsg =
          result?.message ||
          result?.error ||
          result?.data?.message ||
          "Failed to create task. Please verify lead and parameters.";

        const isLeadError = errorMsg.toLowerCase().includes("lead");

        setApiStatus({
          type: "error",
          message: errorMsg,
          details: isLeadError
            ? "The server rejected this Lead ID because it does not exist in your tenant. Please choose a lead from the tenant dropdown list above."
            : undefined,
        });

        if (onError) {
          onError(errorMsg);
        }

        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected network error occurred while calling POST /api/v1/tasks";

      setApiStatus({
        type: "error",
        message: errorMsg,
      });

      if (onError) {
        onError(errorMsg);
      }

      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const currentPayload = buildPayload();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isEditMode
                    ? "Edit Task Details"
                    : "Create Task & Schedule Activity"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                  {isEditMode ? `PATCH /tasks/${taskId}` : "POST /api/v1/tasks"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? "Updates task properties directly using PATCH /tasks/:id"
                  : "Dispatches schema-validated task payload to the API"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showJsonPreview
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title="Inspect exact JSON sent to API"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showJsonPreview ? "Hide JSON" : "Inspect JSON"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live Status Toast Banner */}
        {apiStatus && (
          <div
            className={`px-6 py-3.5 flex items-start justify-between gap-3 text-xs border-b ${
              apiStatus.type === "success"
                ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                : "bg-red-50 text-red-950 border-red-200"
            } animate-in fade-in duration-200`}
          >
            <div className="flex items-start gap-2.5">
              {apiStatus.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm">
                    {apiStatus.type === "success"
                      ? "Task Created Successfully"
                      : "API Response Notice"}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      apiStatus.type === "success"
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {apiStatus.type === "success"
                      ? "success: true"
                      : "success: false"}
                  </span>
                </div>
                <p className="text-xs font-semibold mt-1 leading-relaxed text-red-800">
                  {apiStatus.message}
                </p>
                {apiStatus.details && (
                  <p className="text-[11px] font-medium text-slate-700 mt-1.5 bg-white/80 p-2 rounded-lg border border-red-200 leading-normal">
                    💡{" "}
                    <strong className="text-slate-900">Tenant Guidance:</strong>{" "}
                    {apiStatus.details}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiStatus(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* JSON Payload Inspection Drawer */}
          {showJsonPreview && (
            <div className="bg-slate-950 p-4 border-b border-slate-800 text-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
                  <span>POST /api/v1/tasks Payload:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono bg-slate-900/90 p-3 rounded-xl overflow-x-auto text-emerald-400 border border-slate-800 max-h-48 leading-relaxed">
                {JSON.stringify(currentPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 text-xs text-slate-700"
          >
            {/* Section 1: Activity & Lead Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-100 pb-1.5">
                <FileText className="h-4 w-4 text-orange-500" />
                <span>Task & Lead Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Activity Type */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Activity Type{" "}
                    <span className="text-orange-600 font-mono">*</span>
                  </label>
                  <select
                    name="activityType"
                    value={formData.activityType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  >
                    <option value="call">call (Phone Call)</option>
                    <option value="site_visit">site_visit (Site Visit)</option>
                    <option value="meeting">meeting (Meeting)</option>
                    <option value="demo">demo (Demo / Presentation)</option>
                    <option value="follow_up">follow_up (Follow Up)</option>
                    <option value="whatsapp">whatsapp (WhatsApp)</option>
                    <option value="email">email (Email Outreach)</option>
                  </select>
                </div>

                {/* Lead Selection / Lead ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">
                      Lead <span className="text-orange-600 font-mono">*</span>
                    </label>
                    {availableLeads.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCustomLeadInput(!isCustomLeadInput)}
                        className="text-[10px] text-orange-600 hover:text-orange-700 font-bold underline"
                      >
                        {isCustomLeadInput
                          ? "Select from list"
                          : "Enter Lead ID"}
                      </button>
                    )}
                  </div>

                  {isLeadsLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-600" />
                      <span>Loading tenant leads...</span>
                    </div>
                  ) : !isCustomLeadInput && availableLeads.length > 0 ? (
                    <select
                      name="leadId"
                      required
                      value={formData.leadId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomLeadInput(true);
                          setFormData((prev) => ({ ...prev, leadId: "" }));
                        } else {
                          const selected = availableLeads.find(
                            (l) => String(l.id) === String(val),
                          );
                          setFormData((prev) => ({
                            ...prev,
                            leadId: val,
                            leadName: selected ? selected.name : prev.leadName,
                            mobile: selected?.mobile || prev.mobile,
                          }));
                        }
                      }}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-slate-800 text-[11px] font-medium focus:outline-none focus:bg-white transition-all truncate ${
                        apiStatus?.type === "error" &&
                        apiStatus?.message?.toLowerCase()?.includes("lead")
                          ? "border-red-500 bg-red-50/40 text-red-900"
                          : "border-slate-200 focus:border-orange-500"
                      }`}
                    >
                      <option value="">
                        -- Select Existing Lead ({availableLeads.length}) --
                      </option>
                      {availableLeads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} (ID: {l.id})
                        </option>
                      ))}
                      <option value="__custom__">
                        + Enter Custom Lead ID...
                      </option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        name="leadId"
                        required
                        value={formData.leadId}
                        onChange={handleChange}
                        placeholder="e.g. Lead ID registered in your tenant"
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-[11px] text-slate-800 focus:outline-none focus:bg-white transition-all ${
                          apiStatus?.type === "error" &&
                          apiStatus?.message?.toLowerCase()?.includes("lead")
                            ? "border-red-500 bg-red-50/50"
                            : "border-slate-200 focus:border-orange-500"
                        }`}
                      />
                      {availableLeads.length === 0 ? (
                        <span className="text-[10px] text-amber-700 block font-medium">
                          ⚠️ No leads found in this tenant yet. Enter a valid
                          Lead ID.
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">
                          Must match an existing lead in your tenant
                        </span>
                      )}
                    </div>
                  )}
                  {formData.leadId && !isCustomLeadInput && (
                    <span className="text-[10px] text-slate-400 font-mono block truncate pl-0.5 mt-0.5">
                      Selected Lead ID: {formData.leadId}
                    </span>
                  )}
                </div>

                {/* Lead Name (Display) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Lead Contact Name
                  </label>
                  <input
                    type="text"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Task Title & Remark */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Task Title{" "}
                  <span className="text-orange-600 font-mono">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Call at Sep 26, 2026, 3:30 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Remark / Objective
                </label>
                <textarea
                  name="remark"
                  rows={2}
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="e.g. Call client to discuss 3 BHK luxury layout and pricing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Section 3: Due Date, Reminder & Priority */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-100 pb-1.5">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Scheduling, Due Date & Reminders</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Due Date & Time Picker */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Due Date & Time{" "}
                    <span className="text-orange-600 font-mono">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDateTimeInput}
                    onChange={handleDateTimeChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                  <p className="mt-1 text-[10px] text-slate-400 font-mono truncate">
                    ISO: {formData.dueDate}
                  </p>
                </div>

                {/* Reminder Setting */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Reminder Notification
                  </label>
                  <select
                    name="reminderTime"
                    value={formData.reminderTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  >
                    {REMINDER_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label} ({opt.minutes} mins before)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-400 font-mono">
                    reminderMinutesBefore: {formData.reminderMinutesBefore}
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  >
                    <option value="high">high (High Priority)</option>
                    <option value="medium">medium (Standard)</option>
                    <option value="low">low (Low Priority)</option>
                    <option value="urgent">urgent (Critical / Urgent)</option>
                  </select>
                </div>
              </div>

              {/* RemindMe & isCompleted Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="remindMe"
                    checked={formData.remindMe}
                    onChange={handleChange}
                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">
                    Remind Me before due date (
                    <code className="text-orange-600">remindMe: true</code>)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isCompleted"
                    checked={formData.isCompleted}
                    onChange={handleChange}
                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">
                    Mark as completed (
                    <code className="text-orange-600">isCompleted</code>)
                  </span>
                </label>
              </div>
            </div>

            {/* Section 4: Project, Assignment, Team & Stage */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-100 pb-1.5">
                <Layers className="h-4 w-4 text-orange-500" />
                <span>Assignment & Classification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Project ID -> Shows Project Name from Project API */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Project <span className="text-orange-600 font-mono">*</span>
                  </label>
                  <div className="space-y-1">
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all truncate"
                    >
                      <option value="">Select Project</option>
                      {availableProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {formData.projectId && (
                      <span className="text-[10px] text-slate-400 font-mono block truncate pl-0.5">
                        ID: {formData.projectId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned To -> Shows User Name of users created by this admin */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Assigned To{" "}
                    <span className="text-orange-600 font-mono">*</span>
                  </label>
                  <div className="space-y-1">
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all truncate"
                    >
                      <option value="">Select User</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.role ? `(${u.role})` : ""}
                        </option>
                      ))}
                    </select>
                    {formData.assignedTo && (
                      <span className="text-[10px] text-slate-400 font-mono block truncate pl-0.5">
                        User ID: {formData.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pre-Sales Agent ID -> Shows User Name of users created by this admin */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Pre-Sales Agent
                  </label>
                  <div className="space-y-1">
                    <select
                      name="preSalesAgentId"
                      value={formData.preSalesAgentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all truncate"
                    >
                      <option value="">Select Pre-Sales Agent</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.role ? `(${u.role})` : ""}
                        </option>
                      ))}
                    </select>
                    {formData.preSalesAgentId && (
                      <span className="text-[10px] text-slate-400 font-mono block truncate pl-0.5">
                        Agent ID: {formData.preSalesAgentId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Status */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={
                      formData.status ||
                      (formData.isCompleted ? "completed" : "pending")
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        status: val,
                        isCompleted: val === "completed",
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Team */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Team
                  </label>
                  <select
                    name="team"
                    value={formData.team}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Pre-Sales">Pre-Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plots">Plots</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Stage
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-[11px]"
                  >
                    <option value="site_visit_scheduled">
                      site_visit_scheduled
                    </option>
                    <option value="new_inquiry">new_inquiry</option>
                    <option value="contacted">contacted</option>
                    <option value="qualified">qualified</option>
                    <option value="negotiation">negotiation</option>
                    <option value="booking_done">booking_done</option>
                    <option value="lost">lost</option>
                  </select>
                </div>

                {/* Entity Type */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Entity Type
                  </label>
                  <select
                    name="entityType"
                    value={formData.entityType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  >
                    <option value="lead">lead</option>
                    <option value="deal">deal</option>
                    <option value="contact">contact</option>
                    <option value="account">account</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] flex items-center gap-2">
                {apiStatus?.type === "error" ? (
                  <div className="flex items-center gap-1.5 text-red-600 font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">
                      Error: {apiStatus.message}
                    </span>
                  </div>
                ) : apiStatus?.type === "success" ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{apiStatus.message}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {isEditMode
                        ? `Ready to dispatch PATCH /tasks/${taskId}`
                        : "Ready to dispatch to POST /api/v1/tasks"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-white font-bold bg-orange-600 hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {isSubmitting
                      ? isEditMode
                        ? "Saving (PATCH)..."
                        : "Dispatching API..."
                      : isEditMode
                        ? "Save Changes (PATCH)"
                        : "Send Task to API"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
