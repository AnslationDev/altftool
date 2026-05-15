"use client";

import { useMemo, useState } from "react";
import { Clipboard, RotateCcw, Text } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const sampleText =
  "AltFTool helps teams move faster with focused digital utilities. Paste any draft here to measure its length, reading time, and structure.";

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(sampleText);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.match(/\b[\w'-]+\b/g)?.length || 0 : 0;
    const characters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((item) => item.trim()).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter((item) => item.trim()).length : 0;
    const readingMinutes = Math.max(1, Math.ceil(words / 225));
    return { words, characters, noSpaces, sentences, paragraphs, readingMinutes };
  }, [text]);

  const copySummary = async () => {
    setCopied(
      await safeCopyText(
      `Words: ${stats.words}\nCharacters: ${stats.characters}\nCharacters without spaces: ${stats.noSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nReading time: ${stats.readingMinutes} min`,
      ),
    );
    setTimeout(() => setCopied(false), 1000);
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
              <Stat label="Read time" value={`${stats.readingMinutes} min`} />
            </div>
            <button type="button" onClick={copySummary} className="btn-primary mt-5 w-full">
              <Clipboard className="h-4 w-4" />
              {copied ? "Copied summary" : "Copy summary"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
