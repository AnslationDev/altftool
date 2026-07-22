"use client";

import { useState } from "react";
import { HeartPulse, RotateCcw, Info, Copy, Download, CheckCircle2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const FORMULAS = [
  { id: "bazett", name: "Bazett", suffix: "QT / √RR", description: "Most widely used. Overestimates QTc at high heart rates and underestimates at low rates." },
  { id: "fridericia", name: "Fridericia", suffix: "QT / ∛RR", description: "Better accuracy at extreme heart rates. Preferred by FDA for drug studies." },
  { id: "framingham", name: "Framingham", suffix: "QT + 0.154(1−RR)", description: "Linear correction. More accurate at heart rates 60–100 bpm." },
  { id: "hodges", name: "Hodges", suffix: "QT + 1.75(HR−60)", description: "Linear formula. Useful when RR interval is hard to measure precisely." },
];

const QTc_RANGES = {
  male: [
    { label: "Short QT", range: "< 350", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", description: "May increase risk of atrial and ventricular arrhythmias." },
    { label: "Normal", range: "350–450", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Within normal limits for adult males." },
    { label: "Borderline", range: "451–470", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Borderline prolongation — monitor and repeat ECG." },
    { label: "Prolonged", range: "> 470", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Increased risk of Torsades de Pointes. Seek medical evaluation." },
  ],
  female: [
    { label: "Short QT", range: "< 360", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", description: "May increase risk of atrial and ventricular arrhythmias." },
    { label: "Normal", range: "360–460", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Within normal limits for adult females." },
    { label: "Borderline", range: "461–480", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Borderline prolongation — monitor and repeat ECG." },
    { label: "Prolonged", range: "> 480", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Increased risk of Torsades de Pointes. Seek medical evaluation." },
  ],
  child: [
    { label: "Short QT", range: "< 340", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", description: "May increase risk of arrhythmias in pediatric patients." },
    { label: "Normal", range: "340–440", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Within normal limits for children." },
    { label: "Borderline", range: "441–460", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Borderline — consider clinical context and repeat testing." },
    { label: "Prolonged", range: "> 460", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Significant prolongation in pediatric patients. Evaluate promptly." },
  ],
};

function calculateQTc(qt, rr, formula) {
  switch (formula) {
    case "bazett":
      return qt / Math.sqrt(rr);
    case "fridericia":
      return qt / Math.cbrt(rr);
    case "framingham":
      return qt + 0.154 * (1 - rr);
    case "hodges":
      return qt + 1.75 * ((60 / rr) - 60);
    default:
      return qt / Math.sqrt(rr);
  }
}

function getQTcCategory(qtc, gender) {
  const ranges = QTc_RANGES[gender] || QTc_RANGES.male;
  if (gender === "male") {
    if (qtc < 350) return ranges[0];
    if (qtc <= 450) return ranges[1];
    if (qtc <= 470) return ranges[2];
    return ranges[3];
  }
  if (gender === "female") {
    if (qtc < 360) return ranges[0];
    if (qtc <= 460) return ranges[1];
    if (qtc <= 480) return ranges[2];
    return ranges[3];
  }
  if (qtc < 340) return ranges[0];
  if (qtc <= 440) return ranges[1];
  if (qtc <= 460) return ranges[2];
  return ranges[3];
}

function QtcGauge({ value, category }) {
  const min = 300;
  const max = 550;
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  const angle = (pct / 100) * 180 - 90;

  const colorMap = {
    "Short QT": "#3B82F6",
    Normal: "#10B981",
    Borderline: "#F59E0B",
    Prolonged: "#EF4444",
  };
  const needleColor = colorMap[category.label] || "#10B981";

  return (
    <div className="relative w-64 h-36 mx-auto flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="qtcGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="25%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#qtcGaugeGrad)" strokeWidth="14" strokeLinecap="round" />
        <line
          x1="100"
          y1="100"
          x2={100 + 45 * Math.cos(angle * Math.PI / 180)}
          y2={100 - 45 * Math.sin(angle * Math.PI / 180)}
          stroke={needleColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill={needleColor} />
        <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "22px", fontWeight: "900" }}>{value.toFixed(0)}</text>
        <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "9px", fontWeight: "800" }}>ms</text>
      </svg>
    </div>
  );
}

export default function ToolHome() {
  const [qt, setQt] = useState("");
  const [hr, setHr] = useState("");
  const [gender, setGender] = useState("male");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const qtNum = parseFloat(qt);
    const hrNum = parseFloat(hr);
    if (isNaN(qtNum) || isNaN(hrNum) || qtNum <= 0 || qtNum > 800 || hrNum <= 0 || hrNum > 300) return;

    const rr = 60 / hrNum;
    const comparisons = FORMULAS.map((f) => {
      const qtc = calculateQTc(qtNum, rr, f.id);
      return { ...f, qtc: qtc.toFixed(0) };
    });

    const selectedFormula = "bazett";
    const primaryQtc = calculateQTc(qtNum, rr, selectedFormula);
    const category = getQTcCategory(primaryQtc, gender);

    setResult({
      qt: qtNum,
      hr: hrNum,
      rr: (rr * 1000).toFixed(0),
      rrSec: rr.toFixed(3),
      primaryQtc: primaryQtc.toFixed(0),
      category,
      comparisons,
      gender,
      date: new Date().toLocaleString(),
    });
  };

  const reset = () => {
    setQt("");
    setHr("");
    setGender("male");
    setResult(null);
  };

  const buildReportText = () => {
    if (!result) return "";
    const selected = result.comparisons.find((c) => c.id === "bazett");
    return `
ECG QTC INTERVAL REPORT
Generated: ${result.date}
---------------------------------
INPUTS:
- QT Interval: ${result.qt} ms
- Heart Rate: ${result.hr} bpm
- RR Interval: ${result.rr} ms (${result.rrSec} s)
- Gender: ${result.gender}

PRIMARY RESULT (Bazett):
- QTc: ${result.primaryQtc} ms
- Status: ${result.category.label}

FORMULA COMPARISON:
${result.comparisons.map((c) => `- ${c.name}: ${c.qtc} ms`).join("\n")}

INTERPRETATION:
- ${result.category.label} — ${result.category.description}

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
    link.download = `QTc_Report_${result.primaryQtc}ms.txt`;
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
            ECG Analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">ECG QTc Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Calculate corrected QT interval using multiple clinical formulas. Compare Bazett, Fridericia, Framingham, and Hodges results side by side.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">ECG Measurements</h2>
            <label className="block">
              <span className="text-sm font-semibold">QT Interval (ms)</span>
              <input
                type="number"
                min="100"
                max="800"
                value={qt}
                onChange={(e) => setQt(e.target.value)}
                placeholder="400"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Time from Q wave start to T wave end</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Heart Rate (bpm)</span>
              <input
                type="number"
                min="20"
                max="300"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="72"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Used to derive RR interval (60/HR)</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Gender (Optional)</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="child">Child</option>
              </select>
              <span className="text-xs text-[var(--muted)]">Affects reference range thresholds</span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={calculate}
                disabled={!qt || !hr}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Calculate QTc
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Corrected QT (Bazett)</p>
                  <QtcGauge value={parseFloat(result.primaryQtc)} category={result.category} />
                  <p className={`text-2xl font-black mt-2 ${result.category.color}`}>{result.category.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">QTc = {result.primaryQtc} ms &middot; QT {result.qt} ms &middot; HR {result.hr} bpm</p>
                </div>

                {/* Formula Comparison */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Formula Comparison</p>
                  <div className="space-y-2">
                    {result.comparisons.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                        <div>
                          <span className="font-semibold text-[var(--foreground)]">{c.name}</span>
                          <span className="ml-2 text-xs text-[var(--muted)] font-mono">{c.suffix}</span>
                        </div>
                        <span className="font-bold text-[var(--primary)]">{c.qtc} <span className="text-xs font-normal text-[var(--muted)]">ms</span></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RR Interval */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Derived Values</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--muted)]">RR Interval</span>
                      <p className="font-bold text-[var(--foreground)]">{result.rr} ms <span className="text-xs text-[var(--muted)]">({result.rrSec} s)</span></p>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Formula Used</span>
                      <p className="font-bold text-[var(--foreground)]">Bazett</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className={`rounded-lg border p-4 ${result.category.bg} ${result.category.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.category.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.category.color}`}>{result.category.label} — {result.category.range} ms</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Reference Ranges */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Reference Ranges ({result.gender})</p>
                  <div className="space-y-2">
                    {QTc_RANGES[result.gender]?.map((r) => (
                      <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.bg} ${r.border} ${r.label === result.category.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                        <span className={`font-semibold ${r.color}`}>{r.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{r.range} ms</span>
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
                <p className="text-lg font-semibold text-[var(--muted)]">Enter QT interval and heart rate to calculate QTc</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">QTc prolongation is a major risk factor for ventricular arrhythmias.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About QTc Correction</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Why Correct QT?</p>
              <p>The QT interval naturally shortens as heart rate increases. QTc correction removes the heart-rate dependency so values can be compared across different rates and patients.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">When to Seek Evaluation</p>
              <p>QTc &gt; 500 ms is associated with significantly increased arrhythmia risk. Medications that prolong QT, electrolyte imbalances (low K+, Mg2+), and congenital syndromes should be evaluated.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
