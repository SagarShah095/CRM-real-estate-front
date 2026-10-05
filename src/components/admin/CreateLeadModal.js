"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Building, Globe, DollarSign, CheckCircle2 } from "lucide-react";

export default function CreateLeadModal({ isOpen, onClose, onLeadCreated }) {
  const [formData, setFormData] = useState({
    leadName: "",
    mobile: "",
    email: "",
    source: "Google Form",
    stage: "NEW",
    project: "Shiv Pooja Heights",
    budget: "₹65 L - ₹85 L",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newLead = {
        id: `LID-${Math.floor(1000 + Math.random() * 9000)}`,
        creationDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        assignedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        leadName: formData.leadName || "New Prospect",
        mobile: formData.mobile || "+91 9876543210",
        email: formData.email || "prospect@example.com",
        stage: formData.stage,
        stageReason: formData.stage === "LOST" ? "Not Interested" : "—",
        source: formData.source,
      };

      if (onLeadCreated) {
        onLeadCreated(newLead);
      }
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Lead</h3>
              <p className="text-xs text-slate-400">Register new inquiry to master database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Lead Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Lead Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="leadName"
                  required
                  value={formData.leadName}
                  onChange={handleChange}
                  placeholder="e.g. Dhaval Bhai"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Primary Mobile <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91-9978928637"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email & Lead Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dhaval@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="Google Form">Google Form</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="MagicBricks">MagicBricks</option>
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="99acres">99acres</option>
              </select>
            </div>
          </div>

          {/* Stage & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Initial Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="LOST">LOST</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Project Interest</label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="Shiv Pooja Heights">Shiv Pooja Heights</option>
                <option value="Royal Palms">Royal Palms</option>
                <option value="Emerald Towers">Emerald Towers</option>
              </select>
            </div>
          </div>

          {/* Budget & Remarks */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Budget Range</label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="₹60 L - ₹80 L"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Notes & Remarks</label>
            <textarea
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Buyer requirements, preferred possession date..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-white font-bold bg-primary hover:bg-orange-600 transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? "Creating..." : "Save Lead"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
