"use client";

import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import { useAdminsQuery } from "@/hooks/useAdminsQuery";
import {
  TrendingUp,
  Building2,
  Server,
  LifeBuoy,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Key,
  UploadCloud,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const { data: responseData } = useAdminsQuery();

  let tenantsCount = 1248;
  if (responseData?.success && Array.isArray(responseData.data)) {
    tenantsCount = responseData.pagination?.total || responseData.data.length;
  } else if (Array.isArray(responseData)) {
    tenantsCount = responseData.length;
  } else if (Array.isArray(responseData?.data)) {
    tenantsCount = responseData.data.length;
  }

  return (
    <SuperAdminLayout
      breadcrumb="Dashboard > Overview"
      tenantCount={tenantsCount}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform-wide performance across all tenants · last synced 2 min ago
          </p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: MRR */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                MRR
              </span>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                ₹14,25,000
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-1">
                ↑ +12.4% MoM
              </p>
            </div>
          </div>

          {/* Card 2: Active Tenants */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Tenants
              </span>
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {tenantsCount.toLocaleString()}
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-1">
                ↑ +12 new this month
              </p>
            </div>
          </div>

          {/* Card 3: System Uptime */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Uptime
              </span>
              <Server className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">99.98%</div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Rolling 30-day window
              </p>
            </div>
          </div>

          {/* Card 4: Pending Support */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Support
              </span>
              <LifeBuoy className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                3 Requests
              </div>
              <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>1 critical SLA at risk</span>
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Visual Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenant Growth vs Churn Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tenant Growth vs Churn
                </h3>
                <p className="text-xs text-slate-400">
                  Net active tenants over last 6 months
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  <span>Active</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span>Churned</span>
                </span>
              </div>
            </div>

            {/* Visual Line Chart Graphic */}
            <div className="h-60 w-full pt-4 relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 500 180"
              >
                {/* Gridlines */}
                <line
                  x1="40"
                  y1="30"
                  x2="480"
                  y2="30"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="80"
                  x2="480"
                  y2="80"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="130"
                  x2="480"
                  y2="130"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />

                {/* Y Axis Labels */}
                <text
                  x="10"
                  y="35"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  1000
                </text>
                <text
                  x="20"
                  y="85"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  500
                </text>
                <text
                  x="30"
                  y="135"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  0
                </text>

                {/* X Axis Labels */}
                <text
                  x="50"
                  y="165"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  0
                </text>
                <text
                  x="135"
                  y="165"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  1
                </text>
                <text
                  x="220"
                  y="165"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  2
                </text>
                <text
                  x="305"
                  y="165"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  3
                </text>
                <text
                  x="390"
                  y="165"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  4
                </text>
                <text
                  x="475"
                  y="165"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  5
                </text>

                {/* Active Trend Line (Amber) */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  points="50,45 135,42 220,40 305,38 390,36 475,32"
                />
                <circle cx="50" cy="45" r="4" fill="#F59E0B" />
                <circle cx="135" cy="42" r="4" fill="#F59E0B" />
                <circle cx="220" cy="40" r="4" fill="#F59E0B" />
                <circle cx="305" cy="38" r="4" fill="#F59E0B" />
                <circle cx="390" cy="36" r="4" fill="#F59E0B" />
                <circle cx="475" cy="32" r="4" fill="#F59E0B" />

                {/* Churned Line (Dotted Red) */}
                <polyline
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points="50,125 135,124 220,126 305,125 390,124 475,125"
                />
              </svg>
            </div>
          </div>

          {/* API Costs Breakdown Donut Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                API Costs Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Monthly spend by integration
              </p>
            </div>

            {/* Donut Chart Visual */}
            <div className="flex items-center justify-center relative py-2">
              <svg
                className="w-40 h-40 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F59E0B"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray="60 180"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#FBBF24"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray="50 190"
                  strokeDashoffset="-60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#FCD34D"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray="45 195"
                  strokeDashoffset="-110"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#FEF3C7"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray="45 195"
                  strokeDashoffset="-155"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                <span>Google Maps (25.5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                <span>WhatsApp (21.8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" />
                <span>SMS (20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-100" />
                <span>AWS S3 (20%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Watchlist & System Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenant Churn Risk Watchlist */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Tenant Churn Risk Watchlist
              </h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Filter</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-2">Company</th>
                    <th className="py-2.5 px-2">Last Login</th>
                    <th className="py-2.5 px-2">Inactive</th>
                    <th className="py-2.5 px-2">Plan</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  <tr>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      Urbanexa Realty
                    </td>
                    <td className="py-3 px-2 text-slate-500">12-Sep-2026</td>
                    <td className="py-3 px-2 text-rose-600 font-bold">
                      8 Days
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                        Pro
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-amber-600 hover:underline font-bold">
                        Send Health Check
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      LXA Group
                    </td>
                    <td className="py-3 px-2 text-slate-500">09-Sep-2026</td>
                    <td className="py-3 px-2 text-rose-600 font-bold">
                      11 Days
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        Basic
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-amber-600 hover:underline font-bold">
                        Send Health Check
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      Vantage Homes
                    </td>
                    <td className="py-3 px-2 text-slate-500">14-Sep-2026</td>
                    <td className="py-3 px-2 text-slate-600 font-bold">
                      6 Days
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        Enterprise
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-amber-600 hover:underline font-bold">
                        Send Health Check
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      MetroBuild Inc.
                    </td>
                    <td className="py-3 px-2 text-slate-500">06-Sep-2026</td>
                    <td className="py-3 px-2 text-rose-600 font-bold">
                      14 Days
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                        Pro
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-amber-600 hover:underline font-bold">
                        Send Health Check
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Master System Activity Stream */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Master System Activity Stream
              </h3>
              <button className="text-xs font-bold text-amber-600 hover:underline">
                View all
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Plan Upgraded to Enterprise
                  </p>
                  <p className="text-[10px] text-slate-400">
                    by Super Admin Dev · Tenant: LXA Group
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    17-Sep 10:45 AM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    New tenant onboarded
                  </p>
                  <p className="text-[10px] text-slate-400">
                    by Rahul Sharma · MetroBuild Inc.
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    16-Sep 04:20 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    API key rotated for WhatsApp
                  </p>
                  <p className="text-[10px] text-slate-400">
                    by System · Global
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    15-Sep 09:10 AM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    SLA breach alert raised
                  </p>
                  <p className="text-[10px] text-slate-400">
                    by Monitoring · Ticket #4821
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    14-Sep 11:55 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
