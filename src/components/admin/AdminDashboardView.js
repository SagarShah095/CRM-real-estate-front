"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Filter,
  Download,
  Plus,
  ArrowRight,
  PhoneCall,
  Calendar,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  UserCheck,
  CheckCircle,
} from "lucide-react";

export default function AdminDashboardView({ onNavigateToTasks, onAddLeadClick }) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedAgent, setSelectedAgent] = useState("All Agents");
  const [selectedFilter, setSelectedFilter] = useState("This Month");

  const handleNavigateToTasks = () => {
    if (onNavigateToTasks) {
      onNavigateToTasks();
    } else {
      router.push("/admin/tasks");
    }
  };

  const handleAddLead = () => {
    if (onAddLeadClick) {
      onAddLeadClick();
    } else {
      router.push("/admin/crm/leads?drawer=create");
    }
  };

  // Lead Stage donut data (matches image 2)
  const leadStageData = [
    { label: "New Leads", percentage: 79, count: 1175, color: "#2563eb" }, // Blue
    { label: "Qualified", percentage: 12, count: 178, color: "#3b82f6" },  // Light Blue
    { label: "Negotiation", percentage: 4.7, count: 70, color: "#60a5fa" },// Sky Blue
    { label: "Contacted", percentage: 3.77, count: 56, color: "#93c5fd" },// Very Soft Blue
    { label: "Closed", percentage: 1.08, count: 16, color: "#bfdbfe" },   // Ice Blue
  ];

  const recentActivities = [
    {
      id: 1,
      type: "call",
      title: "Aditi R. called lead Rahul Mehta",
      time: "2 min ago",
      duration: "4 min 12 sec",
      icon: PhoneCall,
      color: "text-blue-500 bg-blue-50",
    },
    {
      id: 2,
      type: "visit",
      title: "Vikram S. scheduled site visit",
      time: "18 min ago",
      duration: "Tomorrow 10:00 AM",
      icon: Calendar,
      color: "text-emerald-500 bg-emerald-50",
    },
    {
      id: 3,
      type: "lead",
      title: "New lead from MagicBricks",
      time: "34 min ago",
      duration: "3 BHK interest",
      icon: Users,
      color: "text-sky-500 bg-sky-50",
    },
    {
      id: 4,
      type: "overdue",
      title: "Task overdue for Priya Nair",
      time: "1 hour ago",
      duration: "Follow-up due",
      icon: AlertCircle,
      color: "text-amber-500 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter Action Bar (Matching Image 2) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Dropdown */}
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="All Teams">Team: All</option>
              <option value="Sales Alpha">Sales Alpha</option>
              <option value="Pre-Sales Beta">Pre-Sales Beta</option>
            </select>
            <Users className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sales Agent Dropdown */}
          <div className="relative">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="All Agents">Sales Agent: All</option>
              <option value="Jagdish Patel">Jagdish Patel</option>
              <option value="Mahesh Chauhan">Mahesh Chauhan</option>
              <option value="Mr. Jigar">Mr. Jigar</option>
            </select>
            <UserCheck className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="This Month">Filter: Today</option>
              <option value="This Week">Filter: This Week</option>
              <option value="This Month">Filter: This Month</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer">
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={handleAddLead}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards Grid (Matches Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: All Leads Summary (4 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            All Leads Summary
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Total
              </span>
              <span className="text-slate-900 text-sm font-extrabold">1488</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Fresh
              </span>
              <span className="text-slate-900 text-sm font-extrabold">1485</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Returning
              </span>
              <span className="text-slate-900 font-bold">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Untouched
              </span>
              <span className="text-slate-900 font-bold">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Unassigned
              </span>
              <span className="text-slate-900 font-bold">0</span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Leads (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            Today&apos;s Leads
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-600">Leads</span>
              <span className="text-slate-900 text-sm font-extrabold">40</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-600">Fresh</span>
              <span className="text-slate-900 text-sm font-extrabold">38</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Returning</span>
              <span className="text-slate-900 font-bold">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tasks</span>
              <span className="text-slate-900 font-bold">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Site Visits</span>
              <span className="text-slate-900 font-bold">0</span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Activities Report (5 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Today&apos;s Activities Report
            </h3>
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-bold text-primary hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Activity Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 text-center py-1">
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Tasks</p>
              <p className="text-lg font-black text-slate-900">2</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Total Offline Calls</p>
              <p className="text-lg font-black text-slate-900">10</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Total IVR Calls</p>
              <p className="text-lg font-black text-slate-900">10</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Meetings</p>
              <p className="text-lg font-black text-slate-900">1</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Calls To Lead</p>
              <p className="text-lg font-black text-slate-900">2</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Calls To Contact</p>
              <p className="text-lg font-black text-slate-900">2</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Site Visit Scheduled</p>
              <p className="text-lg font-black text-slate-900">0</p>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Site Visit Completed</p>
              <p className="text-lg font-black text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 Cards Grid (Lead Stage Donut, Actionable KPIs, Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 4: Lead Stage Analysis (Donut Chart - 4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Lead Stage Analysis
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Active Leads (1,488)</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <TrendingUp className="h-4 w-4" />
            </button>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
              {/* Ring Background */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Segments */}
              {/* 79% segment */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="#2563eb"
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
                stroke="#60a5fa"
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
                stroke="#93c5fd"
                strokeWidth="12"
                strokeDasharray="8.5 226.2"
                strokeDashoffset="-216.4"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-slate-900">79%</span>
              <span className="text-[10px] font-bold text-slate-500">New Leads</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold border-t border-slate-100 pt-3">
            {leadStageData.map((stage) => (
              <div key={stage.label} className="flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.label}
                </span>
                <span className="font-bold text-slate-800">{stage.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 5: Actionable KPIs (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            Actionable KPIs
          </h3>

          <div className="space-y-3 my-auto">
            {/* KPI Item 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between hover:border-red-200 transition-colors">
              <span className="text-xs font-semibold text-slate-700">Untouched Leads</span>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-extrabold text-xs">
                2
              </span>
            </div>

            {/* KPI Item 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between hover:border-amber-200 transition-colors">
              <span className="text-xs font-semibold text-slate-700">No Followups Leads</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-extrabold text-xs">
                1482
              </span>
            </div>

            {/* KPI Item 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between hover:border-red-200 transition-colors">
              <span className="text-xs font-semibold text-slate-700">Overdue Task Leads</span>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-extrabold text-xs">
                1
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToTasks}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center"
            >
              Review Action Items
            </button>
          </div>
        </div>

        {/* Card 6: Recent Activity (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Activity
            </h3>
            <button
              onClick={handleNavigateToTasks}
              className="text-xs font-bold text-primary hover:text-orange-600 transition-colors cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Activity Timeline List */}
          <div className="space-y-4">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {act.time} · {act.duration}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
