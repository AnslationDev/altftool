import React from "react";
import { Target, Save, CheckCircle2 } from "lucide-react";

export default function ResultDashboard({
  method,
  calculationResult,
  categoryInfo,
  unitSystem,
  saveCurrentResult,
  savedSuccess,
  targetBodyFat,
  setTargetBodyFat,
  goalSimulator
}) {
  return (
    <div className="space-y-6 lg:col-span-5">
      {/* Primary Output Card */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            Computed Dashboard
          </span>
          <span className="rounded-full bg-[var(--card)]/80 px-2.5 py-0.5 text-[11px] font-medium text-[var(--primary)] border border-[var(--card-border)]">
            {method === "navy" ? "Navy Formula" : method === "bmi" ? "Deurenberg BMI" : "Jackson-Pollock"}
          </span>
        </div>

        {calculationResult.valid ? (
          <div className="mt-6 space-y-6">
            <div className="text-center">
              <div className="text-xs text-[var(--secondary-foreground)] font-medium">Estimated Body Fat Percentage</div>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black tracking-tight text-[var(--foreground)]">
                  {calculationResult.bf.toFixed(1)}
                </span>
                <span className="text-2xl font-bold text-[var(--primary)]">%</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border">
                <span className={`h-2 w-2 rounded-full ${categoryInfo.bg.replace('/10', '')}`} />
                <span className={categoryInfo.color}>{categoryInfo.name}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[var(--secondary-foreground)]">Body Fat Distribution</span>
                <span className="text-[var(--muted-foreground)]">Scale: 2% – 40%</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-[var(--background)] overflow-hidden border border-[var(--card-border)]">
                <div
                  className={`h-full rounded-full ${
                    categoryInfo.name.includes("Essential") ? "bg-blue-500" :
                    categoryInfo.name.includes("Athletic") ? "bg-emerald-500" :
                    categoryInfo.name.includes("Fitness") ? "bg-[var(--primary)]" :
                    categoryInfo.name.includes("Acceptable") ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, (calculationResult.bf / 40) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-[var(--muted-foreground)] font-mono px-1">
                <span>2%</span><span>10%</span><span>20%</span><span>30%</span><span>40%+</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--background)]/50 p-3 border border-[var(--card-border)] text-center">
                <span className="text-[11px] text-[var(--secondary-foreground)] block">Fat Mass</span>
                <span className="text-lg font-bold text-amber-400 block mt-0.5">
                  {calculationResult.fatMass.toFixed(1)} <span className="text-xs font-normal">{unitSystem === "metric" ? "kg" : "lbs"}</span>
                </span>
              </div>
              <div className="rounded-xl bg-[var(--background)]/50 p-3 border border-[var(--card-border)] text-center">
                <span className="text-[11px] text-[var(--secondary-foreground)] block">Lean Body Mass</span>
                <span className="text-lg font-bold text-[var(--primary)] block mt-0.5">
                  {calculationResult.leanMass.toFixed(1)} <span className="text-xs font-normal">{unitSystem === "metric" ? "kg" : "lbs"}</span>
                </span>
              </div>
            </div>

            <button
              onClick={saveCurrentResult}
              disabled={savedSuccess}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold shadow-md ${
                savedSuccess
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-gradient-to-r from-[var(--primary)] to-indigo-500 text-white shadow-lg"
              }`}
            >
              {savedSuccess ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved to History</>
              ) : (
                <><Save className="h-4 w-4" /> Log Calculation Frame</>
              )}
            </button>
          </div>
        ) : (
          <div className="py-12 text-center text-[var(--secondary-foreground)]">
            <p className="text-sm font-medium text-amber-500 mb-1">⚠️ Insufficient or invalid fields</p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto">
              {calculationResult.error || "Fill out weight, height, and required parameters."}
            </p>
          </div>
        )}
      </div>

      {/* Goal Planner Card */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--primary)] flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goal Target Planner
          </h3>
          <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold px-2 py-0.5 rounded-full">Constant Muscle Model</span>
        </div>

        {calculationResult.valid ? (
          <div className="space-y-4">
            <p className="text-xs text-[var(--secondary-foreground)]">
              Simulate weight required to hit a target body fat % while preserving lean mass.
            </p>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-[var(--secondary-foreground)]">Target Body Fat:</span>
                <span className="text-[var(--primary)] font-bold">{targetBodyFat}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={targetBodyFat}
                onChange={e => setTargetBodyFat(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)] bg-[var(--background)] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] font-mono mt-1">
                <span>5%</span><span>15%</span><span>25%</span><span>40%</span>
              </div>
            </div>

            {goalSimulator && (
              <div className="rounded-xl bg-[var(--background)]/50 p-3.5 border border-[var(--card-border)] space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[var(--secondary-foreground)]">Goal Weight:</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">
                    {goalSimulator.targetWeight.toFixed(1)} {unitSystem === "metric" ? "kg" : "lbs"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs pt-1 border-t border-[var(--card-border)]">
                  <span className="text-[var(--secondary-foreground)]">Change Required:</span>
                  <span className={`font-semibold text-xs ${goalSimulator.isLoss ? "text-emerald-400" : "text-amber-400"}`}>
                    {goalSimulator.isLoss ? `📉 Lose ${Math.abs(goalSimulator.weightDifference).toFixed(1)}` : `📈 Gain ${goalSimulator.weightDifference.toFixed(1)}`} {unitSystem === "metric" ? "kg" : "lbs"}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] text-center italic">Assuming lean mass stays constant.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)] italic py-3 text-center">
            Compute your estimate first to see goal simulation.
          </p>
        )}
      </div>
    </div>
  );
}
