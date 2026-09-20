"use client";

import { useState, useEffect } from "react";
import { useUpdateAdminMutation } from "@/hooks/useAdminsQuery";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";

const PLAN_OPTIONS = [
  "Enterprise Builder",
  "Pro Real Estate",
  "Basic CRM",
  "Free Trial",
];

export default function EditTenantModal({
  isOpen,
  onClose,
  onSuccess,
  tenant = null,
}) {
  const updateAdminMutation = useUpdateAdminMutation();

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    planName: "Enterprise Builder",
    status: "active",
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (tenant) {
      setFormData({
        companyName: tenant.companyName || tenant.name || "",
        name: tenant.name || tenant.adminName || "",
        email: tenant.email || tenant.primaryContact?.email || "",
        phone: tenant.phone || tenant.primaryContact?.phone || "",
        planName: tenant.planName || tenant.plan || "Enterprise Builder",
        status: tenant.status || "active",
      });
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const tenantId = tenant._id || tenant.id;

    try {
      const res = await updateAdminMutation.mutateAsync({
        id: tenantId,
        data: formData,
      });

      if (res?.success !== false && !res?.error) {
        setSuccessMessage("Tenant updated successfully!");
        setTimeout(() => {
          setIsLoading(false);
          setIsConfirmOpen(false);
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(
          res?.message || res?.error || "Failed to update tenant details.",
        );
        setIsLoading(false);
        setIsConfirmOpen(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
      setErrorMessage("An error occurred while saving. Please try again.");
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Edit Tenant Details
                </h3>
                <p className="text-xs text-slate-500">
                  Update subscription plan, organization name & primary contact
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

          {/* Form Body */}
          <form
            onSubmit={handleFormSubmit}
            className="p-6 space-y-5 overflow-y-auto flex-1"
          >
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
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
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                >
                  {PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Save Changes Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        title="Update Tenant Details"
        message={`Are you sure you want to save updates for ${formData.companyName || "this tenant"}?`}
        confirmText="Save Updates"
        variant="info"
        isLoading={isLoading}
      />
    </>
  );
}
