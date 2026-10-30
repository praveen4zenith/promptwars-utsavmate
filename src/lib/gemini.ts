import {
  EventFormData,
  EventPlan,
  SavingsSuggestion,
  TaskItem,
  DayOfScheduleItem,
  VendorQuestionItem,
  ContingencyItem,
} from "./types";
import {
  getRecommendedAllocations,
  generateDeterministicSavingsTips,
  formatINR,
} from "./budgetEngine";
import { DEMO_PRESET_WEDDING, DEMO_PRESET_BIRTHDAY, DEMO_PRESET_COMMUNITY } from "./presets";

export interface GeneratePlanResult {
  plan: EventPlan;
  isDemoMode: boolean;
  message?: string;
}

/**
 * Strips markdown code blocks and trims whitespace.
 */
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Fallback generator when Gemini API is unconfigured or encounters errors.
 * Generates an event plan customized to user's exact inputs.
 */
export function generateDynamicFallbackPlan(formData: EventFormData): EventPlan {
  const basePreset =
    formData.eventType === "birthday"
      ? DEMO_PRESET_BIRTHDAY
      : formData.eventType === "community"
      ? DEMO_PRESET_COMMUNITY
      : DEMO_PRESET_WEDDING;

  const allocations = getRecommendedAllocations(
    formData.totalBudget,
    formData.eventType
  );

  const fallbackTasks: TaskItem[] = basePreset.tasks.map((task, index) => ({
    ...task,
    id: `task-${Date.now()}-${index}`,
    completed: index === 0, // Mark first as done
    dueDate: formData.date ? `${formData.date}` : undefined,
  }));

  const fallbackSchedule: DayOfScheduleItem[] = basePreset.dayOfSchedule.map(
    (item, index) => ({
      ...item,
      id: `sched-${Date.now()}-${index}`,
    })
  );

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isDemoPlan: true,
    eventDetails: formData,
    concept: {
      tagline: `A Glorious ${formData.theme || "Celebration"} in ${formData.city}`,
      themeDescription: `A masterfully planned ${formData.eventType} in ${
        formData.city
      } welcoming ${formData.guestCount} cherished guests with a total budget of ${formatINR(
        formData.totalBudget
      )}. Designed around the theme "${formData.theme || "Traditional Elegance"}" prioritizing ${formData.priorities.join(", ") || "Hospitality & Joy"}.`,
      colorPalette: basePreset.concept.colorPalette,
      keyHighlights: [
        `Curated celebration for ${formData.guestCount} guests in ${formData.city}`,
        `Catering tailored to: ${formData.dietaryNeeds.join(", ") || "Grand Indian Feast"}`,
        `Themed decor: ${formData.theme || "Traditional Festive Accents"}`,
        `Special provisions: ${formData.specialRequirements || "Standard celebration amenities"}`,
      ],
    },
    budgetAllocations: allocations,
    preparationMilestones: basePreset.preparationMilestones,
    tasks: fallbackTasks,
    dayOfSchedule: fallbackSchedule,
    vendorChecklist: basePreset.vendorChecklist,
    contingencyPlans: [
      {
        scenario: "Weather & Rain Contingency",
        impact: "Outdoor event activities or dining disrupted.",
        solution: `Coordinate with ${formData.city} venue for covered marquee or indoor banquet reserve hall.`,
        recommendedAction: "Check 3-day meteorological forecast and retain waterproof tenting vendor on standby.",
      },
      {
        scenario: `Guest Turnout Overruns (Exceeding ${formData.guestCount})`,
        impact: "Food counter queues and seating shortages.",
        solution: "Pre-book +10% catering buffer with rapid-replenish tandoor and live chaat counters.",
        recommendedAction: "Station 2 family coordinators at welcome desk to count arrivals.",
      },
      {
        scenario: "Power Cut / Sound System Trip",
        impact: "Loss of stage illumination and music.",
        solution: "Mandatory venue DG generator test with auto-switchover within 15 seconds.",
        recommendedAction: "Verify generator fuel levels and cable routing 2 hours prior to start.",
      },
      {
        scenario: "Vendor Arrival Delays in City Traffic",
        impact: "Stage setup or makeup running behind schedule.",
        solution: `Schedule all primary vendors in ${formData.city} to arrive 3 hours before guest call-time.`,
        recommendedAction: "Assign dedicated vendor coordinator with vendor phone roster.",
      },
    ],
  };
}

/**
 * Server-side AI Generation using Google Gemini REST API.
 */
export async function generateEventPlanWithGemini(
  formData: EventFormData
): Promise<GeneratePlanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    console.info("Gemini API key not found. Using intelligent offline fallback engine.");
    return {
      plan: generateDynamicFallbackPlan(formData),
      isDemoMode: true,
      message: "Generated using UtsavMate Offline Intelligence Engine (Add GEMINI_API_KEY for live AI).",
    };
  }

  const prompt = `
You are an expert Indian Celebration & Luxury Event Planner with 20+ years of experience across Indian weddings, milestone birthdays, and community festivals.
Generate a comprehensive, culturally rich, realistic event plan in STRICT JSON format based on the following client requirements:

EVENT SPECIFICATIONS:
- Event Type: ${formData.eventType}
- Event Title: ${formData.eventName}
- City / Location: ${formData.city}
- Planned Date: ${formData.date}
- Guest Count: ${formData.guestCount}
- Total Budget in INR: ₹${formData.totalBudget}
- Preferred Theme / Aesthetic: ${formData.theme || "Traditional Indian Celebration"}
- Top Priorities: ${formData.priorities.join(", ") || "Dining, Hospitality, Decor"}
- Dietary & Food Requirements: ${formData.dietaryNeeds.join(", ") || "Multi-cuisine Indian feast"}
- Special Requirements / Constraints: ${formData.specialRequirements || "None specified"}

CULTURAL CONTEXT & ACCURACY RULES:
1. Ensure the timeline, terminology, rituals, and cuisine match authentic Indian traditions (e.g. Baraat, Varmala, Pheras, Sangeet, Mehendi, Annaprashan, Pooja, Satvik, Jain counter, Dhol, Shenai, etc.).
2. Day-of schedule must be a realistic hour-by-hour sequence.
3. Preparation milestones must break down tasks from 6 months out down to event day.
4. Tasks checklist must include at least 8 specific, actionable tasks with category, priority, and timelinePhase.
5. Vendor questions must provide insightful, vendor-specific questions for Indian venues, caterers, decorators, and photographers.
6. Contingency plans must address Indian celebration pain points: rain/weather, power generator backup, excess guests (+10-15%), and noise/curfew restrictions.

STRICT JSON OUTPUT FORMAT (Respond ONLY with valid JSON, no markdown outside the JSON):
{
  "concept": {
    "tagline": "A captivating, evocative one-line theme tagline",
    "themeDescription": "2-3 sentences explaining the aesthetic, floral elements, lighting, and cultural mood",
    "colorPalette": [
      { "name": "Color Name (e.g. Marigold Yellow)", "hex": "#F59E0B" },
      { "name": "Color Name (e.g. Royal Ruby)", "hex": "#BE123C" },
      { "name": "Color Name (e.g. Sandstone Cream)", "hex": "#FFFDF9" },
      { "name": "Color Name (e.g. Peacock Teal)", "hex": "#0891B2" }
    ],
    "keyHighlights": [
      "Highlight 1",
      "Highlight 2",
      "Highlight 3",
      "Highlight 4"
    ]
  },
  "preparationMilestones": [
    {
      "phase": "6 Months Out",
      "description": "Milestone summary",
      "milestoneTimeframe": "6 months prior"
    },
    {
      "phase": "3 Months Out",
      "description": "Milestone summary",
      "milestoneTimeframe": "3 months prior"
    },
    {
      "phase": "1 Month Out",
      "description": "Milestone summary",
      "milestoneTimeframe": "1 month prior"
    },
    {
      "phase": "1 Week Out",
      "description": "Milestone summary",
      "milestoneTimeframe": "7 days prior"
    },
    {
      "phase": "Event Day",
      "description": "Milestone summary",
      "milestoneTimeframe": "Day of Event"
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "title": "Task title",
      "category": "venue",
      "timelinePhase": "6_months",
      "priority": "High",
      "completed": false,
      "notes": "Helpful cultural or planning context"
    }
  ],
  "dayOfSchedule": [
    {
      "id": "sched-1",
      "time": "09:00 AM - 10:30 AM",
      "activity": "Activity name",
      "description": "What happens during this window",
      "responsiblePerson": "Who is responsible (e.g., Lead Pandit, Uncle, Emcee)"
    }
  ],
  "vendorChecklist": [
    {
      "category": "venue",
      "vendorType": "Banquet / Lawn Manager",
      "questions": ["Specific question 1", "Specific question 2"],
      "status": "shortlisted",
      "notes": "What to watch out for"
    }
  ],
  "contingencyPlans": [
    {
      "scenario": "Sudden Rain or Storm",
      "impact": "What is affected",
      "solution": "Backup solution",
      "recommendedAction": "Action step"
    }
  ]
}
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Gemini API Error (${response.status}):`, errBody);
      // Fallback cleanly
      return {
        plan: generateDynamicFallbackPlan(formData),
        isDemoMode: true,
        message: `Gemini API returned status ${response.status}. Switched to offline plan generator.`,
      };
    }

    const jsonResp = await response.json();
    const rawText =
      jsonResp.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }

    const cleaned = cleanJsonString(rawText);
    const parsed = JSON.parse(cleaned);

    // DETERMINISTIC BUDGET ARITHMETIC: Always calculate allocations deterministically
    // and never trust AI for category sums or arithmetic
    const deterministicAllocations = getRecommendedAllocations(
      formData.totalBudget,
      formData.eventType
    );

    // Validate and sanitize tasks
    const tasks: TaskItem[] = Array.isArray(parsed.tasks)
      ? parsed.tasks.map((t: Partial<TaskItem>, idx: number) => ({
          id: t.id || `task-${Date.now()}-${idx}`,
          title: t.title || "Custom Event Task",
          category: t.category || "general",
          timelinePhase: t.timelinePhase || "1_month",
          priority: t.priority === "High" || t.priority === "Low" ? t.priority : "Medium",
          completed: false,
          notes: t.notes || "",
        }))
      : generateDynamicFallbackPlan(formData).tasks;

    // Validate schedule
    const schedule: DayOfScheduleItem[] = Array.isArray(parsed.dayOfSchedule)
      ? parsed.dayOfSchedule.map((s: Partial<DayOfScheduleItem>, idx: number) => ({
          id: s.id || `sched-${Date.now()}-${idx}`,
          time: s.time || "TBD",
          activity: s.activity || "Event Milestone",
          description: s.description || "",
          responsiblePerson: s.responsiblePerson || "Host Coordinator",
        }))
      : generateDynamicFallbackPlan(formData).dayOfSchedule;

    // Build the final complete plan
    const eventPlan: EventPlan = {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isDemoPlan: false,
      eventDetails: formData,
      concept: {
        tagline: parsed.concept?.tagline || `Celebration in ${formData.city}`,
        themeDescription:
          parsed.concept?.themeDescription ||
          `A beautifully curated ${formData.eventType} celebration.`,
        colorPalette: Array.isArray(parsed.concept?.colorPalette)
          ? parsed.concept.colorPalette
          : [
              { name: "Marigold Gold", hex: "#D97706" },
              { name: "Festive Crimson", hex: "#BE123C" },
            ],
        keyHighlights: Array.isArray(parsed.concept?.keyHighlights)
          ? parsed.concept.keyHighlights
          : [`Grand celebration for ${formData.guestCount} guests in ${formData.city}`],
      },
      budgetAllocations: deterministicAllocations,
      preparationMilestones: Array.isArray(parsed.preparationMilestones)
        ? parsed.preparationMilestones
        : generateDynamicFallbackPlan(formData).preparationMilestones,
      tasks,
      dayOfSchedule: schedule,
      vendorChecklist: Array.isArray(parsed.vendorChecklist)
        ? parsed.vendorChecklist
        : generateDynamicFallbackPlan(formData).vendorChecklist,
      contingencyPlans: Array.isArray(parsed.contingencyPlans)
        ? parsed.contingencyPlans
        : generateDynamicFallbackPlan(formData).contingencyPlans,
    };

    return {
      plan: eventPlan,
      isDemoMode: false,
      message: "AI plan generated successfully via Google Gemini.",
    };
  } catch (err: unknown) {
    console.error("Failed to generate plan with Gemini:", err);
    return {
      plan: generateDynamicFallbackPlan(formData),
      isDemoMode: true,
      message: "API error encountered. Switched to offline plan generator.",
    };
  }
}

/**
 * Server-side contextual savings suggestions via Gemini with deterministic fallback.
 */
export async function getSavingsSuggestions(
  totalBudget: number,
  allocations: any,
  eventType: any
): Promise<SavingsSuggestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Deterministic fallback tips
  const fallbackTips = generateDeterministicSavingsTips(
    totalBudget,
    allocations,
    eventType
  );

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return fallbackTips;
  }

  const prompt = `
You are an expert Indian celebration financial planner. Analyze this event budget breakdown and recommend 4 actionable, practical cost-saving tips tailored to Indian celebrations.
Total Budget: ₹${totalBudget}
Event Type: ${eventType}
Category Allocations:
- Venue & Stay: ₹${allocations.venue}
- Catering & Beverages: ₹${allocations.catering}
- Decoration & Florals: ₹${allocations.decoration}
- Photography & Video: ₹${allocations.photography}
- Entertainment & DJ: ₹${allocations.entertainment}
- Miscellaneous: ₹${allocations.miscellaneous}
- Contingency: ₹${allocations.contingency}

Provide 4 specific savings recommendations in JSON array format:
[
  {
    "category": "venue" | "catering" | "decoration" | "photography" | "entertainment" | "miscellaneous" | "contingency",
    "title": "Concise savings action",
    "potentialSavingsINR": 25000,
    "tip": "Concrete cultural or vendor negotiation strategy",
    "impact": "Minimal" | "Moderate" | "Noticeable"
  }
]
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      return fallbackTips;
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = cleanJsonString(rawText);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallbackTips;
  } catch (err) {
    console.error("Savings tips AI error:", err);
    return fallbackTips;
  }
}
