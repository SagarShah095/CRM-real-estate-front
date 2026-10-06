"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
import { isTokenExpired, triggerTokenExpiredRedirect } from "@/utils/token";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building,
  Briefcase,
  Layers,
  Calendar,
  Megaphone,
  Wallet,
  Settings,
  Sliders,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({
  children,
  activeTab = "dashboard",
  setActiveTab,
  onAddLeadClick,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isCrmOpen, setIsCrmOpen] = useState(true);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Compute active navigation tab from URL pathname
  const getResolvedActiveTab = () => {
    if (!pathname) return activeTab;
    if (pathname === "/admin" || pathname === "/admin/dashboard") return "dashboard";
    if (pathname.startsWith("/admin/tasks")) return "tasks";
    if (pathname.startsWith("/admin/crm/leads")) return "crm-leads";
    if (pathname.startsWith("/admin/crm/channel-partner")) return "crm-channel-partner";
    if (pathname.startsWith("/admin/crm/property")) return "crm-property";
    if (pathname.startsWith("/admin/crm/projects")) return "crm-projects";
    if (pathname.startsWith("/admin/bookings")) return "bookings";
    if (pathname.startsWith("/admin/campaign")) return "campaign";
    if (pathname.startsWith("/admin/accounts")) return "accounts";
    if (pathname.startsWith("/admin/manage/users")) return "manage-users";
    if (pathname.startsWith("/admin/manage/settings")) return "manage-settings";
    return activeTab;
  };

  const resolvedActiveTab = getResolvedActiveTab();

  // Auto-expand accordions based on active path
  useEffect(() => {
    if (pathname?.startsWith("/admin/crm")) {
      setIsCrmOpen(true);
    }
    if (pathname?.startsWith("/admin/manage")) {
      setIsManageOpen(true);
    }
  }, [pathname]);

  // Role Guard & Token Expiration Guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = storage.getToken();
    const storedUser = user || storage.getUser();

    if (!storedToken || isTokenExpired(storedToken)) {
      triggerTokenExpiredRedirect("Your session has expired. Please log in again.", pathname);
      return;
    }

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const roleStr = String(storedUser?.role || "")
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
      Boolean(storedUser?.isAdmin) ||
      Boolean(storedUser?.isSuperAdmin);

    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router, pathname]);

  const confirmLogout = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      logout();
      router.push("/login");
    }, 400);
  };

  const crmSubItems = [
    { name: "Leads", path: "/admin/crm/leads", key: "crm-leads" },
    { name: "Channel Partner", path: "/admin/crm/channel-partner", key: "crm-channel-partner" },
    { name: "Property", path: "/admin/crm/property", key: "crm-property" },
    { name: "Projects", path: "/admin/crm/projects", key: "crm-projects" },
  ];

  const manageSubItems = [
    { name: "Users & Teams", path: "/admin/manage/users", key: "manage-users" },
    { name: "Settings", path: "/admin/manage/settings", key: "manage-settings" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* Left Sidebar (Dark Navy Slate #0F172A) */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-30 border-r border-slate-800">
        <div>
          {/* Logo Section */}
          <Link href="/admin/dashboard" className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">
              <Building className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-white tracking-tight leading-none">
                REALTY<span className="text-primary">CRM</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Enterprise Edition</span>
            </div>
          </Link>

          {/* Sidebar Navigation Links */}
          <div className="px-4 py-6 space-y-2 text-xs font-semibold">
            {/* Dashboard Link */}
            <Link
              href="/admin/dashboard"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                resolvedActiveTab === "dashboard"
                  ? "bg-primary text-white font-bold shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            {/* Tasks Link */}
            <Link
              href="/admin/tasks"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                resolvedActiveTab === "tasks"
                  ? "bg-primary text-white font-bold shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                  resolvedActiveTab === "tasks"
                    ? "bg-white/20 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                12
              </span>
            </Link>

            {/* CRM Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setIsCrmOpen(!isCrmOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  resolvedActiveTab.startsWith("crm") || resolvedActiveTab === "leads"
                    ? "bg-slate-800/90 text-white font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`h-4 w-4 ${resolvedActiveTab.startsWith("crm") ? "text-primary" : ""}`} />
                  <span>CRM</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isCrmOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCrmOpen && (
                <div className="ml-8 mt-1 space-y-1 border-l border-slate-800 pl-3">
                  {crmSubItems.map((sub) => {
                    const isSubActive =
                      resolvedActiveTab === sub.key ||
                      (sub.key === "crm-leads" && resolvedActiveTab === "leads");
                    return (
                      <Link
                        key={sub.key}
                        href={sub.path}
                        className={`w-full block py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                          isSubActive
                            ? "bg-primary text-white font-extrabold shadow-sm shadow-orange-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bookings */}
            <Link
              href="/admin/bookings"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                resolvedActiveTab === "bookings"
                  ? "bg-primary text-white font-bold shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Bookings</span>
            </Link>

            {/* Campaign */}
            <Link
              href="/admin/campaign"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                resolvedActiveTab === "campaign"
                  ? "bg-primary text-white font-bold shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Campaign</span>
            </Link>

            {/* Accounts */}
            <Link
              href="/admin/accounts"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                resolvedActiveTab === "accounts"
                  ? "bg-primary text-white font-bold shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>Accounts</span>
            </Link>

            {/* Manage Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setIsManageOpen(!isManageOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  resolvedActiveTab.startsWith("manage") || resolvedActiveTab === "users"
                    ? "bg-slate-800/90 text-white font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`h-4 w-4 ${resolvedActiveTab.startsWith("manage") ? "text-primary" : ""}`} />
                  <span>Manage</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isManageOpen || resolvedActiveTab.startsWith("manage") ? "rotate-180" : ""
                  }`}
                />
              </button>

              {(isManageOpen || resolvedActiveTab.startsWith("manage")) && (
                <div className="ml-8 mt-1 space-y-1 border-l border-slate-800 pl-3">
                  {manageSubItems.map((sub) => {
                    const isSubActive =
                      resolvedActiveTab === sub.key ||
                      (sub.key === "manage-users" && resolvedActiveTab === "users");
                    return (
                      <Link
                        key={sub.key}
                        href={sub.path}
                        className={`w-full block py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                          isSubActive
                            ? "bg-primary text-white font-extrabold shadow-sm shadow-orange-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Copyright */}
        <div className="p-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            © 2026 RealtyCRM.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar (Matches Image 2 Header) */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          {/* Tenant Name & Welcome Subtext */}
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none uppercase">
              JIGARSHAH BUILDER LLP
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Welcome back, <span className="text-slate-700 font-semibold">{user?.name || "Mr. Jigar"}!</span>
            </p>
          </div>

          {/* Search Bar & Header Right Options */}
          <div className="flex items-center gap-4">
            {/* Global Search Box (Image 2) */}
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, contacts, projects..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* User Profile Badge (Image 2 format with avatar & online status) */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-3 border-l border-slate-200 text-left cursor-pointer"
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "MJ"}
                  </div>
                  {/* Green online dot */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                    <span>{user?.name || "Mr. Jigar"}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span>• Online</span>
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name || "Mr. Jigar"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || "jigar@builder.com"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsSignoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
        title="Sign Out of RealtyCRM"
        message="Are you sure you want to sign out of your account?"
        confirmText="Yes, Sign Out"
        variant="danger"
        isLoading={isSigningOut}
      />
    </div>
  );
}
