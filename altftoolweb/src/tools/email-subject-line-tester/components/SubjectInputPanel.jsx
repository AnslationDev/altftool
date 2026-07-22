"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, ClipboardPaste } from "lucide-react";
import Card from "./ui/Card";

const SAMPLE_SUBJECTS = [
  "{FirstName}, your cart is waiting — 20% off ends tonight",
  "FREE!!! Claim your $$$ CASH BONUS now!!!",
  "Quick question about your onboarding",
  "3 ways to cut your AWS bill this quarter",
  "Why most welcome emails get ignored (and how to fix it)",
  "Your November invoice is ready",
];

export default function SubjectInputPanel({ subject, onChange }) {
  const textareaRef = useRef(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const chars = subject.length;
  const words = subject.trim() ? subject.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [subject]);

  function handleSample() {
    onChange(SAMPLE_SUBJECTS[sampleIndex % SAMPLE_SUBJECTS.length]);
    setSampleIndex((i) => i + 1);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // Clipboard permission denied or unsupported — the textarea still accepts a native Ctrl/Cmd+V paste.
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="subject-line-input" className="text-sm font-semibold text-(--foreground)">
          Subject line
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-(--primary) hover:text-(--primary)"
          >
            <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" /> Paste
          </button>
          <button
            type="button"
            onClick={handleSample}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-(--primary) hover:text-(--primary)"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Try an example
          </button>
          {subject && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear subject line"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-danger hover:text-danger"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        id="subject-line-input"
        ref={textareaRef}
        value={subject}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        placeholder="Type or paste your email subject line…"
        maxLength={300}
        className="w-full resize-none overflow-hidden rounded-xl border-2 border-(--border) bg-(--background) p-4 text-base leading-relaxed text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-4 focus:ring-(--primary)/15"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-(--muted-foreground)">
        <span>
          {chars} characters · {words} word{words === 1 ? "" : "s"}
        </span>
        <span className={chars > 60 ? "font-medium text-warning" : ""}>
          {chars > 60 ? "Likely to truncate on most inboxes" : "Live analysis updates as you type"}
        </span>
      </div>
    </Card>
  );
}
