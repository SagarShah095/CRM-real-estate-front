"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  X,
  FilterX,
  CheckCircle2,
  Zap,
} from "lucide-react";
import CreateUserDrawer from "./CreateUserDrawer";
import ViewUserModal from "./ViewUserModal";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { useAuthContext } from "@/context/AuthContext";
import { storage } from "@/utils/storage";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/services/api";

export default function AdminUsersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryClient = useQueryClient();
  const { user: authUser } = useAuthContext();
  const currentUser = authUser || storage.getUser();
  const roleStr = String(currentUser?.role || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-");

  const isAdmin =
    roleStr === "admin" ||
    roleStr === "administrator" ||
    roleStr === "tenant-admin" ||
    roleStr === "sub-admin" ||
    roleStr === "sub_admin" ||
    roleStr === "super-admin" ||
    roleStr === "superadmin" ||
    roleStr === "super_admin" ||
    Boolean(currentUser?.isAdmin) ||
    Boolean(currentUser?.isSuperAdmin);

  const [activeTab, setActiveTab] = useState("Users");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Query users from /api/v1/users (enabled immediately on mount)
  const {
    data: apiUsersResponse,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useUsersQuery({}, { enabled: true });

  const isInitialLoading = isUsersLoading && !apiUsersResponse;
  const isInitialError = isUsersError || apiUsersResponse?.success === false;
  // Initial user list starts clean (no mock users showing on refresh)
  const [usersList, setUsersList] = useState([]);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);

  // Sync backend users if available from /api/v1/users
  useEffect(() => {
    if (!apiUsersResponse) return;

    if (apiUsersResponse.success === false) {
      setHasLoadedUsers(true);
      return;
    }

    const rawUsers =
      apiUsersResponse.data?.users ||
      apiUsersResponse.data ||
      apiUsersResponse.users ||
      (Array.isArray(apiUsersResponse) ? apiUsersResponse : null);

    if (Array.isArray(rawUsers)) {
      const formatted = rawUsers.filter(Boolean).map((u, i) => {
        let roleName = "Employee";
        const r = String(u.role || "")
          .toLowerCase()
          .trim();
        if (r.includes("channel") || r === "cp" || r === "channel_partner") {
          roleName = "Channel Partner";
        } else if (r.includes("sub") || r === "sub_admin") {
          roleName = "Sub-Admin";
        } else if (u.role) {
          roleName = u.role.charAt(0).toUpperCase() + u.role.slice(1);
        }

        const resolvedRegion =
          u.region && u.region !== "—"
            ? u.region
            : u.city || u.location || "Ahmedabad";

        const resolvedDept =
          u.department && u.department !== "—"
            ? u.department
            : u.team && u.team !== "—"
              ? u.team
              : "Direct Sales";

        const targetCount =
          u.monthlyTargetCount ??
          u.monthlyTargetDeals ??
          u.targets?.count ??
          u.targets?.deals ??
          5;

        const targetValue =
          u.monthlyTargetValue ??
          u.targetValue ??
          u.targets?.value ??
          u.targets?.amount ??
          15000000;

        const incentivePlan =
          u.incentivePlanId || u.incentivePlan || "plan-incentive-standard";

        const companyName =
          u.companyName || u.company || "Shree Gajanand Real Estate";

        const gstin = u.gstin || u.gstNumber || "24AAACS9988Z1Z2";

        const reraNo =
          u.reraRegistrationNo || u.reraNo || "PR/GJ/AHMEDABAD/2026/00981";

        const brokeragePlan = u.brokeragePlanId || "plan-brokerage-standard";

        const rewardPlan = u.rewardPlanId || "plan-reward-gold";

        const bankDetails = u.bankDetails ||
          u.bank || {
            bankName: "State Bank of India",
            accountNumber: "998877665544",
            ifscCode: "SBIN0001234",
          };

        return {
          id: u._id || u.id || `api-${i}`,
          createdDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }) +
              " " +
              new Date(u.createdAt).toLocaleTimeString("en-US", {
                hour12: false,
              })
            : u.createdDate || "Recent",
          name:
            u.name ||
            `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
            "User",
          lastLogin:
            u.lastLogin && u.lastLogin !== "—"
              ? u.lastLogin
              : "Sep 19 2026 9:36AM",
          email: u.email && u.email !== "—" ? u.email : "user@skyline.com",
          mobile: u.phone || u.contactNumber || u.mobile || "9825123456",
          role: roleName,
          designation:
            u.designation && u.designation !== "—"
              ? u.designation
              : "Sales Executive",
          region: resolvedRegion,
          userName:
            u.userName || (u.email ? u.email.split("@")[0] : `user${i}`),
          team: resolvedDept,
          department: resolvedDept,
          callLogSync: u.useSimBasedCalling ?? true,
          syncLast: "Active",
          status: u.status || "Active",
          monthlyTargetCount: targetCount,
          monthlyTargetValue: targetValue,
          incentivePlanId: incentivePlan,
          companyName: companyName,
          gstin: gstin,
          reraRegistrationNo: reraNo,
          brokeragePlanId: brokeragePlan,
          rewardPlanId: rewardPlan,
          bankDetails: bankDetails,
          _raw: {
            ...u,
            region: resolvedRegion,
            department: resolvedDept,
            team: resolvedDept,
            monthlyTargetCount: targetCount,
            monthlyTargetValue: targetValue,
            incentivePlanId: incentivePlan,
            companyName: companyName,
            gstin: gstin,
            reraRegistrationNo: reraNo,
            brokeragePlanId: brokeragePlan,
            rewardPlanId: rewardPlan,
            bankDetails: bankDetails,
          },
        };
      });

      setUsersList(formatted);
    }

    setHasLoadedUsers(true);
  }, [apiUsersResponse]);

  // Helper to locate user data from cache or local state
  const findUserById = useCallback(
    (targetId) => {
      if (!targetId) return null;
      let found = null;
      const allUsersQueries = queryClient.getQueriesData({
        queryKey: ["users"],
      });
      for (const [, queryData] of allUsersQueries) {
        if (!queryData) continue;
        const list =
          queryData?.data?.users ||
          queryData?.data ||
          queryData?.users ||
          (Array.isArray(queryData) ? queryData : null);

        if (Array.isArray(list)) {
          found = list.find(
            (u) =>
              (u._id || u.id) === targetId ||
              String(u._id || u.id) === String(targetId),
          );
          if (found) break;
        }
      }
      if (!found) {
        const localMatch = usersList.find(
          (u) => u.id === targetId || String(u.id) === String(targetId),
        );
        found = localMatch?._raw || localMatch || null;
      }
      return found;
    },
    [queryClient, usersList],
  );

  // Sync drawer action state with URL query parameters
  const updateDrawerInUrl = useCallback(
    (drawerAction, id = null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (drawerAction) {
        params.set("drawer", drawerAction);
        if (id) {
          params.set("userId", id);
        } else {
          params.delete("userId");
          params.delete("id");
        }
      } else {
        params.delete("drawer");
        params.delete("userId");
        params.delete("id");
        params.delete("viewUser");
      }
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Handlers for Drawer & Modal transitions
  const handleOpenCreateDrawer = () => {
    setIsCreateModalOpen(true);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    updateDrawerInUrl("create");
  };

  const handleEditUser = (targetUser) => {
    const targetId = targetUser.id || targetUser._id;
    const userToEdit = findUserById(targetId) || targetUser;
    setSelectedUserForEdit(userToEdit);
    setIsEditModalOpen(true);
    setIsCreateModalOpen(false);
    setIsViewModalOpen(false);
    updateDrawerInUrl("edit", targetId);
  };

  const handleViewUser = (targetUser) => {
    const targetId = targetUser.id || targetUser._id;
    const cachedUser = findUserById(targetId) || targetUser;
    setSelectedUserForView(cachedUser);
    setIsViewModalOpen(true);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    updateDrawerInUrl("view", targetId);
  };

  const handleCloseAllDrawers = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUserForEdit(null);
    setIsViewModalOpen(false);
    setSelectedUserForView(null);
    updateDrawerInUrl(null);
  };

  // Synchronize URL parameters with Right Side Drawer / Modals
  useEffect(() => {
    const drawerParam = searchParams.get("drawer");
    const userIdParam = searchParams.get("userId") || searchParams.get("id");
    const viewUserParam = searchParams.get("viewUser");

    if (drawerParam === "create" || drawerParam === "createUser") {
      setIsCreateModalOpen(true);
      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
    } else if (
      (drawerParam === "edit" || drawerParam === "editUser") &&
      userIdParam
    ) {
      setIsCreateModalOpen(false);
      setIsViewModalOpen(false);
      const userToEdit = findUserById(userIdParam);
      if (userToEdit) {
        setSelectedUserForEdit(userToEdit);
      } else {
        setSelectedUserForEdit({ _id: userIdParam, id: userIdParam });
      }
      setIsEditModalOpen(true);
    } else if (drawerParam === "view" || viewUserParam) {
      const targetId = viewUserParam || userIdParam;
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      const cachedUser = findUserById(targetId);
      if (cachedUser) {
        setSelectedUserForView(cachedUser);
      } else if (targetId) {
        setSelectedUserForView({ _id: targetId, id: targetId });
      }
      setIsViewModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedUserForEdit(null);
      setIsViewModalOpen(false);
      setSelectedUserForView(null);
    }
  }, [searchParams, findUserById]);

  // Handler when user is created
  const handleUserCreated = (newUser) => {
    setUsersList((prev) => [newUser, ...prev]);
    showToast("success", `User "${newUser.name}" created successfully!`);
    handleCloseAllDrawers();
    if (isAdmin && refetchUsers) {
      refetchUsers();
    }
  };

  // Handler when user is updated via PUT /api/v1/users/{id}
  const handleUserUpdated = (updatedUser) => {
    const targetId = updatedUser.id || updatedUser._id;
    setUsersList((prev) =>
      prev.map((item) => {
        const itemId = item.id || item._id;
        if (itemId === targetId || String(itemId) === String(targetId)) {
          return {
            ...item,
            name: updatedUser.name || item.name,
            email: updatedUser.email || item.email,
            mobile:
              updatedUser.phone ||
              updatedUser.contactNumber ||
              updatedUser.mobile ||
              item.mobile,
            role: updatedUser.role || item.role,
            designation: updatedUser.designation || item.designation,
            region: updatedUser.region || item.region,
            team: updatedUser.department || updatedUser.team || item.team,
            callLogSync: updatedUser.useSimBasedCalling ?? item.callLogSync,
            _raw: updatedUser._raw || updatedUser,
          };
        }
        return item;
      }),
    );

    // Refresh query cache and close drawer
    queryClient.invalidateQueries({ queryKey: ["users"] });
    showToast("success", `User "${updatedUser.name}" updated successfully!`);
    handleCloseAllDrawers();
  };

  // Delete option: Open confirmation modal
  const handleOpenDeleteModal = (targetUser) => {
    setUserToDelete(targetUser);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete: DELETE /api/v1/users/{id}
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id || userToDelete._id;
    setIsDeleting(true);

    try {
      const response = await deleteUser(targetId);

      if (response?.success !== false && !response?.error) {
        // Remove from local table state
        setUsersList((prev) =>
          prev.filter(
            (u) =>
              (u.id || u._id) !== targetId &&
              String(u.id || u._id) !== String(targetId),
          ),
        );

        // Update React Query cache
        queryClient.setQueriesData({ queryKey: ["users"] }, (old) => {
          if (!old) return old;
          const filterItem = (item) => (item._id || item.id) !== targetId;
          if (Array.isArray(old)) return old.filter(filterItem);
          if (Array.isArray(old?.data)) {
            return { ...old, data: old.data.filter(filterItem) };
          }
          if (Array.isArray(old?.data?.users)) {
            return {
              ...old,
              data: {
                ...old.data,
                users: old.data.users.filter(filterItem),
              },
            };
          }
          return old;
        });

        queryClient.invalidateQueries({ queryKey: ["users"] });
        showToast(
          "success",
          `User "${userToDelete.name}" was permanently deleted.`,
        );
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        showToast(
          "error",
          response?.message ||
            "Failed to delete user via DELETE /api/v1/users/{id}.",
        );
      }
    } catch (err) {
      console.error("[Delete User Error]:", err);
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to delete user.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users list based on filters and search
  const filteredUsers = (usersList || []).filter((u) => {
    if (!u) return false;
    if (selectedTeam && u.team !== selectedTeam) return false;
    if (selectedDesignation && u.designation !== selectedDesignation)
      return false;
    if (
      searchQuery &&
      !u.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.userName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.mobile?.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const activeCount = (usersList || []).filter(
    (u) => u?.status === "Active",
  ).length;
  const inactiveCount = (usersList || []).filter(
    (u) => u && u.status !== "Active",
  ).length;

  // API has completed perfectly when we have a successful response and not loading, OR users are already loaded
  // const hasCompletedPerfectCall =
  //   (Boolean(apiUsersResponse) &&
  //     apiUsersResponse.success !== false &&
  //     !isUsersLoading) ||
  //   usersList.length > 0;

  // const isApiNotPerfect = !hasCompletedPerfectCall;

  // Auto-retry fetching if API failed to call perfectly
  useEffect(() => {
    if (
      (isUsersError ||
        (apiUsersResponse && apiUsersResponse.success === false)) &&
      usersList.length === 0
    ) {
      const retryTimer = setTimeout(() => {
        refetchUsers();
      }, 3000);
      return () => clearTimeout(retryTimer);
    }
  }, [isUsersError, apiUsersResponse, usersList.length, refetchUsers]);

  // When API call is not perfectly completed, ONLY SHOW LOADER!
  // "dont show any other think only show loader"
  // if (isApiNotPerfect) {
  //   return (
  //     <div className="min-h-[75vh] w-full flex items-center justify-center p-6 animate-in fade-in duration-300">
  //       <div className="relative flex items-center justify-center">
  //         {/* Subtle primary pulse glow */}
  //         <div className="absolute h-24 w-24 rounded-full bg-primary/10 blur-xl animate-pulse" />
  //         {/* Outer track */}
  //         <div className="h-16 w-16 rounded-full border-4 border-slate-100" />
  //         {/* Spinning primary ring */}
  //         <div className="absolute h-16 w-16 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-emerald-500/50 shadow-emerald-500/10"
              : "bg-red-900 text-white border-red-500/50 shadow-red-500/10"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-0.5">
            MANAGE &gt;{" "}
            <span className="text-slate-800 font-bold">Users &amp; Teams</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
        </div>

        {/* Live API pending status indicator */}
        {(isUsersLoading || isUsersFetching) && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-bold animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Syncing /api/v1/users data...</span>
          </div>
        )}
      </div>

      {/* Segment Tabs (Users | Teams | Distribution | Deleted Users) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-1.5 flex items-center gap-2 max-w-xl">
        {["Users", "Teams", "Distribution", "Deleted Users"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-orange-500/20"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase">Total</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Total Users
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-sm">
            {usersList.length}
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase">Active</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Total Active Users
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white font-extrabold text-sm shadow-sm">
            {activeCount}
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase">
              Inactive
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Total Inactive Users
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-red-500 text-white font-extrabold text-sm shadow-sm">
            {inactiveCount}
          </div>
        </div>

        {/* Card 4: On Holiday */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase">
              On Holiday
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Total Users On Holiday
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-sky-500 text-white font-extrabold text-sm shadow-sm">
            0
          </div>
        </div>
      </div>

      {/* Main Users Table & Toolbar Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Toolbar Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          {/* Header Title & Left Pagination */}
          <div className="flex items-center gap-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Users ({filteredUsers.length})</span>
              {isUsersLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              )}
            </h2>

            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-semibold text-xs transition-colors cursor-pointer">
                Previous
              </button>
              <button className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer">
                1
              </button>
              <button className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-semibold text-xs transition-colors cursor-pointer">
                Next
              </button>
            </div>
          </div>

          {/* Filters, Add User Button & Search Box */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Select Team Filter */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="">Select Team</option>
              <option value="Sales Alpha">Sales Alpha</option>
              <option value="Pre-Sales Beta">Pre-Sales Beta</option>
              <option value="Management">Management</option>
            </select>

            {/* Select Designation Filter */}
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="">Select Designation</option>
              <option value="Pre Sales">Pre Sales</option>
              <option value="Sourcing Manager">Sourcing Manager</option>
            </select>

            {/* Refresh / Reload Button */}
            <button
              onClick={() => {
                if (refetchUsers) refetchUsers();
                showToast("success", "Refreshing users from /api/v1/users...");
              }}
              title="Refresh users from server"
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 ${isUsersLoading || isUsersFetching ? "animate-spin text-primary" : ""}`}
              />
            </button>

            {/* Column Options Button */}
            <button className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* + Add User Primary Button */}
            <button
              onClick={handleOpenCreateDrawer}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add User</span>
            </button>

            {/* Search Input Box */}
            <div className="relative w-48">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-3">CREATED DATE</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">LAST LOGIN</th>
                <th className="py-3 px-4">EMAIL &amp; MOBILE</th>
                <th className="py-3 px-3">ROLE</th>
                <th className="py-3 px-3">DESIGNATION</th>
                <th className="py-3 px-3">REGION</th>
                <th className="py-3 px-3">USER NAME</th>
                <th className="py-3 px-4">CALL LOG SYNC</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {/* 1. API Status is Pending / Loading Skeleton */}
              {isUsersLoading || !hasLoadedUsers ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr
                    key={`skeleton-${idx}`}
                    className="animate-pulse border-b border-slate-100"
                  >
                    <td className="py-4 px-3">
                      <div className="h-3.5 w-4 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                        <div className="h-3 w-20 bg-slate-100 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-12 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="h-6 w-20 bg-slate-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                /* 2. Empty State: "Data Not Found" */
                <tr>
                  <td colSpan={11} className="py-16 px-4">
                    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                      <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200 shadow-sm">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-base font-black text-slate-800 tracking-tight">
                        {searchQuery || selectedTeam || selectedDesignation
                          ? "No Matching Users Found"
                          : "Data Not Found"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 mb-6 max-w-sm">
                        {searchQuery || selectedTeam || selectedDesignation
                          ? `We couldn't find any users matching your search filters. Try adjusting your query or resetting all filters.`
                          : `There are currently no users registered in the database. Add a new user to populate this directory.`}
                      </p>
                      <div className="flex items-center gap-3">
                        {(searchQuery ||
                          selectedTeam ||
                          selectedDesignation) && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedTeam("");
                              setSelectedDesignation("");
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            <FilterX className="h-3.5 w-3.5" />
                            <span>Reset Filters</span>
                          </button>
                        )}
                        <button
                          onClick={handleOpenCreateDrawer}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Add User</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                /* 3. Populated Users Rows */
                filteredUsers.map((u, index) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                      {u.createdDate}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary/80 to-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {u.lastLogin}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-slate-800 font-medium">{u.email}</p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          {u.mobile}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          String(u.role || "")
                            .toLowerCase()
                            .includes("channel")
                            ? "bg-purple-100 text-purple-700"
                            : String(u.role || "")
                                  .toLowerCase()
                                  .includes("sub")
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role || "Employee"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700">
                      {u.designation}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">{u.region}</td>

                    <td className="py-3.5 px-3 font-mono text-blue-600 font-bold">
                      <div className="flex items-center gap-1">
                        <span>{u.userName}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full mt-1 shrink-0 ${
                            u.callLogSync ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">
                            {u.callLogSync ? "On" : "Off"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal italic">
                            ({u.syncLast})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Table Actions Column with Eye, Edit, Delete */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Eye button: View single user detail from cache memory */}
                        <button
                          onClick={() => handleViewUser(u)}
                          title="View user details (from cache memory)"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit button: PUT /api/v1/users/{id} */}
                        <button
                          onClick={() => handleEditUser(u)}
                          title="Edit user profile (PUT /api/v1/users/{id})"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Delete button: DELETE /api/v1/users/{id} */}
                        <button
                          onClick={() => handleOpenDeleteModal(u)}
                          title="Delete user (DELETE /api/v1/users/{id})"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <div>
            Showing 1-{filteredUsers.length} of {usersList.length} Users
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold cursor-pointer">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 1. Create User Slide-over Drawer (POST /api/v1/users) */}
      <CreateUserDrawer
        isOpen={isCreateModalOpen}
        onClose={handleCloseAllDrawers}
        onUserCreated={handleUserCreated}
      />

      {/* 2. Edit User Slide-over Drawer (PUT /api/v1/users/{id}) */}
      <CreateUserDrawer
        isOpen={isEditModalOpen}
        onClose={handleCloseAllDrawers}
        editUser={selectedUserForEdit}
        onUserUpdated={handleUserUpdated}
      />

      {/* 3. View Single User Modal (Retrieved from Cache Memory) */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={handleCloseAllDrawers}
        user={selectedUserForView}
        onEdit={(user) => {
          handleEditUser(user);
        }}
      />

      {/* 4. Delete User Confirmation Modal (DELETE /api/v1/users/{id}) */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Delete User
                </h3>
                <p className="text-xs text-slate-500">
                  Endpoint: DELETE /api/v1/users/
                  {userToDelete.id || userToDelete._id}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/60 space-y-2 text-xs">
              <p className="text-slate-700">
                Are you sure you want to permanently delete{" "}
                <span className="font-black text-slate-900">
                  {userToDelete.name}
                </span>
                ?
              </p>
              <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                <p>Email: {userToDelete.email}</p>
                <p>Mobile: {userToDelete.mobile || userToDelete.phone}</p>
                <p>Role: {userToDelete.role}</p>
              </div>
              <p className="text-[11px] text-red-600 font-semibold pt-1">
                Warning: This will permanently remove their credentials and
                revoke access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/25 transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
