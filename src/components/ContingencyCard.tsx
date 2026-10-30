"use client";

import React from "react";
import {
  ShieldAlert,
  CloudRain,
  Users,
  Zap,
  Volume2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { ContingencyItem } from "@/lib/types";

interface ContingencyCardProps {
  contingencies: ContingencyItem[];
}

export const ContingencyCard: React.FC<ContingencyCardProps> = ({
  contingencies,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
      <div className="pb-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            Contingency Protocols & Risk Guardrails
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-planned backups for Indian celebration pain points: rain, power, guest surges & sound curfews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {contingencies.map((c, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-amber-50/30 border border-amber-200/70 hover:bg-white transition-all space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {c.scenario}
              </h4>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="text-slate-500">
                <strong className="text-slate-700">Potential Impact:</strong>{" "}
                {c.impact}
              </div>
              <div className="text-emerald-900 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200">
                <strong className="text-emerald-800">Pre-Planned Solution:</strong>{" "}
                {c.solution}
              </div>
              <div className="text-slate-600 flex items-start gap-1.5 pt-1">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-700">Action Step:</strong>{" "}
                  {c.recommendedAction}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
