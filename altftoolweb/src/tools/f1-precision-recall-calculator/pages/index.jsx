"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import { BETA_PRESETS, computeConfusionMetrics } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const fmt = (value) => (value === null || value === undefined ? "undefined" : `${(value * 100).toFixed(2)}%`);

export default function ToolHome() {
  const [tp, setTp] = useState("82");
  const [fp, setFp] = useState("12");
  const [fn, setFn] = useState("18");
  const [tn, setTn] = useState("188");
  const [beta, setBeta] = useState("1");
  const [copied, setCopied] = useState(false);
  const report = useMemo(() => computeConfusionMetrics({ tp: Number(tp), fp: Number(fp), fn: Number(fn), tn: Number(tn), beta: Number(beta) }), [tp, fp, fn, tn, beta]);

  const copyReport = async () => {
    if (report.error) return;
    const text = [
      "Precision Recall F1 Calculator",
      `TP ${tp}, FP ${fp}, FN ${fn}, TN ${tn}`,
      `Precision ${fmt(report.precision)}`,
      `Recall ${fmt(report.recall)}`,
      `F1 ${fmt(report.f1)}`,
      `F${report.beta} ${fmt(report.fBeta)}`,
      `MCC ${report.mcc.toFixed(4)}`,
      `Kappa ${report.kappa === null ? "undefined" : report.kappa.toFixed(4)}`,
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
    setTp("82"); setFp("12"); setFn("18"); setTn("188"); setBeta("1"); setCopied(false);
  };

  const metrics = report.error
    ? []
    : [
        ["Precision", fmt(report.precision)],
        ["Recall", fmt(report.recall)],
        ["F1", fmt(report.f1)],
        [`F${report.beta}`, fmt(report.fBeta)],
        ["Specificity", fmt(report.specificity)],
        ["Accuracy", fmt(report.accuracy)],
        ["Balanced accuracy", fmt(report.balancedAccuracy)],
        ["MCC", report.mcc.toFixed(4)],
        ["Cohen's kappa", report.kappa === null ? "undefined" : report.kappa.toFixed(4)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Binary classifier metrics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Precision Recall F1 Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a confusion matrix and calculate precision, recall, F1, F-beta, specificity, MCC and Cohen's kappa.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            ["True positives", tp, setTp],
            ["False positives", fp, setFp],
            ["False negatives", fn, setFn],
            ["True negatives", tn, setTn],
            ["Beta", beta, setBeta],
          ].map(([label, value, setter]) => (
            <div key={label}>
              <label className="block text-sm font-semibold" htmlFor={`f1-${label}`}>{label}</label>
              <input id={`f1-${label}`} className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={value} onChange={(event) => setter(event.target.value)} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {BETA_PRESETS.map((preset) => (
            <button key={preset.value} type="button" className={GHOST_BTN} onClick={() => setBeta(String(preset.value))}>{preset.label}</button>
          ))}
        </div>
      </section>

      {report.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{report.error}</p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            F1 score
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {report.f1 === null ? "—" : report.f1.toFixed(4)}
          </p>
          <p className="mt-1 mb-5 text-sm text-[var(--muted-foreground)]">
            Harmonic mean of precision and recall across {report.total} cases
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--surface-soft)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
          {report.warnings.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-[var(--warning)]">
              {report.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={reset} aria-label="Reset the confusion matrix">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />Reset
            </button>
            <button
              className={PRIMARY_BTN}
              type="button"
              onClick={copyReport}
              aria-label="Copy all confusion matrix metrics"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
