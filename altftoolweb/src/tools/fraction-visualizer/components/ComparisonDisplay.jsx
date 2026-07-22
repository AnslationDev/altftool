"use client";

import { compareFractions, toDecimal, toPercentage } from "../utils/fractionMath";
import PieChartViz from "./PieChartViz";

export default function ComparisonDisplay({ fractions, color = "var(--primary)" }) {
  if (!fractions || fractions.length < 2) return null;

  const comparison = compareFractions(fractions[0].n, fractions[0].d, fractions[1].n, fractions[1].d);
  const symbol = comparison === 0 ? "=" : comparison > 0 ? ">" : "<";

  const colors = ["var(--primary)", "#22D3EE", "#8B5CF6", "#F59E0B", "#EF4444"];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h4 className="mb-4 text-center text-sm font-bold uppercase text-[var(--muted-foreground)]">
        Comparison
      </h4>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        {fractions.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <PieChartViz
              numerator={f.n}
              denominator={f.d}
              size={140}
              color={colors[i % colors.length]}
              label={`${f.n}/${f.d}`}
            />
            <div className="text-center">
              <p className="text-xs text-[var(--muted-foreground)]">
                Decimal: {toDecimal(f.n, f.d)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Percentage: {toPercentage(f.n, f.d)}%
              </p>
            </div>
            {i < fractions.length - 1 && (
              <div className="hidden text-3xl font-extrabold text-[var(--primary)] sm:block">
                {symbol}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-lg font-extrabold text-[var(--foreground)]">
        {fractions.map((f) => `${f.n}/${f.d}`).join(` ${symbol} `)}
      </p>
    </div>
  );
}
