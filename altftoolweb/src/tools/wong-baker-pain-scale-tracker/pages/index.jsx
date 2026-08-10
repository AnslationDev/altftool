"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Frown, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  PAIN_LEVELS,
  PAIN_MAX,
  SEVERITY_BANDS,
  describeLevel,
  summarisePainLog,
} from "../lib";

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DIRECTION_TEXT = {
  down: "lower than the reading before",
  up: "higher than the reading before",
  unchanged: "the same as the reading before",
  none: "first reading",
};

/**
 * A simple face drawn for this page. The mouth curve and eye shape are derived
 * from the level so the six faces read as one set.
 */
function PainFace({ level, size = 56 }) {
  const t = level / PAIN_MAX; // 0 at no pain, 1 at worst
  const mouthDrop = 12 - 24 * t; // smile at 0, frown at 10
  const browTilt = 4 * t;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      style={{ width: size, height: size }}
    >
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="3" />
      <line
        x1="18"
        y1={24 - browTilt}
        x2="27"
        y2={24 + browTilt}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="37"
        y1={24 + browTilt}
        x2="46"
        y2={24 - browTilt}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="23" cy="31" r="3" fill="currentColor" />
      <circle cx="41" cy="31" r="3" fill="currentColor" />
      <path
        d={`M 20 45 Q 32 ${45 + mouthDrop} 44 45`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {level >= 8 && (
        <>
          <path d="M 17 36 q 2 6 0 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M 47 36 q -2 6 0 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export default function ToolHome() {
  const [level, setLevel] = useState(4);
  const [at, setAt] = useState("");
  const [note, setNote] = useState("");
  const [log, setLog] = useState([]);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Filled after mount so the server and client render the same initial HTML.
  useEffect(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    setAt(local.toISOString().slice(0, 16));
  }, []);

  const current = useMemo(() => describeLevel(level), [level]);
  const summary = useMemo(() => summarisePainLog(log), [log]);

  const currentError = Boolean(current.error);
  const summaryError = Boolean(summary.error);

  const copyText = useMemo(() => {
    if (currentError || summaryError) return "";
    const lines = [
      "Pain log",
      `Current reading: ${current.value}/${PAIN_MAX} — ${current.label} (${current.severity})`,
    ];
    if (summary.count > 0) {
      lines.push(
        `Readings logged: ${summary.count}`,
        `Average: ${NUM1.format(summary.average)} of ${PAIN_MAX}`,
        `Highest: ${summary.highest.level} at ${summary.highest.at}`,
        `Lowest: ${summary.lowest.level} at ${summary.lowest.at}`,
        `At or above ${summary.highPainThreshold}: ${summary.highPainCount} of ${summary.count}`,
        "",
        ...summary.sorted.map(
          (entry) => `${entry.at} — ${entry.level}/${PAIN_MAX}${entry.note ? ` — ${entry.note}` : ""}`,
        ),
      );
    }
    return lines.join("\n");
  }, [current, currentError, summary, summaryError]);

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const addReading = () => {
    if (currentError || !at) return;
    setLog((prev) => [...prev, { id: crypto.randomUUID(), at, level, note: note.trim() }]);
    setNote("");
  };

  const removeReading = (targetId) => {
    setLog((prev) => prev.filter((entry) => entry.id !== targetId));
  };

  const reset = () => {
    if (log.length > 0 && typeof window !== "undefined" && !window.confirm("Clear the current reading and the entire log? This cannot be undone.")) {
      return;
    }
    setLevel(4);
    setNote("");
    setLog([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Frown className="h-4 w-4" aria-hidden="true" />
          Pain diary
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Wong-Baker Pain Scale Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six faces spaced across a 0 to {PAIN_MAX} scale. Point to the face that matches how you
          feel right now, save it against a time, and the log builds a picture of how pain is
          changing through the day.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className="text-base font-semibold">How much does it hurt right now?</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {PAIN_LEVELS.map((option) => {
              const inputId = `pain-${option.value}`;
              const selected = level === option.value;
              return (
                <label
                  key={option.value}
                  htmlFor={inputId}
                  className={`flex min-h-11 cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center transition ${
                    selected
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="pain-level"
                    className="sr-only"
                    value={option.value}
                    checked={selected}
                    onChange={() => setLevel(option.value)}
                  />
                  <PainFace level={option.value} />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{option.value}</span>
                  <span className="text-xs leading-4">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {currentError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {current.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Current reading
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {currentError ? DASH : `${current.value}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {currentError ? "Pick a face to see a reading." : `out of ${PAIN_MAX} · ${current.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pain reading and log"
              className={GHOST_BTN}
              disabled={!copyText}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the reading and clear the log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Severity band", currentError ? DASH : current.severity],
            ["What it means", currentError ? DASH : current.detail],
            [
              "Counted as high pain",
              currentError ? DASH : current.isHigh ? "Yes" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Save this reading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pain-at">
              Date and time
            </label>
            <input
              id="pain-at"
              className={FIELD}
              type="datetime-local"
              value={at}
              onChange={(event) => setAt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pain-note">
              Note (optional)
            </label>
            <input
              id="pain-note"
              className={FIELD}
              type="text"
              maxLength={80}
              placeholder="After medicine, before physio…"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addReading}
          className={`mt-4 ${PRIMARY_BTN}`}
          disabled={currentError || !at}
          aria-label="Add this reading to the log"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add to log
        </button>

        {summaryError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {summary.error}
          </p>
        ) : summary.count === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Nothing logged yet. The log lives only in this page's memory and is lost on refresh or when you leave the page.
          </p>
        ) : (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Readings logged", String(summary.count)],
                ["Average pain", `${NUM1.format(summary.average)} of ${PAIN_MAX}`],
                ["Highest", `${summary.highest.level} at ${summary.highest.at.replace("T", " ")}`],
                ["Lowest", `${summary.lowest.level} at ${summary.lowest.at.replace("T", " ")}`],
                [
                  `Readings at ${summary.highPainThreshold} or above`,
                  `${summary.highPainCount} of ${summary.count} (${Math.round(summary.highPainShare)}%)`,
                ],
                [
                  "Latest compared with the one before",
                  summary.change === null
                    ? DIRECTION_TEXT.none
                    : `${summary.change > 0 ? "+" : ""}${summary.change} — ${DIRECTION_TEXT[summary.direction]}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">When</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Level</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Note</th>
                    <th scope="col" className="py-2 text-right font-semibold">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.sorted.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{entry.at.replace("T", " ")}</td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-[var(--primary)]">
                            <PainFace level={entry.level} size={24} />
                          </span>
                          {entry.level}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{entry.note || "—"}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeReading(entry.id)}
                          aria-label={`Remove the reading from ${entry.at.replace("T", " ")}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-md px-3 text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Severity bands on a 0-10 scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 font-semibold">Band</th>
              </tr>
            </thead>
            <tbody>
              {SEVERITY_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min === band.max ? band.min : `${band.min}-${band.max}`}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. A face scale records what the person in pain reports — the person
        hurting should choose the face, not a carer choosing for them — and it does not measure
        injury or tell you the cause. Seek medical help for sudden severe pain, pain with fever,
        breathlessness or confusion, or pain that keeps rising despite treatment.
      </p>
    </main>
  );
}
