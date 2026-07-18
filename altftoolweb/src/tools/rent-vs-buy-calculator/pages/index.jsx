"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Home,
  Info,
  KeyRound,
  RotateCcw,
  Scale,
  TrendingDown,
  TrendingUp,
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

const inputClass =
  "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

const DEFAULTS = {
  price: 8000000,
  downPct: 20,
  loanRate: 8.5,
  tenureYears: 20,
  rent: 25000,
  rentInflation: 7,
  appreciation: 5,
  invReturn: 11,
  maintPct: 1.5,
  horizonYears: 10,
  taxBenefit: false,
  registration: false,
};

const presets = [
  { label: "Metro city 2BHK", values: { price: 12000000, rent: 40000, downPct: 20 } },
  { label: "Tier-2 city home", values: { price: 6000000, rent: 16000, downPct: 20 } },
  { label: "Premium upgrade", values: { price: 20000000, rent: 65000, downPct: 25 } },
];

const clamp = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

function emiFor(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 1200;
  if (i === 0) return principal / months;
  const f = Math.pow(1 + i, months);
  return (principal * i * f) / (f - 1);
}

function simulate(raw) {
  const price = clamp(raw.price, 0, 1e12);
  const downPct = clamp(raw.downPct, 0, 100);
  const loanRate = clamp(raw.loanRate, 0, 30);
  const tenureYears = clamp(raw.tenureYears, 1, 40);
  const rent0 = clamp(raw.rent, 0, 1e9);
  const rentInflation = clamp(raw.rentInflation, 0, 30);
  const appreciation = clamp(raw.appreciation, -10, 30);
  const invReturn = clamp(raw.invReturn, 0, 30);
  const maintPct = clamp(raw.maintPct, 0, 10);
  const horizonYears = Math.round(clamp(raw.horizonYears, 1, 30));

  const down = (downPct / 100) * price;
  const reg = raw.registration ? 0.07 * price : 0;
  const loan = Math.max(price - down, 0);
  const months = Math.round(tenureYears * 12);
  const emi = emiFor(loan, loanRate, months);
  const iLoan = loanRate / 1200;
  const jInv = invReturn / 1200;

  let bal = loan;
  let renterCorpus = down + reg;
  let buyerCorpus = 0;
  let totalTaxSaved = 0;
  const rows = [];

  for (let y = 1; y <= horizonYears; y++) {
    const homeValStart = price * Math.pow(1 + appreciation / 100, y - 1);
    const maintM = ((maintPct / 100) * homeValStart) / 12;
    const rentM = rent0 * Math.pow(1 + rentInflation / 100, y - 1);

    let taxM = 0;
    if (raw.taxBenefit && bal > 0) {
      let b = bal;
      let intY = 0;
      let prinY = 0;
      for (let m = 1; m <= 12; m++) {
        const gm = (y - 1) * 12 + m;
        if (gm > months || b <= 0) break;
        const int = b * iLoan;
        const pay = Math.min(emi, b + int);
        intY += int;
        prinY += pay - int;
        b -= pay - int;
      }
      const saved = 0.3 * (Math.min(intY, 200000) + Math.min(prinY, 150000));
      taxM = saved / 12;
      totalTaxSaved += saved;
    }

    for (let m = 1; m <= 12; m++) {
      const gm = (y - 1) * 12 + m;
      let pay = 0;
      if (bal > 0 && gm <= months) {
        const int = bal * iLoan;
        pay = Math.min(emi, bal + int);
        bal = Math.max(bal + int - pay, 0);
      }
      const gross = pay + maintM;
      const buyCost = gross - Math.min(taxM, gross);
      const diff = buyCost - rentM;
      renterCorpus = (renterCorpus + Math.max(diff, 0)) * (1 + jInv);
      buyerCorpus = (buyerCorpus + Math.max(-diff, 0)) * (1 + jInv);
    }

    const homeVal = price * Math.pow(1 + appreciation / 100, y);
    const buyNetWorth = homeVal - bal + buyerCorpus;
    const rentNetWorth = renterCorpus;
    rows.push({
      year: y,
      homeVal,
      loanBal: bal,
      rentM,
      buyNetWorth,
      rentNetWorth,
      diff: buyNetWorth - rentNetWorth,
    });
  }

  const last = rows[rows.length - 1];
  let crossover = null;
  if (rows.length > 1) {
    const finalSign = Math.sign(last.diff);
    let k = rows.length - 1;
    while (k >= 0 && Math.sign(rows[k].diff) === finalSign) k -= 1;
    if (k >= 0) crossover = rows[k + 1].year;
  }

  return { emi, down, reg, loan, rows, last, crossover, totalTaxSaved, horizonYears };
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

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left transition hover:border-[var(--primary)]"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{hint}</span>
        ) : null}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function ToolHome() {
  const [inp, setInp] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const num = (key) => (event) => setInp((prev) => ({ ...prev, [key]: Number(event.target.value) }));
  const toggle = (key) => () => setInp((prev) => ({ ...prev, [key]: !prev[key] }));

  const sim = useMemo(() => simulate(inp), [inp]);
  const sensitivity = useMemo(
    () =>
      [3, 5, 8].map((appreciation) => {
        const res = simulate({ ...inp, appreciation });
        return { appreciation, diff: res.last.diff };
      }),
    [inp]
  );

  const buyAhead = sim.last.diff >= 0;
  const margin = Math.abs(sim.last.diff);
  const crossoverText = !sim.crossover
    ? `${buyAhead ? "Buying" : "Renting"} stays ahead for the entire ${sim.horizonYears}-year horizon`
    : `${buyAhead ? "Buying" : "Renting"} takes the lead in year ${sim.crossover}`;

  const copySummary = async () => {
    const lines = [
      "Rent vs Buy Home Calculator — Summary",
      `Home price: ${formatMoney(inp.price)} | Down payment: ${inp.downPct}% (${formatMoney(sim.down)})${
        inp.registration ? ` | Registration (7%): ${formatMoney(sim.reg)}` : ""
      }`,
      `Loan: ${formatMoney(sim.loan)} at ${inp.loanRate}% for ${inp.tenureYears} years | EMI: ${formatMoney(sim.emi)}`,
      `Rent: ${formatMoney(inp.rent)}/month, growing ${inp.rentInflation}%/year`,
      `Assumptions: appreciation ${inp.appreciation}%/yr, investment return ${inp.invReturn}%/yr, maintenance+tax ${inp.maintPct}%/yr, tax benefit ${
        inp.taxBenefit ? "ON (80C+24b, 30% slab)" : "OFF"
      }`,
      `Verdict at year ${sim.horizonYears}: ${buyAhead ? "BUYING" : "RENTING"} is ahead by ${formatMoney(margin)}`,
      `Buy path net worth: ${formatMoney(sim.last.buyNetWorth)} (home ${formatMoney(sim.last.homeVal)} - loan ${formatMoney(
        sim.last.loanBal
      )} + invested surplus)`,
      `Rent path corpus: ${formatMoney(sim.last.rentNetWorth)}`,
      `Crossover: ${crossoverText}`,
      `Sensitivity: ${sensitivity
        .map(
          (s) =>
            `at ${s.appreciation}% appreciation → ${s.diff >= 0 ? "Buy" : "Rent"} by ${formatCompact(Math.abs(s.diff))}`
        )
        .join("; ")}`,
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
            <Scale className="h-4 w-4" />
            Finance decision
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Rent vs Buy Home Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            An honest India-focused comparison: EMI, maintenance, and appreciation on the buy side versus rising rent
            plus a properly invested down payment on the rent side — same cash out of pocket in both paths.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
              <NumField label="Home price" hint="INR" value={inp.price} onChange={num("price")} step={100000} />
              <NumField label="Down payment" hint="% of price" value={inp.downPct} onChange={num("downPct")} step={1} />
              <NumField label="Loan interest rate" hint="% / year" value={inp.loanRate} onChange={num("loanRate")} step={0.1} />
              <NumField label="Loan tenure" hint="years" value={inp.tenureYears} onChange={num("tenureYears")} step={1} min={1} />
              <NumField label="Monthly rent (same home)" hint="INR" value={inp.rent} onChange={num("rent")} step={1000} />
              <NumField label="Rent inflation" hint="% / year" value={inp.rentInflation} onChange={num("rentInflation")} step={0.5} />
              <NumField label="Home appreciation" hint="% / year" value={inp.appreciation} onChange={num("appreciation")} step={0.5} />
              <NumField label="Investment return on savings" hint="% / year" value={inp.invReturn} onChange={num("invReturn")} step={0.5} />
              <NumField label="Maintenance + property tax" hint="% of value / year" value={inp.maintPct} onChange={num("maintPct")} step={0.1} />
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                How long will you stay?
                <span className="text-sm font-semibold text-[var(--primary)]">{sim.horizonYears} years</span>
              </span>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={inp.horizonYears}
                onChange={num("horizonYears")}
                className="mt-3 w-full accent-[var(--primary)]"
              />
            </label>

            <div className="mt-5 grid gap-2">
              <ToggleRow
                label="Home-loan tax benefit"
                hint="80C + 24(b), capped, 30% slab, old regime"
                checked={inp.taxBenefit}
                onChange={toggle("taxBenefit")}
              />
              <ToggleRow
                label="Stamp duty + registration"
                hint="Adds a one-time 7% of price to the buy path"
                checked={inp.registration}
                onChange={toggle("registration")}
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={() => setInp(DEFAULTS)}
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
                  Verdict at year {sim.horizonYears}
                </p>
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                    {buyAhead ? "Buying comes out ahead" : "Renting comes out ahead"}
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    by {formatCompact(margin)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  {buyAhead ? (
                    <Home className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                  ) : (
                    <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                  )}
                  {crossoverText}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Buy path net worth</p>
                  <p className="mt-1 text-lg font-semibold">{formatMoney(sim.last.buyNetWorth)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Home {formatCompact(sim.last.homeVal)} − loan {formatCompact(sim.last.loanBal)} + invested surplus
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Rent path corpus</p>
                  <p className="mt-1 text-lg font-semibold">{formatMoney(sim.last.rentNetWorth)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Down payment invested + monthly savings vs EMI, at {inp.invReturn}%/yr
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Monthly EMI</p>
                  <p className="mt-1 font-semibold">{formatMoney(sim.emi)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Upfront (down{inp.registration ? " + registration" : ""})</p>
                  <p className="mt-1 font-semibold">{formatMoney(sim.down + sim.reg)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {inp.taxBenefit ? "Total tax saved (est.)" : "Rent in year 1"}
                  </p>
                  <p className="mt-1 font-semibold">
                    {inp.taxBenefit ? formatMoney(sim.totalTaxSaved) : `${formatMoney(inp.rent)}/mo`}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1). Both paths spend the same cash every month — whichever
                path is cheaper that month invests the difference at your investment return (compounded monthly).
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Sensitivity — verdict if home prices grow at
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {sensitivity.map((s) => (
                  <div
                    key={s.appreciation}
                    className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
                  >
                    {s.diff >= 0 ? (
                      <TrendingUp className="h-4 w-4 shrink-0 text-[var(--anslation-ds-success)]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    )}
                    <span>
                      {s.appreciation}%/yr → {s.diff >= 0 ? "Buy" : "Rent"} by {formatCompact(Math.abs(s.diff))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Year-by-year net worth</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-2 py-2 font-semibold">Year</th>
                      <th className="px-2 py-2 text-right font-semibold">Home value</th>
                      <th className="px-2 py-2 text-right font-semibold">Loan balance</th>
                      <th className="px-2 py-2 text-right font-semibold">Rent / month</th>
                      <th className="px-2 py-2 text-right font-semibold">Buy net worth</th>
                      <th className="px-2 py-2 text-right font-semibold">Rent net worth</th>
                      <th className="px-2 py-2 text-right font-semibold">Ahead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.rows.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)]">
                        <td className="px-2 py-2 font-semibold">{row.year}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.homeVal)}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.loanBal)}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.rentM)}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.buyNetWorth)}</td>
                        <td className="px-2 py-2 text-right">{formatMoney(row.rentNetWorth)}</td>
                        <td
                          className={`px-2 py-2 text-right font-semibold ${
                            row.diff >= 0 ? "text-[var(--anslation-ds-success)]" : "text-[var(--primary)]"
                          }`}
                        >
                          {row.diff >= 0 ? "Buy" : "Rent"} +{formatCompact(Math.abs(row.diff))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                Honest assumptions — what this model ignores
              </div>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>Selling costs, brokerage, and capital-gains tax if you sell the home at the horizon.</li>
                <li>HRA tax exemption on rent, and interest earned on the refundable rent deposit.</li>
                <li>Loan processing fees, home insurance, renovation, society transfer charges, and vacancy gaps.</li>
                <li>Stamp duty + registration is ignored unless you switch on the toggle (adds a one-time 7% of price).</li>
                <li>
                  Tax benefit assumes the old regime at a 30% slab with 80C fully attributed to the home loan — real
                  savings are usually lower.
                </li>
                <li>All rates stay constant; real life delivers lumpy rent hikes, rate resets, and uneven appreciation.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
