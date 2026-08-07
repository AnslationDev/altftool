"use client";

import { useState } from "react";
import { Fish, Pill, Leaf, Calculator, Info, RefreshCcw, Brain } from "lucide-react";

export default function Omega3IntakeCalculator() {
  const [formData, setFormData] = useState({
    salmon: 0,
    sardines: 0,
    otherFish: 0,
    seeds: 0,
    walnuts: 0,
    supplement: 0
  });

  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Math.max(0, parseFloat(value) || 0)
    }));
  };

  const calculateIntake = () => {
    // Approximate EPA+DHA content per serving (in mg)
    // Salmon: ~1500mg per 3.5oz serving
    // Sardines: ~1200mg per 3.5oz serving
    // Other fish (tuna, cod, etc): ~300mg per serving
    // Flax/Chia seeds (1 tbsp) & Walnuts (1 oz): High in ALA. Conversion to EPA/DHA is poor (~5-10%).
    // We'll estimate about 100mg EPA/DHA equivalent per serving.
    // Supplements: Daily mg of EPA+DHA

    let weeklyMg = 0;
    weeklyMg += formData.salmon * 1500;
    weeklyMg += formData.sardines * 1200;
    weeklyMg += formData.otherFish * 300;
    weeklyMg += formData.seeds * 100;
    weeklyMg += formData.walnuts * 100;
    weeklyMg += formData.supplement * 7; // supplement is daily

    const dailyMg = Math.round(weeklyMg / 7);

    // Cognitive Health Target: ~1000mg/day for optimal benefits, 250mg/day absolute minimum
    const target = 1000;
    const minTarget = 250;
    const percentage = Math.max(0, Math.min(100, Math.round((dailyMg / target) * 100)));

    let status, tone;
    if (dailyMg >= target) {
      status = "Optimal for Cognitive Health";
      tone = "good";
    } else if (dailyMg >= minTarget) {
      status = "Adequate for Basic Health";
      tone = "warn";
    } else {
      status = "Deficient";
      tone = "bad";
    }

    setResults({ dailyMg, weeklyMg, percentage, status, tone, target });
  };

  const backToForm = () => {
    setResults(null);
  };

  const resetForm = () => {
    setResults(null);
    setFormData({
      salmon: 0,
      sardines: 0,
      otherFish: 0,
      seeds: 0,
      walnuts: 0,
      supplement: 0
    });
  };

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <Fish className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--foreground)]">
            Omega-3 Intake Calculator
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Estimate your daily EPA & DHA intake to ensure your brain gets the essential fatty acids it needs.
          </p>
        </header>

        {!results ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Fish className="w-5 h-5 text-blue-500" /> Marine Sources (Servings per Week)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="omega3-salmon" className="text-sm font-semibold text-[var(--muted-foreground)]">Salmon / Mackerel</label>
                    <input id="omega3-salmon" type="number" min="0" name="salmon" value={formData.salmon || ""} onChange={handleChange} placeholder="0" className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-lg px-4 py-2" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="omega3-sardines" className="text-sm font-semibold text-[var(--muted-foreground)]">Sardines / Anchovies</label>
                    <input id="omega3-sardines" type="number" min="0" name="sardines" value={formData.sardines || ""} onChange={handleChange} placeholder="0" className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-lg px-4 py-2" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="omega3-other-fish" className="text-sm font-semibold text-[var(--muted-foreground)]">Other Fish (Tuna, Cod, etc)</label>
                    <input id="omega3-other-fish" type="number" min="0" name="otherFish" value={formData.otherFish || ""} onChange={handleChange} placeholder="0" className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-lg px-4 py-2" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Leaf className="w-5 h-5 text-emerald-500" /> Plant Sources (Servings per Week)
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mb-4 flex items-start gap-1">
                  <Info className="w-4 h-4 shrink-0" />
                  Plant sources provide ALA, which the body converts to EPA/DHA inefficiently (~5%). The calculator accounts for this.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="omega3-seeds" className="text-sm font-semibold text-[var(--muted-foreground)]">Chia / Flaxseeds (1 Tbsp)</label>
                    <input id="omega3-seeds" type="number" min="0" name="seeds" value={formData.seeds || ""} onChange={handleChange} placeholder="0" className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-lg px-4 py-2" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="omega3-walnuts" className="text-sm font-semibold text-[var(--muted-foreground)]">Walnuts (1 oz / Handful)</label>
                    <input id="omega3-walnuts" type="number" min="0" name="walnuts" value={formData.walnuts || ""} onChange={handleChange} placeholder="0" className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-lg px-4 py-2" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Pill className="w-5 h-5 text-purple-500" /> Supplements (Daily)
                </h3>
                <div className="space-y-2">
                  <label htmlFor="omega3-supplement" className="text-sm font-semibold text-[var(--muted-foreground)]">Fish / Algae Oil Supplement (Combined EPA+DHA in mg per day)</label>
                  <input id="omega3-supplement" type="number" min="0" step="50" name="supplement" value={formData.supplement || ""} onChange={handleChange} placeholder="e.g. 500" className="w-full bg-[var(--section-highlight)] border border-[var(--border)] rounded-lg px-4 py-2" />
                </div>
              </div>

            </div>

            <button onClick={calculateIntake} className="btn-primary w-full mt-8 py-4 rounded-xl text-lg font-bold inline-flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5" /> Calculate Intake
            </button>
          </div>
        ) : (
          <div aria-live="polite" role="status" className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-md animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-2">Your Omega-3 Analysis</h2>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[var(--section-highlight)] text-[var(--muted-foreground)] text-sm font-bold mb-6">
                Optimal Target: {results.target} mg/day
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className={`text-6xl font-black ${
                  results.tone === 'good' ? 'text-emerald-500' :
                  results.tone === 'warn' ? 'text-amber-500' :
                  'text-rose-500'
                }`}>
                  {results.dailyMg} <span className="text-2xl text-[var(--muted-foreground)]">mg/day</span>
                </span>
                <span className="text-lg font-bold mt-2 text-[var(--foreground)]">{results.status}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-sm font-bold text-[var(--muted-foreground)] mb-2">
                <span>0</span>
                <span>{results.percentage}% of Optimal</span>
                <span>{results.target} mg</span>
              </div>
              <div className="w-full h-4 bg-[var(--section-highlight)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    results.tone === 'good' ? 'bg-emerald-500' :
                    results.tone === 'warn' ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${results.percentage}%` }}
                />
              </div>
            </div>

            <div className="bg-[var(--section-highlight)] rounded-xl p-6 mb-8">
              <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-indigo-500" /> Why this matters
              </h4>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Omega-3 fatty acids, specifically EPA and DHA, are crucial building blocks for your brain.
                They reduce neuro-inflammation, support cell membrane fluidity, and are linked to improved mood, memory, and cognitive longevity.
                Most experts recommend at least 250-500mg daily for basic health, but up to 1000-2000mg for therapeutic cognitive and cardiovascular benefits.
              </p>
            </div>

            <div className="text-center flex flex-wrap items-center justify-center gap-3">
              <button onClick={backToForm} className="btn-secondary px-8 py-3 rounded-xl inline-flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Recalculate
              </button>
              <button onClick={resetForm} className="px-8 py-3 rounded-xl inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
