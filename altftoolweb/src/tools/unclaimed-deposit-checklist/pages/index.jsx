"use client";

import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, Check, Copy, RotateCcw } from "lucide-react";

import {
  ASSET_TYPES,
  DEAF_INTEREST_RATE_PERCENT,
  computeChecklistProgress,
  traceUnclaimedAsset,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// A stable first-paint value so the server and client render the same markup.
// A mount effect immediately replaces it with the real current date.
const DEFAULT_AS_OF = "2026-01-01";
const DEFAULTS = {
  assetType: "bank",
  lastActivityDate: "2012-06-15",
  amount: "75000",
};

const STATUS_TONE = {
  active: "text-[var(--success)]",
  dormant: "text-[var(--primary)]",
  transferred: "text-[var(--danger)]",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [assetType, setAssetType] = useState(DEFAULTS.assetType);
  const [lastActivityDate, setLastActivityDate] = useState(DEFAULTS.lastActivityDate);
  const [asOfDate, setAsOfDate] = useState(DEFAULT_AS_OF);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [holderDeceased, setHolderDeceased] = useState(false);
  const [doneSteps, setDoneSteps] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAsOfDate(new Date().toISOString().slice(0, 10));
  }, []);

  const result = useMemo(
    () =>
      traceUnclaimedAsset({
        assetType,
        lastActivityDate,
        asOfDate,
        holderDeceased,
        amount: toNumber(amount),
      }),
    [assetType, lastActivityDate, asOfDate, holderDeceased, amount],
  );

  const hasError = Boolean(result.error);

  const progress = useMemo(
    () => computeChecklistProgress(hasError ? 0 : result.steps.length, doneSteps.length),
    [hasError, result, doneSteps],
  );

  const toggleStep = (id) =>
    setDoneSteps((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Unclaimed Deposit Search Checklist",
      `Asset: ${result.asset.label}`,
      `Time since last activity: ${result.elapsedYears} years`,
      `Status: ${result.statusLabel}`,
      `Currently held: ${result.where}`,
      `Governing rule: ${result.asset.rule}`,
      `Where to search: ${result.asset.portal}`,
      `Estimated recoverable: ${money(result.estimatedRecoverable)}`,
      "",
      "Steps:",
      ...result.steps.map((step, index) => `${index + 1}. ${step.title}`),
      "",
      "Documents:",
      ...result.documents.map((doc) => `• ${doc}`),
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
    setAssetType(DEFAULTS.assetType);
    setLastActivityDate(DEFAULTS.lastActivityDate);
    setAsOfDate(new Date().toISOString().slice(0, 10));
    setAmount(DEFAULTS.amount);
    setHolderDeceased(false);
    setDoneSteps([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
          Banking India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Unclaimed Deposit Search Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it what the asset is and when it was last touched. It works out whether the money is
          still with the institution, has gone inoperative, or has been transferred to DEAF, IEPF or
          the Senior Citizens&apos; Welfare Fund — then gives you the claim steps and papers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="udc-type">
              What are you tracing?
            </label>
            <select
              id="udc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assetType}
              onChange={(event) => setAssetType(event.target.value)}
            >
              {ASSET_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="udc-last">
              Date of last activity or maturity
            </label>
            <input
              id="udc-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastActivityDate}
              onChange={(event) => setLastActivityDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="udc-asof">
              Measure up to
            </label>
            <input
              id="udc-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="udc-amount">
              Approximate amount, if you know it (INR)
            </label>
            <input
              id="udc-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          htmlFor="udc-deceased"
        >
          <input
            id="udc-deceased"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={holderDeceased}
            onChange={(event) => setHolderDeceased(event.target.checked)}
          />
          <span>The holder has died and I am claiming as nominee or legal heir</span>
        </label>
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
              Time since last activity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.elapsedYears} yrs`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${hasError ? "text-[var(--muted-foreground)]" : STATUS_TONE[result.status]}`}
            >
              {hasError ? "Fix the input above to see the status." : result.statusLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the unclaimed deposit checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Where the money is now", hasError ? DASH : result.where],
            ["Rule that governs it", hasError ? DASH : result.asset.rule],
            ["The clock runs from", hasError ? DASH : result.asset.clockFrom],
            [
              "Years already spent in the statutory fund",
              hasError ? DASH : result.transferred ? `${result.yearsInFund}` : "Not transferred",
            ],
            [
              "Time to the next stage",
              hasError
                ? DASH
                : result.nextStageLabel
                  ? `${result.yearsToNextStage} yrs to ${result.nextStageLabel}`
                  : "No further stage applies",
            ],
            ["Amount you entered", hasError ? DASH : money(result.amount)],
            [
              `Interest added by DEAF at ${DEAF_INTEREST_RATE_PERCENT}% simple`,
              hasError ? DASH : result.asset.earnsDeafInterest ? money(result.deafInterest) : "Not applicable",
            ],
            ["Estimated amount recoverable", hasError ? DASH : money(result.estimatedRecoverable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Search here first: {result.asset.portal}.
            {result.displayThresholdNote ? ` ${result.displayThresholdNote}` : ""}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Your claim steps</h2>
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">
              {progress.done} of {progress.total} done ({progress.percent}%)
            </p>
          </div>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${progress.percent} percent of the claim steps are complete`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <ol className="mt-4 grid gap-3">
            {result.steps.map((step, index) => (
              <li key={step.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  htmlFor={`udc-step-${step.id}`}
                >
                  <input
                    id={`udc-step-${step.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={doneSteps.includes(step.id)}
                    onChange={() => toggleStep(step.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {index + 1}. {step.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {step.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Papers to gather</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.documents.map((doc) => (
              <li key={doc} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-[var(--muted-foreground)]">{doc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Transfer to a statutory fund does not extinguish your
        right to claim — you still apply through the bank, company or insurer, which pays you and
        then recovers from the fund. Claim formats and settlement limits differ between
        institutions, so confirm the current form before you file.
      </p>
    </main>
  );
}
