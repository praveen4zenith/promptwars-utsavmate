import { describe, it, expect } from "vitest";
import {
  calculateBudgetMetrics,
  getRecommendedAllocations,
  sanitizeCurrencyInput,
  formatINR,
  formatINRShort,
  generateDeterministicSavingsTips,
} from "../lib/budgetEngine";
import { BudgetAllocations } from "../lib/types";

describe("budgetEngine - Deterministic Arithmetic", () => {
  it("sanitizes currency inputs properly, preventing negatives and NaN", () => {
    expect(sanitizeCurrencyInput(-5000)).toBe(0);
    expect(sanitizeCurrencyInput("-12000")).toBe(12000); // cleaned digits
    expect(sanitizeCurrencyInput("invalid")).toBe(0);
    expect(sanitizeCurrencyInput(NaN)).toBe(0);
    expect(sanitizeCurrencyInput(Infinity)).toBe(0);
    expect(sanitizeCurrencyInput(null)).toBe(0);
    expect(sanitizeCurrencyInput(undefined)).toBe(0);
    expect(sanitizeCurrencyInput(25000.75)).toBe(25001); // rounded
  });

  it("calculates budget metrics accurately when allocations match total budget", () => {
    const total = 1000000; // 10 Lakhs
    const allocations: BudgetAllocations = {
      venue: 300000,
      catering: 260000,
      decoration: 160000,
      photography: 100000,
      entertainment: 80000,
      miscellaneous: 40000,
      contingency: 60000,
    };

    const metrics = calculateBudgetMetrics(total, allocations);

    expect(metrics.totalBudget).toBe(1000000);
    expect(metrics.allocatedTotal).toBe(1000000);
    expect(metrics.remainingBalance).toBe(0);
    expect(metrics.overrunAmount).toBe(0);
    expect(metrics.surplusAmount).toBe(0);
    expect(metrics.isOverrun).toBe(false);
    expect(metrics.isBalanced).toBe(true);
    expect(metrics.percentAllocated).toBe(100);
    expect(metrics.categoryPercentages.venue).toBe(30);
    expect(metrics.categoryPercentages.catering).toBe(26);
  });

  it("accurately detects overruns when category sum exceeds total budget", () => {
    const total = 500000; // 5 Lakhs
    const allocations: BudgetAllocations = {
      venue: 200000,
      catering: 200000,
      decoration: 100000,
      photography: 50000,
      entertainment: 50000,
      miscellaneous: 20000,
      contingency: 30000,
    }; // Total = 650,000 (150,000 overrun)

    const metrics = calculateBudgetMetrics(total, allocations);

    expect(metrics.allocatedTotal).toBe(650000);
    expect(metrics.overrunAmount).toBe(150000);
    expect(metrics.remainingBalance).toBe(-150000);
    expect(metrics.isOverrun).toBe(true);
    expect(metrics.isBalanced).toBe(false);
    expect(metrics.statusText).toContain("Over Budget by ₹1,50,000");
  });

  it("accurately detects surplus when budget is under-allocated", () => {
    const total = 1000000;
    const allocations: BudgetAllocations = {
      venue: 250000,
      catering: 250000,
      decoration: 100000,
      photography: 50000,
      entertainment: 50000,
      miscellaneous: 20000,
      contingency: 30000,
    }; // Total = 750,000 (250,000 remaining)

    const metrics = calculateBudgetMetrics(total, allocations);

    expect(metrics.allocatedTotal).toBe(750000);
    expect(metrics.remainingBalance).toBe(250000);
    expect(metrics.surplusAmount).toBe(250000);
    expect(metrics.overrunAmount).toBe(0);
    expect(metrics.isOverrun).toBe(false);
    expect(metrics.isBalanced).toBe(false);
    expect(metrics.statusText).toContain("₹2,50,000 remaining to allocate");
  });

  it("generates recommended allocations that sum to the exact total budget", () => {
    const testBudgets = [250000, 1000000, 3500000, 7500000, 123456];

    for (const budget of testBudgets) {
      const rec = getRecommendedAllocations(budget, "wedding");
      const sum =
        rec.venue +
        rec.catering +
        rec.decoration +
        rec.photography +
        rec.entertainment +
        rec.miscellaneous +
        rec.contingency;
      expect(sum).toBe(budget);
    }
  });

  it("formats Indian currency correctly with Indian numbering system commas", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(500)).toBe("₹500");
    expect(formatINR(1000)).toBe("₹1,000");
    expect(formatINR(50000)).toBe("₹50,000");
    expect(formatINR(100000)).toBe("₹1,00,000"); // 1 Lakh
    expect(formatINR(3500000)).toBe("₹35,00,000"); // 35 Lakhs
    expect(formatINR(10000000)).toBe("₹1,00,00,000"); // 1 Crore
  });

  it("formats short denominations for badges and charts", () => {
    expect(formatINRShort(500)).toBe("₹500");
    expect(formatINRShort(25000)).toBe("₹25k");
    expect(formatINRShort(250000)).toBe("₹2.5 Lakh");
    expect(formatINRShort(15000000)).toBe("₹1.5 Cr");
  });

  it("provides deterministic savings suggestions when categories are inflated", () => {
    const total = 1000000;
    const allocations: BudgetAllocations = {
      venue: 450000, // 45% (high)
      catering: 350000, // 35% (high)
      decoration: 200000, // 20% (high)
      photography: 150000,
      entertainment: 50000,
      miscellaneous: 20000,
      contingency: 30000,
    };

    const tips = generateDeterministicSavingsTips(total, allocations, "wedding");
    expect(tips.length).toBeGreaterThanOrEqual(3);
    const categoriesFound = tips.map((t) => t.category);
    expect(categoriesFound).toContain("venue");
    expect(categoriesFound).toContain("catering");
  });
});
