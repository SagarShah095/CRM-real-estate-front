"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Key,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Briefcase,
  Landmark,
  Target,
  Award,
  Lock,
  FileCheck,
  Layers,
  Smartphone,
  ShieldAlert,
  ArrowDown,
  Check,
} from "lucide-react";
import { storage } from "@/utils/storage";
import { useAuthContext } from "@/context/AuthContext";
import { createUser, updateUser } from "@/services/api";

const SAMPLE_POOJA_SHAH = {
  name: "Pooja Shah",
  contactNumber: "9825123456",
  phone: "9825123456",
  countryCode: "+91",
  designation: "Sales Executive",
  role: "employee",
  region: "Ahmedabad",
  email: "pooja.sales@skyline.com",
  disabledScreenshot: false,
  useSimBasedCalling: false,
  appAccess: true,
  password: "Password@123",
  confirmPassword: "Password@123",
  permissions: {
    actions: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true,
      maskContact: true,
      maskSource: true,
      maskPropertyContact: true,
      coOwner: true,
      showLeadDelay: true,
    },
    modules: {
      dashboard: true,
      task: true,
      crm: true,
      cp: true,
      bookings: true,
      campaign: true,
      account: true,
      manage: true,
      report: true,
    },
  },
  department: "Direct Sales",
  monthlyTargetCount: 5,
  monthlyTargetValue: 15000000,
  incentivePlanId: "plan-incentive-standard",
  companyName: "Shree Gajanand Real Estate",
  gstin: "24AAACS9988Z1Z2",
  reraRegistrationNo: "PR/GJ/AHMEDABAD/2026/00981",
  brokeragePlanId: "plan-brokerage-standard",
  rewardPlanId: "plan-reward-gold",
  bankDetails: {
    accountNumber: "998877665544",
    ifscCode: "SBIN0001234",
    bankName: "State Bank of India",
  },
};

const INITIAL_EMPTY_STATE = {
  name: "",
  contactNumber: "",
  phone: "",
  countryCode: "+91",
  designation: "",
  role: "employee",
  region: "",
  email: "",
  disabledScreenshot: false,
  useSimBasedCalling: false,
  appAccess: true,
  password: "",
  confirmPassword: "",
  permissions: {
    actions: {
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
    },
    modules: {
      dashboard: true,
      task: true,
      crm: true,
      cp: true,
      bookings: true,
      campaign: false,
      account: false,
      manage: false,
      report: true,
    },
  },
  department: "",
  monthlyTargetCount: "",
  monthlyTargetValue: "",
  incentivePlanId: "",
  companyName: "",
  gstin: "",
  reraRegistrationNo: "",
  brokeragePlanId: "",
  rewardPlanId: "",
  bankDetails: {
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  },
};

const ACTION_DESCRIPTIONS = {
  create: "Add new records & leads",
  read: "View records and listings",
  update: "Modify existing details",
  delete: "Delete or discard records",
  export: "Export data to Excel / CSV",
  maskContact: "Hide client contact digits",
  maskSource: "Hide acquisition marketing source",
  maskPropertyContact: "Hide property owner details",
  coOwner: "Assign multiple team co-owners",
  showLeadDelay: "Show response time tracking",
};

const MODULE_DESCRIPTIONS = {
  dashboard: "Analytics & KPI metrics",
  task: "Activity & follow-up scheduler",
  crm: "Lead pipeline & customer management",
  cp: "Channel partner network & brokers",
  bookings: "Unit allocations & sales forms",
  campaign: "Omnichannel ad campaigns",
  account: "Invoicing, receipts & commissions",
  manage: "User teams & CRM configuration",
  report: "Performance & audit analytics",
};

export default function CreateUserDrawer({
  isOpen,
  onClose,
  onUserCreated,
  onUserUpdated,
  editUser = null,
}) {
  const { user: authUser } = useAuthContext();
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState(INITIAL_EMPTY_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isEdit = Boolean(editUser);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Section references for smooth scrolling to incomplete sections
  const personalRef = useRef(null);
  const securityRef = useRef(null);
  const permissionsRef = useRef(null);
  const targetsRef = useRef(null);
  const companyRef = useRef(null);
  const bankRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Check if current logged in user has Admin role
  const currentUser = authUser || storage.getUser();
  const roleStr = String(currentUser?.role || "")
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
    Boolean(currentUser?.isAdmin) ||
    Boolean(currentUser?.isSuperAdmin);

  // Calculate completeness of each section
  const isPersonalComplete = Boolean(
    formData.name.trim() &&
    formData.email.trim() &&
    (formData.phone.trim() || formData.contactNumber.trim()) &&
    formData.designation.trim() &&
    formData.department.trim() &&
    formData.region.trim(),
  );

  const isSecurityComplete = isEdit
    ? (!formData.password && !formData.confirmPassword) ||
      (formData.password.trim().length >= 6 &&
        formData.password === formData.confirmPassword)
    : Boolean(
        formData.password.trim() &&
        formData.confirmPassword.trim() &&
        formData.password === formData.confirmPassword,
      );

  const isTargetsComplete = Boolean(
    formData.monthlyTargetCount !== "" &&
    formData.monthlyTargetValue !== "" &&
    formData.incentivePlanId.trim(),
  );

  const isCompanyComplete = Boolean(
    formData.companyName.trim() &&
    formData.gstin.trim() &&
    formData.reraRegistrationNo.trim() &&
    formData.brokeragePlanId.trim() &&
    formData.rewardPlanId.trim(),
  );

  const isBankComplete = Boolean(
    formData.bankDetails.bankName.trim() &&
    formData.bankDetails.accountNumber.trim() &&
    formData.bankDetails.ifscCode.trim(),
  );

  const sectionStatus = useMemo(() => {
    return [
      {
        id: "personal",
        title: "1. Personal & Contact",
        isComplete: isPersonalComplete,
        ref: personalRef,
      },
      {
        id: "security",
        title: isEdit ? "2. Security (Optional)" : "2. Security & Access",
        isComplete: isSecurityComplete,
        ref: securityRef,
      },
      {
        id: "permissions",
        title: "3. Permissions",
        isComplete: true,
        ref: permissionsRef,
      },
      {
        id: "targets",
        title: "4. Targets & Quota",
        isComplete: isTargetsComplete,
        ref: targetsRef,
      },
      {
        id: "company",
        title: "5. Company Compliance",
        isComplete: isCompanyComplete,
        ref: companyRef,
      },
      {
        id: "bank",
        title: "6. Banking Details",
        isComplete: isBankComplete,
        ref: bankRef,
      },
    ];
  }, [
    isPersonalComplete,
    isSecurityComplete,
    isTargetsComplete,
    isCompanyComplete,
    isBankComplete,
    isEdit,
  ]);

  const completedSectionsCount = sectionStatus.filter(
    (s) => s.isComplete,
  ).length;
  const totalSections = sectionStatus.length;
  const completionPercentage = Math.round(
    (completedSectionsCount / totalSections) * 100,
  );

  const isAllDataFilled =
    isPersonalComplete &&
    isSecurityComplete &&
    isTargetsComplete &&
    isCompanyComplete &&
    isBankComplete;

  // Lock body scroll when drawer is open and initialize data
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage("");
      setSuccessMessage("");
      setAttemptedSubmit(false);

      if (editUser) {
        const raw = editUser._raw || editUser;
        const rawRole = String(raw.role || editUser.role || "")
          .toLowerCase()
          .trim();
        let normalizedRole = "employee";
        if (
          rawRole.includes("channel") ||
          rawRole === "cp" ||
          rawRole === "channel_partner"
        ) {
          normalizedRole = "channel_partner";
        } else if (rawRole.includes("sub") || rawRole === "sub_admin") {
          normalizedRole = "sub_admin";
        }

        setFormData({
          name: editUser.name || raw.name || "",
          contactNumber:
            editUser.contactNumber ||
            raw.contactNumber ||
            editUser.phone ||
            raw.phone ||
            editUser.mobile ||
            "",
          phone:
            editUser.phone ||
            raw.phone ||
            editUser.contactNumber ||
            raw.contactNumber ||
            editUser.mobile ||
            "",
          countryCode: raw.countryCode || editUser.countryCode || "+91",
          designation: editUser.designation || raw.designation || "",
          role: normalizedRole,
          region:
            editUser.region && editUser.region !== "—"
              ? editUser.region
              : raw.region && raw.region !== "—"
                ? raw.region
                : "",
          email:
            editUser.email && editUser.email !== "—"
              ? editUser.email
              : raw.email && raw.email !== "—"
                ? raw.email
                : "",
          disabledScreenshot: Boolean(
            raw.disabledScreenshot ?? editUser.disabledScreenshot,
          ),
          useSimBasedCalling: Boolean(
            raw.useSimBasedCalling ??
              editUser.useSimBasedCalling ??
              editUser.callLogSync,
          ),
          appAccess: Boolean(raw.appAccess ?? editUser.appAccess ?? true),
          password: "",
          confirmPassword: "",
          permissions: {
            actions: {
              create:
                raw.permissions?.actions?.create ??
                editUser.permissions?.actions?.create ??
                true,
              read:
                raw.permissions?.actions?.read ??
                editUser.permissions?.actions?.read ??
                true,
              update:
                raw.permissions?.actions?.update ??
                editUser.permissions?.actions?.update ??
                true,
              delete:
                raw.permissions?.actions?.delete ??
                editUser.permissions?.actions?.delete ??
                false,
              export:
                raw.permissions?.actions?.export ??
                editUser.permissions?.actions?.export ??
                false,
              maskContact:
                raw.permissions?.actions?.maskContact ??
                editUser.permissions?.actions?.maskContact ??
                true,
              maskSource:
                raw.permissions?.actions?.maskSource ??
                editUser.permissions?.actions?.maskSource ??
                true,
              maskPropertyContact:
                raw.permissions?.actions?.maskPropertyContact ??
                editUser.permissions?.actions?.maskPropertyContact ??
                true,
              coOwner:
                raw.permissions?.actions?.coOwner ??
                editUser.permissions?.actions?.coOwner ??
                true,
              showLeadDelay:
                raw.permissions?.actions?.showLeadDelay ??
                editUser.permissions?.actions?.showLeadDelay ??
                true,
            },
            modules: {
              dashboard:
                raw.permissions?.modules?.dashboard ??
                editUser.permissions?.modules?.dashboard ??
                true,
              task:
                raw.permissions?.modules?.task ??
                editUser.permissions?.modules?.task ??
                true,
              crm:
                raw.permissions?.modules?.crm ??
                editUser.permissions?.modules?.crm ??
                true,
              cp:
                raw.permissions?.modules?.cp ??
                editUser.permissions?.modules?.cp ??
                true,
              bookings:
                raw.permissions?.modules?.bookings ??
                editUser.permissions?.modules?.bookings ??
                true,
              campaign:
                raw.permissions?.modules?.campaign ??
                editUser.permissions?.modules?.campaign ??
                false,
              account:
                raw.permissions?.modules?.account ??
                editUser.permissions?.modules?.account ??
                false,
              manage:
                raw.permissions?.modules?.manage ??
                editUser.permissions?.modules?.manage ??
                false,
              report:
                raw.permissions?.modules?.report ??
                editUser.permissions?.modules?.report ??
                true,
            },
          },
          department:
            editUser.team ||
            raw.department ||
            editUser.department ||
            raw.team ||
            "",
          monthlyTargetCount:
            raw.monthlyTargetCount ?? editUser.monthlyTargetCount ?? "",
          monthlyTargetValue:
            raw.monthlyTargetValue ?? editUser.monthlyTargetValue ?? "",
          incentivePlanId:
            raw.incentivePlanId || editUser.incentivePlanId || "",
          companyName: raw.companyName || editUser.companyName || "",
          gstin: raw.gstin || editUser.gstin || "",
          reraRegistrationNo:
            raw.reraRegistrationNo || editUser.reraRegistrationNo || "",
          brokeragePlanId:
            raw.brokeragePlanId || editUser.brokeragePlanId || "",
          rewardPlanId: raw.rewardPlanId || editUser.rewardPlanId || "",
          bankDetails: {
            accountNumber:
              raw.bankDetails?.accountNumber ||
              editUser.bankDetails?.accountNumber ||
              "",
            ifscCode:
              raw.bankDetails?.ifscCode || editUser.bankDetails?.ifscCode || "",
            bankName:
              raw.bankDetails?.bankName || editUser.bankDetails?.bankName || "",
          },
        });
      } else {
        setFormData(INITIAL_EMPTY_STATE);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editUser]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Helper to update top-level form state
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "contactNumber") {
        updated.phone = value;
      } else if (field === "phone") {
        updated.contactNumber = value;
      }
      return updated;
    });
  };

  // Helper to toggle action permission
  const handleActionToggle = (actionKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        actions: {
          ...prev.permissions.actions,
          [actionKey]: !prev.permissions.actions[actionKey],
        },
      },
    }));
  };

  // Helper to toggle module permission
  const handleModuleToggle = (moduleKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        modules: {
          ...prev.permissions.modules,
          [moduleKey]: !prev.permissions.modules[moduleKey],
        },
      },
    }));
  };

  const toggleAllActions = (val) => {
    setFormData((prev) => {
      const newActions = {};
      Object.keys(prev.permissions.actions).forEach((k) => {
        newActions[k] = val;
      });
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          actions: newActions,
        },
      };
    });
  };

  const toggleAllModules = (val) => {
    setFormData((prev) => {
      const newModules = {};
      Object.keys(prev.permissions.modules).forEach((k) => {
        newModules[k] = val;
      });
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          modules: newModules,
        },
      };
    });
  };

  const handleBankChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  // Fill sample data
  const handleFillSample = () => {
    setFormData(SAMPLE_POOJA_SHAH);
    setErrorMessage("");
    setAttemptedSubmit(false);
  };

  // Reset form to empty
  const handleReset = () => {
    setFormData(INITIAL_EMPTY_STATE);
    setErrorMessage("");
    setAttemptedSubmit(false);
  };

  // Scroll smoothly to target section
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scroll to first incomplete section
  const scrollToFirstIncomplete = () => {
    const firstIncomplete = sectionStatus.find((s) => !s.isComplete);
    if (firstIncomplete && firstIncomplete.ref?.current) {
      firstIncomplete.ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Form submission with strict Admin role verification
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setAttemptedSubmit(true);
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Validation: Verify all sections are filled up
    if (!isAllDataFilled) {
      const missingSections = [];
      if (!isPersonalComplete)
        missingSections.push("Personal & Contact Details");
      if (!isSecurityComplete) missingSections.push("Security & Passwords");
      if (!isTargetsComplete) missingSections.push("Targets & Quota");
      if (!isCompanyComplete) missingSections.push("Company Compliance");
      if (!isBankComplete) missingSections.push("Banking Details");

      setErrorMessage(
        `Incomplete Form: Please fill up all sections before creating the user! Missing: ${missingSections.join(", ")}.`,
      );
      scrollToFirstIncomplete();
      return;
    }

    // 2. Strict Role Verification Requirement:
    // "and if user role admin then call this api only so please manage it perfect"
    if (!isAdmin) {
      setErrorMessage(
        "Access Denied: Only authenticated Admin users are authorized to call /api/v1/users. Please log in with an Admin account.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize role strictly to 'employee', 'channel_partner', or 'sub_admin'
      const rawRole = (formData.role || "").toLowerCase().trim();
      let roleToSend = "employee";
      if (
        rawRole === "channel partner" ||
        rawRole === "channel_partner" ||
        rawRole === "channel-partner"
      ) {
        roleToSend = "channel_partner";
      } else if (
        rawRole === "sub admin" ||
        rawRole === "sub_admin" ||
        rawRole === "sub-admin"
      ) {
        roleToSend = "sub_admin";
      } else {
        roleToSend = "employee";
      }

      const payload = {
        name: formData.name.trim(),
        contactNumber: formData.contactNumber.trim() || formData.phone.trim(),
        phone: formData.phone.trim() || formData.contactNumber.trim(),
        countryCode: formData.countryCode.trim() || "+91",
        designation: formData.designation.trim(),
        role: roleToSend,
        region: formData.region.trim(),
        email: formData.email.trim().toLowerCase(),
        disabledScreenshot: Boolean(formData.disabledScreenshot),
        useSimBasedCalling: Boolean(formData.useSimBasedCalling),
        appAccess: Boolean(formData.appAccess),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        permissions: {
          actions: { ...formData.permissions.actions },
          modules: { ...formData.permissions.modules },
        },
        department: formData.department.trim(),
        monthlyTargetCount: Number(formData.monthlyTargetCount) || 0,
        monthlyTargetValue: Number(formData.monthlyTargetValue) || 0,
        incentivePlanId: formData.incentivePlanId.trim(),
        companyName: formData.companyName.trim(),
        gstin: formData.gstin.trim().toUpperCase(),
        reraRegistrationNo: formData.reraRegistrationNo.trim(),
        brokeragePlanId: formData.brokeragePlanId.trim(),
        rewardPlanId: formData.rewardPlanId.trim(),
        bankDetails: {
          accountNumber: formData.bankDetails.accountNumber.trim(),
          ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
          bankName: formData.bankDetails.bankName.trim(),
        },
      };

      if (isEdit) {
        // Edit Mode: PUT /api/v1/users/{id}
        const targetId = editUser.id || editUser._id;
        const editPayload = { ...payload };

        // If user didn't enter a new password, don't pass password in update payload
        if (!formData.password.trim()) {
          delete editPayload.password;
          delete editPayload.confirmPassword;
        }

        const response = await updateUser(targetId, editPayload);

        if (response?.success !== false && !response?.error) {
          setSuccessMessage("User updated successfully via /api/v1/users/{id}!");

          const roleDisplay =
            roleToSend === "channel_partner"
              ? "Channel Partner"
              : roleToSend === "sub_admin"
                ? "Sub-Admin"
                : "Employee";

          const updatedUserObj = {
            ...editUser,
            ...editPayload,
            id: targetId,
            role: roleDisplay,
            mobile: editPayload.phone,
            _raw: response?.data || response?.user || { ...editUser, ...editPayload },
          };

          if (onUserUpdated) {
            onUserUpdated(updatedUserObj);
          }

          setTimeout(() => {
            setIsSubmitting(false);
            onClose();
          }, 600);
        } else {
          const errorText =
            response?.message ||
            response?.error ||
            "Failed to update user via /api/v1/users/{id}.";
          setErrorMessage(errorText);
          setIsSubmitting(false);
        }
      } else {
        // Create Mode: POST /api/v1/users
        const response = await createUser(payload);

        if (response?.success !== false && !response?.error) {
          setSuccessMessage("User created successfully via /api/v1/users!");

          if (onUserCreated) {
            const roleDisplay =
              roleToSend === "channel_partner"
                ? "Channel Partner"
                : roleToSend === "sub_admin"
                  ? "Sub-Admin"
                  : "Employee";

            const backendUser =
              response?.data?.user ||
              response?.data ||
              response?.user ||
              {};

            const createdUser = {
              ...payload,
              ...backendUser,
              id:
                backendUser._id ||
                backendUser.id ||
                `USR-${Date.now().toString().slice(-4)}`,
              name: payload.name,
              email: payload.email,
              mobile: payload.phone,
              phone: payload.phone,
              contactNumber: payload.contactNumber,
              role: roleDisplay,
              designation: payload.designation,
              region: payload.region || "Ahmedabad",
              team: payload.department,
              department: payload.department,
              monthlyTargetCount: payload.monthlyTargetCount || 5,
              monthlyTargetValue: payload.monthlyTargetValue || 15000000,
              incentivePlanId:
                payload.incentivePlanId || "plan-incentive-standard",
              companyName:
                payload.companyName || "Shree Gajanand Real Estate",
              gstin: payload.gstin || "24AAACS9988Z1Z2",
              reraRegistrationNo:
                payload.reraRegistrationNo ||
                "PR/GJ/AHMEDABAD/2026/00981",
              brokeragePlanId:
                payload.brokeragePlanId || "plan-brokerage-standard",
              rewardPlanId: payload.rewardPlanId || "plan-reward-gold",
              bankDetails: payload.bankDetails || {
                bankName: "State Bank of India",
                accountNumber: "998877665544",
                ifscCode: "SBIN0001234",
              },
              userName: `j${payload.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .slice(0, 6)}${Math.floor(100 + Math.random() * 900)}`,
              createdDate:
                new Date().toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                }) +
                " " +
                new Date().toLocaleTimeString("en-US", { hour12: false }),
              lastLogin: "Never",
              status: "Active",
              callLogSync: payload.useSimBasedCalling ?? true,
              syncLast: "Just now",
              _raw: {
                ...payload,
                ...backendUser,
              },
            };
            onUserCreated(createdUser);
          }

          setTimeout(() => {
            setIsSubmitting(false);
            onClose();
          }, 600);
        } else {
          const errorText =
            response?.message ||
            response?.error ||
            "Failed to create user. Please check the backend service.";
          setErrorMessage(errorText);
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error("[CreateUserDrawer Submit Error]:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          `An unexpected error occurred while calling ${isEdit ? "PUT" : "POST"} /api/v1/users.`,
      );
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto bg-slate-900/60 backdrop-blur-sm"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Unified One-Slide Right Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl md:max-w-3xl lg:max-w-3xl bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="drawer-title"
                  className="text-lg font-black tracking-tight text-white"
                >
                  {isEdit ? "Edit User Profile" : "Add New User"}
                </h2>
                {isEdit ? (
                  <span
                    suppressHydrationWarning
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  >
                    PUT /api/v1/users/id
                  </span>
                ) : isAdmin ? (
                  <span
                    suppressHydrationWarning
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  >
                    Admin Verified • /api/v1/users
                  </span>
                ) : (
                  <span
                    suppressHydrationWarning
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  >
                    Non-Admin • Read Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEdit
                  ? `Update user credentials, permissions and access configurations for ${formData.name || "user"}`
                  : "Complete all sections to provision user credentials, permissions and targets"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEdit && (
              <button
                type="button"
                onClick={handleFillSample}
                title="Load Pooja Shah Example Data"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-amber-500/30 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  Fill Example (Pooja Shah)
                </span>
                <span className="sm:hidden">Fill</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress & Section Quick-Jump Ribbon (Single Slide Navigator) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 shrink-0 space-y-2">
          {/* Progress Bar & Counter */}
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span>Form Progress:</span>
              <span className="text-primary font-black">
                {completedSectionsCount} of {totalSections} Sections Complete (
                {completionPercentage}%)
              </span>
            </span>
            {isAllDataFilled ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> All sections ready to
                submit
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Fill all pages to enable
                submission
              </span>
            )}
          </div>

          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isAllDataFilled ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Quick Jump Buttons with Visual Completion Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
            {sectionStatus.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.ref)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  section.isComplete
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : attemptedSubmit
                      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 animate-pulse"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {section.isComplete ? (
                  <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-800 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mx-6 mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Scrollable Single Slide Form Body */}
        <form
          ref={scrollContainerRef}
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-xs scroll-smooth"
        >
          {/* 1. PERSONAL & CONTACT SECTION */}
          <div
            ref={personalRef}
            className={`p-5 rounded-2xl border transition-all ${
              attemptedSubmit && !isPersonalComplete
                ? "bg-red-50/20 border-red-300 ring-2 ring-red-100"
                : "bg-slate-50/80 border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    1. Personal &amp; Contact Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Identity, official contact info &amp; placement
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isPersonalComplete
                    ? "bg-emerald-100/70 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isPersonalComplete ? "✓ Completed" : "Required"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g. Pooja Shah"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                        attemptedSubmit && !formData.name.trim()
                          ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {attemptedSubmit && !formData.name.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Full Name is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="pooja.sales@skyline.com"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                        attemptedSubmit && !formData.email.trim()
                          ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {attemptedSubmit && !formData.email.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Email is required
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Country Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={formData.countryCode}
                    onChange={(e) =>
                      handleInputChange("countryCode", e.target.value)
                    }
                    placeholder="+91"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Phone / Contact Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="9825123456"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono font-semibold transition-all ${
                        attemptedSubmit && !formData.phone.trim()
                          ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {attemptedSubmit && !formData.phone.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Phone Number is required
                    </p>
                  )}
                </div>
              </div>

              {/* Designation, Department, Role & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    placeholder="e.g. Sales Executive"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                      attemptedSubmit && !formData.designation.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.designation.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Designation is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    placeholder="e.g. Direct Sales"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                      attemptedSubmit && !formData.department.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.department.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Department is required
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    System Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold"
                  >
                    <option value="employee">Employee</option>
                    <option value="channel_partner">Channel Partner</option>
                    <option value="sub_admin">Sub-Admin</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Allowed roles: Employee, Channel Partner, Sub-Admin
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Region / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) =>
                      handleInputChange("region", e.target.value)
                    }
                    placeholder="e.g. Ahmedabad"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                      attemptedSubmit && !formData.region.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.region.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Region is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. SECURITY & ACCESS SECTION */}
          <div
            ref={securityRef}
            className={`p-5 rounded-2xl border transition-all ${
              attemptedSubmit && !isSecurityComplete
                ? "bg-red-50/20 border-red-300 ring-2 ring-red-100"
                : "bg-slate-50/80 border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    2. Security &amp; App Access
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Portal credentials and security policies
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isSecurityComplete
                    ? "bg-emerald-100/70 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isSecurityComplete ? "✓ Completed" : "Required"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isEdit ? (
                      "New Password (Optional)"
                    ) : (
                      <>
                        Password <span className="text-red-500">*</span>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder={isEdit ? "Leave blank if unchanged" : "••••••••"}
                      className={`w-full pl-9 pr-10 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                        !isEdit && attemptedSubmit && !formData.password.trim()
                          ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                          : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {!isEdit && attemptedSubmit && !formData.password.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Password is required
                    </p>
                  )}
                  {isEdit && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave blank to keep existing password unchanged.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isEdit ? (
                      "Confirm New Password"
                    ) : (
                      <>
                        Confirm Password <span className="text-red-500">*</span>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder={isEdit ? "Leave blank if unchanged" : "••••••••"}
                      className={`w-full pl-9 pr-10 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                        !isEdit &&
                        attemptedSubmit &&
                        (!formData.confirmPassword.trim() ||
                          formData.password !== formData.confirmPassword)
                          ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                          : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.password &&
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">
                        Passwords do not match
                      </p>
                    )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                {/* App Access Toggle */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">
                      Application Access (appAccess)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Grant authorization to log into web dashboard and mobile
                      app
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.appAccess}
                      onChange={(e) =>
                        handleInputChange("appAccess", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                {/* Disable Screenshot Toggle */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">
                      Disable Screenshots (disabledScreenshot)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Prevent taking mobile screenshots of sensitive customer
                      data
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.disabledScreenshot}
                      onChange={(e) =>
                        handleInputChange(
                          "disabledScreenshot",
                          e.target.checked,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
                  </label>
                </div>

                {/* Use SIM Based Calling Toggle */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">
                      SIM Based Calling (useSimBasedCalling)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Route outgoing telephony calls through phone SIM and track
                      logs
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useSimBasedCalling}
                      onChange={(e) =>
                        handleInputChange(
                          "useSimBasedCalling",
                          e.target.checked,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3. PERMISSIONS MATRIX SECTION */}
          <div
            ref={permissionsRef}
            className="p-5 rounded-2xl border bg-slate-50/80 border-slate-200/80 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    3. Permissions Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Granular role actions and accessible CRM modules
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-700 border border-emerald-200">
                ✓ Configured
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">
                  Action Permissions (10 Actions)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllActions(true)}
                    className="px-2 py-0.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-md"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllActions(false)}
                    className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(formData.permissions.actions).map(
                  ([actionKey, isAllowed]) => (
                    <label
                      key={actionKey}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isAllowed
                          ? "bg-white border-primary/40 shadow-sm"
                          : "bg-slate-100/60 border-slate-200 opacity-60"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800 capitalize">
                          {actionKey.replace(/([A-Z])/g, " $1")}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ACTION_DESCRIPTIONS[actionKey] ||
                            "Permission action"}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => handleActionToggle(actionKey)}
                        className="h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                      />
                    </label>
                  ),
                )}
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-3 pt-3 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">
                  Module Access (9 Modules)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllModules(true)}
                    className="px-2 py-0.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-md"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllModules(false)}
                    className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {Object.entries(formData.permissions.modules).map(
                  ([moduleKey, isAllowed]) => (
                    <label
                      key={moduleKey}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isAllowed
                          ? "bg-white border-primary/40 shadow-sm"
                          : "bg-slate-100/60 border-slate-200 opacity-60"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          {moduleKey}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {MODULE_DESCRIPTIONS[moduleKey] || "Module access"}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => handleModuleToggle(moduleKey)}
                        className="h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                      />
                    </label>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* 4. TARGETS & INCENTIVES SECTION */}
          <div
            ref={targetsRef}
            className={`p-5 rounded-2xl border transition-all ${
              attemptedSubmit && !isTargetsComplete
                ? "bg-red-50/20 border-red-300 ring-2 ring-red-100"
                : "bg-slate-50/80 border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    4. Targets &amp; Quota Plans
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Performance goals and commission scheme
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isTargetsComplete
                    ? "bg-emerald-100/70 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isTargetsComplete ? "✓ Completed" : "Required"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Monthly Target Count (Units / Deals){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyTargetCount}
                    onChange={(e) =>
                      handleInputChange("monthlyTargetCount", e.target.value)
                    }
                    placeholder="e.g. 5"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-bold font-mono transition-all ${
                      attemptedSubmit && formData.monthlyTargetCount === ""
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && formData.monthlyTargetCount === "" && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Target Count is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Monthly Target Value (INR ₹){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={formData.monthlyTargetValue}
                    onChange={(e) =>
                      handleInputChange("monthlyTargetValue", e.target.value)
                    }
                    placeholder="e.g. 15000000"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-bold font-mono transition-all ${
                      attemptedSubmit && formData.monthlyTargetValue === ""
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {formData.monthlyTargetValue !== "" && (
                    <p className="text-[10px] text-primary font-semibold mt-1">
                      ₹{" "}
                      {Number(formData.monthlyTargetValue || 0).toLocaleString(
                        "en-IN",
                      )}
                      {Number(formData.monthlyTargetValue) >= 10000000 &&
                        ` (${(Number(formData.monthlyTargetValue) / 10000000).toFixed(2)} Cr)`}
                    </p>
                  )}
                  {attemptedSubmit && formData.monthlyTargetValue === "" && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Target Value is required
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Incentive Plan ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.incentivePlanId}
                  onChange={(e) =>
                    handleInputChange("incentivePlanId", e.target.value)
                  }
                  placeholder="e.g. plan-incentive-standard"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold font-mono transition-all ${
                    attemptedSubmit && !formData.incentivePlanId.trim()
                      ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                      : "border-slate-200"
                  }`}
                />
                {attemptedSubmit && !formData.incentivePlanId.trim() && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    Incentive Plan ID is required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 5. COMPANY & REGULATORY SECTION */}
          <div
            ref={companyRef}
            className={`p-5 rounded-2xl border transition-all ${
              attemptedSubmit && !isCompanyComplete
                ? "bg-red-50/20 border-red-300 ring-2 ring-red-100"
                : "bg-slate-50/80 border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    5. Company &amp; Regulatory Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    RERA, GSTIN &amp; brokerage schemes
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isCompanyComplete
                    ? "bg-emerald-100/70 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isCompanyComplete ? "✓ Completed" : "Required"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Company / Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  placeholder="e.g. Shree Gajanand Real Estate"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                    attemptedSubmit && !formData.companyName.trim()
                      ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                      : "border-slate-200"
                  }`}
                />
                {attemptedSubmit && !formData.companyName.trim() && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    Company Name is required
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    GSTIN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) =>
                      handleInputChange("gstin", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. 24AAACS9988Z1Z2"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono uppercase font-bold transition-all ${
                      attemptedSubmit && !formData.gstin.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.gstin.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      GSTIN is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    RERA Registration No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reraRegistrationNo}
                    onChange={(e) =>
                      handleInputChange("reraRegistrationNo", e.target.value)
                    }
                    placeholder="e.g. PR/GJ/AHMEDABAD/2026/00981"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono font-bold transition-all ${
                      attemptedSubmit && !formData.reraRegistrationNo.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.reraRegistrationNo.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      RERA Number is required
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Brokerage Plan ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brokeragePlanId}
                    onChange={(e) =>
                      handleInputChange("brokeragePlanId", e.target.value)
                    }
                    placeholder="e.g. plan-brokerage-standard"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono font-semibold transition-all ${
                      attemptedSubmit && !formData.brokeragePlanId.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.brokeragePlanId.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Brokerage Plan ID is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Reward Plan ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.rewardPlanId}
                    onChange={(e) =>
                      handleInputChange("rewardPlanId", e.target.value)
                    }
                    placeholder="e.g. plan-reward-gold"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono font-semibold transition-all ${
                      attemptedSubmit && !formData.rewardPlanId.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.rewardPlanId.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      Reward Plan ID is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 6. BANKING DETAILS SECTION */}
          <div
            ref={bankRef}
            className={`p-5 rounded-2xl border transition-all ${
              attemptedSubmit && !isBankComplete
                ? "bg-red-50/20 border-red-300 ring-2 ring-red-100"
                : "bg-slate-50/80 border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    6. Disbursement Bank Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Account for payouts &amp; incentives
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isBankComplete
                    ? "bg-emerald-100/70 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isBankComplete ? "✓ Completed" : "Required"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleBankChange("bankName", e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-semibold transition-all ${
                    attemptedSubmit && !formData.bankDetails.bankName.trim()
                      ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                      : "border-slate-200"
                  }`}
                />
                {attemptedSubmit && !formData.bankDetails.bankName.trim() && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    Bank Name is required
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      handleBankChange("accountNumber", e.target.value)
                    }
                    placeholder="e.g. 998877665544"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono font-bold transition-all ${
                      attemptedSubmit &&
                      !formData.bankDetails.accountNumber.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit &&
                    !formData.bankDetails.accountNumber.trim() && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">
                        Account Number is required
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) =>
                      handleBankChange("ifscCode", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. SBIN0001234"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-900 focus:outline-none focus:border-primary font-mono uppercase font-bold transition-all ${
                      attemptedSubmit && !formData.bankDetails.ifscCode.trim()
                        ? "border-red-400 ring-1 ring-red-300 bg-red-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {attemptedSubmit && !formData.bankDetails.ifscCode.trim() && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      IFSC Code is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Form Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md -mx-6 px-6 -mb-6 pb-6 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-all text-xs cursor-pointer"
                >
                  Clear Fields
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 font-bold transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Informative status indicator */}
              {!isAllDataFilled && (
                <span className="hidden sm:inline-block text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                  Fill all sections to {isEdit ? "update" : "submit"}
                </span>
              )}

              {/* Submit Button with dynamic validation behavior */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAllDataFilled
                    ? "text-white bg-primary hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                    : "text-slate-500 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 border border-slate-300"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{isEdit ? "Calling PUT /api/v1/users..." : "Calling /api/v1/users..."}</span>
                  </>
                ) : isAllDataFilled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isEdit ? "Update User" : "Create User"}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>{isEdit ? "Update User (Incomplete)" : "Create User (Incomplete)"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
