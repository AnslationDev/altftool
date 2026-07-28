"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";
import { SUBJECTS, bandsFor, readMuac } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  measurement: "128",
  unit: "mm",
  subject: "child",
  ageMonths: "24",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const severityClass = (severity) => {
  if (severity === "danger") return "bg-[var(--danger-soft)] text-[var(--danger)]";
  if (severity === "warn") return "bg-[var(--muted)] text-[var(--foreground)]";
  return "bg-[var(--muted)] text-[var(--muted-foreground)]";
};

export default function ToolHome() {
  const [measurement, setMeasurement] = useState(DEFAULTS.measurement);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [ageMonths, setAgeMonths] = useState(DEFAULTS.ageMonths);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => readMuac({ measurement, unit, subject, ageMonths }),
    [measurement, unit, subject, ageMonths],
  );

  const ok = !result.error;
  const bands = bandsFor(subject);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Mid-Upper Arm Circumference reading",
      `Measured: ${n1(result.mm)} mm (${n2(result.cm)} cm)`,
      result.subject === "child"
        ? `Child aged ${n1(result.ageMonths)} months`
        : "Pregnant or lactating woman",
      `Band: ${result.bandLabel} (${result.bandColour})`,
      result.bandMeaning,
      `Next step: ${result.bandAction}`,
    ];
    if (result.mmToNextBand !== null) {
      lines.push(`${n1(result.mmToNextBand)} mm more would reach the "${result.nextBandLabel}" band.`);
    }
    lines.push("", "Screening information only — not a diagnosis.");
    return lines.join("\n");
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
    setMeasurement(DEFAULTS.measurement);
    setUnit(DEFAULTS.unit);
    setSubject(DEFAULTS.subject);
    setAgeMonths(DEFAULTS.ageMonths);
    setCopied(false);
  };

  const rows = [
    ["Reading in millimetres", ok ? `${n1(result.mm)} mm` : DASH],
    ["Reading in centimetres", ok ? `${n2(result.cm)} cm` : DASH],
    ["Tape colour", ok ? result.bandColour : DASH],
    [
      "Distance to the next band",
      ok ? (result.mmToNextBand === null ? "Already in the top band" : `${n1(result.mmToNextBand)} mm`) : DASH,
    ],
    ["Who was measured", ok ? (result.subject === "child" ? `Child, ${n1(result.ageMonths)} months` : "Pregnant or lactating woman") : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mid-Upper Arm Circumference Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a MUAC tape reading and see which WHO screening band it falls in, what that band
          means and what the usual next step is. Screening information only — it is not a diagnosis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="muac-subject">
              Who was measured
            </label>
            <select
              id="muac-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              {SUBJECTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {subject === "child" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="muac-age">
                Age in months
              </label>
              <input
                id="muac-age"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="6"
                max="59"
                step="1"
                value={ageMonths}
                onChange={(event) => setAgeMonths(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="muac-value">
              Tape reading
            </label>
            <input
              id="muac-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={measurement}
              onChange={(event) => setMeasurement(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="muac-unit">
              Unit
            </label>
            <select
              id="muac-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="mm">millimetres (mm)</option>
              <option value="cm">centimetres (cm)</option>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Screening band
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? result.bandLabel : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${n1(result.mm)} mm — tape colour ${result.bandColour}` : "Fix the highlighted input to see a band."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy MUAC screening result"
              className={GHOST_BTN}
              disabled={!ok}
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

        {ok ? (
          <>
            <p className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${severityClass(result.severity)}`}>
              {result.bandMeaning}
            </p>
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              {result.bandAction}
            </p>
          </>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          {subject === "child" ? "WHO bands for children aged 6-59 months" : "Screening bands for women"}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Reading</th>
                <th scope="col" className="py-2 font-semibold">Colour</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band, index) => {
                const lower = index === 0 ? null : bands[index - 1].below;
                const range =
                  band.below === Infinity
                    ? `${lower} mm and above`
                    : lower === null
                      ? `under ${band.below} mm`
                      : `${lower} mm to under ${band.below} mm`;
                return (
                  <tr
                    key={band.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      ok && result.bandId === band.id ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{band.label}</td>
                    <td className="py-2 pr-3">{range}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{band.colour}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {ok && result.notes.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {result.notes.map((note) => (
            <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This tool reads a number against published screening thresholds. It is not a diagnosis and
        cannot replace assessment by a health worker, doctor or nutrition programme. If a reading
        falls in the red band, or if the child is unwell, refusing feeds or has swollen feet, seek
        medical help the same day.
      </p>
    </main>
  );
}
