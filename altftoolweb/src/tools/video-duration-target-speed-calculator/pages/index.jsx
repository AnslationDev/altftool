"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { RUNTIME_TARGETS, formatDuration, parseDuration, targetSpeed } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  source: "3:12",
  target: "1:30",
  trim: "0",
  fps: "30",
  words: "420",
};

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const source = parseDuration(form.source);
    const target = parseDuration(form.target);
    const trim = form.trim.trim() === "" ? 0 : parseDuration(form.trim);
    if (source === null) return { error: "Current length must be seconds, m:ss or h:mm:ss — for example 3:12." };
    if (target === null) return { error: "Target runtime must be seconds, m:ss or h:mm:ss — for example 1:30." };
    if (trim === null) return { error: "Trim must be seconds or m:ss. Leave it blank or use 0 for no trim." };
    return targetSpeed({
      sourceSeconds: source,
      targetSeconds: target,
      trimSeconds: trim,
      fps: Number(form.fps),
      wordCount: form.words.trim() === "" ? undefined : Number(form.words),
    });
  }, [form]);

  const failed = Boolean(result.error);
  const dash = "—";

  const copyResult = async () => {
    if (failed) return;
    const text = [
      "Target runtime speed",
      `Current length: ${formatDuration(result.sourceSeconds)}`,
      result.trimSeconds > 0 ? `Trimming first: ${formatDuration(result.trimSeconds)}` : "",
      `Target runtime: ${formatDuration(result.targetSeconds)}`,
      `Speed needed: ${NUM3.format(result.multiplier)}× (${NUM.format(result.percent)}%)`,
      `Verdict: ${result.verdict.label}`,
      result.outputFrames !== null ? `Frames at ${form.fps} fps: ${INT.format(result.outputFrames)}` : "",
      result.effectiveWpm !== null ? `Delivery rate: ${INT.format(result.effectiveWpm)} words per minute` : "",
    ]
      .filter(Boolean)
      .join("\n");
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

  const verdictClass = failed
    ? ""
    : result.verdict.level === "extreme" || result.verdict.level === "hard"
      ? "text-[var(--danger)]"
      : result.verdict.level === "brisk"
        ? "text-[var(--muted-foreground)]"
        : "text-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Video speed
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Video Duration Target Speed Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you have and what it has to become. The speed multiplier is the remaining length
          divided by the target, and the tool also shows how much you would need to cut instead if
          the speed change is too aggressive for spoken material.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-source">
              Current length
            </label>
            <input id="ts-source" className={`mt-2 ${INPUT_CLASS}`} type="text" inputMode="text" value={form.source} onChange={(e) => setField("source", e.target.value)} />
            <p className={HINT_CLASS}>Seconds, m:ss or h:mm:ss</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-target">
              Target runtime
            </label>
            <input id="ts-target" className={`mt-2 ${INPUT_CLASS}`} type="text" inputMode="text" value={form.target} onChange={(e) => setField("target", e.target.value)} />
            <p className={HINT_CLASS}>The length it has to be</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-trim">
              Cutting first (optional)
            </label>
            <input id="ts-trim" className={`mt-2 ${INPUT_CLASS}`} type="text" inputMode="text" value={form.trim} onChange={(e) => setField("trim", e.target.value)} />
            <p className={HINT_CLASS}>Material removed before any speed change</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-fps">
              Timeline frame rate (fps)
            </label>
            <input id="ts-fps" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.001" value={form.fps} onChange={(e) => setField("fps", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-words">
              Script word count (optional)
            </label>
            <input id="ts-words" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="1" value={form.words} onChange={(e) => setField("words", e.target.value)} />
            <p className={HINT_CLASS}>Used to show the delivery rate in words per minute</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RUNTIME_TARGETS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setField("target", formatDuration(entry.seconds))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {entry.label}
            </button>
          ))}
        </div>
      </section>

      {failed ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Speed needed</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{failed ? dash : `${NUM3.format(result.multiplier)}×`}</p>
            <p className={`mt-1 text-sm ${failed ? "text-[var(--muted-foreground)]" : verdictClass}`}>{failed ? dash : result.verdict.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the target speed result" className={GHOST_BTN} disabled={failed}>
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
            ["Speed as a percentage", failed ? dash : `${NUM.format(result.percent)}%`],
            ["Length after trimming, before speed", failed ? dash : formatDuration(result.remainingSeconds)],
            ["Time removed overall", failed ? dash : formatDuration(Math.abs(result.timeChange))],
            ["Frames at the timeline rate", failed ? dash : result.outputFrames === null ? "Enter a frame rate" : INT.format(result.outputFrames)],
            ["Delivery rate", failed ? dash : result.effectiveWpm === null ? "Enter a word count" : `${INT.format(result.effectiveWpm)} words per minute`],
            ["Audio pitch shift if uncorrected", failed ? dash : `${NUM.format(result.pitchSemitones)} semitones`],
            ["Cut instead, to stay at 1.25×", failed ? dash : formatDuration(result.trimToStayComfortable)],
            ["Cut instead, to stay at 1.5×", failed ? dash : formatDuration(result.trimToStayTolerable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.notes.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 1.25× and 1.5× guides are practical editing thresholds for spoken material, not
        measurements — music, action and narration all tolerate speed changes differently. Use a
        pitch-preserving time stretch if the dialogue has to travel with the picture.
      </p>
    </main>
  );
}
