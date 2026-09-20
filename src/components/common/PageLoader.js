"use client";

import { Layers, Loader2 } from "lucide-react";

export default function PageLoader({ text = "Loading NexaCRM..." }) {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
          <Layers className="h-8 w-8 text-amber-500 stroke-[2.5] animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-md">
          <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
          {text}
        </p>
        <p className="text-[11px] font-semibold text-slate-400">
          Please wait while we prepare your dashboard
        </p>
      </div>
    </div>
  );
}
