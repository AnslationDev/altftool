"use client";

import { useMemo, useState } from "react";
import { BarChart3, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { BANDS, analyzeMarks } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SUBJECTS = [
  { id: 1, name: "Mathematics", obtained: "82", max: "100" },
  { id: 2, name: "Science", obtained: "74", max: "100" },
  { id: 3, name: "English", obtained: "68", max: "100" },
  { id: 4, name: "Social Science", obtained: "59", max: "100" },
  { id: 5, name: "Hindi", obtained: "77", max: "100" },
];

export default function ToolHome() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [nextId, setNextId] = useState(DEFAULT_SUBJECTS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyzeMarks({
        subjects: subjects.map((s) => ({
          name: s.name,
          obtained: s.obtained.trim() === "" ? Number.NaN : Number(s.obtained),
          max: s.max.trim() === "" ? Number.NaN : Number(s.max),
        })),
      }),
    [subjects],
  );

  const hasError = Boolean(result.error);

  const updateSubject = (id, field, value) => {
    setSubjects((current) =>
      current.map((subject) => (subject.id === id ? { ...subject, [field]: value } : subject)),
    );
  };

  const addSubject = () => {
    setSubjects((current) => [
      ...current,
      { id: nextId, name: `Subject ${nextId}`, obtained: "", max: "100" },
    ]);
    setNextId((id) => id + 1);
  };

  const removeSubject = (id) => {
    setSubjects((current) => (current.length > 1 ? current.filter((s) => s.id !== id) : current));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Marksheet analysis",
      ...result.subjects.map(
        (s) => `${s.name}: ${s.obtained}/${s.max} — ${NUM.format(s.percent)}% (${s.band})`,
      ),
      `Overall: ${result.totalObtained}/${result.totalMax} — ${NUM.format(result.overallPercent)}% (${result.overallBand})`,
      `Strongest: ${result.strongest.name} (${NUM.format(result.strongest.percent)}%)`,
      `Weakest: ${result.weakest.name} (${NUM.format(result.weakest.percent)}%)`,
    ].join("\n");
  }, [hasError, result]);

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
    setSubjects(DEFAULT_SUBJECTS);
    setNextId(DEFAULT_SUBJECTS.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Result analysis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Marksheet Score Visualizer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter subject-wise marks to see percentage bars, your overall mark-weighted percentage,
          and which subjects are pulling the total up or down.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Subjects</h2>
        <div className="mt-3 space-y-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`mk-name-${subject.id}`}>
                    Subject
                  </label>
                  <input
                    id={`mk-name-${subject.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={subject.name}
                    onChange={(event) => updateSubject(subject.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`mk-obtained-${subject.id}`}>
                    Obtained
                  </label>
                  <input
                    id={`mk-obtained-${subject.id}`}
                    className={`mt-2 w-full sm:w-24 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={subject.obtained}
                    onChange={(event) => updateSubject(subject.id, "obtained", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`mk-max-${subject.id}`}>
                    Out of
                  </label>
                  <input
                    id={`mk-max-${subject.id}`}
                    className={`mt-2 w-full sm:w-24 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={subject.max}
                    onChange={(event) => updateSubject(subject.id, "max", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(subject.id)}
                  disabled={subjects.length <= 1}
                  aria-label={`Remove ${subject.name}`}
                  className={`${GHOST_BTN} disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSubject} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
        </button>
      </section>

      {hasError ? (
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
              Overall percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.overallPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the analysis."
                : `${result.totalObtained} of ${result.totalMax} marks — ${result.overallBand}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the marksheet analysis"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5 space-y-3" role="img" aria-label="Bar chart of subject percentages">
            {result.subjects.map((s) => (
              <div key={s.name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {NUM.format(s.percent)}% · {s.band}
                  </span>
                </div>
                <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className={`h-full rounded-full ${
                      s.percent < 33 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"
                    }`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Overall", DASH],
                ["Strongest subject", DASH],
                ["Weakest subject", DASH],
                ["Spread", DASH],
              ]
            : [
                ["Total marks", `${result.totalObtained} / ${result.totalMax}`],
                [
                  "Strongest subject",
                  `${result.strongest.name} — ${NUM.format(result.strongest.percent)}%`,
                ],
                [
                  "Weakest subject",
                  `${result.weakest.name} — ${NUM.format(result.weakest.percent)}%`,
                ],
                ["Average of subject percentages", `${NUM.format(result.meanPercent)}%`],
                [
                  "Spread (standard deviation)",
                  `${NUM.format(result.stdDevPercent)} pts${result.spreadIsWide ? " — uneven, focus the weak subjects" : " — fairly even"}`,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Division bands used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Threshold
                </th>
              </tr>
            </thead>
            <tbody>
              {BANDS.map((band) => (
                <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-right font-semibold">
                    {band.min > 0 ? `≥ ${band.min}%` : "below 33%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Overall percentage is mark-weighted (total obtained ÷ total maximum), which differs from the
        average of subject percentages when subjects carry different maximum marks. Division bands
        follow the common Indian board convention; your board or university&apos;s official rules
        prevail.
      </p>
    </main>
  );
}
