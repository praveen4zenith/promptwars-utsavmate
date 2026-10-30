import { NextRequest, NextResponse } from "next/server";
import { getSavingsSuggestions } from "@/lib/gemini";
import { sanitizeCurrencyInput } from "@/lib/budgetEngine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { totalBudget, allocations, eventType } = body;

    const safeBudget = sanitizeCurrencyInput(totalBudget);
    if (safeBudget <= 0 || !allocations) {
      return NextResponse.json(
        { error: "Invalid totalBudget or allocations provided." },
        { status: 400 }
      );
    }

    const tips = await getSavingsSuggestions(
      safeBudget,
      allocations,
      eventType || "wedding"
    );

    return NextResponse.json({
      success: true,
      tips,
    });
  } catch (error: any) {
    console.error("API /api/savings-tips error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch savings recommendations.",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
