"use client";

import { useMemo, useState } from "react";
import { Copy, IndianRupee, Info, RotateCcw, Wallet } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STANDARD_DEDUCTION = 75000;
const REBATE_LIMIT = 1200000;
const SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

const ctcPresets = [
  { label: "6 LPA", value: 600000 },
  { label: "12 LPA", value: 1200000 },
  { label: "18 LPA", value: 1800000 },
  { label: "30 LPA", value: 3000000 },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));

const formatPct = (value) => `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint ? <p className="text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          checked ? "border-transparent bg-[var(--primary)]" : "border-[var(--border)] bg-[var(--muted)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full border border-[var(--border)] bg-[var(--background)] transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function ToolHome() {
  const [ctc, setCtc] = useState(1600000);
  const [basicPct, setBasicPct] = useState(40);
  const [employerPfInCtc, setEmployerPfInCtc] = useState(true);
  const [pfCapped, setPfCapped] = useState(false);
  const [metro, setMetro] = useState(true);
  const [profTax, setProfTax] = useState(200);
  const [copied, setCopied] = useState(false);

  const salary = useMemo(() => {
    const annualCtc = Math.max(0, Number(ctc) || 0);
    const basicPctUsed = Math.min(70, Math.max(10, Number(basicPct) || 0));
    const profTaxMonthly = Math.max(0, Number(profTax) || 0);

    const basicAnnualRaw = annualCtc * (basicPctUsed / 100);
    const pfOnBasicMonthly = (basicAnnualRaw / 12) * 0.12;
    const employeePfMonthly = pfCapped ? Math.min(1800, pfOnBasicMonthly) : pfOnBasicMonthly;
    const employeePfAnnual = employeePfMonthly * 12;
    const employerPfAnnual = employeePfAnnual;

    const grossAnnual = Math.max(0, employerPfInCtc ? annualCtc - employerPfAnnual : annualCtc);
    const basicAnnual = Math.min(basicAnnualRaw, grossAnnual);
    const hraAnnual = Math.min((metro ? 0.5 : 0.4) * basicAnnual, Math.max(0, grossAnnual - basicAnnual));
    const specialAnnual = Math.max(0, grossAnnual - basicAnnual - hraAnnual);

    const taxable = Math.max(0, grossAnnual - STANDARD_DEDUCTION);
    let slabTax = 0;
    let previous = 0;
    for (const slab of SLABS) {
      if (taxable <= previous) break;
      slabTax += (Math.min(taxable, slab.upTo) - previous) * slab.rate;
      previous = slab.upTo;
    }
    let taxAfterRebate = slabTax;
    let rebate = 0;
    let marginalRelief = 0;
    if (taxable <= REBATE_LIMIT) {
      rebate = slabTax;
      taxAfterRebate = 0;
    } else if (taxable - REBATE_LIMIT < slabTax) {
      marginalRelief = slabTax - (taxable - REBATE_LIMIT);
      taxAfterRebate = taxable - REBATE_LIMIT;
    }
    const cess = taxAfterRebate * 0.04;
    const taxAnnual = taxAfterRebate + cess;

    const profTaxAnnual = profTaxMonthly * 12;
    const deductionsAnnual = employeePfAnnual + taxAnnual + profTaxAnnual;
    const inHandAnnual = Math.max(0, grossAnnual - deductionsAnnual);

    return {
      annualCtc,
      basicPctUsed,
      basicAnnual,
      hraAnnual,
      specialAnnual,
      grossAnnual,
      employeePfMonthly,
      employeePfAnnual,
      employerPfAnnual,
      taxable,
      slabTax,
      rebate,
      marginalRelief,
      taxAfterRebate,
      cess,
      taxAnnual,
      profTaxMonthly,
      profTaxAnnual,
      deductionsAnnual,
      inHandAnnual,
      inHandMonthly: inHandAnnual / 12,
      takeHomeShare: annualCtc > 0 ? (inHandAnnual / annualCtc) * 100 : 0,
      effectiveTaxRate: grossAnnual > 0 ? (taxAnnual / grossAnnual) * 100 : 0,
    };
  }, [basicPct, ctc, employerPfInCtc, metro, pfCapped, profTax]);

  const barSegments = useMemo(() => {
    if (!salary.annualCtc) return [];
    const pfValue = salary.employeePfAnnual + (employerPfInCtc ? salary.employerPfAnnual : 0);
    return [
      { id: "inhand", label: "In-hand", value: salary.inHandAnnual, color: "var(--primary)" },
      {
        id: "pf",
        label: employerPfInCtc ? "PF (you + employer)" : "PF (your share)",
        value: pfValue,
        color: "var(--anslation-ds-success)",
      },
      { id: "tax", label: "Income tax", value: salary.taxAnnual, color: "var(--anslation-ds-danger)" },
      { id: "pt", label: "Professional tax", value: salary.profTaxAnnual, color: "var(--anslation-ds-warning)" },
    ]
      .map((segment) => ({ ...segment, share: (segment.value / salary.annualCtc) * 100 }))
      .filter((segment) => segment.share > 0.05);
  }, [employerPfInCtc, salary]);

  const breakdownRows = useMemo(
    () => [
      { section: "Earnings" },
      { label: `Basic salary (${salary.basicPctUsed}% of CTC)`, annual: salary.basicAnnual },
      { label: `HRA (${metro ? "50" : "40"}% of basic)`, annual: salary.hraAnnual },
      { label: "Special allowance (balance)", annual: salary.specialAnnual },
      { label: "Gross salary", annual: salary.grossAnnual, strong: true },
      { section: "Deductions" },
      {
        label: pfCapped ? "Employee PF (capped at ₹1,800/mo)" : "Employee PF (12% of basic)",
        annual: salary.employeePfAnnual,
        negative: true,
      },
      { label: "Income tax (new regime, incl. 4% cess)", annual: salary.taxAnnual, negative: true },
      { label: "Professional tax", annual: salary.profTaxAnnual, negative: true },
      { label: "Total deductions", annual: salary.deductionsAnnual, strong: true, negative: true },
      { label: "Net in-hand salary", annual: salary.inHandAnnual, net: true },
    ],
    [metro, pfCapped, salary]
  );

  const report = useMemo(
    () =>
      [
        "Salary In-Hand Report — New Regime FY 2025-26",
        `Annual CTC: ${formatINR(salary.annualCtc)}`,
        `Basic salary (${salary.basicPctUsed}% of CTC): ${formatINR(salary.basicAnnual)}/yr`,
        `HRA (${metro ? "50" : "40"}% of basic): ${formatINR(salary.hraAnnual)}/yr`,
        `Special allowance: ${formatINR(salary.specialAnnual)}/yr`,
        `Gross salary: ${formatINR(salary.grossAnnual)}/yr`,
        `Employer PF (${employerPfInCtc ? "included in CTC" : "over and above CTC"}): ${formatINR(salary.employerPfAnnual)}/yr`,
        `Employee PF${pfCapped ? " (statutory cap)" : ""}: ${formatINR(salary.employeePfAnnual)}/yr`,
        `Taxable income (gross - ₹75,000 standard deduction): ${formatINR(salary.taxable)}`,
        `Income tax incl. 4% cess: ${formatINR(salary.taxAnnual)}/yr`,
        `Professional tax: ${formatINR(salary.profTaxAnnual)}/yr`,
        `Monthly in-hand: ${formatINR(salary.inHandMonthly)}`,
        `Annual in-hand: ${formatINR(salary.inHandAnnual)}`,
        `Effective tax rate: ${formatPct(salary.effectiveTaxRate)} of gross`,
        `Take-home share: ${formatPct(salary.takeHomeShare)} of CTC`,
        "Note: old regime and deductions like 80C/80D/HRA exemption are not modeled.",
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [employerPfInCtc, metro, pfCapped, salary]
  );

  const resetAll = () => {
    setCtc(1600000);
    setBasicPct(40);
    setEmployerPfInCtc(true);
    setPfCapped(false);
    setMetro(true);
    setProfTax(200);
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const sliderValue = Math.min(10000000, Math.max(300000, Number(ctc) || 300000));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wallet className="h-4 w-4" />
            India · FY 2025-26 new regime
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Salary In-Hand Calculator (CTC to Take-Home)</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Turn your CTC offer into the number that actually hits your bank account — with PF, professional tax, and
            new-regime income tax worked out month by month.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Annual CTC (₹)</span>
              <input
                type="number"
                min="0"
                step="10000"
                value={ctc}
                onChange={(event) => setCtc(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
            <input
              type="range"
              min="300000"
              max="10000000"
              step="50000"
              value={sliderValue}
              onChange={(event) => setCtc(Number(event.target.value))}
              aria-label="Annual CTC slider"
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border)] accent-[var(--primary)]"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>₹3L</span>
              <span>{formatINR(sliderValue)}</span>
              <span>₹1Cr</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-2">
              {ctcPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCtc(preset.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">Basic salary ({salary.basicPctUsed}% of CTC)</span>
              <input
                type="range"
                min="20"
                max="60"
                step="1"
                value={Math.min(60, Math.max(20, Number(basicPct) || 20))}
                onChange={(event) => setBasicPct(Number(event.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border)] accent-[var(--primary)]"
              />
              <span className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>20%</span>
                <span>Most companies keep 40–50%</span>
                <span>60%</span>
              </span>
            </label>

            <div className="mt-5 grid gap-2">
              <ToggleRow
                label="Employer PF included in CTC"
                hint="Most offers count it inside CTC"
                checked={employerPfInCtc}
                onChange={setEmployerPfInCtc}
              />
              <ToggleRow
                label="Cap PF at statutory ₹1,800/mo"
                hint="12% of the ₹15,000 wage ceiling"
                checked={pfCapped}
                onChange={setPfCapped}
              />
              <ToggleRow
                label="Metro city"
                hint="Sets HRA at 50% of basic (else 40%)"
                checked={metro}
                onChange={setMetro}
              />
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">Professional tax (₹ per month)</span>
              <input
                type="number"
                min="0"
                step="50"
                value={profTax}
                onChange={(event) => setProfTax(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>

            <button
              type="button"
              onClick={resetAll}
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to defaults
            </button>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your take-home salary</p>
                <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy breakdown"}
                </button>
              </div>

              <div aria-live="polite" className="mt-4 flex flex-wrap items-end gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Monthly in-hand</p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{formatINR(salary.inHandMonthly)}</p>
                </div>
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Annual in-hand</p>
                  <p className="mt-1 text-2xl font-semibold">{formatINR(salary.inHandAnnual)}</p>
                </div>
              </div>

              <div className="tool-compact-grid mt-5">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">You take home</p>
                  <p className="mt-1 font-semibold">{formatPct(salary.takeHomeShare)} of CTC</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Effective tax rate</p>
                  <p className="mt-1 font-semibold">{formatPct(salary.effectiveTaxRate)} of gross</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Monthly income tax</p>
                  <p className="mt-1 font-semibold">{formatINR(salary.taxAnnual / 12)}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold">Where your CTC goes</p>
                <div
                  aria-hidden="true"
                  className="mt-2 flex h-7 w-full overflow-hidden rounded-full border border-[var(--border)] bg-[var(--muted)]"
                >
                  {barSegments.map((segment) => (
                    <div
                      key={segment.id}
                      title={`${segment.label}: ${formatPct(segment.share)}`}
                      style={{ width: `${segment.share}%`, background: segment.color }}
                    />
                  ))}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)]">
                  {barSegments.map((segment) => (
                    <li key={segment.id} className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: segment.color }}
                      />
                      {segment.label}: <span className="font-semibold text-[var(--foreground)]">{formatPct(segment.share)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Full breakdown</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[430px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Component</th>
                      <th className="py-2 pr-3 text-right font-semibold">Monthly</th>
                      <th className="py-2 text-right font-semibold">Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownRows.map((row, index) =>
                      row.section ? (
                        <tr key={`section-${row.section}`} className="bg-[var(--muted)]">
                          <td colSpan={3} className="px-2 py-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            {row.section}
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={`${row.label}-${index}`}
                          className={`border-b border-[var(--border)] ${row.net ? "text-[var(--primary)]" : ""}`}
                        >
                          <td className={`py-2 pr-3 ${row.strong || row.net ? "font-semibold" : ""}`}>{row.label}</td>
                          <td className={`py-2 pr-3 text-right ${row.strong || row.net ? "font-semibold" : ""}`}>
                            {row.negative ? "− " : ""}
                            {formatINR(row.annual / 12)}
                          </td>
                          <td className={`py-2 text-right ${row.strong || row.net ? "font-semibold" : ""}`}>
                            {row.negative ? "− " : ""}
                            {formatINR(row.annual)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Employer PF contribution: {formatINR(salary.employerPfAnnual / 12)}/mo —{" "}
                {employerPfInCtc ? "included in your CTC, paid into your PF account." : "paid over and above your CTC."}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">How the income tax was computed</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--muted-foreground)]">Gross salary</span>
                  <span className="font-semibold">{formatINR(salary.grossAnnual)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--muted-foreground)]">Standard deduction</span>
                  <span className="font-semibold">− {formatINR(STANDARD_DEDUCTION)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-2">
                  <span className="text-[var(--muted-foreground)]">Taxable income</span>
                  <span className="font-semibold">{formatINR(salary.taxable)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--muted-foreground)]">Tax as per slabs (0–4L nil · 4–8L 5% · 8–12L 10% · 12–16L 15% · 16–20L 20% · 20–24L 25% · 24L+ 30%)</span>
                  <span className="font-semibold">{formatINR(salary.slabTax)}</span>
                </div>
                {salary.rebate > 0 && (
                  <div className="flex items-center justify-between gap-3 text-[var(--anslation-ds-success)]">
                    <span>Section 87A rebate (taxable income up to ₹12L)</span>
                    <span className="font-semibold">− {formatINR(salary.rebate)}</span>
                  </div>
                )}
                {salary.marginalRelief > 0 && (
                  <div className="flex items-center justify-between gap-3 text-[var(--anslation-ds-success)]">
                    <span>Marginal relief (income just above ₹12L)</span>
                    <span className="font-semibold">− {formatINR(salary.marginalRelief)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--muted-foreground)]">Health &amp; education cess (4%)</span>
                  <span className="font-semibold">+ {formatINR(salary.cess)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-2 text-[var(--primary)]">
                  <span className="font-semibold">Total income tax for the year</span>
                  <span className="font-semibold">{formatINR(salary.taxAnnual)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  This models the <span className="font-semibold text-[var(--foreground)]">new tax regime only</span>. The
                  old regime, HRA/LTA exemptions, 80C/80D and other deductions, NPS, gratuity, bonuses, ESI and surcharge
                  on income above ₹50L are not modeled. Employer PF is assumed equal to employee PF, and professional tax
                  varies by state. Treat this as a close planning estimate, not a payslip.
                </p>
              </div>
            </div>

            <p className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <IndianRupee className="h-3.5 w-3.5" />
              Formula: In-hand = Gross salary − Employee PF − Income tax (incl. cess) − Professional tax
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
