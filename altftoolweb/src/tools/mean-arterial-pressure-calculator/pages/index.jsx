"use client";

import { useMemo, useState } from "react";
import { HeartPulse, Info, RotateCcw } from "lucide-react";

const MAP_RANGES = [
  { label: "Low", range: "< 60", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", description: "Hypotension — may indicate inadequate organ perfusion." },
  { label: "Normal", range: "70–100", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Healthy blood flow to organs." },
  { label: "Pre-Hypertension", range: "100–109", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Above normal — monitor and consider lifestyle changes." },
  { label: "High", range: "110–119", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Stage 1 hypertension risk — consult a healthcare provider." },
  { label: "Very High", range: "≥ 120", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Stage 2 hypertension — seek medical advice." },
];

function getMapCategory(map) {
  if (map < 60) return MAP_RANGES[0];
  if (map < 100) return MAP_RANGES[1];
  if (map < 110) return MAP_RANGES[2];
  if (map < 120) return MAP_RANGES[3];
  return MAP_RANGES[4];
}

function MapGauge({ value }) {
  const min = 40;
  const max = 140;
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  const angle = (pct / 100) * 180 - 90;

  return (
    <div className="relative w-64 h-36 mx-auto flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="30%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" />
        <line
          x1="100"
          y1="100"
          x2={100 + 45 * Math.cos((angle) * Math.PI / 180)}
          y2={100 - 45 * Math.sin((angle) * Math.PI / 180)}
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="var(--foreground)" />
        <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "22px", fontWeight: "900" }}>{value}</text>
        <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "9px", fontWeight: "800" }}>mmHg</text>
      </svg>
    </div>
  );
}

export default function ToolHome() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0 || sys < dia) return;
    const map = dia + (sys - dia) / 3;
    const category = getMapCategory(map);
    setResult({ map: map.toFixed(1), category, systolic: sys, diastolic: dia });
  };

  const reset = () => {
    setSystolic("");
    setDiastolic("");
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <HeartPulse className="h-4 w-4" />
            Blood pressure analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Mean Arterial Pressure Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Calculate your MAP — the average arterial pressure during a cardiac cycle — from systolic and diastolic readings.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Blood Pressure Input</h2>
            <label className="block">
              <span className="text-sm font-semibold">Systolic (mmHg)</span>
              <input
                type="number"
                min="0"
                max="300"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">The top number — pressure when heart contracts</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Diastolic (mmHg)</span>
              <input
                type="number"
                min="0"
                max="200"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">The bottom number — pressure when heart rests</span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={calculate}
                disabled={!systolic || !diastolic}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Calculate MAP
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--muted)] active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Gauge */}
                <div className="rounded-lg bg-[var(--muted)]/50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Mean Arterial Pressure</p>
                  <MapGauge value={result.map} />
                  <p className={`text-2xl font-black mt-2 ${result.category.color}`}>{result.category.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{result.systolic}/{result.diastolic} mmHg</p>
                </div>

                {/* Formula */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Formula</p>
                  <p className="text-sm text-[var(--foreground)] font-mono">
                    MAP = DBP + 1/3 × (SBP − DBP)
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 font-mono">
                    MAP = {result.diastolic} + 1/3 × ({result.systolic} − {result.diastolic}) = <span className="font-bold">{result.map} mmHg</span>
                  </p>
                </div>

                {/* Status */}
                <div className={`rounded-lg border p-4 ${result.category.bg} ${result.category.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.category.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.category.color}`}>{result.category.label} — {result.category.range} mmHg</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Reference Table */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Reference Ranges</p>
                  <div className="space-y-2">
                    {MAP_RANGES.map((r) => (
                      <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.bg} ${r.border} ${r.label === result.category.label ? "ring-2 ring-offset-1" : "opacity-70"}`} style={r.label === result.category.label ? { ringColor: "var(--primary)" } : {}}>
                        <span className={`font-semibold ${r.color}`}>{r.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{r.range} mmHg</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <HeartPulse className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Enter your blood pressure to calculate MAP</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">MAP is a key indicator of organ perfusion and cardiovascular health.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Mean Arterial Pressure</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">What is MAP?</p>
              <p>Mean Arterial Pressure is the average pressure in a patient&apos;s arteries during one cardiac cycle. It is considered a better indicator of perfusion to vital organs than systolic blood pressure alone.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Why does it matter?</p>
              <p>A MAP below 60 mmHg is generally insufficient to sustain organ function. Maintaining a MAP of 70 mmHg or higher is critical for adequate cerebral and renal perfusion, especially in critically ill patients.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
