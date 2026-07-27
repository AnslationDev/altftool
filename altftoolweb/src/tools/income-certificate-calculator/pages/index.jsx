"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheckBig, Copy, FileBadge, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CERTIFICATE_PURPOSES,
  INCOME_SOURCES,
  OBC_TEST_YEARS,
  computeCertificateIncome,
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

const DEFAULT_INCOMES = {
  salary: "420000",
  pension: "0",
  agriculture: "180000",
  business: "60000",
  houseRent: "0",
  interestDividend: "24000",
  other: "0",
};

const DEFAULT_ASSETS = {
  agriculturalLandAcres: "2",
  flatAreaSqft: "700",
  plotAreaSqyd: "0",
};

const DEFAULT_CUSTOM_LIMIT = "100000";

export default function ToolHome() {
  const [purpose, setPurpose] = useState("ews");
  const [incomes, setIncomes] = useState(DEFAULT_INCOMES);
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [plotInNotifiedMunicipality, setPlotInNotifiedMunicipality] = useState(true);
  const [customLimit, setCustomLimit] = useState(DEFAULT_CUSTOM_LIMIT);
  const [copied, setCopied] = useState(false);

  const setIncome = (key) => (event) =>
    setIncomes((current) => ({ ...current, [key]: event.target.value }));
  const setAsset = (key) => (event) =>
    setAssets((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeCertificateIncome({
        purpose,
        incomes,
        customLimit,
        assets: { ...assets, plotInNotifiedMunicipality },
      }),
    [purpose, incomes, customLimit, assets, plotInNotifiedMunicipality],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Income Certificate Income Calculator",
      `Certificate: ${result.certificate.label}`,
      `Rule: ${result.certificate.rule}`,
      `Family means: ${result.certificate.family}`,
      `Period tested: ${result.certificate.period}`,
      "",
      `Income counted towards the test: ${money(result.countedTotal)}`,
      `Income excluded by the rule: ${money(result.excludedTotal)}`,
      `Gross family income from all sources: ${money(result.grossTotal)}`,
      `Ceiling: ${money(result.limit)}`,
      `Verdict: ${result.eligible ? "Within the limit" : "Above the limit or disqualified"}`,
    ];
    if (result.assetTests.length > 0) {
      lines.push("", "Asset tests:");
      result.assetTests.forEach((test) =>
        lines.push(`${test.failed ? "FAILED" : "passed"} — ${test.label}`),
      );
    }
    return lines.join("\n");
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
    setPurpose("ews");
    setIncomes(DEFAULT_INCOMES);
    setAssets(DEFAULT_ASSETS);
    setPlotInNotifiedMunicipality(true);
    setCustomLimit(DEFAULT_CUSTOM_LIMIT);
    setCopied(false);
  };

  const showAssets = !hasError && result.certificate.assetTest;
  const showCustomLimit = !hasError && !result.certificate.fixedLimit;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileBadge className="h-4 w-4" aria-hidden="true" />
          Certificates India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Income Certificate Income Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The same income counts differently for each certificate. EWS adds up every source; the OBC
          creamy layer test leaves salary and agricultural income out entirely. Enter the family
          figures once and see both answers, with the EWS asset tests applied.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="icc-purpose">
          Which certificate are you applying for?
        </label>
        <select
          id="icc-purpose"
          className={`mt-2 ${INPUT_CLASS}`}
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        >
          {CERTIFICATE_PURPOSES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        {!hasError && (
          <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">Family means:</span>{" "}
              {result.certificate.family}.
            </p>
            <p className="mt-1">
              <span className="font-semibold text-[var(--foreground)]">Period tested:</span>{" "}
              {result.certificate.period}.
            </p>
            <p className="mt-1">
              <span className="font-semibold text-[var(--foreground)]">Rule:</span>{" "}
              {result.certificate.rule}.
            </p>
          </div>
        )}

        {showCustomLimit && (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="icc-limit">
              Your state&apos;s annual income ceiling (INR)
            </label>
            <input
              id="icc-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10000"
              value={customLimit}
              onChange={(event) => setCustomLimit(event.target.value)}
            />
          </div>
        )}

        <h2 className="mt-6 text-base font-semibold">Annual family income by source (INR)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {INCOME_SOURCES.map((source) => {
            const excluded = !hasError && result.certificate.excludes.includes(source.id);
            return (
              <div key={source.id}>
                <label className={LABEL_CLASS} htmlFor={`icc-${source.id}`}>
                  {source.label}
                  {excluded && (
                    <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                      not counted
                    </span>
                  )}
                </label>
                <input
                  id={`icc-${source.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={incomes[source.id]}
                  onChange={setIncome(source.id)}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{source.hint}</p>
              </div>
            );
          })}
        </div>

        {showAssets && (
          <>
            <h2 className="mt-6 text-base font-semibold">EWS asset tests</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Each of these disqualifies on its own, whatever the income. Property held in different
              locations is clubbed together.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="icc-land">
                  Agricultural land the family holds (acres)
                </label>
                <input
                  id="icc-land"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={assets.agriculturalLandAcres}
                  onChange={setAsset("agriculturalLandAcres")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="icc-flat">
                  Residential flat area (sq ft)
                </label>
                <input
                  id="icc-flat"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={assets.flatAreaSqft}
                  onChange={setAsset("flatAreaSqft")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="icc-plot">
                  Residential plot area (sq yards)
                </label>
                <input
                  id="icc-plot"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={assets.plotAreaSqyd}
                  onChange={setAsset("plotAreaSqyd")}
                />
              </div>
              <label
                className="flex min-h-11 items-center gap-3 self-end rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor="icc-notified"
              >
                <input
                  id="icc-notified"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={plotInNotifiedMunicipality}
                  onChange={(event) => setPlotInNotifiedMunicipality(event.target.checked)}
                />
                <span>The plot is in a notified municipality</span>
              </label>
            </div>
          </>
        )}
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
              Income counted towards the test
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.countedTotal)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.eligible
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError
                ? "Fix the input above to see the total."
                : result.eligible
                  ? `Within the ${money(result.limit)} ceiling`
                  : `Does not meet the ${money(result.limit)} test`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy income certificate calculation"
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
            ["Gross family income from every source", hasError ? DASH : money(result.grossTotal)],
            [
              "Income the rule leaves out of the test",
              hasError ? DASH : money(result.excludedTotal),
            ],
            ["Income counted", hasError ? DASH : money(result.countedTotal)],
            ["Equivalent monthly counted income", hasError ? DASH : money(result.monthlyCounted)],
            ["Ceiling for this certificate", hasError ? DASH : money(result.limit)],
            [
              "Headroom left",
              hasError ? DASH : result.withinLimit ? money(result.headroom) : "None — over the limit",
            ],
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
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Counted income uses ${result.usedShare} percent of the ceiling`}
            >
              <span
                className={`block h-full ${result.withinLimit ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
                style={{ width: `${Math.max(0, Math.min(100, result.usedShare))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{result.verdict}</p>
          </div>
        )}
      </section>

      {!hasError && result.excludedRows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What this rule leaves out</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            For the OBC creamy layer test, income from salary and from agricultural land is excluded
            when applying the income criterion, over {OBC_TEST_YEARS} consecutive years.
          </p>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {result.excludedRows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{row.label}</dt>
                <dd className="text-right font-semibold">{money(row.amount)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {showAssets && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Asset tests</h2>
          <ul className="mt-3 grid gap-3">
            {result.assetTests.map((test) => (
              <li
                key={test.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {test.failed ? (
                    <TriangleAlert className="h-5 w-5 text-[var(--danger)]" />
                  ) : (
                    <CircleCheckBig className="h-5 w-5 text-[var(--success)]" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {test.label}
                    <span className="ml-2 text-xs font-medium text-[var(--muted-foreground)]">
                      {test.failed ? "Disqualifies" : "Passed"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {test.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The OBC income test is one of six categories — service
        in a constitutional post, Group A or Group B, armed forces rank or professional standing can
        place a family in the creamy layer whatever the income. State ceilings and family definitions
        differ, and every certificate is issued only after the revenue authority&apos;s own enquiry.
      </p>
    </main>
  );
}
