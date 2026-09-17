"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, User, CheckCircle, Crown } from "lucide-react";

export default function SuperAdminPage() {
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
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
                Super Admin Portal
              </h1>
              <p className="text-sm text-gray-500">
                Full system administration and control center
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

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <span>
            Logged in as <strong>Super Admin</strong>. You have unrestricted
            access to all real estate CRM modules, user management, and system
            settings.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              User Profile
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {user?.name || user?.email || "Super Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "superadmin@crm.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Role & Clearance
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                <CheckCircle className="h-3.5 w-3.5" />
                {role || "super-admin"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
