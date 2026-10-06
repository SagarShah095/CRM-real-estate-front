"use client";

import { useState, useEffect } from "react";
import {
  X,
  Building,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import {
  createProject,
  updateProject,
  getProjectById,
} from "@/services/projects.service";

const SAMPLE_SKYLINE_PRESET = {
  name: "Skyline Pinnacle",
  code: "SKPIN",
  projectType: "residential",
  status: "under_construction",
  location: {
    address: "24th Main, Sector 2, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
    latitude: 12.9121,
    longitude: 77.6445,
  },
  reraNumber: "PRM/KA/RERA/1251/310/PR/230101/005500",
  totalTowers: 3,
  totalUnits: 120,
  amenities: ["Swimming Pool", "Clubhouse", "Gym", "EV Charging"],
  towers: ["Tower A", "Tower B", "Tower C"],
  startDate: "2024-01-01",
  expectedCompletionDate: "2026-12-31",
  description: "Luxury 2 & 3 BHK residences with world-class amenities",
};

const COMMON_AMENITIES = [
  "Swimming Pool",
  "Clubhouse",
  "Gym",
  "EV Charging",
  "24/7 Security",
  "Children Play Area",
  "Jogging Track",
  "Power Backup",
  "Tennis Court",
  "Landscaped Gardens",
  "Yoga Deck",
  "Rainwater Harvesting",
];

const INITIAL_STATE = {
  name: "",
  code: "",
  projectType: "residential",
  status: "under_construction",
  location: {
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
  },
  reraNumber: "",
  totalTowers: 1,
  totalUnits: 1,
  amenities: ["Swimming Pool", "Clubhouse", "Gym"],
  towers: ["Tower A"],
  startDate: "",
  expectedCompletionDate: "",
  description: "",
};

export default function CreateProjectDrawer({
  isOpen,
  onClose,
  onProjectCreated,
  onProjectUpdated,
  editProject = null,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [newTowerName, setNewTowerName] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEdit = Boolean(editProject);

  // Lock body scroll and load data when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage("");
      setSuccessMessage("");

      if (editProject && editProject.name) {
        setFormData({
          name: editProject.name || "",
          code: editProject.code || "",
          projectType: editProject.projectType || "residential",
          status: editProject.status || "under_construction",
          location: {
            address: editProject.location?.address || "",
            city: editProject.location?.city || "",
            state: editProject.location?.state || "",
            pincode: editProject.location?.pincode || "",
            latitude: editProject.location?.latitude ?? "",
            longitude: editProject.location?.longitude ?? "",
          },
          reraNumber: editProject.reraNumber || "",
          totalTowers: editProject.totalTowers || 1,
          totalUnits: editProject.totalUnits || 1,
          amenities: Array.isArray(editProject.amenities)
            ? editProject.amenities
            : [],
          towers: Array.isArray(editProject.towers) ? editProject.towers : [],
          startDate: editProject.startDate
            ? editProject.startDate.slice(0, 10)
            : "",
          expectedCompletionDate: editProject.expectedCompletionDate
            ? editProject.expectedCompletionDate.slice(0, 10)
            : "",
          description: editProject.description || "",
        });
      } else if (
        editProject &&
        !editProject.name &&
        (editProject.id || editProject._id)
      ) {
        // Direct URL load fallback: fetch single project from backend
        const targetId = editProject.id || editProject._id;
        getProjectById(targetId)
          .then((res) => {
            const p = res?.data?.project || res?.data || res;
            if (p && p.name) {
              setFormData({
                name: p.name || "",
                code: p.code || "",
                projectType: p.projectType || "residential",
                status: p.status || "under_construction",
                location: {
                  address: p.location?.address || "",
                  city: p.location?.city || "",
                  state: p.location?.state || "",
                  pincode: p.location?.pincode || "",
                  latitude: p.location?.latitude ?? "",
                  longitude: p.location?.longitude ?? "",
                },
                reraNumber: p.reraNumber || "",
                totalTowers: p.totalTowers || 1,
                totalUnits: p.totalUnits || 1,
                amenities: Array.isArray(p.amenities) ? p.amenities : [],
                towers: Array.isArray(p.towers) ? p.towers : [],
                startDate: p.startDate ? p.startDate.slice(0, 10) : "",
                expectedCompletionDate: p.expectedCompletionDate
                  ? p.expectedCompletionDate.slice(0, 10)
                  : "",
                description: p.description || "",
              });
            }
          })
          .catch((err) => {
            console.warn("Failed to fetch project details on URL load:", err);
          });
      } else if (!editProject) {
        setFormData(INITIAL_STATE);
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editProject]);

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

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const handleApplyPreset = () => {
    setFormData(SAMPLE_SKYLINE_PRESET);
    setSuccessMessage("Prefilled with Skyline Pinnacle details!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleAddCustomAmenity = (e) => {
    e?.preventDefault();
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!formData.amenities.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
    }
    setCustomAmenity("");
  };

  const handleAddTower = (e) => {
    e?.preventDefault();
    const trimmed = newTowerName.trim();
    if (!trimmed) return;
    if (!formData.towers.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        towers: [...prev.towers, trimmed],
        totalTowers: Math.max(prev.totalTowers, prev.towers.length + 1),
      }));
    }
    setNewTowerName("");
  };

  const handleRemoveTower = (towerToRemove) => {
    setFormData((prev) => ({
      ...prev,
      towers: prev.towers.filter((t) => t !== towerToRemove),
      totalTowers: Math.max(1, prev.towers.length - 1),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Project Name is required.");
      return;
    }
    if (!formData.code.trim()) {
      setErrorMessage("Project Code is required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      projectType: formData.projectType,
      status: formData.status,
      location: {
        address: formData.location.address || "",
        city: formData.location.city || "",
        state: formData.location.state || "",
        pincode: formData.location.pincode || "",
        latitude: formData.location.latitude
          ? Number(formData.location.latitude)
          : 0,
        longitude: formData.location.longitude
          ? Number(formData.location.longitude)
          : 0,
      },
      reraNumber: formData.reraNumber.trim(),
      totalTowers: Number(formData.totalTowers) || 1,
      totalUnits: Number(formData.totalUnits) || 1,
      amenities: formData.amenities,
      towers: formData.towers.length > 0 ? formData.towers : [`Tower 1`],
      startDate: formData.startDate || null,
      expectedCompletionDate: formData.expectedCompletionDate || null,
      description: formData.description || "",
    };

    setIsSubmitting(true);

    try {
      if (isEdit) {
        const targetId = editProject.id || editProject._id;
        const res = await updateProject(targetId, payload);
        if (res?.success !== false && !res?.error) {
          const updated = res.data?.project ||
            res.data || { ...payload, id: targetId, _id: targetId };
          if (onProjectUpdated) onProjectUpdated(updated);
          onClose();
        } else {
          setErrorMessage(
            res.message || res.error || "Failed to update project",
          );
        }
      } else {
        const res = await createProject(payload);
        if (res?.success !== false && !res?.error) {
          const created = res.data?.project ||
            res.data || {
              ...payload,
              id: `proj-${Date.now()}`,
              _id: `proj-${Date.now()}`,
            };
          if (onProjectCreated) onProjectCreated(created);
          onClose();
        } else {
          setErrorMessage(
            res.message || res.error || "Failed to create project",
          );
        }
      }
    } catch (err) {
      setErrorMessage(
        err.message || "An unexpected error occurred while saving project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Right Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col z-10 h-full border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Building className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {isEdit ? "Edit Real Estate Project" : "Create New Project"}
              </h2>
              <p className="text-xs text-slate-400">
                API Endpoint:{" "}
                <span className="font-mono text-primary">
                  POST /api/v1/projects
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEdit && (
              <button
                type="button"
                onClick={handleApplyPreset}
                title="Fill Skyline Pinnacle details provided"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Fill Preset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="m-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="m-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                1. Basic Project Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Pinnacle"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKPIN"
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) =>
                    handleInputChange("projectType", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-medium cursor-pointer"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed Development</option>
                  <option value="villa">Luxury Villas</option>
                  <option value="plotted">Plotted Land</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Construction Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-medium cursor-pointer"
                >
                  <option value="under_construction">Under Construction</option>
                  <option value="planning">Pre-Launch / Planning</option>
                  <option value="ready_to_move">Ready to Move</option>
                  <option value="completed">Completed & Handed Over</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  RERA Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. PRM/KA/RERA/1251/310/PR/230101/005500"
                  value={formData.reraNumber}
                  onChange={(e) =>
                    handleInputChange("reraNumber", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                2. Location & Geographic Coordinates
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24th Main, Sector 2, HSR Layout"
                  value={formData.location.address}
                  onChange={(e) =>
                    handleLocationChange("address", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={formData.location.state}
                  onChange={(e) =>
                    handleLocationChange("state", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 560102"
                  value={formData.location.pincode}
                  onChange={(e) =>
                    handleLocationChange("pincode", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="12.9121"
                    value={formData.location.latitude}
                    onChange={(e) =>
                      handleLocationChange("latitude", e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="77.6445"
                    value={formData.location.longitude}
                    onChange={(e) =>
                      handleLocationChange("longitude", e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Towers & Inventory Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                3. Towers & Inventory Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Towers Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalTowers}
                  onChange={(e) =>
                    handleInputChange("totalTowers", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Units
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalUnits}
                  onChange={(e) =>
                    handleInputChange("totalUnits", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tower Names / Wings ({formData.towers.length} active)
                </label>
                <div className="flex flex-wrap gap-2 mb-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[46px]">
                  {formData.towers.map((tower, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-2xs"
                    >
                      <span>{tower}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTower(tower)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tower name (e.g. Tower D, Wing 2)..."
                    value={newTowerName}
                    onChange={(e) => setNewTowerName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddTower())
                    }
                    className="flex-1 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddTower}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    + Add Wing
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                4. World-Class Amenities
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-sm shadow-orange-500/20"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Amenity Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add other custom amenity..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddCustomAmenity())
                }
                className="flex-1 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Section 5: Timeline & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                5. Schedule & Marketing Narrative
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  value={formData.expectedCompletionDate}
                  onChange={(e) =>
                    handleInputChange("expectedCompletionDate", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Luxury 2 & 3 BHK residences with world-class amenities..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Drawer Sticky Footer with Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving to /api/v1/projects...</span>
              </>
            ) : (
              <>
                <Building className="h-4 w-4" />
                <span>{isEdit ? "Update Project" : "Create Project"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
