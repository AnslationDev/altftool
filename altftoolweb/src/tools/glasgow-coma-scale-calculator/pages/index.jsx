"use client";

import { useMemo, useState } from "react";
import { Brain, Check, Copy, RotateCcw } from "lucide-react";
import {
  EYE_OPTIONS,
  GCS_MAX,
  MOTOR_OPTIONS_ADULT,
  MOTOR_OPTIONS_PAEDIATRIC,
  PUPIL_OPTIONS,
  SEVERITY_BANDS,
  VERBAL_OPTIONS_ADULT,
  VERBAL_OPTIONS_PAEDIATRIC,
  computeGcs,
} from "../lib";

const DEFAULTS = {
  mode: "adult",
  eye: 4,
  verbal: 5,
  motor: 6,
  pupils: 0,
  verbalNotTestable: false,
};

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [eye, setEye] = useState(DEFAULTS.eye);
  const [verbal, setVerbal] = useState(DEFAULTS.verbal);
  const [motor, setMotor] = useState(DEFAULTS.motor);
  const [pupils, setPupils] = useState(DEFAULTS.pupils);
  const [verbalNotTestable, setVerbalNotTestable] = useState(DEFAULTS.verbalNotTestable);
  const [copied, setCopied] = useState(false);

  const isPaediatric = mode === "paediatric";
  const verbalOptions = isPaediatric ? VERBAL_OPTIONS_PAEDIATRIC : VERBAL_OPTIONS_ADULT;
  const motorOptions = isPaediatric ? MOTOR_OPTIONS_PAEDIATRIC : MOTOR_OPTIONS_ADULT;

  const result = useMemo(
    () => computeGcs({ eye, verbal, motor, pupilsUnreactive: pupils, verbalNotTestable }),
    [eye, verbal, motor, pupils, verbalNotTestable],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Glasgow Coma Scale",
      `Assessment: ${isPaediatric ? "Paediatric (pre-verbal)" : "Adult"}`,
      `Notation: ${result.notation}`,
      `Total GCS: ${result.totalLabel} / ${result.totalMax}`,
      `Severity: ${result.severity || "not classified"}`,
      `Unreactive pupils: ${result.pupilsUnreactive}`,
      `GCS-Pupils (GCS-P): ${result.gcsPLabel}`,
    ].join("\n");
  }, [hasError, isPaediatric, result]);

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
    setMode(DEFAULTS.mode);
    setEye(DEFAULTS.eye);
    setVerbal(DEFAULTS.verbal);
    setMotor(DEFAULTS.motor);
    setPupils(DEFAULTS.pupils);
    setVerbalNotTestable(DEFAULTS.verbalNotTestable);
    setCopied(false);
  };

  const totalDisplay = hasError ? DASH : `${result.totalLabel}`;
  const barPct = hasError ? 0 : Math.round((result.total / GCS_MAX) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Brain className="h-4 w-4" aria-hidden="true" />
          Clinical score
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Glasgow Coma Scale Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the best eye, verbal and motor response to get the total GCS (3-15), the standard
          E/V/M notation, the severity band and the GCS-Pupils score. Built for study and revision.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className="text-sm font-semibold">Scale wording</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["adult", "Adult / verbal child"],
              ["paediatric", "Pre-verbal child"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="gcs-eye">
              Eye opening (E)
            </label>
            <select
              id="gcs-eye"
              className={SELECT}
              value={eye}
              onChange={(event) => setEye(Number(event.target.value))}
            >
              {EYE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} — {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {EYE_OPTIONS.find((o) => o.value === eye)?.hint}
            </p>
          </div>

          <div>
            <label className={LABEL} htmlFor="gcs-verbal">
              Verbal response (V)
            </label>
            <select
              id="gcs-verbal"
              className={SELECT}
              value={verbal}
              disabled={verbalNotTestable}
              onChange={(event) => setVerbal(Number(event.target.value))}
            >
              {verbalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} — {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {verbalNotTestable
                ? "Marked not testable — reported as a T suffix."
                : verbalOptions.find((o) => o.value === verbal)?.hint}
            </p>
            <label
              className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]"
              htmlFor="gcs-verbal-nt"
            >
              <input
                id="gcs-verbal-nt"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={verbalNotTestable}
                onChange={(event) => setVerbalNotTestable(event.target.checked)}
              />
              Not testable (intubated)
            </label>
          </div>

          <div>
            <label className={LABEL} htmlFor="gcs-motor">
              Best motor response (M)
            </label>
            <select
              id="gcs-motor"
              className={SELECT}
              value={motor}
              onChange={(event) => setMotor(Number(event.target.value))}
            >
              {motorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} — {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {motorOptions.find((o) => o.value === motor)?.hint}
            </p>
          </div>

          <div>
            <label className={LABEL} htmlFor="gcs-pupils">
              Pupil reactivity
            </label>
            <select
              id="gcs-pupils"
              className={SELECT}
              value={pupils}
              onChange={(event) => setPupils(Number(event.target.value))}
            >
              {PUPIL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used only for the GCS-Pupils score, not the total GCS.
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total GCS
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">{totalDisplay}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a score." : `${result.notation} · out of ${result.totalMax}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Glasgow Coma Scale result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all responses" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Eye opening (E)", hasError ? DASH : String(result.components.eye)],
            [
              "Verbal response (V)",
              hasError ? DASH : result.components.verbal === null ? "Not testable" : String(result.components.verbal),
            ],
            ["Best motor response (M)", hasError ? DASH : String(result.components.motor)],
            ["Severity band", hasError ? DASH : result.severity || "Not classified"],
            ["Unreactive pupils", hasError ? DASH : String(result.pupilsUnreactive)],
            ["GCS-Pupils (GCS-P)", hasError ? DASH : result.gcsPLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.severityNote && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.severityNote}
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Severity bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Total</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">What it means</th>
              </tr>
            </thead>
            <tbody>
              {SEVERITY_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}-{band.max}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational and educational only. The Glasgow Coma Scale must be applied at the bedside by
        a trained clinician using a standardised stimulus; a score here is not a diagnosis and never
        replaces clinical assessment. Seek emergency care for any reduced level of consciousness.
      </p>
    </main>
  );
}
