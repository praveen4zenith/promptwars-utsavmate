import { describe, it, expect } from "vitest";
import { EventFormData } from "../lib/types";

export function validateEventForm(data: Partial<EventFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.eventName || data.eventName.trim().length === 0) {
    errors.eventName = "Event celebration name is required.";
  }

  if (!data.hostName || data.hostName.trim().length === 0) {
    errors.hostName = "Celebrant / Host name is required.";
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.city = "City / Location is required.";
  }

  if (!data.date) {
    errors.date = "Event date is required.";
  }

  if (!data.guestCount || data.guestCount < 1) {
    errors.guestCount = "Guest count must be at least 1.";
  } else if (data.guestCount > 10000) {
    errors.guestCount = "Guest count cannot exceed 10,000 for standard planning.";
  }

  if (!data.totalBudget || data.totalBudget < 10000) {
    errors.totalBudget = "Total budget must be at least ₹10,000.";
  } else if (data.totalBudget > 500000000) {
    errors.totalBudget = "Total budget exceeds maximum allowed limit.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

describe("Event Form Input Validation", () => {
  it("passes with valid complete form data", () => {
    const validData: EventFormData = {
      eventType: "wedding",
      eventName: "Royal Vivah Celebration",
      hostName: "Priya & Amit",
      city: "New Delhi",
      date: "2026-11-20",
      guestCount: 250,
      totalBudget: 1500000,
      theme: "Royal Marigold",
      priorities: ["Catering", "Decor"],
      dietaryNeeds: ["Pure Veg"],
      specialRequirements: "Wheelchair accessible",
    };

    const result = validateEventForm(validData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it("fails when required fields are missing", () => {
    const incompleteData: Partial<EventFormData> = {
      eventType: "wedding",
      eventName: "",
      city: "",
      date: "",
      guestCount: 0,
      totalBudget: 0,
    };

    const result = validateEventForm(incompleteData);
    expect(result.isValid).toBe(false);
    expect(result.errors.eventName).toBeDefined();
    expect(result.errors.city).toBeDefined();
    expect(result.errors.date).toBeDefined();
    expect(result.errors.guestCount).toBeDefined();
    expect(result.errors.totalBudget).toBeDefined();
  });

  it("flags budget below minimum threshold", () => {
    const lowBudgetData: Partial<EventFormData> = {
      eventName: "Birthday Bash",
      city: "Pune",
      date: "2026-12-01",
      guestCount: 20,
      totalBudget: 5000, // Below 10k
    };

    const result = validateEventForm(lowBudgetData);
    expect(result.isValid).toBe(false);
    expect(result.errors.totalBudget).toContain("at least ₹10,000");
  });
});
