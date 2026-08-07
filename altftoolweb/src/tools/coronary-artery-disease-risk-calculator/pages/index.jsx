"use client";

import { useState, useMemo } from "react";
import { HeartPulse, RotateCcw, Info, Copy, Download, CheckCircle2, Activity } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function getGenders() { return ["male", "female"]; }
function getRaces() { return ["white", "african-american", "other"]; }
function getSmokingStatuses() { return ["never", "former", "current"]; }
function getDiabetesStatuses() { return ["no", "yes"]; }

function getBpCategories() {
  return [
    { value: "normal", label: "Normal (<120/80)", systolic: 110, diastolic: 70 },
    { value: "elevated", label: "Elevated (120–129/<80)", systolic: 125, diastolic: 75 },
    { value: "stage1", label: "Stage 1 HTN (130–139/80–89)", systolic: 135, diastolic: 85 },
    { value: "stage2", label: "Stage 2 HTN (≥140/≥90)", systolic: 155, diastolic: 95 },
  ];
}

function getHdlCategories() {
  return [
    { value: "high", label: "≥ 60 mg/dL (protective)", hdl: 65 },
    { value: "normal", label: "40–59 mg/dL", hdl: 50 },
    { value: "low", label: "< 40 mg/dL", hdl: 35 },
  ];
}

function getTotalCholCategories() {
  return [
    { value: "desirable", label: "< 200 mg/dL", tc: 180 },
    { value: "borderline", label: "200–239 mg/dL", tc: 220 },
    { value: "high", label: "≥ 240 mg/dL", tc: 260 },
  ];
}

/* Pooled Cohort Equations (simplified) — ASCVD 10-year risk */
function calcAscvd({ age, gender, race, smoker, diabetes, sbp, hdl, tc, bpTreatment }) {
  const a = Math.log(age);
  const lnSbp = Math.log(sbp);
  const lnHdl = Math.log(hdl);
  const lnTc = Math.log(tc);

  let s0 = 0;
  let linPred = 0;

  if (gender === "male") {
    if (race === "african-american") {
      s0 = 0.91188;
      linPred = 18.1885 + 20.1699 * lnSbp + 0.4418 * (sbp > 140 ? lnSbp : 0) + 0.6491 * (smoker === "current" ? 1 : 0) + 0.8098 * (diabetes === "yes" ? 1 : 0) - 11.0715 * lnTc - 0.1898 * (lnTc - 4.0) + 8.7693 * lnHdl - 12.7378 * (lnHdl - 3.5) - 0.1949 * age * (smoker === "current" ? 1 : 0);
    } else {
      s0 = 0.96642;
      linPred = 13.5424 + 12.0846 * lnSbp + (bpTreatment === "yes" ? 1.8352 * lnSbp : 0) + 11.1881 * (smoker === "current" ? 1 : 0) + 7.5901 * (diabetes === "yes" ? 1 : 0) - 3.1986 * lnHdl + 2.2832 * (smoker === "current" ? 1 : 0) * (diabetes === "yes" ? 1 : 0) - 12.6623 * lnTc + 3.0512 * (smoker === "current" ? 1 : 0) * age * 0.0130 - 0.1393 * age;
    }
  } else {
    if (race === "african-american") {
      s0 = 0.94947;
      linPred = 17.1141 + 29.7528 * lnSbp - 6.3759 * (diabetes === "yes" ? 1 : 0) - 14.0382 * lnTc + 0.0331 * (smoker === "current" ? 1 : 0) * age - 0.6644 * (smoker === "current" ? 1 : 0) - 8.9387 * lnHdl;
    } else {
      s0 = 0.96784;
      linPred = 11.4307 + 16.2286 * lnSbp + 0.1177 * (sbp > 140 ? lnSbp : 0) * (diabetes === "yes" ? 1 : 0) + 3.8255 * (smoker === "current" ? 1 : 0) - 10.6727 * lnTc + 2.9872 * (smoker === "current" ? 1 : 0) * lnTc - 3.4393 * lnHdl + 0.6754 * (smoker === "current" ? 1 : 0) * age * 0.0311 - 0.0242 * age;
    }
  }

  const risk = 1 - Math.pow(s0, Math.exp(linPred));
  return Math.max(0, Math.min(risk * 100, 100));
}

/* Framingham Risk Score (simplified 2008) */
function calcFramingham({ age, gender, tc, hdl, sbp, smoker, bpTreatment }) {
  let score = 0;

  if (gender === "male") {
    if (age >= 20 && age <= 34) score += 0;
    else if (age <= 39) score += -9;
    else if (age <= 44) score += -4;
    else if (age <= 49) score += 0;
    else if (age <= 54) score += 5;
    else if (age <= 59) score += 10;
    else if (age <= 64) score += 14;
    else if (age <= 69) score += 17;
    else if (age <= 74) score += 20;
    else score += 23;

    if (tc < 160) score += 0;
    else if (tc < 200) score += 1;
    else if (tc < 240) score += 2;
    else if (tc < 280) score += 3;
    else score += 4;

    if (hdl >= 60) score += -2;
    else if (hdl >= 50) score += -1;
    else if (hdl >= 40) score += 0;
    else score += 2;

    if (smoker === "current") score += 2;
  } else {
    if (age >= 20 && age <= 34) score += 0;
    else if (age <= 39) score += -7;
    else if (age <= 44) score += -3;
    else if (age <= 49) score += 0;
    else if (age <= 54) score += 3;
    else if (age <= 59) score += 6;
    else if (age <= 64) score += 8;
    else if (age <= 69) score += 10;
    else if (age <= 74) score += 12;
    else score += 14;

    if (tc < 160) score += 0;
    else if (tc < 200) score += 1;
    else if (tc < 240) score += 3;
    else if (tc < 280) score += 4;
    else score += 5;

    if (hdl >= 60) score += -3;
    else if (hdl >= 50) score += 0;
    else if (hdl >= 40) score += 1;
    else score += 3;

    if (smoker === "current") score += 3;
  }

  if (sbp < 120) score += 0;
  else if (sbp < 130) score += (bpTreatment === "yes" ? 1 : 0);
  else if (sbp < 140) score += (bpTreatment === "yes" ? 2 : 1);
  else if (sbp < 160) score += (bpTreatment === "yes" ? 2 : 1);
  else if (sbp < 180) score += (bpTreatment === "yes" ? 3 : 2);
  else score += (bpTreatment === "yes" ? 4 : 3);

  const riskTable = gender === "male" ? [
    { max: 1, risk: "<1%" }, { max: 4, risk: "1%" }, { max: 6, risk: "2%" }, { max: 7, risk: "3%" },
    { max: 8, risk: "4%" }, { max: 9, risk: "5%" }, { max: 10, risk: "6%" }, { max: 11, risk: "8%" },
    { max: 12, risk: "10%" }, { max: 13, risk: "12%" }, { max: 14, risk: "16%" }, { max: 15, risk: "20%" },
  ] : [
    { max: 1, risk: "<1%" }, { max: 3, risk: "1%" }, { max: 5, risk: "2%" }, { max: 6, risk: "3%" },
    { max: 7, risk: "4%" }, { max: 8, risk: "5%" }, { max: 9, risk: "6%" }, { max: 10, risk: "8%" },
    { max: 11, risk: "10%" }, { max: 12, risk: "13%" }, { max: 13, risk: "17%" }, { max: 14, risk: "22%" },
  ];

  for (const row of riskTable) {
    if (score <= row.max) return { score, risk: row.risk };
  }
  return { score, risk: ">20%" };
}

function parseRiskPercent(riskStr) {
  return parseFloat(String(riskStr).replace(/[<>%]/g, ""));
}

function getAscvdCategory(risk) {
  if (risk < 5) return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Low 10-year ASCVD risk. Focus on healthy lifestyle maintenance." };
  if (risk < 7.5) return { label: "Borderline Risk", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", description: "Borderline risk. Consider risk-enhancing factors. Discuss with physician." };
  if (risk < 20) return { label: "Intermediate Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Intermediate risk. Moderate-intensity statin therapy may be beneficial." };
  return { label: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "High 10-year ASCVD risk. High-intensity statin therapy recommended. Lifestyle modification critical." };
}

function getChdCategory(riskStr) {
  const risk = parseRiskPercent(riskStr);
  if (risk < 10) return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", description: "Low 10-year CHD risk per Framingham criteria." };
  if (risk < 20) return { label: "Moderate Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", description: "Moderate 10-year CHD risk. Lifestyle modifications and consideration of pharmacotherapy." };
  return { label: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", description: "High 10-year CHD risk. Aggressive treatment with statins recommended." };
}

function RiskGauge({ value, max = 40, label }) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = (clamped / max) * 100;
  const angle = (pct / 100) * 180 - 90;
  const needleColor = value < 5 ? "#10B981" : value < 7.5 ? "#22D3EE" : value < 20 ? "#F59E0B" : "#EF4444";

  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">{label}</p>
      <div className="relative w-48 h-28 mx-auto flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id={`riskGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="30%" stopColor="#22D3EE" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={`url(#riskGrad-${label})`} strokeWidth="14" strokeLinecap="round" />
          <line x1="100" y1="100" x2={100 + 45 * Math.cos(angle * Math.PI / 180)} y2={100 - 45 * Math.sin(angle * Math.PI / 180)} stroke={needleColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={needleColor} />
          <text x="100" y="55" textAnchor="middle" style={{ fill: "var(--foreground)", fontSize: "20px", fontWeight: "900" }}>{typeof value === "number" ? value.toFixed(1) : value}</text>
          <text x="100" y="75" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: "var(--muted)", fontSize: "8px", fontWeight: "800" }}>10-Year Risk</text>
        </svg>
      </div>
    </div>
  );
}

function ResultRow({ icon, label, value, sub, color = "text-[var(--foreground)]" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-sm font-bold ${color}`}>{value}</span>
        {sub && <p className="text-xs text-[var(--muted)]">{sub}</p>}
      </div>
    </div>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export default function ToolHome() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [race, setRace] = useState("white");
  const [smoker, setSmoker] = useState("never");
  const [diabetes, setDiabetes] = useState("no");
  const [tcCat, setTcCat] = useState("desirable");
  const [hdlCat, setHdlCat] = useState("normal");
  const [bpCat, setBpCat] = useState("normal");
  const [bpTreatment, setBpTreatment] = useState("no");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const ageVal = parseInt(age);
    if (isNaN(ageVal) || ageVal < 20 || ageVal > 79) return;

    const bpData = getBpCategories().find((b) => b.value === bpCat);
    const hdlData = getHdlCategories().find((h) => h.value === hdlCat);
    const tcData = getTotalCholCategories().find((t) => t.value === tcCat);

    const ascvdRisk = calcAscvd({
      age: ageVal, gender, race, smoker, diabetes,
      sbp: bpData.systolic, hdl: hdlData.hdl, tc: tcData.tc, bpTreatment,
    });

    const frs = calcFramingham({
      age: ageVal, gender, tc: tcData.tc, hdl: hdlData.hdl,
      sbp: bpData.systolic, smoker, bpTreatment,
    });

    const ascvdCat = getAscvdCategory(ascvdRisk);
    const chdCat = getChdCategory(frs.risk);
    const isHighRisk = ascvdRisk >= 7.5 || diabetes === "yes" || (ageVal >= 65);

    setResult({
      age: ageVal, gender, race, smoker, diabetes,
      tcCat: tcData.tc, hdlCat: hdlData.hdl, sbp: bpData.systolic, bpTreatment,
      ascvdRisk: ascvdRisk.toFixed(1), ascvdRiskNum: ascvdRisk, ascvdCat,
      frsScore: frs.score, frsRisk: frs.risk, chdCat,
      isHighRisk, date: new Date().toLocaleString(),
    });
  };

  const reset = () => {
    setAge(""); setGender("male"); setRace("white"); setSmoker("never");
    setDiabetes("no"); setTcCat("desirable"); setHdlCat("normal");
    setBpCat("normal"); setBpTreatment("no"); setResult(null);
  };

  const buildReportText = () => {
    if (!result) return "";
    return `
CORONARY ARTERY DISEASE RISK ASSESSMENT REPORT
Generated: ${result.date}
---------------------------------
PATIENT PROFILE:
- Age: ${result.age} years
- Gender: ${result.gender === "male" ? "Male" : "Female"}
- Race: ${result.race.charAt(0).toUpperCase() + result.race.slice(1)}
- Smoking: ${result.smoker.charAt(0).toUpperCase() + result.smoker.slice(1)}
- Diabetes: ${result.diabetes === "yes" ? "Yes" : "No"}
- Blood Pressure: ${result.sbp} mmHg (${result.bpTreatment === "yes" ? "on treatment" : "untreated"})
- Total Cholesterol: ${result.tcCat} mg/dL
- HDL Cholesterol: ${result.hdlCat} mg/dL

ASCVD 10-Year Risk (Pooled Cohort Equations):
- Risk Score: ${result.ascvdRisk}%
- Classification: ${result.ascvdCat.label}
- ${result.ascvdCat.description}

Framingham Risk Score:
- Points Score: ${result.frsScore}
- 10-Year CHD Risk: ${result.frsRisk}
- Classification: ${result.chdCat.label}
- ${result.chdCat.description}

HIGH-RISK INDICATORS:
${result.isHighRisk ? "✓ High-risk status identified — aggressive treatment recommended" : "✗ No high-risk criteria met"}

RECOMMENDED ACTION:
${result.ascvdRiskNum >= 20 ? "• High-intensity statin therapy (atorvastatin 40-80 mg or rosuvastatin 20-40 mg)\n• Aggressive lifestyle modification\n• Consider aspirin therapy after physician discussion" : result.ascvdRiskNum >= 7.5 ? "• Moderate-intensity statin therapy recommended\n• Lifestyle modifications: diet, exercise, weight management\n• Reassess risk in 3–6 months" : "• Focus on healthy lifestyle\n• Maintain current lipid levels\n• Reassess every 5 years"}

STATIN ELIGIBILITY (ACC/AHA):
${result.ascvdRiskNum >= 20 ? "→ Moderate-to-high intensity statin indicated (risk ≥ 7.5%)" : result.ascvdRiskNum >= 7.5 ? "→ Consider moderate-intensity statin therapy" : "→ Statin therapy generally not indicated for primary prevention at this risk level"}

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
    link.download = `CAD_Risk_Report_${result.ascvdRisk}%_ASCVD.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This calculator is for educational and informational purposes only. It uses simplified approximations of the Pooled Cohort Equations and Framingham Risk Score and will not exactly match official ACC/AHA calculators. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase text-red-700">
            <HeartPulse className="h-4 w-4" />
            ASCVD & Framingham assessment
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Coronary Artery Disease Risk Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate your 10-year risk of coronary heart disease and atherosclerotic cardiovascular disease using the Pooled Cohort Equations and Framingham Risk Score.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          {/* Input Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Patient Parameters</h2>

            <label className="block">
              <span className="text-sm font-semibold">Age (20–79 years)</span>
              <input type="number" min="20" max="79" value={age} onChange={(e) => setAge(e.target.value)} placeholder="55" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
            </label>

            <SelectInput label="Sex" value={gender} onChange={setGender} options={getGenders().map((g) => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }))} />
            <SelectInput label="Race / Ethnicity" value={race} onChange={setRace} options={getRaces().map((r) => ({ value: r, label: r === "african-american" ? "African American" : r.charAt(0).toUpperCase() + r.slice(1) }))} />
            <SelectInput label="Smoking Status" value={smoker} onChange={setSmoker} options={getSmokingStatuses().map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
            <SelectInput label="Diabetes" value={diabetes} onChange={setDiabetes} options={getDiabetesStatuses().map((d) => ({ value: d, label: d === "yes" ? "Yes" : "No" }))} />
            <SelectInput label="Total Cholesterol" value={tcCat} onChange={setTcCat} options={getTotalCholCategories()} />
            <SelectInput label="HDL Cholesterol" value={hdlCat} onChange={setHdlCat} options={getHdlCategories()} />
            <SelectInput label="Blood Pressure Category" value={bpCat} onChange={setBpCat} options={getBpCategories()} />
            <SelectInput label="On BP Medication" value={bpTreatment} onChange={setBpTreatment} options={getDiabetesStatuses().map((d) => ({ value: d, label: d === "yes" ? "Yes" : "No" }))} />

            <div className="mt-6 flex gap-3">
              <button onClick={calculate} disabled={!age} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Calculate Risk</button>
              <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--muted)] active:scale-[0.98]"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>

          {/* Result Card */}
          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6" aria-live="polite" role="status">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Gauges */}
                <div className="grid grid-cols-2 gap-4">
                  <RiskGauge value={result.ascvdRiskNum} max={40} label="ASCVD 10-Year" />
                  <RiskGauge value={parseRiskPercent(result.frsRisk) || 0} max={40} label="Framingham CHD" />
                </div>

                {/* Overall Status */}
                <div className={`rounded-lg border p-4 ${result.ascvdCat.bg} ${result.ascvdCat.border}`}>
                  <div className="flex items-start gap-3">
                    <Activity className={`h-5 w-5 mt-0.5 shrink-0 ${result.ascvdCat.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.ascvdCat.color}`}>ASCVD: {result.ascvdCat.label} ({result.ascvdRisk}%)</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.ascvdCat.description}</p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${result.chdCat.bg} ${result.chdCat.border}`}>
                  <div className="flex items-start gap-3">
                    <HeartPulse className={`h-5 w-5 mt-0.5 shrink-0 ${result.chdCat.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.chdCat.color}`}>Framingham CHD: {result.chdCat.label} ({result.frsRisk})</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.chdCat.description}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Risk Details</p>
                  <div className="space-y-2">
                    <ResultRow label="Patient" value={`${result.age}y ${result.gender === "male" ? "M" : "F"}`} sub={result.race} />
                    <ResultRow label="ASCVD Risk" value={`${result.ascvdRisk}%`} color={result.ascvdCat.color} />
                    <ResultRow label="Framingham Points" value={result.frsScore} sub={result.frsRisk} />
                    <ResultRow label="Blood Pressure" value={`${result.sbp} mmHg`} sub={result.bpTreatment === "yes" ? "On treatment" : "Untreated"} />
                    <ResultRow label="Total Cholesterol" value={`${result.tcCat} mg/dL`} />
                    <ResultRow label="HDL Cholesterol" value={`${result.hdlCat} mg/dL`} />
                    <ResultRow label="Smoking" value={result.smoker.charAt(0).toUpperCase() + result.smoker.slice(1)} />
                    <ResultRow label="Diabetes" value={result.diabetes === "yes" ? "Yes" : "No"} />
                  </div>
                </div>

                {/* Statin Recommendation */}
                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Statin Eligibility (ACC/AHA Guidelines)</p>
                  <div className={`rounded-lg border p-3 text-sm ${result.ascvdRiskNum >= 7.5 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                    <p className={`font-semibold ${result.ascvdRiskNum >= 7.5 ? "text-amber-800" : "text-emerald-800"}`}>
                      {result.ascvdRiskNum >= 20 ? "High-intensity statin recommended" : result.ascvdRiskNum >= 7.5 ? "Moderate-intensity statin considered" : "Statin therapy generally not indicated"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {result.ascvdRiskNum >= 20 ? "Atorvastatin 40-80 mg or Rosuvastatin 20-40 mg" : result.ascvdRiskNum >= 7.5 ? "Atorvastatin 10-20 mg or Rosuvastatin 5-10 mg" : "Focus on lifestyle modifications"}
                    </p>
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
                <HeartPulse className="h-12 w-12 text-[var(--muted)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted)]">Fill in patient parameters to estimate CAD risk</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Both ASCVD and Framingham calculations run simultaneously.</p>
              </div>
            )}
          </div>
        </section>

        {/* Educational */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Understanding These Risk Scores</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Pooled Cohort Equations (ASCVD)</p>
              <p>The 2013 ACC/AHA Pooled Cohort Equations estimate 10-year risk of a first atherosclerotic cardiovascular disease event (heart attack or stroke) using age, sex, race, cholesterol levels, blood pressure, diabetes, and smoking status. It is the primary tool used to guide statin therapy decisions. This calculator uses a simplified approximation of those equations for educational purposes, so its output will diverge from the official ACC/AHA calculator — treat it as an illustration of how the risk factors interact, not a clinical-grade estimate.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Framingham Risk Score</p>
              <p>Developed from the Framingham Heart Study, this score estimates 10-year coronary heart disease risk. It uses age, sex, cholesterol, HDL, blood pressure, and smoking. While less comprehensive than the Pooled Cohort Equations, it remains widely used and validated globally.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
