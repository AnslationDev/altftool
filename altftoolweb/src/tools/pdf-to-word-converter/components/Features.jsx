"use client";

import {
  ClipboardCheck,
  FileText,
  FileType,
  LayoutTemplate,
  Lock,
  ScanText,
  SlidersHorizontal,
  TableProperties,
} from "lucide-react";

const features = [
  {
    icon: FileType,
    title: "Editable DOCX Export",
    description:
      "Creates a real Word document from embedded PDF text, ready for editing in Word, Docs, or Pages.",
  },
  {
    icon: SlidersHorizontal,
    title: "Page Range Control",
    description:
      "Convert the full PDF or specific pages with flexible ranges like 1-3, 6, 9-12.",
  },
  {
    icon: LayoutTemplate,
    title: "Layout Modes",
    description:
      "Choose a flowing editable document or page-by-page output with headings and page breaks.",
  },
  {
    icon: ScanText,
    title: "Smart Text Cleanup",
    description:
      "Groups PDF text runs into lines and paragraphs, with optional heading detection for cleaner documents.",
  },
  {
    icon: TableProperties,
    title: "Conversion Report",
    description:
      "Includes page, word, line, and scanned-page signals so users know what was extracted.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy and TXT Export",
    description:
      "Copy extracted text or download a plain text backup before generating the DOCX file.",
  },
  {
    icon: Lock,
    title: "Browser-Side Privacy",
    description:
      "The file is processed locally in the browser; no upload is required for conversion.",
  },
  {
    icon: FileText,
    title: "Preview Before Download",
    description:
      "Inspect extracted text page by page before exporting the final Word document.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This PDF to Word Converter?</h2>
        <p className="description mt-3">
          Turn text-based PDFs into editable Word drafts with control over pages,
          cleanup, preview, and downloadable fallbacks.
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
