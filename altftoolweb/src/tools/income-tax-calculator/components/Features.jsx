"use client";

import {
  BadgeIndianRupee,
  BarChart3,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Percent,
  ReceiptIndianRupee,
  Scale,
} from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "Old vs New Regime",
    description:
      "Compare both regimes side by side with the latest slab structure, deductions, rebate, cess, and surcharge.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Deduction Planner",
    description:
      "Model standard deduction, 80C, 80D, HRA, NPS, home loan interest, and other deductions.",
  },
  {
    icon: ReceiptIndianRupee,
    title: "Rebate and Relief",
    description:
      "Applies 87A rebate, new-regime marginal relief around Rs 12 lakh, and senior-age old-regime slabs.",
  },
  {
    icon: Percent,
    title: "Surcharge and Cess",
    description:
      "Includes surcharge thresholds with marginal relief approximation and 4% health and education cess.",
  },
  {
    icon: BarChart3,
    title: "Slab Breakup",
    description:
      "See how much tax each slab contributes under the selected old or new regime.",
  },
  {
    icon: FileSpreadsheet,
    title: "Taxable Income Flow",
    description:
      "Review gross income, allowed deductions, taxable income, base tax, rebate, surcharge, cess, and net tax.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy Summary",
    description:
      "Copy a readable tax comparison summary for salary planning or advisor review.",
  },
  {
    icon: Download,
    title: "CSV Export",
    description:
      "Download the regime comparison and slab-wise calculation for spreadsheet records.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Income Tax Calculator?</h2>
        <p className="description mt-3">
          Estimate Indian individual income tax quickly and see which regime
          works better before declaring investments or planning salary.
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
