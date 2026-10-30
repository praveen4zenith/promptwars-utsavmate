"use client";

import React from "react";
import {
  HelpCircle,
  Building2,
  Utensils,
  Camera,
  Music,
  Sparkles,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";
import { VendorQuestionItem } from "@/lib/types";

interface VendorGuideProps {
  checklist: VendorQuestionItem[];
  onUpdateChecklist: (updated: VendorQuestionItem[]) => void;
}

const VENDOR_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  venue: <Building2 className="w-5 h-5 text-amber-600" />,
  catering: <Utensils className="w-5 h-5 text-rose-600" />,
  decoration: <Sparkles className="w-5 h-5 text-orange-600" />,
  photography: <Camera className="w-5 h-5 text-sky-600" />,
  entertainment: <Music className="w-5 h-5 text-purple-600" />,
};

export const VendorGuide: React.FC<VendorGuideProps> = ({
  checklist,
  onUpdateChecklist,
}) => {
  const handleStatusChange = (
    index: number,
    newStatus: "not_contacted" | "shortlisted" | "finalized"
  ) => {
    const updated = [...checklist];
    updated[index] = {
      ...updated[index],
      status: newStatus,
    };
    onUpdateChecklist(updated);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updated = [...checklist];
    updated[index] = {
      ...updated[index],
      notes,
    };
    onUpdateChecklist(updated);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
      <div className="pb-6 border-b border-slate-100">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-amber-600" />
          Indian Vendor Interview Guide & Checklists
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Crucial contract questions to ask venues, caterers, florists, and photo crews before booking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {checklist.map((item, index) => {
          const icon =
            VENDOR_CATEGORY_ICONS[item.category] || (
              <Sparkles className="w-5 h-5 text-amber-600" />
            );

          return (
            <div
              key={index}
              className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 hover:bg-white hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white shadow-2xs">
                      {icon}
                    </div>
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-amber-700">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        {item.vendorType}
                      </h4>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        index,
                        e.target.value as "not_contacted" | "shortlisted" | "finalized"
                      )
                    }
                    className={`text-2xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      item.status === "finalized"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : item.status === "shortlisted"
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-slate-100 border-slate-300 text-slate-600"
                    }`}
                  >
                    <option value="not_contacted">Not Contacted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="finalized">Contract Finalized</option>
                  </select>
                </div>

                {/* Questions Checklist */}
                <div className="space-y-2 my-3">
                  <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Must-Ask Questions:
                  </div>
                  {item.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="text-xs text-slate-700 flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-slate-100"
                    >
                      <span className="text-amber-600 font-bold">•</span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Notes Field */}
              <div className="mt-3 pt-3 border-t border-slate-200/60">
                <label className="block text-2xs font-semibold text-slate-500 mb-1">
                  Vendor Notes & Quotations:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quoted ₹3.2L for 350 plates; tasting scheduled Sunday"
                  value={item.notes || ""}
                  onChange={(e) => handleNotesChange(index, e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
