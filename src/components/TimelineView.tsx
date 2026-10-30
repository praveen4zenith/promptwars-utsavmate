"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Milestone,
  UserCheck,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { DayOfScheduleItem } from "@/lib/types";

interface TimelineViewProps {
  milestones: {
    phase: string;
    description: string;
    milestoneTimeframe: string;
  }[];
  dayOfSchedule: DayOfScheduleItem[];
  onUpdateSchedule: (schedule: DayOfScheduleItem[]) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  dayOfSchedule,
  onUpdateSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<"milestones" | "dayOf">("dayOf");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPerson, setNewPerson] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.trim()) return;

    const newItem: DayOfScheduleItem = {
      id: `sched-${Date.now()}`,
      time: newTime.trim() || "TBD",
      activity: newActivity.trim(),
      description: newDesc.trim(),
      responsiblePerson: newPerson.trim() || "Host Coordinator",
    };

    onUpdateSchedule([...dayOfSchedule, newItem]);
    setNewTime("");
    setNewActivity("");
    setNewDesc("");
    setNewPerson("");
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateSchedule(dayOfSchedule.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
      {/* Header and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" />
            Timelines & Schedules
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Preparation milestones roadmap & hour-by-hour celebration itinerary
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("dayOf")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "dayOf"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Day-of Schedule ({dayOfSchedule.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "milestones"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Preparation Milestones ({milestones.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Day-of Schedule */}
      {activeTab === "dayOf" && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hour-by-Hour Auspicious Itinerary
            </span>
            <button
              type="button"
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingItem ? "Cancel" : "Add Program Item"}
            </button>
          </div>

          {/* Add Item Drawer */}
          {isAddingItem && (
            <form
              onSubmit={handleAddItem}
              className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200"
            >
              <div>
                <label className="block text-2xs font-semibold uppercase text-slate-600 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 05:00 PM - 06:30 PM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-2xs font-semibold uppercase text-slate-600 mb-1">
                  Program / Ritual Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Baraat Procession"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-2xs font-semibold uppercase text-slate-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Welcome at haveli gates with rose water and dhol"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-2xs font-semibold uppercase text-slate-600 mb-1">
                  Point Person / Coordinator
                </label>
                <input
                  type="text"
                  placeholder="e.g. Groom's Brother / Emcee"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          )}

          {/* Schedule Timeline List */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-300 space-y-6 my-4">
            {dayOfSchedule.map((item, index) => (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-amber-500/30">
                  {index + 1}
                </div>

                <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-amber-300 transition-all flex items-start justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-2xs font-bold bg-amber-100 text-amber-900 mb-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">
                      {item.activity}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-2.5 text-2xs text-slate-500 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      Responsible: <span className="font-semibold text-slate-700">{item.responsiblePerson}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition-colors shrink-0"
                    title="Remove from schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Preparation Milestones Roadmap */}
      {activeTab === "milestones" && (
        <div className="mt-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Preparation Roadmap from Kickoff to Celebration Day
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {milestones.map((ms, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200/60 hover:bg-white transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {ms.phase}
                    </h4>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {ms.milestoneTimeframe}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ms.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
