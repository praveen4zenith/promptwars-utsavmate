"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import {
  BudgetAllocations,
  BudgetCategoryKey,
  EventType,
  SavingsSuggestion,
} from "@/lib/types";
import { formatINR } from "@/lib/budgetEngine";

interface SavingsTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalBudget: number;
  allocations: BudgetAllocations;
  eventType: EventType;
  onApplySavings: (category: BudgetCategoryKey, reductionINR: number) => void;
}

export const SavingsTipsModal: React.FC<SavingsTipsModalProps> = ({
  isOpen,
  onClose,
  totalBudget,
  allocations,
  eventType,
  onApplySavings,
}) => {
  const [tips, setTips] = useState<SavingsSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedIndices, setAppliedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setAppliedIndices([]);
      return;
    }

    const fetchTips = async () => {
      setIsLoading(true);
      try {
        const resp = await fetch("/api/savings-tips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalBudget,
            allocations,
            eventType,
          }),
        });
        const data = await resp.json();
        if (data.tips && Array.isArray(data.tips)) {
          setTips(data.tips);
        }
      } catch (err) {
        console.error("Failed to fetch savings tips:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, [isOpen, totalBudget, allocations, eventType]);

  if (!isOpen) return null;

  const handleApply = (idx: number, tip: SavingsSuggestion) => {
    if (appliedIndices.includes(idx)) return;
    onApplySavings(tip.category, tip.potentialSavingsINR);
    setAppliedIndices((prev) => [...prev, idx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-rose-700 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Smart Indian Celebration Savings
              </h3>
              <p className="text-xs text-amber-100">
                Actionable cost-cutting without sacrificing hospitality or rituals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Analyzing category allocations and generating savings hacks...
              </p>
            </div>
          ) : tips.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Lightbulb className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-60" />
              <p className="text-sm font-semibold">Your budget is already well-balanced!</p>
              <p className="text-xs mt-1">No significant inflated categories detected.</p>
            </div>
          ) : (
            tips.map((tip, idx) => {
              const isApplied = appliedIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isApplied
                      ? "bg-emerald-50/70 border-emerald-300"
                      : "bg-slate-50/80 border-slate-200 hover:border-amber-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {tip.category.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {tip.title}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                        Save ~{formatINR(tip.potentialSavingsINR)}
                      </div>
                      <span className="text-2xs text-slate-400 mt-0.5 block">
                        Impact: {tip.impact}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tip.tip}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end">
                    {isApplied ? (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Allocations Adjusted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(idx, tip)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs"
                      >
                        Apply -{formatINR(tip.potentialSavingsINR)} to {tip.category}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Deterministic adjustments applied directly to your budget</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
