"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, RotateCcw, ScanSearch } from "lucide-react";

import {
  GOALS,
  MAX_PHOTOS,
  RISK_FACTORS,
  formatDuration,
  formatPlan,
  planReverseImageAudit,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULT_FACTORS = {
  showsFace: true,
  reusedAcrossSites: true,
  showsHome: false,
  showsPlate: false,
  showsBadge: false,
  hasGpsExif: false,
  showsChildren: false,
};

const DEFAULTS = { photoCount: "5", goal: "duplicate", factors: DEFAULT_FACTORS };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const RATING_WORDS = ["Cannot do this", "Weak", "Good", "Best in class"];

export default function ToolHome() {
  const [photoCount, setPhotoCount] = useState(DEFAULTS.photoCount);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [factors, setFactors] = useState(DEFAULTS.factors);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => planReverseImageAudit({ photoCount, goal, factors }),
    [photoCount, goal, factors],
  );
  const plan = useMemo(() => formatPlan(result), [result]);
  const hasError = Boolean(result.error);

  const toggleFactor = (id) =>
    setFactors((current) => ({ ...current, [id]: !current[id] }));

  const reset = () => {
    setPhotoCount(DEFAULTS.photoCount);
    setGoal(DEFAULTS.goal);
    setFactors(DEFAULTS.factors);
    setCopied(false);
  };

  const copyPlan = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          Self OSINT audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Image Reverse Search Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe what your profile photos contain and get an ordered audit plan: which reverse
          image engines can actually answer your question, which crops to submit, and roughly how
          long the pass takes. No photo is uploaded here.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-count">
              Photos to audit
            </label>
            <input
              id="rip-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PHOTOS}
              step="1"
              value={photoCount}
              onChange={(event) => setPhotoCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rip-goal">
              What are you trying to find?
            </label>
            <select
              id="rip-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {Object.values(GOALS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What do these photos contain?</legend>
          <div className="mt-3 grid gap-2">
            {RISK_FACTORS.map((factor) => (
              <label
                key={factor.id}
                htmlFor={`rip-${factor.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`rip-${factor.id}`}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(factors[factor.id])}
                  onChange={() => toggleFactor(factor.id)}
                />
                <span>
                  <span className="font-semibold">{factor.label}</span>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                    +{factor.weight}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Exposure score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.riskScore}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the plan." : `${result.band.label} — ${result.band.advice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPlan}
              aria-label="Copy the reverse image audit plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Photos in this pass", hasError ? "—" : NUM.format(result.photoCount)],
            ["Versions to submit per photo", hasError ? "—" : NUM.format(result.crops.length)],
            ["Engines worth running", hasError ? "—" : NUM.format(result.usableEngines.length)],
            ["Total searches", hasError ? "—" : NUM.format(result.checks)],
            ["Hands-on time", hasError ? "—" : formatDuration(result.estimatedMinutes)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Exposure score ${result.riskScore} out of 100, band ${result.band.label}`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Step 1 — submit these versions of each photo</h2>
            <ol className="mt-4 space-y-3">
              {result.crops.map((crop, index) => (
                <li key={crop.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6">
                    <span className="font-semibold">{crop.label}</span>
                    <span className="block text-[var(--muted-foreground)]">{crop.why}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Step 2 — run them in this order</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Ranked for your chosen goal: {result.goal.label.toLowerCase()}.
            </p>
            <ul className="mt-4 space-y-3">
              {result.engines.map((engine) => {
                const usable = engine.primaryRating > 0;
                return (
                  <li
                    key={engine.id}
                    className={`rounded-lg border p-3 ${usable ? "border-[var(--border)]" : "border-[var(--border)] opacity-60"}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{engine.name}</span>
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                        {RATING_WORDS[engine.primaryRating]}
                      </span>
                      {engine.free && (
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{engine.note}</p>
                    {engine.url && (
                      <a
                        href={engine.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`mt-3 ${GHOST_BTN}`}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Open
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Step 3 — fix what you found</h2>
            <ol className="mt-4 space-y-3">
              {result.remediation.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {result.activeFactors.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Factor</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                      <th scope="col" className="py-2 font-semibold">Why it matters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.activeFactors.map((factor) => (
                      <tr key={factor.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{factor.label}</td>
                        <td className="py-2 pr-3 text-right">{factor.weight}</td>
                        <td className="py-2 text-[var(--muted-foreground)]">{factor.advice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Audit your own images only. Uploading a photo to a third-party engine sends it to that
        company — pay particular attention before submitting a face to any paid face-search
        service, since you are handing over the exact biometric you are trying to protect.
      </p>
    </main>
  );
}
