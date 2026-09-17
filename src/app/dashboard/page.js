"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, User, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen w-full bg-brand-surface p-4 sm:p-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl bg-brand-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-primary/20 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
                User Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome to Shiv Pooja Residency CRM
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            You are logged in as{" "}
            <strong>{user?.name || user?.email || "User"}</strong>.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Account
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {user?.name || user?.email || "Agent"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "user@crm.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Role
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                <CheckCircle className="h-3.5 w-3.5" />
                {role || "User / Agent"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
