"use client";

import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Key,
} from "lucide-react";

export default function ViewTenantModal({ isOpen, onClose, tenant }) {
  if (!isOpen || !tenant) return null;

  const company = tenant.companyName || tenant.name || "Real Estate Tenant";
  const adminName = tenant.name || tenant.adminName || "Admin";
  const email = tenant.email || tenant.primaryContact?.email || "N/A";
  const phone = tenant.phone || tenant.primaryContact?.phone || "N/A";
  const tenantId = tenant.id || tenant.tenantId || tenant._id || "N/A";
  const plan = tenant.planName || tenant.plan || "Enterprise Builder";
  const status = tenant.status || "active";
  const createdAt = tenant.createdAt || tenant.updatedAt;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black text-sm shrink-0">
              {company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {company}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-400">
                ID: {tenantId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
              <User className="h-3.5 w-3.5" />
              <span>Admin Contact</span>
            </div>
            <p className="font-extrabold text-slate-900">{adminName}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Status</span>
            </div>
            <p className="font-extrabold text-emerald-600 capitalize">
              {status}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
              <Mail className="h-3.5 w-3.5" />
              <span>Email Address</span>
            </div>
            <p className="font-extrabold text-slate-900 truncate">{email}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
              <Phone className="h-3.5 w-3.5" />
              <span>Phone</span>
            </div>
            <p className="font-extrabold text-slate-900">{phone}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
              <Key className="h-3.5 w-3.5" />
              <span>Plan</span>
            </div>
            <p className="font-extrabold text-slate-900">{plan}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
              <Calendar className="h-3.5 w-3.5" />
              <span>Provisioned</span>
            </div>
            <p className="font-extrabold text-slate-900">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
