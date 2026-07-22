"use client";

import { useState, useMemo } from "react";
import { Brain, RotateCcw, Info, Copy, Download, CheckCircle2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CHADS2_COMPONENTS = [
  { id: "chf", label: "Congestive Heart Failure", points: 1, description: "History of CHF or reduced LV ejection fraction" },
  { id: "hypertension", label: "Hypertension", points: 1, description: "Blood pressure > 140/90 mmHg or on antihypertensive therapy" },
  { id: "age75", label: "Age ≥ 75 years", points: 2, description: "Age 75 or older" },
  { id: "diabetes", label: "Diabetes Mellitus", points: 1, description: "On treatment or fasting glucose ≥ 126 mg/dL" },
  { id: "stroke", label: "Prior Stroke / TIA / Thromboembolism", points: 2, description: "Previous ischemic stroke, TIA, or systemic embolism" },
];

const VASc_COMPONENTS = [
  { id: "vascular", label: "Vascular Disease", points: 1, description: "Prior MI, aortic plaque, or peripheral arterial disease" },
  { id: "age6574", label: "Age 65–74 years", points: 1, description: "Age between 65 and 74" },
  { id: "female", label: "Sex Category (Female)", points: 1, description: "Female sex" },
];

const RISK_LEVELS = [
  { min: 0, max: 0, label: "Low", annualRate: "~1.9%", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Low stroke risk. Antiplatelet therapy (aspirin) or no therapy may be considered. No anticoagulation typically recommended." },
  { min: 1, max: 1, label: "Low-Moderate", annualRate: "~2.8%", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", description: "Single risk factor present. Consider anticoagulation or antiplatelet therapy based on bleeding risk and patient preference." },
  { min: 2, max: 2, label: "Moderate", annualRate: "~4.0%", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Moderate stroke risk. Oral anticoagulation recommended. DOACs preferred over warfarin." },
  { min: 3, max: 3, label: "Moderate-High", annualRate: "~5.9%", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Elevated risk. Oral anticoagulation strongly recommended. Assess bleeding risk with HAS-BLED." },
  { min: 4, max: 5, label: "High", annualRate: "~9.2%", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "High stroke risk. Anticoagulation strongly recommended. Consider DOACs. Close monitoring required." },
  { min: 6, max: 9, label: "Very High", annualRate: "~15%+", color: "text-red-700", bg: "bg-red-100", border: "border-red-300", description: "Very high risk. Anticoagulation mandatory. Multiple risk factors. Aggressive management and specialist referral required." },
];

const HAS_BLED_COMPONENTS = [
  { id: "has_hypertension", label: "Uncontrolled Hypertension", points: 1, description: "Systolic > 160 mmHg" },
  { id: "has_renal", label: "Abnormal Renal Function", points: 1, description: "Dialysis, transplant, or creatinine > 2.3 mg/dL" },
  { id: "has_liver", label: "Abnormal Liver Function", points: 1, description: "Cirrhosis or bilirubin > 2× ULN" },
  { id: "has_stroke_hx", label: "Prior Stroke History", points: 1, description: "Previous stroke (counted in CHA₂DS₂-VASc)" },
  { id: "has_bleed", label: "Prior Bleeding / Predisposition", points: 1, description: "Major bleeding or bleeding diathesis" },
  { id: "has_inr", label: "Labile INR (if on warfarin)", points: 1, description: "TTR < 60%" },
  { id: "has_elderly", label: "Age > 65 years", points: 1, description: "Elderly patient" },
  { id: "has_drugs", label: "Antiplatelet / NSAID Use", points: 1, description: "Concomitant antiplatelet or NSAID therapy" },
  { id: "has_alcohol", label: "Excessive Alcohol Intake", points: 1, description: "≥ 8 drinks per week" },
];

function getRiskLevel(score) {
  for (const level of RISK_LEVELS) {
    if (score >= level.min && score <= level.max) return level;
  }
  return RISK_LEVELS[RISK_LEVELS.length - 1];
}

function ScoreGauge({ value, max = 9, category }) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = (clamped / max) * 100;
  const angle = (pct / 100) * 180 - 90;

  const colorMap = {
    Low: "#10B981",
    "Low-Moderate": "#14B8A6",
    Moderate: "#F59E0B",
    "Moderate-High": "#F97316",
    High: "#EF4444",
    "Very High": "#DC2626",
  };
  const needleColor = colorMap[category.label] || "#10B981";

  return (
    <div className="relative w-64 h-36 mx-auto flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="strokeGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="25%" stopColor="#14B8A6" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#F97316" />
            <stop offset="85%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#strokeGaugeGrad)" strokeWidth="14" strokeLinecap="round" />
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
        <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "22px", fontWeight: "900" }}>{value}</text>
        <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "9px", fontWeight: "800" }}>/{max} points</text>
      </svg>
    </div>
  );
}

function CheckboxItem({ component, checked, onChange }) {
  const isDoublePoint = component.points === 2;
  return (
    <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${checked ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded accent-[var(--primary)]"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--foreground)]">{component.label}</span>
          <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${isDoublePoint ? "bg-red-100 text-red-700" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
            +{component.points}
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] mt-0.5">{component.description}</p>
      </div>
    </label>
  );
}

export default function ToolHome() {
  const [selected, setSelected] = useState({});
  const [hasBled, setHasBled] = useState({});
  const [mode, setMode] = useState("chads2vasc");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleBled = (id) => setHasBled((prev) => ({ ...prev, [id]: !prev[id] }));

  const score = useMemo(() => {
    let total = 0;
    CHADS2_COMPONENTS.forEach((c) => {
      if (selected[c.id]) total += c.points;
    });
    if (mode === "chads2vasc") {
      VASc_COMPONENTS.forEach((c) => {
        if (selected[c.id]) total += c.points;
      });
    }
    return total;
  }, [selected, mode]);

  const bledScore = useMemo(() => {
    let total = 0;
    HAS_BLED_COMPONENTS.forEach((c) => {
      if (hasBled[c.id]) total += c.points;
    });
    return total;
  }, [hasBled]);

  const calculate = () => {
    const category = getRiskLevel(score);
    const bledCategory = bledScore >= 3 ? "High Bleeding Risk" : "Low-Moderate Bleeding Risk";
    const activeFactors = [...CHADS2_COMPONENTS, ...(mode === "chads2vasc" ? VASc_COMPONENTS : [])].filter((c) => selected[c.id]);
    const activeBledFactors = HAS_BLED_COMPONENTS.filter((c) => hasBled[c.id]);

    setResult({
      score,
      category,
      mode,
      bledScore,
      bledCategory,
      activeFactors,
      activeBledFactors,
      date: new Date().toLocaleString(),
    });
  };

  const reset = () => {
    setSelected({});
    setHasBled({});
    setResult(null);
  };

  const buildReportText = () => {
    if (!result) return "";
    return `
STROKE RISK ASSESSMENT REPORT
Generated: ${result.date}
Model: ${result.mode === "chads2vasc" ? "CHA₂DS₂-VASc" : "CHADS₂"}
---------------------------------
STROKE RISK SCORE:
- ${result.mode === "chads2vasc" ? "CHA₂DS₂-VASc" : "CHADS₂"} Score: ${result.score}/9
- Risk Category: ${result.category.label}
- Estimated Annual Stroke Rate: ${result.category.annualRate}

RISK FACTORS PRESENT:
${result.activeFactors.map((f) => `- ${f.label} (+${f.points})`).join("\n") || "- None"}

BLEEDING RISK (HAS-BLED):
- Score: ${result.bledScore}/9
- Status: ${result.bledCategory}

INTERPRETATION:
${result.category.description}

RECOMMENDATION:
${result.score >= 2 ? "Oral anticoagulation recommended. DOACs preferred over warfarin." : result.score === 1 ? "Consider anticoagulation based on individual risk-benefit assessment." : "Antiplatelet therapy may be considered. No routine anticoagulation needed."}

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
    link.download = `Stroke_Risk_Report_${result.score}.txt`;
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
            <Brain className="h-4 w-4" />
            Stroke risk assessment
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Stroke Risk Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate stroke risk in atrial fibrillation patients using CHA₂DS₂-VASc scoring with integrated HAS-BLED bleeding risk assessment.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Risk Factors</h2>

            {/* Model Toggle */}
            <div className="flex gap-2">
              {[
                { id: "chads2vasc", label: "CHA₂DS₂-VASc" },
                { id: "chads2", label: "CHADS₂" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                    mode === m.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* CHADS₂ Factors */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">CHADS₂ Components</p>
              {CHADS2_COMPONENTS.map((c) => (
                <CheckboxItem key={c.id} component={c} checked={!!selected[c.id]} onChange={() => toggle(c.id)} />
              ))}
            </div>

            {/* VASc Extra Factors */}
            {mode === "chads2vasc" && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">VASc Additions</p>
                {VASc_COMPONENTS.map((c) => (
                  <CheckboxItem key={c.id} component={c} checked={!!selected[c.id]} onChange={() => toggle(c.id)} />
                ))}
              </div>
            )}

            {/* HAS-BLED Section */}
            <div className="pt-3 border-t border-[var(--border)]">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">HAS-BLED (Bleeding Risk)</p>
              <div className="space-y-2">
                {HAS_BLED_COMPONENTS.map((c) => (
                  <CheckboxItem key={c.id} component={c} checked={!!hasBled[c.id]} onChange={() => toggleBled(c.id)} />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={calculate}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 active:scale-[0.98]"
              >
                Assess Risk
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{result.mode === "chads2vasc" ? "CHA₂DS₂-VASc" : "CHADS₂"} Score</p>
                  <ScoreGauge value={result.score} category={result.category} />
                  <p className={`text-2xl font-black mt-2 ${result.category.color}`}>{result.category.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Annual Stroke Rate: {result.category.annualRate}</p>
                </div>

                {/* Status */}
                <div className={`rounded-lg border p-4 ${result.category.bg} ${result.category.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.category.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.category.color}`}>Score: {result.score}/9 — {result.category.label}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Active Risk Factors */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Active Risk Factors ({result.activeFactors.length})</p>
                  {result.activeFactors.length > 0 ? (
                    <div className="space-y-2">
                      {result.activeFactors.map((f) => (
                        <div key={f.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                          <span className="font-semibold text-[var(--foreground)]">{f.label}</span>
                          <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${f.points === 2 ? "bg-red-100 text-red-700" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                            +{f.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">No risk factors selected</p>
                  )}
                </div>

                {/* HAS-BLED */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">HAS-BLED Bleeding Risk</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[var(--foreground)]">Bleeding Score</span>
                    <span className={`text-lg font-black ${result.bledScore >= 3 ? "text-red-600" : "text-emerald-600"}`}>{result.bledScore}/9</span>
                  </div>
                  <div className={`rounded-lg border p-3 text-sm ${result.bledScore >= 3 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
                    <span className={result.bledScore >= 3 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
                      {result.bledScore >= 3 ? "High Bleeding Risk — Review modifiable risk factors" : "Low-Moderate Bleeding Risk"}
                    </span>
                  </div>
                </div>

                {/* Reference */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Score Interpretation</p>
                  <div className="space-y-2">
                    {RISK_LEVELS.map((r) => (
                      <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.bg} ${r.border} ${r.label === result.category.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                        <span className={`font-semibold ${r.color}`}>{r.label} ({r.min}–{r.max === 9 ? "9+" : r.max})</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{r.annualRate}</span>
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
                <Brain className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Select risk factors to calculate stroke risk</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">CHA₂DS₂-VASc is the standard stroke risk model for atrial fibrillation.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Stroke Risk Assessment</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">CHA₂DS₂-VASc Scoring</p>
              <p>This validated scoring system assigns points for clinical risk factors: CHF (+1), Hypertension (+1), Age ≥ 75 (+2), Diabetes (+1), Stroke/TIA (+2), Vascular disease (+1), Age 65–74 (+1), Female sex (+1). Maximum score is 9.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Anticoagulation Guidelines</p>
              <p>Score ≥ 2 (males) or ≥ 3 (females): Oral anticoagulation recommended. Score 1 (male) or 2 (female): Consider anticoagulation. Score 0: Antiplatelet or no therapy. Direct oral anticoagulants (DOACs) are preferred over warfarin in non-valvular AF.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
