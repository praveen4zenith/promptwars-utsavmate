"use client";

import React, { useMemo } from "react";
import {
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Info,
  Building2,
  Utensils,
  Camera,
  Music,
  Gift,
  ShieldAlert,
} from "lucide-react";
import {
  BudgetAllocations,
  BudgetCategoryKey,
  EventType,
} from "@/lib/types";
import {
  BUDGET_CATEGORIES,
  calculateBudgetMetrics,
  formatINR,
  formatINRShort,
  getRecommendedAllocations,
  sanitizeCurrencyInput,
} from "@/lib/budgetEngine";

interface BudgetDashboardProps {
  totalBudget: number;
  allocations: BudgetAllocations;
  eventType: EventType;
  onChangeAllocations: (newAllocations: BudgetAllocations) => void;
  onChangeTotalBudget: (newBudget: number) => void;
  onOpenSavingsTips: () => void;
}

const CATEGORY_ICONS: Record<BudgetCategoryKey, React.ReactNode> = {
  venue: <Building2 className="w-5 h-5 text-amber-600" />,
  catering: <Utensils className="w-5 h-5 text-rose-600" />,
  decoration: <Sparkles className="w-5 h-5 text-orange-600" />,
  photography: <Camera className="w-5 h-5 text-sky-600" />,
  entertainment: <Music className="w-5 h-5 text-purple-600" />,
  miscellaneous: <Gift className="w-5 h-5 text-emerald-600" />,
  contingency: <ShieldAlert className="w-5 h-5 text-slate-600" />,
};

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  totalBudget,
  allocations,
  eventType,
  onChangeAllocations,
  onChangeTotalBudget,
  onOpenSavingsTips,
}) => {
  // Deterministic metrics calculated immediately
  const metrics = useMemo(
    () => calculateBudgetMetrics(totalBudget, allocations),
    [totalBudget, allocations]
  );

  const handleCategoryChange = (key: BudgetCategoryKey, val: number) => {
    const safeVal = Math.max(0, sanitizeCurrencyInput(val));
    onChangeAllocations({
      ...allocations,
      [key]: safeVal,
    });
  };

  const handleResetToRecommended = () => {
    const recommended = getRecommendedAllocations(totalBudget, eventType);
    onChangeAllocations(recommended);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Metrics & Overrun Warning */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <IndianRupee className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Deterministic Budget Command Center
                </h3>
                <p className="text-xs text-slate-500">
                  Live verified arithmetic in TypeScript • Never trusted to generative AI
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetToRecommended}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset to AI Recommended Split
            </button>
            <button
              type="button"
              onClick={onOpenSavingsTips}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              💡 AI Savings Suggestions
            </button>
          </div>
        </div>

        {/* Disclaimer Notice Banner */}
        <div className="my-4 px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start sm:items-center gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold">Important Notice:</strong> Sample
            costs are calibrated planning estimates based on Indian city market
            averages, not binding live vendor quotes. Actual quotes vary by
            season and vendor tier.
          </p>
        </div>

        {/* Budget Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Total Planned Budget */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Total Budget
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {formatINR(metrics.totalBudget)}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {formatINRShort(metrics.totalBudget)}
              </span>
            </div>
            <div className="mt-2 text-2xs text-slate-400">
              Target spending ceiling for the entire celebration
            </div>
          </div>

          {/* Allocated Total */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Allocated Sum (7 Categories)
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-black ${
                  metrics.isOverrun ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {formatINR(metrics.allocatedTotal)}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {metrics.percentAllocated}%
              </span>
            </div>
            <div className="mt-2 text-2xs text-slate-400">
              Sum of Venue + Food + Decor + Photo + Sound + Misc + Contingency
            </div>
          </div>

          {/* Remaining Balance or Overrun */}
          <div
            className={`p-4 rounded-2xl border ${
              metrics.isOverrun
                ? "bg-rose-50 border-rose-300 text-rose-950"
                : metrics.isBalanced
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-amber-50 border-amber-300 text-amber-950"
            }`}
          >
            <div className="text-xs font-medium uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{metrics.isOverrun ? "Deficit Overrun" : "Remaining Buffer"}</span>
              {metrics.isOverrun ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="text-2xl font-black">
              {metrics.isOverrun
                ? `-${formatINR(metrics.overrunAmount)}`
                : formatINR(metrics.remainingBalance)}
            </div>
            <div className="mt-2 text-2xs font-semibold">
              {metrics.statusText}
            </div>
          </div>
        </div>

        {/* Overrun Alert Box */}
        {metrics.isOverrun && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <div className="font-bold text-sm">
                  Budget Overrun Alert: You have exceeded your ceiling by{" "}
                  {formatINR(metrics.overrunAmount)}!
                </div>
                <div className="text-xs text-rose-100">
                  Reduce allocations in high-weight categories or tap AI Savings
                  Suggestions to rebalance without compromising guest experience.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSavingsTips}
              className="px-3 py-1.5 bg-white text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-50 shrink-0 self-start sm:self-auto"
            >
              Get Savings Fix
            </button>
          </div>
        )}

        {/* Visual Allocation Breakdown Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Visual Category Allocation</span>
            <span>{metrics.percentAllocated}% of Budget Assigned</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {BUDGET_CATEGORIES.map((cat) => {
              const pct = metrics.categoryPercentages[cat.key] || 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={cat.key}
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: cat.color,
                  }}
                  className="h-full transition-all relative group"
                  title={`${cat.label}: ${pct}% (${formatINR(allocations[cat.key])})`}
                />
              );
            })}
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
            {BUDGET_CATEGORIES.map((cat) => {
              const amount = allocations[cat.key];
              const pct = metrics.categoryPercentages[cat.key];
              return (
                <div key={cat.key} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-700">{cat.label}:</span>
                  <span className="text-slate-500 font-semibold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Adjustment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BUDGET_CATEGORIES.map((cat) => {
          const amount = allocations[cat.key] || 0;
          const pct = metrics.categoryPercentages[cat.key] || 0;
          const recommendedPct = cat.recommendedPercent[eventType] || 10;
          const recommendedAmount = Math.round((totalBudget * recommendedPct) / 100);

          return (
            <div
              key={cat.key}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100">
                    {CATEGORY_ICONS[cat.key]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {cat.label}
                      <span className="text-2xs text-slate-400 font-normal">
                        ({cat.hindiLabel})
                      </span>
                    </h4>
                    <p className="text-2xs text-slate-500 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Amount Input & Recommended Comparison */}
              <div className="mt-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={amount}
                    onChange={(e) =>
                      handleCategoryChange(cat.key, Number(e.target.value))
                    }
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleCategoryChange(cat.key, recommendedAmount)}
                  title={`Reset to recommended ${recommendedPct}% (${formatINR(recommendedAmount)})`}
                  className="px-2.5 py-1.5 text-2xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                >
                  Rec: {recommendedPct}%
                </button>
              </div>

              {/* Slider for quick adjustments */}
              <div className="mt-3">
                <input
                  type="range"
                  min="0"
                  max={Math.max(totalBudget, amount * 1.5)}
                  step={Math.max(1000, Math.round(totalBudget / 200))}
                  value={amount}
                  onChange={(e) =>
                    handleCategoryChange(cat.key, Number(e.target.value))
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Quick adjustment delta pills */}
              <div className="flex items-center justify-between text-2xs text-slate-400 mt-1">
                <span>{formatINRShort(0)}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange(cat.key, Math.max(0, amount - 10000))
                    }
                    className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-200 text-slate-600"
                  >
                    -10k
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange(cat.key, amount + 10000)
                    }
                    className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-200 text-slate-600"
                  >
                    +10k
                  </button>
                </div>
                <span>{formatINRShort(Math.max(totalBudget, amount * 1.5))}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
