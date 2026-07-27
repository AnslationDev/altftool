"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheckBig, CircleX, Copy, RotateCcw, Vault } from "lucide-react";

import {
  BANK_LIABILITY_RENT_MULTIPLE,
  BANK_LIABLE_EVENTS,
  BANK_NOT_LIABLE_EVENTS,
  CENTRE_TYPES,
  LOCKER_SIZES,
  SECURITY_DEPOSIT_YEARS_OF_RENT,
  estimateLockerCost,
  indicativeRent,
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

const DEFAULTS = {
  size: "medium",
  centre: "metro",
  annualRent: "4000",
  years: "3",
  fdRatePercent: "6.5",
  contentsValue: "1500000",
  insuranceRatePercent: "1",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [size, setSize] = useState(DEFAULTS.size);
  const [centre, setCentre] = useState(DEFAULTS.centre);
  const [annualRent, setAnnualRent] = useState(DEFAULTS.annualRent);
  const [years, setYears] = useState(DEFAULTS.years);
  const [fdRatePercent, setFdRatePercent] = useState(DEFAULTS.fdRatePercent);
  const [contentsValue, setContentsValue] = useState(DEFAULTS.contentsValue);
  const [insuranceRatePercent, setInsuranceRatePercent] = useState(DEFAULTS.insuranceRatePercent);
  const [requireTermDeposit, setRequireTermDeposit] = useState(true);
  const [copied, setCopied] = useState(false);

  const applyPreset = (nextSize, nextCentre) => {
    setSize(nextSize);
    setCentre(nextCentre);
    const rent = indicativeRent(nextSize, nextCentre);
    if (rent > 0) setAnnualRent(String(rent));
  };

  const result = useMemo(
    () =>
      estimateLockerCost({
        annualRent: toNumber(annualRent),
        years: toNumber(years),
        requireTermDeposit,
        fdRatePercent: toNumber(fdRatePercent),
        contentsValue: toNumber(contentsValue),
        insuranceRatePercent: toNumber(insuranceRatePercent),
      }),
    [annualRent, years, requireTermDeposit, fdRatePercent, contentsValue, insuranceRatePercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Locker Rent and Insurance Cost Estimator",
      `Annual rent: ${money(result.annualRent)} plus ${result.gstPercent}% GST = ${money(result.annualRentWithGst)}`,
      `Rent over ${result.years} year(s): ${money(result.rentOverTerm)}`,
      `Security term deposit blocked: ${money(result.securityDeposit)}`,
      `Bank's maximum liability (${BANK_LIABILITY_RENT_MULTIPLE}x annual rent): ${money(result.bankMaxLiability)}`,
      `Contents value: ${money(result.contentsValue)}`,
      `Uninsured gap: ${money(result.uninsuredGap)}`,
      `Separate contents cover: ${money(result.annualInsurancePremium)} a year`,
      `Total cost over the period: ${money(result.totalCost)}`,
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
    setSize(DEFAULTS.size);
    setCentre(DEFAULTS.centre);
    setAnnualRent(DEFAULTS.annualRent);
    setYears(DEFAULTS.years);
    setFdRatePercent(DEFAULTS.fdRatePercent);
    setContentsValue(DEFAULTS.contentsValue);
    setInsuranceRatePercent(DEFAULTS.insuranceRatePercent);
    setRequireTermDeposit(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Vault className="h-4 w-4" aria-hidden="true" />
          Banking India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Locker Rent and Insurance Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What a bank locker actually costs: rent plus 18% GST, the term deposit the bank may block
          as security, and the gap between what you keep inside and the RBI cap on the bank&apos;s
          liability of {BANK_LIABILITY_RENT_MULTIPLE} times the annual rent.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Locker size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LOCKER_SIZES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={size === option.id}
                onClick={() => applyPreset(option.id, centre)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  size === option.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Branch centre</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CENTRE_TYPES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={centre === option.id}
                onClick={() => applyPreset(size, option.id)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  centre === option.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            These buttons only pre-fill an indicative rent. Locker rent is not regulated — replace it
            with the figure from your bank&apos;s schedule of charges.
          </p>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lkr-rent">
              Annual locker rent before GST (INR)
            </label>
            <input
              id="lkr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={annualRent}
              onChange={(event) => setAnnualRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lkr-years">
              How many years will you keep it?
            </label>
            <input
              id="lkr-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="50"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lkr-fd">
              Fixed deposit rate on the security deposit (% per year)
            </label>
            <input
              id="lkr-fd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={fdRatePercent}
              onChange={(event) => setFdRatePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lkr-contents">
              Value of what you will keep inside (INR)
            </label>
            <input
              id="lkr-contents"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={contentsValue}
              onChange={(event) => setContentsValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lkr-ins">
              Contents insurance premium rate (% of value per year)
            </label>
            <input
              id="lkr-ins"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={insuranceRatePercent}
              onChange={(event) => setInsuranceRatePercent(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          htmlFor="lkr-td"
        >
          <input
            id="lkr-td"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={requireTermDeposit}
            onChange={(event) => setRequireTermDeposit(event.target.checked)}
          />
          <span>
            My bank asks for a security term deposit ({SECURITY_DEPOSIT_YEARS_OF_RENT} years&apos;
            rent)
          </span>
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
              Total cost over the period
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the total."
                : `${money(result.costPerYear)} a year, about ${money(result.costPerMonth)} a month, rent and contents cover together`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy locker cost estimate"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            [
              `Annual rent plus ${hasError ? DASH : result.gstPercent}% GST`,
              hasError ? DASH : money(result.annualRentWithGst),
            ],
            [
              `Rent over ${hasError ? DASH : result.years} year(s)`,
              hasError ? DASH : money(result.rentOverTerm),
            ],
            ["Term deposit blocked as security", hasError ? DASH : money(result.securityDeposit)],
            [
              "Interest that deposit earns over the period",
              hasError ? DASH : money(result.depositInterest),
            ],
            [
              `Bank's maximum liability (${BANK_LIABILITY_RENT_MULTIPLE}x annual rent)`,
              hasError ? DASH : money(result.bankMaxLiability),
            ],
            ["Value of contents you plan to keep", hasError ? DASH : money(result.contentsValue)],
            ["Uninsured gap the bank will not cover", hasError ? DASH : money(result.uninsuredGap)],
            [
              "Separate contents cover, per year",
              hasError ? DASH : money(result.annualInsurancePremium),
            ],
            [
              "Net cost after deposit interest",
              hasError ? DASH : money(result.netCostAfterDepositInterest),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`The bank's capped liability covers ${result.coveredShare}% of your contents`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, result.coveredShare))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{result.verdict}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Bank is liable, up to the cap</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {BANK_LIABLE_EVENTS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CircleCheckBig
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--muted-foreground)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Bank is not liable at all</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {BANK_NOT_LIABLE_EVENTS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
                <span className="text-[var(--muted-foreground)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Liability rules come from the RBI circular of 18 August 2021 in force
        from 1 January 2022; rents, break-open charges and insurance premiums vary by bank and
        insurer. Read your locker agreement and speak to your insurer before deciding what to store.
      </p>
    </main>
  );
}
