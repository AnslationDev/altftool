"use client";

import {
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Download,
  Gauge,
  IndianRupee,
  Percent,
  TrendingDown,
} from "lucide-react";

const features = [
  {
    icon: IndianRupee,
    title: "Monthly SWP Projection",
    description:
      "Simulate corpus, monthly withdrawals, annual step-up, and end balance across the full tenure.",
  },
  {
    icon: TrendingDown,
    title: "Depletion Risk",
    description:
      "See whether the corpus survives the chosen period or when it may run out.",
  },
  {
    icon: Gauge,
    title: "Safe Withdrawal Estimate",
    description:
      "Binary-search estimate of the highest first-month withdrawal that can last the selected tenure.",
  },
  {
    icon: Percent,
    title: "Tax Estimate",
    description:
      "Optional gain-tax approximation based on embedded portfolio gains and the selected tax rate.",
  },
  {
    icon: BarChart3,
    title: "Return Scenarios",
    description:
      "Compare conservative, expected, and optimistic return paths side by side.",
  },
  {
    icon: CalendarClock,
    title: "Yearly Schedule",
    description:
      "Review opening corpus, withdrawals, estimated tax, returns earned, and closing corpus by year.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy Summary",
    description:
      "Copy a clean SWP summary for planning notes, advisor discussions, or client reports.",
  },
  {
    icon: Download,
    title: "CSV Export",
    description:
      "Export the annual schedule for spreadsheet review or long-term retirement planning.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This SWP Calculator?</h2>
        <p className="description mt-3">
          Test monthly income plans against return, inflation, tax, and longevity
          assumptions before relying on the corpus.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-(--border) bg-(--card) p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
