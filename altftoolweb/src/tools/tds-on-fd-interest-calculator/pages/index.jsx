"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

// Section 194A thresholds for bank/co-op/post-office deposits, FY 2025-26 onwards.
const THRESHOLD_REGULAR = 50000;
const THRESHOLD_SENIOR = 100000;
const CESS = 4;

const DEFAULTS = {
  interest: 85000,
  ageBand: "regular",
  pan: "yes",
  form: "none",
  otherIncome: 700000,
  exemptionLimit: 400000,
  slab: 20,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Form 15G / 15H eligibility.
 * 15H: resident, 60+, tax on estimated total income is nil.
 * 15G: resident below 60 (or HUF), tax on estimated total income is nil AND
 *      aggregate interest income does not exceed the basic exemption limit.
 * Neither can be filed without a valid PAN.
 */
function checkDeclaration(form, isSenior, hasPan, totalIncome, interest, exemptionLimit) {
  if (form === "none") return { filed: false, valid: false, reasons: [] };
  const reasons = [];
  if (!hasPan) reasons.push("A valid PAN must be quoted on Form 15G/15H — the declaration is invalid without it.");
  if (form === "15h" && !isSenior) reasons.push("Form 15H is only for resident individuals aged 60 or above.");
  if (form === "15g" && isSenior) reasons.push("Senior citizens must use Form 15H, not Form 15G.");
  if (totalIncome > exemptionLimit) {
    reasons.push(
      `Estimated total income of ${money(totalIncome)} is above the ${money(exemptionLimit)} nil-tax level, so tax on total income is not nil.`,
    );
  }
  if (form === "15g" && interest > exemptionLimit) {
    reasons.push(
      `Form 15G also requires total interest income (${money(interest)}) to stay within the basic exemption limit of ${money(exemptionLimit)}.`,
    );
  }
  return { filed: true, valid: reasons.length === 0, reasons };
}

export default function ToolHome() {
  const [interest, setInterest] = useState(String(DEFAULTS.interest));
  const [ageBand, setAgeBand] = useState(DEFAULTS.ageBand);
  const [pan, setPan] = useState(DEFAULTS.pan);
  const [form, setForm] = useState(DEFAULTS.form);
  const [otherIncome, setOtherIncome] = useState(String(DEFAULTS.otherIncome));
  const [exemptionLimit, setExemptionLimit] = useState(String(DEFAULTS.exemptionLimit));
  const [slab, setSlab] = useState(String(DEFAULTS.slab));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const int = toNumber(interest);
    const other = toNumber(otherIncome);
    const limit = toNumber(exemptionLimit);
    const slabRate = toNumber(slab);

    if ([int, other, limit, slabRate].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (int < 0 || other < 0 || limit < 0) return { error: "Amounts cannot be negative." };
    if (int > 100000000) return { error: "Enter annual FD interest below ₹10 crore." };
    if (limit > 5000000) return { error: "The nil-tax income level looks too high — check the figure." };
    if (slabRate < 0 || slabRate > 42.744) return { error: "Marginal tax rate should be between 0% and 42.744%." };

    const isSenior = ageBand !== "regular";
    const hasPan = pan === "yes";
    const threshold = isSenior ? THRESHOLD_SENIOR : THRESHOLD_REGULAR;
    const crossed = int > threshold;

    const totalIncome = other + int;
    const declaration = checkDeclaration(form, isSenior, hasPan, totalIncome, int, limit);
    const declarationBlocks = declaration.filed && declaration.valid;

    const tdsRate = !crossed || declarationBlocks ? 0 : hasPan ? 10 : 20;
    const tds = (int * tdsRate) / 100;
    const netInterest = int - tds;

    const taxOnInterest = (int * slabRate) / 100;
    const taxWithCess = taxOnInterest * (1 + CESS / 100);
    const balance = taxWithCess - tds;

    return {
      interest: int,
      isSenior,
      hasPan,
      threshold,
      crossed,
      totalIncome,
      declaration,
      declarationBlocks,
      tdsRate,
      tds,
      netInterest,
      taxWithCess,
      balance,
      effectiveTdsShare: int > 0 ? (tds / int) * 100 : 0,
      headroom: Math.max(0, threshold - int),
      slabRate,
    };
  }, [interest, ageBand, pan, form, otherIncome, exemptionLimit, slab]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "TDS on FD Interest Calculator",
      `FD interest for the year: ${money(calc.interest)}`,
      `Section 194A threshold: ${money(calc.threshold)} (${calc.isSenior ? "senior citizen" : "below 60"})`,
      `PAN on record: ${calc.hasPan ? "yes" : "no"}`,
      `Declaration filed: ${form === "none" ? "none" : form.toUpperCase()}${
        calc.declaration.filed ? (calc.declaration.valid ? " (valid)" : " (not eligible)") : ""
      }`,
      `TDS rate applied: ${pct(calc.tdsRate)}`,
      `TDS deducted: ${money2(calc.tds)}`,
      `Net interest credited: ${money2(calc.netInterest)}`,
      `Tax due on this interest at ${pct(calc.slabRate)} + ${CESS}% cess: ${money2(calc.taxWithCess)}`,
      calc.balance >= 0
        ? `Balance still payable: ${money2(calc.balance)}`
        : `Refund expected: ${money2(-calc.balance)}`,
    ].join("\n");
  }, [calc, form]);

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
    setInterest(String(DEFAULTS.interest));
    setAgeBand(DEFAULTS.ageBand);
    setPan(DEFAULTS.pan);
    setForm(DEFAULTS.form);
    setOtherIncome(String(DEFAULTS.otherIncome));
    setExemptionLimit(String(DEFAULTS.exemptionLimit));
    setSlab(String(DEFAULTS.slab));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Section 194A
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TDS on FD Interest Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the TDS your bank will deduct on fixed deposit interest, whether Form 15G or 15H
          can stop it, and what you still owe — or get back — at your slab rate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-interest">
              FD interest with this bank for the year (INR)
            </label>
            <input
              id="tds-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
            />
            <p className={HINT_CLASS}>Interest accrued or credited across all branches of one bank.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-age">
              Depositor age
            </label>
            <select
              id="tds-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageBand}
              onChange={(event) => setAgeBand(event.target.value)}
            >
              <option value="regular">Below 60</option>
              <option value="senior">Senior citizen (60-79)</option>
              <option value="super">Super senior (80+)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-pan">
              PAN updated with the bank?
            </label>
            <select
              id="tds-pan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pan}
              onChange={(event) => setPan(event.target.value)}
            >
              <option value="yes">Yes — PAN on record</option>
              <option value="no">No — TDS at 20% (Section 206AA)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-form">
              Declaration filed
            </label>
            <select
              id="tds-form"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form}
              onChange={(event) => setForm(event.target.value)}
            >
              <option value="none">None</option>
              <option value="15g">Form 15G (below 60)</option>
              <option value="15h">Form 15H (60 and above)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-other-income">
              Other income for the year, excluding this interest (INR)
            </label>
            <input
              id="tds-other-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={otherIncome}
              onChange={(event) => setOtherIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-exemption">
              Income level up to which your tax is nil (INR)
            </label>
            <input
              id="tds-exemption"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={exemptionLimit}
              onChange={(event) => setExemptionLimit(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Basic exemption limit under your regime — ₹4,00,000 under the new regime, ₹2,50,000
              (₹3,00,000 for seniors, ₹5,00,000 for super seniors) under the old regime.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tds-slab">
              Your marginal tax rate on this interest
            </label>
            <select
              id="tds-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {[0, 5, 10, 15, 20, 25, 30].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}% slab
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Health and education cess of {CESS}% is added on top automatically.
            </p>
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  TDS the bank will deduct
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money2(calc.tds)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.tdsRate > 0
                    ? `${pct(calc.tdsRate)} on the full ${money(calc.interest)} of interest`
                    : "No deduction at source on this interest"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy TDS on FD interest result"
                  className={GHOST_BTN}
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
                  "Section 194A threshold that applies to you",
                  `${money(calc.threshold)} (${calc.isSenior ? "senior citizen" : "below 60"})`,
                ],
                [
                  "Threshold status",
                  calc.crossed
                    ? "Crossed — TDS applies to the entire interest"
                    : `Not crossed — ${money(calc.headroom)} of headroom left`,
                ],
                ["TDS rate applied", pct(calc.tdsRate)],
                ["Net interest credited to you", money2(calc.netInterest)],
                ["Tax actually due on this interest", money2(calc.taxWithCess)],
                [
                  calc.balance >= 0 ? "Balance payable at filing" : "Refund expected at filing",
                  money2(Math.abs(calc.balance)),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Form 15G / 15H check</h2>
            {!calc.declaration.filed ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                No declaration selected. With estimated total income of {money(calc.totalIncome)} you
                would{" "}
                {calc.totalIncome <= toNumber(exemptionLimit) ? (
                  <span className="font-semibold text-[var(--success)]">
                    likely qualify for {calc.isSenior ? "Form 15H" : "Form 15G"}
                  </span>
                ) : (
                  <span className="font-semibold text-[var(--foreground)]">not qualify</span>
                )}
                , because a declaration requires tax on total income to be nil.
              </p>
            ) : calc.declaration.valid ? (
              <p className="mt-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--success)] ring-1 ring-[var(--border)]">
                Conditions met — the bank should not deduct TDS once the declaration is on record for
                the financial year. File it at the start of the year, before the first interest
                credit.
              </p>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-semibold text-[var(--danger)]">
                  Not eligible for this declaration:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                  {calc.declaration.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Filing a false declaration attracts penalty and prosecution under Section 277, so
                  TDS has been applied above.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on Section 194A thresholds of ₹50,000 (below 60) and ₹1,00,000
        (senior citizens) applicable from FY 2025-26. Rates and limits change with each Finance Act —
        verify the current year&apos;s figures and consult a tax professional before filing.
      </p>
    </main>
  );
}
