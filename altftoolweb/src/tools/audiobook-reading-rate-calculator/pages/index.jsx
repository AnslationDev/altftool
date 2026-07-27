"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Headphones, RotateCcw } from "lucide-react";

import {
  ACX_BITRATE_KBPS,
  DEFAULT_FACTORS,
  DEFAULT_WPM,
  PACE_PRESETS,
  computeAudiobookLength,
  formatHoursMinutes,
  wordsForTargetLength,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  wordCount: "90000",
  wpm: String(DEFAULT_WPM),
  prep: String(DEFAULT_FACTORS.prep),
  record: String(DEFAULT_FACTORS.record),
  edit: String(DEFAULT_FACTORS.edit),
  session: "3",
  targetHours: "10",
};

const toNumber = (value) => (String(value).trim() === "" ? NaN : Number(value));

export default function ToolHome() {
  const [wordCount, setWordCount] = useState(DEFAULTS.wordCount);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [prep, setPrep] = useState(DEFAULTS.prep);
  const [record, setRecord] = useState(DEFAULTS.record);
  const [edit, setEdit] = useState(DEFAULTS.edit);
  const [session, setSession] = useState(DEFAULTS.session);
  const [targetHours, setTargetHours] = useState(DEFAULTS.targetHours);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAudiobookLength({
        wordCount: toNumber(wordCount),
        wordsPerMinute: toNumber(wpm),
        prepFactor: toNumber(prep),
        recordFactor: toNumber(record),
        editFactor: toNumber(edit),
        sessionHours: toNumber(session),
      }),
    [wordCount, wpm, prep, record, edit, session],
  );

  const target = useMemo(
    () => wordsForTargetLength({ targetHours: toNumber(targetHours), wordsPerMinute: toNumber(wpm) }),
    [targetHours, wpm],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Audiobook Reading Rate Calculator",
      `Manuscript: ${NUM.format(result.words)} words at ${NUM.format(result.wordsPerMinute)} wpm`,
      `Finished audio: ${result.finishedLabel} (${NUM2.format(result.finishedHours)} finished hours)`,
      `Words per finished hour: ${NUM.format(result.wordsPerFinishedHour)}`,
      `Prep ${NUM1.format(result.prepHours)} h · Booth ${NUM1.format(result.recordHours)} h · Edit ${NUM1.format(result.editHours)} h`,
      `Total production: ${NUM1.format(result.totalProductionHours)} h (${NUM1.format(result.productionRatio)}x finished)`,
      `Recording sessions of ${NUM1.format(result.sessionHours)} h: ${NUM.format(result.sessionsNeeded)}`,
      `Delivery size at ${ACX_BITRATE_KBPS} kbps MP3: ${NUM.format(result.fileSizeMb)} MB`,
    ].join("\n");
  }, [result]);

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
    setWordCount(DEFAULTS.wordCount);
    setWpm(DEFAULTS.wpm);
    setPrep(DEFAULTS.prep);
    setRecord(DEFAULTS.record);
    setEdit(DEFAULTS.edit);
    setSession(DEFAULTS.session);
    setTargetHours(DEFAULTS.targetHours);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Headphones className="h-4 w-4" aria-hidden="true" />
          Audio publishing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Audiobook Reading Rate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a manuscript word count into finished listening hours, then into the prep, booth
          and editing time it actually takes to deliver them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-words">
              Manuscript word count
            </label>
            <input
              id="arr-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="500"
              value={wordCount}
              onChange={(event) => setWordCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-wpm">
              Narration pace (words per minute)
            </label>
            <input
              id="arr-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="260"
              step="1"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PACE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setWpm(String(preset.wpm))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.wpm} wpm
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {PACE_PRESETS.map((preset) => `${preset.wpm} — ${preset.label}`).join(" · ")}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-prep">
              Prep hours per finished hour
            </label>
            <input
              id="arr-prep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.25"
              value={prep}
              onChange={(event) => setPrep(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-record">
              Booth hours per finished hour
            </label>
            <input
              id="arr-record"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.25"
              value={record}
              onChange={(event) => setRecord(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-edit">
              Edit and master hours per finished hour
            </label>
            <input
              id="arr-edit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.25"
              value={edit}
              onChange={(event) => setEdit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-session">
              Usable hours in one session
            </label>
            <input
              id="arr-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="12"
              step="0.5"
              value={session}
              onChange={(event) => setSession(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Finished listening time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : result.finishedLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? "Fix the inputs to see the estimate." : result.band}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the audiobook length estimate"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Finished hours", result.error ? DASH : `${NUM2.format(result.finishedHours)} FH`],
            ["Words per finished hour", result.error ? DASH : NUM.format(result.wordsPerFinishedHour)],
            ["Prep and research", result.error ? DASH : formatHoursMinutes(result.prepHours * 60)],
            ["Time at the microphone", result.error ? DASH : formatHoursMinutes(result.recordHours * 60)],
            ["Editing, mastering, proofing", result.error ? DASH : formatHoursMinutes(result.editHours * 60)],
            [
              "Total production time",
              result.error
                ? DASH
                : `${formatHoursMinutes(result.totalProductionHours * 60)} (${NUM1.format(result.productionRatio)}x finished)`,
            ],
            [
              "Recording sessions needed",
              result.error ? DASH : `${NUM.format(result.sessionsNeeded)} × ${NUM1.format(result.sessionHours)} h`,
            ],
            [
              `Delivery size at ${ACX_BITRATE_KBPS} kbps MP3`,
              result.error ? DASH : `${NUM.format(result.fileSizeMb)} MB`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Working backwards from a target length</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="arr-target">
              Target finished hours
            </label>
            <input
              id="arr-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="200"
              step="0.25"
              value={targetHours}
              onChange={(event) => setTargetHours(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Manuscript needed
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {target.error ? DASH : `${NUM.format(target.targetWords)} words`}
            </p>
          </div>
        </div>
        {target.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {target.error}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Dense technical text, dialogue-heavy fiction, character voices and heavy
        pickup work all push the real numbers up, and a director or engineer in the session adds
        their own time on top.
      </p>
    </main>
  );
}
