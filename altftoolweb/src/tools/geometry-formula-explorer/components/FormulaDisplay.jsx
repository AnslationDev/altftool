"use client";

import { Info } from "lucide-react";

export default function FormulaDisplay({ shape, values, results, selectedFormula, onSelectFormula, steps }) {
  if (!shape) return null;

  return (
    <div className="space-y-4">
      {/* Input Fields */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Dimensions</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shape.fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[var(--muted-foreground)]">{f.label}</label>
              <input
                type="number"
                step="0.1"
                min={f.min}
                value={values[f.key] ?? f.default}
                onChange={() => {}}
                readOnly
                className="h-12 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Formulas & Results</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectFormula(r)}
              className={`flex w-full items-center justify-between px-6 py-4 text-left transition-all hover:bg-[var(--section-highlight)] ${
                selectedFormula?.id === r.id ? "bg-[var(--primary)]/5" : ""
              }`}
            >
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{r.label}</p>
                <p className="font-mono text-xs text-[var(--muted-foreground)]">{r.formula}</p>
              </div>
              <span className="text-xl font-extrabold text-[var(--primary)]">{r.result}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step by Step */}
      {steps && steps.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Step-by-Step Calculation</h3>
          </div>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                  {i + 1}
                </span>
                <span className="pt-0.5 font-mono text-sm text-[var(--foreground)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
