"use client";

import { useState } from "react";
import { GitCompareArrows } from "lucide-react";
import { SectionCard, ACCENT } from "./ui";
import { calculateExactAge } from "../utils/dateUtils";

function ageOf(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime()) || d > new Date()) return null;
  const a = calculateExactAge(d);
  return { ...a, totalMonths: a.years * 12 + a.months };
}

const inputCls =
  "h-11 w-full rounded-lg border border-(--border) bg-(--background) px-3 text-sm font-medium text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]";

function Row({ label, age, months, max, tone }) {
  const pct = max > 0 ? Math.round((months / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
        <span className="text-(--foreground)">{label}</span>
        <span className="text-(--muted-foreground)">{age ? `${age.years} years ${age.months} months` : "—"}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--border)">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

export default function CompareAges({ defaultDate = "" }) {
  const [a, setA] = useState(defaultDate);
  const [b, setB] = useState("");
  const [result, setResult] = useState(null);

  const run = () => {
    const ageA = ageOf(a);
    const ageB = ageOf(b);
    if (!ageA || !ageB) { setResult({ error: "Enter two valid past dates." }); return; }
    setResult({ ageA, ageB, max: Math.max(ageA.totalMonths, ageB.totalMonths, 1) });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <SectionCard title="Compare With Someone" icon={GitCompareArrows}>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-(--muted-foreground)">Your Birth Date</span>
          <input type="date" max={todayStr} value={a} onChange={(e) => setA(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-(--muted-foreground)">Their Birth Date</span>
          <input type="date" max={todayStr} value={b} onChange={(e) => setB(e.target.value)} className={inputCls} />
        </label>
        <button
          type="button"
          onClick={run}
          className="mt-auto inline-flex h-11 items-center justify-center rounded-lg bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
        >
          Compare
        </button>
      </div>

      {result?.error && <p className="mt-3 text-sm font-semibold text-[var(--danger,#EF4444)]">{result.error}</p>}
      {result && !result.error && (
        <div className="mt-4 space-y-3">
          <Row label="You" age={result.ageA} months={result.ageA.totalMonths} max={result.max} tone={ACCENT.teal} />
          <Row label="Them" age={result.ageB} months={result.ageB.totalMonths} max={result.max} tone={ACCENT.violet} />
        </div>
      )}
    </SectionCard>
  );
}
