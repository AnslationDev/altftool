"use client";

import { useMemo, useState } from "react";
import { Clipboard, Languages, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const sampleText = "build better tools with AltFTool";

const words = (value) =>
  value
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

const titleCase = (value) =>
  words(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const sentenceCase = (value) => {
  const lower = value.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
};

function ResultCard({ label, value, onCopy }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
        <button type="button" onClick={() => onCopy(value)} className="rounded-md p-2 hover:bg-[var(--muted)]">
          <Clipboard className="h-4 w-4" />
        </button>
      </div>
      <p className="break-words font-mono text-sm leading-6 text-[var(--foreground)]">{value || " "}</p>
    </div>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(sampleText);
  const [copied, setCopied] = useState("");

  const results = useMemo(() => {
    const list = words(text);
    return [
      ["Uppercase", text.toUpperCase()],
      ["Lowercase", text.toLowerCase()],
      ["Sentence case", sentenceCase(text)],
      ["Title Case", titleCase(text)],
      ["camelCase", list.map((word, index) => (index ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase())).join("")],
      ["PascalCase", list.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("")],
      ["snake_case", list.map((word) => word.toLowerCase()).join("_")],
      ["kebab-case", list.map((word) => word.toLowerCase()).join("-")],
    ];
  }, [text]);

  const copyValue = async (label, value) => {
    setCopied((await safeCopyText(value)) ? label : "");
    setTimeout(() => setCopied(""), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Languages className="h-4 w-4" />
            Text transformation
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Text Case Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert text into common writing and developer naming formats in one clean workspace.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Source text</h2>
            <button type="button" onClick={() => setText(sampleText)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--muted)]">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
          <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-36 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 outline-none focus:border-[var(--primary)]" />
          {copied && <p className="mt-3 text-sm font-semibold text-green-600">{copied} copied</p>}
        </section>

        <section className="tool-card-grid">
          {results.map(([label, value]) => (
            <ResultCard key={label} label={label} value={value} onCopy={(nextValue) => copyValue(label, nextValue)} />
          ))}
        </section>
      </div>
    </main>
  );
}
