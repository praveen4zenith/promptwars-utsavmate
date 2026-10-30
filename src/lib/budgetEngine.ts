import {
  BudgetAllocations,
  BudgetCategoryKey,
  BudgetCategoryMeta,
  BudgetMetrics,
  EventType,
  SavingsSuggestion,
} from "./types";

export const BUDGET_CATEGORIES: BudgetCategoryMeta[] = [
  {
    key: "venue",
    label: "Venue & Stay",
    hindiLabel: "स्थान एवं आवास",
    description: "Banquet hall, lawn rental, guest accommodation, and power generator backup",
    recommendedPercent: {
      wedding: 30,
      birthday: 25,
      community: 25,
      anniversary: 25,
      sangeet: 28,
      other: 25,
    },
    color: "#D97706", // Marigold Amber
    iconName: "Building2",
  },
  {
    key: "catering",
    label: "Catering & Beverages",
    hindiLabel: "भोजन एवं पेय",
    description: "Welcome drinks, multi-cuisine buffet, live chaat stalls, and service staff",
    recommendedPercent: {
      wedding: 26,
      birthday: 32,
      community: 35,
      anniversary: 30,
      sangeet: 25,
      other: 28,
    },
    color: "#BE123C", // Festive Ruby
    iconName: "Utensils",
  },
  {
    key: "decoration",
    label: "Decoration & Florals",
    hindiLabel: "सजावट एवं पुष्प",
    description: "Stage backdrop, mandap florals, entrance arch, table centerpieces, and ambient lighting",
    recommendedPercent: {
      wedding: 16,
      birthday: 15,
      community: 15,
      anniversary: 16,
      sangeet: 16,
      other: 15,
    },
    color: "#EA580C", // Saffron
    iconName: "Sparkles",
  },
  {
    key: "photography",
    label: "Photography & Video",
    hindiLabel: "फोटोग्राफी एवं वीडियोग्राफी",
    description: "Candid photography, traditional team, cinematic teaser, drone coverage, and photo album",
    recommendedPercent: {
      wedding: 10,
      birthday: 10,
      community: 6,
      anniversary: 10,
      sangeet: 11,
      other: 10,
    },
    color: "#0284C7", // Peacock Blue
    iconName: "Camera",
  },
  {
    key: "entertainment",
    label: "DJ, Sound & Lights",
    hindiLabel: "संगीत, डीजे एवं लाइट",
    description: "DJ console, sound system, dhol players, emcee, dance floor, and stage performers",
    recommendedPercent: {
      wedding: 8,
      birthday: 9,
      community: 8,
      anniversary: 8,
      sangeet: 12,
      other: 9,
    },
    color: "#7C3AED", // Royal Violet
    iconName: "Music",
  },
  {
    key: "miscellaneous",
    label: "Gifts, Invites & Rituals",
    hindiLabel: "उपहार, निमंत्रण एवं पूजा",
    description: "E-invites/printed cards, return gifts/mithai, puja samagri, and transport logistics",
    recommendedPercent: {
      wedding: 4,
      birthday: 4,
      community: 5,
      anniversary: 5,
      sangeet: 3,
      other: 5,
    },
    color: "#059669", // Emerald
    iconName: "Gift",
  },
  {
    key: "contingency",
    label: "Emergency Contingency Buffer",
    hindiLabel: "आपातकालीन आरक्षित निधि",
    description: "Buffer reserve for unexpected extra guests, weather adjustments, or last-minute needs",
    recommendedPercent: {
      wedding: 6,
      birthday: 5,
      community: 6,
      anniversary: 6,
      sangeet: 5,
      other: 8,
    },
    color: "#475569", // Slate
    iconName: "ShieldAlert",
  },
];

/**
 * Validates a single monetary input.
 * Ensures number is non-negative, finite, and clamped to safe limits.
 */
export function sanitizeCurrencyInput(val: unknown): number {
  if (typeof val === "string") {
    // Strip non-numeric except decimal point
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || !isFinite(parsed)) return 0;
    return Math.max(0, Math.round(parsed));
  }
  if (typeof val === "number") {
    if (isNaN(val) || !isFinite(val)) return 0;
    return Math.max(0, Math.round(val));
  }
  return 0;
}

/**
 * Generates deterministic recommended category splits based on total budget and event type.
 * Always ensures the sum of category amounts matches the totalBudget exactly.
 */
export function getRecommendedAllocations(
  totalBudget: number,
  eventType: EventType = "wedding"
): BudgetAllocations {
  const safeBudget = sanitizeCurrencyInput(totalBudget);
  if (safeBudget === 0) {
    return {
      venue: 0,
      catering: 0,
      decoration: 0,
      photography: 0,
      entertainment: 0,
      miscellaneous: 0,
      contingency: 0,
    };
  }

  const result: Partial<BudgetAllocations> = {};
  let allocatedSum = 0;

  BUDGET_CATEGORIES.forEach((cat, index) => {
    if (index === BUDGET_CATEGORIES.length - 1) {
      // Last category receives remainder to guarantee exact sum match
      const remainder = safeBudget - allocatedSum;
      result[cat.key] = Math.max(0, remainder);
    } else {
      const pct = cat.recommendedPercent[eventType] ?? 10;
      const amount = Math.round((safeBudget * pct) / 100);
      result[cat.key] = amount;
      allocatedSum += amount;
    }
  });

  return result as BudgetAllocations;
}

/**
 * Pure deterministic budget calculation engine.
 * Never delegates mathematical totals or balances to AI.
 */
export function calculateBudgetMetrics(
  totalBudget: number,
  allocations: BudgetAllocations
): BudgetMetrics {
  const safeTotalBudget = sanitizeCurrencyInput(totalBudget);

  const safeAllocations: BudgetAllocations = {
    venue: sanitizeCurrencyInput(allocations.venue),
    catering: sanitizeCurrencyInput(allocations.catering),
    decoration: sanitizeCurrencyInput(allocations.decoration),
    photography: sanitizeCurrencyInput(allocations.photography),
    entertainment: sanitizeCurrencyInput(allocations.entertainment),
    miscellaneous: sanitizeCurrencyInput(allocations.miscellaneous),
    contingency: sanitizeCurrencyInput(allocations.contingency),
  };

  const allocatedTotal =
    safeAllocations.venue +
    safeAllocations.catering +
    safeAllocations.decoration +
    safeAllocations.photography +
    safeAllocations.entertainment +
    safeAllocations.miscellaneous +
    safeAllocations.contingency;

  const isOverrun = allocatedTotal > safeTotalBudget;
  const overrunAmount = isOverrun ? allocatedTotal - safeTotalBudget : 0;
  const surplusAmount = !isOverrun ? safeTotalBudget - allocatedTotal : 0;
  const remainingBalance = safeTotalBudget - allocatedTotal;

  const percentAllocated =
    safeTotalBudget > 0
      ? Number(((allocatedTotal / safeTotalBudget) * 100).toFixed(1))
      : 0;

  const categoryPercentages: Record<BudgetCategoryKey, number> = {
    venue:
      safeTotalBudget > 0
        ? Number(((safeAllocations.venue / safeTotalBudget) * 100).toFixed(1))
        : 0,
    catering:
      safeTotalBudget > 0
        ? Number(((safeAllocations.catering / safeTotalBudget) * 100).toFixed(1))
        : 0,
    decoration:
      safeTotalBudget > 0
        ? Number(((safeAllocations.decoration / safeTotalBudget) * 100).toFixed(1))
        : 0,
    photography:
      safeTotalBudget > 0
        ? Number(((safeAllocations.photography / safeTotalBudget) * 100).toFixed(1))
        : 0,
    entertainment:
      safeTotalBudget > 0
        ? Number(((safeAllocations.entertainment / safeTotalBudget) * 100).toFixed(1))
        : 0,
    miscellaneous:
      safeTotalBudget > 0
        ? Number(((safeAllocations.miscellaneous / safeTotalBudget) * 100).toFixed(1))
        : 0,
    contingency:
      safeTotalBudget > 0
        ? Number(((safeAllocations.contingency / safeTotalBudget) * 100).toFixed(1))
        : 0,
  };

  const isBalanced = allocatedTotal === safeTotalBudget && safeTotalBudget > 0;

  let statusText = "Ready to allocate";
  if (safeTotalBudget === 0) {
    statusText = "Enter total budget to begin";
  } else if (isOverrun) {
    statusText = `Over Budget by ${formatINR(overrunAmount)}`;
  } else if (isBalanced) {
    statusText = "100% Perfectly Allocated";
  } else {
    statusText = `${formatINR(surplusAmount)} remaining to allocate`;
  }

  return {
    totalBudget: safeTotalBudget,
    allocatedTotal,
    remainingBalance,
    overrunAmount,
    surplusAmount,
    percentAllocated,
    isOverrun,
    isBalanced,
    categoryPercentages,
    statusText,
  };
}

/**
 * Indian Rupee (INR) formatter with Lakhs and Crores notations.
 * Example: 1500000 -> ₹15,00,000 (15 Lakhs)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹0";
  const absAmount = Math.abs(Math.round(amount));
  const sign = amount < 0 ? "-" : "";

  // Standard Indian comma separator regex
  const str = absAmount.toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  return `${sign}₹${formatted}`;
}

/**
 * Concise Indian denomination helper (e.g., 25 Lakhs, 1.2 Crore)
 */
export function formatINRShort(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 10000000) {
    const val = (abs / 10000000).toFixed(2).replace(/\.?0+$/, "");
    return `${sign}₹${val} Cr`;
  }
  if (abs >= 100000) {
    const val = (abs / 100000).toFixed(2).replace(/\.?0+$/, "");
    return `${sign}₹${val} Lakh`;
  }
  if (abs >= 1000) {
    const val = (abs / 1000).toFixed(1).replace(/\.?0+$/, "");
    return `${sign}₹${val}k`;
  }
  return `${sign}₹${abs}`;
}

/**
 * Deterministic Savings Suggestions Engine
 * Used for instant suggestions or offline fallback.
 */
export function generateDeterministicSavingsTips(
  totalBudget: number,
  allocations: BudgetAllocations,
  eventType: EventType
): SavingsSuggestion[] {
  const tips: SavingsSuggestion[] = [];
  const metrics = calculateBudgetMetrics(totalBudget, allocations);

  // Check venue
  if (metrics.categoryPercentages.venue > 32) {
    const venueSaving = Math.round(allocations.venue * 0.12);
    tips.push({
      category: "venue",
      title: "Negotiate Weekday or Off-Peak Slot",
      potentialSavingsINR: venueSaving,
      tip: "Booking a Friday evening or Sunday morning, or bundling rooms with banquet rental can save 10-15% on venue tariff.",
      impact: "Noticeable",
    });
  }

  // Check catering
  if (metrics.categoryPercentages.catering > 28) {
    const cateringSaving = Math.round(allocations.catering * 0.1);
    tips.push({
      category: "catering",
      title: "Streamline Live Counters & Reduce Duplicate Starters",
      potentialSavingsINR: cateringSaving,
      tip: "Limiting live counters from 6 to 3 focused signature stations and curating 4 appetizers instead of 8 avoids high per-plate wastage while keeping quality top-notch.",
      impact: "Moderate",
    });
  }

  // Check decoration
  if (metrics.categoryPercentages.decoration > 17) {
    const decorSaving = Math.round(allocations.decoration * 0.15);
    tips.push({
      category: "decoration",
      title: "Blend Seasonal Marigolds with Reusable Fabric Drapes",
      potentialSavingsINR: decorSaving,
      tip: "Replace imported exotic flowers with local blooms (marigold, mogra, tuberose) paired with fairy lights and brass urlis for a rich royal look at half the flower vendor quote.",
      impact: "Noticeable",
    });
  }

  // Check photography
  if (metrics.categoryPercentages.photography > 12) {
    const photoSaving = Math.round(allocations.photography * 0.15);
    tips.push({
      category: "photography",
      title: "Opt for a Combined Single-Team Photo/Video Package",
      potentialSavingsINR: photoSaving,
      tip: "Hiring a single integrated crew rather than two separate bride/groom photo teams saves 15-20% and prevents overlapping camera clutter.",
      impact: "Moderate",
    });
  }

  // Check entertainment
  if (metrics.categoryPercentages.entertainment > 10) {
    const djSaving = Math.round(allocations.entertainment * 0.15);
    tips.push({
      category: "entertainment",
      title: "Bring In-House Sound with Curated Playlist for Pre-Functions",
      potentialSavingsINR: djSaving,
      tip: "Book the premium DJ setup only for the prime Sangeet/Reception night; use the venue's acoustic sound system with curated family Spotify lists for Haldi/Mehendi.",
      impact: "Minimal",
    });
  }

  // Always include general Indian celebration tip if list is short
  if (tips.length < 3) {
    tips.push({
      category: "miscellaneous",
      title: "Digital WhatsApp Invites with QR RSVP",
      potentialSavingsINR: Math.round(Math.max(5000, totalBudget * 0.02)),
      tip: "Design an animated digital video card for 80% of guests and print physical cards only for elderly relatives, drastically cutting printing and courier fees.",
      impact: "Minimal",
    });
  }

  return tips;
}
