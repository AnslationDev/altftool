"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Copy, RotateCcw } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tax engine — Finance Act 2025 rates (FY 2025-26 / AY 2026-27)        */
/* ------------------------------------------------------------------ */

const NEW_REGIME_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

const OLD_REGIME_SLABS = {
  below60: [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  senior: [
    [300000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  superSenior: [
    [500000, 0],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
};

function slabTax(income, slabs) {
  let tax = 0;
  let last = 0;
  for (const [ceiling, rate] of slabs) {
    if (income <= last) break;
    const taxableHere = Math.min(income, ceiling) - last;
    tax += taxableHere * rate;
    last = ceiling;
  }
  return tax;
}

const SURCHARGE_BANDS_NEW = [
  [5000000, 0.1],
  [10000000, 0.15],
  [20000000, 0.25],
];

const SURCHARGE_BANDS_OLD = [
  [5000000, 0.1],
  [10000000, 0.15],
  [20000000, 0.25],
  [50000000, 0.37],
];

/**
 * Full income-tax computation on normal-rate income.
 * Handles slab tax, 87A rebate (with marginal relief in the new regime),
 * surcharge with marginal relief, and 4% health & education cess.
 */
function computeIncomeTax(taxableIncome, regime, ageBand) {
  const income = Math.max(0, taxableIncome);
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[ageBand] || OLD_REGIME_SLABS.below60;
  const bands = regime === "new" ? SURCHARGE_BANDS_NEW : SURCHARGE_BANDS_OLD;

  const baseTax = slabTax(income, slabs);

  // Section 87A rebate
  let rebate = 0;
  if (regime === "new") {
    if (income <= 1200000) {
      rebate = Math.min(baseTax, 60000);
    } else {
      // Marginal relief: tax cannot exceed income over the ₹12,00,000 threshold.
      const excess = income - 1200000;
      if (baseTax > excess) rebate = baseTax - excess;
    }
  } else if (income <= 500000) {
    rebate = Math.min(baseTax, 12500);
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate);

  // Surcharge with marginal relief
  let surcharge = 0;
  let bandIndex = -1;
  for (let i = 0; i < bands.length; i += 1) {
    if (income > bands[i][0]) bandIndex = i;
  }
  if (bandIndex >= 0) {
    const [threshold, rate] = bands[bandIndex];
    const prevRate = bandIndex === 0 ? 0 : bands[bandIndex - 1][1];
    surcharge = taxAfterRebate * rate;
    const taxAtThreshold = slabTax(threshold, slabs);
    const cap = taxAtThreshold * (1 + prevRate) + (income - threshold);
    if (taxAfterRebate + surcharge > cap) {
      surcharge = Math.max(0, cap - taxAfterRebate);
    }
  }

  const cess = (taxAfterRebate + surcharge) * 0.04;
  const total = taxAfterRebate + surcharge + cess;

  return {
    baseTax: round2(baseTax),
    rebate: round2(rebate),
    surcharge: round2(surcharge),
    cess: round2(cess),
    total: round2(total),
  };
}

const round2 = (value) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

/* ------------------------------------------------------------------ */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? Math.round(value) : 0);

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DEFAULTS = {
  fyStart: "2026",
  receipts: "2400000",
  expenses: "400000",
  otherIncome: "40000",
  deductions: "150000",
  tdsDeducted: "90000",
  alreadyPaid: "0",
  regime: "new",
  ageBand: "below60",
  presumptive: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [fyStart, setFyStart] = useState(DEFAULTS.fyStart);
  const [receipts, setReceipts] = useState(DEFAULTS.receipts);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [otherIncome, setOtherIncome] = useState(DEFAULTS.otherIncome);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  const [tdsDeducted, setTdsDeducted] = useState(DEFAULTS.tdsDeducted);
  const [alreadyPaid, setAlreadyPaid] = useState(DEFAULTS.alreadyPaid);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [ageBand, setAgeBand] = useState(DEFAULTS.ageBand);
  const [presumptive, setPresumptive] = useState(DEFAULTS.presumptive);
  const [copied, setCopied] = useState(false);
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const validation = useMemo(() => {
    const fields = [
      ["gross receipts", receipts],
      ["business expenses", expenses],
      ["other income", otherIncome],
      ["deductions", deductions],
      ["TDS already deducted", tdsDeducted],
      ["advance tax already paid", alreadyPaid],
    ];
    for (const [label, value] of fields) {
      const parsed = num(value);
      if (!Number.isFinite(parsed)) return `Enter a valid number for ${label}.`;
      if (parsed < 0) return `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be negative.`;
      if (parsed > 1e11) return `${label.charAt(0).toUpperCase()}${label.slice(1)} is unrealistically large.`;
    }
    if (num(expenses) > num(receipts)) {
      return "Business expenses cannot exceed gross professional receipts.";
    }
    if (presumptive && num(receipts) > 7500000) {
      return "Presumptive taxation under 44ADA is not available above ₹75,00,000 of gross receipts.";
    }
    return "";
  }, [receipts, expenses, otherIncome, deductions, tdsDeducted, alreadyPaid, presumptive]);

  const result = useMemo(() => {
    if (validation) return null;
    const gross = num(receipts);
    const professionalIncome = presumptive
      ? gross * 0.5
      : Math.max(0, gross - num(expenses));
    const grossTotalIncome = professionalIncome + num(otherIncome);
    const allowedDeductions = regime === "old" ? Math.min(num(deductions), grossTotalIncome) : 0;
    const taxableIncome = Math.max(0, grossTotalIncome - allowedDeductions);

    const tax = computeIncomeTax(taxableIncome, regime, ageBand);
    const afterTds = Math.max(0, tax.total - num(tdsDeducted));
    const liable = afterTds >= 10000;
    const netPayable = Math.max(0, afterTds - num(alreadyPaid));

    const year = Number(fyStart);
    const schedule = presumptive
      ? [{ label: "Single instalment", cumulativePct: 1, due: new Date(year + 1, 2, 15) }]
      : [
          { label: "1st instalment", cumulativePct: 0.15, due: new Date(year, 5, 15) },
          { label: "2nd instalment", cumulativePct: 0.45, due: new Date(year, 8, 15) },
          { label: "3rd instalment", cumulativePct: 0.75, due: new Date(year, 11, 15) },
          { label: "4th instalment", cumulativePct: 1, due: new Date(year + 1, 2, 15) },
        ];

    let previousCumulative = 0;
    const instalments = schedule.map((item) => {
      const cumulative = round2(afterTds * item.cumulativePct);
      const amount = round2(cumulative - previousCumulative);
      previousCumulative = cumulative;
      return { ...item, cumulative, amount };
    });

    return {
      professionalIncome: round2(professionalIncome),
      grossTotalIncome: round2(grossTotalIncome),
      allowedDeductions: round2(allowedDeductions),
      taxableIncome: round2(taxableIncome),
      tax,
      afterTds: round2(afterTds),
      liable,
      netPayable: round2(netPayable),
      instalments,
    };
  }, [
    validation,
    receipts,
    expenses,
    otherIncome,
    deductions,
    tdsDeducted,
    alreadyPaid,
    regime,
    ageBand,
    presumptive,
    fyStart,
  ]);

  const fyLabel = `FY ${fyStart}-${String(Number(fyStart) + 1).slice(-2)}`;

  const report = useMemo(() => {
    if (!result) return "";
    const lines = [
      `Advance Tax Plan — ${fyLabel} (${regime === "new" ? "new regime" : "old regime"})`,
      `Professional income: ${money(result.professionalIncome)}${presumptive ? " (50% presumptive)" : ""}`,
      `Gross total income: ${money(result.grossTotalIncome)}`,
      `Taxable income: ${money(result.taxableIncome)}`,
      `Total tax incl. cess: ${money(result.tax.total)}`,
      `Less TDS: ${money(num(tdsDeducted))}`,
      `Advance tax for the year: ${money(result.afterTds)}`,
      result.liable
        ? "Advance tax applies (liability is ₹10,000 or more)."
        : "Advance tax not payable — liability after TDS is below ₹10,000.",
      "",
      "Instalments:",
      ...result.instalments.map(
        (item) =>
          `${dateFmt.format(item.due)} — ${item.label} (${Math.round(item.cumulativePct * 100)}% cumulative): ${money(item.amount)}`
      ),
    ];
    return lines.join("\n");
  }, [result, fyLabel, regime, presumptive, tdsDeducted]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFyStart(DEFAULTS.fyStart);
    setReceipts(DEFAULTS.receipts);
    setExpenses(DEFAULTS.expenses);
    setOtherIncome(DEFAULTS.otherIncome);
    setDeductions(DEFAULTS.deductions);
    setTdsDeducted(DEFAULTS.tdsDeducted);
    setAlreadyPaid(DEFAULTS.alreadyPaid);
    setRegime(DEFAULTS.regime);
    setAgeBand(DEFAULTS.ageBand);
    setPresumptive(DEFAULTS.presumptive);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Tax
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Freelancer Advance Tax Planner
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Work out your yearly tax on freelance or professional income, subtract the TDS your
            clients already deducted, and split what is left across the four advance tax due dates.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div>
                <span id="atp-regime-label" className="block text-sm font-semibold">
                  Tax regime
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="atp-regime-label">
                  {[
                    { id: "new", label: "New regime" },
                    { id: "old", label: "Old regime" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={regime === option.id}
                      onClick={() => setRegime(option.id)}
                      className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        regime === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="atp-fy" className="block text-sm font-semibold">
                    Financial year
                  </label>
                  <select
                    id="atp-fy"
                    value={fyStart}
                    onChange={(event) => setFyStart(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  >
                    <option value="2025">FY 2025-26</option>
                    <option value="2026">FY 2026-27</option>
                    <option value="2027">FY 2027-28</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="atp-age" className="block text-sm font-semibold">
                    Age band
                  </label>
                  <select
                    id="atp-age"
                    value={ageBand}
                    onChange={(event) => setAgeBand(event.target.value)}
                    disabled={regime === "new"}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  >
                    <option value="below60">Below 60</option>
                    <option value="senior">60 to 79</option>
                    <option value="superSenior">80 and above</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="atp-receipts" className="block text-sm font-semibold">
                    Gross professional receipts (₹)
                  </label>
                  <input
                    id="atp-receipts"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={receipts}
                    onChange={(event) => setReceipts(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="atp-expenses" className="block text-sm font-semibold">
                    Business expenses (₹)
                  </label>
                  <input
                    id="atp-expenses"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={expenses}
                    onChange={(event) => setExpenses(event.target.value)}
                    disabled={presumptive}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="atp-other" className="block text-sm font-semibold">
                    Other income (₹)
                  </label>
                  <input
                    id="atp-other"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={otherIncome}
                    onChange={(event) => setOtherIncome(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="atp-deductions" className="block text-sm font-semibold">
                    Chapter VI-A deductions (₹)
                  </label>
                  <input
                    id="atp-deductions"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={deductions}
                    onChange={(event) => setDeductions(event.target.value)}
                    disabled={regime === "new"}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="atp-tds" className="block text-sm font-semibold">
                    TDS deducted by clients (₹)
                  </label>
                  <input
                    id="atp-tds"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={tdsDeducted}
                    onChange={(event) => setTdsDeducted(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="atp-paid" className="block text-sm font-semibold">
                    Advance tax already paid (₹)
                  </label>
                  <input
                    id="atp-paid"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={alreadyPaid}
                    onChange={(event) => setAlreadyPaid(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              <label
                htmlFor="atp-presumptive"
                className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <input
                  id="atp-presumptive"
                  type="checkbox"
                  checked={presumptive}
                  onChange={(event) => setPresumptive(event.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                />
                <span className="text-sm">
                  <span className="font-semibold">I opt for presumptive taxation (Section 44ADA)</span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">
                    Income is taken as 50% of receipts and the whole advance tax is due by 15 March.
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  disabled={!result}
                  aria-label="Copy advance tax plan to clipboard"
                  className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              {validation ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {validation}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Advance tax payable for {fyLabel}
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                    {money(result.afterTds)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {result.liable
                      ? `Still to pay after instalments already made: ${money(result.netPayable)}`
                      : "Below the ₹10,000 threshold — no advance tax is required this year."}
                  </p>

                  <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">
                        Professional income{presumptive ? " (50% presumptive)" : " (net of expenses)"}
                      </dt>
                      <dd className="text-sm font-semibold">{money(result.professionalIncome)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Gross total income</dt>
                      <dd className="text-sm font-semibold">{money(result.grossTotalIncome)}</dd>
                    </div>
                    {regime === "old" && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Chapter VI-A deductions</dt>
                        <dd className="text-sm font-semibold">- {money(result.allowedDeductions)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Taxable income</dt>
                      <dd className="text-sm font-semibold">{money(result.taxableIncome)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Tax on slab rates</dt>
                      <dd className="text-sm font-semibold">{money(result.tax.baseTax)}</dd>
                    </div>
                    {result.tax.rebate > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Section 87A rebate</dt>
                        <dd className="text-sm font-semibold text-[var(--success)]">
                          - {money(result.tax.rebate)}
                        </dd>
                      </div>
                    )}
                    {result.tax.surcharge > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Surcharge</dt>
                        <dd className="text-sm font-semibold">{money(result.tax.surcharge)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Health &amp; education cess (4%)</dt>
                      <dd className="text-sm font-semibold">{money(result.tax.cess)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm font-semibold">Total tax for the year</dt>
                      <dd className="text-sm font-semibold">{money(result.tax.total)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Less: TDS deducted by clients</dt>
                      <dd className="text-sm font-semibold">- {money(num(tdsDeducted))}</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>

            {result && result.liable && (
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-sm font-semibold">Instalment schedule</h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Section 211 due dates. Shortfall at any date attracts 1% per month interest under
                  Section 234C.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[340px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-3 font-semibold">Due date</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Cumulative</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Pay now</th>
                        <th scope="col" className="py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.instalments.map((item) => {
                        const overdue = today ? item.due < today : false;
                        return (
                          <tr key={item.label} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-2 pr-3 whitespace-nowrap">{dateFmt.format(item.due)}</td>
                            <td className="py-2 pr-3">{Math.round(item.cumulativePct * 100)}%</td>
                            <td className="py-2 pr-3 font-semibold">{money(item.amount)}</td>
                            <td className="py-2">
                              {today ? (
                                <span
                                  className={
                                    overdue
                                      ? "text-[var(--danger)] font-semibold"
                                      : "text-[var(--muted-foreground)]"
                                  }
                                >
                                  {overdue ? "Past due date" : "Upcoming"}
                                </span>
                              ) : (
                                <span className="text-[var(--muted-foreground)]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                  Slab rates used are those notified by the Finance Act 2025 for FY 2025-26 and applied
                  to the year you pick. Capital gains, lottery income and other special-rate income are
                  not covered. Informational only — confirm with your tax adviser before paying.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
