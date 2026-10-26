"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Globe,
  PhoneCall,
  User,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Inbox,
  CheckCircle2,
  Building,
  X,
  Edit,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import CreateLeadModal from "./CreateLeadModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import {
  useLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useBulkDeleteLeadsMutation,
} from "@/hooks/useLeadsQuery";

/**
 * Skeleton Loader Rows for Leads Table
 */
function LeadsTableSkeleton({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr
          key={`skeleton-lead-row-${idx}`}
          className="border-b border-slate-100 animate-pulse bg-white"
        >
          {/* Checkbox */}
          <td className="py-4 px-4 w-10">
            <div className="h-4 w-4 bg-slate-200/80 rounded" />
          </td>

          {/* Index # */}
          <td className="py-4 px-4">
            <div className="h-3 w-4 bg-slate-200/80 rounded" />
          </td>

          {/* Lead ID */}
          <td className="py-4 px-4">
            <div className="h-3.5 w-20 bg-slate-200/90 rounded" />
          </td>

          {/* Creation Date */}
          <td className="py-4 px-4">
            <div className="h-3.5 w-24 bg-slate-200/70 rounded" />
          </td>

          {/* Assigned Date */}
          <td className="py-4 px-4">
            <div className="h-3.5 w-24 bg-slate-200/70 rounded" />
          </td>

          {/* Lead Name */}
          <td className="py-4 px-4">
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-slate-200/90 rounded" />
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
            </div>
          </td>

          {/* Primary Mobile */}
          <td className="py-4 px-4">
            <div className="h-3.5 w-28 bg-slate-200/80 rounded" />
          </td>

          {/* Stage Badge */}
          <td className="py-4 px-4">
            <div className="h-5 w-16 bg-slate-200/80 rounded-md" />
          </td>

          {/* Stage Reason */}
          <td className="py-4 px-4">
            <div className="h-3.5 w-24 bg-slate-200/60 rounded" />
          </td>

          {/* Source */}
          <td className="py-4 px-4">
            <div className="h-3.5 w-20 bg-slate-200/70 rounded" />
          </td>

          {/* Actions */}
          <td className="py-4 px-4 text-right">
            <div className="h-7 w-16 bg-slate-200/80 rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

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

export default function AdminLeadsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeSegment, setActiveSegment] = useState("Pipeline");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);

  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [notification, setNotification] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'loading', message: string }

  const showToast = (type, message, duration = 4000) => {
    setToast({ type, message });
    if (duration > 0) {
      setTimeout(() => {
        setToast((curr) => (curr?.message === message ? null : curr));
      }, duration);
    }
  };

  // TanStack Query to fetch real Leads from GET /api/v1/leads (with fallback to /leads)
  const {
    data: apiResponse,
    isLoading: isLeadsLoading,
    isFetching: isLeadsFetching,
    isError: isLeadsError,
    error: leadsFetchError,
    refetch: refetchLeads,
  } = useLeadsQuery();

  const createLeadMutation = useCreateLeadMutation();
  const updateLeadMutation = useUpdateLeadMutation();
  const deleteLeadMutation = useDeleteLeadMutation();
  const bulkDeleteLeadsMutation = useBulkDeleteLeadsMutation();
  const isQuickGeneratingRef = useRef(false);

  // Extract raw leads array from API response safely
  const rawLeads = useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse)) return apiResponse;
    if (Array.isArray(apiResponse.data?.leads)) return apiResponse.data.leads;
    if (Array.isArray(apiResponse.data?.data)) return apiResponse.data.data;
    if (Array.isArray(apiResponse.leads)) return apiResponse.leads;
    if (Array.isArray(apiResponse.data)) return apiResponse.data;
    return [];
  }, [apiResponse]);

  // Format leads objects for table display
  const leads = useMemo(() => {
    return rawLeads.map((item, index) => {
      const id =
        item.id ||
        item._id ||
        item.leadId ||
        `LID-${1000 + (rawLeads.length - index)}`;

      const fn = item.firstName || "";
      const ln = item.lastName || "";
      const name =
        item.clientName ||
        item.leadName ||
        `${fn} ${ln}`.trim() ||
        "New Prospect";

      const primaryPhone =
        item.contactNumber ||
        (Array.isArray(item.contactNumbers) ? item.contactNumbers[0] : null) ||
        item.mobile ||
        item.phone ||
        "—";

      const creationDate = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : item.creationDate || "Recent";

      const assignedDate = item.assignedDate
        ? typeof item.assignedDate === "string" &&
          item.assignedDate.includes("T")
          ? new Date(item.assignedDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : item.assignedDate
        : item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : creationDate;

      const stage = (item.stage || item.status || "NEW").toUpperCase();
      const stageReason =
        item.stageReason || item.remark || item.remarks || "—";
      const source = item.source || item.leadSource || "housing.com";

      return {
        id,
        _raw: item,
        creationDate,
        assignedDate,
        leadName: name,
        mobile: primaryPhone,
        stage,
        stageReason,
        source,
        project: item.project || "—",
        propertyType: item.propertyType || "—",
        budgetRange: item.budgetRange || "—",
      };
    });
  }, [rawLeads]);

  // Dynamic KPI stage statistics computed from live database leads
  const stageStats = useMemo(() => {
    const total = leads.length;
    let newCount = 0;
    let contactedCount = 0;
    let qualifiedCount = 0;
    let lostCount = 0;
    let otherCount = 0;

    leads.forEach((l) => {
      const st = l.stage;
      if (st === "NEW") newCount++;
      else if (st === "CONTACTED") contactedCount++;
      else if (st === "QUALIFIED") qualifiedCount++;
      else if (st === "LOST") lostCount++;
      else otherCount++;
    });

    const getPct = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

    return {
      total,
      newCount,
      newPct: getPct(newCount),
      contactedCount,
      contactedPct: getPct(contactedCount),
      qualifiedCount,
      qualifiedPct: getPct(qualifiedCount),
      lostCount,
      lostPct: getPct(lostCount),
      otherCount,
      otherPct: getPct(otherCount),
    };
  }, [leads]);

  // Listen to drawer query params to open modal
  useEffect(() => {
    const drawerParam = searchParams.get("drawer") || searchParams.get("modal");
    if (drawerParam === "create" || drawerParam === "createLead") {
      setIsCreateModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
    }
  }, [searchParams]);

  const handleOpenCreateModal = () => {
    setSelectedLeadForEdit(null);
    setIsCreateModalOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("drawer", "create");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedLeadForEdit(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("drawer");
    params.delete("modal");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // Quick 1-click lead generation using the user's requested API body
  const handleQuickGenerateLead = async () => {
    if (isQuickGeneratingRef.current || createLeadMutation.isPending) return;
    isQuickGeneratingRef.current = true;
    showToast("loading", "Saving lead...", 0);

    try {
      const res = await createLeadMutation.mutateAsync(SAMPLE_LEAD_DATA);

      if (res && res.success === false) {
        showToast(
          "error",
          res.message || res.error || "Failed to generate lead",
        );
      } else {
        showToast(
          "success",
          "Lead 'Krishna Sharma' generated and registered successfully!",
        );
        refetchLeads();
      }
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to generate lead",
      );
    } finally {
      isQuickGeneratingRef.current = false;
    }
  };

  // Checkbox selection helpers
  const toggleSelectLead = (id) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (paginatedLeads.length === 0) return;
    const allSelected = paginatedLeads.every((l) => selectedLeadIds.has(l.id));
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        paginatedLeads.forEach((l) => next.delete(l.id));
      } else {
        paginatedLeads.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  // Open single delete confirmation modal
  const handleOpenSingleDeleteModal = (lead) => {
    setDeleteTarget({
      type: "single",
      lead,
    });
    setIsDeleteModalOpen(true);
  };

  // Open bulk delete confirmation modal
  const handleOpenBulkDeleteModal = () => {
    if (selectedLeadIds.size === 0) return;
    setDeleteTarget({
      type: "bulk",
      ids: Array.from(selectedLeadIds),
      count: selectedLeadIds.size,
    });
    setIsDeleteModalOpen(true);
  };

  // Confirm delete execution (Single or Bulk)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    if (deleteTarget.type === "single") {
      const targetLead = deleteTarget.lead;
      const targetId =
        targetLead.id || targetLead._raw?.id || targetLead._raw?._id;
      const leadName = targetLead.leadName || targetLead.clientName || "Lead";

      showToast("loading", `Calling DELETE /leads/${targetId}...`, 0);

      try {
        const res = await deleteLeadMutation.mutateAsync(targetId);
        if (res && res.success === false) {
          showToast(
            "error",
            res.message || res.error || "Failed to delete lead",
          );
        } else {
          showToast("success", `Lead "${leadName}" deleted successfully!`);
          setSelectedLeadIds((prev) => {
            const next = new Set(prev);
            next.delete(targetId);
            return next;
          });
          refetchLeads();
        }
      } catch (err) {
        showToast(
          "error",
          err.response?.data?.message || err.message || "Failed to delete lead",
        );
      }
    } else if (deleteTarget.type === "bulk") {
      const ids = deleteTarget.ids;
      showToast(
        "loading",
        `Calling POST /leads/bulk-delete for ${ids.length} leads...`,
        0,
      );

      try {
        const res = await bulkDeleteLeadsMutation.mutateAsync({ ids });
        if (res && res.success === false) {
          showToast(
            "error",
            res.message || res.error || "Failed to bulk delete leads",
          );
        } else {
          showToast("success", `Successfully deleted ${ids.length} leads!`);
          setSelectedLeadIds(new Set());
          refetchLeads();
        }
      } catch (err) {
        showToast(
          "error",
          err.response?.data?.message ||
            err.message ||
            "Failed to bulk delete leads",
        );
      }
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // Open Edit modal using unified CreateLeadModal via state
  const handleOpenEditModal = (lead) => {
    setSelectedLeadForEdit(lead);
    setIsCreateModalOpen(true);
  };

  // Callback on Lead Updated
  const handleLeadUpdated = (updated) => {
    const name = updated?.clientName || updated?.leadName || "Lead";
    showToast("success", `Lead "${name}" updated successfully!`);
    refetchLeads();
    setIsCreateModalOpen(false);
    setSelectedLeadForEdit(null);
  };

  // Filter leads based on stage and search query
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter !== "All" && l.stage !== stageFilter.toUpperCase()) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = l.leadName.toLowerCase().includes(q);
        const matchesId = String(l.id).toLowerCase().includes(q);
        const matchesMobile = l.mobile.includes(q);
        const matchesSource = l.source.toLowerCase().includes(q);
        const matchesProject = l.project.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesId &&
          !matchesMobile &&
          !matchesSource &&
          !matchesProject
        ) {
          return false;
        }
      }
      return true;
    });
  }, [leads, stageFilter, searchQuery]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  const isAllPageSelected =
    paginatedLeads.length > 0 &&
    paginatedLeads.every((l) => selectedLeadIds.has(l.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header / Breadcrumb Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-0.5">
            CRM &gt;{" "}
            <span className="text-slate-800 font-bold">
              Lead Master Database
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lead Master Database
          </h1>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetchLeads()}
            disabled={isLeadsFetching}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Leads from API"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${
                isLeadsFetching ? "animate-spin text-primary" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleQuickGenerateLead}
            disabled={createLeadMutation.isPending}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Instantly generate Krishna Sharma sample lead via POST /leads"
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-100" />
            <span>
              {createLeadMutation.isPending
                ? "Generating..."
                : "⚡ Quick Generate Lead"}
            </span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-4 fade-in backdrop-blur-md max-w-md ${
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

      {/* API Error Alert */}
      {isLeadsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">Error fetching leads from API: </span>
              <span>
                {leadsFetchError?.message ||
                  "Could not connect to /api/v1/leads"}
              </span>
            </div>
          </div>
          <button
            onClick={() => refetchLeads()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors w-fit"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Analytics Section (Lead Stage Donut + KPI Cards Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Lead Stage Analysis Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Lead Stage Analysis
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {stageStats.total} Total Leads
            </span>
          </div>

          {/* Donut Graphic */}
          <div className="relative flex items-center justify-center py-2">
            <svg
              className="w-44 h-44 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Dynamic primary stage segment (e.g. New or 100% placeholder) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#1e40af"
                strokeWidth="12"
                strokeDasharray={`${(stageStats.newPct * 226.2) / 100} 226.2`}
                strokeDashoffset="0"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              {/* Contacted segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${(stageStats.contactedPct * 226.2) / 100} 226.2`}
                strokeDashoffset={`-${(stageStats.newPct * 226.2) / 100}`}
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              {/* Lost segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#ef4444"
                strokeWidth="12"
                strokeDasharray={`${(stageStats.lostPct * 226.2) / 100} 226.2`}
                strokeDashoffset={`-${((Number(stageStats.newPct) + Number(stageStats.contactedPct)) * 226.2) / 100}`}
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900">
                {stageStats.total > 0 ? `${stageStats.newPct}%` : "0%"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {stageStats.total > 0 ? "New Leads" : "No Leads"}
              </span>
            </div>
          </div>

          {/* Donut Legend Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#1e40af]" /> New (
              {stageStats.newCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#3b82f6]" /> Contacted (
              {stageStats.contactedCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#60a5fa]" /> Qualified (
              {stageStats.qualifiedCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Lost (
              {stageStats.lostCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#cbd5e1]" /> Other (
              {stageStats.otherCount})
            </span>
          </div>
        </div>

        {/* Right Cards: 6 Summary KPI Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* TOTAL ACTIVE */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL LEADS
            </span>
            <span className="text-3xl font-black text-blue-600 mt-2">
              {isLeadsLoading ? "..." : stageStats.total}
            </span>
          </div>

          {/* NEW LEADS */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              NEW INQUIRIES
            </span>
            <span className="text-3xl font-black text-blue-800 mt-2">
              {isLeadsLoading ? "..." : stageStats.newCount}
            </span>
          </div>

          {/* QUALIFIED */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              QUALIFIED
            </span>
            <span className="text-3xl font-black text-emerald-500 mt-2">
              {isLeadsLoading ? "..." : stageStats.qualifiedCount}
            </span>
          </div>

          {/* CONTACTED */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CONTACTED
            </span>
            <span className="text-3xl font-black text-amber-500 mt-2">
              {isLeadsLoading ? "..." : stageStats.contactedCount}
            </span>
          </div>

          {/* LOST */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LOST LEADS
            </span>
            <span className="text-3xl font-black text-red-500 mt-2">
              {isLeadsLoading ? "..." : stageStats.lostCount}
            </span>
          </div>

          {/* SOURCES COUNT */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LEAD SOURCES
            </span>
            <span className="text-3xl font-black text-purple-600 mt-2">
              {isLeadsLoading
                ? "..."
                : new Set(leads.map((l) => l.source).filter(Boolean)).size || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Selection Notification Bar */}
      {selectedLeadIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-bold text-orange-950">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white text-[11px] font-black shadow-sm">
              {selectedLeadIds.size}
            </span>
            <span>
              {selectedLeadIds.size}{" "}
              {selectedLeadIds.size === 1 ? "lead" : "leads"} selected for bulk
              action
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedLeadIds(new Set())}
              className="px-3 py-1.5 rounded-xl border border-orange-200 bg-white hover:bg-orange-100/60 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={handleOpenBulkDeleteModal}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/25 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bulk Delete ({selectedLeadIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Section - Leads Registry Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Leads Registry
            </h2>

            {/* Pipeline / Archive Segment Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveSegment("Pipeline")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSegment === "Pipeline"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setActiveSegment("Archive")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSegment === "Archive"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Archive
              </button>
            </div>
          </div>

          {/* Search Bar & Stage Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, phone, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white w-48 sm:w-60 transition-all"
              />
            </div>

            {/* Stage Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Stages</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="LOST">LOST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all leads on current page"
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-orange-600"
                  />
                </th>
                <th className="py-3.5 px-4 w-12">#</th>
                <th className="py-3.5 px-4">LEAD ID</th>
                <th className="py-3.5 px-4">CREATION DATE</th>
                <th className="py-3.5 px-4">ASSIGNED DATE</th>
                <th className="py-3.5 px-4">LEAD NAME</th>
                <th className="py-3.5 px-4">PRIMARY NO.</th>
                <th className="py-3.5 px-4">STAGE</th>
                <th className="py-3.5 px-4">STAGE REASON</th>
                <th className="py-3.5 px-4">SOURCE</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {/* Skeleton Effect while Loading */}
              {isLeadsLoading ? (
                <LeadsTableSkeleton rows={7} />
              ) : paginatedLeads.length === 0 ? (
                /* Empty State when no leads found */
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center border border-orange-100 shadow-sm">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-bold text-slate-800">
                          {searchQuery || stageFilter !== "All"
                            ? "No matching leads found"
                            : "No leads registered yet"}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchQuery || stageFilter !== "All"
                            ? "Try adjusting your search criteria or stage filter."
                            : "Generate your first lead or add one via the CRM modal to see it here live."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={handleQuickGenerateLead}
                          disabled={createLeadMutation.isPending}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate Sample Lead</span>
                        </button>
                        <button
                          onClick={handleOpenCreateModal}
                          className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          + New Lead
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Real Leads Table Rows */
                paginatedLeads.map((l, index) => {
                  const isChecked = selectedLeadIds.has(l.id);
                  return (
                    <tr
                      key={l.id || `lead-${index}`}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? "bg-orange-50/40" : ""
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectLead(l.id)}
                          aria-label={`Select lead ${l.leadName}`}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-orange-600"
                        />
                      </td>

                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-bold font-mono text-[11px]">
                        {l.id}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {l.creationDate}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {l.assignedDate}
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <div className="text-slate-900 font-black text-xs">
                            {l.leadName}
                          </div>
                          {l.project && l.project !== "—" && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building className="h-2.5 w-2.5 text-slate-400" />
                              <span>{l.project}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-800 font-mono text-[11px]">
                        {l.mobile}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide inline-block ${
                            l.stage === "LOST"
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : l.stage === "NEW"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : l.stage === "QUALIFIED"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : l.stage === "CONTACTED"
                                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                                    : "bg-purple-50 text-purple-600 border border-purple-200"
                          }`}
                        >
                          {l.stage}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 italic text-[11px] max-w-xs truncate">
                        {l.stageReason}
                      </td>

                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          <span className="truncate">{l.source}</span>
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(l)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                            title={`Edit Lead (PUT /leads/${l.id})`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSingleDeleteModal(l)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                            title={`Delete Lead (DELETE /leads/${l.id})`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* Table Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <div>
            Showing{" "}
            {filteredLeads.length > 0
              ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  filteredLeads.length,
                )}`
              : "0"}{" "}
            of {filteredLeads.length} Leads
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (
                p === 1 ||
                p === totalPages ||
                (p >= currentPage - 1 && p <= currentPage + 1)
              ) {
                return (
                  <button
                    key={`page-${p}`}
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === p
                        ? "bg-primary text-white shadow-sm"
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Add & Edit Lead Modal (Managed completely via state) */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        mode={selectedLeadForEdit ? "edit" : "create"}
        lead={selectedLeadForEdit}
        onLeadCreated={(newLead) => {
          refetchLeads();
          const name = newLead?.clientName || newLead?.leadName || "New Lead";
          showToast(
            "success",
            `Lead "${name}" created and registered successfully!`,
          );
        }}
        onLeadUpdated={handleLeadUpdated}
      />

      {/* Delete Confirmation Modal (Handles single & bulk deletion) */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={
          deleteTarget?.type === "bulk"
            ? `Delete ${deleteTarget.count} Leads`
            : "Delete Lead"
        }
        description={
          deleteTarget?.type === "bulk"
            ? `Are you sure you want to permanently delete these ${deleteTarget.count} leads?`
            : `Are you sure you want to permanently delete lead`
        }
        itemName={
          deleteTarget?.type === "single"
            ? deleteTarget.lead?.leadName || deleteTarget.lead?.clientName
            : null
        }
        confirmText={
          deleteTarget?.type === "bulk"
            ? `Delete ${deleteTarget.count} Leads`
            : "Delete Lead"
        }
        endpointInfo={
          deleteTarget?.type === "bulk"
            ? "POST /leads/bulk-delete"
            : `DELETE /leads/${deleteTarget?.lead?.id}`
        }
        itemDetails={
          deleteTarget?.type === "single"
            ? {
                "Lead ID": deleteTarget.lead?.id,
                Mobile: deleteTarget.lead?.mobile,
                Project: deleteTarget.lead?.project,
                Stage: deleteTarget.lead?.stage,
              }
            : {
                Count: `${deleteTarget?.count} leads selected`,
                Endpoint: "POST /leads/bulk-delete",
              }
        }
      />
    </div>
  );
}
