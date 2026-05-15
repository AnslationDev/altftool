"use client";

import {
  Braces,
  ClipboardCheck,
  Code2,
  Download,
  FileCode,
  Image,
  Link,
  Table2,
} from "lucide-react";

const features = [
  {
    icon: FileCode,
    title: "Clean HTML Parsing",
    description:
      "Paste full documents, fragments, article HTML, or exported CMS markup and convert it safely.",
  },
  {
    icon: Table2,
    title: "GFM Tables",
    description:
      "Preserve tables as GitHub Flavored Markdown instead of losing tabular content.",
  },
  {
    icon: Link,
    title: "Link Control",
    description:
      "Keep inline links, switch to referenced links, or strip anchors into plain text.",
  },
  {
    icon: Image,
    title: "Image Options",
    description:
      "Preserve image syntax with alt text, or remove images when building text-only docs.",
  },
  {
    icon: Code2,
    title: "Code Blocks",
    description:
      "Convert pre/code blocks into fenced Markdown with configurable fence style.",
  },
  {
    icon: Braces,
    title: "Raw and Preview Modes",
    description:
      "Review the generated Markdown as source or rendered output before downloading.",
  },
  {
    icon: ClipboardCheck,
    title: "One-Click Copy",
    description:
      "Copy Markdown, copy cleaned HTML, or load realistic samples for fast testing.",
  },
  {
    icon: Download,
    title: "Download .md",
    description:
      "Export the final Markdown as a file with readable front matter optionality.",
  },
];

export default function Features() {
  return (
    <section className="max-w-[1180px] mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="subheading">Why Use This HTML to Markdown Converter?</h2>
        <p className="description mt-3">
          Turn messy web markup into clean Markdown for docs, READMEs, CMS imports, and notes.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-(--card) border border-(--border) rounded-lg p-5"
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
