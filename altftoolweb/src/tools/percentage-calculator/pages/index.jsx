"use client";

import { useMemo, useState } from "react";
import { Percent, TrendingDown, TrendingUp } from "lucide-react";

const modes = [
  { id: "of", label: "What is X% of Y?" },
  { id: "ratio", label: "X is what % of Y?" },
  { id: "change", label: "Percentage change" },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(
    Number.isFinite(value) ? value : 0
  );

export default function ToolHome() {
  const [mode, setMode] = useState("of");
  const [first, setFirst] = useState(18);
  const [second, setSecond] = useState(1000);

  const result = useMemo(() => {
    const a = Number(first) || 0;
    const b = Number(second) || 0;

    if (mode === "of") {
      return {
        value: (a / 100) * b,
        label: `${a}% of ${b}`,
        detail: "Formula: percentage x value / 100",
      };
    }

    if (mode === "ratio") {
      return {
        value: b === 0 ? 0 : (a / b) * 100,
        label: `${a} as a percentage of ${b}`,
        detail: "Formula: part / whole x 100",
        suffix: "%",
      };
    }

    return {
      value: a === 0 ? 0 : ((b - a) / a) * 100,
      label: `Change from ${a} to ${b}`,
      detail: "Formula: (new value - old value) / old value x 100",
      suffix: "%",
      direction: b >= a ? "up" : "down",
    };
  }, [first, second, mode]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Percent className="h-4 w-4" />
            Daily calculator
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Percentage Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Solve everyday percentage questions for discounts, tax, marks, growth, and business math.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-2">
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
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">
                  {mode === "change" ? "Old value" : mode === "ratio" ? "Part value" : "Percentage"}
                </span>
                <input
                  type="number"
                  value={first}
                  onChange={(event) => setFirst(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">
                  {mode === "change" ? "New value" : mode === "ratio" ? "Whole value" : "Value"}
                </span>
                <input
                  type="number"
                  value={second}
                  onChange={(event) => setSecond(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{result.label}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="rounded-lg bg-[var(--muted)] p-5">
                <p className="text-4xl font-semibold text-[var(--primary)]">
                  {formatNumber(result.value)}{result.suffix || ""}
                </p>
              </div>
              {mode === "change" && (
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  {result.direction === "up" ? <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-success)]" /> : <TrendingDown className="h-4 w-4 text-[var(--anslation-ds-danger)]" />}
                  {result.direction === "up" ? "Increase" : "Decrease"}
                </div>
              )}
            </div>
            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">{result.detail}</p>

            <div className="tool-compact-grid mt-6">
              {[
                ["10% of value", formatNumber((10 / 100) * (Number(second) || 0))],
                ["25% of value", formatNumber((25 / 100) * (Number(second) || 0))],
                ["50% of value", formatNumber((50 / 100) * (Number(second) || 0))],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
