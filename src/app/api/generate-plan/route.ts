import { NextRequest, NextResponse } from "next/server";
import { generateEventPlanWithGemini } from "@/lib/gemini";
import { EventFormData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData: EventFormData = body.formData;

    if (!formData) {
      return NextResponse.json(
        { error: "Missing formData in request body." },
        { status: 400 }
      );
    }

    // Server-side validation
    if (!formData.eventName || formData.eventName.trim().length === 0) {
      return NextResponse.json(
        { error: "Event name is required." },
        { status: 400 }
      );
    }

    if (!formData.city || formData.city.trim().length === 0) {
      return NextResponse.json(
        { error: "City / Location is required." },
        { status: 400 }
      );
    }

    if (!formData.guestCount || formData.guestCount < 1) {
      return NextResponse.json(
        { error: "Guest count must be at least 1." },
        { status: 400 }
      );
    }

    if (!formData.totalBudget || formData.totalBudget < 10000) {
      return NextResponse.json(
        { error: "Total budget must be at least ₹10,000." },
        { status: 400 }
      );
    }

    const result = await generateEventPlanWithGemini(formData);

    return NextResponse.json({
      success: true,
      plan: result.plan,
      isDemoMode: result.isDemoMode,
      message: result.message,
    });
  } catch (error: any) {
    console.error("API /api/generate-plan error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate event plan.",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
