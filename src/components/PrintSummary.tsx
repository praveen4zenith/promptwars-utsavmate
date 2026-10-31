"use client";

import React from "react";
import {
  Printer,
  X,
  Flame,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  CheckCircle,
} from "lucide-react";
import { EventPlan } from "@/lib/types";
import {
  BUDGET_CATEGORIES,
  calculateBudgetMetrics,
  formatINR,
  formatINRShort,
} from "@/lib/budgetEngine";

interface PrintSummaryProps {
  plan: EventPlan;
  onClose: () => void;
}

export const PrintSummary: React.FC<PrintSummaryProps> = ({ plan, onClose }) => {
  const metrics = calculateBudgetMetrics(
    plan.eventDetails.totalBudget,
    plan.budgetAllocations
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-4 sm:p-6 flex justify-center">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 my-auto text-slate-800">
        {/* Floating print/close controls for screen view */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              Printable Event Brief
            </span>{" "}
            • Ready for venue coordinators, vendors, and family
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-500 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
                <Flame className="w-4 h-4" />
                UtsavMate AI • Executive Event Brief
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {plan.eventDetails.eventName}
              </h1>
              <p className="text-sm font-medium text-amber-900 mt-0.5">
                {plan.concept.tagline}
              </p>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Date Generated: {new Date(plan.createdAt).toLocaleDateString()}</div>
              <div className="font-semibold text-slate-700">
                Status: {plan.isDemoPlan ? "Demo Estimate" : "Active Event Plan"}
              </div>
            </div>
          </div>

          {/* Quick Details Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-2xs block">
                Celebrant / Host
              </span>
              <strong className="text-slate-900 font-bold">
                {plan.eventDetails.hostName || "N/A"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-2xs block">
                Location
              </span>
              <strong className="text-slate-900 font-bold">
                {plan.eventDetails.city}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-2xs block">
                Event Date
              </span>
              <strong className="text-slate-900 font-bold">
                {plan.eventDetails.date}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-2xs block">
                Guest Count
              </span>
              <strong className="text-slate-900 font-bold">
                {plan.eventDetails.guestCount} Attendees
              </strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-2xs block">
                Total Budget
              </span>
              <strong className="text-slate-900 font-bold text-amber-900">
                {formatINR(plan.eventDetails.totalBudget)}
              </strong>
            </div>
          </div>

          {/* Concept & Aesthetic */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1.5">
              Theme & Aesthetic Concept
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {plan.concept.themeDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-2xs font-semibold text-slate-500">
                Palette:
              </span>
              {plan.concept.colorPalette.map((col, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium border border-slate-200 bg-white"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: col.hex }}
                  />
                  {col.name}
                </span>
              ))}
            </div>
          </div>

          {/* Budget Breakdown Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Deterministic Budget Breakdown (INR)
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-right">Allocation</th>
                  <th className="p-2.5 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {BUDGET_CATEGORIES.map((cat) => {
                  const amount = plan.budgetAllocations[cat.key];
                  const pct = metrics.categoryPercentages[cat.key];
                  return (
                    <tr key={cat.key}>
                      <td className="p-2.5 font-bold text-slate-900">
                        {cat.label}
                      </td>
                      <td className="p-2.5 text-slate-500">{cat.description}</td>
                      <td className="p-2.5 text-right font-semibold">
                        {formatINR(amount)}
                      </td>
                      <td className="p-2.5 text-right text-slate-600 font-medium">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-amber-50 font-bold border-t-2 border-slate-300">
                <tr>
                  <td className="p-2.5" colSpan={2}>
                    Total Allocated ({metrics.statusText})
                  </td>
                  <td className="p-2.5 text-right text-amber-950 font-black">
                    {formatINR(metrics.allocatedTotal)}
                  </td>
                  <td className="p-2.5 text-right font-black">
                    {metrics.percentAllocated}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Day-of Schedule */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Day-of Auspicious Schedule & Run Sheet
            </h3>
            <div className="space-y-1.5 text-xs">
              {plan.dayOfSchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-800 shrink-0 w-32">
                      {item.time}
                    </span>
                    <div>
                      <strong className="text-slate-900">{item.activity}</strong>
                      {item.description && (
                        <span className="text-slate-500 ml-1">
                          — {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-2xs font-medium text-slate-500 shrink-0 ml-2">
                    Resp: {item.responsiblePerson}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contingency Protocols */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
              Contingency & Emergency Protocols
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
              {plan.contingencyPlans.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <strong className="text-rose-700 block mb-0.5">
                    Scenario: {c.scenario}
                  </strong>
                  <div className="text-slate-700 font-medium">
                    Solution: {c.solution}
                  </div>
                  <div className="text-slate-500 mt-1">
                    Action: {c.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-400">
            <span>UtsavMate AI • Generated for PromptWars Challenge 05</span>
            <span>Sample costs are non-binding planning estimates.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
