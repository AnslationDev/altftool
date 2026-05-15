"use client";

import {
  Archive,
  FileOutput,
  FileSpreadsheet,
  FileText,
  Lock,
  Presentation,
  Rows3,
  Settings2,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Word to PDF",
    description:
      "Read DOCX files, preserve readable paragraphs and headings, then export a clean PDF.",
  },
  {
    icon: Presentation,
    title: "PPT to PDF",
    description:
      "Extract PPTX slides and convert each slide into a landscape PDF page.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel to PDF",
    description:
      "Convert XLSX, XLS, and CSV sheets into paginated PDF tables with sheet headings.",
  },
  {
    icon: Rows3,
    title: "Batch Queue",
    description:
      "Upload multiple documents, preview parsed content, and download one PDF or a ZIP.",
  },
  {
    icon: Settings2,
    title: "PDF Controls",
    description:
      "Choose page size, orientation, margins, table density, cover page, and row limits.",
  },
  {
    icon: FileOutput,
    title: "Smart Preview",
    description:
      "Inspect Word text, spreadsheet rows, and slide outlines before conversion.",
  },
  {
    icon: Archive,
    title: "ZIP Export",
    description:
      "When converting many documents, all PDFs are bundled into a single ZIP.",
  },
  {
    icon: Lock,
    title: "Browser-Side",
    description:
      "Files are parsed locally in the browser without requiring server upload.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Document to PDF Converter?</h2>
        <p className="description mt-3">
          Convert office documents into PDF with batch processing, previews,
          table controls, slide pages, and local browser-side privacy.
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
