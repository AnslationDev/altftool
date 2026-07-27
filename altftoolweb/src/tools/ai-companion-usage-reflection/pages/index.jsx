"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle, RotateCcw } from "lucide-react";
import {
  DIMENSIONS,
  REFLECTION_ITEMS,
  RESPONSE_SCALE,
  scoreCompanionReflection,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const defaultResponses = Object.fromEntries(REFLECTION_ITEMS.map((item) => [item.id, 1]));

export default function ToolHome() {
  const [dailyMinutes, setDailyMinutes] = useState("25");
  const [responses, setResponses] = useState(defaultResponses);

  const result = useMemo(
    () => scoreCompanionReflection({ responses, dailyMinutes: Number(dailyMinutes) }),
    [responses, dailyMinutes],
  );

  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "AI Companion Usage Reflection",
      `Overall: ${result.overall}% (${result.band.label})`,
      ...result.dimensions
        .filter((dimension) => dimension.rated)
        .map((dimension) => `${dimension.label}: ${dimension.percent}%`),
      `Chat time: ${dailyMinutes} minutes a day (${result.weeklyHours} hours a week)`,
      `Share of a 16-hour waking day: ${result.shareOfWaking}%`,
    ].join("\n");
  }, [result, dailyMinutes]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDailyMinutes("25");
    setResponses(defaultResponses);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Private reflection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Companion Usage Reflection</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A non-clinical worksheet for noticing whether AI chat is still a tool, or has become part of your daily routine.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className="text-sm font-semibold" htmlFor="daily-minutes">Typical AI chat minutes per day</label>
        <input
          id="daily-minutes"
          className={`mt-2 ${INPUT_CLASS}`}
          type="number"
          min="0"
          max="1440"
          value={dailyMinutes}
          onChange={(event) => setDailyMinutes(event.target.value)}
        />
        <div className="mt-5 space-y-5">
          {DIMENSIONS.map((dimension) => (
            <fieldset key={dimension.id} className="rounded-lg border border-[var(--border)] p-4">
              <legend className="px-1 text-sm font-semibold">{dimension.label}</legend>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">{dimension.blurb}</p>
              <div className="space-y-3">
                {REFLECTION_ITEMS.filter((item) => item.dimension === dimension.id).map((item) => (
                  <label key={item.id} className="grid gap-2 text-sm sm:grid-cols-[1fr_11rem] sm:items-center">
                    <span>{item.text}</span>
                    <select
                      className={INPUT_CLASS}
                      value={responses[item.id]}
                      onChange={(event) =>
                        setResponses((previous) => ({ ...previous, [item.id]: Number(event.target.value) }))
                      }
                    >
                      {RESPONSE_SCALE.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {result.error ? (
          <p role="alert" className="text-sm font-semibold text-[var(--danger)]">{result.error}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Overall</p>
              <p className="text-3xl font-semibold">{result.overall}%</p>
              <p className="text-sm text-[var(--muted-foreground)]">{result.band.label}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Top signal</p>
              <p className="text-lg font-semibold">{result.topDimension.label}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{result.topDimension.percent}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Weekly time</p>
              <p className="text-lg font-semibold">{result.weeklyHours} h</p>
              <p className="text-sm text-[var(--muted-foreground)]">{result.shareOfWaking}% of waking day</p>
            </div>
            <p className="sm:col-span-3 text-sm leading-6 text-[var(--muted-foreground)]">{result.band.guidance}</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={`${GHOST_BTN} disabled:opacity-50`}
            onClick={copyResult}
            disabled={Boolean(result.error)}
            aria-label="Copy the reflection summary"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset every answer">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
          </button>
        </div>
      </section>
    </main>
  );
}
