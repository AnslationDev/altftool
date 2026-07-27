"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, RotateCcw } from "lucide-react";

import { computeBonusTax } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  fixedSalary: "1500000",
  bonus: "300000",
  regime: "new",
  chapterVIA: "0",
  otherExemptions: "0",
  monthsRemaining: "3",
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
  const [fixedSalary, setFixedSalary] = useState(DEFAULTS.fixedSalary);
  const [bonus, setBonus] = useState(DEFAULTS.bonus);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [chapterVIA, setChapterVIA] = useState(DEFAULTS.chapterVIA);
  const [otherExemptions, setOtherExemptions] = useState(DEFAULTS.otherExemptions);
  const [monthsRemaining, setMonthsRemaining] = useState(DEFAULTS.monthsRemaining);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBonusTax({
        fixedSalary: toNumber(fixedSalary),
        bonus: toNumber(bonus),
        regime,
        chapterVIA: regime === "old" ? toNumber(chapterVIA) : 0,
        otherExemptions: regime === "old" ? toNumber(otherExemptions) : 0,
        monthsRemaining: toNumber(monthsRemaining),
      }),
    [fixedSalary, bonus, regime, chapterVIA, otherExemptions, monthsRemaining],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Variable Pay & Bonus Tax",
      `Regime: ${result.regime === "new" ? "New (115BAC)" : "Old"}`,
      `Fixed annual salary: ${money(result.fixedSalary)}`,
      `Bonus / variable pay: ${money(result.bonus)}`,
      `Tax without bonus: ${money(result.taxWithoutBonus)}`,
      `Tax with bonus: ${money(result.taxWithBonus)}`,
      `Extra tax caused by the bonus: ${money(result.taxOnBonus)}`,
      `Bonus in hand: ${money(result.netBonus)}`,
      `Effective rate on the bonus: ${pct(result.effectiveBonusRate)}`,
      `Extra TDS per remaining payroll month: ${money(result.monthlyTdsImpact)}`,
    ].join("\n");
  }, [failed, result]);

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
    setFixedSalary(DEFAULTS.fixedSalary);
    setBonus(DEFAULTS.bonus);
    setRegime(DEFAULTS.regime);
    setChapterVIA(DEFAULTS.chapterVIA);
    setOtherExemptions(DEFAULTS.otherExemptions);
    setMonthsRemaining(DEFAULTS.monthsRemaining);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Tax without the bonus", DASH],
        ["Tax with the bonus", DASH],
        ["Bonus in hand after tax", DASH],
        ["Effective rate on the bonus", DASH],
        ["Your top slab rate", DASH],
        ["Surcharge included", DASH],
        ["Health & education cess included", DASH],
        ["Extra TDS per remaining payroll month", DASH],
      ]
    : [
        ["Tax without the bonus", money(result.taxWithoutBonus)],
        ["Tax with the bonus", money(result.taxWithBonus)],
        ["Bonus in hand after tax", money(result.netBonus)],
        ["Effective rate on the bonus", pct(result.effectiveBonusRate)],
        ["Your top slab rate", pct(result.marginalRate)],
        [
          "Surcharge included",
          result.surchargeWithBonus > 0
            ? `${money(result.surchargeWithBonus)} (${pct(result.surchargeRate)})`
            : "None",
        ],
        ["Health & education cess included", money(result.cessWithBonus)],
        [
          `Extra TDS per remaining payroll month (${result.monthsRemaining})`,
          money(result.monthlyTdsImpact),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Salary &amp; payroll
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Variable Pay and Bonus Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A bonus is not taxed at a flat rate — it is stacked on top of your salary. This shows the
          incremental tax it creates for FY 2025-26, the amount you actually keep, and how much extra
          TDS payroll will recover each remaining month.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vp-salary">
              Fixed annual salary, before bonus (INR)
            </label>
            <input
              id="vp-salary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={fixedSalary}
              onChange={(event) => setFixedSalary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vp-bonus">
              Bonus / variable pay (INR)
            </label>
            <input
              id="vp-bonus"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={bonus}
              onChange={(event) => setBonus(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vp-regime">
              Tax regime
            </label>
            <select
              id="vp-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="new">New regime (Section 115BAC, default)</option>
              <option value="old">Old regime (with deductions)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vp-months">
              Payroll months left in the year
            </label>
            <input
              id="vp-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={monthsRemaining}
              onChange={(event) => setMonthsRemaining(event.target.value)}
            />
          </div>
          {regime === "old" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="vp-80c">
                  Chapter VI-A deductions — 80C, 80D, NPS (INR)
                </label>
                <input
                  id="vp-80c"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5000"
                  value={chapterVIA}
                  onChange={(event) => setChapterVIA(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="vp-exempt">
                  Exempt allowances — HRA, LTA (INR)
                </label>
                <input
                  id="vp-exempt"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5000"
                  value={otherExemptions}
                  onChange={(event) => setOtherExemptions(event.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Extra tax caused by the bonus
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.taxOnBonus)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : `${money(result.bonus)} bonus, taxed at an effective ${pct(result.effectiveBonusRate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy bonus tax result"
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
              aria-label="Reset all inputs"
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for FY 2025-26 using the Section 115BAC slabs, the Section 16(ia)
        standard deduction, the Section 87A rebate with marginal relief, surcharge with marginal
        relief and 4% cess. Retention bonuses, ESOP perquisites, joining-bonus clawbacks and
        arrears under Section 89 are not modelled — confirm your final position with a chartered
        accountant.
      </p>
    </main>
  );
}
