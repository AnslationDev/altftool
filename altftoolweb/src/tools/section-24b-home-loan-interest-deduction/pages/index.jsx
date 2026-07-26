"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const SOP_CAP = 200000;
const SOP_REPAIR_CAP = 30000;
const SETOFF_CAP = 200000;
const CESS = 1.04;

const DEFAULTS = {
  regime: "old",
  propertyType: "self",
  loanPurpose: "purchase",
  completedInFiveYears: true,
  annualInterest: "320000",
  preConstruction: "300000",
  annualRent: "300000",
  municipalTaxes: "20000",
  slabRate: "30",
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
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function SegmentedControl({ legend, name, value, options, onChange }) {
  return (
    <fieldset>
      <legend className={LABEL_CLASS}>{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const active = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                className="accent-[var(--primary)]"
                checked={active}
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Section 24(b) of the Income-tax Act, 1961.
 * Self-occupied: interest capped at Rs 2,00,000 (Rs 30,000 for repair/renovation loans or
 * where construction is not completed within 5 years of the end of the FY the loan was taken).
 * Let-out: full interest is deductible, but the resulting house-property loss can be set off
 * against other heads only up to Rs 2,00,000 a year (Section 71(3A)); the rest carries forward
 * for 8 assessment years. Under the new regime (115BAC) the self-occupied deduction is nil and
 * house-property loss cannot be set off against other heads.
 */
function computeSection24b(input) {
  const {
    regime,
    propertyType,
    annualInterest,
    preConstructionTotal,
    loanPurpose,
    completedInFiveYears,
    annualRent,
    municipalTaxes,
    slabRate,
  } = input;

  const preConInstalment = preConstructionTotal > 0 ? preConstructionTotal / 5 : 0;
  const grossInterest = annualInterest + preConInstalment;

  let netAnnualValue = 0;
  let standardDeduction = 0;
  let cap = null;
  let interestAllowed = 0;

  if (propertyType === "self") {
    if (regime === "new") cap = 0;
    else if (loanPurpose === "repair") cap = SOP_REPAIR_CAP;
    else if (!completedInFiveYears) cap = SOP_REPAIR_CAP;
    else cap = SOP_CAP;
    interestAllowed = Math.min(grossInterest, cap);
  } else {
    netAnnualValue = annualRent - municipalTaxes;
    standardDeduction = netAnnualValue > 0 ? netAnnualValue * 0.3 : 0;
    interestAllowed = grossInterest;
  }

  const disallowed = grossInterest - interestAllowed;
  const housePropertyIncome = netAnnualValue - standardDeduction - interestAllowed;
  const loss = housePropertyIncome < 0 ? -housePropertyIncome : 0;
  const setOff = regime === "new" ? 0 : Math.min(loss, SETOFF_CAP);
  const carryForward =
    propertyType === "self" || regime === "new" ? 0 : Math.max(0, loss - setOff);
  const taxSaved = setOff * (slabRate / 100) * CESS;

  return {
    preConInstalment,
    grossInterest,
    netAnnualValue,
    standardDeduction,
    cap,
    interestAllowed,
    disallowed,
    housePropertyIncome,
    loss,
    setOff,
    carryForward,
    taxSaved,
  };
}

export default function ToolHome() {
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [propertyType, setPropertyType] = useState(DEFAULTS.propertyType);
  const [loanPurpose, setLoanPurpose] = useState(DEFAULTS.loanPurpose);
  const [completedInFiveYears, setCompletedInFiveYears] = useState(
    DEFAULTS.completedInFiveYears,
  );
  const [annualInterest, setAnnualInterest] = useState(DEFAULTS.annualInterest);
  const [preConstruction, setPreConstruction] = useState(DEFAULTS.preConstruction);
  const [annualRent, setAnnualRent] = useState(DEFAULTS.annualRent);
  const [municipalTaxes, setMunicipalTaxes] = useState(DEFAULTS.municipalTaxes);
  const [slabRate, setSlabRate] = useState(DEFAULTS.slabRate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const interest = toNumber(annualInterest);
    const preCon = toNumber(preConstruction);
    const rent = toNumber(annualRent);
    const taxes = toNumber(municipalTaxes);
    const slab = toNumber(slabRate);

    if ([interest, preCon, rent, taxes, slab].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (interest < 0 || preCon < 0 || rent < 0 || taxes < 0) {
      return { error: "Amounts cannot be negative." };
    }
    if (slab < 0 || slab > 42.744) {
      return { error: "Marginal tax rate should be between 0% and 42.744%." };
    }
    if (propertyType === "letout" && taxes > rent) {
      return { error: "Municipal taxes paid cannot exceed the annual rent received." };
    }

    return {
      ...computeSection24b({
        regime,
        propertyType,
        annualInterest: interest,
        preConstructionTotal: preCon,
        loanPurpose,
        completedInFiveYears,
        annualRent: rent,
        municipalTaxes: taxes,
        slabRate: slab,
      }),
      slab,
    };
  }, [
    regime,
    propertyType,
    loanPurpose,
    completedInFiveYears,
    annualInterest,
    preConstruction,
    annualRent,
    municipalTaxes,
    slabRate,
  ]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Section 24(b) Home Loan Interest Deduction",
      `Regime: ${regime === "old" ? "Old regime" : "New regime (115BAC)"}`,
      `Property: ${propertyType === "self" ? "Self-occupied" : "Let-out"}`,
      `Interest for the year: ${money(result.grossInterest)}`,
    ];
    if (result.preConInstalment > 0) {
      lines.push(`(includes pre-construction 1/5th: ${money(result.preConInstalment)})`);
    }
    if (propertyType === "letout") {
      lines.push(`Net annual value: ${money(result.netAnnualValue)}`);
      lines.push(`Standard deduction 30%: ${money(result.standardDeduction)}`);
    } else {
      lines.push(`Statutory cap: ${money(result.cap)}`);
    }
    lines.push(`Interest allowed under 24(b): ${money(result.interestAllowed)}`);
    lines.push(
      result.housePropertyIncome < 0
        ? `Loss from house property: ${money(result.loss)}`
        : `Income from house property: ${money(result.housePropertyIncome)}`,
    );
    lines.push(`Set off against other income this year: ${money(result.setOff)}`);
    lines.push(`Carried forward: ${money(result.carryForward)}`);
    lines.push(`Approx tax saved at ${result.slab}% + 4% cess: ${money(result.taxSaved)}`);
    return lines.join("\n");
  }, [result, regime, propertyType]);

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
    setRegime(DEFAULTS.regime);
    setPropertyType(DEFAULTS.propertyType);
    setLoanPurpose(DEFAULTS.loanPurpose);
    setCompletedInFiveYears(DEFAULTS.completedInFiveYears);
    setAnnualInterest(DEFAULTS.annualInterest);
    setPreConstruction(DEFAULTS.preConstruction);
    setAnnualRent(DEFAULTS.annualRent);
    setMunicipalTaxes(DEFAULTS.municipalTaxes);
    setSlabRate(DEFAULTS.slabRate);
    setCopied(false);
  };

  const rows = result.error
    ? []
    : [
        ["Interest paid during the year", money(toNumber(annualInterest) || 0)],
        ["Pre-construction interest (1/5th this year)", money(result.preConInstalment)],
        ["Total interest considered", money(result.grossInterest)],
        ...(propertyType === "letout"
          ? [
              ["Net annual value (rent − municipal taxes)", money(result.netAnnualValue)],
              ["Standard deduction u/s 24(a) — 30% of NAV", `− ${money(result.standardDeduction)}`],
            ]
          : [
              ["Annual value of a self-occupied house", money(0)],
              [
                "Statutory ceiling u/s 24(b)",
                regime === "new" ? "Not available" : money(result.cap),
              ],
            ]),
        ["Interest allowed u/s 24(b)", money(result.interestAllowed)],
        ["Interest disallowed (lost permanently)", money(result.disallowed)],
        [
          result.housePropertyIncome < 0 ? "Loss from house property" : "Income from house property",
          money(Math.abs(result.housePropertyIncome)),
        ],
        ["Set off against salary / other income", money(result.setOff)],
        ["Loss carried forward (up to 8 years)", money(result.carryForward)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Income tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Section 24(b) Home Loan Interest Deduction
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find out how much of your home loan interest is actually deductible — the ₹2,00,000 cap
          for a self-occupied house, the uncapped deduction for a let-out property, the ₹2,00,000
          set-off limit and any loss you carry forward.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-5">
          <SegmentedControl
            legend="Tax regime"
            name="s24b-regime"
            value={regime}
            onChange={setRegime}
            options={[
              { value: "old", label: "Old regime" },
              { value: "new", label: "New regime (115BAC)" },
            ]}
          />
          <SegmentedControl
            legend="Property status"
            name="s24b-property"
            value={propertyType}
            onChange={setPropertyType}
            options={[
              { value: "self", label: "Self-occupied" },
              { value: "letout", label: "Let-out / deemed let-out" },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="s24b-interest">
              Home loan interest paid this year (₹)
            </label>
            <input
              id="s24b-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={annualInterest}
              onChange={(event) => setAnnualInterest(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="s24b-precon">
              Total pre-construction interest (₹)
            </label>
            <input
              id="s24b-precon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={preConstruction}
              onChange={(event) => setPreConstruction(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Claimed in 5 equal instalments from the year construction is completed.
            </p>
          </div>

          {propertyType === "letout" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="s24b-rent">
                  Annual rent received (₹)
                </label>
                <input
                  id="s24b-rent"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={annualRent}
                  onChange={(event) => setAnnualRent(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="s24b-municipal">
                  Municipal taxes paid (₹)
                </label>
                <input
                  id="s24b-municipal"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={municipalTaxes}
                  onChange={(event) => setMunicipalTaxes(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="s24b-purpose">
                  Loan taken for
                </label>
                <select
                  id="s24b-purpose"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={loanPurpose}
                  onChange={(event) => setLoanPurpose(event.target.value)}
                >
                  <option value="purchase">Purchase or construction</option>
                  <option value="repair">Repair, renewal or reconstruction</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="s24b-completed">
                  Construction completed within 5 years?
                </label>
                <select
                  id="s24b-completed"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={completedInFiveYears ? "yes" : "no"}
                  onChange={(event) => setCompletedInFiveYears(event.target.value === "yes")}
                >
                  <option value="yes">Yes — within 5 years</option>
                  <option value="no">No — delayed beyond 5 years</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="s24b-slab">
              Your marginal tax rate (%)
            </label>
            <select
              id="s24b-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slabRate}
              onChange={(event) => setSlabRate(event.target.value)}
            >
              {["0", "5", "10", "15", "20", "25", "30"].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Interest deductible under Section 24(b)
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {money(result.interestAllowed)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                out of {money(result.grossInterest)} interest considered this year
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy Section 24(b) deduction result"
                className={GHOST_BTN}
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

          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-3 text-sm">
            <p className="font-semibold text-[var(--success)]">
              Approximate tax saved this year: {money(result.taxSaved)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {money(result.setOff)} set off at {result.slab}% plus 4% health &amp; education cess.
            </p>
          </div>

          {regime === "new" && (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              Under the new regime, Section 24(b) interest on a self-occupied house is not
              deductible, and a let-out house-property loss cannot be set off against salary or
              other income or carried forward.
            </p>
          )}

          {result.disallowed > 0 && regime === "old" && propertyType === "self" && (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              {money(result.disallowed)} of interest is above the {money(result.cap)} ceiling. Unlike
              a let-out loss, this excess is not carried forward — it is simply not allowed.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on Sections 24, 71(3A) and 115BAC of the Income-tax Act, 1961.
        Principal repayment is claimed separately under Section 80C. Confirm your position with a
        qualified tax adviser before filing.
      </p>
    </main>
  );
}
