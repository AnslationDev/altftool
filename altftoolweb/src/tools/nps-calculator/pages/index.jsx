"use client";

import { useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Copy,
  Info,
  PieChart,
  RotateCcw,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const ASSET_RETURNS = { equity: 12, corporate: 8, gilt: 7 };
const ASSET_META = [
  { key: "equity", label: "E — Equity", detail: "Assumed 12% a year", color: "var(--primary)" },
  { key: "corporate", label: "C — Corporate bonds", detail: "Assumed 8% a year", color: "var(--secondary)" },
  { key: "gilt", label: "G — Government securities", detail: "Assumed 7% a year", color: "var(--anslation-ds-success)" },
];

const slabs = [5, 10, 15, 20, 30];

const presets = [
  { label: "Young saver: 28, ₹3,000 a month", currentAge: 28, monthly: 3000, mix: { equity: 75, corporate: 15, gilt: 10 } },
  { label: "Balanced: 35, ₹8,000 a month", currentAge: 35, monthly: 8000, mix: { equity: 50, corporate: 30, gilt: 20 } },
  { label: "Conservative: 45, ₹15,000 a month", currentAge: 45, monthly: 15000, mix: { equity: 25, corporate: 40, gilt: 35 } },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);
const formatPct = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

function rebalanceMix(mix, key, rawValue) {
  const next = Math.max(0, Math.min(100, Math.round(rawValue)));
  const others = ["equity", "corporate", "gilt"].filter((item) => item !== key);
  const remaining = 100 - next;
  const othersTotal = others.reduce((sum, item) => sum + mix[item], 0);
  const result = { ...mix, [key]: next };
  if (othersTotal <= 0) {
    result[others[0]] = Math.round(remaining / 2);
    result[others[1]] = remaining - result[others[0]];
  } else {
    result[others[0]] = Math.round((mix[others[0]] / othersTotal) * remaining);
    result[others[1]] = remaining - result[others[0]];
  }
  return result;
}

function buildSchedule({ currentAge, retirementAge, monthly, ratePct }) {
  const years = Math.max(0, Math.floor(retirementAge - currentAge));
  const monthlyRate = ratePct / 100 / 12;
  const rows = [];

  let balance = 0;
  let invested = 0;

  for (let index = 0; index < years; index += 1) {
    const opening = balance;
    let yearContribution = 0;
    for (let month = 0; month < 12; month += 1) {
      balance = (balance + monthly) * (1 + monthlyRate);
      yearContribution += monthly;
    }
    invested += yearContribution;
    rows.push({
      index: index + 1,
      age: currentAge + index + 1,
      opening,
      contribution: yearContribution,
      gains: balance - opening - yearContribution,
      closing: balance,
    });
  }

  return { years, rows, corpus: balance, invested };
}

export default function ToolHome() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthly, setMonthly] = useState(5000);
  const [useMix, setUseMix] = useState(false);
  const [manualReturn, setManualReturn] = useState(10);
  const [mix, setMix] = useState({ equity: 50, corporate: 30, gilt: 20 });
  const [annuityRate, setAnnuityRate] = useState(6);
  const [annuityPct, setAnnuityPct] = useState(40);

  const [regime, setRegime] = useState("old");
  const [slab, setSlab] = useState(30);
  const [other80c, setOther80c] = useState(0);
  const [annualBasic, setAnnualBasic] = useState(600000);
  const [employerPct, setEmployerPct] = useState(0);

  const [copied, setCopied] = useState(false);

  const blendedReturn =
    (mix.equity * ASSET_RETURNS.equity +
      mix.corporate * ASSET_RETURNS.corporate +
      mix.gilt * ASSET_RETURNS.gilt) /
    100;

  const effectiveReturn = useMix ? blendedReturn : Number(manualReturn) || 0;

  const plan = useMemo(
    () =>
      buildSchedule({
        currentAge: Number(currentAge) || 0,
        retirementAge: Number(retirementAge) || 0,
        monthly: Math.max(0, Number(monthly) || 0),
        ratePct: effectiveReturn,
      }),
    [currentAge, retirementAge, monthly, effectiveReturn]
  );

  const corpus = plan.corpus;
  const gains = corpus - plan.invested;
  const annuityShare = Math.min(100, Math.max(40, Number(annuityPct) || 40));
  const annuityCorpus = corpus * (annuityShare / 100);
  const lumpSum = corpus - annuityCorpus;
  const monthlyPension = (annuityCorpus * ((Number(annuityRate) || 0) / 100)) / 12;

  const selfAnnual = Math.max(0, Number(monthly) || 0) * 12;
  const basicAnnual = Math.max(0, Number(annualBasic) || 0);
  const employerAnnual = ((Number(employerPct) || 0) / 100) * basicAnnual;

  const tax = useMemo(() => {
    const isOld = regime === "old";
    const ded1B = isOld ? Math.min(selfAnnual, 50000) : 0;
    const ded1 = isOld
      ? Math.max(
          0,
          Math.min(
            selfAnnual - ded1B,
            Math.max(0, 150000 - Math.max(0, Number(other80c) || 0)),
            0.1 * basicAnnual
          )
        )
      : 0;
    const employerCapPct = isOld ? 0.1 : 0.14;
    const ded2 = Math.min(employerAnnual, employerCapPct * basicAnnual);
    const total = ded1 + ded1B + ded2;
    const saved = total * (slab / 100) * 1.04;
    return { ded1, ded1B, ded2, total, saved, employerCapPct: employerCapPct * 100 };
  }, [regime, selfAnnual, other80c, basicAnnual, employerAnnual, slab]);

  const report = useMemo(() => {
    const lines = [
      "NPS Projection Summary",
      `Age today: ${currentAge} | Exit age: ${retirementAge} (${plan.years} years)`,
      `Monthly contribution: ${formatMoney(Number(monthly) || 0)}`,
      `Expected return: ${formatPct(effectiveReturn)}%${
        useMix ? ` (asset mix E ${mix.equity} / C ${mix.corporate} / G ${mix.gilt})` : " (manual)"
      }`,
      "",
      `Corpus at ${retirementAge}: ${formatMoney(corpus)}`,
      `  Total invested: ${formatMoney(plan.invested)}`,
      `  Gains: ${formatMoney(gains)} (${formatPct((gains / (corpus || 1)) * 100)}% of corpus)`,
      "",
      `Annuity portion (${annuityShare}%): ${formatMoney(annuityCorpus)}`,
      `  Annuity rate: ${annuityRate}% -> estimated pension ${formatMoney(monthlyPension)}/month`,
      `Lump sum (${100 - annuityShare}%, tax-free): ${formatMoney(lumpSum)}`,
      "",
      `Tax benefit (${regime === "old" ? "old" : "new"} regime, ${slab}% slab)`,
      `  80CCD(1B) extra NPS-only deduction: ${formatMoney(tax.ded1B)}`,
      `  80CCD(1) within the 1.5L limit: ${formatMoney(tax.ded1)}`,
      `  80CCD(2) employer contribution: ${formatMoney(tax.ded2)}`,
      `  Total deduction: ${formatMoney(tax.total)}`,
      `  Tax saved this year (incl. 4% cess): ${formatMoney(tax.saved)}`,
      "",
      "Year-wise growth",
      "Age | Opening | Contribution | Gains | Closing",
      ...plan.rows.map((row) =>
        [
          row.age,
          formatMoney(row.opening),
          formatMoney(row.contribution),
          formatMoney(row.gains),
          formatMoney(row.closing),
        ].join(" | ")
      ),
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [
    currentAge,
    retirementAge,
    plan,
    monthly,
    effectiveReturn,
    useMix,
    mix,
    corpus,
    gains,
    annuityShare,
    annuityCorpus,
    annuityRate,
    monthlyPension,
    lumpSum,
    regime,
    slab,
    tax,
  ]);

  const applyPreset = (preset) => {
    setCurrentAge(preset.currentAge);
    setMonthly(preset.monthly);
    setMix(preset.mix);
    setUseMix(true);
  };

  const resetAll = () => {
    setCurrentAge(30);
    setRetirementAge(60);
    setMonthly(5000);
    setUseMix(false);
    setManualReturn(10);
    setMix({ equity: 50, corporate: 30, gilt: 20 });
    setAnnuityRate(6);
    setAnnuityPct(40);
    setRegime("old");
    setSlab(30);
    setOther80c(0);
    setAnnualBasic(600000);
    setEmployerPct(0);
  };

  const copySummary = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  const splitParts = [
    { key: "invested", label: "Invested", value: plan.invested, color: "var(--primary)" },
    { key: "gains", label: "Gains", value: Math.max(0, gains), color: "var(--anslation-ds-success)" },
  ];
  const splitTotal = splitParts.reduce((sum, part) => sum + part.value, 0) || 1;
  const equityCapNote = Number(currentAge) <= 50;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Shield className="h-4 w-4" />
            National Pension System
          </div>
          <h1 className="text-4xl font-semibold leading-tight">NPS Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            NPS is the only place you can claim an extra ₹50,000 deduction, and the only retirement product that
            forces at least 40% of your corpus into a pension. Model both sides: what your contributions grow into
            by 60, the monthly pension your mandatory annuity actually buys, and the tax you save every year on
            the way there.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Current age</span>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={currentAge}
                  onChange={(event) => setCurrentAge(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Retirement age</span>
                <input
                  type="number"
                  min="18"
                  max="75"
                  value={retirementAge}
                  onChange={(event) => setRetirementAge(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Monthly contribution</span>
              <input
                type="number"
                min="0"
                step="500"
                value={monthly}
                onChange={(event) => setMonthly(Number(event.target.value))}
                className={inputClass}
              />
            </label>

            <div className="mt-5 rounded-md border border-[var(--border)] p-3">
              <button
                type="button"
                onClick={() => setUseMix((value) => !value)}
                aria-pressed={useMix}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold">Asset-mix helper</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                    Build the return from your E / C / G split
                  </span>
                </span>
                <span
                  className="relative h-6 w-11 shrink-0 rounded-full transition"
                  style={{ background: useMix ? "var(--primary)" : "var(--muted)" }}
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full transition-all"
                    style={{
                      left: useMix ? "1.375rem" : "0.125rem",
                      background: useMix ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    }}
                  />
                </span>
              </button>

              {useMix ? (
                <div className="mt-4 grid gap-4">
                  {ASSET_META.map((asset) => (
                    <label key={asset.key} className="block">
                      <span className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: asset.color }}
                          />
                          {asset.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">{mix[asset.key]}%</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={mix[asset.key]}
                        onChange={(event) =>
                          setMix((current) => rebalanceMix(current, asset.key, Number(event.target.value)))
                        }
                        className="mt-2 h-2 w-full cursor-pointer accent-[var(--primary)]"
                      />
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                        {asset.detail}
                      </span>
                    </label>
                  ))}
                  <div className="rounded-md bg-[var(--muted)] p-3">
                    <p className="font-mono text-xs leading-5">
                      ({mix.equity}×12 + {mix.corporate}×8 + {mix.gilt}×7) ÷ 100 ={" "}
                      <strong>{formatPct(blendedReturn)}%</strong>
                    </p>
                    {equityCapNote && mix.equity > 75 && (
                      <p className="mt-2 text-xs leading-5 text-[var(--anslation-ds-warning)]">
                        Active Choice caps equity at 75% until age 50 and tapers it after — this mix is not
                        allowed in practice.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <label className="mt-3 block">
                  <span className="text-sm font-semibold">Expected return %</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    value={manualReturn}
                    onChange={(event) => setManualReturn(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
              )}
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Annuity rate %</span>
              <input
                type="number"
                min="0"
                max="15"
                step="0.25"
                value={annuityRate}
                onChange={(event) => setAnnuityRate(Number(event.target.value))}
                className={inputClass}
              />
              <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                What the insurer pays on your annuity corpus. Real quotes today sit around 6–7%.
              </span>
            </label>

            <label className="mt-4 block">
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Annuity purchase %</span>
                <span className="text-sm font-semibold tabular-nums">{annuityShare}%</span>
              </span>
              <input
                type="range"
                min="40"
                max="100"
                step="1"
                value={annuityShare}
                onChange={(event) => setAnnuityPct(Number(event.target.value))}
                className="mt-2 h-2 w-full cursor-pointer accent-[var(--primary)]"
              />
              <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                40% is the legal minimum at 60. Anything above that is your choice — more pension, less cash.
              </span>
            </label>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Corpus at age {retirementAge}
                </p>
                <button
                  type="button"
                  onClick={copySummary}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-4xl font-semibold text-[var(--primary)]">{formatMoney(corpus)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {plan.years > 0
                      ? `${plan.years} years at ${formatPct(effectiveReturn)}%, compounded monthly`
                      : "Set an exit age above your current age to project growth"}
                  </p>
                </div>
                {plan.years > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                    <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                    {formatPct((gains / (corpus || 1)) * 100)}% of it is growth
                  </div>
                )}
              </div>

              <p className="mt-4 rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
                Corpus = P × [((1+i)^n − 1) ÷ i] × (1+i), with P = {formatMoney(Number(monthly) || 0)}, i ={" "}
                {formatPct(effectiveReturn)}% ÷ 12, n = {plan.years * 12} months
              </p>

              <div className="mt-6">
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  {splitParts.map((part) => (
                    <div
                      key={part.key}
                      style={{ width: `${(part.value / splitTotal) * 100}%`, background: part.color }}
                      title={`${part.label}: ${formatMoney(part.value)}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {splitParts.map((part) => (
                    <span key={part.key} className="inline-flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: part.color }} />
                      <span className="text-[var(--muted-foreground)]">{part.label}</span>
                      <span className="font-semibold">{formatMoney(part.value)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="tool-compact-grid mt-6">
                {[
                  [
                    `Annuity portion (${annuityShare}%)`,
                    formatMoney(annuityCorpus),
                    "Locked into a pension for life — you cannot take this as cash",
                  ],
                  [
                    "Estimated monthly pension",
                    formatMoney(monthlyPension),
                    `${formatMoney(annuityCorpus)} × ${annuityRate}% ÷ 12`,
                  ],
                  [
                    `Lump sum (${100 - annuityShare}%)`,
                    formatMoney(lumpSum),
                    "Withdrawn tax-free at 60",
                  ],
                  ["Total invested", formatMoney(plan.invested), `${plan.years * 12} monthly contributions`],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>

              {corpus > 0 && corpus <= 500000 && (
                <div className="mt-5 rounded-md p-4" style={{ background: "var(--anslation-ds-success-soft)" }}>
                  <p className="text-sm leading-6">
                    Your projected corpus is under ₹5 lakh, so the annuity rule does not bite — at 60 you can
                    withdraw the entire amount as a tax-free lump sum and skip the pension altogether.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">What you save in tax, every year</h2>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm font-semibold">Tax regime</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["old", "Old regime"],
                      ["new", "New regime"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRegime(id)}
                        className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                          regime === id
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold">Your tax slab</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {slabs.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSlab(rate)}
                        className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                          slab === rate
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-semibold">Annual basic + DA</span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={annualBasic}
                    onChange={(event) => setAnnualBasic(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Other 80C already used</span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={other80c}
                    onChange={(event) => setOther80c(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Employer NPS %</span>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    step="1"
                    value={employerPct}
                    onChange={(event) => setEmployerPct(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="py-2 pr-3 font-semibold">Section</th>
                      <th className="py-2 pr-3 font-semibold">Rule applied</th>
                      <th className="py-2 text-right font-semibold">Deduction</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2.5 pr-3 font-semibold">80CCD(1B)</td>
                      <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                        {regime === "old"
                          ? "Extra ₹50,000, over and above the 1.5 lakh limit"
                          : "Not available in the new regime"}
                      </td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {formatMoney(tax.ded1B)}
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2.5 pr-3 font-semibold">80CCD(1)</td>
                      <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                        {regime === "old"
                          ? `Lower of the balance, ₹1.5L minus other 80C (${formatMoney(
                              Math.max(0, 150000 - (Number(other80c) || 0))
                            )}), and 10% of basic (${formatMoney(0.1 * basicAnnual)})`
                          : "Not available in the new regime"}
                      </td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {formatMoney(tax.ded1)}
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2.5 pr-3 font-semibold">80CCD(2)</td>
                      <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                        Employer contribution up to {tax.employerCapPct}% of basic + DA — outside every other
                        limit
                      </td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {formatMoney(tax.ded2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-semibold">Total deduction</td>
                      <td className="py-3 pr-3 text-[var(--muted-foreground)]">
                        Tax saved at {slab}% + 4% cess
                      </td>
                      <td className="py-3 text-right text-base font-semibold tabular-nums text-[var(--primary)]">
                        {formatMoney(tax.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Tax saved this year</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--anslation-ds-success)]">
                    {formatMoney(tax.saved)}
                  </p>
                </div>
                <p className="max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                  On {formatMoney(selfAnnual)} of your own contributions
                  {employerAnnual > 0 ? ` plus ${formatMoney(employerAnnual)} from your employer` : ""}.
                  {regime === "new" &&
                    " The new regime strips out 80C and 80CCD(1B) entirely — only the employer's contribution still earns a deduction."}
                </p>
              </div>

              <div
                className="mt-5 flex gap-3 rounded-md p-4"
                style={{ background: "var(--anslation-ds-success-soft)" }}
              >
                <Sparkles
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "var(--anslation-ds-success)" }}
                />
                <p className="text-sm leading-6">
                  <strong>The ₹50,000 under 80CCD(1B) is NPS-only.</strong> No ELSS, PPF, insurance premium or
                  home-loan principal can touch it. If your ₹1.5 lakh 80C limit is already full and you are in the
                  old regime, this is the single cheapest deduction left on the table — worth{" "}
                  {formatMoney(50000 * (slab / 100) * 1.04)} at your {slab}% slab.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Year-wise growth</h2>
              </div>
              <div className="mt-4 max-h-[420px] overflow-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-[var(--card)]">
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="py-2 pr-3 font-semibold">Age</th>
                      <th className="py-2 pr-3 text-right font-semibold">Opening</th>
                      <th className="py-2 pr-3 text-right font-semibold">Contribution</th>
                      <th className="py-2 pr-3 text-right font-semibold">Gains</th>
                      <th className="py-2 text-right font-semibold">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rows.map((row) => (
                      <tr key={row.index} className="border-b border-[var(--border)]">
                        <td className="py-2.5 pr-3 font-semibold">{row.age}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                          {formatMoney(row.opening)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {formatMoney(row.contribution)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--anslation-ds-success)]">
                          {formatMoney(row.gains)}
                        </td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">
                          {formatMoney(row.closing)}
                        </td>
                      </tr>
                    ))}
                    {plan.rows.length === 0 && (
                      <tr>
                        <td className="py-4 text-[var(--muted-foreground)]" colSpan={5}>
                          Exit age must be higher than your current age.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Exit &amp; withdrawal rules</h2>
                </div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>
                    <strong className="text-[var(--foreground)]">At 60:</strong> at least 40% must buy an annuity;
                    up to 60% comes out as a tax-free lump sum. A corpus of ₹5 lakh or less can be withdrawn
                    entirely.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Before 60:</strong> after five years you may
                    exit, but 80% has to go into an annuity and only 20% comes back as cash. A corpus of ₹2.5 lakh
                    or less can be taken in full.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Partial withdrawal:</strong> up to 25% of your
                    own contributions, after three years, three times in all, only for reasons such as a house,
                    illness, education or a marriage.
                  </li>
                  <li>
                    You can keep the account running to 75 and defer the annuity, letting the corpus compound
                    further.
                  </li>
                  <li>
                    On death before 60 the nominee receives the entire corpus, tax-free.
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Read this before you commit</h2>
                </div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>
                    The lump sum is tax-free, but the pension is not — annuity income is taxed at your slab, every
                    year, for life.
                  </li>
                  <li>
                    Annuity rates are locked on the day you buy. Today&apos;s 6–7% quotes are not guaranteed to be
                    there in thirty years, and most plans do not index the payout to inflation.
                  </li>
                  <li>
                    Returns are market-linked, not assured. The 12 / 8 / 7 figures here are long-run assumptions
                    for the E, C and G funds — not promises.
                  </li>
                  <li>
                    Money is locked until 60. That illiquidity is the price of the extra ₹50,000 deduction, so fund
                    your emergency corpus first.
                  </li>
                  <li>
                    Auto Choice tapers equity down as you age; Active Choice caps equity at 75% until 50 and
                    reduces it thereafter.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
