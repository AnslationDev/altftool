"use client";

import { useState } from "react";
import { Droplet, RotateCcw, Info, Copy, Download, CheckCircle2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const LDL_CATEGORIES = [
  { max: 99, label: "Optimal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Ideal LDL cholesterol level. Lower is better for cardiovascular health." },
  { max: 129, label: "Near Optimal", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", description: "Acceptable but approaching borderline. Maintain healthy lifestyle." },
  { max: 159, label: "Borderline High", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Lifestyle modifications recommended. Consider dietary changes and exercise." },
  { max: 189, label: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Elevated LDL. Medication may be needed along with lifestyle changes." },
  { max: Infinity, label: "Very High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Significantly elevated. Statin therapy strongly recommended." },
];

const HDL_CATEGORIES = [
  { max: 39, label: "Low (High Risk)", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Low HDL increases cardiovascular risk. Major risk factor for heart disease." },
  { max: 59, label: "Borderline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Not cardioprotective. Lifestyle changes can raise HDL." },
  { max: Infinity, label: "Optimal (Protective)", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "High HDL is cardioprotective. ≥ 60 mg/dL removes one risk factor." },
];

const TRIGLYCERIDE_CATEGORIES = [
  { max: 149, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Healthy triglyceride level." },
  { max: 199, label: "Borderline High", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Borderline elevated. Reduce sugar and refined carbohydrate intake." },
  { max: 499, label: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Elevated. Increases cardiovascular and pancreatitis risk." },
  { max: Infinity, label: "Very High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Severely elevated. High pancreatitis risk. Requires aggressive treatment." },
];

const TC_CATEGORIES = [
  { max: 199, label: "Desirable", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Desirable total cholesterol level." },
  { max: 239, label: "Borderline High", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Borderline elevated. Monitor and modify diet." },
  { max: Infinity, label: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Elevated total cholesterol. Increased cardiovascular risk." },
];

function classifyLdl(val) { for (const c of LDL_CATEGORIES) if (val <= c.max) return c; return LDL_CATEGORIES[LDL_CATEGORIES.length - 1]; }
function classifyHdl(val) { for (const c of HDL_CATEGORIES) if (val <= c.max) return c; return HDL_CATEGORIES[HDL_CATEGORIES.length - 1]; }
function classifyTg(val) { for (const c of TRIGLYCERIDE_CATEGORIES) if (val <= c.max) return c; return TRIGLYCERIDE_CATEGORIES[TRIGLYCERIDE_CATEGORIES.length - 1]; }
function classifyTc(val) { for (const c of TC_CATEGORIES) if (val <= c.max) return c; return TC_CATEGORIES[TC_CATEGORIES.length - 1]; }

function getNonHdl(tc, hdl) { return tc - hdl; }
function getNonHdlCategory(nh) {
  if (nh < 100) return { label: "Optimal", color: "text-emerald-600" };
  if (nh < 130) return { label: "Near Optimal", color: "text-teal-600" };
  if (nh < 160) return { label: "Borderline High", color: "text-amber-600" };
  if (nh < 190) return { label: "High", color: "text-orange-600" };
  return { label: "Very High", color: "text-red-600" };
}

function getLipidRiskScore(tc, hdl, ldl, tg) {
  let score = 0;
  if (tc > 240) score += 2; else if (tc > 200) score += 1;
  if (hdl < 40) score += 2; else if (hdl < 50) score += 1;
  if (ldl > 190) score += 3; else if (ldl > 160) score += 2; else if (ldl > 130) score += 1;
  if (tg > 500) score += 3; else if (tg > 200) score += 2; else if (tg > 150) score += 1;
  const ratio = hdl > 0 ? ldl / hdl : 99;
  if (ratio > 5) score += 2; else if (ratio > 4) score += 1;
  return Math.min(score, 10);
}

function getOverallRisk(score) {
  if (score <= 2) return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Lipid profile is generally favorable. Maintain healthy lifestyle." };
  if (score <= 4) return { label: "Moderate Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Some lipid abnormalities detected. Lifestyle modifications recommended." };
  if (score <= 6) return { label: "High Risk", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Multiple lipid abnormalities. Consider pharmacotherapy alongside lifestyle changes." };
  return { label: "Very High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "Severe dyslipidemia. Aggressive treatment with statins and lifestyle modification required." };
}

function RatioGauge({ value, max = 8, label, good, bad }) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = (clamped / max) * 100;
  const angle = (pct / 100) * 180 - 90;
  const needleColor = clamped <= 4 ? "#10B981" : clamped <= 5 ? "#F59E0B" : "#EF4444";

  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">{label}</p>
      <div className="relative w-48 h-28 mx-auto flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id={`ratioGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={`url(#ratioGrad-${label})`} strokeWidth="14" strokeLinecap="round" />
          <line x1="100" y1="100" x2={100 + 45 * Math.cos(angle * Math.PI / 180)} y2={100 - 45 * Math.sin(angle * Math.PI / 180)} stroke={needleColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={needleColor} />
          <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "20px", fontWeight: "900" }}>{value.toFixed(1)}</text>
          <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "8px", fontWeight: "800" }}>{good} → {bad}</text>
        </svg>
      </div>
    </div>
  );
}

function LipidBar({ label, value, max, color, unit = "mg/dL" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--foreground)]">{label}</span>
        <span className="text-[var(--muted)]">{value} {unit}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]/40">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [tc, setTc] = useState("");
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [tg, setTg] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const calculate = () => {
    const tcVal = parseFloat(tc);
    const ldlVal = parseFloat(ldl);
    const hdlVal = parseFloat(hdl);
    const tgVal = parseFloat(tg);
    if ([tcVal, ldlVal, hdlVal, tgVal].some(isNaN) || [tcVal, ldlVal, hdlVal, tgVal].some((v) => v < 0)) return;
    if (hdlVal > tcVal) {
      // HDL is one component of total cholesterol, so it can never exceed TC —
      // otherwise getNonHdl (TC − HDL) goes negative and gets silently
      // mislabeled as "Optimal".
      setResult(null);
      setError("HDL cholesterol can't be higher than total cholesterol — please recheck these two values.");
      return;
    }
    setError("");

    const tcCat = classifyTc(tcVal);
    const ldlCat = classifyLdl(ldlVal);
    const hdlCat = classifyHdl(hdlVal);
    const tgCat = classifyTg(tgVal);

    const tcHdlRatio = hdlVal > 0 ? (tcVal / hdlVal) : 0;
    const ldlHdlRatio = hdlVal > 0 ? (ldlVal / hdlVal) : 0;
    const nonHdl = getNonHdl(tcVal, hdlVal);
    const nonHdlCat = getNonHdlCategory(nonHdl);
    const riskScore = getLipidRiskScore(tcVal, hdlVal, ldlVal, tgVal);
    const overallRisk = getOverallRisk(riskScore);

    setResult({
      tc: tcVal, ldl: ldlVal, hdl: hdlVal, tg: tgVal,
      tcCat, ldlCat, hdlCat, tgCat,
      tcHdlRatio: tcHdlRatio.toFixed(1),
      ldlHdlRatio: ldlHdlRatio.toFixed(1),
      nonHdl, nonHdlCat,
      riskScore, overallRisk,
      date: new Date().toLocaleString(),
    });
  };

  const reset = () => { setTc(""); setLdl(""); setHdl(""); setTg(""); setResult(null); setError(""); };

  const buildReportText = () => {
    if (!result) return "";
    return `
LIPID PANEL RISK ASSESSMENT REPORT
Generated: ${result.date}
---------------------------------
MEASUREMENTS:
- Total Cholesterol: ${result.tc} mg/dL (${result.tcCat.label})
- LDL Cholesterol: ${result.ldl} mg/dL (${result.ldlCat.label})
- HDL Cholesterol: ${result.hdl} mg/dL (${result.hdlCat.label})
- Triglycerides: ${result.tg} mg/dL (${result.tgCat.label})

DERIVED VALUES:
- TC/HDL Ratio: ${result.tcHdlRatio} (Desirable: < 5.0)
- LDL/HDL Ratio: ${result.ldlHdlRatio} (Desirable: < 3.0)
- Non-HDL Cholesterol: ${result.nonHdl} mg/dL (${result.nonHdlCat.label})

RISK ASSESSMENT:
- Lipid Risk Score: ${result.riskScore}/10
- Overall Status: ${result.overallRisk.label}
- ${result.overallRisk.description}

LDL CLASSIFICATION (NCEP ATP III):
- Optimal: < 100 mg/dL
- Near Optimal: 100–129 mg/dL
- Borderline High: 130–159 mg/dL
- High: 160–189 mg/dL
- Very High: ≥ 190 mg/dL

---------------------------------
This calculator is for educational and informational purposes only.
Clinical decisions should always be made by qualified healthcare professionals.
    `.trim();
  };

  const copyReport = async () => {
    const success = await safeCopyText(buildReportText());
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Lipid_Report_${result.tc}TC.txt`;
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
            <Droplet className="h-4 w-4" />
            Lipid panel analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Lipid Risk Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Analyze your complete lipid panel — LDL, HDL, triglycerides, total cholesterol — with ratios, NCEP ATP III classification, and cardiovascular risk scoring.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Lipid Panel (mg/dL)</h2>
            <label className="block">
              <span className="text-sm font-semibold">Total Cholesterol</span>
              <input type="number" min="50" max="500" value={tc} onChange={(e) => setTc(e.target.value)} placeholder="200" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
              <span className="text-xs text-[var(--muted)]">Desirable: &lt; 200 mg/dL</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">LDL Cholesterol (Bad)</span>
              <input type="number" min="20" max="400" value={ldl} onChange={(e) => setLdl(e.target.value)} placeholder="100" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
              <span className="text-xs text-[var(--muted)]">Optimal: &lt; 100 mg/dL</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">HDL Cholesterol (Good)</span>
              <input type="number" min="10" max="150" value={hdl} onChange={(e) => setHdl(e.target.value)} placeholder="60" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
              <span className="text-xs text-[var(--muted)]">Desirable: ≥ 60 mg/dL (protective)</span>
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Triglycerides</span>
              <input type="number" min="20" max="2000" value={tg} onChange={(e) => setTg(e.target.value)} placeholder="150" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
              <span className="text-xs text-[var(--muted)]">Normal: &lt; 150 mg/dL</span>
            </label>

            {error && (
              <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={calculate} disabled={!tc || !ldl || !hdl || !tg} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Analyze Lipids</button>
              <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--muted)] active:scale-[0.98]"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>

          {/* Result Card */}
          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Overall Status */}
                <div className={`rounded-lg border p-4 ${result.overallRisk.bg} ${result.overallRisk.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.overallRisk.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.overallRisk.color}`}>Overall Lipid Risk: {result.overallRisk.label} ({result.riskScore}/10)</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.overallRisk.description}</p>
                    </div>
                  </div>
                </div>

                {/* Lipid Bars */}
                <div className="rounded-lg bg-[var(--background)] p-4 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Lipid Panel Breakdown</p>
                  <LipidBar label="Total Cholesterol" value={result.tc} max={300} color="bg-amber-500" />
                  <LipidBar label="LDL" value={result.ldl} max={250} color="bg-red-500" />
                  <LipidBar label="HDL" value={result.hdl} max={100} color="bg-emerald-500" />
                  <LipidBar label="Triglycerides" value={result.tg} max={600} color="bg-orange-500" />
                  <LipidBar label="Non-HDL" value={result.nonHdl} max={250} color="bg-rose-500" />
                </div>

                {/* Ratios */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Lipid Ratios</p>
                  <div className="grid grid-cols-2 gap-4">
                    <RatioGauge value={parseFloat(result.tcHdlRatio)} max={8} label="TC / HDL" good="Low Risk" bad="High Risk" />
                    <RatioGauge value={parseFloat(result.ldlHdlRatio)} max={6} label="LDL / HDL" good="Low Risk" bad="High Risk" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-[var(--border)] p-3 text-center">
                      <span className="text-xs text-[var(--muted)]">Non-HDL</span>
                      <p className="font-bold text-[var(--foreground)]">{result.nonHdl} mg/dL</p>
                      <span className={`text-xs font-semibold ${result.nonHdlCat.color}`}>{result.nonHdlCat.label}</span>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] p-3 text-center">
                      <span className="text-xs text-[var(--muted)]">TC/HDL Ratio</span>
                      <p className="font-bold text-[var(--foreground)]">{result.tcHdlRatio}</p>
                      <span className={`text-xs font-semibold ${parseFloat(result.tcHdlRatio) <= 5 ? "text-emerald-600" : "text-red-600"}`}>{parseFloat(result.tcHdlRatio) <= 5 ? "Desirable" : "High Risk"}</span>
                    </div>
                  </div>
                </div>

                {/* Individual Classifications */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">NCEP ATP III Classifications</p>
                  <div className="space-y-2">
                    {[
                      { label: "Total Cholesterol", value: result.tc, cat: result.tcCat, ranges: TC_CATEGORIES },
                      { label: "LDL Cholesterol", value: result.ldl, cat: result.ldlCat, ranges: LDL_CATEGORIES },
                      { label: "HDL Cholesterol", value: result.hdl, cat: result.hdlCat, ranges: HDL_CATEGORIES },
                      { label: "Triglycerides", value: result.tg, cat: result.tgCat, ranges: TRIGLYCERIDE_CATEGORIES },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-lg border px-3 py-2.5 text-sm ${item.cat.bg} ${item.cat.border}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[var(--foreground)]">{item.label}</span>
                            <span className="ml-2 text-[var(--muted)]">{item.value} mg/dL</span>
                          </div>
                          <span className={`font-bold ${item.cat.color}`}>{item.cat.label}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{item.cat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">LDL Reference (mg/dL)</p>
                  <div className="space-y-1.5">
                    {LDL_CATEGORIES.map((r) => (
                      <div key={r.label} className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs ${r.bg} ${r.border} ${r.label === result.ldlCat.label ? "ring-2 ring-offset-1" : "opacity-70"}`}>
                        <span className={`font-semibold ${r.color}`}>{r.label}</span>
                        <span className="text-[var(--muted-foreground)]">{r.max === Infinity ? "≥ 190" : `< ${r.max + 1}`}</span>
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
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Droplet className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Enter all four lipid values to analyze</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">A complete lipid panel gives the most accurate cardiovascular risk picture.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Lipid Assessment</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Understanding Your Lipid Panel</p>
              <p>Total cholesterol is the sum of LDL, HDL, and VLDL. LDL (&ldquo;bad&rdquo;) deposits cholesterol in arteries. HDL (&ldquo;good&rdquo;) removes cholesterol. Triglycerides are fats linked to diet and metabolic risk. Non-HDL cholesterol (TC − HDL) captures all atherogenic lipoproteins.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Ratio Importance</p>
              <p>The TC/HDL ratio is a powerful predictor of heart disease. A ratio below 5.0 is desirable; above 5.0 increases risk significantly. LDL/HDL ratio below 3.0 is optimal. These ratios capture the balance between atherogenic and protective lipoproteins.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
