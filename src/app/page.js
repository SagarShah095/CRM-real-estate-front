"use client";

import { useState } from "react";
import Link from "next/link";
import LoginPage from "@/components/LoginPage";
import ForgotPasswordPage from "@/components/ForgotPasswordPage";
import ResetPasswordPage from "@/components/ResetPasswordPage";
import ThemeColorPicker from "@/components/ThemeColorPicker";
import {
  Building2,
  LogIn,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
  Palette,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text flex flex-col justify-between selection:bg-brand-500 selection:text-white relative">
      {/* TOP BRANDING & TAB SWITCHER BAR */}

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 px-4">
        {activeTab === "login" && (
          <LoginPage onSwitchToForgot={() => setActiveTab("forgot")} />
        )}

        {activeTab === "forgot" && (
          <ForgotPasswordPage
            onSwitchToLogin={() => setActiveTab("login")}
            onSwitchToReset={() => setActiveTab("reset")}
          />
        )}

        {activeTab === "reset" && (
          <ResetPasswordPage onSwitchToLogin={() => setActiveTab("login")} />
        )}
      </main>

      {/* FOOTER BAR WITH THEME CUSTOMIZATION INFO */}
      <footer className="w-full bg-white border-t border-brand-100 py-4 px-6 text-center text-xs text-brand-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-brand-600" />
            <span>
              <strong>Centralized Color System:</strong> Edit{" "}
              <code className="bg-brand-50 text-brand-900 px-1.5 py-0.5 rounded font-mono border border-brand-200">
                globals.css
              </code>{" "}
              variables once to re-theme the entire website!
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} Shiv Pooja Residency CRM Portal. All
            rights reserved.
          </div>
        </div>
      </footer>

      {/* FLOATING THEME CONTROL ENGINE */}
      <ThemeColorPicker />
    </div>
  );
}
