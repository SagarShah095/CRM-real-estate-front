"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import ProvisionTenantModal from "@/components/super-admin/ProvisionTenantModal";
import EditTenantModal from "@/components/super-admin/EditTenantModal";
import ViewTenantModal from "@/components/super-admin/ViewTenantModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import PageLoader from "@/components/common/PageLoader";
import {
  useAdminsQuery,
  useUpdateAdminStatusMutation,
  useDeleteAdminMutation,
} from "@/hooks/useAdminsQuery";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  X,
  Filter,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function TenantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extract query parameters from URL
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = parseInt(searchParams.get("pageSize") || "10", 10);
  const limitParam = parseInt(searchParams.get("limit") || "10", 10);
  const searchUrlParam = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "All";
  const planNameParam = searchParams.get("planName") || "All Plans";
  const licensedModuleParam =
    searchParams.get("licensedModule") || "All Modules";
  const sortByParam = searchParams.get("sortBy") || "updatedAt";
  const sortOrderParam = searchParams.get("sortOrder") || "desc";

  // State
  const [searchQuery, setSearchQuery] = useState(searchUrlParam);

  // Modals state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [selectedTenantForView, setSelectedTenantForView] = useState(null);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState(null);

  // Status Change Confirmation Modal state
  const [selectedTenantForStatus, setSelectedTenantForStatus] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete Confirmation Modal state
  const [selectedTenantForDelete, setSelectedTenantForDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // TanStack Query & Mutations
  const queryObj = {
    page: pageParam,
    pageSize: pageSizeParam,
    limit: limitParam,
    search: searchUrlParam,
    status: statusParam,
    planName: planNameParam,
    licensedModule: licensedModuleParam,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
  };

  const {
    data: responseData,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useAdminsQuery(queryObj);

  const updateStatusMutation = useUpdateAdminStatusMutation();
  const deleteAdminMutation = useDeleteAdminMutation();

  // Process tenants and pagination from query response
  let tenants = [];
  let totalItems = 0;

  if (responseData?.success && Array.isArray(responseData.data)) {
    tenants = responseData.data;
    totalItems =
      responseData.pagination?.total ||
      responseData.total ||
      responseData.count ||
      tenants.length;
  } else if (Array.isArray(responseData)) {
    tenants = responseData;
    totalItems = responseData.length;
  } else if (Array.isArray(responseData?.data)) {
    tenants = responseData.data;
    totalItems =
      responseData.pagination?.total ||
      responseData.total ||
      responseData.count ||
      tenants.length;
  }

  const limit = limitParam || pageSizeParam || 10;
  const computedTotalPages =
    responseData?.pagination?.totalPages ||
    Math.max(1, Math.ceil(totalItems / limit));

  const paginationInfo = {
    total: totalItems,
    page: pageParam,
    pageSize: limit,
    totalPages: computedTotalPages,
  };

  const errorMessage = isError
    ? queryError?.message || "Failed to load tenants list."
    : "";

  // Sync searchQuery state when URL changes externally
  useEffect(() => {
    setSearchQuery(searchUrlParam);
  }, [searchUrlParam]);

  // Update browser URL search params
  const updateUrlParams = useCallback(
    (newParams) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          value === "All" ||
          value === "All Plans" ||
          value === "All Modules"
        ) {
          currentParams.delete(key);
        } else {
          currentParams.set(key, String(value));
        }
      });

      const queryString = currentParams.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Request status toggle modal
  const handleRequestStatusToggle = (tenant) => {
    setSelectedTenantForStatus(tenant);
    setIsStatusModalOpen(true);
  };

  // Confirm status toggle
  const handleConfirmStatusToggle = async () => {
    if (!selectedTenantForStatus) return;
    const tenantId = selectedTenantForStatus._id || selectedTenantForStatus.id;
    if (!tenantId) return;

    const currentStatus = String(
      selectedTenantForStatus.status || "",
    ).toLowerCase();
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";

    setIsUpdatingStatus(true);

    try {
      const res = await updateStatusMutation.mutateAsync({
        id: tenantId,
        status: nextStatus,
      });

      if (res?.success !== false && !res?.error) {
        setIsStatusModalOpen(false);
      } else {
        alert(res?.message || "Failed to update tenant status.");
        setIsStatusModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setIsStatusModalOpen(false);
    } finally {
      setIsUpdatingStatus(false);
      setSelectedTenantForStatus(null);
    }
  };

  // Request delete modal
  const handleRequestDelete = (tenant) => {
    setSelectedTenantForDelete(tenant);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!selectedTenantForDelete) return;
    const tenantId = selectedTenantForDelete._id || selectedTenantForDelete.id;
    if (!tenantId) return;

    setIsDeleting(true);

    try {
      const res = await deleteAdminMutation.mutateAsync(tenantId);

      if (res?.success !== false && !res?.error) {
        setIsDeleteModalOpen(false);
      } else {
        alert(res?.message || "Failed to delete tenant.");
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to delete tenant:", err);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setSelectedTenantForDelete(null);
    }
  };

  // Filter handlers
  const handleTabChange = (tab) => {
    updateUrlParams({ status: tab, page: 1 });
  };

  const handlePlanChange = (e) => {
    updateUrlParams({ planName: e.target.value, page: 1 });
  };

  const handleLicensedModuleChange = (e) => {
    updateUrlParams({ licensedModule: e.target.value, page: 1 });
  };

  const handleSortByChange = (e) => {
    updateUrlParams({ sortBy: e.target.value, page: 1 });
  };

  const handleSortOrderToggle = () => {
    const nextOrder = sortOrderParam === "desc" ? "asc" : "desc";
    updateUrlParams({ sortOrder: nextOrder, page: 1 });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    updateUrlParams({ search: searchQuery, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateUrlParams({ search: "", page: 1 });
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    router.push(pathname, { scroll: false });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationInfo.totalPages) return;
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (e) => {
    const newSize = e.target.value;
    updateUrlParams({ pageSize: newSize, limit: newSize, page: 1 });
  };

  // Helper for initials badge
  const getInitials = (companyName, adminName) => {
    const title = companyName || adminName || "TN";
    const words = title.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  // Helper for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "12-Jan-2026";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(dateString);
    }
  };

  const hasActiveFilters =
    searchUrlParam ||
    (statusParam && statusParam !== "All") ||
    (planNameParam && planNameParam !== "All Plans") ||
    (licensedModuleParam && licensedModuleParam !== "All Modules") ||
    sortByParam !== "updatedAt" ||
    sortOrderParam !== "desc";

  const startRecord =
    paginationInfo.total > 0
      ? (paginationInfo.page - 1) * paginationInfo.pageSize + 1
      : 0;
  const endRecord = Math.min(
    paginationInfo.page * paginationInfo.pageSize,
    paginationInfo.total,
  );

  return (
    <SuperAdminLayout
      breadcrumb="Platform > Tenants"
      tenantCount={paginationInfo.total || tenants.length}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Provision Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tenants Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {paginationInfo.total.toLocaleString()} total registered real
              estate businesses across the platform
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => refetch()}
              title="Refresh Tenants"
              className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Provision New Tenant</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0">
              {["All", "Active", "Trial", "Suspended"].map((tab) => {
                const isActive =
                  statusParam.toLowerCase() === tab.toLowerCase();
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 flex-1 max-w-md"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID or domain..."
                  className="w-full pl-10 pr-9 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Detailed Filters Row: Plan, Module, Sort By, Sort Order */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Plan Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Plan:</span>
                <select
                  value={planNameParam}
                  onChange={handlePlanChange}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-amber-500 text-slate-700 cursor-pointer"
                >
                  <option value="All Plans">All Plans</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Pro">Pro</option>
                  <option value="Basic">Basic</option>
                  <option value="test">Test</option>
                </select>
              </div>

              {/* Licensed Module Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span>Module:</span>
                <select
                  value={licensedModuleParam}
                  onChange={handleLicensedModuleChange}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-amber-500 text-slate-700 cursor-pointer"
                >
                  <option value="All Modules">All Modules</option>
                  <option value="leads">Leads</option>
                  <option value="properties">Properties</option>
                  <option value="deals">Deals</option>
                  <option value="reports">Reports</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span>Sort By:</span>
                <select
                  value={sortByParam}
                  onChange={handleSortByChange}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-amber-500 text-slate-700 cursor-pointer"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Date Provisioned</option>
                  <option value="companyName">Company Name</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order Direction Toggle */}
              <button
                type="button"
                onClick={handleSortOrderToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                title={`Current sort order: ${sortOrderParam.toUpperCase()}. Click to change.`}
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <span className="uppercase">{sortOrderParam}</span>
              </button>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetAllFilters}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Component */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Organization</th>
                  <th className="py-3.5 px-4">Tenant ID</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Status & Toggle</th>
                  <th className="py-3.5 px-4">Provisioned</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200" />
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : tenants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400"
                    >
                      <Building2 className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600 text-sm">
                        No tenants found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search query or URL filter
                        parameters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant, index) => {
                    const company =
                      tenant.companyName || tenant.name || "Real Estate Tenant";
                    const email =
                      tenant?.primaryContact?.email ||
                      tenant.email ||
                      "contact@tenant.com";
                    const rawId = String(
                      tenant?._id || tenant.id || index + 1000,
                    );
                    const tenantId =
                      tenant.id ||
                      tenant.tenantId ||
                      `TN_${rawId.substring(Math.max(0, rawId.length - 6)).toUpperCase()}`;
                    const displayTenantId =
                      tenantId.length > 6
                        ? `${tenantId.slice(0, 6)}...`
                        : tenantId;

                    const plan =
                      tenant.planName || tenant.plan || "Enterprise Builder";
                    const displayPlan = plan.trim().split(" ")[0];

                    const statusStr = String(tenant.status || "").toLowerCase();
                    const isSuspended = statusStr === "suspended";
                    const isTrial = statusStr === "trial";

                    const bgColors = [
                      "bg-amber-100 text-amber-900 border-amber-200",
                      "bg-slate-200 text-slate-900 border-slate-300",
                      "bg-emerald-100 text-emerald-900 border-emerald-200",
                      "bg-rose-100 text-rose-900 border-rose-200",
                      "bg-blue-100 text-blue-900 border-blue-200",
                    ];
                    const badgeBg = bgColors[index % bgColors.length];

                    return (
                      <tr
                        key={tenant._id || tenant.id || index}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Organization */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${badgeBg}`}
                            >
                              {getInitials(company, tenant.name)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 hover:text-amber-600 cursor-pointer">
                                {company}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Tenant ID */}
                        <td
                          className="py-4 px-4 font-mono text-[11px] text-slate-500 font-bold"
                          title={tenantId}
                        >
                          {displayTenantId}
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                              displayPlan.toLowerCase().includes("enterprise")
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : displayPlan.toLowerCase().includes("pro")
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {displayPlan}
                          </span>
                        </td>

                        {/* Status & Toggle */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {isSuspended ? (
                              <span className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span>Suspended</span>
                              </span>
                            ) : isTrial ? (
                              <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                <span>Trial</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRequestStatusToggle(tenant)}
                              title={`Toggle status to ${
                                isSuspended ? "Active" : "Suspended"
                              }`}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                !isSuspended ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  !isSuspended
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </td>

                        {/* Provisioned Date */}
                        <td className="py-4 px-4 text-slate-500">
                          {formatDate(tenant.createdAt || tenant.updatedAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="View Tenant"
                              onClick={() => setSelectedTenantForView(tenant)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-amber-600 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              title="Edit Tenant"
                              onClick={() => setSelectedTenantForEdit(tenant)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              title="Delete Tenant"
                              onClick={() => handleRequestDelete(tenant)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              <span>Delete</span>
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
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-4">
              <span>
                Showing{" "}
                {paginationInfo.total > 0 ? `${startRecord}-${endRecord}` : "0"}{" "}
                of {paginationInfo.total.toLocaleString()} tenants
              </span>

              {/* Page Size Select */}
              <div className="flex items-center gap-1.5">
                <span>Per Page:</span>
                <select
                  value={paginationInfo.pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(paginationInfo.page - 1)}
                disabled={paginationInfo.page <= 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold">
                Page {paginationInfo.page} of {paginationInfo.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(paginationInfo.page + 1)}
                disabled={
                  paginationInfo.page >= paginationInfo.totalPages || isLoading
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Provision Tenant Modal */}
      <ProvisionTenantModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* View Tenant Details Modal */}
      <ViewTenantModal
        isOpen={Boolean(selectedTenantForView)}
        onClose={() => setSelectedTenantForView(null)}
        tenant={selectedTenantForView}
      />

      {/* Edit Tenant Modal */}
      <EditTenantModal
        isOpen={Boolean(selectedTenantForEdit)}
        onClose={() => setSelectedTenantForEdit(null)}
        onSuccess={() => {}}
        tenant={selectedTenantForEdit}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedTenantForStatus(null);
        }}
        onConfirm={handleConfirmStatusToggle}
        title="Change Tenant Status"
        message={`Are you sure you want to change the status of ${
          selectedTenantForStatus?.companyName || "this tenant"
        } to ${
          String(selectedTenantForStatus?.status || "").toLowerCase() ===
          "suspended"
            ? "Active"
            : "Suspended"
        }?`}
        confirmText="Confirm Status Change"
        variant="warning"
        isLoading={isUpdatingStatus}
      />

      {/* Delete Tenant Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTenantForDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Tenant Organization"
        message={`Are you sure you want to permanently delete ${
          selectedTenantForDelete?.companyName || "this tenant"
        }? This action cannot be undone.`}
        confirmText="Delete Tenant"
        variant="danger"
        isLoading={isDeleting}
      />
    </SuperAdminLayout>
  );
}

export default function TenantsManagementPage() {
  return (
    <Suspense
      fallback={
        <SuperAdminLayout breadcrumb="Platform > Tenants">
          <PageLoader text="Loading Tenants Management..." />
        </SuperAdminLayout>
      }
    >
      <TenantsContent />
    </Suspense>
  );
}
