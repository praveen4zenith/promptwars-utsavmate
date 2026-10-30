"use client";

import React, { useRef } from "react";
import {
  Sparkles,
  Printer,
  Download,
  Upload,
  RotateCcw,
  Calendar,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { EventPlan } from "@/lib/types";
import { DEMO_PRESETS } from "@/lib/presets";
import { exportPlanToJsonFile } from "@/lib/storage";

interface NavbarProps {
  currentPlan: EventPlan | null;
  onSelectPreset: (preset: EventPlan) => void;
  onReset: () => void;
  onPrint: () => void;
  onImportPlan: (plan: EventPlan) => void;
  isAiConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPlan,
  onSelectPreset,
  onReset,
  onPrint,
  onImportPlan,
  isAiConnected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.eventDetails && parsed.budgetAllocations) {
          onImportPlan(parsed);
        } else {
          alert("Invalid UtsavMate plan file format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Utsav<span className="text-amber-600">Mate</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  AI उत्सव
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Indian Celebration & Event Planner • Shubh Aarambh
              </p>
            </div>
          </div>

          {/* Quick Preset Selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Presets Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Load Demo:</span>
                <span className="font-semibold">Presets</span>
              </button>

              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-amber-100 py-2 hidden group-hover:block transition-all z-50">
                <div className="px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  Instant Demo Presets
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPreset(DEMO_PRESETS.wedding)}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-amber-50 flex items-center gap-2.5 text-slate-700 hover:text-amber-900"
                >
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-medium">Royal Jaipur Wedding</div>
                    <div className="text-2xs text-slate-400">350 Guests • ₹35 Lakhs</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPreset(DEMO_PRESETS.birthday)}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-amber-50 flex items-center gap-2.5 text-slate-700 hover:text-amber-900"
                >
                  <span className="text-base">🎂</span>
                  <div>
                    <div className="font-medium">1st Birthday & Annaprashan</div>
                    <div className="text-2xs text-slate-400">80 Guests • ₹2.5 Lakhs</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPreset(DEMO_PRESETS.community)}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-amber-50 flex items-center gap-2.5 text-slate-700 hover:text-amber-900"
                >
                  <span className="text-base">🪔</span>
                  <div>
                    <div className="font-medium">Diwali Milan Utsav</div>
                    <div className="text-2xs text-slate-400">200 Guests • ₹6 Lakhs</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Print / Export Brief */}
            {currentPlan && (
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
                title="Print or Save as PDF"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Print Brief</span>
              </button>
            )}

            {/* Backup JSON Export */}
            {currentPlan && (
              <button
                type="button"
                onClick={() => exportPlanToJsonFile(currentPlan)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
                title="Download JSON Backup"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span className="hidden md:inline">Export</span>
              </button>
            )}

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 border border-transparent transition-colors"
              title="Import JSON Plan"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Import</span>
            </button>

            {/* Reset / New Plan */}
            {currentPlan && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                title="Start a fresh plan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
