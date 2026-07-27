"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import {
  PACE_BANDS,
  TYPICAL_PROMPTER_FONT_SIZES,
  formatDuration,
  scrollPlan,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_SCRIPT = `Good morning, and thanks for joining us. Over the next two minutes I want to walk through what changed this quarter and what it means for the way your team closes the month.

We rebuilt the ledger connectors from the ground up. Every figure on a report now traces back to the row it came from, in one click, without exporting anything.

The close checklist is new as well. It assigns each step to a person, tracks what is still open, and tells you honestly whether you are on schedule.

If you want to see it against your own data, the link is on screen now, and we will follow up with a recording.`;

const DEFAULTS = {
  script: SAMPLE_SCRIPT,
  targetSeconds: "120",
  fontSizePx: "56",
  viewportWidthPx: "900",
  lineHeightRatio: "1.5",
  allowParagraphPauses: true,
};

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const plan = useMemo(
    () =>
      scrollPlan({
        text: form.script,
        targetSeconds: Number(form.targetSeconds),
        fontSizePx: Number(form.fontSizePx),
        viewportWidthPx: Number(form.viewportWidthPx),
        lineHeightRatio: Number(form.lineHeightRatio),
        allowParagraphPauses: form.allowParagraphPauses,
      }),
    [form],
  );

  const failed = Boolean(plan.error);
  const dash = "—";

  const copyResult = async () => {
    if (failed) return;
    const text = [
      "Teleprompter scroll plan",
      `Script: ${INT.format(plan.script.words)} words, ${INT.format(plan.script.paragraphCount)} paragraphs`,
      `Target runtime: ${formatDuration(plan.targetSeconds)}`,
      `Delivery pace: ${INT.format(plan.wpm)} words per minute — ${plan.band.label}`,
      `Scroll speed: ${NUM.format(plan.pixelsPerSecond)} px per second`,
      `Lines per minute: ${NUM.format(plan.linesPerMinute)}`,
      `Total scroll distance: ${INT.format(plan.totalScrollPx)} px over ${INT.format(plan.lines)} lines`,
      `Type: ${form.fontSizePx}px at ${form.lineHeightRatio} line height in a ${form.viewportWidthPx}px column`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
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

  const bandClass = failed
    ? ""
    : plan.band.id === "rushed"
      ? "text-[var(--danger)]"
      : plan.band.id === "slow"
        ? "text-[var(--muted-foreground)]"
        : "text-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Teleprompters
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Teleprompter Speed Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the script, say how long the piece has to run, and get the scroll speed in pixels per
          second and lines per minute — plus the words-per-minute pace that implies, so you know
          whether to slow the prompter or cut words.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div>
          <label className={LABEL_CLASS} htmlFor="tp-script">
            Script
          </label>
          <textarea id="tp-script" className={`mt-2 ${TEXTAREA_CLASS}`} rows={8} value={form.script} onChange={(e) => setField("script", e.target.value)} />
          <p className={HINT_CLASS}>Blank lines are treated as paragraph breaks, where a presenter takes a breath.</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-target">
              Target runtime (seconds)
            </label>
            <input id="tp-target" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" step="1" value={form.targetSeconds} onChange={(e) => setField("targetSeconds", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-font">
              Prompter font size (px)
            </label>
            <input id="tp-font" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="8" step="1" list="tp-sizes" value={form.fontSizePx} onChange={(e) => setField("fontSizePx", e.target.value)} />
            <datalist id="tp-sizes">
              {TYPICAL_PROMPTER_FONT_SIZES.map((size) => (
                <option key={size} value={size} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-width">
              Text column width (px)
            </label>
            <input id="tp-width" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="100" step="10" value={form.viewportWidthPx} onChange={(e) => setField("viewportWidthPx", e.target.value)} />
            <p className={HINT_CLASS}>The readable width of the prompter, not the whole screen</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-lh">
              Line height (× font size)
            </label>
            <input id="tp-lh" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="1" max="3" step="0.1" value={form.lineHeightRatio} onChange={(e) => setField("lineHeightRatio", e.target.value)} />
          </div>
        </div>

        <label className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="tp-pauses">
          <input id="tp-pauses" type="checkbox" className="h-4 w-4" checked={form.allowParagraphPauses} onChange={(e) => setField("allowParagraphPauses", e.target.checked)} />
          Allow a breath at each paragraph break
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {[30, 60, 90, 120, 180, 300].map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => setField("targetSeconds", String(seconds))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {formatDuration(seconds)}
            </button>
          ))}
        </div>
      </section>

      {failed ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Scroll speed</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{failed ? dash : `${NUM.format(plan.pixelsPerSecond)} px/s`}</p>
            <p className={`mt-1 text-sm ${failed ? "text-[var(--muted-foreground)]" : bandClass}`}>
              {failed ? dash : `${INT.format(plan.wpm)} wpm — ${plan.band.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the teleprompter scroll plan" className={GHOST_BTN} disabled={failed}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words in the script", failed ? dash : INT.format(plan.script.words)],
            ["Paragraphs / sentences", failed ? dash : `${INT.format(plan.script.paragraphCount)} / ${INT.format(plan.script.sentences)}`],
            ["Time spent on breaths", failed ? dash : `${NUM.format(plan.pauseSeconds)} s`],
            ["Speaking time available", failed ? dash : `${NUM.format(plan.speakingSeconds)} s`],
            ["Lines on the prompter", failed ? dash : `${INT.format(plan.lines)} at about ${INT.format(plan.charactersPerLine)} characters each`],
            ["Lines per minute", failed ? dash : NUM.format(plan.linesPerMinute)],
            ["Seconds per line", failed ? dash : NUM2.format(plan.secondsPerLine)],
            ["Total scroll distance", failed ? dash : `${INT.format(plan.totalScrollPx)} px (${INT.format(plan.lineHeightPx)} px per line)`],
            ["Same script at 140 wpm", failed ? dash : formatDuration(plan.durationAtConversational)],
            ["Same script at 160 wpm", failed ? dash : formatDuration(plan.durationAtBroadcast)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && plan.notes.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {plan.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Pace bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Words per minute</th>
                <th scope="col" className="py-2 font-semibold">Reads as</th>
              </tr>
            </thead>
            <tbody>
              {PACE_BANDS.map((band) => (
                <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.max === Infinity ? `${band.min}+` : `${band.min}–${band.max}`}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Line counts are estimated from an average glyph width of half the font size, so the real
        wrap will differ a little with your typeface. Run one rehearsal at the calculated speed and
        adjust — presenters vary more than the arithmetic does.
      </p>
    </main>
  );
}
