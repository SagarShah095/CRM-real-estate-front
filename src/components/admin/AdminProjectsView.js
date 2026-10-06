"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Building,
  Plus,
  Search,
  Filter,
  FilterX,
  Download,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import CreateProjectDrawer from "./CreateProjectDrawer";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  useProjectsQuery,
  useDeleteProjectMutation,
} from "@/hooks/useProjectsQuery";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProjectsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [toast, setToast] = useState(null);

  // TanStack Query for projects
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useProjectsQuery({}, { enabled: true });

  const deleteMutation = useDeleteProjectMutation();

  // Initial project list starts clean (no mock projects showing before API completes)
  const [projectsList, setProjectsList] = useState([]);
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);

  // Sync backend projects if available from /api/v1/projects
  useEffect(() => {
    if (!apiResponse) return;

    if (apiResponse.success === false) {
      setHasLoadedProjects(true);
      return;
    }

    const serverProjects =
      apiResponse?.data?.projects ||
      apiResponse?.data ||
      apiResponse?.projects ||
      (Array.isArray(apiResponse) ? apiResponse : null);

    if (Array.isArray(serverProjects)) {
      setProjectsList(serverProjects);
    } else {
      setProjectsList([]);
    }

    setHasLoadedProjects(true);
  }, [apiResponse]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // URL Drawer Synchronization Helper
  const updateDrawerInUrl = useCallback(
    (action, id = null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (action) {
        params.set("drawer", action);
        if (id) {
          params.set("projectId", id);
        } else {
          params.delete("projectId");
          params.delete("id");
        }
      } else {
        params.delete("drawer");
        params.delete("projectId");
        params.delete("id");
      }
      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const selectedProjectRef = useRef(selectedProjectForEdit);
  useEffect(() => {
    selectedProjectRef.current = selectedProjectForEdit;
  }, [selectedProjectForEdit]);

  // Helper to locate project data from cache or local state (identical to AdminUsersView)
  const findProjectById = useCallback(
    (targetId) => {
      if (!targetId) return null;
      let found = null;

      // 1. Check current ref in memory
      if (
        selectedProjectRef.current &&
        ((selectedProjectRef.current._id || selectedProjectRef.current.id) ===
          targetId ||
          String(
            selectedProjectRef.current._id || selectedProjectRef.current.id
          ) === String(targetId)) &&
        selectedProjectRef.current.name
      ) {
        return selectedProjectRef.current;
      }

      // 2. Search React Query caches
      const allProjectQueries = queryClient.getQueriesData({
        queryKey: ["projects"],
      });
      for (const [, queryData] of allProjectQueries) {
        if (!queryData) continue;
        const list =
          queryData?.data?.projects ||
          queryData?.data ||
          queryData?.projects ||
          (Array.isArray(queryData) ? queryData : null);

        if (Array.isArray(list)) {
          found = list.find(
            (p) =>
              (p._id || p.id) === targetId ||
              String(p._id || p.id) === String(targetId)
          );
          if (found && found.name) break;
        }
      }

      // 3. Search local projectsList
      if (!found || !found.name) {
        const localMatch = projectsList.find(
          (p) =>
            (p._id || p.id) === targetId ||
            String(p._id || p.id) === String(targetId)
        );
        if (localMatch && localMatch.name) {
          found = localMatch;
        }
      }

      return found;
    },
    [queryClient, projectsList]
  );

  const handleOpenCreateDrawer = () => {
    selectedProjectRef.current = null;
    setSelectedProjectForEdit(null);
    setIsCreateDrawerOpen(true);
    updateDrawerInUrl("create");
  };

  const handleOpenEditDrawer = (project) => {
    const targetId = project.id || project._id;
    selectedProjectRef.current = project;
    setSelectedProjectForEdit(project);
    setIsCreateDrawerOpen(true);
    updateDrawerInUrl("edit", targetId);
  };

  const handleCloseDrawer = () => {
    setIsCreateDrawerOpen(false);
    selectedProjectRef.current = null;
    setSelectedProjectForEdit(null);
    updateDrawerInUrl(null);
  };

  // Synchronize URL parameters on page load / browser navigation
  useEffect(() => {
    const drawerParam = searchParams.get("drawer");
    const projectIdParam =
      searchParams.get("projectId") || searchParams.get("id");

    if (drawerParam === "create" || drawerParam === "createProject") {
      setSelectedProjectForEdit(null);
      setIsCreateDrawerOpen(true);
    } else if (
      (drawerParam === "edit" || drawerParam === "editProject") &&
      projectIdParam
    ) {
      const found = findProjectById(projectIdParam);
      if (found) {
        selectedProjectRef.current = found;
        setSelectedProjectForEdit(found);
      } else {
        setSelectedProjectForEdit((prev) => {
          if (
            prev &&
            ((prev._id || prev.id) === projectIdParam ||
              String(prev._id || prev.id) === String(projectIdParam)) &&
            prev.name
          ) {
            return prev; // Never wipe out existing full project data!
          }
          return { id: projectIdParam, _id: projectIdParam };
        });
      }
      setIsCreateDrawerOpen(true);
    } else {
      setIsCreateDrawerOpen(false);
      selectedProjectRef.current = null;
      setSelectedProjectForEdit(null);
    }
  }, [searchParams, findProjectById]);

  // On Project Created
  const handleProjectCreated = (newProject) => {
    setProjectsList((prev) => [newProject, ...prev]);
    showToast("success", `Project "${newProject.name}" created successfully!`);
    handleCloseDrawer();
    refetch();
  };

  // On Project Updated
  const handleProjectUpdated = (updatedProject) => {
    const targetId = updatedProject.id || updatedProject._id;
    setProjectsList((prev) =>
      prev.map((item) =>
        (item.id || item._id) === targetId ||
        String(item.id || item._id) === String(targetId)
          ? { ...item, ...updatedProject }
          : item
      )
    );
    showToast("success", `Project "${updatedProject.name}" updated successfully!`);
    handleCloseDrawer();
    refetch();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    const targetId = projectToDelete.id || projectToDelete._id;

    try {
      await deleteMutation.mutateAsync(targetId);
      setProjectsList((prev) =>
        prev.filter((p) => (p.id || p._id) !== targetId)
      );
      showToast(
        "success",
        `Project "${projectToDelete.name}" was deleted successfully.`
      );
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      showToast("error", err.message || "Failed to delete project");
    }
  };

  // Filtered List
  const filteredProjects = (projectsList || []).filter((p) => {
    if (!p) return false;
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reraNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      p.status === selectedStatus ||
      p.status?.toLowerCase() === selectedStatus.toLowerCase();

    const matchesType =
      selectedType === "All" ||
      p.projectType === selectedType ||
      p.projectType?.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalUnitsCount = (projectsList || []).reduce(
    (sum, p) => sum + (Number(p?.totalUnits) || 0),
    0
  );
  const underConstructionCount = (projectsList || []).filter(
    (p) => p?.status === "under_construction"
  ).length;
  const readyCount = (projectsList || []).filter(
    (p) => p?.status === "ready_to_move" || p?.status === "completed"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              CRM / Master Developments
            </span>
            {(isLoading || isFetching) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                Syncing /api/v1/projects data...
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Real Estate Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage residential, commercial & township developments, towers, units, and RERA certifications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh from server"
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading || isFetching ? "animate-spin text-primary" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateDrawer}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Project</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Projects
            </p>
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {!hasLoadedProjects && isLoading ? (
              <span className="inline-block h-7 w-12 bg-slate-200 rounded animate-pulse" />
            ) : (
              projectsList.length
            )}
          </p>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block">
            {projectsList.length > 0 ? "Active Portfolios" : "No Projects"}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Under Construction
            </p>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {!hasLoadedProjects && isLoading ? (
              <span className="inline-block h-7 w-12 bg-slate-200 rounded animate-pulse" />
            ) : (
              underConstructionCount
            )}
          </p>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-2 inline-block">
            In Progress
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Units
            </p>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {!hasLoadedProjects && isLoading ? (
              <span className="inline-block h-7 w-12 bg-slate-200 rounded animate-pulse" />
            ) : (
              totalUnitsCount
            )}
          </p>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-2 inline-block">
            Inventory Capacity
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              RERA Certified
            </p>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {!hasLoadedProjects && isLoading ? (
              <span className="inline-block h-7 w-12 bg-slate-200 rounded animate-pulse" />
            ) : projectsList.length > 0 ? (
              "100%"
            ) : (
              "0%"
            )}
          </p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block">
            Compliant
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, code (e.g. SKPIN), city, or RERA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="under_construction">Under Construction</option>
            <option value="planning">Planning / Pre-Launch</option>
            <option value="ready_to_move">Ready to Move</option>
            <option value="completed">Completed</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">Type: All</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="mixed">Mixed</option>
            <option value="villa">Villas</option>
          </select>
        </div>
      </div>

      {/* Projects Cards Grid / Skeleton Loading / Empty State */}
      {isLoading || !hasLoadedProjects ? (
        /* 1. Loading Skeleton Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-16 bg-slate-200 rounded-lg"></div>
                <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-44 bg-slate-200 rounded-md"></div>
                <div className="h-3.5 w-60 bg-slate-100 rounded"></div>
              </div>
              <div className="h-9 w-full bg-slate-100 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-slate-100 rounded-xl"></div>
                <div className="h-12 bg-slate-100 rounded-xl"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 rounded"></div>
                <div className="h-5 w-16 bg-slate-100 rounded"></div>
              </div>
              <div className="h-10 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-100 rounded"></div>
                <div className="h-4 w-12 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* 2. Empty State: "Project Not Found" (matches user section) */
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">
              {searchQuery || selectedStatus !== "All" || selectedType !== "All"
                ? "No Matching Projects Found"
                : "Project Not Found"}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">
              {searchQuery || selectedStatus !== "All" || selectedType !== "All"
                ? "We couldn't find any projects matching your filter criteria. Try adjusting your query or resetting all filters."
                : "There are currently no projects registered in the database. Add a new project to populate this directory."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery ||
              selectedStatus !== "All" ||
              selectedType !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                  setSelectedType("All");
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <FilterX className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreateDrawer}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Project</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const statusLabel =
              p.status === "under_construction"
                ? "Under Construction"
                : p.status === "ready_to_move"
                  ? "Ready to Move"
                  : p.status === "planning"
                    ? "Pre-Launch"
                    : p.status || "Active";

            const statusColor =
              p.status === "under_construction"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : p.status === "ready_to_move" || p.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <div
                key={p._id || p.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-mono font-bold tracking-wider">
                      {p.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                        {p.projectType || "Residential"}
                      </span>
                    </div>
                  </div>

                  {/* Project Title */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {p.location?.address
                          ? `${p.location.address}, ${p.location.city || ""}`
                          : p.location?.city || "Prime Location"}
                      </span>
                    </p>
                  </div>

                  {/* RERA Badge */}
                  {p.reraNumber && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{p.reraNumber}</span>
                    </div>
                  )}

                  {/* Towers & Units Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Towers
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {p.totalTowers || (Array.isArray(p.towers) ? p.towers.length : 1)} Towers
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Inventory
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {p.totalUnits || 0} Units
                      </span>
                    </div>
                  </div>

                  {/* Wings Chips */}
                  {Array.isArray(p.towers) && p.towers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.towers.slice(0, 3).map((tower, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          {tower}
                        </span>
                      ))}
                      {p.towers.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                          +{p.towers.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Amenities list */}
                  {Array.isArray(p.amenities) && p.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
                        >
                          ✓ {amenity}
                        </span>
                      ))}
                      {p.amenities.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                          +{p.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {p.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 pt-1">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {p.expectedCompletionDate
                        ? `Target ${new Date(p.expectedCompletionDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                        : "2026 Target"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDrawer(p)}
                      title="Edit Project"
                      className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectToDelete(p);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Delete Project"
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Right Side Slide-Over Drawer for Create / Edit Project */}
      <CreateProjectDrawer
        isOpen={isCreateDrawerOpen}
        onClose={handleCloseDrawer}
        onProjectCreated={handleProjectCreated}
        onProjectUpdated={handleProjectUpdated}
        editProject={selectedProjectForEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${projectToDelete?.name}"? All associated tower and inventory configurations will be removed.`}
        confirmText="Yes, Delete Project"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
