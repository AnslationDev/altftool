"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  Copy,
  GitCompare,
  Info,
  Landmark,
  Percent,
  PiggyBank,
  RotateCcw,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const formatCompact = (value) => {
  const v = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(v);
  if (abs >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(v / 1e5).toFixed(1)} L`;
  return formatMoney(v);
};

const formatTenure = (months) => {
  const m = Math.max(Math.round(months), 0);
  const y = Math.floor(m / 12);
  const rem = m % 12;
  if (y === 0) return `${rem}m`;
  if (rem === 0) return `${y}y`;
  return `${y}y ${rem}m`;
};

const inputClass =
  "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

const DEFAULTS = {
  principal: 4000000,
  tenureYears: 15,
  loanRate: 8.5,
  lump: 500000,
  extraMonthly: 0,
  invReturn: 12,
};

const modes = [
  { id: "tenure", label: "Reduce tenure", hint: "Keep the same EMI, finish earlier" },
  { id: "emi", label: "Reduce EMI", hint: "Keep the same tenure, pay less monthly" },
];

const presets = [
  { label: "Home loan, ₹5L bonus", values: { principal: 4000000, tenureYears: 15, loanRate: 8.5, lump: 500000, extraMonthly: 0, invReturn: 12 } },
  { label: "Car loan, ₹1L windfall", values: { principal: 600000, tenureYears: 4, loanRate: 9.4, lump: 100000, extraMonthly: 0, invReturn: 12 } },
  { label: "Extra ₹10k every month", values: { principal: 4000000, tenureYears: 15, loanRate: 8.5, lump: 0, extraMonthly: 10000, invReturn: 12 } },
];

const clamp = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

function emiFor(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 1200;
  if (i === 0) return principal / months;
  const f = Math.pow(1 + i, months);
  return (principal * i * f) / (f - 1);
}

function runLoan(balance, payment, annualRate, capMonths) {
  const i = annualRate / 1200;
  let bal = balance;
  let months = 0;
  let interest = 0;
  const yearly = [];
  while (bal > 0.005 && months < capMonths) {
    const int = bal * i;
    if (payment <= int) {
      months = capMonths;
      break;
    }
    const pay = Math.min(payment, bal + int);
    interest += int;
    bal = bal + int - pay;
    months += 1;
    if (months % 12 === 0) yearly.push(Math.max(bal, 0));
  }
  return { months, interest, yearly };
}

function investGainAt(annualRate, lump, extra, months) {
  const j = annualRate / 1200;
  const fvLump = lump * Math.pow(1 + j, months);
  const fvSip = extra > 0 ? (j === 0 ? extra * months : extra * ((Math.pow(1 + j, months) - 1) / j) * (1 + j)) : 0;
  return fvLump + fvSip - (lump + extra * months);
}

function analyze(raw, mode, taxHaircut) {
  const principal = clamp(raw.principal, 0, 1e11);
  const tenureYears = clamp(raw.tenureYears, 0.5, 40);
  const loanRate = clamp(raw.loanRate, 0, 30);
  const lump = Math.min(clamp(raw.lump, 0, 1e11), principal);
  const extra = clamp(raw.extraMonthly, 0, 1e9);
  const invReturn = clamp(raw.invReturn, 0, 40);

  const months = Math.round(tenureYears * 12);
  const emi = emiFor(principal, loanRate, months);
  const base = runLoan(principal, emi, loanRate, months + 2);

  const balAfterLump = Math.max(principal - lump, 0);
  const newEmi = mode === "emi" ? emiFor(balAfterLump, loanRate, months) : emi;
  const pre = runLoan(balAfterLump, newEmi + extra, loanRate, months + 2);

  const interestSaved = Math.max(base.interest - pre.interest, 0);
  const monthsSaved = Math.max(base.months - pre.months, 0);
  const emiDrop = Math.max(emi - newEmi, 0);

  const invested = lump + extra * base.months;
  const gain = investGainAt(invReturn, lump, extra, base.months);
  const corpus = invested + gain;

  const factInt = taxHaircut ? 0.7 : 1;
  const factGain = taxHaircut ? 0.875 : 1;
  const interestAdj = interestSaved * factInt;
  const gainAdj = gain * factGain;

  let breakEven = null;
  if (invested > 0 && interestAdj > 0) {
    const target = interestAdj / factGain;
    let lo = 0;
    let hi = 60;
    if (investGainAt(hi, lump, extra, base.months) >= target) {
      for (let k = 0; k < 80; k++) {
        const mid = (lo + hi) / 2;
        if (investGainAt(mid, lump, extra, base.months) < target) lo = mid;
        else hi = mid;
      }
      breakEven = (lo + hi) / 2;
    }
  }

  const totalYears = Math.max(Math.ceil(base.months / 12), 1);
  const table = Array.from({ length: totalYears }, (_, k) => ({
    year: k + 1,
    before: base.yearly[k] ?? 0,
    after: pre.yearly[k] ?? 0,
  }));

  return {
    principal,
    months,
    emi,
    base,
    pre,
    lump,
    extra,
    invReturn,
    newEmi,
    interestSaved,
    monthsSaved,
    emiDrop,
    invested,
    gain,
    corpus,
    interestAdj,
    gainAdj,
    breakEven,
    table,
    hasMoney: lump > 0 || extra > 0,
  };
}

function NumField({ label, value, onChange, step = 1, min = 0, hint }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-sm font-semibold">
        {label}
        {hint ? (
          <span className="text-xs font-medium text-[var(--muted-foreground)]">{hint}</span>
        ) : null}
      </span>
      <input type="number" value={value} onChange={onChange} step={step} min={min} className={inputClass} />
    </label>
  );
}

export default function ToolHome() {
  const [inp, setInp] = useState(DEFAULTS);
  const [mode, setMode] = useState("tenure");
  const [taxHaircut, setTaxHaircut] = useState(false);
  const [copied, setCopied] = useState(false);

  const num = (key) => (event) => setInp((prev) => ({ ...prev, [key]: Number(event.target.value) }));

  const res = useMemo(() => analyze(inp, mode, taxHaircut), [inp, mode, taxHaircut]);

  const investWins = res.gainAdj > res.interestAdj;
  const verdictMargin = Math.abs(res.gainAdj - res.interestAdj);

  const copyAnalysis = async () => {
    const lines = [
      "Loan Prepayment vs Investment — Analysis",
      `Outstanding: ${formatMoney(res.principal)} at ${inp.loanRate}% with ${formatTenure(res.months)} left | EMI: ${formatMoney(res.emi)}`,
      `Money on the table: lump sum ${formatMoney(res.lump)}${res.extra > 0 ? ` + ${formatMoney(res.extra)}/month extra` : ""}`,
      `Mode: ${mode === "tenure" ? "reduce tenure (same EMI)" : "reduce EMI (same tenure)"}${taxHaircut ? " | rough tax haircuts applied (−30% interest saved, −12.5% gains)" : ""}`,
      `Option A — Prepay: interest saved ${formatMoney(res.interestAdj)}${
        mode === "tenure"
          ? `, loan ends ${formatTenure(res.monthsSaved)} earlier (new tenure ${formatTenure(res.pre.months)})`
          : `, EMI drops to ${formatMoney(res.newEmi)} (−${formatMoney(res.emiDrop)}/month)`
      }`,
      `Option B — Invest: corpus ${formatMoney(res.corpus)} at the loan's original end date, gain ${formatMoney(res.gainAdj)} on ${formatMoney(res.invested)} invested at ${res.invReturn}%`,
      `Verdict: ${investWins ? "INVESTING" : "PREPAYING"} comes out ahead by ${formatMoney(verdictMargin)}`,
      res.breakEven !== null
        ? `Break-even: investing beats prepaying only above ${res.breakEven.toFixed(2)}% annual returns`
        : "Break-even: not applicable for these inputs",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    const success = await safeCopyText(lines.join("\n"));
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <GitCompare className="h-4 w-4" />
            Money decision
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Loan Prepayment vs Investment Analyzer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            You have spare money and a running loan. Compare the interest you would save by prepaying against the
            wealth the same money could build if invested until the loan&apos;s original end date.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
              <NumField label="Outstanding principal" hint="INR" value={inp.principal} onChange={num("principal")} step={100000} />
              <NumField label="Remaining tenure" hint="years" value={inp.tenureYears} onChange={num("tenureYears")} step={0.5} min={0.5} />
              <NumField label="Loan interest rate" hint="% / year" value={inp.loanRate} onChange={num("loanRate")} step={0.1} />
              <NumField label="Lump sum available" hint="INR" value={inp.lump} onChange={num("lump")} step={50000} />
              <NumField label="Extra monthly amount" hint="INR / month" value={inp.extraMonthly} onChange={num("extraMonthly")} step={1000} />
              <NumField label="Expected investment return" hint="% / year" value={inp.invReturn} onChange={num("invReturn")} step={0.5} />
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Prepayment mode</span>
              <div className="mt-2 grid gap-2">
                {modes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                      mode === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`mt-0.5 block text-xs font-medium ${
                        mode === item.id ? "text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {item.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={() => {
                    setInp(DEFAULTS);
                    setMode("tenure");
                    setTaxHaircut(false);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setInp((prev) => ({ ...prev, ...preset.values }))}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div aria-live="polite" className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Verdict at the loan&apos;s original end date ({formatTenure(res.months)} away)
                </p>
                <button type="button" onClick={copyAnalysis} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy analysis"}
                </button>
              </div>

              {res.hasMoney ? (
                <div className="mt-4 rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                    {investWins ? "Investing comes out ahead" : "Prepaying comes out ahead"}
                    {taxHaircut ? " (after rough tax haircuts)" : ""}
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">by {formatCompact(verdictMargin)}</p>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-[var(--muted)] p-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  Enter a lump sum and/or an extra monthly amount to compare the two options.
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Landmark className="h-4 w-4 text-[var(--primary)]" />
                    Option A — Prepay the loan
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-[var(--anslation-ds-success)]">
                    {formatMoney(res.interestAdj)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    interest saved{taxHaircut ? " (after −30% lost deduction)" : ""}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    {mode === "tenure"
                      ? `Loan closes ${formatTenure(res.monthsSaved)} earlier — ${formatTenure(res.pre.months)} instead of ${formatTenure(res.base.months)}, same EMI of ${formatMoney(res.emi)}.`
                      : `EMI drops to ${formatMoney(res.newEmi)} from ${formatMoney(res.emi)} — saving ${formatMoney(res.emiDrop)} every month over the same tenure.`}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <PiggyBank className="h-4 w-4 text-[var(--primary)]" />
                    Option B — Invest it instead
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-[var(--anslation-ds-success)]">
                    {formatMoney(res.gainAdj)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    investment gain{taxHaircut ? " (after −12.5% LTCG)" : ""}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    {formatMoney(res.invested)} invested at {res.invReturn}%/yr grows to {formatMoney(res.corpus)} by
                    the loan&apos;s original end date, while the loan runs as scheduled.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1); lump sum FV = L × (1+r/12)ⁿ; monthly investing uses
                start-of-month contributions compounded at r/12. Prepayment schedules are simulated month by month.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                <Percent className="h-4 w-4 text-[var(--primary)]" />
                Break-even return
              </div>
              {res.breakEven !== null ? (
                <>
                  <p className="mt-3 text-3xl font-semibold">
                    {res.breakEven.toFixed(2)}%<span className="ml-2 text-base font-medium text-[var(--muted-foreground)]">per year</span>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    On these numbers, investing beats prepaying only if your portfolio returns more than{" "}
                    {res.breakEven.toFixed(2)}% a year{taxHaircut ? " (tax haircuts included)" : ""}. Your loan costs{" "}
                    {inp.loanRate}% and you expect {res.invReturn}% from investments. A stricter time-value comparison
                    — where freed-up EMIs are also reinvested — pushes the hurdle to roughly your loan rate.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Break-even needs a lump sum or extra monthly amount and a positive interest saving.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]">
                  <Info className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Tax angle: prepaying a home loan shrinks your 24(b) interest deduction — worth up to 30% of interest if claimed
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]">
                  <Info className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Tax angle: equity LTCG above ₹1.25L/yr is taxed at 12.5% when you redeem
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={taxHaircut}
                onClick={() => setTaxHaircut((prev) => !prev)}
                className="mt-4 flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left transition hover:border-[var(--primary)]"
              >
                <span>
                  <span className="block text-sm font-semibold">Apply rough tax haircuts</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                    −30% on interest saved (lost deduction), −12.5% on investment gains (LTCG)
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    taxHaircut ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition-all ${
                      taxHaircut ? "left-6" : "left-1"
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Outstanding balance — before vs after prepayment
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-2 py-2 font-semibold">Year</th>
                      <th className="px-2 py-2 text-right font-semibold">Without prepayment</th>
                      <th className="px-2 py-2 text-right font-semibold">With prepayment</th>
                      <th className="px-2 py-2 text-right font-semibold">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.table.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)]">
                        <td className="px-2 py-2 font-semibold">{row.year}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.before)}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.after)}</td>
                        <td className="px-2 py-2 text-right font-semibold text-[var(--anslation-ds-success)]">
                          {formatCompact(row.before - row.after)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Brain className="h-4 w-4 text-[var(--primary)]" />
                The psychology the math can&apos;t capture
              </div>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>
                  Prepaying earns a guaranteed, risk-free return equal to your loan rate ({inp.loanRate}%) — no market
                  can promise that.
                </li>
                <li>
                  The {res.invReturn}% you expect from investing is an average. A bad first few years can lag the
                  guarantee exactly when your loan balance is biggest.
                </li>
                <li>A shorter loan or smaller EMI lowers fixed obligations — real resilience if income dips.</li>
                <li>Money prepaid into a loan is locked away; investments stay liquid for emergencies.</li>
                <li>
                  A popular middle path: keep 6 months of EMIs as an emergency fund, then split the surplus between
                  prepaying and investing.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
