"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanFace, ShieldAlert } from "lucide-react";

import {
  MAX_VERIFICATION_CREDIT,
  RED_FLAGS,
  VERIFICATION_STEPS,
  assessDeepfakeRisk,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";

const DASH = "—";

/** Sensible first paint: a plausible "boss asks for a wire transfer" voice note. */
const DEFAULT_FLAGS = ["asks-money", "urgency-secrecy", "new-channel", "voice-texture"];
const DEFAULT_STEPS = [];

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

const FLAG_GROUPS = RED_FLAGS.reduce((groups, flag) => {
  const existing = groups.find((entry) => entry.name === flag.group);
  if (existing) existing.items.push(flag);
  else groups.push({ name: flag.group, items: [flag] });
  return groups;
}, []);

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export default function ToolHome() {
  const [flaggedIds, setFlaggedIds] = useState(DEFAULT_FLAGS);
  const [verifiedIds, setVerifiedIds] = useState(DEFAULT_STEPS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessDeepfakeRisk({ flaggedIds, verifiedIds }),
    [flaggedIds, verifiedIds],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Deepfake awareness assessment",
      `Verdict: ${result.band.label} (${result.residualPercent}% residual risk)`,
      `Red flags present: ${result.flaggedCount} of ${result.totalIndicators} (raw risk ${result.riskPercent}%)`,
      `Verification completed: ${result.verifiedCount} of ${result.totalSteps} (${result.verificationPercent}% of checks)`,
      result.verificationOverdue
        ? "High-stakes ask detected and NOT yet confirmed out of band."
        : null,
      `Next: ${result.action}`,
      result.outstandingSteps.length
        ? `Still to run: ${result.outstandingSteps.map((step) => step.label).join("; ")}`
        : "All verification steps completed.",
    ]
      .filter(Boolean)
      .join("\n");
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
    setFlaggedIds(DEFAULT_FLAGS);
    setVerifiedIds(DEFAULT_STEPS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Raw red-flag score", DASH],
        ["Red flags ticked", DASH],
        ["Verification completed", DASH],
        ["Out-of-band confirmation", DASH],
      ]
    : [
        [
          "Raw red-flag score",
          `${PCT.format(result.riskPercent)}% (${result.flaggedWeight} of ${result.maxFlagWeight} severity points)`,
        ],
        [
          "Red flags ticked",
          `${PCT.format(result.flaggedCount)} of ${PCT.format(result.totalIndicators)}`,
        ],
        [
          "Verification completed",
          `${PCT.format(result.verifiedCount)} of ${PCT.format(result.totalSteps)} steps (${PCT.format(result.verificationPercent)}%)`,
        ],
        [
          "Out-of-band confirmation",
          result.decisiveDone ? "Done — callback or code word passed" : "Not done",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ScanFace className="h-4 w-4" aria-hidden="true" />
          Security &amp; Privacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Deepfake Awareness Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the red flags you can actually see in the video, voice note or call, then tick the
          verification steps you have already run. The score weights each indicator by severity,
          and any request for money, credentials or access is floored at high concern until you
          confirm it out of band.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Red flags you can observe</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Tick only what is genuinely there. Media artifacts alone are weak evidence — modern
          models fix most of them.
        </p>
        {FLAG_GROUPS.map((group) => (
          <fieldset key={group.name} className="mt-5">
            <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {group.name}
            </legend>
            <div className="mt-2 grid gap-2">
              {group.items.map((flag) => (
                <label key={flag.id} className={CHECK_ROW} htmlFor={`flag-${flag.id}`}>
                  <input
                    id={`flag-${flag.id}`}
                    type="checkbox"
                    className={CHECKBOX}
                    checked={flaggedIds.includes(flag.id)}
                    onChange={() => setFlaggedIds((current) => toggle(current, flag.id))}
                  />
                  <span className="leading-6">
                    {flag.label}
                    {flag.highStakes ? (
                      <span className="ml-2 rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                        high stakes
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Verification steps already completed</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Tick a step only if you ran it and it checked out. Completing every step removes at most{" "}
          {PCT.format(MAX_VERIFICATION_CREDIT * 100)}% of the assessed risk — no check is
          conclusive on re-shared, recompressed media.
        </p>
        <div className="mt-3 grid gap-2">
          {VERIFICATION_STEPS.map((step) => (
            <label key={step.id} className={CHECK_ROW} htmlFor={`step-${step.id}`}>
              <input
                id={`step-${step.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={verifiedIds.includes(step.id)}
                onChange={() => setVerifiedIds((current) => toggle(current, step.id))}
              />
              <span className="leading-6">
                {step.label}
                {step.decisive ? (
                  <span className="ml-2 rounded-sm bg-[var(--muted)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                    decisive
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Residual risk after verification
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]}`}
            >
              {hasError ? DASH : `${PCT.format(result.residualPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? DASH : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the deepfake assessment"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.verificationOverdue ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              This is a high-stakes ask and you have not confirmed it out of band yet. Verify before
              you act, whatever the score says.
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the selection above to see a verdict." : result.action}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.groups.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-left text-sm">
              <caption className="sr-only">Red flags ticked by group</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Group
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Flags ticked
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Severity points
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.groups.map((group) => (
                  <tr key={group.group} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">{group.group}</td>
                    <td className="py-2.5 pr-3">
                      {PCT.format(group.flagged)} / {PCT.format(group.count)}
                    </td>
                    <td className="py-2.5 font-semibold">
                      {PCT.format(group.weight)} / {PCT.format(group.maxWeight)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && result.outstandingSteps.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Still to run
            </h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.outstandingSteps.map((step) => (
                <li key={step.id} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    &bull;
                  </span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Awareness aid only, not a detector. The severity weights are editorial ratings, not measured
        probabilities; the indicators and the out-of-band rule follow published FBI IC3, FTC and
        CISA/NSA guidance. If money has already moved, contact your bank and report it to your
        national fraud line.
      </p>
    </main>
  );
}
