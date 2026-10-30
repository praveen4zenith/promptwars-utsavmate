import { EventPlan } from "./types";

const STORAGE_KEY = "utsavmate_current_plan_v1";

/**
 * Saves current EventPlan to browser localStorage.
 */
export function savePlanToLocalStorage(plan: EventPlan): void {
  if (typeof window === "undefined") return;
  try {
    const updatedPlan: EventPlan = {
      ...plan,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlan));
  } catch (error) {
    console.error("Failed to save plan to localStorage:", error);
  }
}

/**
 * Retrieves the saved EventPlan from localStorage.
 */
export function loadPlanFromLocalStorage(): EventPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) return null;
    return JSON.parse(item) as EventPlan;
  } catch (error) {
    console.error("Failed to load plan from localStorage:", error);
    return null;
  }
}

/**
 * Clears the stored event plan.
 */
export function clearPlanFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage plan:", error);
  }
}

/**
 * Triggers a browser download of the current event plan as a JSON file.
 */
export function exportPlanToJsonFile(plan: EventPlan): void {
  if (typeof window === "undefined") return;
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(plan, null, 2));
  const downloadAnchor = document.createElement("a");
  const filename = `${plan.eventDetails.eventName.replace(/[^a-zA-Z0-9]/g, "_")}_UtsavMate_Plan.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
