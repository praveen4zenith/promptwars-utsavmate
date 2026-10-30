"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Utensils,
  Heart,
  Palette,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { EventFormData, EventType } from "@/lib/types";
import { formatINR, formatINRShort, sanitizeCurrencyInput } from "@/lib/budgetEngine";
import { DEMO_PRESETS } from "@/lib/presets";

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading: boolean;
  onSelectPreset: (preset: any) => void;
  initialData?: EventFormData | null;
}

const EVENT_TYPES: { type: EventType; label: string; icon: string; desc: string }[] = [
  {
    type: "wedding",
    label: "Wedding & Vivah",
    icon: "💍",
    desc: "Baraat, Pheras, Mandap & Reception",
  },
  {
    type: "birthday",
    label: "Milestone Birthday",
    icon: "🎂",
    desc: "1st Birthday, 50th Jubilee & Parties",
  },
  {
    type: "community",
    label: "Community & Festival",
    icon: "🪔",
    desc: "Diwali Milan, Garba & Society Utsav",
  },
  {
    type: "sangeet",
    label: "Sangeet & Mehendi",
    icon: "💃",
    desc: "Dance, Henna, Dhol & Musical Night",
  },
  {
    type: "anniversary",
    label: "Anniversary Celebration",
    icon: "🥂",
    desc: "Silver & Golden Jubilees",
  },
  {
    type: "other",
    label: "Other Celebration",
    icon: "✨",
    desc: "Housewarming (Griha Pravesh) & Galas",
  },
];

const POPULAR_CITIES = [
  "Jaipur",
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Goa",
  "Udaipur",
  "Kolkata",
  "Pune",
  "Chennai",
];

const BUDGET_PRESETS = [
  { label: "₹2.5 Lakhs", value: 250000 },
  { label: "₹5 Lakhs", value: 500000 },
  { label: "₹15 Lakhs", value: 1500000 },
  { label: "₹35 Lakhs", value: 3500000 },
  { label: "₹75 Lakhs", value: 7500000 },
  { label: "₹1.5 Crore", value: 15000000 },
];

const GUEST_PRESETS = [50, 100, 200, 350, 500, 800];

const PRIORITY_OPTIONS = [
  "Catering & Culinary Spread",
  "Grand Floral & Stage Decor",
  "Candid Photography & Cinema",
  "DJ, Live Music & Dhol",
  "Guest Stay & Hospitality",
  "Sacred Vedic Rituals & Puja",
];

const DIETARY_OPTIONS = [
  "Pure Vegetarian",
  "Dedicated Jain Counter",
  "Multi-Cuisine (North & South Indian)",
  "Non-Vegetarian Live Counters",
  "Street Food & Live Chaat Stalls",
  "Traditional Mithai & Kulfi Bar",
];

const THEME_IDEAS: Record<EventType, string[]> = {
  wedding: [
    "Royal Rajputana Palace (Marigold & Crimson)",
    "Pastel Minimalist Floral Courtyard",
    "Traditional South Indian Temple & Brass Urli",
    "Starlit Modern Bollywood Glam",
    "Eco-Friendly Sustainable Marigold & Khadi",
  ],
  birthday: [
    "Pastel Jungle Safari & Gold",
    "Space & Galaxy Explorer",
    "Vintage Royal Maharaja 1st Year",
    "Carnival & Circus Extravaganza",
    "Enchanted Garden Fairy Lights",
  ],
  community: [
    "Deepotsav: 1001 Terracotta Diyas & Rangoli",
    "Navratri Dandiya Raas Nights",
    "Holi Rangotsav & Folk Melodies",
    "Ganesh Utsav Cultural Melange",
  ],
  sangeet: [
    "Neon Sufi & Bollywood Club",
    "Moroccan Lanterns & Silk Drapes",
    "Retro Disco 90s Beats",
    "Punjabi Dhol & Phulkari Village",
  ],
  anniversary: [
    "Silver Jubilee Starlit Symphony",
    "Golden Nostalgia Retro Gala",
    "Romantic Rose & Champagne Courtyard",
  ],
  other: [
    "Auspicious Vedic Griha Pravesh (Mango Leaves & Marigold)",
    "Traditional Housewarming Satyanarayan Puja",
  ],
};

const LOADING_STEPS = [
  "Curating authentic Indian festive concepts...",
  "Calculating deterministic budget breakdowns...",
  "Structuring hour-by-hour day-of itinerary...",
  "Formulating vendor questions & contract guardrails...",
  "Drafting weather & power contingency protocols...",
];

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  isLoading,
  onSelectPreset,
  initialData,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    eventType: initialData?.eventType || "wedding",
    eventName: initialData?.eventName || "",
    city: initialData?.city || "Jaipur",
    date: initialData?.date || "",
    guestCount: initialData?.guestCount || 250,
    totalBudget: initialData?.totalBudget || 1500000,
    theme: initialData?.theme || "Royal Rajputana Grandeur",
    priorities: initialData?.priorities || [
      "Catering & Culinary Spread",
      "Grand Floral & Stage Decor",
    ],
    dietaryNeeds: initialData?.dietaryNeeds || [
      "Pure Vegetarian",
      "Dedicated Jain Counter",
    ],
    specialRequirements: initialData?.specialRequirements || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Rotate loading step messages for engaging feedback
  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Sync if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.eventName.trim()) {
      errs.eventName = "Please provide an event name or host title.";
    }
    if (!formData.city.trim()) {
      errs.city = "Please specify a city or location.";
    }
    if (!formData.date) {
      errs.date = "Please select the celebration date.";
    }
    if (!formData.guestCount || formData.guestCount < 1) {
      errs.guestCount = "Guest count must be at least 1.";
    }
    if (!formData.totalBudget || formData.totalBudget < 10000) {
      errs.totalBudget = "Total budget must be at least ₹10,000.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      element?.focus();
      return;
    }
    await onSubmit(formData);
  };

  const togglePriority = (item: string) => {
    setFormData((prev) => {
      const exists = prev.priorities.includes(item);
      if (exists) {
        return { ...prev, priorities: prev.priorities.filter((p) => p !== item) };
      }
      return { ...prev, priorities: [...prev.priorities, item] };
    });
  };

  const toggleDietary = (item: string) => {
    setFormData((prev) => {
      const exists = prev.dietaryNeeds.includes(item);
      if (exists) {
        return {
          ...prev,
          dietaryNeeds: prev.dietaryNeeds.filter((d) => d !== item),
        };
      }
      return { ...prev, dietaryNeeds: [...prev.dietaryNeeds, item] };
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100 overflow-hidden">
      {/* Festive Form Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>PromptWars Challenge 05 • Celebration Planner</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Design Your Perfect Celebration
            </h2>
            <p className="text-amber-100 text-sm mt-1 max-w-xl">
              Tell UtsavMate about your vision. We will generate a culturally
              tailored theme, realistic INR budget breakdown, preparation
              timeline, and day-of schedule.
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <span className="text-2xs uppercase tracking-wider text-amber-200/90 font-semibold self-start">
              Explore Demo Presets:
            </span>
            <div className="flex flex-wrap sm:flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onSelectPreset(DEMO_PRESETS.wedding)}
                className="px-2.5 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 border border-white/20 transition-all font-medium text-left"
              >
                👑 Royal Wedding (₹35L)
              </button>
              <button
                type="button"
                onClick={() => onSelectPreset(DEMO_PRESETS.birthday)}
                className="px-2.5 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 border border-white/20 transition-all font-medium text-left"
              >
                🎂 1st Birthday (₹2.5L)
              </button>
              <button
                type="button"
                onClick={() => onSelectPreset(DEMO_PRESETS.community)}
                className="px-2.5 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 border border-white/20 transition-all font-medium text-left"
              >
                🪔 Diwali Utsav (₹6L)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* 1. Event Type Selection */}
        <section>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            1. Celebration Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EVENT_TYPES.map((et) => {
              const isSelected = formData.eventType === et.type;
              return (
                <button
                  type="button"
                  key={et.type}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      eventType: et.type,
                      theme: THEME_IDEAS[et.type]?.[0] || prev.theme,
                    }));
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{et.icon}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-600 font-bold" />
                    )}
                  </div>
                  <div className="font-semibold text-sm text-slate-900">
                    {et.label}
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5 line-clamp-1">
                    {et.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Basic Details: Title, City, Date */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Event Title */}
          <div className="sm:col-span-1">
            <label
              htmlFor="eventName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Event Title / Names <span className="text-rose-500">*</span>
            </label>
            <input
              id="eventName"
              type="text"
              placeholder="e.g. Priya & Amit Vivah"
              value={formData.eventName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventName: e.target.value }))
              }
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.eventName
                  ? "border-rose-400 ring-rose-200 bg-rose-50/30"
                  : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
              }`}
            />
            {errors.eventName && (
              <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.eventName}
              </p>
            )}
          </div>

          {/* City / Location */}
          <div className="sm:col-span-1">
            <label
              htmlFor="city"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              City / Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="city"
                type="text"
                placeholder="e.g. Jaipur, Rajasthan"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.city
                    ? "border-rose-400 ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                }`}
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.city ? (
              <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.city}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_CITIES.slice(0, 5).map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setFormData((prev) => ({ ...prev, city: c }))}
                    className="text-2xs px-1.5 py-0.5 rounded bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Planned Date */}
          <div className="sm:col-span-1">
            <label
              htmlFor="date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Event Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-rose-400 ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                }`}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.date}
              </p>
            )}
          </div>
        </section>

        {/* 3. Guest Count & Total Budget (Deterministic Math Base) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60">
          {/* Guest Count */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="guestCount"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5 text-amber-700" />
                Guest Count <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold text-amber-900">
                {formData.guestCount} Guests
              </span>
            </div>
            <input
              id="guestCount"
              type="number"
              min="1"
              max="10000"
              value={formData.guestCount || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  guestCount: sanitizeCurrencyInput(e.target.value),
                }))
              }
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 ${
                errors.guestCount
                  ? "border-rose-400 ring-rose-200 bg-white"
                  : "border-slate-200 bg-white focus:border-amber-500 focus:ring-amber-200"
              }`}
            />
            {errors.guestCount && (
              <p className="text-rose-600 text-xs mt-1">{errors.guestCount}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {GUEST_PRESETS.map((cnt) => (
                <button
                  type="button"
                  key={cnt}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, guestCount: cnt }))
                  }
                  className={`px-2 py-0.5 text-xs rounded-md border font-medium transition-colors ${
                    formData.guestCount === cnt
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-slate-600 hover:bg-amber-100 border-amber-200"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Total Budget in INR */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="totalBudget"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1"
              >
                <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                Total Budget in INR (₹) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold text-amber-900">
                {formatINR(formData.totalBudget)} ({formatINRShort(formData.totalBudget)})
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                id="totalBudget"
                type="number"
                min="10000"
                step="5000"
                value={formData.totalBudget || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalBudget: sanitizeCurrencyInput(e.target.value),
                  }))
                }
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 ${
                  errors.totalBudget
                    ? "border-rose-400 ring-rose-200 bg-white"
                    : "border-slate-200 bg-white focus:border-amber-500 focus:ring-amber-200"
                }`}
              />
            </div>
            {errors.totalBudget && (
              <p className="text-rose-600 text-xs mt-1">{errors.totalBudget}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {BUDGET_PRESETS.map((bp) => (
                <button
                  type="button"
                  key={bp.value}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, totalBudget: bp.value }))
                  }
                  className={`px-2 py-0.5 text-xs rounded-md border font-medium transition-colors ${
                    formData.totalBudget === bp.value
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-slate-600 hover:bg-amber-100 border-amber-200"
                  }`}
                >
                  {bp.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Theme & Aesthetics */}
        <section>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="theme"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              Theme & Aesthetic Vision
            </label>
            <span className="text-2xs text-slate-400">Click any idea below</span>
          </div>
          <input
            id="theme"
            type="text"
            placeholder="e.g. Royal Marigold Courtyard with Brass Lamps"
            value={formData.theme}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, theme: e.target.value }))
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          {/* Quick theme pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(THEME_IDEAS[formData.eventType] || []).map((idea) => (
              <button
                type="button"
                key={idea}
                onClick={() => setFormData((prev) => ({ ...prev, theme: idea }))}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all text-left ${
                  formData.theme === idea
                    ? "bg-amber-100 border-amber-400 text-amber-900 font-medium"
                    : "bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-600"
                }`}
              >
                ✨ {idea}
              </button>
            ))}
          </div>
        </section>

        {/* 5. Key Priorities & Dietary Needs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priorities */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              Top Priorities
            </label>
            <div className="space-y-1.5">
              {PRIORITY_OPTIONS.map((opt) => {
                const active = formData.priorities.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => togglePriority(opt)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border text-left flex items-center justify-between transition-colors ${
                      active
                        ? "bg-rose-50 border-rose-300 text-rose-900 font-medium"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        active
                          ? "bg-rose-600 border-rose-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Needs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              Dietary & Food Needs
            </label>
            <div className="space-y-1.5">
              {DIETARY_OPTIONS.map((opt) => {
                const active = formData.dietaryNeeds.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleDietary(opt)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border text-left flex items-center justify-between transition-colors ${
                      active
                        ? "bg-amber-50 border-amber-300 text-amber-900 font-medium"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        active
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Special Requirements / Contingency Needs */}
        <section>
          <label
            htmlFor="specialRequirements"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
          >
            Special Requirements, Rituals or Constraints
          </label>
          <textarea
            id="specialRequirements"
            rows={2}
            placeholder="e.g. Rain contingency plan needed, elderly wheelchair access, Baraat dhol timing rules, noise curfew at 10 PM..."
            value={formData.specialRequirements}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                specialRequirements: e.target.value,
              }))
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </section>

        {/* Submit Button & Progress Indicator */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-amber-400 cursor-not-allowed opacity-90"
                : "bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 hover:from-amber-700 hover:via-orange-700 hover:to-rose-800 shadow-amber-600/25 hover:shadow-xl active:scale-[0.99]"
            }`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Planning Your Auspicious Celebration...</span>
                </div>
                <p className="text-xs font-normal text-amber-100 animate-pulse">
                  {LOADING_STEPS[loadingStepIdx]}
                </p>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Comprehensive Celebration Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
