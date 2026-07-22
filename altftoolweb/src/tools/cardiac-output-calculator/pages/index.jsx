"use client";

import { useState, useMemo } from "react";
import { Heart, RotateCcw, Info, Copy, Download, CheckCircle2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CO_RANGES = [
  { label: "Low", range: "< 4.0", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", description: "Reduced cardiac output — may indicate heart failure, shock, or severe valvular disease." },
  { label: "Normal", range: "4.0 – 8.0", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Healthy cardiac output — adequate perfusion for normal organ function." },
  { label: "High", range: "> 8.0", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Elevated — may occur with exercise, fever, anemia, hyperthyroidism, or sepsis." },
];

const CI_RANGES = [
  { label: "Low", range: "< 2.2", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", description: "Cardiogenic shock or severe heart failure. Urgent intervention may be required." },
  { label: "Normal", range: "2.5 – 4.0", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Normal cardiac index — adequate for body size." },
  { label: "High", range: "> 4.0", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Elevated cardiac index — may indicate high-output states." },
];

function calculateBSA(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

function getCoCategory(co) {
  if (co < 4.0) return CO_RANGES[0];
  if (co <= 8.0) return CO_RANGES[1];
  return CO_RANGES[2];
}

function getCiCategory(ci) {
  if (ci < 2.2) return CI_RANGES[0];
  if (ci <= 4.0) return CI_RANGES[1];
  return CI_RANGES[2];
}

function CoGauge({ value, category, max = 12 }) {
  const min = 0;
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped / max) * 100;
  const angle = (pct / 100) * 180 - 90;

  const colorMap = {
    Low: "#3B82F6",
    Normal: "#10B981",
    High: "#F97316",
  };
  const needleColor = colorMap[category.label] || "#10B981";

  return (
    <div className="relative w-64 h-36 mx-auto flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="coGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="35%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#coGaugeGrad)" strokeWidth="14" strokeLinecap="round" />
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
        <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "22px", fontWeight: "900" }}>{value.toFixed(1)}</text>
        <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "9px", fontWeight: "800" }}>L/min</text>
      </svg>
    </div>
  );
}

export default function ToolHome() {
  const [heartRate, setHeartRate] = useState("");
  const [strokeVolume, setStrokeVolume] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [method, setMethod] = useState("co");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const hr = parseFloat(heartRate);
    const sv = parseFloat(strokeVolume);
    if (isNaN(hr) || isNaN(sv) || hr <= 0 || hr > 300 || sv <= 0 || sv > 500) return;

    const co = (hr * sv) / 1000;
    const coCategory = getCoCategory(co);

    let bsa = null;
    let ci = null;
    let ciCategory = null;

    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
      bsa = calculateBSA(h, w);
      ci = co / bsa;
      ciCategory = getCiCategory(ci);
    }

    setResult({
      hr,
      sv,
      co: co.toFixed(2),
      coCategory,
      bsa: bsa ? bsa.toFixed(2) : null,
      ci: ci ? ci.toFixed(2) : null,
      ciCategory,
      minuteVolume: (co * 1000).toFixed(0),
      method,
      date: new Date().toLocaleString(),
    });
  };

  const reset = () => {
    setHeartRate("");
    setStrokeVolume("");
    setHeight("");
    setWeight("");
    setResult(null);
  };

  const buildReportText = () => {
    if (!result) return "";
    return `
CARDIAC OUTPUT CALCULATOR REPORT
Generated: ${result.date}
---------------------------------
INPUTS:
- Heart Rate: ${result.hr} bpm
- Stroke Volume: ${result.sv} mL
${result.bsa ? `- BSA: ${result.bsa} m²` : ""}

RESULTS:
- Cardiac Output (CO): ${result.co} L/min
- Minute Blood Volume: ${result.minuteVolume} mL/min
${result.ci ? `- Cardiac Index (CI): ${result.ci} L/min/m²` : ""}

INTERPRETATION:
- CO Status: ${result.coCategory.label} (${result.coCategory.range} L/min)
- ${result.coCategory.description}
${result.ciCategory ? `\n- CI Status: ${result.ciCategory.label} (${result.ciCategory.range} L/min/m²)\n- ${result.ciCategory.description}` : ""}

FORMULA:
CO = HR × SV / 1000
${result.ci ? `CI = CO / BSA` : ""}

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
    link.download = `CO_Report_${result.co}Lmin.txt`;
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
            <Heart className="h-4 w-4" />
            Hemodynamic analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Cardiac Output Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Calculate cardiac output and cardiac index from heart rate and stroke volume. Includes clinical reference ranges and educational context.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Cardiac Measurements</h2>

            {/* Method Toggle */}
            <div className="mb-4">
              <span className="text-sm font-semibold">Calculation Method</span>
              <div className="mt-2 flex gap-2">
                {[
                  { id: "co", label: "CO (HR × SV)" },
                  { id: "ci", label: "CO + CI (with BSA)" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      method === m.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold">Heart Rate (bpm)</span>
              <input
                type="number"
                min="20"
                max="300"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Resting heart rate</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Stroke Volume (mL)</span>
              <input
                type="number"
                min="10"
                max="500"
                value={strokeVolume}
                onChange={(e) => setStrokeVolume(e.target.value)}
                placeholder="70"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
              <span className="text-xs text-[var(--muted)]">Volume pumped per beat (typically 60–100 mL)</span>
            </label>

            {method === "ci" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Height (cm)</span>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Weight (kg)</span>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  />
                </label>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={calculate}
                disabled={!heartRate || !strokeVolume}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Calculate CO
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Cardiac Output</p>
                  <CoGauge value={parseFloat(result.co)} category={result.coCategory} />
                  <p className={`text-2xl font-black mt-2 ${result.coCategory.color}`}>{result.coCategory.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">CO = {result.hr} × {result.sv} / 1000 = {result.co} L/min</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-[var(--background)] p-4 text-center">
                    <p className="text-xs font-bold uppercase text-[var(--muted)]">Cardiac Output</p>
                    <p className="text-xl font-black text-[var(--foreground)] mt-1">{result.co}</p>
                    <p className="text-xs text-[var(--muted)]">L/min</p>
                  </div>
                  <div className="rounded-lg bg-[var(--background)] p-4 text-center">
                    <p className="text-xs font-bold uppercase text-[var(--muted)]">Minute Volume</p>
                    <p className="text-xl font-black text-[var(--foreground)] mt-1">{result.minuteVolume}</p>
                    <p className="text-xs text-[var(--muted)]">mL/min</p>
                  </div>
                  {result.ci && (
                    <div className="rounded-lg bg-[var(--background)] p-4 text-center">
                      <p className="text-xs font-bold uppercase text-[var(--muted)]">Cardiac Index</p>
                      <p className="text-xl font-black text-[var(--foreground)] mt-1">{result.ci}</p>
                      <p className="text-xs text-[var(--muted)]">L/min/m²</p>
                    </div>
                  )}
                </div>

                {/* Formula */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Formula</p>
                  <p className="text-sm font-mono text-[var(--foreground)]">CO = HR × SV / 1000</p>
                  <p className="text-sm font-mono text-[var(--muted-foreground)] mt-1">
                    CO = {result.hr} × {result.sv} / 1000 = <span className="font-bold">{result.co} L/min</span>
                  </p>
                  {result.ci && (
                    <p className="text-sm font-mono text-[var(--muted-foreground)] mt-1">
                      CI = {result.co} / {result.bsa} = <span className="font-bold">{result.ci} L/min/m²</span>
                    </p>
                  )}
                </div>

                {/* CO Status */}
                <div className={`rounded-lg border p-4 ${result.coCategory.bg} ${result.coCategory.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.coCategory.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.coCategory.color}`}>CO: {result.coCategory.label} — {result.coCategory.range} L/min</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.coCategory.description}</p>
                    </div>
                  </div>
                </div>

                {/* CI Status */}
                {result.ciCategory && (
                  <div className={`rounded-lg border p-4 ${result.ciCategory.bg} ${result.ciCategory.border}`}>
                    <div className="flex items-start gap-3">
                      <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.ciCategory.color}`} />
                      <div>
                        <p className={`text-sm font-bold ${result.ciCategory.color}`}>CI: {result.ciCategory.label} — {result.ciCategory.range} L/min/m²</p>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.ciCategory.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reference Ranges */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Cardiac Output Ranges</p>
                  <div className="space-y-2">
                    {CO_RANGES.map((r) => (
                      <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.bg} ${r.border} ${r.label === result.coCategory.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                        <span className={`font-semibold ${r.color}`}>{r.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{r.range} L/min</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.ci && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Cardiac Index Ranges</p>
                    <div className="space-y-2">
                      {CI_RANGES.map((r) => (
                        <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.bg} ${r.border} ${r.label === result.ciCategory.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                          <span className={`font-semibold ${r.color}`}>{r.label}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{r.range} L/min/m²</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                <Heart className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Enter heart rate and stroke volume to calculate</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Cardiac output is the volume of blood pumped by the heart per minute.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Cardiac Output</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">What is Cardiac Output?</p>
              <p>Cardiac output (CO) is the volume of blood the heart pumps per minute. It is the product of heart rate (HR) and stroke volume (SV): CO = HR × SV. A typical resting CO is 4–8 L/min for adults.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Why Cardiac Index Matters</p>
              <p>Cardiac Index (CI) normalizes CO to body surface area (BSA), allowing comparison between patients of different sizes. CI of 2.5–4.0 L/min/m² is normal. Values below 2.2 may indicate cardiogenic shock.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
