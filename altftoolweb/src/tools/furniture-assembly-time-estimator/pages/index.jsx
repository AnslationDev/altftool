"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import {
  EXPERIENCE_LEVELS,
  ITEM_PRESETS,
  LEARNING_RATE_PCT,
  TEAM_EFFICIENCY,
  TOOL_LEVELS,
  estimateAssembly,
  formatDuration,
  toolChecklist,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");

/** Describe a finish-time day offset, e.g. 0 -> "", 1 -> " the next day", 3 -> " 3 days later". */
const dayOffsetLabel = (offset) => {
  const n = Number(offset);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n === 1) return " the next day";
  return ` ${n} days later`;
};

const DEFAULTS = {
  item: "bookshelf",
  parts: "12",
  fasteners: "20",
  cams: "16",
  dowels: "20",
  quantity: "1",
  experience: "occasional",
  tools: "handtools",
  people: "1",
  startTime: "10:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyItem = (event) => {
    const id = event.target.value;
    const preset = ITEM_PRESETS.find((entry) => entry.id === id);
    setForm((prev) => ({
      ...prev,
      item: id,
      parts: preset ? String(preset.parts) : prev.parts,
      fasteners: preset ? String(preset.fasteners) : prev.fasteners,
      cams: preset ? String(preset.cams) : prev.cams,
      dowels: preset ? String(preset.dowels) : prev.dowels,
    }));
  };

  const result = useMemo(
    () =>
      estimateAssembly({
        item: form.item,
        parts: form.parts,
        fasteners: form.fasteners,
        cams: form.cams,
        dowels: form.dowels,
        quantity: Number(form.quantity),
        experience: form.experience,
        tools: form.tools,
        people: Number(form.people),
        startTime: form.startTime,
      }),
    [form],
  );

  const ok = !result.error;

  const checklist = useMemo(
    () =>
      toolChecklist({
        cams: Number(form.cams),
        dowels: Number(form.dowels),
        fasteners: Number(form.fasteners),
        quantity: Number(form.quantity),
      }),
    [form.cams, form.dowels, form.fasteners, form.quantity],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Furniture Assembly Time Estimator",
      `${result.quantity} × ${result.itemLabel}`,
      `${result.parts} parts, ${result.fasteners} screws, ${result.cams} cam locks, ${result.dowels} dowels`,
      `${result.people} builder${result.people > 1 ? "s" : ""}, efficiency ×${n2(result.teamEfficiency)}`,
      `Estimate: ${formatDuration(result.totalMinutes)}`,
      `Likely range: ${formatDuration(result.optimisticMinutes)} to ${formatDuration(result.pessimisticMinutes)}`,
      `Start ${result.startTime} → finish about ${result.finishTime}${dayOffsetLabel(result.finishDayOffset)}`,
    ].join("\n");
  }, [ok, result]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Carpentry &amp; woodwork
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Furniture Assembly Time Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate a flat-pack build from what is actually in the box — panels, screws, cam locks and
          dowels — then adjust for your experience, your tools and how many people are helping.
          Building several of the same item applies a {LEARNING_RATE_PCT}% learning curve.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What are you building?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fa-item">
              Item
            </label>
            <select id="fa-item" className={`mt-2 ${INPUT_CLASS}`} value={form.item} onChange={applyItem}>
              {ITEM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-parts">
              Panels and major parts
            </label>
            <input
              id="fa-parts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.parts}
              onChange={set("parts")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-fasteners">
              Screws and bolts
            </label>
            <input
              id="fa-fasteners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.fasteners}
              onChange={set("fasteners")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-cams">
              Cam locks
            </label>
            <input
              id="fa-cams"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.cams}
              onChange={set("cams")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-dowels">
              Wooden dowels
            </label>
            <input
              id="fa-dowels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.dowels}
              onChange={set("dowels")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-qty">
              How many identical items
            </label>
            <input
              id="fa-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={form.quantity}
              onChange={set("quantity")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-start">
              Start time
            </label>
            <input
              id="fa-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.startTime}
              onChange={set("startTime")}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Who is building it?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-exp">
              Experience
            </label>
            <select id="fa-exp" className={`mt-2 ${INPUT_CLASS}`} value={form.experience} onChange={set("experience")}>
              {EXPERIENCE_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-tools">
              Tools on hand
            </label>
            <select id="fa-tools" className={`mt-2 ${INPUT_CLASS}`} value={form.tools} onChange={set("tools")}>
              {TOOL_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fa-people">
              People building
            </label>
            <select id="fa-people" className={`mt-2 ${INPUT_CLASS}`} value={form.people} onChange={set("people")}>
              {TEAM_EFFICIENCY.map((efficiency, index) => (
                <option key={efficiency} value={String(index + 1)}>
                  {index + 1} {index === 0 ? "person" : "people"} — worth ×{n2(efficiency)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated build time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatDuration(result.totalMinutes) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Start at ${result.startTime}, finish around ${result.finishTime}${dayOffsetLabel(result.finishDayOffset)}`
                : "Fix the inputs above to see an estimate"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy assembly time estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            [
              "Likely range",
              ok ? `${formatDuration(result.optimisticMinutes)} – ${formatDuration(result.pessimisticMinutes)}` : "—",
            ],
            ["Raw work content per item", ok ? formatDuration(result.workContentMinutes) : "—"],
            [
              "After skill × tools",
              ok ? `${formatDuration(result.perItemAdjustedMinutes)} (×${n2(result.combinedFactor)})` : "—",
            ],
            ["Average per item across the batch", ok ? formatDuration(result.perItemAverageMinutes) : "—"],
            ["Saved by the learning curve", ok ? formatDuration(result.learningSavingMinutes) : "—"],
            ["Unpacking and sorting", ok ? formatDuration(result.unpackMinutes) : "—"],
            ["Reading the instructions", ok ? formatDuration(result.manualMinutes) : "—"],
            ["Assembly", ok ? formatDuration(result.assemblyMinutes) : "—"],
            ["Clearing up", ok ? formatDuration(result.cleanupMinutes) : "—"],
            ["Breaks", ok ? formatDuration(result.breakMinutes) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Have these ready before you open the carton</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {checklist.map((entry) => (
            <li key={entry} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              <span className="text-[var(--muted-foreground)]">{entry}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate, not a promise. Missing hardware, a mis-drilled panel or a back panel that has to
        come off and go on again are the usual reasons a build overruns — which is why the range runs
        further above the estimate than below it.
      </p>
    </main>
  );
}
