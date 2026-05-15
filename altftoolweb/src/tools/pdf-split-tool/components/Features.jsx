"use client";

import {
  Archive,
  FileDown,
  FileStack,
  FileText,
  Layers,
  Lock,
  Scissors,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    icon: Scissors,
    title: "Split Every Page",
    description:
      "Turn each PDF page into its own file, then download everything as a ZIP.",
  },
  {
    icon: Layers,
    title: "Fixed Page Batches",
    description:
      "Create grouped PDFs automatically, such as every 2, 5, or 10 pages.",
  },
  {
    icon: FileStack,
    title: "Custom Range Groups",
    description:
      "Use groups like 1-3; 4,6; 7-10 to create precise output files.",
  },
  {
    icon: FileDown,
    title: "Extract or Remove",
    description:
      "Export selected pages into one PDF or remove selected pages from the file.",
  },
  {
    icon: Archive,
    title: "ZIP Export",
    description:
      "Multiple output PDFs are packaged into a clean ZIP with predictable names.",
  },
  {
    icon: SlidersHorizontal,
    title: "Live Split Plan",
    description:
      "Preview output count, page ranges, and total exported pages before processing.",
  },
  {
    icon: Lock,
    title: "Local Processing",
    description:
      "Splitting happens in the browser, so the PDF does not need to be uploaded.",
  },
  {
    icon: FileText,
    title: "Copy Plan",
    description:
      "Copy the split plan summary for records, QA, or repeatable workflows.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This PDF Split Tool?</h2>
        <p className="description mt-3">
          Split PDFs with exact control over page groups, extracted pages, batch
          size, filenames, ZIP output, and local processing.
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
