"use client";

import {
  FileText,
  Search,
  ClipboardCheck,
  Download,
  Printer,
  Clock,
  Zap,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Instant Text Extraction",
    description:
      "Pulls all selectable text from your PDF in seconds, page by page, with a live progress indicator.",
  },
  {
    icon: Zap,
    title: "Multiple Summary Modes",
    description:
      "Choose short, medium, detailed, bullet-point, or executive summaries to match your needs.",
  },
  {
    icon: Search,
    title: "Search Inside PDF",
    description:
      "Find any keyword inside the extracted text with highlighted matches and page detection.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy & Download",
    description:
      "Copy summaries to your clipboard or download them as a clean text file in one click.",
  },
  {
    icon: Printer,
    title: "Print-Ready Output",
    description:
      "Print the summary directly from your browser with a clean, distraction-free layout.",
  },
  {
    icon: Clock,
    title: "Reading Time Estimate",
    description:
      "Get an instant estimate of how long the summary will take to read at average speed.",
  },
  {
    icon: Lock,
    title: "Browser-Side Privacy",
    description:
      "Everything runs locally in your browser — no files are uploaded to any server.",
  },
  {
    icon: Download,
    title: "Word Count & Keywords",
    description:
      "See the word count, detected keywords, and key concepts extracted from your document.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This PDF Summarizer?</h2>
        <p className="description mt-3">
          Quickly extract and summarise PDF content with full privacy, multiple
          output modes, and a clean, professional interface.
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
