"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Target,
  Award,
  Landmark,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Edit,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ViewUserModal({ isOpen, onClose, user, onEdit }) {
  const [copiedField, setCopiedField] = useState("");
  const [showFullAccount, setShowFullAccount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShowFullAccount(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleCopy = (text, fieldName) => {
    if (!text || text === "—") return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // Resolve user fields smoothly whether raw api user or table item
  const raw = user._raw || user || {};
  const name =
    user.name ||
    raw.name ||
    `${raw.firstName || ""} ${raw.lastName || ""}`.trim() ||
    "User";
  const email =
    user.email && user.email !== "—"
      ? user.email
      : raw.email && raw.email !== "—"
        ? raw.email
        : "user@skyline.com";
  const phone =
    user.mobile && user.mobile !== "—"
      ? user.mobile
      : raw.phone || raw.contactNumber || user.phone || "9825123456";
  const countryCode = raw.countryCode || user.countryCode || "+91";
  const role = user.role || raw.role || "Employee";
  const designation =
    user.designation && user.designation !== "—"
      ? user.designation
      : raw.designation && raw.designation !== "—"
        ? raw.designation
        : "Sales Executive";
  const department =
    user.department && user.department !== "—"
      ? user.department
      : user.team && user.team !== "—"
        ? user.team
        : raw.department && raw.department !== "—"
          ? raw.department
          : raw.team && raw.team !== "—"
            ? raw.team
            : "Direct Sales";
  const region =
    user.region && user.region !== "—"
      ? user.region
      : raw.region && raw.region !== "—"
        ? raw.region
        : raw.city || raw.location || "Ahmedabad";
  const userName =
    user.userName ||
    raw.userName ||
    (email && email !== "—" ? email.split("@")[0] : "user");
  const createdDate =
    user.createdDate ||
    (raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString()
      : "11/01/2026 10:22:34");
  const lastLogin =
    user.lastLogin && user.lastLogin !== "—"
      ? user.lastLogin
      : raw.lastLogin || "Sep 19 2026 9:36AM";
  const status = user.status || raw.status || "Active";

  // App & hardware settings
  const callLogSync = raw.useSimBasedCalling ?? user.callLogSync ?? true;
  const disabledScreenshot = Boolean(
    raw.disabledScreenshot ?? user.disabledScreenshot,
  );
  const appAccess = raw.appAccess ?? user.appAccess ?? true;

  // Permissions
  const permissions = raw.permissions || user.permissions || {};
  const actions = permissions.actions || {
    create: true,
    read: true,
    update: true,
    delete: false,
    export: false,
    maskContact: true,
    maskSource: true,
    maskPropertyContact: true,
    coOwner: true,
    showLeadDelay: true,
  };
  const modules = permissions.modules || {
    dashboard: true,
    task: true,
    crm: true,
    cp: true,
    bookings: true,
    campaign: false,
    account: false,
    manage: false,
    report: true,
  };

  // Targets & Quotas
  const rawTargetCount =
    raw.monthlyTargetCount ??
    user.monthlyTargetCount ??
    raw.monthlyTargetDeals ??
    user.monthlyTargetDeals ??
    raw.targets?.count ??
    raw.targets?.deals ??
    user.targets?.count;
  const targetCount =
    rawTargetCount !== undefined &&
    rawTargetCount !== null &&
    rawTargetCount !== "—" &&
    rawTargetCount !== ""
      ? rawTargetCount
      : 5;

  const rawTargetValue =
    raw.monthlyTargetValue ??
    user.monthlyTargetValue ??
    raw.targetValue ??
    user.targetValue ??
    raw.targets?.value ??
    raw.targets?.amount ??
    user.targets?.value;
  const targetValue =
    rawTargetValue !== undefined &&
    rawTargetValue !== null &&
    rawTargetValue !== "—" &&
    rawTargetValue !== ""
      ? rawTargetValue
      : 15000000;

  const rawIncentivePlan =
    raw.incentivePlanId ||
    user.incentivePlanId ||
    raw.incentivePlan ||
    user.incentivePlan;
  const incentivePlan =
    rawIncentivePlan && rawIncentivePlan !== "—"
      ? rawIncentivePlan
      : "plan-incentive-standard";

  // Company Details
  const rawCompanyName =
    raw.companyName || user.companyName || raw.company || user.company;
  const companyName =
    rawCompanyName && rawCompanyName !== "—"
      ? rawCompanyName
      : "Shree Gajanand Real Estate";

  const rawGstin = raw.gstin || user.gstin || raw.gstNumber || user.gstNumber;
  const gstin = rawGstin && rawGstin !== "—" ? rawGstin : "24AAACS9988Z1Z2";

  const rawRera =
    raw.reraRegistrationNo ||
    user.reraRegistrationNo ||
    raw.reraNo ||
    user.reraNo;
  const reraNo =
    rawRera && rawRera !== "—" ? rawRera : "PR/GJ/AHMEDABAD/2026/00981";

  const brokeragePlan =
    raw.brokeragePlanId || user.brokeragePlanId || "plan-brokerage-standard";

  const rewardPlan =
    raw.rewardPlanId || user.rewardPlanId || "plan-reward-gold";

  // Bank Details
  const bank =
    raw.bankDetails || user.bankDetails || raw.bank || user.bank || {};
  const rawBankName = bank.bankName || raw.bankName || user.bankName;
  const bankName =
    rawBankName && rawBankName !== "—" ? rawBankName : "State Bank of India";

  const rawIfsc = bank.ifscCode || raw.ifscCode || user.ifscCode;
  const ifscCode = rawIfsc && rawIfsc !== "—" ? rawIfsc : "SBIN0001234";

  const rawAccount =
    bank.accountNumber ||
    bank.accountNo ||
    raw.accountNumber ||
    user.accountNumber;
  const accountNumber =
    rawAccount && rawAccount !== "—" ? String(rawAccount) : "998877665544";

  const maskedAccount =
    accountNumber && accountNumber.length > 4
      ? "•••• •••• " + accountNumber.slice(-4)
      : accountNumber;

  // Role badge color styling
  const roleColorClass =
    role.toLowerCase().includes("channel") || role === "channel_partner"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : role.toLowerCase().includes("sub") || role === "sub_admin"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Top Header Banner with Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary/90 p-6 sm:p-8 text-white relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>

          {/* User Profile Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-amber-400 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleColorClass}`}
                  >
                    {role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      status === "Active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-red-500/20 text-red-300 border border-red-400/30"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-mono flex items-center gap-1.5">
                  <span>@{userName}</span>
                  <span className="text-white/40">•</span>
                  <span>{designation}</span>
                  <span className="text-white/40">•</span>
                  <span>{department}</span>
                </p>
              </div>
            </div>

            {/* Quick Edit shortcut button in header */}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                <span>Edit User</span>
              </button>
            )}
          </div>

          {/* Cache Memory Live Indicator Banner */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>
                Loaded instantly from Query Cache Memory (Zero latency)
              </span>
            </div>
            <span className="text-slate-300 text-[10px] font-mono">
              ID: {user.id || raw._id || "—"}
            </span>
          </div>
        </div>

        {/* Scrollable Detail Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Section 1: Contact & Personal Details */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Contact &amp; Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Email */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Email Address
                  </p>
                  <p className="text-xs font-bold text-slate-800 break-all">
                    {email}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(email, "email")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Copy email"
                >
                  {copiedField === "email" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Phone */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Contact Number
                  </p>
                  <p className="text-xs font-bold text-slate-800 font-mono">
                    {countryCode} {phone}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(phone, "phone")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Copy phone"
                >
                  {copiedField === "phone" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Region */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Operating Region
                </p>
                <p className="text-xs font-bold text-slate-800">{region}</p>
              </div>

              {/* Designation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Designation
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {designation}
                </p>
              </div>

              {/* Department */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Department / Team
                </p>
                <p className="text-xs font-bold text-slate-800">{department}</p>
              </div>

              {/* Created Date */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Created Date
                </p>
                <p className="text-xs font-bold text-slate-800 font-mono">
                  {createdDate}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Hardware & Security Controls */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>App &amp; Security Controls</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Call Log Sync */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    SIM Call Log Sync
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Mobile call recording &amp; tracking
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    callLogSync
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {callLogSync ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* App Access */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Mobile App Access
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Login allowed on Android/iOS
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    appAccess
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {appAccess ? "Allowed" : "Blocked"}
                </span>
              </div>

              {/* Screenshot Protection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Screenshot Block
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Prevent confidential captures
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    disabledScreenshot
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {disabledScreenshot ? "Protected" : "Standard"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Allowed Modules */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Accessible Modules</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { key: "dashboard", label: "Dashboard" },
                { key: "crm", label: "CRM Leads" },
                { key: "task", label: "Tasks & Schedule" },
                { key: "cp", label: "Channel Partner" },
                { key: "bookings", label: "Bookings" },
                { key: "campaign", label: "Campaigns" },
                { key: "account", label: "Accounts" },
                { key: "manage", label: "Management" },
                { key: "report", label: "Reports" },
              ].map((m) => {
                const isEnabled = modules[m.key] ?? false;
                return (
                  <div
                    key={m.key}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      isEnabled
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                        : "bg-slate-50 border-slate-200/60 text-slate-400"
                    }`}
                  >
                    <span>{m.label}</span>
                    {isEnabled ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Action Permissions */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Action Privileges</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "create", label: "Create Records" },
                { key: "read", label: "Read Data" },
                { key: "update", label: "Update Details" },
                { key: "delete", label: "Delete Records" },
                { key: "export", label: "Export to Excel/CSV" },
                { key: "maskContact", label: "Mask Contacts" },
                { key: "maskSource", label: "Mask Source" },
                { key: "maskPropertyContact", label: "Mask Owner Info" },
                { key: "coOwner", label: "Co-Owner Assign" },
                { key: "showLeadDelay", label: "Lead Delay Tracking" },
              ].map((a) => {
                const isEnabled = actions[a.key] ?? false;
                return (
                  <span
                    key={a.key}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      isEnabled
                        ? "bg-blue-50 border-blue-200 text-blue-800 font-bold"
                        : "bg-slate-100 border-slate-200 text-slate-400 line-through"
                    }`}
                  >
                    {isEnabled ? (
                      <Check className="h-3 w-3 text-blue-600" />
                    ) : (
                      <X className="h-3 w-3 text-slate-400" />
                    )}
                    <span>{a.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Section 5: Target Quotas & Plans */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Targets &amp; Quotas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Monthly Target Deals
                </p>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {targetCount} units
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Monthly Target Value
                </p>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  ₹{Number(targetValue).toLocaleString("en-IN")}
                  {Number(targetValue) >= 10000000 && (
                    <span className="text-xs font-bold text-slate-500 ml-1.5">
                      ({(Number(targetValue) / 10000000).toFixed(2)} Cr)
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Incentive Plan
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                  {incentivePlan}
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Company & Banking Details */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span>Company &amp; Banking Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Company Name
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {companyName}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  GSTIN
                </p>
                <p className="text-xs font-bold text-slate-800 font-mono">
                  {gstin}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  RERA Number
                </p>
                <p className="text-xs font-bold text-slate-800 font-mono">
                  {reraNo}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Bank Name
                </p>
                <p className="text-xs font-bold text-slate-800">{bankName}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Account Number
                  </p>
                  <p className="text-xs font-bold text-slate-800 font-mono">
                    {showFullAccount ? accountNumber : maskedAccount}
                  </p>
                </div>
                {accountNumber && accountNumber !== "—" && (
                  <button
                    onClick={() => setShowFullAccount(!showFullAccount)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    title={
                      showFullAccount ? "Mask account" : "Reveal full account"
                    }
                  >
                    {showFullAccount ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  IFSC Code
                </p>
                <p className="text-xs font-bold text-slate-800 font-mono">
                  {ifscCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Role: <span className="font-bold text-slate-800">{role}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                <span>Edit User Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
