"use client";

import { useMemo, useState } from "react";
import { Clipboard, FileDown, RotateCcw, Text } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const sampleText =
  "AltFTool helps teams move faster with focused digital utilities. Paste any draft here to measure its length, reading time, and structure.";
const COMMON_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "your",
]);

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

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

export default function ToolHome() {
  const [text, setText] = useState(sampleText);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const wordList = trimmed ? trimmed.match(/\b[\w'-]+\b/g) || [] : [];
    const words = wordList.length;
    const characters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((item) => item.trim()).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter((item) => item.trim()).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const readingMinutes = Math.max(1, Math.ceil(words / 225));
    const speakingMinutes = Math.max(1, Math.ceil(words / 150));
    const averageWordLength = words
      ? (wordList.reduce((sum, word) => sum + word.length, 0) / words).toFixed(1)
      : "0";
    const longestWord = wordList.reduce((longest, word) => (word.length > longest.length ? word : longest), "");
    const frequency = new Map();

    wordList.forEach((word) => {
      const normalized = word.toLowerCase().replace(/^'|'$/g, "");
      if (normalized.length < 3 || COMMON_WORDS.has(normalized)) return;
      frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    });

    const topWords = [...frequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8);

    return {
      averageWordLength,
      characters,
      lines,
      longestWord,
      noSpaces,
      paragraphs,
      readingMinutes,
      sentences,
      speakingMinutes,
      topWords,
      words,
    };
  }, [text]);

  const summary = `Words: ${stats.words}
Characters: ${stats.characters}
Characters without spaces: ${stats.noSpaces}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading time: ${stats.readingMinutes} min
Speaking time: ${stats.speakingMinutes} min
Average word length: ${stats.averageWordLength}
Longest word: ${stats.longestWord || "None"}
Top terms: ${stats.topWords.map(([word, count]) => `${word} (${count})`).join(", ") || "None"}`;

  const copySummary = async () => {
    setCopied(await safeCopyText(summary));
    setTimeout(() => setCopied(false), 1000);
  };

  const downloadSummary = () => {
    downloadTextFile("altftool-text-report.txt", `${summary}\n\n--- Source text ---\n${text}`);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Text className="h-4 w-4" />
            Writing utility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Word & Character Counter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Measure copy length, reading time, and structure for posts, pages, emails, and briefs.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Text input</h2>
              <button type="button" onClick={() => setText(sampleText)} className="btn-secondary min-h-10 px-3 py-2">
                <RotateCcw className="h-4 w-4" />
                Sample
              </button>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-[430px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 outline-none focus:border-[var(--primary)]"
              placeholder="Paste or type your text..."
            />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="tool-card-grid">
              <Stat label="Words" value={stats.words} />
              <Stat label="Characters" value={stats.characters} />
              <Stat label="No spaces" value={stats.noSpaces} />
              <Stat label="Sentences" value={stats.sentences} />
              <Stat label="Paragraphs" value={stats.paragraphs} />
              <Stat label="Lines" value={stats.lines} />
              <Stat label="Read time" value={`${stats.readingMinutes} min`} />
              <Stat label="Speak time" value={`${stats.speakingMinutes} min`} />
              <Stat label="Avg word" value={stats.averageWordLength} />
              <Stat label="Longest" value={stats.longestWord || "-"} />
            </div>
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Top terms</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.topWords.length ? (
                  stats.topWords.map(([word, count]) => (
                    <span key={word} className="rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)]">
                      {word} <span className="text-[var(--muted-foreground)]">{count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--muted-foreground)]">Type more text to see repeated terms.</span>
                )}
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={copySummary} className="btn-primary w-full">
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied summary" : "Copy summary"}
              </button>
              <button type="button" onClick={downloadSummary} className="btn-secondary w-full">
                <FileDown className="h-4 w-4" />
                Download report
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
