"use client";

import { useState, useMemo } from "react";
import { Droplet, RotateCcw, Info, Copy, Download, CheckCircle2, AlertTriangle, Shield, Activity } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const LDL_CAT = [
  { max: 100, label: "Optimal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Ideal LDL. Lower is better for cardiovascular health." },
  { max: 129, label: "Near Optimal", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", desc: "Acceptable but approaching borderline. Maintain healthy lifestyle." },
  { max: 159, label: "Borderline High", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Lifestyle modifications recommended. Dietary changes and exercise." },
  { max: 189, label: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "Elevated LDL. Medication may be needed alongside lifestyle changes." },
  { max: Infinity, label: "Very High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "Significantly elevated. Statin therapy strongly recommended." },
];

const HDL_CAT = [
  { max: 40, label: "Low (High Risk)", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "Low HDL increases cardiovascular risk. Major risk factor for heart disease." },
  { max: 59, label: "Borderline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Not cardioprotective. Lifestyle changes can raise HDL." },
  { max: Infinity, label: "Optimal (Protective)", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "High HDL is cardioprotective. >= 60 mg/dL removes one risk factor." },
];

const TG_CAT = [
  { max: 150, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Healthy triglyceride level." },
  { max: 199, label: "Borderline High", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Borderline elevated. Reduce sugar and refined carbohydrate intake." },
  { max: 499, label: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "Elevated. Increases cardiovascular and pancreatitis risk." },
  { max: Infinity, label: "Very High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "Severely elevated. High pancreatitis risk. Requires aggressive treatment." },
];

const TC_CAT = [
  { max: 200, label: "Desirable", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Desirable total cholesterol level." },
  { max: 239, label: "Borderline High", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Borderline elevated. Monitor and modify diet." },
  { max: Infinity, label: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "Elevated total cholesterol. Increased cardiovascular risk." },
];

const NONHDL_CAT = [
  { max: 100, label: "Optimal", color: "text-emerald-600" },
  { max: 130, label: "Near Optimal", color: "text-teal-600" },
  { max: 160, label: "Borderline High", color: "text-amber-600" },
  { max: 190, label: "High", color: "text-orange-600" },
  { max: Infinity, label: "Very High", color: "text-red-600" },
];

function classify(cat, val) { for (const c of cat) if (val <= c.max) return c; return cat[cat.length - 1]; }

function getRiskScore(tc, hdl, ldl, tg) {
  let s = 0;
  if (tc > 240) s += 2; else if (tc > 200) s += 1;
  if (hdl < 40) s += 2; else if (hdl < 50) s += 1;
  if (ldl > 190) s += 3; else if (ldl > 160) s += 2; else if (ldl > 130) s += 1;
  if (tg > 500) s += 3; else if (tg > 200) s += 2; else if (tg > 150) s += 1;
  const ratio = hdl > 0 ? ldl / hdl : 99;
  if (ratio > 5) s += 2; else if (ratio > 4) s += 1;
  return Math.min(s, 10);
}

function getOverallRisk(score) {
  if (score <= 2) return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Lipid profile is generally favorable. Maintain healthy lifestyle." };
  if (score <= 4) return { label: "Moderate Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Some lipid abnormalities detected. Lifestyle modifications recommended." };
  if (score <= 6) return { label: "High Risk", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "Multiple lipid abnormalities. Consider pharmacotherapy alongside lifestyle changes." };
  return { label: "Very High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "Severe dyslipidemia. Aggressive treatment with statins and lifestyle modification required." };
}

function getRecommendations(tc, hdl, ldl, tg, risk) {
  const recs = [];
  if (ldl > 160) recs.push({ title: "LDL Reduction Priority", text: "LDL is significantly elevated. Consider statin therapy (atorvastatin 10-80mg or rosuvastatin 5-40mg) based on cardiovascular risk assessment.", icon: AlertTriangle, color: "text-red-600" });
  else if (ldl > 130) recs.push({ title: "LDL Management", text: "LDL is borderline high. Start with therapeutic lifestyle changes (TLC): reduce saturated fat to <7% of calories, increase soluble fiber to 10-25g/day.", icon: Shield, color: "text-amber-600" });
  if (hdl < 40) recs.push({ title: "Low HDL — Increase Protection", text: "HDL is critically low. Increase physical activity (30 min/day), lose weight if overweight, stop smoking, consider niacin or fibrates.", icon: Activity, color: "text-red-600" });
  else if (hdl < 60) recs.push({ title: "Optimize HDL", text: "HDL is suboptimal. Regular aerobic exercise, weight loss, and moderate alcohol (if appropriate) can raise HDL by 5-10%.", icon: Shield, color: "text-amber-600" });
  if (tg > 200) recs.push({ title: "Triglyceride Control", text: "Triglycerides are elevated. Reduce refined carbohydrates, limit alcohol, increase omega-3 fatty acids. Consider fibrates or high-dose EPA if >500.", icon: AlertTriangle, color: tg > 500 ? "text-red-600" : "text-amber-600" });
  if (tc > 240) recs.push({ title: "Total Cholesterol Reduction", text: "Total cholesterol is high. Combined approach: diet modification (Mediterranean or DASH diet), exercise, and consider statin therapy.", icon: AlertTriangle, color: "text-orange-600" });
  if (recs.length === 0) recs.push({ title: "Maintain Current Lifestyle", text: "Your lipid profile is favorable. Continue regular exercise, balanced diet, and routine monitoring every 1-2 years.", icon: Shield, color: "text-emerald-600" });
  return recs;
}

function LipidBar({ label, value, max, color, unit = "mg/dL" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--foreground)]">{label}</span>
        <span className="text-[var(--muted-foreground)]">{value} {unit}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]/40">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RatioGauge({ value, max = 8, label, good, bad }) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = (clamped / max) * 100;
  const angle = (pct / 100) * 180 - 90;
  const needleColor = clamped <= 4 ? "#10B981" : clamped <= 5 ? "#F59E0B" : "#EF4444";
  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">{label}</p>
      <div className="relative w-48 h-28 mx-auto flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id={`rg-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={`url(#rg-${label})`} strokeWidth="14" strokeLinecap="round" />
          <line x1="100" y1="100" x2={100 + 45 * Math.cos(angle * Math.PI / 180)} y2={100 - 45 * Math.sin(angle * Math.PI / 180)} stroke={needleColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={needleColor} />
          <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "20px", fontWeight: "900" }}>{value.toFixed(1)}</text>
          <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "8px", fontWeight: "800" }}>{good} &rarr; {bad}</text>
        </svg>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [tc, setTc] = useState("");
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [tg, setTg] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [smoker, setSmoker] = useState(false);
  const [diabetic, setDiabetic] = useState(false);
  const [hypertensive, setHypertensive] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const tcVal = parseFloat(tc);
    const ldlVal = parseFloat(ldl);
    const hdlVal = parseFloat(hdl);
    const tgVal = parseFloat(tg);
    const ageVal = parseInt(age) || 45;
    if ([tcVal, ldlVal, hdlVal, tgVal].some(isNaN) || [tcVal, ldlVal, hdlVal, tgVal].some((v) => v < 0)) return;

    const tcCat = classify(TC_CAT, tcVal);
    const ldlCat = classify(LDL_CAT, ldlVal);
    const hdlCat = classify(HDL_CAT, hdlVal);
    const tgCat = classify(TG_CAT, tgVal);
    const tcHdlRatio = hdlVal > 0 ? tcVal / hdlVal : 0;
    const ldlHdlRatio = hdlVal > 0 ? ldlVal / hdlVal : 0;
    const nonHdl = tcVal - hdlVal;
    const nonHdlCat = classify(NONHDL_CAT, nonHdl);
    const riskScore = getRiskScore(tcVal, hdlVal, ldlVal, tgVal);
    const overallRisk = getOverallRisk(riskScore);
    const recs = getRecommendations(tcVal, hdlVal, ldlVal, tgVal, overallRisk);

    const riskFactors = [];
    if (ageVal > (gender === "male" ? 45 : 55)) riskFactors.push("Age");
    if (gender === "male") riskFactors.push("Male gender");
    if (smoker) riskFactors.push("Smoking");
    if (diabetic) riskFactors.push("Diabetes");
    if (hypertensive) riskFactors.push("Hypertension");
    if (hdlVal < 40) riskFactors.push("Low HDL");
    if (ldlVal > 160) riskFactors.push("Elevated LDL");
    if (tcVal > 240) riskFactors.push("High TC");

    setResult({
      tc: tcVal, ldl: ldlVal, hdl: hdlVal, tg: tgVal,
      tcCat, ldlCat, hdlCat, tgCat,
      tcHdlRatio: tcHdlRatio.toFixed(1),
      ldlHdlRatio: ldlHdlRatio.toFixed(1),
      nonHdl, nonHdlCat,
      riskScore, overallRisk, recs,
      riskFactors,
      age: ageVal, gender, smoker, diabetic, hypertensive,
      date: new Date().toLocaleString(),
    });
  };

  const reset = () => { setTc(""); setLdl(""); setHdl(""); setTg(""); setAge(""); setGender("male"); setSmoker(false); setDiabetic(false); setHypertensive(false); setResult(null); };

  const buildReportText = () => {
    if (!result) return "";
    return `
LIPID PROFILE ANALYSIS REPORT
Generated: ${result.date}
---------------------------------
PATIENT PROFILE:
- Age: ${result.age} | Gender: ${result.gender}
- Smoker: ${result.smoker ? "Yes" : "No"} | Diabetic: ${result.diabetic ? "Yes" : "No"} | Hypertensive: ${result.hypertensive ? "Yes" : "No"}

MEASUREMENTS (mg/dL):
- Total Cholesterol: ${result.tc} (${result.tcCat.label})
- LDL Cholesterol: ${result.ldl} (${result.ldlCat.label})
- HDL Cholesterol: ${result.hdl} (${result.hdlCat.label})
- Triglycerides: ${result.tg} (${result.tgCat.label})

DERIVED VALUES:
- TC/HDL Ratio: ${result.tcHdlRatio} (Desirable: < 5.0)
- LDL/HDL Ratio: ${result.ldlHdlRatio} (Desirable: < 3.0)
- Non-HDL Cholesterol: ${result.nonHdl} mg/dL (${result.nonHdlCat.label})

RISK ASSESSMENT:
- Lipid Risk Score: ${result.riskScore}/10
- Overall Status: ${result.overallRisk.label}
- Risk Factors: ${result.riskFactors.length > 0 ? result.riskFactors.join(", ") : "None identified"}

RECOMMENDATIONS:
${result.recs.map((r) => `- ${r.title}: ${r.text}`).join("\n")}

NCEP ATP III REFERENCE:
- LDL Optimal: < 100 | Near Optimal: 100-129 | Borderline: 130-159 | High: 160-189 | Very High: >= 190
- HDL Low Risk: < 40 | Borderline: 40-59 | Protective: >= 60
- TC Desirable: < 200 | Borderline: 200-239 | High: >= 240
- TG Normal: < 150 | Borderline: 150-199 | High: 200-499 | Very High: >= 500

---------------------------------
This analysis is for educational and informational purposes only.
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
    link.download = `Lipid_Analysis_${result.tc}TC_${result.date.replace(/[/,: ]/g, "-")}.txt`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This analysis is for educational and informational purposes only. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Droplet className="h-4 w-4" />
            Comprehensive lipid analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Lipid Profile Analyzer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Complete lipid panel analysis with risk stratification, NCEP ATP III classification, cardiovascular risk scoring, and personalized treatment recommendations.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="space-y-5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Lipid Panel (mg/dL)</h2>
              {[
                { label: "Total Cholesterol", val: tc, set: setTc, ph: "200", hint: "Desirable: < 200" },
                { label: "LDL Cholesterol (Bad)", val: ldl, set: setLdl, ph: "100", hint: "Optimal: < 100" },
                { label: "HDL Cholesterol (Good)", val: hdl, set: setHdl, ph: "60", hint: "Protective: >= 60" },
                { label: "Triglycerides", val: tg, set: setTg, ph: "150", hint: "Normal: < 150" },
              ].map((f) => (
                <label key={f.label} className="mt-4 block">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{f.label}</span>
                  <input type="number" min="0" max="500" value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                  <span className="text-xs text-[var(--muted-foreground)]">{f.hint}</span>
                </label>
              ))}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Risk Factors</h2>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Age</span>
                <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="45" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Gender</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Smoker", val: smoker, set: setSmoker },
                  { label: "Diabetic", val: diabetic, set: setDiabetic },
                  { label: "Hypertensive", val: hypertensive, set: setHypertensive },
                ].map((f) => (
                  <label key={f.label} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={f.val} onChange={(e) => f.set(e.target.checked)} className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={calculate} disabled={!tc || !ldl || !hdl || !tg} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Analyze Profile</button>
              <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)] active:scale-[0.98]"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`rounded-lg border p-4 ${result.overallRisk.bg} ${result.overallRisk.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.overallRisk.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.overallRisk.color}`}>Overall Lipid Risk: {result.overallRisk.label} ({result.riskScore}/10)</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.overallRisk.desc}</p>
                    </div>
                  </div>
                </div>

                {result.riskFactors.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Risk Factors Identified ({result.riskFactors.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {result.riskFactors.map((rf) => (
                        <span key={rf} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">{rf}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-[var(--background)] p-4 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Lipid Panel Breakdown</p>
                  <LipidBar label="Total Cholesterol" value={result.tc} max={300} color="bg-amber-500" />
                  <LipidBar label="LDL" value={result.ldl} max={250} color="bg-red-500" />
                  <LipidBar label="HDL" value={result.hdl} max={100} color="bg-emerald-500" />
                  <LipidBar label="Triglycerides" value={result.tg} max={600} color="bg-orange-500" />
                  <LipidBar label="Non-HDL" value={result.nonHdl} max={250} color="bg-rose-500" />
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Lipid Ratios</p>
                  <div className="grid grid-cols-2 gap-4">
                    <RatioGauge value={parseFloat(result.tcHdlRatio)} max={8} label="TC / HDL" good="Low Risk" bad="High Risk" />
                    <RatioGauge value={parseFloat(result.ldlHdlRatio)} max={6} label="LDL / HDL" good="Low Risk" bad="High Risk" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                      <span className="text-xs text-[var(--muted-foreground)]">Non-HDL</span>
                      <p className="font-bold text-[var(--foreground)]">{result.nonHdl} mg/dL</p>
                      <span className={`text-xs font-semibold ${result.nonHdlCat.color}`}>{result.nonHdlCat.label}</span>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                      <span className="text-xs text-[var(--muted-foreground)]">TC/HDL Ratio</span>
                      <p className="font-bold text-[var(--foreground)]">{result.tcHdlRatio}</p>
                      <span className={`text-xs font-semibold ${parseFloat(result.tcHdlRatio) <= 5 ? "text-emerald-600" : "text-red-600"}`}>{parseFloat(result.tcHdlRatio) <= 5 ? "Desirable" : "High Risk"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">NCEP ATP III Classifications</p>
                  <div className="space-y-2">
                    {[
                      { label: "Total Cholesterol", value: result.tc, cat: result.tcCat, ranges: TC_CAT },
                      { label: "LDL Cholesterol", value: result.ldl, cat: result.ldlCat, ranges: LDL_CAT },
                      { label: "HDL Cholesterol", value: result.hdl, cat: result.hdlCat, ranges: HDL_CAT },
                      { label: "Triglycerides", value: result.tg, cat: result.tgCat, ranges: TG_CAT },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-lg border px-3 py-2.5 text-sm ${item.cat.bg} ${item.cat.border}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[var(--foreground)]">{item.label}</span>
                            <span className="ml-2 text-[var(--muted-foreground)]">{item.value} mg/dL</span>
                          </div>
                          <span className={`font-bold ${item.cat.color}`}>{item.cat.label}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{item.cat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Recommendations</p>
                  <div className="space-y-3">
                    {result.recs.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                        <r.icon className={`h-5 w-5 mt-0.5 shrink-0 ${r.color}`} />
                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)]">{r.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={copyReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Report"}
                  </button>
                  <button onClick={downloadReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Droplet className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted-foreground)]">Enter all four lipid values to analyze</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">A complete lipid panel with risk factors gives the most accurate cardiovascular risk assessment.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Understanding Lipid Assessment</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Why Full Profile Matters</p>
              <p>Total cholesterol alone is insufficient. The full profile — LDL, HDL, triglycerides, and derived ratios — provides a complete cardiovascular risk picture. Non-HDL cholesterol captures all atherogenic lipoproteins and is a strong predictor of heart disease.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Risk Factor Integration</p>
              <p>Lipid values alone dont tell the whole story. Age, gender, smoking, diabetes, and hypertension interact with lipid levels to determine overall cardiovascular risk. This is why risk-based treatment thresholds differ between patients with similar lipid values.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
