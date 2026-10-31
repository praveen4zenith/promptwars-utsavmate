export type EventType =
  | "wedding"
  | "birthday"
  | "community"
  | "anniversary"
  | "sangeet"
  | "other";

export type BudgetCategoryKey =
  | "venue"
  | "catering"
  | "decoration"
  | "photography"
  | "entertainment"
  | "miscellaneous"
  | "contingency";

export interface BudgetCategoryMeta {
  key: BudgetCategoryKey;
  label: string;
  hindiLabel: string;
  description: string;
  recommendedPercent: Record<EventType, number>;
  color: string;
  iconName: string;
}

export interface BudgetAllocations {
  venue: number;
  catering: number;
  decoration: number;
  photography: number;
  entertainment: number;
  miscellaneous: number;
  contingency: number;
}

export interface BudgetMetrics {
  totalBudget: number;
  allocatedTotal: number;
  remainingBalance: number;
  overrunAmount: number;
  percentAllocated: number;
  isOverrun: boolean;
  isBalanced: boolean;
  categoryPercentages: Record<BudgetCategoryKey, number>;
  statusText: string;
  surplusAmount: number;
}

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskPhase = "6_months" | "3_months" | "1_month" | "1_week" | "event_day";

export interface TaskItem {
  id: string;
  title: string;
  category: BudgetCategoryKey | "general" | "ritual" | "guest";
  timelinePhase: TaskPhase;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  notes?: string;
}

export interface DayOfScheduleItem {
  id: string;
  time: string;
  activity: string;
  description: string;
  responsiblePerson: string;
}

export interface VendorQuestionItem {
  category: BudgetCategoryKey | string;
  vendorType: string;
  questions: string[];
  status: "not_contacted" | "shortlisted" | "finalized";
  notes?: string;
}

export interface ContingencyItem {
  scenario: string;
  impact: string;
  solution: string;
  recommendedAction: string;
}

export interface EventFormData {
  eventType: EventType;
  eventName: string;
  hostName: string; // Celebrant, Couple, or Host Name(s)
  city: string;
  date: string;
  guestCount: number;
  totalBudget: number;
  theme: string;
  priorities: string[];
  dietaryNeeds: string[];
  specialRequirements: string;
}

export interface EventPlan {
  id: string;
  createdAt: string;
  lastUpdated: string;
  eventDetails: EventFormData;
  concept: {
    tagline: string;
    themeDescription: string;
    colorPalette: { name: string; hex: string }[];
    keyHighlights: string[];
  };
  budgetAllocations: BudgetAllocations;
  tasks: TaskItem[];
  preparationMilestones: {
    phase: string;
    description: string;
    milestoneTimeframe: string;
  }[];
  dayOfSchedule: DayOfScheduleItem[];
  vendorChecklist: VendorQuestionItem[];
  contingencyPlans: ContingencyItem[];
  isDemoPlan?: boolean;
}

export interface SavingsSuggestion {
  category: BudgetCategoryKey;
  title: string;
  potentialSavingsINR: number;
  tip: string;
  impact: "Minimal" | "Moderate" | "Noticeable";
}
