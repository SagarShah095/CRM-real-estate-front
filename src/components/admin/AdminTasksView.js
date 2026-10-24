"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Search,
  RotateCcw,
  BarChart2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  FileText,
  Eye,
  Trash2,
  ArrowUpDown,
  Filter,
  Check,
  Code2,
  RefreshCw,
  ExternalLink,
  Layers,
  X,
} from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import { useTasksQuery } from "@/hooks/useTasksQuery";
import { useProjectsQuery } from "@/hooks/useProjectsQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { storage } from "@/utils/storage";

const DATE_RANGE_OPTIONS = [
  { value: "", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this_week", label: "This Week" },
  { value: "next_week", label: "Next Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

const ACTIVITY_TYPE_OPTIONS = [
  { value: "", label: "All Activities" },
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "call,meeting", label: "Call & Meeting" },
  { value: "site_visit", label: "Site Visit" },
  { value: "demo", label: "Demo" },
  { value: "follow_up", label: "Follow Up" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

/**
 * Skeleton Loader Rows for Tasks Table
 */
function TaskTableSkeleton({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr
          key={`skeleton-task-row-${idx}`}
          className="border-b border-slate-100 animate-pulse bg-white"
        >
          {/* Checkbox */}
          <td className="py-4 px-4">
            <div className="h-4 w-4 bg-slate-200/80 rounded" />
          </td>

          {/* Index # */}
          <td className="py-4 px-3">
            <div className="h-3 w-4 bg-slate-200/80 rounded" />
          </td>

          {/* Date & Time */}
          <td className="py-4 px-3">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200/90 rounded" />
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
            </div>
          </td>

          {/* Lead Contact */}
          <td className="py-4 px-4">
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-slate-200/90 rounded" />
              <div className="h-2.5 w-20 bg-slate-100 rounded font-mono" />
              <div className="h-2.5 w-44 bg-slate-100 rounded" />
            </div>
          </td>

          {/* Project */}
          <td className="py-4 px-3">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200/90 rounded" />
              <div className="h-2.5 w-14 bg-slate-100 rounded" />
            </div>
          </td>

          {/* Assigned To */}
          <td className="py-4 px-3">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200/90 rounded" />
              <div className="h-2.5 w-12 bg-slate-100 rounded" />
            </div>
          </td>

          {/* Pre-Sales */}
          <td className="py-4 px-3">
            <div className="h-3.5 w-20 bg-slate-200/90 rounded" />
          </td>

          {/* Activity Type Badge */}
          <td className="py-4 px-3">
            <div className="h-6 w-20 bg-slate-200/80 rounded-md" />
          </td>

          {/* Category */}
          <td className="py-4 px-3">
            <div className="h-3.5 w-20 bg-slate-200/80 rounded" />
          </td>

          {/* Status */}
          <td className="py-4 px-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <div className="h-3.5 w-16 bg-slate-200/80 rounded-full" />
            </div>
          </td>

          {/* Actions */}
          <td className="py-4 px-3 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="h-6 w-6 bg-slate-100 rounded-lg" />
              <div className="h-6 w-6 bg-slate-100 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminTasksView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("Tasks (All)");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showQueryInspector, setShowQueryInspector] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState(null);
  const [apiBanner, setApiBanner] = useState(null); // { type: 'success' | 'error' | 'info', title: string, message: string }

  // Read initial filter values from URL searchParams (no forced defaults for dateRange, sortBy, or sortOrder)
  const [filters, setFilters] = useState(() => ({
    page: parseInt(searchParams.get("page") || "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") || "20", 10),
    projectId: searchParams.get("projectId") || "",
    activityType: searchParams.get("activityType") || "",
    dateRange: searchParams.get("dateRange") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    preSalesAgentId: searchParams.get("preSalesAgentId") || "",
    team: searchParams.get("team") || "",
    assignedTo: searchParams.get("assignedTo") || "",
    assignedBy: searchParams.get("assignedBy") || "",
    status: searchParams.get("status") || "",
    entityType: searchParams.get("entityType") || "",
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "",
    sortOrder: searchParams.get("sortOrder") || "",
  }));

  // Drawer / modal open listener
  useEffect(() => {
    const drawerParam = searchParams.get("drawer") || searchParams.get("modal");
    if (drawerParam === "create" || drawerParam === "createTask") {
      setIsCreateModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
    }
  }, [searchParams]);

  // Clean query params object sent to GET /api/v1/tasks
  const queryParams = useMemo(() => {
    const q = {
      page: Number(filters.page || 1),
      pageSize: Number(filters.pageSize || 20),
    };

    if (filters.sortBy) q.sortBy = filters.sortBy;
    if (filters.sortOrder) q.sortOrder = filters.sortOrder;
    if (filters.projectId) q.projectId = filters.projectId;
    if (filters.activityType) q.activityType = filters.activityType;
    if (filters.dateRange) q.dateRange = filters.dateRange;
    if (filters.dateRange === "custom") {
      if (filters.startDate) q.startDate = filters.startDate;
      if (filters.endDate) q.endDate = filters.endDate;
    }
    if (filters.preSalesAgentId) q.preSalesAgentId = filters.preSalesAgentId;
    if (filters.team) q.team = filters.team;
    if (filters.assignedTo) q.assignedTo = filters.assignedTo;
    if (filters.assignedBy) q.assignedBy = filters.assignedBy;
    if (filters.status) q.status = filters.status;
    if (filters.entityType) q.entityType = filters.entityType;
    if (filters.category) q.category = filters.category;
    if (filters.search) q.search = filters.search;

    return q;
  }, [filters]);

  // Sync state changes to browser URL query string
  const syncUrlParams = useCallback(
    (newFilters) => {
      const sp = new URLSearchParams();
      if (newFilters.page && newFilters.page !== 1)
        sp.set("page", newFilters.page);
      if (newFilters.pageSize && newFilters.pageSize !== 20)
        sp.set("pageSize", newFilters.pageSize);
      if (newFilters.projectId) sp.set("projectId", newFilters.projectId);
      if (newFilters.activityType)
        sp.set("activityType", newFilters.activityType);
      if (newFilters.dateRange) sp.set("dateRange", newFilters.dateRange);
      if (newFilters.dateRange === "custom") {
        if (newFilters.startDate) sp.set("startDate", newFilters.startDate);
        if (newFilters.endDate) sp.set("endDate", newFilters.endDate);
      }
      if (newFilters.preSalesAgentId)
        sp.set("preSalesAgentId", newFilters.preSalesAgentId);
      if (newFilters.team) sp.set("team", newFilters.team);
      if (newFilters.assignedTo) sp.set("assignedTo", newFilters.assignedTo);
      if (newFilters.assignedBy) sp.set("assignedBy", newFilters.assignedBy);
      if (newFilters.status) sp.set("status", newFilters.status);
      if (newFilters.entityType) sp.set("entityType", newFilters.entityType);
      if (newFilters.category) sp.set("category", newFilters.category);
      if (newFilters.search) sp.set("search", newFilters.search);
      if (newFilters.sortBy) sp.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder) sp.set("sortOrder", newFilters.sortOrder);

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // TanStack Query for Tasks GET API
  const {
    data: apiResponse,
    isLoading: isTasksLoading,
    isFetching: isTasksFetching,
    isError: isTasksError,
    error: tasksQueryError,
    refetch: refetchTasks,
  } = useTasksQuery(queryParams, { enabled: true });

  // Optional: Fetch Projects & Users for realistic dropdown options
  const { data: projectsData } = useProjectsQuery({}, { enabled: true });
  const { data: usersData } = useUsersQuery({}, { enabled: true });

  const currentAdmin = typeof window !== "undefined" ? storage.getUser() : null;
  const currentAdminId =
    currentAdmin?.id || currentAdmin?._id || currentAdmin?.userId;

  const projectOptions = useMemo(() => {
    const list =
      projectsData?.data?.projects ||
      projectsData?.data ||
      projectsData?.projects ||
      [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((p) => ({
        id: p._id || p.id || p.code,
        code: p.code || p.id || p._id,
        name: p.name || p.title || p.projectName || "Unnamed Project",
      }));
    }
    return [
      {
        id: "proj-skyline-01",
        code: "SKPIN",
        name: "Skyline Pinnacle (Residential)",
      },
      { id: "proj-shivpooja-01", code: "SPH", name: "Shiv Pooja Heights" },
      { id: "proj-royal-01", code: "RPE", name: "Royal Palms Estate" },
      { id: "proj-emerald-01", code: "ETW", name: "Emerald Towers" },
      { id: "proj-jigar-01", code: "JSP", name: "Jigar Shah Park" },
    ];
  }, [projectsData]);

  const userOptions = useMemo(() => {
    const list =
      usersData?.data?.users || usersData?.data || usersData?.users || [];
    if (Array.isArray(list) && list.length > 0) {
      // Filter for users created by this admin
      const adminUsers = list.filter((u) => {
        const creator = u.createdBy || u.adminId || u.createdById || u.tenantId;
        if (!creator || !currentAdminId) return true;
        const creatorId =
          typeof creator === "object" ? creator._id || creator.id : creator;
        return String(creatorId) === String(currentAdminId);
      });
      const sourceList = adminUsers.length > 0 ? adminUsers : list;

      return sourceList.map((u) => ({
        id: u._id || u.id || u.userId,
        name:
          u.name ||
          `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          u.userName ||
          u.email ||
          "User",
        role: u.role || u.designation || u.department || "Agent",
      }));
    }
    return [
      { id: "usr-emp-01", name: "Jagdish Patel", role: "Sales Executive" },
      { id: "usr-emp-02", name: "Mahesh Chauhan", role: "Relationship Mgr" },
      { id: "usr-emp-03", name: "Rahul Mehta", role: "Senior Sales" },
      { id: "usr-admin-01", name: "Aditi R.", role: "Pre-Sales Lead" },
      { id: "usr-admin-02", name: "Vikram S.", role: "Pre-Sales Rep" },
    ];
  }, [usersData, currentAdminId]);

  // Helper to map project ID to Project Name from Project API
  const getProjectName = useCallback(
    (projectId) => {
      if (!projectId || projectId === "—") return "—";
      const found = projectOptions.find(
        (p) =>
          String(p.id) === String(projectId) ||
          String(p.code) === String(projectId) ||
          (p.name && p.name.toLowerCase() === String(projectId).toLowerCase()),
      );
      return found?.name || projectId;
    },
    [projectOptions],
  );

  // Helper to map user ID to User Name of admin-created users
  const getUserName = useCallback(
    (userIdOrName) => {
      if (!userIdOrName || userIdOrName === "—") return "—";
      const found = userOptions.find(
        (u) =>
          String(u.id) === String(userIdOrName) ||
          (u.name &&
            u.name.toLowerCase() === String(userIdOrName).toLowerCase()),
      );
      return found?.name || userIdOrName;
    },
    [userOptions],
  );

  // Fallback sample tasks
  const sampleFallbackTasks = useMemo(
    () => [
      {
        id: "TSK-001",
        createdDate: "Feb 12, 2026",
        leadName: "Dhaval Bhai",
        mobile: "+91 9978928637",
        category: "Residential",
        assignedBy: "Mr. Jigar",
        assignedTo: "usr-emp-01",
        preSalesAgentId: "usr-admin-01",
        preSalesAgent: "Aditi R.",
        scheduledFor: "Feb 13, 2:00 PM",
        title: "Site Visit Followup",
        remark: "Client requested 3 BHK top floor walkthrough",
        activityType: "call",
        stage: "site_visit_scheduled",
        status: "pending",
        dueDate: "2026-02-13T14:00:00.000Z",
        projectId: "proj-skyline-01",
        team: "Sales",
        priority: "high",
      },
      {
        id: "TSK-002",
        createdDate: "Feb 11, 2026",
        leadName: "Rahul Mehta",
        mobile: "+91 8130381496",
        category: "Commercial",
        assignedBy: "Mr. Jigar",
        assignedTo: "usr-emp-02",
        preSalesAgentId: "usr-admin-02",
        preSalesAgent: "Vikram S.",
        scheduledFor: "Feb 12, 11:00 AM",
        title: "Commercial Layout Demo",
        remark: "Discussed payment plan & booking advance",
        activityType: "site_visit",
        stage: "contacted",
        status: "completed",
        dueDate: "2026-02-12T11:00:00.000Z",
        projectId: "proj-shivpooja-01",
        team: "Sales",
        priority: "medium",
      },
      {
        id: "TSK-003",
        createdDate: "Feb 10, 2026",
        leadName: "Sanjay Shah",
        mobile: "+91 9825012345",
        category: "Residential",
        assignedBy: "Mr. Jigar",
        assignedTo: "usr-emp-01",
        preSalesAgentId: "usr-admin-01",
        preSalesAgent: "Aditi R.",
        scheduledFor: "Feb 14, 04:00 PM",
        title: "Pricing & Floorplan Discussion",
        remark: "Followup call for site visit feedback",
        activityType: "meeting",
        stage: "site_visit_scheduled",
        status: "pending",
        dueDate: "2026-02-14T16:00:00.000Z",
        projectId: "proj-skyline-01",
        team: "Sales",
        priority: "high",
      },
      {
        id: "TSK-004",
        createdDate: "Feb 09, 2026",
        leadName: "Priya Nair",
        mobile: "+91 9712345678",
        category: "Villa",
        assignedBy: "Mr. Jigar",
        assignedTo: "usr-emp-02",
        preSalesAgentId: "usr-admin-01",
        preSalesAgent: "Priya Nair",
        scheduledFor: "Feb 10, 06:00 PM",
        title: "Overdue Callback",
        remark: "Requested callback regarding loan approval",
        activityType: "call",
        stage: "qualified",
        status: "overdue",
        dueDate: "2026-02-10T18:00:00.000Z",
        projectId: "proj-royal-01",
        team: "Pre-Sales",
        priority: "urgent",
      },
    ],
    [],
  );

  const [tasks, setTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Sync API response with tasks state and display response feedback
  useEffect(() => {
    if (!apiResponse) return;

    if (apiResponse.success === false) {
      setApiBanner({
        type: "error",
        title: "GET /api/v1/tasks Error",
        message: apiResponse.message || "Failed to load tasks with current filters.",
      });
      setTasks([]);
      return;
    }

    // Auto-clear GET error if a subsequent request succeeds
    setApiBanner((prev) => (prev?.title === "GET /api/v1/tasks Error" ? null : prev));

    const serverTasks =
      apiResponse?.data?.tasks ??
      apiResponse?.data ??
      apiResponse?.tasks ??
      (Array.isArray(apiResponse) ? apiResponse : []);

    if (!Array.isArray(serverTasks)) {
      setTasks([]);
      return;
    }

    const normalized = serverTasks.map((t, idx) => ({
      id: t.id || t._id || `task-${idx + 1}`,
      createdDate: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
      leadName: t.leadName || t.leadId || "—",
      mobile: t.mobile || "—",
      category: t.category || "—",
      assignedBy: t.assignedBy || "—",
      assignedTo: t.assignedTo || "—",
      preSalesAgent: t.preSalesAgent || "—",
      preSalesAgentId: t.preSalesAgentId || "",
      scheduledFor: t.dueDate
        ? new Date(t.dueDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "—",
      title: t.title || "—",
      remark: t.remark || "",
      activityType: t.activityType || "—",
      stage: t.stage || "—",
      status: t.isCompleted ? "completed" : t.status || "—",
      dueDate: t.dueDate,
      projectId: t.projectId || "",
      team: t.team || "—",
      priority: t.priority || "—",
      ...t,
    }));

    setTasks(normalized);
  }, [apiResponse]);

  // Derived pagination info
  const pagination = useMemo(() => {
    return (
      apiResponse?.data?.pagination ||
      apiResponse?.pagination || {
        total: tasks.length,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.max(
          1,
          Math.ceil(tasks.length / (filters.pageSize || 20)),
        ),
      }
    );
  }, [apiResponse, tasks.length, filters.page, filters.pageSize]);

  // Open Create Task modal
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("drawer", "create");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("drawer");
    params.delete("modal");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // Generic Filter Change Handler
  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value };
      // Reset page to 1 when any filter other than page changes
      if (field !== "page") {
        next.page = 1;
      }
      syncUrlParams(next);
      return next;
    });
  };

  // Reset Filters to Defaults
  const handleResetFilters = () => {
    const defaults = {
      page: 1,
      pageSize: 20,
      projectId: "",
      activityType: "",
      dateRange: "",
      startDate: "",
      endDate: "",
      preSalesAgentId: "",
      team: "",
      assignedTo: "",
      assignedBy: "",
      status: "",
      entityType: "",
      category: "",
      search: "",
      sortBy: "",
      sortOrder: "",
    };
    setFilters(defaults);
    syncUrlParams(defaults);
  };

  // Tab switcher (Tasks (All), Site Visits, Meeting Logs, Calendar)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Site Visits") {
      handleFilterChange("activityType", "site_visit");
    } else if (tab === "Meeting Logs") {
      handleFilterChange("activityType", "meeting");
    } else if (tab === "Tasks (All)") {
      handleFilterChange("activityType", "");
    }
  };

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(tasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setApiBanner({
      type: "success",
      title: "Task Created Successfully",
      message: `Task "${newTask.title || "New Task"}" was saved and scheduled on the server.`,
    });
    if (refetchTasks) refetchTasks();
  };

  // Surface query network/server error if GET fails completely
  useEffect(() => {
    if (isTasksError) {
      setApiBanner({
        type: "error",
        title: "GET /api/v1/tasks Network / Server Error",
        message:
          tasksQueryError?.response?.data?.message ||
          tasksQueryError?.message ||
          "Could not communicate with the Tasks API server.",
      });
    }
  }, [isTasksError, tasksQueryError]);

  // Filter tasks in UI if server returns full dataset or fallback is active
  const displayedTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Activity Type filter (supports comma-separated e.g. "call,meeting")
      if (filters.activityType) {
        const types = filters.activityType
          .toLowerCase()
          .split(",")
          .map((s) => s.trim());
        const taskAct = (t.activityType || "").toLowerCase();
        const matches = types.some((tp) => taskAct.includes(tp));
        if (!matches) return false;
      }

      if (filters.status) {
        const s = (t.status || "").toLowerCase();
        if (s !== filters.status.toLowerCase()) return false;
      }

      if (filters.assignedTo && t.assignedTo !== filters.assignedTo) {
        return false;
      }

      if (
        filters.preSalesAgentId &&
        t.preSalesAgentId !== filters.preSalesAgentId
      ) {
        return false;
      }

      if (filters.projectId && t.projectId !== filters.projectId) {
        return false;
      }

      if (filters.team && t.team !== filters.team) {
        return false;
      }

      if (filters.category && t.category !== filters.category) {
        return false;
      }

      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchLead = t.leadName?.toLowerCase().includes(term);
        const matchMobile = t.mobile?.includes(term);
        const matchTitle = t.title?.toLowerCase().includes(term);
        const matchRemark = t.remark?.toLowerCase().includes(term);
        const matchProject = getProjectName(t.projectId)
          ?.toLowerCase()
          .includes(term);
        const matchAssigned = getUserName(t.assignedTo)
          ?.toLowerCase()
          .includes(term);
        const matchPreSales = getUserName(t.preSalesAgentId || t.preSalesAgent)
          ?.toLowerCase()
          .includes(term);
        if (
          !matchLead &&
          !matchMobile &&
          !matchTitle &&
          !matchRemark &&
          !matchProject &&
          !matchAssigned &&
          !matchPreSales
        )
          return false;
      }

      return true;
    });
  }, [tasks, filters, getProjectName, getUserName]);

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => (t.status || "").toLowerCase() === "completed",
    ).length;
    const pending = tasks.filter(
      (t) => (t.status || "").toLowerCase() === "pending",
    ).length;
    const overdue = tasks.filter(
      (t) => (t.status || "").toLowerCase() === "overdue",
    ).length;
    const calls = tasks.filter((t) =>
      (t.activityType || "").toLowerCase().includes("call"),
    ).length;
    const visits = tasks.filter((t) =>
      (t.activityType || "").toLowerCase().includes("visit"),
    ).length;

    return { total, completed, pending, overdue, calls, visits };
  }, [tasks]);

  // Generate constructed query string for display
  const queryStringPreview = useMemo(() => {
    const sp = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        sp.set(k, v);
      }
    });
    return `/api/v1/tasks?${sp.toString()}`;
  }, [queryParams]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Tasks & Follow-up Activities
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
              GET /api/v1/tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage scheduled calls, client meetings, site tours, and automated
            follow-ups with query filters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowQueryInspector(!showQueryInspector)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showQueryInspector
                ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Inspect GET API Query String"
          >
            <Code2 className="h-4 w-4" />
            <span>
              {showQueryInspector ? "Hide API Query" : "Inspect Query"}
            </span>
          </button>

          <button
            onClick={() => refetchTasks && refetchTasks()}
            disabled={isTasksFetching}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw
              className={`h-4 w-4 ${isTasksFetching ? "animate-spin text-orange-600" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Global Live API Response & Error Banner */}
      {apiBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-sm animate-in slide-in-from-top-2 duration-200 ${
            apiBanner.type === "success"
              ? "bg-emerald-50 text-emerald-950 border-emerald-200"
              : apiBanner.type === "info"
              ? "bg-blue-50 text-blue-950 border-blue-200"
              : "bg-red-50 text-red-950 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {apiBanner.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : apiBanner.type === "info" ? (
              <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-sm">
                  {apiBanner.title || (apiBanner.type === "success" ? "Success" : "API Response Notice")}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    apiBanner.type === "success"
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {apiBanner.type === "success" ? "success: true" : "success: false"}
                </span>
              </div>
              <p className="text-xs font-semibold mt-1 text-slate-800 leading-relaxed">
                {apiBanner.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApiBanner(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
            title="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Query Inspector Banner */}
      {showQueryInspector && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px]">
                GET REQUEST
              </span>
              <span>Active URL Query Parameters</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(queryStringPreview);
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
            >
              Copy Endpoint
            </button>
          </div>
          <code className="text-xs font-mono text-emerald-400 break-all bg-slate-900/90 p-3 rounded-xl block border border-slate-800">
            {queryStringPreview}
          </code>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* TOTAL TASKS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL TASKS
            </p>
            {isTasksLoading ? (
              <div className="h-7 w-12 bg-slate-200/80 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {metrics.total}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* PENDING TASKS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PENDING
            </p>
            {isTasksLoading ? (
              <div className="h-7 w-10 bg-slate-200/80 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-black text-amber-600 mt-0.5">
                {metrics.pending}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* OVERDUE TASKS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OVERDUE
            </p>
            {isTasksLoading ? (
              <div className="h-7 w-10 bg-slate-200/80 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-black text-red-600 mt-0.5">
                {metrics.overdue}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* COMPLETED TASKS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COMPLETED
            </p>
            {isTasksLoading ? (
              <div className="h-7 w-12 bg-slate-200/80 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-black text-emerald-600 mt-0.5">
                {metrics.completed}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Task Panel Container (Tabs + Filter Grid + Data Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Top View Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            {["Tasks (All)", "Site Visits", "Meeting Logs", "Calendar"].map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-orange-500 text-orange-600 font-extrabold"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                );
              },
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isTasksFetching && (
              <span className="flex items-center gap-1.5 text-[11px] text-orange-600 font-semibold animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Syncing API...</span>
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-medium">
              Auto Refresh:
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* Multi-Field Filter Bar matching exact query schema */}
        <div className="p-5 border-b border-slate-100 bg-white space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {/* 1. Project Filter (projectId) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Project (projectId)
              </label>
              <select
                value={filters.projectId}
                onChange={(e) =>
                  handleFilterChange("projectId", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium truncate"
              >
                <option value="">All Projects</option>
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Activity Type Filter (activityType: call, meeting, etc.) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Activity Type
              </label>
              <select
                value={filters.activityType}
                onChange={(e) =>
                  handleFilterChange("activityType", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Date Range Filter (dateRange: today | yesterday | tomorrow | ...) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Pre Sales Agent (preSalesAgentId) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Pre Sales Agent
              </label>
              <select
                value={filters.preSalesAgentId}
                onChange={(e) =>
                  handleFilterChange("preSalesAgentId", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium truncate"
              >
                <option value="">All Pre-Sales</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.role ? `(${u.role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Team (team: Sales, Pre-Sales, Marketing) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Team
              </label>
              <select
                value={filters.team}
                onChange={(e) => handleFilterChange("team", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="">All Teams</option>
                <option value="Sales">Sales</option>
                <option value="Pre-Sales">Pre-Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Support">Support</option>
              </select>
            </div>

            {/* 6. Assigned To (assignedTo) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Assigned To
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) =>
                  handleFilterChange("assignedTo", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium truncate"
              >
                <option value="">All Assigned</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.role ? `(${u.role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Status (status: pending | completed | overdue) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* 8. Assigned By (assignedBy) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Assigned By
              </label>
              <select
                value={filters.assignedBy}
                onChange={(e) =>
                  handleFilterChange("assignedBy", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium truncate"
              >
                <option value="">All Assigners</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 9. Entity Type (entityType: lead, contact, deal) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Entity Type
              </label>
              <select
                value={filters.entityType}
                onChange={(e) =>
                  handleFilterChange("entityType", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="">All Entities</option>
                <option value="lead">Lead</option>
                <option value="contact">Contact</option>
                <option value="deal">Deal</option>
                <option value="account">Account</option>
              </select>
            </div>

            {/* 10. Category (category: Residential, Commercial, Plots) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="">All Categories</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Plots">Plots</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            {/* 11. Sort By (sortBy) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="">Default Sorting</option>
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Creation Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* 12. Sort Order (sortOrder: asc | desc) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="">Default Order</option>
                <option value="desc">Descending (desc)</option>
                <option value="asc">Ascending (asc)</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range Row (Appears when dateRange === "custom") */}
          {filters.dateRange === "custom" && (
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-200">
              <span className="font-bold text-orange-900 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span>Custom Date Interval:</span>
              </span>
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium">End Date:</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons & Quick Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchTasks && refetchTasks()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Apply Query</span>
              </button>

              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>

              {/* PageSize selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                <span>Page Size:</span>
                <select
                  value={filters.pageSize}
                  onChange={(e) =>
                    handleFilterChange("pageSize", Number(e.target.value))
                  }
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Keyword Search Input (search) */}
            <div className="flex items-center gap-3">
              <div className="relative w-64 sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Lead, phone, title..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <button
                onClick={handleResetFilters}
                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                title="Reset Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Data Table */}
        <div className="overflow-x-auto relative min-h-[240px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedTaskIds.length === displayedTasks.length &&
                      displayedTasks.length > 0
                    }
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="py-3 px-3 w-12">#</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-4">Lead Contact</th>
                <th className="py-3 px-3">Project</th>
                <th className="py-3 px-3">Assigned To</th>
                <th className="py-3 px-3">Pre-Sales</th>
                <th className="py-3 px-3">Activity Type</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isTasksLoading || isTasksFetching ? (
                <TaskTableSkeleton rows={Math.min(filters.pageSize || 6, 8)} />
              ) : displayedTasks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-600">
                        No matching tasks found
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Try adjusting your query parameters or date range
                        filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedTasks.map((t, index) => {
                  const isSelected = selectedTaskIds.includes(t.id);
                  const act = (t.activityType || "").toLowerCase();
                  const st = (t.status || "").toLowerCase();

                  return (
                    <tr
                      key={t.id || index}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-orange-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectTask(t.id)}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {(filters.page - 1) * filters.pageSize + index + 1}
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <p className="font-bold text-slate-800">
                            {t.scheduledFor}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Created: {t.createdDate}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {t.leadName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {t.mobile}
                          </p>
                          {t.title && (
                            <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mt-0.5">
                              {t.title}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Project Column - Shows Project Name from Project API */}
                      <td className="py-3.5 px-3">
                        <div
                          className="font-bold text-slate-800 line-clamp-1"
                          title={getProjectName(t.projectId)}
                        >
                          {getProjectName(t.projectId)}
                        </div>
                        {t.projectId &&
                          getProjectName(t.projectId) !== t.projectId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.projectId}
                            </span>
                          )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">
                          {getUserName(t.assignedTo)}
                        </div>
                        {t.team && (
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {t.team}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {getUserName(t.preSalesAgentId || t.preSalesAgent)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                            act.includes("call")
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : act.includes("visit")
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : act.includes("meeting")
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {t.activityType}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {t.category || "Residential"}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="flex items-center gap-1.5 font-bold capitalize">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              st === "completed"
                                ? "bg-emerald-500"
                                : st === "overdue"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          <span
                            className={
                              st === "completed"
                                ? "text-emerald-700"
                                : st === "overdue"
                                  ? "text-red-600"
                                  : "text-amber-600"
                            }
                          >
                            {t.status}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTaskForView(t)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold bg-slate-50/50">
          <div>
            Showing {(filters.page - 1) * filters.pageSize + 1}–
            {Math.min(
              filters.page * filters.pageSize,
              pagination.total || displayedTasks.length,
            )}{" "}
            of {pagination.total || displayedTasks.length} tasks (Page{" "}
            {filters.page} of {pagination.totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleFilterChange("page", Math.max(1, filters.page - 1))
              }
              disabled={filters.page <= 1 || isTasksFetching}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Current Page Pill */}
            <span className="px-3.5 py-1.5 rounded-lg bg-orange-600 text-white font-extrabold shadow-sm">
              {filters.page}
            </span>

            <button
              onClick={() =>
                handleFilterChange(
                  "page",
                  Math.min(pagination.totalPages || 1, filters.page + 1),
                )
              }
              disabled={
                filters.page >= (pagination.totalPages || 1) || isTasksFetching
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 transition-all flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onTaskCreated={(newTask) => {
          handleTaskCreated(newTask);
          handleCloseCreateModal();
        }}
        onError={(errorMsg) => {
          setApiBanner({
            type: "error",
            title: "Task Creation Failed (POST /api/v1/tasks)",
            message: errorMsg,
          });
        }}
        projectOptions={projectOptions}
        userOptions={userOptions}
      />

      {/* Task View Details Modal */}
      {selectedTaskForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Task Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: {selectedTaskForView.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Project & Lead info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-orange-50/40 border border-orange-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Project Name
                  </span>
                  <p className="font-extrabold text-sm text-slate-900 mt-0.5">
                    {getProjectName(selectedTaskForView.projectId)}
                  </p>
                  {selectedTaskForView.projectId && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Project ID: {selectedTaskForView.projectId}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Lead Contact
                  </span>
                  <p className="font-extrabold text-sm text-slate-900 mt-0.5">
                    {selectedTaskForView.leadName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {selectedTaskForView.mobile}
                  </p>
                </div>
              </div>

              {/* Assignment details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Assigned To
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">
                    {getUserName(selectedTaskForView.assignedTo)}
                  </p>
                  {selectedTaskForView.assignedTo && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      User ID: {selectedTaskForView.assignedTo}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Pre-Sales Agent
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">
                    {getUserName(
                      selectedTaskForView.preSalesAgentId ||
                        selectedTaskForView.preSalesAgent,
                    )}
                  </p>
                  {selectedTaskForView.preSalesAgentId && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Agent ID: {selectedTaskForView.preSalesAgentId}
                    </p>
                  )}
                </div>
              </div>

              {/* Activity & Scheduled */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Activity Type
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5 uppercase">
                    {selectedTaskForView.activityType}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Scheduled For
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedTaskForView.scheduledFor}
                  </p>
                </div>
              </div>

              {/* Title & Remarks */}
              {selectedTaskForView.title && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Title
                  </span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {selectedTaskForView.title}
                  </p>
                </div>
              )}

              {selectedTaskForView.remark && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Remark
                  </span>
                  <p className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 mt-0.5 leading-relaxed">
                    {selectedTaskForView.remark}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTaskForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
