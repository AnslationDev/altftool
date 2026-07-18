"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Bed,
  Brain,
  Coffee,
  MonitorSmartphone,
  Dumbbell,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const PHASES = { SETUP: "setup", RESULTS: "results" };

function SliderInput({ label, icon: Icon, value, min, max, step, onChange, formatValue }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <label className="flex items-center gap-2 font-bold text-[var(--foreground)]">
          <Icon className="h-5 w-5 text-[var(--primary)]" />
          {label}
        </label>
        <span className="font-extrabold text-[var(--primary)]">{formatValue ? formatValue(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border-strong)] accent-[var(--primary)]"
      />
      <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

function SelectInput({ label, icon: Icon, value, options, onChange }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
      <label className="mb-4 flex items-center gap-2 font-bold text-[var(--foreground)]">
        <Icon className="h-5 w-5 text-[var(--primary)]" />
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
              value === opt.value
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FocusScoreCalculator() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  
  // Inputs
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3); // 1-4
  const [screenTime, setScreenTime] = useState(5); // hours
  const [exercise, setExercise] = useState(2); // 1-4
  const [deepWork, setDeepWork] = useState(2); // 1-4
  
  // Calculate score
  const results = useMemo(() => {
    // Max total score = 100
    // Sleep: max 35 (Duration max 20, Quality max 15)
    let sleepDurScore = 0;
    if (sleepHours >= 7 && sleepHours <= 9) sleepDurScore = 20;
    else if (sleepHours >= 6 && sleepHours < 7) sleepDurScore = 15;
    else if (sleepHours > 9) sleepDurScore = 15;
    else if (sleepHours >= 5 && sleepHours < 6) sleepDurScore = 8;
    else sleepDurScore = 0;

    const sleepQualScore = (sleepQuality / 4) * 15;
    
    // Screen Time: max 25
    let screenScore = 25;
    if (screenTime > 2) {
      screenScore -= (screenTime - 2) * 2.5;
    }
    screenScore = Math.max(0, screenScore);

    // Exercise: max 20
    const exerciseScore = (exercise / 4) * 20;

    // Deep Work routines: max 20
    const deepWorkScore = (deepWork / 4) * 20;

    const total = Math.round(sleepDurScore + sleepQualScore + screenScore + exerciseScore + deepWorkScore);

    const breakdown = [
      { name: "Sleep", value: Math.round(sleepDurScore + sleepQualScore), fill: "#8b5cf6" },
      { name: "Digital Habits", value: Math.round(screenScore), fill: "#3b82f6" },
      { name: "Physical Activity", value: Math.round(exerciseScore), fill: "#10b981" },
      { name: "Deep Work", value: Math.round(deepWorkScore), fill: "#f59e0b" },
    ];

    let grade, message, tone;
    if (total >= 85) {
      grade = "Elite Focus";
      message = "Your lifestyle habits are perfectly optimized for sustained attention and deep work.";
      tone = "emerald";
    } else if (total >= 70) {
      grade = "Good Focus";
      message = "You have solid habits, but slight tweaks could unlock your peak cognitive performance.";
      tone = "blue";
    } else if (total >= 50) {
      grade = "Average Focus";
      message = "Your focus is being hindered by sub-optimal lifestyle factors. Consider making some adjustments.";
      tone = "amber";
    } else {
      grade = "Depleted Focus";
      message = "Your cognitive energy is heavily drained. Focus on foundational habits like sleep and digital detox.";
      tone = "rose";
    }

    const tips = [];
    if (sleepDurScore + sleepQualScore < 25) {
      tips.push({ text: "Prioritize getting 7-8 hours of high-quality sleep to allow neuroplasticity and memory consolidation.", type: "warn" });
    }
    if (screenScore < 15) {
      tips.push({ text: "High screen time depletes dopamine receptors. Try limiting non-essential screen time, especially before bed.", type: "warn" });
    }
    if (exerciseScore < 10) {
      tips.push({ text: "Aerobic exercise increases BDNF, which is critical for focus and learning. Try to exercise at least 3x a week.", type: "warn" });
    }
    if (deepWorkScore < 15) {
      tips.push({ text: "Incorporate dedicated 90-minute 'Deep Work' blocks without interruptions to train your sustained attention.", type: "warn" });
    }
    
    if (tips.length === 0) {
      tips.push({ text: "Keep doing what you're doing! Consistency is the key to maintaining this high level of cognitive performance.", type: "good" });
    }

    return { total, grade, message, tone, breakdown, tips };
  }, [sleepHours, sleepQuality, screenTime, exercise, deepWork]);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
          <Activity className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Focus Score Calculator
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Discover how your sleep, digital habits, and lifestyle impact your daily cognitive energy and ability to concentrate.
        </p>
      </header>

      {phase === PHASES.SETUP ? (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-extrabold text-[var(--foreground)]">Lifestyle Questionnaire</h2>
            
            <div className="space-y-6">
              <SliderInput
                label="Average Sleep Duration"
                icon={Bed}
                value={sleepHours}
                min={3}
                max={12}
                step={0.5}
                onChange={setSleepHours}
                formatValue={(v) => `${v} hours`}
              />

              <SelectInput
                label="Sleep Quality"
                icon={Zap}
                value={sleepQuality}
                onChange={setSleepQuality}
                options={[
                  { label: "Poor", value: 1 },
                  { label: "Fair", value: 2 },
                  { label: "Good", value: 3 },
                  { label: "Excellent", value: 4 },
                ]}
              />

              <SliderInput
                label="Non-Work Screen Time (Daily)"
                icon={MonitorSmartphone}
                value={screenTime}
                min={0}
                max={12}
                step={0.5}
                onChange={setScreenTime}
                formatValue={(v) => `${v} hours`}
              />

              <SelectInput
                label="Exercise Frequency"
                icon={Dumbbell}
                value={exercise}
                onChange={setExercise}
                options={[
                  { label: "Rarely", value: 1 },
                  { label: "1-2x Week", value: 2 },
                  { label: "3-4x Week", value: 3 },
                  { label: "Daily", value: 4 },
                ]}
              />

              <SelectInput
                label="Deep Work Sessions"
                icon={Brain}
                value={deepWork}
                onChange={setDeepWork}
                options={[
                  { label: "Rarely", value: 1 },
                  { label: "Sometimes", value: 2 },
                  { label: "Often", value: 3 },
                  { label: "Daily", value: 4 },
                ]}
              />
            </div>

            <button
              onClick={() => setPhase(PHASES.RESULTS)}
              className="btn-primary mt-8 w-full rounded-xl py-4 text-lg font-bold"
            >
              Calculate My Focus Score
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-lg">
            <h2 className="mb-2 text-lg font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Your Focus Potential</h2>
            <div className="relative my-6 flex h-48 w-48 items-center justify-center">
              <SafeResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: results.total }, { value: 100 - results.total }]}
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={`var(--${results.tone}-500, #6366f1)`} />
                    <Cell fill="var(--border-strong)" />
                  </Pie>
                </PieChart>
              </SafeResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-[var(--foreground)]">{results.total}</span>
                <span className="text-sm font-bold text-[var(--muted-foreground)]">/ 100</span>
              </div>
            </div>
            
            <h3 className={`text-2xl font-extrabold text-${results.tone}-500`}>{results.grade}</h3>
            <p className="mt-2 max-w-md text-[var(--muted-foreground)]">{results.message}</p>
            
            <button
              onClick={() => setPhase(PHASES.SETUP)}
              className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--background)] px-6 py-2 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--section-highlight)]"
            >
              Recalculate
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
                <Activity className="h-5 w-5 text-[var(--primary)]" />
                Score Breakdown
              </h3>
              <div className="h-64">
                <SafeResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {results.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}
                      itemStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                    />
                  </PieChart>
                </SafeResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {results.breakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></span>
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
                <Coffee className="h-5 w-5 text-[var(--primary)]" />
                Personalized Tips
              </h3>
              <div className="space-y-4">
                {results.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 rounded-xl p-4 ${
                      tip.type === "warn"
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {tip.type === "warn" ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
