"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Flame,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Layers,
  CheckSquare,
  Clock,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Printer,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  EventPlan,
  EventFormData,
  BudgetAllocations,
  TaskItem,
  DayOfScheduleItem,
  VendorQuestionItem,
  BudgetCategoryKey,
} from "@/lib/types";
import { DEMO_PRESET_WEDDING, DEMO_PRESETS } from "@/lib/presets";
import {
  loadPlanFromLocalStorage,
  savePlanToLocalStorage,
  clearPlanFromLocalStorage,
} from "@/lib/storage";
import {
  formatINR,
  formatINRShort,
  calculateBudgetMetrics,
} from "@/lib/budgetEngine";

import { Navbar } from "@/components/Navbar";
import { EventForm } from "@/components/EventForm";
import { BudgetDashboard } from "@/components/BudgetDashboard";
import { SavingsTipsModal } from "@/components/SavingsTipsModal";
import { TaskList } from "@/components/TaskList";
import { TimelineView } from "@/components/TimelineView";
import { VendorGuide } from "@/components/VendorGuide";
import { ContingencyCard } from "@/components/ContingencyCard";
import { PrintSummary } from "@/components/PrintSummary";

export default function Home() {
  const [currentPlan, setCurrentPlan] = useState<EventPlan | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "budget" | "timeline" | "tasks" | "vendors" | "contingency"
  >("overview");

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load plan from localStorage on initial client mount
  useEffect(() => {
    const saved = loadPlanFromLocalStorage();
    if (saved) {
      setCurrentPlan(saved);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever plan changes
  useEffect(() => {
    if (isLoaded && currentPlan) {
      savePlanToLocalStorage(currentPlan);
    }
  }, [currentPlan, isLoaded]);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleGeneratePlan = async (formData: EventFormData) => {
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setCurrentPlan(data.plan);
      setIsEditingForm(false);
      setActiveTab("overview");

      setNotification({
        type: "success",
        text: data.message || "Celebration plan generated successfully!",
      });
    } catch (err: any) {
      console.error("Generate plan error:", err);
      setNotification({
        type: "error",
        text: err?.message || "Failed to generate plan. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: EventPlan) => {
    setCurrentPlan(preset);
    setIsEditingForm(false);
    setActiveTab("overview");
    setNotification({
      type: "info",
      text: `Loaded preset: ${preset.eventDetails.eventName}`,
    });
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to start a new event? Your current plan will be reset."
      )
    ) {
      clearPlanFromLocalStorage();
      setCurrentPlan(null);
      setIsEditingForm(false);
      setNotification({
        type: "info",
        text: "Plan reset. Ready for your next celebration!",
      });
    }
  };

  const handleUpdateAllocations = (newAllocations: BudgetAllocations) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      budgetAllocations: newAllocations,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleApplySavings = (
    category: BudgetCategoryKey,
    reductionINR: number
  ) => {
    if (!currentPlan) return;
    const currentVal = currentPlan.budgetAllocations[category] || 0;
    const nextVal = Math.max(0, currentVal - reductionINR);

    const updatedAllocations = {
      ...currentPlan.budgetAllocations,
      [category]: nextVal,
    };

    setCurrentPlan({
      ...currentPlan,
      budgetAllocations: updatedAllocations,
      lastUpdated: new Date().toISOString(),
    });

    setNotification({
      type: "success",
      text: `Adjusted ${category} allocation: -${formatINR(reductionINR)}.`,
    });
  };

  const handleUpdateTasks = (newTasks: TaskItem[]) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      tasks: newTasks,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleUpdateSchedule = (newSchedule: DayOfScheduleItem[]) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      dayOfSchedule: newSchedule,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleUpdateChecklist = (newChecklist: VendorQuestionItem[]) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      vendorChecklist: newChecklist,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Deterministic metrics for active plan
  const activeMetrics = currentPlan
    ? calculateBudgetMetrics(
        currentPlan.eventDetails.totalBudget,
        currentPlan.budgetAllocations
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Top Navigation */}
      <Navbar
        currentPlan={currentPlan}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onPrint={() => setIsPrintOpen(true)}
        onImportPlan={(imported) => {
          setCurrentPlan(imported);
          setNotification({
            type: "success",
            text: "Event plan imported successfully!",
          });
        }}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300 no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold ${
              notification.type === "success"
                ? "bg-emerald-900 text-white border-emerald-700"
                : notification.type === "error"
                ? "bg-rose-900 text-white border-rose-700"
                : "bg-slate-900 text-white border-slate-700"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : notification.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* If no plan is active or user wants to edit form */}
        {!currentPlan || isEditingForm ? (
          <div className="space-y-8">
            {/* Hero Banner when starting fresh */}
            {!currentPlan && (
              <div className="text-center py-6 sm:py-10 max-w-3xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>PromptWars Virtual Challenge 05 • Full-Stack App</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Auspicious Celebrations,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">
                    Masterfully Planned
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  Tailored specifically for Indian weddings, milestone birthdays, and community festivals.
                  Realistic INR budget calculations, preparation roadmaps, vendor interview checklists, and hour-by-hour day-of itineraries.
                </p>

                {/* Quick 3 Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1">
                      <IndianRupee className="w-4 h-4 text-amber-600" />
                      Deterministic Math
                    </div>
                    <p className="text-2xs text-slate-500">
                      Calculations executed in deterministic TypeScript — never trusted to AI arithmetic.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1">
                      <Clock className="w-4 h-4 text-rose-600" />
                      Day-of Run Sheet
                    </div>
                    <p className="text-2xs text-slate-500">
                      Vedic rituals, Baraat processions, cake cuttings, and coordinator assignments.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1">
                      <Printer className="w-4 h-4 text-sky-600" />
                      Export & Local Save
                    </div>
                    <p className="text-2xs text-slate-500">
                      Auto-saved to localStorage with a clean, print-ready executive brief for vendors.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Input Form */}
            <EventForm
              onSubmit={handleGeneratePlan}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
              initialData={currentPlan?.eventDetails}
            />

            {/* If editing existing, allow cancel */}
            {isEditingForm && currentPlan && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel Editing & Return to Plan
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Active Event Plan Dashboard */
          <div className="space-y-6">
            {/* Event Header Banner */}
            <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-rose-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider backdrop-blur-md">
                      {currentPlan.eventDetails.eventType.toUpperCase()}
                    </span>
                    {currentPlan.isDemoPlan && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-400/30 text-amber-100 border border-amber-300/40">
                        Demo Mode (Sample Estimates)
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                    {currentPlan.eventDetails.eventName}
                  </h1>
                  <p className="text-amber-100 text-sm mt-1 max-w-2xl font-medium">
                    {currentPlan.concept.tagline}
                  </p>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-amber-200/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-300" />
                      {currentPlan.eventDetails.city}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-300" />
                      {currentPlan.eventDetails.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-300" />
                      {currentPlan.eventDetails.guestCount} Guests
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-amber-300" />
                      {formatINR(currentPlan.eventDetails.totalBudget)} Total Budget
                    </span>
                  </div>
                </div>

                {/* Edit & Print Quick Buttons */}
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingForm(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white text-slate-900 hover:bg-amber-50 shadow-md transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-700" />
                    Print Summary
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 overflow-x-auto no-print">
              <div className="flex items-center gap-1 min-w-max">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "overview"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Overview & Theme
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("budget")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "budget"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  Budget Dashboard
                  {activeMetrics?.isOverrun && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("timeline")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "timeline"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Day-of Itinerary & Milestones
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "tasks"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Task Checklist ({currentPlan.tasks.filter((t) => t.completed).length}/{currentPlan.tasks.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("vendors")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "vendors"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Vendor Guide
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("contingency")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === "contingency"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Contingency Protocols
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}

            {/* 1. Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Theme & Concept Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Celebration Concept & Aesthetic Vision
                    </h3>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed mt-4">
                    {currentPlan.concept.themeDescription}
                  </p>

                  {/* Color Palette */}
                  <div className="mt-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Festive Color Palette
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {currentPlan.concept.colorPalette.map((cp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: cp.hex }}
                          />
                          <span className="text-xs font-semibold text-slate-800">
                            {cp.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div className="mt-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Signature Highlights
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentPlan.concept.keyHighlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-xs text-slate-800"
                        >
                          <span className="text-amber-600 font-bold text-sm">
                            ✦
                          </span>
                          <span className="font-medium leading-relaxed">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Budget & Task Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget Snapshot */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <IndianRupee className="w-4 h-4 text-amber-600" />
                          Budget Allocation Summary
                        </h4>
                        <button
                          type="button"
                          onClick={() => setActiveTab("budget")}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                          Adjust <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Total Planned:</span>
                          <strong className="text-slate-900 font-bold">
                            {formatINR(currentPlan.eventDetails.totalBudget)}
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Allocated Sum:</span>
                          <strong className="text-slate-900 font-bold">
                            {formatINR(activeMetrics?.allocatedTotal || 0)} (
                            {activeMetrics?.percentAllocated}%)
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Status:</span>
                          <span
                            className={`font-bold ${
                              activeMetrics?.isOverrun
                                ? "text-rose-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {activeMetrics?.statusText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSavingsModalOpen(true)}
                      className="mt-6 w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <TrendingDown className="w-4 h-4 text-amber-700" />
                      View AI Savings Opportunities
                    </button>
                  </div>

                  {/* Tasks & Itinerary Snapshot */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-amber-600" />
                          Preparation Readiness
                        </h4>
                        <button
                          type="button"
                          onClick={() => setActiveTab("tasks")}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                          All Tasks <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Task Completion:</span>
                          <span className="font-bold text-slate-900">
                            {currentPlan.tasks.filter((t) => t.completed).length} /{" "}
                            {currentPlan.tasks.length} Done
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${
                                currentPlan.tasks.length > 0
                                  ? (currentPlan.tasks.filter((t) => t.completed)
                                      .length /
                                      currentPlan.tasks.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>

                        <div className="text-2xs text-slate-500 pt-1">
                          Next milestone:{" "}
                          <strong className="text-slate-800">
                            {currentPlan.tasks.find((t) => !t.completed)?.title ||
                              "All tasks completed!"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("timeline")}
                      className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Explore Hour-by-Hour Run Sheet ({currentPlan.dayOfSchedule.length} slots)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Budget Tab */}
            {activeTab === "budget" && (
              <BudgetDashboard
                totalBudget={currentPlan.eventDetails.totalBudget}
                allocations={currentPlan.budgetAllocations}
                eventType={currentPlan.eventDetails.eventType}
                onChangeAllocations={handleUpdateAllocations}
                onChangeTotalBudget={(newTotal) => {
                  setCurrentPlan({
                    ...currentPlan,
                    eventDetails: {
                      ...currentPlan.eventDetails,
                      totalBudget: newTotal,
                    },
                    lastUpdated: new Date().toISOString(),
                  });
                }}
                onOpenSavingsTips={() => setIsSavingsModalOpen(true)}
              />
            )}

            {/* 3. Timeline Tab */}
            {activeTab === "timeline" && (
              <TimelineView
                milestones={currentPlan.preparationMilestones}
                dayOfSchedule={currentPlan.dayOfSchedule}
                onUpdateSchedule={handleUpdateSchedule}
              />
            )}

            {/* 4. Tasks Tab */}
            {activeTab === "tasks" && (
              <TaskList
                tasks={currentPlan.tasks}
                onUpdateTasks={handleUpdateTasks}
              />
            )}

            {/* 5. Vendors Tab */}
            {activeTab === "vendors" && (
              <VendorGuide
                checklist={currentPlan.vendorChecklist}
                onUpdateChecklist={handleUpdateChecklist}
              />
            )}

            {/* 6. Contingency Tab */}
            {activeTab === "contingency" && (
              <ContingencyCard
                contingencies={currentPlan.contingencyPlans}
              />
            )}
          </div>
        )}
      </main>

      {/* Savings Tips Modal */}
      {currentPlan && (
        <SavingsTipsModal
          isOpen={isSavingsModalOpen}
          onClose={() => setIsSavingsModalOpen(false)}
          totalBudget={currentPlan.eventDetails.totalBudget}
          allocations={currentPlan.budgetAllocations}
          eventType={currentPlan.eventDetails.eventType}
          onApplySavings={handleApplySavings}
        />
      )}

      {/* Print Summary View */}
      {currentPlan && isPrintOpen && (
        <PrintSummary
          plan={currentPlan}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-amber-200/70 bg-white/70 text-slate-500 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-800">UtsavMate AI</span>
            <span>• Built for PromptWars Challenge 05</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            <span>Deterministic TypeScript Math • Server-side Gemini API • Vercel Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
