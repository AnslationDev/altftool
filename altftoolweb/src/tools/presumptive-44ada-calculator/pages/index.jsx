"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  ADVANCE_TAX_DUE_DATE,
  CASH_SHARE_CAP_PERCENT,
  ELIGIBLE_PROFESSIONS,
  FY_LABEL,
  LIMIT_BASE,
  LIMIT_ENHANCED,
  PRESUMPTIVE_RATE_PERCENT,
  computePresumptive44ADA,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const DEFAULTS = {
  digitalReceipts: "4000000",
  cashReceipts: "0",
  regime: "new",
  age: "35",
  deductions: "0",
  actualProfit: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [digitalReceipts, setDigitalReceipts] = useState(DEFAULTS.digitalReceipts);
  const [cashReceipts, setCashReceipts] = useState(DEFAULTS.cashReceipts);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [age, setAge] = useState(DEFAULTS.age);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  const [actualProfit, setActualProfit] = useState(DEFAULTS.actualProfit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const digital = toNumber(digitalReceipts);
    const cash = toNumber(cashReceipts);
    const parsedAge = toNumber(age);
    const parsedDeductions = deductions.trim() === "" ? 0 : toNumber(deductions);
    const parsedActual = actualProfit.trim() === "" ? null : toNumber(actualProfit);

    if ([digital, cash, parsedAge, parsedDeductions].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers for receipts, age and deductions." };
    }
    if (parsedActual !== null && Number.isNaN(parsedActual)) {
      return { error: "Actual profit from your books must be a number, or left blank." };
    }
    if (parsedActual !== null && parsedActual < 0) {
      return { error: "Actual profit cannot be negative." };
    }

    return computePresumptive44ADA({
      digitalReceipts: digital,
      cashReceipts: cash,
      regime,
      age: parsedAge,
      deductions: parsedDeductions,
      actualProfit: parsedActual,
    });
  }, [digitalReceipts, cashReceipts, regime, age, deductions, actualProfit]);

  const hasError = Boolean(result.error);
  const notEligible = !hasError && !result.eligible;
  const blank = hasError || notEligible;

  const summary = useMemo(() => {
    if (blank) return "";
    return [
      `Section 44ADA presumptive tax — ${result.financialYear}`,
      `Gross receipts: ${money(result.grossReceipts)} (cash share ${pct(result.cashSharePercent)})`,
      `Ceiling that applies: ${money(result.applicableLimit)}`,
      `Presumptive income at 50%: ${money(result.presumptiveIncome)}`,
      `Chapter VI-A deductions allowed: ${money(result.allowedDeductions)}`,
      `Taxable income: ${money(result.taxableIncome)}`,
      `Income tax: ${money(result.tax.tax)}`,
      `Health and education cess: ${money(result.tax.cess)}`,
      `Total tax: ${money(result.tax.total)}`,
      `Effective rate on gross receipts: ${pct(result.effectiveRateOnReceipts)}`,
      `Advance tax due by ${result.advanceTaxDueDate}: ${money(result.advanceTaxPayable)}`,
    ].join("\n");
  }, [blank, result]);

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
    setDigitalReceipts(DEFAULTS.digitalReceipts);
    setCashReceipts(DEFAULTS.cashReceipts);
    setRegime(DEFAULTS.regime);
    setAge(DEFAULTS.age);
    setDeductions(DEFAULTS.deductions);
    setActualProfit(DEFAULTS.actualProfit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          {FY_LABEL}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Presumptive Tax 44ADA Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Section 44ADA lets an eligible professional declare {PRESUMPTIVE_RATE_PERCENT}% of gross
          receipts as profit without keeping books. The ceiling is {money(LIMIT_BASE)}, or{" "}
          {money(LIMIT_ENHANCED)} when cash receipts stay within{" "}
          {CASH_SHARE_CAP_PERCENT}% of total receipts.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ada-digital">
              Digital gross receipts (INR)
            </label>
            <input
              id="ada-digital"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={digitalReceipts}
              onChange={(event) => setDigitalReceipts(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Bank transfer, UPI, card or account payee cheque.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ada-cash">
              Cash gross receipts (INR)
            </label>
            <input
              id="ada-cash"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={cashReceipts}
              onChange={(event) => setCashReceipts(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Includes cheques that are not account payee.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ada-regime">
              Tax regime
            </label>
            <select
              id="ada-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="new">New regime (default, section 115BAC)</option>
              <option value="old">Old regime</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ada-age">
              Age
            </label>
            <input
              id="ada-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ada-deductions">
              Chapter VI-A deductions (INR)
            </label>
            <input
              id="ada-deductions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={deductions}
              onChange={(event) => setDeductions(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              80C, 80D and similar. Ignored under the new regime.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ada-actual">
              Actual profit from your books (optional)
            </label>
            <input
              id="ada-actual"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              placeholder="Leave blank to skip the comparison"
              value={actualProfit}
              onChange={(event) => setActualProfit(event.target.value)}
            />
          </div>
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

      {notEligible ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          Gross receipts of {money(result.grossReceipts)} exceed the {money(result.applicableLimit)}{" "}
          ceiling by {money(result.excessOverLimit)}
          {result.enhancedLimitAvailable
            ? ""
            : `, because cash receipts are ${pct(result.cashSharePercent)} of turnover and the ${CASH_SHARE_CAP_PERCENT}% cap keeps you on the lower ceiling`}
          . Section 44ADA is not available this year, so you must maintain books under section 44AA
          and have them audited under section 44AB.
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Presumptive income at {PRESUMPTIVE_RATE_PERCENT}%
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                blank ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {blank ? "—" : money(result.presumptiveIncome)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {blank
                ? "Bring receipts within the ceiling to see the figures"
                : `Total tax ${money(result.tax.total)} — ${pct(result.effectiveRateOnReceipts)} of gross receipts`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy section 44ADA result"
              className={GHOST_BTN}
              disabled={blank}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Gross receipts", blank ? "—" : money(result.grossReceipts)],
            [
              "Cash share of receipts",
              hasError ? "—" : `${pct(result.cashSharePercent)} (cap ${CASH_SHARE_CAP_PERCENT}%)`,
            ],
            ["Ceiling that applies", hasError ? "—" : money(result.applicableLimit)],
            ["Chapter VI-A deductions allowed", blank ? "—" : money(result.allowedDeductions)],
            ["Taxable income", blank ? "—" : money(result.taxableIncome)],
            ["Income tax before cess", blank ? "—" : money(result.tax.tax)],
            ["Health and education cess at 4%", blank ? "—" : money(result.tax.cess)],
            ["Total tax", blank ? "—" : money(result.tax.total)],
            [
              `Advance tax due by ${ADVANCE_TAX_DUE_DATE}`,
              blank ? "—" : money(result.advanceTaxPayable),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!blank && result.regular ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Presumptive versus your books</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Profit your books show", money(result.regular.profit)],
              ["Taxable income on that basis", money(result.regular.taxableIncome)],
              ["Total tax on that basis", money(result.regular.tax.total)],
              [
                result.regular.savingVsPresumptive >= 0
                  ? "Saved by declaring the lower actual profit"
                  : "Extra tax if you declare the actual profit",
                money(result.regular.savingVsPresumptiveAbs),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {result.regular.auditRequired ? (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              Declaring less than {PRESUMPTIVE_RATE_PERCENT}% while your total income is above the
              exemption limit of {money(result.exemptionLimit)} triggers section 44AA books and a
              section 44AB(d) tax audit. Weigh the audit cost against the tax saved.
            </p>
          ) : result.regular.lowerThanPresumptive ? (
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              Your profit is below the presumptive figure, but total income stays within the
              exemption limit of {money(result.exemptionLimit)}, so no section 44AB audit is
              triggered.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Professions eligible under section 44AA(1)</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {ELIGIBLE_PROFESSIONS.map((profession) => (
            <li
              key={profession}
              className="rounded-full bg-[var(--muted)] px-3 py-1 text-[var(--muted-foreground)]"
            >
              {profession}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Section 44ADA is open to resident individuals and
        partnership firms but not to LLPs or companies, and every deduction under sections 30 to 38
        including depreciation is treated as already allowed. Surcharge, which starts once total
        income crosses Rs 50 lakh, is not modelled here because eligible presumptive income cannot
        reach that level on its own. Confirm your position with a chartered accountant.
      </p>
    </main>
  );
}
