"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Globe,
  Facebook,
  PhoneCall,
  User,
  SlidersHorizontal,
} from "lucide-react";
import CreateLeadModal from "./CreateLeadModal";

export default function AdminLeadsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeSegment, setActiveSegment] = useState("Pipeline");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  useEffect(() => {
    const drawerParam = searchParams.get("drawer") || searchParams.get("modal");
    if (drawerParam === "create" || drawerParam === "createLead") {
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

  // Sample Lead Registry data matching screenshot exactly
  const [leads, setLeads] = useState([
    {
      id: "LID-1342",
      creationDate: "Feb 12, 2026",
      assignedDate: "Sep 18, 2026",
      leadName: "Dhaval Bhai",
      mobile: "+91-9978928637",
      stage: "LOST",
      stageReason: "Not Interested",
      source: "Google Form",
    },
    {
      id: "LID-1343",
      creationDate: "Feb 14, 2026",
      assignedDate: "Feb 15, 2026",
      leadName: "Ankit Patel",
      mobile: "+91-9892345671",
      stage: "NEW",
      stageReason: "—",
      source: "Facebook Ads",
    },
    {
      id: "LID-1344",
      creationDate: "Feb 15, 2026",
      assignedDate: "Feb 15, 2026",
      leadName: "Rahul Mehta",
      mobile: "+91-8130381496",
      stage: "QUALIFIED",
      stageReason: "Interested in 3 BHK",
      source: "MagicBricks",
    },
    {
      id: "LID-1345",
      creationDate: "Feb 16, 2026",
      assignedDate: "Feb 16, 2026",
      leadName: "Priya Nair",
      mobile: "+91-9712345678",
      stage: "CONTACTED",
      stageReason: "Follow-up Scheduled",
      source: "Direct Walk-in",
    },
    {
      id: "LID-1346",
      creationDate: "Feb 17, 2026",
      assignedDate: "Feb 17, 2026",
      leadName: "Sanjay Shah",
      mobile: "+91-9825012345",
      stage: "NEW",
      stageReason: "—",
      source: "Google Form",
    },
  ]);

  const leadStageChartData = [
    { label: "New", percentage: 79, color: "#1e40af" },       // Dark Blue
    { label: "Contacted", percentage: 12, color: "#3b82f6" }, // Blue
    { label: "Other", percentage: 4.7, color: "#cbd5e1" },    // Light Gray
    { label: "Lost", percentage: 3.77, color: "#ef4444" },    // Red
    { label: "Qualified", percentage: 1.08, color: "#60a5fa text" }, // Light Blue
  ];

  const handleLeadCreated = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const filteredLeads = leads.filter((l) => {
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (
      searchQuery &&
      !l.leadName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !l.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !l.mobile.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header / Breadcrumb Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-0.5">
            CRM &gt; <span className="text-slate-800 font-bold">Lead Master Database</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lead Master Database
          </h1>
        </div>
      </div>

      {/* Top Analytics Section (Lead Stage Donut + 6 KPI Cards Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Lead Stage Analysis Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lead Stage Analysis
          </h3>

          {/* Donut Graphic */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
              />
              {/* 79% segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#1e40af"
                strokeWidth="12"
                strokeDasharray="178.7 226.2"
                strokeDashoffset="0"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              {/* 12% segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray="27.1 226.2"
                strokeDashoffset="-178.7"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              {/* 4.7% segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#cbd5e1"
                strokeWidth="12"
                strokeDasharray="10.6 226.2"
                strokeDashoffset="-205.8"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              {/* 3.77% segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#ef4444"
                strokeWidth="12"
                strokeDasharray="8.5 226.2"
                strokeDashoffset="-216.4"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900">79%</span>
            </div>
          </div>

          {/* Donut Legend Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#1e40af]" /> New
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#3b82f6]" /> Contacted
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#cbd5e1]" /> Other
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Lost
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-[#60a5fa]" /> Qualified
            </span>
          </div>
        </div>

        {/* Right Cards: 6 Summary KPI Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* UNTOUCHED */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              UNTOUCHED
            </span>
            <span className="text-3xl font-black text-red-500 mt-2">2</span>
          </div>

          {/* NO FOLLOWUPS */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              NO FOLLOWUPS
            </span>
            <span className="text-3xl font-black text-orange-500 mt-2">1,482</span>
          </div>

          {/* RETURNING */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              RETURNING
            </span>
            <span className="text-3xl font-black text-emerald-500 mt-2">3</span>
          </div>

          {/* RET. NO F/UP */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              RET. NO F/UP
            </span>
            <span className="text-3xl font-black text-amber-500 mt-2">3</span>
          </div>

          {/* OVERDUE TASKS */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OVERDUE TASKS
            </span>
            <span className="text-3xl font-black text-red-500 mt-2">1</span>
          </div>

          {/* TOTAL ACTIVE */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL ACTIVE
            </span>
            <span className="text-3xl font-black text-blue-600 mt-2">1,488</span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Leads Registry Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Filters</span>
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

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 w-12">#</th>
                <th className="py-3.5 px-4">LEAD ID</th>
                <th className="py-3.5 px-4">CREATION DATE</th>
                <th className="py-3.5 px-4">ASSIGNED DATE</th>
                <th className="py-3.5 px-4">LEAD NAME</th>
                <th className="py-3.5 px-4">PRIMARY NO.</th>
                <th className="py-3.5 px-4">STAGE</th>
                <th className="py-3.5 px-4">STAGE REASON</th>
                <th className="py-3.5 px-4">SOURCE</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredLeads.map((l, index) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                    {index + 1}
                  </td>

                  <td className="py-4 px-4 text-slate-500 font-bold font-mono text-[11px]">
                    {l.id}
                  </td>

                  <td className="py-4 px-4 text-slate-600">{l.creationDate}</td>

                  <td className="py-4 px-4 text-slate-600">{l.assignedDate}</td>

                  <td className="py-4 px-4 text-slate-900 font-black">{l.leadName}</td>

                  <td className="py-4 px-4 text-slate-800 font-mono text-[11px]">
                    {l.mobile}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                        l.stage === "LOST"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : l.stage === "NEW"
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : l.stage === "QUALIFIED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-purple-50 text-purple-600 border border-purple-200"
                      }`}
                    >
                      {l.stage}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-400 italic text-[11px]">
                    {l.stageReason}
                  </td>

                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      {l.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <div>
            Showing 1-{filteredLeads.length} of 1,488 Leads
          </div>

          <div className="flex items-center gap-1.5">
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center">
              2
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center">
              3
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onLeadCreated={(newLead) => {
          handleLeadCreated(newLead);
          handleCloseCreateModal();
        }}
      />
    </div>
  );
}
