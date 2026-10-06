"use client";

import { useState } from "react";
import { X, Calendar, User, Phone, CheckCircle2 } from "lucide-react";

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [formData, setFormData] = useState({
    leadName: "",
    mobile: "",
    project: "Shiv Pooja Heights",
    activityType: "FOLLOW-UP CALL",
    assignedTo: "Jagdish Patel",
    preSalesAgent: "Aditi R.",
    scheduledFor: "",
    category: "Residential 3 BHK",
    title: "",
    remark: "",
    status: "Pending",
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
      const newTask = {
        id: `TSK-${Date.now().toString().slice(-4)}`,
        createdDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        leadName: formData.leadName || "New Lead",
        mobile: formData.mobile || "+91 9876543210",
        assignedBy: "Mr. Jigar",
        assignedTo: formData.assignedTo,
        preSalesAgent: formData.preSalesAgent,
        scheduledFor: formData.scheduledFor || "Feb 15, 02:00 PM",
        activityType: formData.activityType,
        category: formData.category,
        title: formData.title || `${formData.activityType} with ${formData.leadName}`,
        remark: formData.remark || "Client interested in project details.",
        stage: "Negotiation",
        status: formData.status,
      };

      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <p className="text-xs text-slate-400">Schedule follow-ups, site visits, or agent meetings</p>
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
          {/* Lead Details */}
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
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 9978928637"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Activity Type & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Activity Type</label>
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="FOLLOW-UP CALL">FOLLOW-UP CALL</option>
                <option value="SITE VISIT">SITE VISIT</option>
                <option value="MEETING LOG">MEETING LOG</option>
                <option value="DEMO">DEMO / PRESENTATION</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Project</label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="Shiv Pooja Heights">Shiv Pooja Heights</option>
                <option value="Royal Palms Estate">Royal Palms Estate</option>
                <option value="Emerald Towers">Emerald Towers</option>
                <option value="Jigar Shah Park">Jigar Shah Park</option>
              </select>
            </div>
          </div>

          {/* Agent Assignments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assigned Sales Agent</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="Jagdish Patel">Jagdish Patel</option>
                <option value="Mahesh Chauhan">Mahesh Chauhan</option>
                <option value="Mr. Jigar">Mr. Jigar</option>
                <option value="Rahul Mehta">Rahul Mehta</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Pre-Sales Agent</label>
              <select
                name="preSalesAgent"
                value={formData.preSalesAgent}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              >
                <option value="Aditi R.">Aditi R.</option>
                <option value="Vikram S.">Vikram S.</option>
                <option value="Priya Nair">Priya Nair</option>
              </select>
            </div>
          </div>

          {/* Scheduled Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Scheduled Date & Time</label>
              <input
                type="text"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleChange}
                placeholder="Feb 14, 03:30 PM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Property Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Residential 3 BHK"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Follow up regarding site tour confirmation"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Remarks & Details</label>
            <textarea
              name="remark"
              rows={2}
              value={formData.remark}
              onChange={handleChange}
              placeholder="Add specific buyer preferences, callback time, or notes..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Form Action Buttons */}
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
              <span>{isSubmitting ? "Creating..." : "Save Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
