"use client";

import { useState, useMemo } from "react";
import { HeartPulse, RotateCcw, Info, Copy, Download, CheckCircle2, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const GUIDELINES = {
  accaha: {
    name: "ACC/AHA 2017",
    categories: [
      { label: "Low (Hypotension)", sysMax: 90, diaMax: 60, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", risk: "Low", description: "Blood pressure below normal. May cause dizziness or fainting." },
      { label: "Normal", sysMax: 120, diaMax: 80, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", risk: "Optimal", description: "Blood pressure is within normal range. Maintain healthy lifestyle." },
      { label: "Elevated", sysMax: 129, diaMax: 80, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", risk: "Moderate", description: "Slightly elevated. Lifestyle modifications recommended." },
      { label: "Hypertension Stage 1", sysMax: 139, diaMax: 89, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", risk: "High", description: "Stage 1 hypertension. Lifestyle changes and possibly medication." },
      { label: "Hypertension Stage 2", sysMax: 180, diaMax: 120, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", risk: "Very High", description: "Stage 2 hypertension. Medication and lifestyle changes required." },
      { label: "Hypertensive Crisis", sysMax: Infinity, diaMax: Infinity, color: "text-red-700", bg: "bg-red-100", border: "border-red-300", risk: "Critical", description: "Seek emergency medical care immediately. Organ damage may occur." },
    ],
  },
  esc: {
    name: "ESC/ESH 2018",
    categories: [
      { label: "Low (Hypotension)", sysMax: 90, diaMax: 60, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", risk: "Low", description: "Blood pressure below optimal range." },
      { label: "Optimal", sysMax: 119, diaMax: 79, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", risk: "Optimal", description: "Optimal blood pressure range." },
      { label: "Normal", sysMax: 129, diaMax: 84, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", risk: "Normal", description: "Normal blood pressure. Encourage healthy habits." },
      { label: "High Normal", sysMax: 139, diaMax: 89, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", risk: "Moderate", description: "High-normal BP. Lifestyle modifications advised." },
      { label: "Hypertension Grade 1", sysMax: 159, diaMax: 99, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", risk: "High", description: "Grade 1 hypertension. Consider pharmacological treatment." },
      { label: "Hypertension Grade 2", sysMax: 179, diaMax: 109, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", risk: "Very High", description: "Grade 2 hypertension. Drug treatment recommended." },
      { label: "Hypertension Grade 3", sysMax: Infinity, diaMax: Infinity, color: "text-red-700", bg: "bg-red-100", border: "border-red-300", risk: "Critical", description: "Grade 3. Immediate medical evaluation required." },
    ],
  },
};

const LIFESTYLE_SUGGESTIONS = {
  "Low (Hypotension)": [
    "Increase fluid and salt intake (if not contraindicated)",
    "Avoid prolonged standing",
    "Wear compression stockings",
    "Eat smaller, more frequent meals",
  ],
  Normal: [
    "Maintain a balanced diet rich in fruits and vegetables",
    "Exercise regularly (150 min/week moderate activity)",
    "Limit alcohol and sodium intake",
    "Manage stress through relaxation techniques",
  ],
  Elevated: [
    "Adopt the DASH diet (rich in potassium, magnesium)",
    "Reduce sodium to < 2,300 mg/day",
    "Increase physical activity to 150+ min/week",
    "Achieve and maintain healthy weight (BMI 18.5–24.9)",
  ],
  "Hypertension Stage 1": [
    "Follow DASH diet strictly",
    "Regular aerobic exercise 30 min/day",
    "Limit alcohol to ≤ 1 drink/day",
    "Consider medication if 10-year CV risk > 10%",
  ],
  "Hypertension Stage 2": [
    "Begin antihypertensive medication as prescribed",
    "Strict sodium restriction (< 1,500 mg/day)",
    "Regular monitoring at home (2×/day)",
    "Avoid NSAIDs and decongestants",
  ],
  "Hypertensive Crisis": [
    "Seek immediate emergency medical attention",
    "Do not wait for symptoms to resolve",
    "Call emergency services if BP > 180/120 with symptoms",
    "Possible organ damage — requires urgent evaluation",
  ],
};

function classifyBP(sys, dia, guideline) {
  const cats = GUIDELINES[guideline].categories;
  for (const cat of cats) {
    if (sys <= cat.sysMax && dia <= cat.diaMax) return cat;
  }
  return cats[cats.length - 1];
}

function BpGauge({ sys, dia, category }) {
  const min = 60;
  const max = 200;
  const clampedSys = Math.max(min, Math.min(max, sys));
  const pct = ((clampedSys - min) / (max - min)) * 100;
  const angle = (pct / 100) * 180 - 90;

  return (
    <div className="relative w-64 h-36 mx-auto flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="bpGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="20%" stopColor="#10B981" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#bpGaugeGrad)" strokeWidth="14" strokeLinecap="round" />
        <line
          x1="100"
          y1="100"
          x2={100 + 45 * Math.cos(angle * Math.PI / 180)}
          y2={100 - 45 * Math.sin(angle * Math.PI / 180)}
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="var(--foreground)" />
        <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "22px", fontWeight: "900" }}>{sys}/{dia}</text>
        <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "9px", fontWeight: "800" }}>mmHg</text>
      </svg>
    </div>
  );
}

function TrendIcon({ current, previous }) {
  if (!previous) return <Minus className="h-4 w-4 text-[var(--muted)]" />;
  if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (current < previous) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  return <Minus className="h-4 w-4 text-[var(--muted)]" />;
}

export default function ToolHome() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [guideline, setGuideline] = useState("accaha");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("bpHistory") || "[]");
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const sysValues = history.map((h) => h.sys);
    const diaValues = history.map((h) => h.dia);
    return {
      count: history.length,
      avgSys: Math.round(sysValues.reduce((a, b) => a + b, 0) / sysValues.length),
      avgDia: Math.round(diaValues.reduce((a, b) => a + b, 0) / diaValues.length),
      maxSys: Math.max(...sysValues),
      maxDia: Math.max(...diaValues),
      minSys: Math.min(...sysValues),
      minDia: Math.min(...diaValues),
    };
  }, [history]);

  const calculate = () => {
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0 || sys < dia || sys > 300 || dia > 200) return;

    const category = classifyBP(sys, dia, guideline);
    const hr = heartRate ? parseFloat(heartRate) : null;
    const reading = { sys, dia, hr, guideline, date: new Date().toISOString(), label: category.label };

    setResult({ sys, dia, hr, category, guideline, date: new Date().toLocaleString() });

    const newHistory = [reading, ...history].slice(0, 30);
    setHistory(newHistory);
    if (typeof window !== "undefined") {
      localStorage.setItem("bpHistory", JSON.stringify(newHistory));
    }
  };

  const reset = () => {
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
    setResult(null);
  };

  const clearHistory = () => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("bpHistory");
    }
  };

  const buildReportText = () => {
    if (!result) return "";
    const suggestions = LIFESTYLE_SUGGESTIONS[result.category.label] || [];
    return `
BLOOD PRESSURE CLASSIFICATION REPORT
Generated: ${result.date}
Guideline: ${GUIDELINES[result.guideline].name}
---------------------------------
READING:
- Systolic: ${result.sys} mmHg
- Diastolic: ${result.dia} mmHg
${result.hr ? `- Heart Rate: ${result.hr} bpm` : ""}

CLASSIFICATION:
- Category: ${result.category.label}
- Risk Level: ${result.category.risk}
- ${result.category.description}

LIFESTYLE SUGGESTIONS:
${suggestions.map((s) => `- ${s}`).join("\n")}

---------------------------------
This calculator is for educational and informational purposes only.
Clinical decisions should always be made by qualified healthcare professionals.
    `.trim();
  };

  const copyReport = async () => {
    const success = await safeCopyText(buildReportText());
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BP_Report_${result.sys}_${result.dia}.txt`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This calculator is for educational and informational purposes only. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <HeartPulse className="h-4 w-4" />
            Cardiovascular analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Blood Pressure Classification Tool</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Classify blood pressure readings using ACC/AHA or ESC/ESH guidelines with trend tracking and lifestyle recommendations.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Blood Pressure Input</h2>

            {/* Guideline Selector */}
            <div className="mb-4">
              <span className="text-sm font-semibold">Guideline</span>
              <div className="mt-2 flex gap-2">
                {Object.entries(GUIDELINES).map(([key, g]) => (
                  <button
                    key={key}
                    onClick={() => setGuideline(key)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      guideline === key
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {g.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold">Systolic (mmHg)</span>
              <input
                type="number"
                min="40"
                max="300"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Top number — pressure during contraction</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Diastolic (mmHg)</span>
              <input
                type="number"
                min="20"
                max="200"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Bottom number — pressure during rest</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Heart Rate (Optional)</span>
              <input
                type="number"
                min="30"
                max="250"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Resting heart rate in bpm</span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={calculate}
                disabled={!systolic || !diastolic}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Classify BP
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Blood Pressure Reading</p>
                  <BpGauge sys={result.sys} dia={result.dia} category={result.category} />
                  <p className={`text-2xl font-black mt-2 ${result.category.color}`}>{result.category.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{result.sys}/{result.dia} mmHg &middot; Risk: {result.category.risk}</p>
                </div>

                {/* Status */}
                <div className={`rounded-lg border p-4 ${result.category.bg} ${result.category.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.category.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.category.color}`}>{result.category.label}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Suggestions */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Lifestyle Recommendations</p>
                  <ul className="space-y-2">
                    {(LIFESTYLE_SUGGESTIONS[result.category.label] || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reference Table */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Guideline Categories ({GUIDELINES[result.guideline].name})</p>
                  <div className="space-y-2">
                    {GUIDELINES[result.guideline].categories.map((cat) => (
                      <div key={cat.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${cat.bg} ${cat.border} ${cat.label === result.category.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                        <span className={`font-semibold ${cat.color}`}>{cat.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{cat.sysMax === Infinity ? `> ${GUIDELINES[result.guideline].categories[GUIDELINES[result.guideline].categories.length - 2].sysMax}` : `≤ ${cat.sysMax}`}/{cat.diaMax === Infinity ? `> ${GUIDELINES[result.guideline].categories[GUIDELINES[result.guideline].categories.length - 2].diaMax}` : `≤ ${cat.diaMax}`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={copyReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Report"}
                  </button>
                  <button onClick={downloadReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <HeartPulse className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Enter your blood pressure to classify</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Track readings over time to monitor cardiovascular health trends.</p>
              </div>
            )}
          </div>
        </section>

        {/* Reading History */}
        {history.length > 0 && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Recent Readings ({history.length})</h3>
              <button onClick={clearHistory} className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-red-500 transition-colors">Clear All</button>
            </div>
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="rounded-lg bg-[var(--background)] p-3 text-center">
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">Average</p>
                  <p className="text-lg font-black text-[var(--foreground)]">{stats.avgSys}/{stats.avgDia}</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-3 text-center">
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">Highest</p>
                  <p className="text-lg font-black text-red-600">{stats.maxSys}/{stats.maxDia}</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-3 text-center">
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">Lowest</p>
                  <p className="text-lg font-black text-emerald-600">{stats.minSys}/{stats.minDia}</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-3 text-center">
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">Readings</p>
                  <p className="text-lg font-black text-[var(--foreground)]">{stats.count}</p>
                </div>
              </div>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.slice(0, 10).map((h, i) => {
                const cat = classifyBP(h.sys, h.dia, h.guideline || "accaha");
                const prev = history[i + 1];
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--muted)] text-xs w-20">
                        {new Date(h.date).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-[var(--foreground)]">{h.sys}/{h.dia}</span>
                      <TrendIcon current={h.sys} previous={prev?.sys} />
                    </div>
                    <span className={`text-xs font-semibold ${cat.color}`}>{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Blood Pressure Classification</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">ACC/AHA vs ESC/ESH</p>
              <p>The ACC/AHA 2017 guidelines lowered the threshold for hypertension to 130/80 mmHg. The ESC/ESH 2018 guidelines use a graded system and retain 140/90 as Stage 1. Both emphasize lifestyle modifications as first-line intervention.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Why Track Over Time?</p>
              <p>Single readings can vary significantly. Regular monitoring reveals true trends, white-coat hypertension, and masked hypertension. Home readings are often more reliable than office measurements.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
