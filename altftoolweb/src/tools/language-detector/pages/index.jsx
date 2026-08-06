"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Languages,
  Copy,
  Sparkles,
  CircleAlert,
  BarChart3,
} from "lucide-react";
import { detectLanguage } from "../utils/detect";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const SAMPLE = "Bonjour, comment allez-vous aujourd'hui ?";

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(() => detectLanguage(text), [text]);
  const copied = isCopied("result");

  const copyResult = useCallback(async () => {
    if (!result.candidates.length) return;
    const summary = result.candidates
      .map((c) => `${c.lang} (${c.confidence}%)`)
      .join(", ");
    await copy("result", summary, { label: "Detected language results" });
  }, [result.candidates, copy]);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border border-(--border) bg-(--card) p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--muted) text-(--primary)">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--foreground) leading-none">
                Language Detector
              </h1>
              <p className="text-xs text-(--muted-foreground) mt-1.5 max-w-xl leading-relaxed">
                Detect the language of any text with a confidence score, script detection,
                character statistics, and support for mixed-language input.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-(--muted-foreground)">
            {["Runs locally", "No upload", "Script-aware"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--background) px-2 py-1"
              >
                <Sparkles className="h-3 w-3 text-(--primary)" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label
                htmlFor="language-detector-text"
                className="text-xs font-bold text-(--foreground) uppercase tracking-wider"
              >
                Text to analyze
              </label>
              <button
                onClick={() => setText(SAMPLE)}
                className="text-[10px] font-bold text-(--primary) hover:underline px-2 py-1 bg-(--muted) rounded"
              >
                Load sample
              </button>
            </div>
            <textarea
              id="language-detector-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text in any language…"
              rows={9}
              className="mt-3 w-full rounded-xl border border-(--border) bg-(--background) p-4 text-sm leading-relaxed text-(--foreground) outline-none focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,0.25)] transition"
            />
            {result.stats && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Characters", result.stats.length],
                  ["Words", result.stats.words],
                  ["Unique", result.stats.uniqueChars],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg border border-(--border) bg-(--background) p-2">
                    <p className="text-lg font-bold text-(--foreground)">{val}</p>
                    <p className="text-[10px] text-(--muted-foreground)">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-(--foreground) uppercase tracking-wider">
                <BarChart3 size={16} className="text-(--primary)" />
                Detection results
              </label>
              <button
                onClick={copyResult}
                disabled={!result.candidates.length}
                aria-label={copied ? "Copied detected language results to clipboard" : "Copy detected language results"}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-(--foreground) bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 hover:border-(--primary) transition disabled:opacity-40"
              >
                {copied ? <Sparkles size={12} className="text-(--primary)" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {announcement}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {result.candidates.length === 0 ? (
                <p className="py-8 text-center text-xs italic text-(--muted-foreground)">
                  {result.stats
                    ? "No language patterns detected — this text may be numbers, symbols, or too short to score."
                    : "Type some text to detect its language."}
                </p>
              ) : (
                result.candidates.map((c, idx) => (
                  <div
                    key={c.lang}
                    className={`rounded-xl border p-3 ${
                      idx === 0
                        ? "border-(--primary) bg-(--muted)"
                        : "border-(--border) bg-(--background)"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <span className="rounded bg-(--primary) px-1.5 py-0.5 text-[9px] font-bold uppercase text-(--primary-foreground)">
                            Best
                          </span>
                        )}
                        <span className="text-sm font-bold text-(--foreground)">{c.lang}</span>
                        <span className="text-[10px] text-(--muted-foreground)">({c.script})</span>
                      </div>
                      <span className="text-sm font-bold text-(--primary)">{c.confidence}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-(--background)">
                      <div
                        className="h-full rounded-full bg-(--primary) transition-all"
                        style={{ width: `${c.confidence}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {result.scripts.length > 1 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-(--muted) p-3 text-[11px] text-(--muted-foreground)">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary)" />
                Multiple scripts detected — this text may be mixed-language
                ({result.scripts.map((s) => s.name).join(", ")}).
              </div>
            )}
          </div>
        </div>

        {/* Scripts + stats */}
        {result.scripts.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-bold text-(--foreground) uppercase tracking-wider">
                <Languages size={16} className="text-(--primary)" />
                Detected scripts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.scripts.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-semibold text-(--foreground)"
                  >
                    {s.name} · {Math.round(s.ratio * 100)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-bold text-(--foreground) uppercase tracking-wider">
                <BarChart3 size={16} className="text-(--primary)" />
                Character statistics
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <p className="text-[10px] uppercase tracking-wide text-(--muted-foreground)">Letters</p>
                  <p className="font-bold text-(--foreground)">{result.stats?.letters ?? 0}</p>
                </div>
                <div className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <p className="text-[10px] uppercase tracking-wide text-(--muted-foreground)">Non-space chars</p>
                  <p className="font-bold text-(--foreground)">{result.stats?.uniqueChars ?? 0} unique</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
