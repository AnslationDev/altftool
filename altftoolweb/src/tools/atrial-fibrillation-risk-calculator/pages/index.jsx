"use client";

import { useState, useMemo } from "react";
import { HeartPulse, RotateCcw, Info, Copy, Download, CheckCircle2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const AF_RISK_FACTORS = [
  { id: "age6574", label: "Age 65–74", points: 2, description: "Age between 65 and 74 years" },
  { id: "age75plus", label: "Age ≥ 75", points: 4, description: "Age 75 years or older" },
  { id: "male", label: "Male Sex", points: 1, description: "Male gender" },
  { id: "female", label: "Female Sex", points: -1, description: "Female gender (lower base risk)" },
  { id: "white", label: "White Race", points: 1, description: "White/Caucasian ethnicity" },
  { id: "black", label: "Black Race", points: 1, description: "Black/African American ethnicity" },
  { id: "bmi30plus", label: "BMI ≥ 30 kg/m²", points: 1, description: "Obese or overweight" },
  { id: "height", label: "Height (Tallest Quartile)", points: 1, description: "Height above 75th percentile for sex" },
  { id: "hypertension", label: "Hypertension", points: 1, description: "Systolic BP ≥ 140 or on antihypertensive therapy" },
  { id: "dm", label: "Diabetes Mellitus", points: 1, description: "Fasting glucose ≥ 126 or on treatment" },
  { id: "chf", label: "Heart Failure", points: 1, description: "History of congestive heart failure" },
  { id: "lvh", label: "LVH on ECG", points: 1, description: "Left ventricular hypertrophy on electrocardiogram" },
  { id: "vascular", label: "Vascular Disease", points: 1, description: "Prior MI, PAD, or aortic plaque" },
  { id: "smoking", label: "Current Smoking", points: 1, description: "Active tobacco use" },
];

// Age, sex, and race are mutually-exclusive demographic categories in this
// model (a patient has exactly one of each), unlike the eight stackable
// clinical factors below them. Grouping them here lets `toggle` enforce that
// exclusivity so the score's true achievable ceiling (14) is also the one
// the UI can actually produce.
const EXCLUSIVE_GROUPS = [
  ["age6574", "age75plus"],
  ["male", "female"],
  ["white", "black"],
];

const RISK_CATEGORIES = [
  { min: 0, max: 2, label: "Low Risk", annualRate: "< 1%", color: "text-[var(--success-text)]", bg: "bg-[var(--success-soft)]", border: "border-[var(--success)]/30", description: "Low probability of developing AF within 5 years. Routine monitoring and cardiovascular risk factor management recommended." },
  { min: 3, max: 4, label: "Moderate Risk", annualRate: "1–3%", color: "text-[var(--warning-text)]", bg: "bg-[var(--warning-soft)]", border: "border-[var(--warning)]/30", description: "Moderate risk for AF development. Aggressive management of modifiable risk factors (BP, weight, diabetes) is advised." },
  { min: 5, max: 7, label: "High Risk", annualRate: "3–5%", color: "text-[var(--danger-text)]", bg: "bg-[var(--danger)]/10", border: "border-[var(--danger)]/25", description: "High risk for developing AF. Consider regular ECG monitoring, Holter screening, and lifestyle interventions. Discuss with cardiologist." },
  { min: 8, max: 14, label: "Very High Risk", annualRate: "> 5%", color: "text-[var(--danger-text)]", bg: "bg-[var(--danger-soft)]", border: "border-[var(--danger)]/45", description: "Very high risk. Aggressive screening and management required. Extended rhythm monitoring may be warranted. Specialist evaluation recommended." },
];

const MODIFIABLE_FACTORS = [
  { id: "bp_control", label: "Blood Pressure Control", description: "Target < 130/80 mmHg" },
  { id: "weight_loss", label: "Weight Management", description: "BMI target 18.5–24.9" },
  { id: "exercise", label: "Regular Exercise", description: "150+ min/week moderate activity" },
  { id: "alcohol", label: "Alcohol Limitation", description: "≤ 1 drink/day or abstain" },
  { id: "smoking_cessation", label: "Smoking Cessation", description: "Complete tobacco cessation" },
  { id: "sleep_apnea", label: "Sleep Apnea Treatment", description: "CPAP if diagnosed" },
];

function getRiskCategory(score) {
  for (const cat of RISK_CATEGORIES) {
    if (score >= cat.min && score <= cat.max) return cat;
  }
  return RISK_CATEGORIES[RISK_CATEGORIES.length - 1];
}

function ScoreGauge({ value, max = 14, category }) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = (clamped / max) * 100;
  const angle = 180 - (pct / 100) * 180;

  const colorMap = {
    "Low Risk": "#10B981",
    "Moderate Risk": "#F59E0B",
    "High Risk": "#F97316",
    "Very High Risk": "#EF4444",
  };
  const needleColor = colorMap[category.label] || "#10B981";

  return (
    <div className="relative w-64 h-36 mx-auto flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="afGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#afGaugeGrad)" strokeWidth="14" strokeLinecap="round" />
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
        <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "9px", fontWeight: "800" }}>risk points</text>
      </svg>
    </div>
  );
}

function CheckboxItem({ factor, checked, onChange }) {
  const isNegative = factor.points < 0;
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
          <span className="text-sm font-semibold text-[var(--foreground)]">{factor.label}</span>
          <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${isNegative ? "bg-[var(--info-soft)] text-[var(--info-text)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
            {factor.points > 0 ? `+${factor.points}` : factor.points}
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] mt-0.5">{factor.description}</p>
      </div>
    </label>
  );
}

export default function ToolHome() {
  const [selected, setSelected] = useState({});
  const [modifiable, setModifiable] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        const group = EXCLUSIVE_GROUPS.find((members) => members.includes(id));
        if (group) group.forEach((memberId) => { if (memberId !== id) next[memberId] = false; });
      }
      return next;
    });
  const toggleMod = (id) => setModifiable((prev) => ({ ...prev, [id]: !prev[id] }));

  const score = useMemo(() => {
    let total = 0;
    AF_RISK_FACTORS.forEach((f) => {
      if (selected[f.id]) total += f.points;
    });
    return Math.max(0, total);
  }, [selected]);

  const calculate = () => {
    const category = getRiskCategory(score);
    const activeFactors = AF_RISK_FACTORS.filter((f) => selected[f.id]);
    const activeModifiable = MODIFIABLE_FACTORS.filter((f) => modifiable[f.id]);

    setResult({
      score,
      category,
      activeFactors,
      activeModifiable,
      date: new Date().toLocaleString(),
    });
  };

  const reset = () => {
    setSelected({});
    setModifiable({});
    setResult(null);
  };

  const buildReportText = () => {
    if (!result) return "";
    return `
ATRIAL FIBRILLATION RISK ASSESSMENT REPORT
Generated: ${result.date}
---------------------------------
RISK SCORE:
- AF Risk Score: ${result.score}/14
- Risk Category: ${result.category.label}
- Estimated Annual AF Incidence: ${result.category.annualRate}

RISK FACTORS PRESENT:
${result.activeFactors.map((f) => `- ${f.label} (${f.points > 0 ? "+" : ""}${f.points})`).join("\n") || "- None"}

MODIFIABLE RISK FACTORS IDENTIFIED:
${result.activeModifiable.map((f) => `- ${f.label}: ${f.description}`).join("\n") || "- None identified for active management"}

INTERPRETATION:
${result.category.description}

SCREENING RECOMMENDATIONS:
- Consider periodic ECG screening
- Consider extended rhythm monitoring (Holter, loop recorder)
- Address all modifiable cardiovascular risk factors
- Discuss results with healthcare provider

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
    link.download = `AF_Risk_Report_${result.score}.txt`;
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
            Atrial fibrillation screening
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Atrial Fibrillation Risk Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Assess your risk of developing atrial fibrillation using validated clinical risk factors. Identify modifiable risk factors for prevention.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Clinical Risk Factors</h2>

            <div className="space-y-2">
              {AF_RISK_FACTORS.map((f) => (
                <CheckboxItem key={f.id} factor={f} checked={!!selected[f.id]} onChange={() => toggle(f.id)} />
              ))}
            </div>

            {/* Modifiable Factors */}
            <div className="pt-3 border-t border-[var(--border)]">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Modifiable Risk Factors (Prevention)</p>
              <p className="text-xs text-[var(--muted)] mb-3">Select factors you want to actively manage for prevention</p>
              <div className="space-y-2">
                {MODIFIABLE_FACTORS.map((f) => (
                  <label key={f.id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${modifiable[f.id] ? "border-[var(--success)]/60 bg-[var(--success-soft)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--success)]/40"}`}>
                    <input
                      type="checkbox"
                      checked={!!modifiable[f.id]}
                      onChange={() => toggleMod(f.id)}
                      className="mt-0.5 h-4 w-4 rounded accent-[var(--success)]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{f.label}</span>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{f.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 sticky bottom-0 bg-[var(--card)] pt-3 pb-1">
              <button
                onClick={calculate}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 active:scale-[0.98]"
              >
                Assess AF Risk
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">AF Risk Score</p>
                  <ScoreGauge value={result.score} category={result.category} />
                  <p className={`text-2xl font-black mt-2 ${result.category.color}`}>{result.category.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Annual AF Incidence: {result.category.annualRate}</p>
                </div>

                {/* Status */}
                <div className={`rounded-lg border p-4 ${result.category.bg} ${result.category.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.category.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.category.color}`}>Score: {result.score}/14 — {result.category.label}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Active Risk Factors */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Risk Factors Present ({result.activeFactors.length})</p>
                  {result.activeFactors.length > 0 ? (
                    <div className="space-y-2">
                      {result.activeFactors.map((f) => (
                        <div key={f.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                          <span className="font-semibold text-[var(--foreground)]">{f.label}</span>
                          <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${f.points < 0 ? "bg-[var(--info-soft)] text-[var(--info-text)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                            {f.points > 0 ? `+${f.points}` : f.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">No risk factors selected</p>
                  )}
                </div>

                {/* Modifiable Action Plan */}
                {result.activeModifiable.length > 0 && (
                  <div className="rounded-lg bg-[var(--background)] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Prevention Action Plan</p>
                    <div className="space-y-2">
                      {result.activeModifiable.map((f) => (
                        <div key={f.id} className="flex items-start gap-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success-soft)] px-3 py-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[var(--success-text)] mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-[var(--success-text)]">{f.label}</span>
                            <p className="text-xs text-[var(--success-text)] mt-0.5">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screening Recommendations */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Screening Recommendations</p>
                  <ul className="space-y-2">
                    {(result.score >= 5
                      ? [
                          "Consider 12-lead ECG at each clinical visit",
                          "Extended rhythm monitoring (7–30 day Holter) recommended",
                          "Consider implantable loop recorder for high-risk patients",
                          "Aggressive management of all cardiovascular risk factors",
                          "Cardiology consultation recommended",
                        ]
                      : result.score >= 3
                        ? [
                            "Annual ECG screening recommended",
                            "Periodic pulse palpation and rhythm assessment",
                            "Address modifiable risk factors proactively",
                            "Consider Holter monitoring if symptomatic",
                          ]
                        : [
                            "Routine cardiovascular screening",
                            "Maintain healthy lifestyle and risk factor control",
                            "Report palpitations, dizziness, or irregular pulse",
                          ]
                    ).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reference */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Risk Categories</p>
                  <div className="space-y-2">
                    {RISK_CATEGORIES.map((r) => (
                      <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.bg} ${r.border} ${r.label === result.category.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                        <span className={`font-semibold ${r.color}`}>{r.label} ({r.min}–{r.max})</span>
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
                <HeartPulse className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Select risk factors to assess AF risk</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Atrial fibrillation is the most common sustained cardiac arrhythmia.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Atrial Fibrillation Risk</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">What is AF?</p>
              <p>Atrial fibrillation is an irregular, often rapid heart rhythm originating in the atria. It affects 2–4% of adults and is the leading cause of ischemic stroke. AF can be asymptomatic and is often detected incidentally.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Prevention Matters</p>
              <p>Up to 60% of AF cases are attributable to modifiable risk factors: hypertension, obesity, diabetes, smoking, and alcohol. Aggressive management of these factors significantly reduces AF incidence and associated stroke risk.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
