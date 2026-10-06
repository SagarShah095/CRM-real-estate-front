"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Building,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminModulePlaceholderView({
  title,
  subtitle,
  category,
  metrics = [],
  actionLabel = "+ Create Record",
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const defaultMetrics =
    metrics.length > 0
      ? metrics
      : [
          {
            label: `Total ${title}`,
            value: "128",
            change: "+12% this month",
            isPositive: true,
          },
          {
            label: "Active & Published",
            value: "94",
            change: "Verified",
            isPositive: true,
          },
          {
            label: "Pending Approvals",
            value: "18",
            change: "Action required",
            isPositive: false,
          },
          {
            label: "Archived / Closed",
            value: "16",
            change: "Historical",
            isPositive: true,
          },
        ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              {category || "CRM Module"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {subtitle ||
              `Manage, audit, and analyze all real estate ${title.toLowerCase()} records.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{actionLabel}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultMetrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {m.label}
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {m.value}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  m.isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Filter and Records View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${title.toLowerCase()} by name, ID, or tag...`}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Filter Status</span>
            </button>
          </div>
        </div>

        {/* Operational Records State */}
        <div className="py-16 px-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Building className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {title} Management Workspace
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Active synchronization enabled with RealtyCRM core real estate
              services. Use this workspace to filter properties, allocate units,
              review approvals, and monitor revenue flow.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Configure {title} Workflow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
