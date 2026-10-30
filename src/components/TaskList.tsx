"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2,
  Sparkles,
  Filter,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TaskItem, TaskPriority, TaskPhase } from "@/lib/types";

interface TaskListProps {
  tasks: TaskItem[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
}

const PHASE_LABELS: Record<TaskPhase, string> = {
  "6_months": "6 Months Out",
  "3_months": "3 Months Out",
  "1_month": "1 Month Out",
  "1_week": "1 Week Out",
  event_day: "Event Day",
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTasks }) => {
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("Medium");
  const [newTaskPhase, setNewTaskPhase] = useState<TaskPhase>("1_month");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          // Check if this makes it 100% completed or celebrate
          const willBeCompleted = completedCount + 1;
          if (willBeCompleted === totalCount && totalCount > 0) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: "general",
      timelinePhase: newTaskPhase,
      priority: newTaskPriority,
      dueDate: newTaskDate || undefined,
      completed: false,
      notes: newTaskNotes.trim() || undefined,
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskNotes("");
    setIsAdding(false);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterPhase !== "all" && t.timelinePhase !== filterPhase) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus === "pending" && t.completed) return false;
    if (filterStatus === "completed" && !t.completed) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-600" />
            Preparation Task Checklist
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage deadlines, vendors, and ritual preparations step by step
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? "Cancel" : "Add Custom Task"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="my-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
        <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
          <span>Overall Preparation Readiness</span>
          <span>
            {completedCount} of {totalCount} completed ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-3 bg-amber-200/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Add Task Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200"
        >
          <div className="font-bold text-sm text-slate-800">New Event Task</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Task title (e.g., Order wedding garland & Varmala roses)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-2xs font-semibold uppercase text-slate-500 mb-1">
                Timeline Phase
              </label>
              <select
                value={newTaskPhase}
                onChange={(e) => setNewTaskPhase(e.target.value as TaskPhase)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="6_months">6 Months Out</option>
                <option value="3_months">3 Months Out</option>
                <option value="1_month">1 Month Out</option>
                <option value="1_week">1 Week Out</option>
                <option value="event_day">Event Day</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs font-semibold uppercase text-slate-500 mb-1">
                Priority
              </label>
              <select
                value={newTaskPriority}
                onChange={(e) =>
                  setNewTaskPriority(e.target.value as TaskPriority)
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs font-semibold uppercase text-slate-500 mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
              </input>
            </div>
            <div>
              <label className="block text-2xs font-semibold uppercase text-slate-500 mb-1">
                Notes / Vendor Details
              </label>
              <input
                type="text"
                placeholder="e.g. Sourced from Dadar flower market"
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>

        {/* Phase Filter */}
        <select
          value={filterPhase}
          onChange={(e) => setFilterPhase(e.target.value)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="all">All Phases</option>
          <option value="6_months">6 Months Out</option>
          <option value="3_months">3 Months Out</option>
          <option value="1_month">1 Month Out</option>
          <option value="1_week">1 Week Out</option>
          <option value="event_day">Event Day</option>
        </select>

        {/* Status Filter */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-2.5 py-1 text-2xs font-semibold ${
              filterStatus === "all" ? "bg-amber-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`px-2.5 py-1 text-2xs font-semibold ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("completed")}
            className={`px-2.5 py-1 text-2xs font-semibold ${
              filterStatus === "completed"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            Done
          </button>
        </div>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium ml-auto"
        >
          <option value="all">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No tasks match the active filters.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                task.completed
                  ? "bg-emerald-50/40 border-emerald-200/60 opacity-80"
                  : "bg-white border-slate-200 hover:border-amber-300 shadow-2xs"
              }`}
            >
              {/* Checkbox & Details */}
              <div className="flex items-start gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-amber-600 transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <div
                    className={`font-semibold text-sm ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </div>

                  {task.notes && (
                    <p className="text-2xs text-slate-500 mt-0.5">
                      {task.notes}
                    </p>
                  )}

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-2xs">
                    <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                      {PHASE_LABELS[task.timelinePhase] || task.timelinePhase}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        task.priority === "High"
                          ? "bg-rose-100 text-rose-800"
                          : task.priority === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition-colors shrink-0"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
