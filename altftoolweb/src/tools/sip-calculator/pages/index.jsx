"use client";

import { useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

function RangeField({ label, value, suffix, min, max, step, onChange }) {
  return (
    <label className="block rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 text-sm font-semibold text-[var(--foreground)]">{label}</span>
        <span className="max-w-full rounded-md bg-[var(--muted)] px-2 py-1 text-sm font-semibold text-[var(--primary)] break-words">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--primary)]"
      />
      <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </label>
  );
}

export default function ToolHome() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUp, setStepUp] = useState(0);

  const result = useMemo(() => {
    const monthlyRate = returnRate / 100 / 12;
    let totalInvested = 0;
    let futureValue = 0;
    let currentSip = monthlyInvestment;

    for (let month = 1; month <= years * 12; month += 1) {
      futureValue = (futureValue + currentSip) * (1 + monthlyRate);
      totalInvested += currentSip;
      if (month % 12 === 0) currentSip *= 1 + stepUp / 100;
    }

    return {
      invested: Math.round(totalInvested),
      maturity: Math.round(futureValue),
      gains: Math.round(futureValue - totalInvested),
      finalSip: Math.round(currentSip / (1 + stepUp / 100)),
    };
  }, [monthlyInvestment, returnRate, years, stepUp]);

  const gainPercent = result.invested ? ((result.gains / result.invested) * 100).toFixed(1) : "0.0";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="grid gap-6 2xl:grid-cols-[1fr_360px] 2xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <TrendingUp className="h-4 w-4" />
                Wealth planning
              </div>
              <h1 className="text-4xl font-semibold leading-tight">SIP Calculator</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Estimate mutual fund SIP maturity with monthly investing, expected returns, and yearly step-up.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Estimated maturity</p>
              <p className="tool-money-value tool-hero-value mt-2 text-[var(--primary)]">{formatMoney(result.maturity)}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Wealth gain: {formatMoney(result.gains)}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <RangeField label="Monthly SIP" value={monthlyInvestment} suffix="" min={500} max={200000} step={500} onChange={setMonthlyInvestment} />
            <RangeField label="Expected annual return" value={returnRate} suffix="%" min={1} max={30} step={0.5} onChange={setReturnRate} />
            <RangeField label="Investment period" value={years} suffix=" yr" min={1} max={40} step={1} onChange={setYears} />
            <RangeField label="Annual SIP step-up" value={stepUp} suffix="%" min={0} max={25} step={1} onChange={setStepUp} />
          </div>

          <div className="space-y-4">
            <div className="tool-card-grid">
              {[
                ["Total invested", formatMoney(result.invested)],
                ["Estimated returns", formatMoney(result.gains)],
                ["Maturity amount", formatMoney(result.maturity)],
                ["Final monthly SIP", formatMoney(result.finalSip)],
              ].map(([label, value], index) => (
                <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                  <p className={`tool-money-value mt-2 ${index === 2 ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <BarChart3 className="h-4 w-4" />
                Portfolio split
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${Math.min(100, (result.invested / result.maturity) * 100)}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Estimated gain is {gainPercent}% of your invested amount. Actual mutual fund returns vary with market performance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
