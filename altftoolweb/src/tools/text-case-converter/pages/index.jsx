"use client";

import { useMemo, useState } from "react";
import { Clipboard, FileDown, Languages, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const sampleText = "build better tools with AltFTool";
const HEADLINE_SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "per", "the", "to", "vs", "via", "with"]);

const words = (value) =>
  value
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

const titleCase = (value) =>
  words(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const headlineCase = (value) =>
  words(value)
    .map((word, index, list) => {
      const lower = word.toLowerCase();
      if (index > 0 && index < list.length - 1 && HEADLINE_SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

const sentenceCase = (value) => {
  const lower = value.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
};

function downloadTextFile(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ResultCard({ label, value, onCopy }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
        <button type="button" onClick={() => onCopy(value)} aria-label={`Copy ${label} result`} className="flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 hover:bg-[var(--muted)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 sm:min-h-9 sm:min-w-9">
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
    const lowerWords = list.map((word) => word.toLowerCase());
    const pascal = list.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
    return [
      ["Uppercase", text.toUpperCase()],
      ["Lowercase", text.toLowerCase()],
      ["Sentence case", sentenceCase(text)],
      ["Title Case", titleCase(text)],
      ["Headline Case", headlineCase(text)],
      ["camelCase", list.map((word, index) => (index ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase())).join("")],
      ["PascalCase", pascal],
      ["CONSTANT_CASE", lowerWords.join("_").toUpperCase()],
      ["snake_case", lowerWords.join("_")],
      ["kebab-case", lowerWords.join("-")],
      ["slug-case", lowerWords.join("-").replace(/-+/g, "-")],
      ["dot.case", lowerWords.join(".")],
      ["path/case", lowerWords.join("/")],
      ["Inverse Case", Array.from(text).map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())).join("")],
      ["Alternating Case", Array.from(text).map((char, index) => (index % 2 ? char.toUpperCase() : char.toLowerCase())).join("")],
    ];
  }, [text]);

  const allFormats = useMemo(
    () => results.map(([label, value]) => `${label}: ${value}`).join("\n"),
    [results],
  );

  const copyValue = async (label, value) => {
    setCopied((await safeCopyText(value)) ? label : "");
    setTimeout(() => setCopied(""), 1000);
  };

  const copyAll = async () => {
    setCopied((await safeCopyText(allFormats)) ? "All formats" : "");
    setTimeout(() => setCopied(""), 1000);
  };

  const downloadAll = () => {
    downloadTextFile("altftool-text-cases.txt", allFormats);
  };

  const resetText = () => {
    const hasContentToLose = text.trim() !== "" && text !== sampleText;
    if (hasContentToLose && !window.confirm("Reset will replace your current text with the sample text. Continue?")) {
      return;
    }
    setText(sampleText);
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
            <button type="button" onClick={resetText} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 sm:min-h-10">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
          <textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="Source text to convert" className="min-h-36 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 outline-none transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copyAll} className="btn-primary min-h-11 px-3 py-2 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 sm:min-h-10">
              <Clipboard className="h-4 w-4" />
              Copy all formats
            </button>
            <button type="button" onClick={downloadAll} className="btn-secondary min-h-11 px-3 py-2 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 sm:min-h-10">
              <FileDown className="h-4 w-4" />
              Download formats
            </button>
          </div>
          {copied && (
            <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold text-green-600">
              {copied} copied
            </p>
          )}
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
