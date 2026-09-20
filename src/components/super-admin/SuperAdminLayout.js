"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  CreditCard,
  Settings,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronDown,
  Layers,
} from "lucide-react";

export default function SuperAdminLayout({
  children,
  breadcrumb = "Dashboard > Overview",
  tenantCount = 1248,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Role check guard: If role is not super_admin, redirect to /login
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = user || storage.getUser();
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    const roleStr = String(storedUser?.role || "")
      .toLowerCase()
      .trim()
      .replace(/_/g, "-");
    const isSuperAdmin =
      roleStr === "super-admin" ||
      roleStr === "superadmin" ||
      roleStr === "super_admin" ||
      Boolean(storedUser?.isSuperAdmin);

    if (!isSuperAdmin) {
      router.replace("/login");
    }
  }, [user, router]);

  const handleSignoutClick = () => {
    setShowProfileMenu(false);
    setIsSignoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      logout();
      router.push("/login");
    }, 400);
  };

  const navItems = {
    platform: [
      {
        name: "Dashboard",
        href: "/super-admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Tenants",
        href: "/super-admin/tenants",
        icon: Users,
        badge: tenantCount,
      },
      {
        name: "Feature Licensing",
        href: "/super-admin/licensing",
        icon: KeyRound,
      },
      {
        name: "Billing & Invoices",
        href: "/super-admin/billing",
        icon: CreditCard,
      },
    ],
    system: [
      {
        name: "Global Settings",
        href: "/super-admin/settings",
        icon: Settings,
      },
      {
        name: "Security & Audit",
        href: "/super-admin/security",
        icon: ShieldCheck,
      },
    ],
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-30 border-r border-slate-800">
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Layers className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              NexaCRM
            </span>
          </div>

          {/* Navigation Items */}
          <div className="px-4 py-6 space-y-6">
            {/* PLATFORM Section */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Platform
              </div>
              <nav className="space-y-1">
                {navItems.platform.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-slate-800 text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          isActive
                            ? "bg-slate-700 text-slate-200"
                            : "bg-slate-800/80 text-slate-400"
                        }`}>
                          {item.badge.toLocaleString()}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* SYSTEM Section */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                System
              </div>
              <nav className="space-y-1">
                {navItems.system.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-slate-800 text-white font-bold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User Profile Footer in Sidebar */}
        <div className="p-4 border-t border-slate-800/80 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "PN"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "Priya Nair"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Super Admin
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute bottom-16 left-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={handleSignoutClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb Path */}
          <div className="text-xs font-semibold text-slate-500">
            {breadcrumb}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* API Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API: 99.98% Operational</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">
                  {user?.name || "Priya Nair"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {user?.email || "admin@nexacrm.io"}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "PN"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-6 sm:p-8 flex-1">{children}</main>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSignoutModalOpen}
        onClose={() => setIsSignoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Sign Out of NexaCRM"
        message="Are you sure you want to sign out of your Super Admin account?"
        confirmText="Yes, Sign Out"
        variant="danger"
        isLoading={isSigningOut}
      />
    </div>
  );
}
