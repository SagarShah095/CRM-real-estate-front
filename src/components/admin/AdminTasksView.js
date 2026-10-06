"use client";

import { useState, useEffect } from "react";
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
  MoreVertical,
  CheckSquare,
  AlertTriangle,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";

export default function AdminTasksView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("Tasks (All)");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const drawerParam = searchParams.get("drawer") || searchParams.get("modal");
    if (drawerParam === "create" || drawerParam === "createTask") {
      setIsCreateModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
    }
  }, [searchParams]);

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

  // Filter States (Matching Image 3 exact filter grid)
  const [filters, setFilters] = useState({
    project: "",
    activityType: "",
    dateRange: "Today",
    preSalesAgent: "",
    team: "",
    assignedTo: "",
    status: "",
    assignedBy: "",
    entityType: "",
    searchTerm: "",
  });

  // Sample tasks list combining Image 1 & Image 3 structure
  const [tasks, setTasks] = useState([
    {
      id: "TSK-001",
      createdDate: "Feb 12, 2026",
      leadName: "Dhaval Bhai",
      mobile: "+91 9978928637",
      category: "Residential 3 BHK",
      assignedBy: "Mr. Jigar",
      assignedTo: "Jagdish Patel",
      preSalesAgent: "Aditi R.",
      scheduledFor: "Feb 13, 2:00 PM",
      title: "Site Visit Followup",
      remark: "Client requested 3 BHK top floor walkthrough",
      activityType: "FOLLOW-UP CALL",
      stage: "Negotiation",
      status: "Pending",
    },
    {
      id: "TSK-002",
      createdDate: "Feb 11, 2026",
      leadName: "Rahul Mehta",
      mobile: "+91 8130381496",
      category: "Commercial Shop",
      assignedBy: "Mr. Jigar",
      assignedTo: "Mahesh Chauhan",
      preSalesAgent: "Vikram S.",
      scheduledFor: "Feb 12, 11:00 AM",
      title: "Commercial Layout Demo",
      remark: "Discussed payment plan & booking advance",
      activityType: "SITE VISIT",
      stage: "Contacted",
      status: "Completed",
    },
    {
      id: "TSK-003",
      createdDate: "Feb 10, 2026",
      leadName: "Sanjay Shah",
      mobile: "+91 9825012345",
      category: "Residential 2 BHK",
      assignedBy: "Mr. Jigar",
      assignedTo: "Jagdish Patel",
      preSalesAgent: "Aditi R.",
      scheduledFor: "Feb 14, 04:00 PM",
      title: "Pricing & Floorplan Discussion",
      remark: "Followup call for site visit feedback",
      activityType: "MEETING LOG",
      stage: "Fresh",
      status: "Pending",
    },
    {
      id: "TSK-004",
      createdDate: "Feb 09, 2026",
      leadName: "Priya Nair",
      mobile: "+91 9712345678",
      category: "Penthouse 4 BHK",
      assignedBy: "Mr. Jigar",
      assignedTo: "Mahesh Chauhan",
      preSalesAgent: "Priya Nair",
      scheduledFor: "Feb 10, 06:00 PM",
      title: "Overdue Callback",
      remark: "Requested callback regarding loan approval",
      activityType: "FOLLOW-UP CALL",
      stage: "Qualified",
      status: "Overdue",
    },
  ]);

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      project: "",
      activityType: "",
      dateRange: "Today",
      preSalesAgent: "",
      team: "",
      assignedTo: "",
      status: "",
      assignedBy: "",
      entityType: "",
      searchTerm: "",
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(tasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filters.activityType && t.activityType !== filters.activityType) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assignedTo && t.assignedTo !== filters.assignedTo) return false;
    if (
      filters.searchTerm &&
      !t.leadName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !t.mobile.includes(filters.searchTerm) &&
      !t.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tasks & Site Visits
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage daily follow-ups, site tours, and agent schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("Calendar")}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all"
          >
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Calendar View</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Section (4 Summary Cards with Primary Color Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TODAY'S TASK */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TODAY&apos;S TASK
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">12</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary shadow-sm">
            <User className="h-5 w-5" />
          </div>
        </div>

        {/* UPCOMING TASK */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              UPCOMING TASK
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">45</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* PENDING TASK */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PENDING TASK
            </p>
            <p className="text-3xl font-black text-red-600 mt-1">8</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* COMPLETED TASK */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COMPLETED TASK
            </p>
            <p className="text-3xl font-black text-emerald-600 mt-1">128</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Task Panel Container (Tabs + Filter Grid + Data Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Top View Tabs (Matching Image 1 & 3) */}
        <div className="px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            {["Tasks (All)", "Site Visits", "Meeting Logs", "Calendar"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-primary text-primary font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Auto Refresh:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* Detailed Multi-Field Filter Bar (Image 3 exact filter grid) */}
        <div className="p-5 border-b border-slate-100 bg-white space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {/* Project Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Project
              </label>
              <select
                value={filters.project}
                onChange={(e) => handleFilterChange("project", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Search & Select Project</option>
                <option value="Shiv Pooja Heights">Shiv Pooja Heights</option>
                <option value="Royal Palms">Royal Palms</option>
              </select>
            </div>

            {/* Activity Type Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Activity type
              </label>
              <select
                value={filters.activityType}
                onChange={(e) => handleFilterChange("activityType", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Activity Types</option>
                <option value="FOLLOW-UP CALL">FOLLOW-UP CALL</option>
                <option value="SITE VISIT">SITE VISIT</option>
                <option value="MEETING LOG">MEETING LOG</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Custom">Custom Range</option>
              </select>
            </div>

            {/* Pre Sales Agent Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Pre Sales Agent
              </label>
              <select
                value={filters.preSalesAgent}
                onChange={(e) => handleFilterChange("preSalesAgent", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Pre Sales Agent</option>
                <option value="Aditi R.">Aditi R.</option>
                <option value="Vikram S.">Vikram S.</option>
              </select>
            </div>

            {/* Teams Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Teams
              </label>
              <select
                value={filters.team}
                onChange={(e) => handleFilterChange("team", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Team</option>
                <option value="Sales Alpha">Sales Alpha</option>
                <option value="Pre Sales Beta">Pre Sales Beta</option>
              </select>
            </div>

            {/* Assigned To Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Assigned To
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Sales Agent</option>
                <option value="Jagdish Patel">Jagdish Patel</option>
                <option value="Mahesh Chauhan">Mahesh Chauhan</option>
                <option value="Mr. Jigar">Mr. Jigar</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Assigned By Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Assigned By
              </label>
              <select
                value={filters.assignedBy}
                onChange={(e) => handleFilterChange("assignedBy", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Sales Agent</option>
                <option value="Mr. Jigar">Mr. Jigar</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Entity Type
              </label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange("entityType", e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:border-primary focus:outline-none"
              >
                <option value="">Select Entity Type</option>
                <option value="Lead">Lead</option>
                <option value="Contact">Contact</option>
              </select>
            </div>
          </div>

          {/* Action Buttons & Quick Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition-all shadow-sm">
                Search
              </button>

              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>

              <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Analysis</span>
              </button>
            </div>

            {/* Table Search & Column Controls */}
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Lead, phone..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <button className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedTaskIds.length === filteredTasks.length &&
                      filteredTasks.length > 0
                    }
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Created Date</th>
                <th className="py-3 px-4">Lead Details</th>
                <th className="py-3 px-3">Assigned By</th>
                <th className="py-3 px-3">Assigned To</th>
                <th className="py-3 px-3">Pre Sales Agent</th>
                <th className="py-3 px-3">Scheduled For</th>
                <th className="py-3 px-3">Activity Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, index) => {
                  const isSelected = selectedTaskIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-orange-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectTask(t.id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">{t.createdDate}</td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-extrabold text-slate-900">{t.leadName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{t.mobile}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700">{t.assignedBy}</td>

                      <td className="py-3.5 px-3 text-slate-900 font-bold">{t.assignedTo}</td>

                      <td className="py-3.5 px-3 text-slate-600">{t.preSalesAgent}</td>

                      <td className="py-3.5 px-3 text-slate-700 font-medium">{t.scheduledFor}</td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                            t.activityType === "FOLLOW-UP CALL"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : t.activityType === "SITE VISIT"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {t.activityType}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="flex items-center gap-1.5 font-bold">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              t.status === "Completed"
                                ? "bg-emerald-500"
                                : t.status === "Overdue"
                                ? "bg-red-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span
                            className={
                              t.status === "Completed"
                                ? "text-emerald-700"
                                : t.status === "Overdue"
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
                          <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-red-600 rounded">
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
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <div>
            Showing 1-{filteredTasks.length} of {tasks.length} tasks
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
              Next
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
      />
    </div>
  );
}
