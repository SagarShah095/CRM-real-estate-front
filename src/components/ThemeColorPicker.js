"use client";

import { useState } from "react";
import { Palette, Check, RefreshCw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const PRESET_THEMES = [
  {
    name: "Light Orange (Default)",
    color: "#f97316",
    shades: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
  },
  {
    name: "Warm Amber",
    color: "#d97706",
    shades: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
  },
  {
    name: "Coral Sunset",
    color: "#f43f5e",
    shades: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
    },
  },
  {
    name: "Emerald Estate",
    color: "#10b981",
    shades: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
  },
  {
    name: "Royal Blue",
    color: "#3b82f6",
    shades: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
  },
];

export default function ThemeColorPicker() {
  const [activeTheme, setActiveTheme] = useState(PRESET_THEMES[0].name);
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = (theme) => {
    setActiveTheme(theme.name);
    const root = document.documentElement;
    
    // Dynamically update CSS custom properties on :root
    Object.entries(theme.shades).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-primary-${shade}`, hex);
    });
  };

  const resetTheme = () => {
    applyTheme(PRESET_THEMES[0]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Expanded Control Box */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl bg-white p-5 shadow-2xl border border-brand-200 glass-surface animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Theme Color Engine</h4>
                <p className="text-[11px] text-brand-muted">Changes 100% of web colors live</p>
              </div>
            </div>
            <button
              onClick={resetTheme}
              title="Reset to default light orange"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-3 font-medium">
            Select Theme Color Preset:
          </p>

          <div className="space-y-2">
            {PRESET_THEMES.map((theme) => {
              const isSelected = activeTheme === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-900 shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span>{theme.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 bg-brand-50/60 rounded-xl p-3 text-[11px] text-brand-800 leading-relaxed">
            <span className="font-semibold flex items-center gap-1 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" /> CSS & Tailwind Setup:
            </span>
            All colors drive off <code className="bg-white/80 px-1 py-0.5 rounded font-mono border text-[10px]">globals.css</code> custom variables and <code className="bg-white/80 px-1 py-0.5 rounded font-mono border text-[10px]">@theme</code> tokens processed by PostCSS.
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-brand-orange hover:bg-brand-600 active:bg-brand-700 transition-all transform hover:scale-105"
      >
        <Palette className="h-4 w-4 animate-spin-slow" />
        <span>Customize Theme</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  );
}
