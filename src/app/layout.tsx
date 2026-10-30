import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UtsavMate AI | Indian Celebration & Event Planner",
  description:
    "AI-powered celebration planner for Indian weddings, birthdays, and community festivals. Realistic INR budgets, preparation timelines, vendor questions, and day-of schedules.",
  keywords: [
    "Indian wedding planner",
    "birthday planner India",
    "event budget calculator INR",
    "wedding checklist India",
    "festival planner",
    "UtsavMate",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAF8F5] text-slate-800 selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
