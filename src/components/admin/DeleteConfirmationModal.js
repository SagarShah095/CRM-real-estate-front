"use client";

import { AlertTriangle, Trash2, RefreshCw, X } from "lucide-react";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  itemDetails = null,
  isDeleting = false,
  confirmText = "Delete",
  endpointInfo = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => !isDeleting && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200 space-y-5"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => !isDeleting && onClose()}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 pr-6">
          <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-200/50">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            {endpointInfo && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {endpointInfo}
              </p>
            )}
          </div>
        </div>

        {/* Confirmation Content Card */}
        <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/60 space-y-2.5 text-xs">
          <p className="text-slate-700 leading-relaxed">
            {description}{" "}
            {itemName && (
              <span className="font-black text-slate-900 block mt-1">
                "{itemName}"
              </span>
            )}
          </p>

          {itemDetails && typeof itemDetails === "object" && !itemDetails.$$typeof && (
            <div className="text-[11px] text-slate-600 font-mono bg-white/70 rounded-xl p-2.5 border border-red-100 space-y-1">
              {Object.entries(itemDetails).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 capitalize">{key}:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {String(val || "—")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {itemDetails && itemDetails.$$typeof && (
            <div className="pt-1">{itemDetails}</div>
          )}

          <p className="text-[11px] text-red-600 font-semibold pt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            Warning: This action will permanently remove the record from the database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/25 transition-all cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
