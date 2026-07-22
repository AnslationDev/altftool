"use client";

import { useMemo, useState } from "react";
import { Zap, RotateCcw, Info, Heart } from "lucide-react";

const ZONES = [
  { id: 1, name: "Warm Up", pctMin: 50, pctMax: 60, color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200", description: "Easy activity — improves overall health and recovery. Ideal for warm-ups and cool-downs." },
  { id: 2, name: "Fat Burn", pctMin: 60, pctMax: 70, color: "bg-emerald-500", textColor: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200", description: "Moderate effort — primary zone for fat oxidation. Great for endurance and weight management." },
  { id: 3, name: "Cardio", pctMin: 70, pctMax: 80, color: "bg-amber-500", textColor: "text-amber-600", bgLight: "bg-amber-50", border: "border-amber-200", description: "Vigorous activity — improves cardiovascular fitness and aerobic capacity." },
  { id: 4, name: "Peak", pctMin: 80, pctMax: 90, color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50", border: "border-orange-200", description: "High intensity — increases anaerobic threshold and speed. Use sparingly." },
  { id: 5, name: "Maximum", pctMin: 90, pctMax: 100, color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", border: "border-red-200", description: "All-out effort — maximum power and speed. Only for elite athletes in short bursts." },
];

function ZoneBar({ zones, activeZone }) {
  return (
    <div className="space-y-1.5">
      {zones.map((z) => {
        const width = z.pctMax - z.pctMin;
        return (
          <div key={z.id} className="flex items-center gap-3">
            <span className={`w-6 text-center text-xs font-bold ${z.textColor}`}>{z.id}</span>
            <div className="flex-1 h-8 rounded-lg bg-[var(--muted)]/40 overflow-hidden relative">
              <div className={`absolute inset-y-0 left-0 ${z.color} rounded-lg flex items-center justify-between px-3 transition-all duration-700 ease-out ${activeZone === z.id ? "opacity-100 shadow-md" : "opacity-70"}`} style={{ width: `${width}%` }}>
                <span className="text-[10px] font-bold text-white whitespace-nowrap">{z.hrMin}–{z.hrMax}</span>
                <span className="text-[10px] font-bold text-white/80 whitespace-nowrap">{z.pctMin}%–{z.pctMax}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KarvonenToggle({ useKarvonen, restingHR, setRestingHR }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={useKarvonen}
          onChange={(e) => setUseKarvonen(e.target.checked)}
          className="h-4 w-4 rounded accent-[var(--primary)]"
        />
        <span className="text-sm font-semibold">Use Karvonen Method</span>
      </label>
      <p className="text-xs text-[var(--muted)] mt-1">More personalized — uses Heart Rate Reserve (HRR) instead of max HR.</p>
      {useKarvonen && (
        <label className="mt-3 block">
          <span className="text-xs font-semibold">Resting Heart Rate (bpm)</span>
          <input
            type="number"
            min="30"
            max="120"
            value={restingHR}
            onChange={(e) => setRestingHR(Number(e.target.value))}
            placeholder="60"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
          />
        </label>
      )}
    </div>
  );
}

export default function ToolHome() {
  const [age, setAge] = useState("");
  const [useKarvonen, setUseKarvonen] = useState(false);
  const [restingHR, setRestingHR] = useState(60);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) return;

    const maxHR = 220 - ageNum;
    const rhr = useKarvonen ? Math.max(30, Math.min(120, restingHR)) : 0;
    const hrr = maxHR - rhr;

    const zones = ZONES.map((z) => {
      let hrMin, hrMax;
      if (useKarvonen) {
        hrMin = Math.round(rhr + hrr * (z.pctMin / 100));
        hrMax = Math.round(rhr + hrr * (z.pctMax / 100));
      } else {
        hrMin = Math.round(maxHR * (z.pctMin / 100));
        hrMax = Math.round(maxHR * (z.pctMax / 100));
      }
      return { ...z, hrMin, hrMax };
    });

    setResult({
      age: ageNum,
      maxHR,
      method: useKarvonen ? "Karvonen" : "Simple",
      restingHR: rhr,
      hrr,
      zones,
    });
  };

  const reset = () => {
    setAge("");
    setUseKarvonen(false);
    setRestingHR(60);
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Zap className="h-4 w-4" />
            Training intensity zones
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Heart Rate Zone Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Find your optimal training zones based on age-based maximum heart rate or the more precise Karvonen method.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Your Information</h2>
            <label className="block">
              <span className="text-sm font-semibold">Age (years)</span>
              <input
                type="number"
                min="5"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Used to calculate max HR: 220 − age</span>
            </label>

            <KarvonenToggle useKarvonen={useKarvonen} restingHR={restingHR} setRestingHR={setRestingHR} />

            <div className="mt-6 flex gap-3">
              <button
                onClick={calculate}
                disabled={!age}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Calculate Zones
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
                {/* Summary */}
                <div className="rounded-lg bg-[var(--muted)]/50 p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Max HR</p>
                      <p className="text-3xl font-black text-[var(--foreground)] mt-1">{result.maxHR}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">bpm</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Method</p>
                      <p className="text-lg font-bold text-[var(--primary)] mt-1">{result.method}</p>
                      {result.method === "Karvonen" && <p className="text-xs text-[var(--muted-foreground)]">HRR: {result.hrr}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Formula</p>
                      <p className="text-sm font-mono text-[var(--foreground)] mt-2">220 − {result.age}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">= {result.maxHR} bpm</p>
                    </div>
                  </div>
                </div>

                {/* Zone Bar Chart */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Zone Distribution</p>
                  <ZoneBar zones={result.zones} activeZone={-1} />
                </div>

                {/* Zone Cards */}
                <div className="space-y-3">
                  {result.zones.map((z) => (
                    <div key={z.id} className={`rounded-lg border p-4 ${z.bgLight} ${z.border} transition-all hover:shadow-sm`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white ${z.color}`}>{z.id}</span>
                          <span className={`text-sm font-bold ${z.textColor}`}>{z.name}</span>
                        </div>
                        <span className="text-lg font-black text-[var(--foreground)]">{z.hrMin}–{z.hrMax} <span className="text-xs font-normal text-[var(--muted)]">bpm</span></span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{z.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Enter your age to calculate heart rate zones</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Training in the right zone optimizes fat burn, endurance, and performance.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Heart Rate Zones</h3>
          <div className="grid gap-6 sm:grid-cols-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Simple Method</p>
              <p>Uses a percentage of maximum heart rate (220 − age). Quick and easy — suitable for most recreational exercisers.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Karvonen Method</p>
              <p>Accounts for resting heart rate using Heart Rate Reserve (HRR = Max HR − Resting HR). More personalized and accurate for trained individuals.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Zone Training Tips</p>
              <p>Spend 80% of training in Zones 1–2 for aerobic base, and 20% in Zones 3–5 for intensity. Never jump to Zone 5 without proper warm-up.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
