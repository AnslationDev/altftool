"use client";

import { useMemo, useState } from "react";
import { Clipboard, Quote } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const wordBank = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "integer",
  "mattis",
  "velit",
  "vitae",
  "urna",
  "facilisis",
  "porta",
  "nibh",
  "curabitur",
  "fermentum",
  "mauris",
  "placerat",
  "aliquam",
  "sodales",
  "magna",
  "tempor",
  "praesent",
  "rhoncus",
  "semper",
  "massa",
  "vivamus",
  "dapibus",
];

function sentence(seed, length = 12) {
  const words = Array.from({ length }, (_, index) => wordBank[(seed + index * 3) % wordBank.length]);
  const text = words.join(" ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function generate(count, type, startClassic) {
  if (type === "words") return Array.from({ length: count }, (_, index) => wordBank[index % wordBank.length]).join(" ");
  if (type === "sentences") return Array.from({ length: count }, (_, index) => sentence(index, 10 + (index % 7))).join(" ");
  const paragraphs = Array.from({ length: count }, (_, paragraphIndex) =>
    Array.from({ length: 4 }, (_, index) => sentence(paragraphIndex * 5 + index, 10 + ((paragraphIndex + index) % 8))).join(" "),
  );
  if (startClassic && paragraphs.length) paragraphs[0] = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${paragraphs[0]}`;
  return paragraphs.join("\n\n");
}

export default function ToolHome() {
  const [type, setType] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => generate(count, type, startClassic), [count, startClassic, type]);

  const copyOutput = async () => {
    setCopied(await safeCopyText(output));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Quote className="h-4 w-4" />
            Placeholder copy
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Lorem Ipsum Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Generate structured placeholder content for wireframes, designs, and content layouts.
          </p>
        </section>

        <section className="grid items-start gap-6 2xl:grid-cols-[340px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Output type</span>
              <select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]">
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Count</span>
              <input type="number" min="1" max="50" value={count} onChange={(event) => setCount(Math.max(1, Math.min(50, Number(event.target.value))))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            </label>
            <label className="mt-5 flex items-center gap-3 rounded-lg bg-[var(--muted)] p-3 text-sm font-semibold">
              <input type="checkbox" checked={startClassic} onChange={(event) => setStartClassic(event.target.checked)} />
              Start with classic lorem ipsum
            </label>
            <button type="button" onClick={copyOutput} className="btn-primary mt-5 w-full">
              <Clipboard className="h-4 w-4" />
              {copied ? "Copied" : "Copy output"}
            </button>
          </div>

          <pre className="max-h-[560px] min-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-7 shadow-[var(--anslation-ds-shadow-sm)] sm:min-h-[380px]">
            {output}
          </pre>
        </section>
      </div>
    </main>
  );
}
