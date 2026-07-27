"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import {
  DUE_DATE_PRESETS,
  EXEMPTION_LIMIT_OPTIONS,
  computeLateFilingFee,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  income: "900000",
  exemptionId: EXEMPTION_LIMIT_OPTIONS[0].id,
  dueDate: "2025-07-31",
  filingDate: "2025-09-10",
  unpaidTax: "25000",
  mustFile: false,
};

const DASH = "—";

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [exemptionId, setExemptionId] = useState(DEFAULTS.exemptionId);
  const [dueDate, setDueDate] = useState(DEFAULTS.dueDate);
  const [filingDate, setFilingDate] = useState(DEFAULTS.filingDate);
  const [unpaidTax, setUnpaidTax] = useState(DEFAULTS.unpaidTax);
  const [mustFile, setMustFile] = useState(DEFAULTS.mustFile);
  const [copied, setCopied] = useState(false);

  const exemption =
    EXEMPTION_LIMIT_OPTIONS.find((option) => option.id === exemptionId) ??
    EXEMPTION_LIMIT_OPTIONS[0];

  const result = useMemo(
    () =>
      computeLateFilingFee({
        totalIncome: income.trim() === "" ? Number.NaN : Number(income),
        exemptionLimit: exemption.limit,
        dueDate,
        filingDate,
        taxOutstanding: unpaidTax.trim() === "" ? 0 : Number(unpaidTax),
        mustFileAnyway: mustFile,
      }),
    [income, exemption.limit, dueDate, filingDate, unpaidTax, mustFile],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 234F late filing fee",
      `Total income: ${money(result.totalIncome)}`,
      `Due date u/s 139(1): ${dueDate}`,
      `Return furnished on: ${filingDate}`,
      `Delay: ${NUM.format(result.daysLate)} days`,
      `Section 234F fee: ${money(result.lateFee)}`,
      `Section 234A interest (${result.interestMonths} month(s) @ 1%): ${money(result.interest234A)}`,
      `Total extra payable: ${money(result.totalPayable)}`,
    ].join("\n");
  }, [hasError, result, dueDate, filingDate]);

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
    setIncome(DEFAULTS.income);
    setExemptionId(DEFAULTS.exemptionId);
    setDueDate(DEFAULTS.dueDate);
    setFilingDate(DEFAULTS.filingDate);
    setUnpaidTax(DEFAULTS.unpaidTax);
    setMustFile(DEFAULTS.mustFile);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    const year = Number(dueDate.slice(0, 4));
    const safeYear = Number.isFinite(year) && year > 1900 ? year : 2025;
    const month = String(preset.month).padStart(2, "0");
    const day = String(preset.day).padStart(2, "0");
    setDueDate(`${safeYear}-${month}-${day}`);
  };

  const rows = hasError
    ? [
        ["Section 234F fee", DASH],
        ["Delay beyond due date", DASH],
        ["Section 234A interest", DASH],
        ["Total extra payable", DASH],
      ]
    : [
        ["Section 234F fee", money(result.lateFee)],
        ["Delay beyond due date", `${NUM.format(result.daysLate)} days`],
        [
          `Section 234A interest (${result.interestMonths} month${result.interestMonths === 1 ? "" : "s"} @ 1%)`,
          money(result.interest234A),
        ],
        ["Unpaid self-assessment tax used", money(result.unpaidTax)],
        ["Basic exemption limit applied", money(result.exemptionLimit)],
        ["Total extra payable", money(result.totalPayable)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Belated ITR
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Late Filing Fee Calculator — Section 234F
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your total income and the date you filed to see the section 234F fee, plus the
          section 234A interest of 1% per month or part month on any self-assessment tax still
          unpaid.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="f234-income">
              Total income for the year (INR)
            </label>
            <input
              id="f234-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f234-exemption">
              Basic exemption limit
            </label>
            <select
              id="f234-exemption"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exemptionId}
              onChange={(event) => setExemptionId(event.target.value)}
            >
              {EXEMPTION_LIMIT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f234-due">
              Due date under section 139(1)
            </label>
            <input
              id="f234-due"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f234-filed">
              Date the return is furnished
            </label>
            <input
              id="f234-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filingDate}
              onChange={(event) => setFilingDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="f234-tax">
              Self-assessment tax still unpaid on the due date (INR)
            </label>
            <input
              id="f234-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={unpaidTax}
              onChange={(event) => setUnpaidTax(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Tax on total income less TDS, TCS, advance tax and reliefs already credited. Leave 0
              if nothing was outstanding.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DUE_DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="f234-must"
        >
          <input
            id="f234-must"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={mustFile}
            onChange={(event) => setMustFile(event.target.checked)}
          />
          Filing was compulsory anyway (seventh proviso to section 139(1) — large deposits, foreign
          travel spend, high electricity bill, high turnover or high TDS)
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
              Section 234F fee
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.lateFee)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.feeReason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the section 234F late fee result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

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
        <h2 className="text-base font-semibold">How the fee is fixed</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Situation
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Fee u/s 234F
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Return filed on or before the due date", money(0)],
                ["Total income below the basic exemption limit and no other filing trigger", money(0)],
                ["Late, total income up to Rs 5,00,000", money(1000)],
                ["Late, total income above Rs 5,00,000", money(5000)],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 text-right font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. The fee under section 234F is charged when the return is
        furnished after the due date under section 139(1); interest under sections 234B and 234C may
        apply separately. Confirm the final figure in your ITR utility or with a chartered
        accountant.
      </p>
    </main>
  );
}
