"use client";

import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action requires your confirmation to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning", // "danger" | "warning" | "info" | "success"
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertCircle className="h-6 w-6 text-rose-600" />,
          iconBg: "bg-rose-100 border-rose-200",
          confirmBtn:
            "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 font-bold",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
          iconBg: "bg-amber-100 border-amber-200",
          confirmBtn:
            "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20 font-bold",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
          iconBg: "bg-emerald-100 border-emerald-200",
          confirmBtn:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 font-bold",
        };
      case "info":
      default:
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          iconBg: "bg-blue-100 border-blue-200",
          confirmBtn:
            "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 font-bold",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-5">
        {/* Header with Icon & Close Button */}
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl border ${styles.iconBg} shrink-0`}>
            {styles.icon}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <div className="text-xs font-semibold text-slate-500 leading-relaxed">
            {message}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${styles.confirmBtn}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            <span>{isLoading ? "Processing..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
