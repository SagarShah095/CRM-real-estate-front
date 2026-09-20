"use client";

import { useState } from "react";
import { useCreateAdminMutation } from "@/hooks/useAdminsQuery";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";

const AVAILABLE_MODULES = [
  { id: "dashboard", label: "Dashboard Overview" },
  { id: "leads", label: "Leads Management" },
  { id: "pipeline", label: "Sales Pipeline" },
  { id: "attendance", label: "Staff Attendance" },
  { id: "incentives", label: "Sales Incentives" },
  { id: "channel-partners", label: "Channel Partners" },
  { id: "site-visits", label: "Site Visit Tracking" },
];

const PLAN_OPTIONS = [
  "Enterprise Builder",
  "Pro Real Estate",
  "Basic CRM",
  "Free Trial",
];

export default function ProvisionTenantModal({ isOpen, onClose, onSuccess }) {
  const createAdminMutation = useCreateAdminMutation();

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "Password@123",
    planName: "Enterprise Builder",
    licensedModules: [
      "dashboard",
      "leads",
      "pipeline",
      "attendance",
      "incentives",
      "channel-partners",
      "site-visits",
    ],
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleModuleToggle = (moduleId) => {
    setFormData((prev) => {
      const current = prev.licensedModules;
      const updated = current.includes(moduleId)
        ? current.filter((m) => m !== moduleId)
        : [...current, moduleId];
      return { ...prev, licensedModules: updated };
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsConfirmOpen(true);
  };

  const handleConfirmProvision = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await createAdminMutation.mutateAsync(formData);

      if (
        result?.success !== false &&
        (result?.success ||
          result?.data ||
          result?.id ||
          result?._id ||
          !result?.error)
      ) {
        setSuccessMessage("Tenant provisioned successfully!");
        setTimeout(() => {
          setIsLoading(false);
          setIsConfirmOpen(false);
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(
          result?.message || result?.error || "Failed to provision tenant.",
        );
        setIsLoading(false);
        setIsConfirmOpen(false);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Provision New Tenant
              </h3>
              <p className="text-xs text-slate-500">
                Register a new real estate organization & admin account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleFormSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Company & Admin Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="Prestige Heights Group"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Rajesh Singhania"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="rajesh@prestigeheights.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9825012345"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Password@123"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subscription Plan
              </label>
              <select
                value={formData.planName}
                onChange={(e) =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {PLAN_OPTIONS.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Licensed Modules */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Licensed CRM Modules
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_MODULES.map((mod) => {
                const isSelected = formData.licensedModules.includes(mod.id);
                return (
                  <button
                    type="button"
                    key={mod.id}
                    onClick={() => handleModuleToggle(mod.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span>{mod.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Provision Tenant</span>
            </button>
          </div>
        </form>
      </div>

      {/* Provision Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmProvision}
        title="Provision New Tenant"
        message={`Are you sure you want to provision ${
          formData.companyName || "this new tenant"
        } under the ${formData.planName} plan?`}
        confirmText="Yes, Provision Tenant"
        variant="warning"
        isLoading={isLoading}
      />
    </div>
  );
}
