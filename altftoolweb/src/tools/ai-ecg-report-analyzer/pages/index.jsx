"use client";

import { useState, useCallback, useEffect } from "react";
import { Activity, RotateCcw, Info, Copy, Download, CheckCircle2, AlertTriangle, Shield, HeartPulse, Zap, TrendingUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const HR_CAT = [
  { max: 50, label: "Bradycardia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "Heart rate below 60 bpm. May indicate sinus bradycardia, AV block, or medication effect." },
  { max: 100, label: "Normal Sinus", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal resting heart rate for adults (60-100 bpm)." },
  { max: 120, label: "Mild Tachycardia", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", severity: 1, desc: "Slightly elevated. May indicate stress, fever, dehydration, or early sinus tachycardia." },
  { max: 150, label: "Tachycardia", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated heart rate. Evaluate for sinus tachycardia, SVT, or atrial flutter/tachycardia." },
  { max: Infinity, label: "Severe Tachycardia", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 3, desc: "Very rapid heart rate. Urgent evaluation needed. Consider SVT, VT, or atrial flutter with 1:1 conduction." },
];

const PR_CAT = [
  { max: 120, label: "Short PR", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "PR < 120ms. May indicate junctional rhythm, WPW syndrome, or accelerated AV conduction." },
  { max: 200, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal AV conduction time (120-200ms)." },
  { max: 300, label: "First-Degree AV Block", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", severity: 1, desc: "PR > 200ms. Delayed AV conduction. Usually benign but monitor for progression." },
  { max: Infinity, label: "Advanced Block", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 3, desc: "PR > 300ms. Significant conduction delay. Evaluate for higher-degree AV block." },
];

const QRS_CAT = [
  { max: 100, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal ventricular depolarization (80-100ms)." },
  { max: 120, label: "Incomplete Block", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", severity: 1, desc: "QRS 100-120ms. May indicate incomplete bundle branch block or nonspecific intraventricular delay." },
  { max: Infinity, label: "Bundle Branch Block", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "QRS > 120ms. Indicates complete bundle branch block (RBBB or LBBB). Requires morphology analysis." },
];

const QTc_CAT = {
  male: [
    { max: 350, label: "Short QT", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "QTc < 350ms. May increase risk of atrial and ventricular arrhythmias." },
    { max: 450, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal QTc for adult males." },
    { max: 470, label: "Borderline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", severity: 1, desc: "Borderline prolongation. Monitor and consider medication review." },
    { max: Infinity, label: "Prolonged", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 3, desc: "QTc > 470ms. Increased risk of Torsades de Pointes. Urgent evaluation needed." },
  ],
  female: [
    { max: 360, label: "Short QT", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "QTc < 360ms. May increase risk of arrhythmias." },
    { max: 460, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal QTc for adult females." },
    { max: 480, label: "Borderline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", severity: 1, desc: "Borderline prolongation. Monitor and consider medication review." },
    { max: Infinity, label: "Prolonged", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 3, desc: "QTc > 480ms. Increased risk of Torsades de Pointes. Urgent evaluation needed." },
  ],
};

function classify(cat, val) { for (const c of cat) if (val <= c.max) return c; return cat[cat.length - 1]; }

const AXIS_OPTIONS = [
  { value: "normal", label: "Normal (-30 to +90)", severity: 0, desc: "Normal cardiac axis." },
  { value: "left", label: "Left Deviation (-30 to -90)", severity: 1, desc: "Left axis deviation. May indicate LAFB, LVH, or inferior MI." },
  { value: "right", label: "Right Deviation (+90 to +180)", severity: 1, desc: "Right axis deviation. May indicate RAFB, RVH, or PE." },
  { value: "extreme", label: "Extreme Deviation (-90 to -180)", severity: 2, desc: "Extreme axis deviation (no man's land). Consider severe RVH or electrode misplacement." },
];

const ST_OPTIONS = [
  { value: "normal", label: "No ST Changes", severity: 0, desc: "No ST segment elevation or depression." },
  { value: "depression", label: "ST Depression", severity: 2, desc: "ST depression > 0.5mm. May indicate ischemia, digoxin effect, or hypokalemia." },
  { value: "elevation", label: "ST Elevation", severity: 3, desc: "ST elevation > 1mm. Evaluate for acute MI, pericarditis, or early repolarization." },
  { value: "tombstone", label: "Tombstone Elevation", severity: 3, desc: "Convex ST elevation > 2mm. Highly specific for acute STEMI. Emergency intervention required." },
];

const T_WAVE_OPTIONS = [
  { value: "normal", label: "Normal T Waves", severity: 0, desc: "Normal T wave morphology and axis." },
  { value: "inversion", label: "T Wave Inversion", severity: 2, desc: "Inverted T waves. May indicate ischemia, strain, or cardiomyopathy." },
  { value: "hyperacute", label: "Hyperacute T Waves", severity: 3, desc: "Tall, peaked T waves. Early sign of acute MI or hyperkalemia." },
  { value: "flattened", label: "Flattened T Waves", severity: 1, desc: "Low-amplitude T waves. May indicate hypokalemia, hypothyroidism, or ischemia." },
];

const RHYTHM_OPTIONS = [
  { value: "sinus", label: "Sinus Rhythm", severity: 0, desc: "Normal sinus rhythm with consistent P waves before each QRS." },
  { value: "sinus-brady", label: "Sinus Bradycardia", severity: 1, desc: "Sinus rhythm with HR < 60 bpm." },
  { value: "sinus-tachy", label: "Sinus Tachycardia", severity: 1, desc: "Sinus rhythm with HR > 100 bpm." },
  { value: "afib", label: "Atrial Fibrillation", severity: 2, desc: "Irregularly irregular rhythm without P waves. Rate control and anticoagulation assessment needed." },
  { value: "aflutter", label: "Atrial Flutter", severity: 2, desc: "Sawtooth flutter waves at ~300 bpm with variable block." },
  { value: "svt", label: "Supraventricular Tachycardia", severity: 2, desc: "Narrow complex tachycardia > 150 bpm. Regular rhythm." },
  { value: "vt", label: "Ventricular Tachycardia", severity: 3, desc: "Wide complex tachycardia. Medical emergency. Assume VT until proven otherwise." },
  { value: "paced", label: "Paced Rhythm", severity: 1, desc: "Pacemaker spikes visible. Evaluate capture and sensing." },
];

function calculateRisk(params) {
  let score = 0;
  const findings = [];

  const hrCat = classify(HR_CAT, params.hr || 72);
  score += hrCat.severity * 2;
  if (hrCat.severity > 0) findings.push(`Heart rate: ${hrCat.label}`);

  const prCat = classify(PR_CAT, params.pr || 160);
  score += prCat.severity * 1.5;
  if (prCat.severity > 0) findings.push(`PR interval: ${prCat.label}`);

  const qrsCat = classify(QRS_CAT, params.qrs || 90);
  score += qrsCat.severity * 2;
  if (qrsCat.severity > 0) findings.push(`QRS duration: ${qrsCat.label}`);

  const qtcCatVal = params.qtc ? classify(QTc_CAT[params.gender] || QTc_CAT.male, params.qtc) : null;
  if (qtcCatVal) { score += qtcCatVal.severity * 2.5; if (qtcCatVal.severity > 0) findings.push(`QTc: ${qtcCatVal.label}`); }

  const axisInfo = AXIS_OPTIONS.find((a) => a.value === params.axis);
  if (axisInfo) { score += axisInfo.severity * 1.5; if (axisInfo.severity > 0) findings.push(`Axis: ${axisInfo.label}`); }

  const stInfo = ST_OPTIONS.find((s) => s.value === params.st);
  if (stInfo) { score += stInfo.severity * 3; if (stInfo.severity > 0) findings.push(`ST segment: ${stInfo.label}`); }

  const tInfo = T_WAVE_OPTIONS.find((t) => t.value === params.tWave);
  if (tInfo) { score += tInfo.severity * 2; if (tInfo.severity > 0) findings.push(`T waves: ${tInfo.label}`); }

  const rhythmInfo = RHYTHM_OPTIONS.find((r) => r.value === params.rhythm);
  if (rhythmInfo) { score += rhythmInfo.severity * 3; if (rhythmInfo.severity > 0) findings.push(`Rhythm: ${rhythmInfo.label}`); }

  score = Math.min(score, 25);

  let risk, riskColor, riskBg, riskBorder;
  if (score <= 2) { risk = "Low Risk"; riskColor = "text-emerald-600"; riskBg = "bg-emerald-50"; riskBorder = "border-emerald-200"; }
  else if (score <= 6) { risk = "Moderate Risk"; riskColor = "text-amber-600"; riskBg = "bg-amber-50"; riskBorder = "border-amber-200"; }
  else if (score <= 12) { risk = "High Risk"; riskColor = "text-orange-600"; riskBg = "bg-orange-50"; riskBorder = "border-orange-200"; }
  else { risk = "Critical Risk"; riskColor = "text-red-600"; riskBg = "bg-red-50"; riskBorder = "border-red-200"; }

  return { score, risk, riskColor, riskBg, riskBorder, findings, hrCat, prCat, qrsCat, qtcCatVal, axisInfo, stInfo, tInfo, rhythmInfo };
}

function getRecommendations(result, params) {
  const recs = [];
  if (result.stInfo?.severity >= 2) recs.push({ title: "ST Segment Changes", text: "ST changes detected. If acute, activate chest pain protocol. Obtain serial ECGs and troponins. Consider emergent catheterization if STEMI criteria met.", icon: AlertTriangle, color: "text-red-600" });
  if (result.tInfo?.severity >= 2) recs.push({ title: "T Wave Abnormalities", text: "Significant T wave changes. Evaluate for ischemia, electrolyte abnormalities (K+, Mg2+), and structural heart disease. Correlate with clinical presentation.", icon: AlertTriangle, color: "text-orange-600" });
  if (result.qtcCatVal?.severity >= 2) recs.push({ title: "QTc Prolongation", text: "Prolonged QTc increases risk of Torsades de Pointes. Review medications for QT-prolonging drugs. Check electrolytes (K+, Mg2+). Avoid Class IA/III antiarrhythmics.", icon: AlertTriangle, color: "text-red-600" });
  if (result.rhythmInfo?.severity >= 2) recs.push({ title: "Abnormal Rhythm", text: "Significant rhythm disturbance detected. For AF: assess CHA2DS2-VASc for anticoagulation. For VT: immediate stabilization required. Cardiology consultation recommended.", icon: HeartPulse, color: "text-red-600" });
  if (result.qrsCat?.severity >= 2) recs.push({ title: "Conduction Abnormality", text: "Bundle branch block identified. Evaluate for underlying etiology (ischemia, cardiomyopathy, degenerative disease). Assess for dyssynchrony if LBBB with reduced EF.", icon: Zap, color: "text-orange-600" });
  if (result.hrCat?.severity >= 2) recs.push({ title: "Rate Abnormality", text: "Significant rate disturbance. For tachycardia: identify and treat underlying cause (fever, pain, dehydration, PE, thyroid). For bradycardia: assess hemodynamic stability.", icon: TrendingUp, color: "text-amber-600" });
  if (recs.length === 0) recs.push({ title: "Routine Follow-Up", text: "ECG findings are within normal limits or minor. Continue routine cardiovascular screening as per age and risk factor profile.", icon: Shield, color: "text-emerald-600" });
  return recs;
}

function ResultRow({ label, value, cat }) {
  if (!cat) return null;
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${cat.bg} ${cat.border}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[var(--foreground)]">{label}</span>
        <span className={`font-bold ${cat.color}`}>{value}</span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">{cat.desc}</p>
    </div>
  );
}

export default function ToolHome() {
  const [gender, setGender] = useState("male");
  const [hr, setHr] = useState("");
  const [pr, setPr] = useState("");
  const [qrs, setQrs] = useState("");
  const [qtc, setQt] = useState("");
  const [axis, setAxis] = useState("normal");
  const [st, setSt] = useState("normal");
  const [tWave, setTWave] = useState("normal");
  const [rhythm, setRhythm] = useState("sinus");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const analyze = useCallback(() => {
    const hrVal = parseInt(hr) || 72;
    const prVal = parseInt(pr) || 160;
    const qrsVal = parseInt(qrs) || 90;
    const qtcVal = parseInt(qtc) || null;

    const res = calculateRisk({ hr: hrVal, pr: prVal, qrs: qrsVal, qtc: qtcVal, gender, axis, st, tWave, rhythm });
    const recs = getRecommendations(res, { hr: hrVal, pr: prVal, qrs: qrsVal, qtc: qtcVal, gender, axis, st, tWave, rhythm });

    setResult({
      hr: hrVal, pr: prVal, qrs: qrsVal, qtc: qtcVal, gender, axis, st, tWave, rhythm,
      ...res, recs,
      date: new Date().toLocaleString(),
    });
  }, [hr, pr, qrs, qtc, gender, axis, st, tWave, rhythm]);

  const reset = useCallback(() => {
    setHr(""); setPr(""); setQrs(""); setQt(""); setGender("male");
    setAxis("normal"); setSt("normal"); setTWave("normal"); setRhythm("sinus");
    setResult(null);
  }, []);

  const buildReportText = useCallback(() => {
    if (!result) return "";
    return `
AI ECG REPORT ANALYSIS
Generated: ${result.date}
================================
PARAMETERS:
- Heart Rate: ${result.hr} bpm
- PR Interval: ${result.pr} ms
- QRS Duration: ${result.qrs} ms
- QTc: ${result.qtc ? result.qtc + " ms" : "Not provided"}
- Gender: ${result.gender}
- Rhythm: ${result.rhythmInfo?.label || result.rhythm}
- Axis: ${result.axisInfo?.label || result.axis}
- ST Segment: ${result.stInfo?.label || result.st}
- T Waves: ${result.tInfo?.label || result.tWave}

INTERPRETATION:
- Heart Rate: ${result.hrCat.label} (${result.hrCat.desc})
- PR Interval: ${result.prCat.label} (${result.prCat.desc})
- QRS Duration: ${result.qrsCat.label} (${result.qrsCat.desc})
${result.qtcCatVal ? `- QTc: ${result.qtcCatVal.label} (${result.qtcCatVal.desc})` : ""}

RISK ASSESSMENT:
- Overall Risk: ${result.risk} (Score: ${result.score}/25)
- Key Findings: ${result.findings.length > 0 ? result.findings.join("; ") : "None"}

RECOMMENDATIONS:
${result.recs.map((r) => `- ${r.title}: ${r.text}`).join("\n")}

================================
This analysis is for educational and informational purposes only.
Clinical decisions should always be made by qualified healthcare professionals.
    `.trim();
  }, [result]);

  const copyReport = useCallback(async () => {
    const success = await safeCopyText(buildReportText());
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  }, [buildReportText]);

  const downloadReport = useCallback(() => {
    if (!result) return;
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ECG_Report_${result.hr}bpm_${result.date.replace(/[/,: ]/g, "-")}.txt`;
    link.click();
  }, [result, buildReportText]);

  const canAnalyze = hr || pr || qrs || qtc;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This analyzer is for educational and informational purposes only. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Activity className="h-4 w-4" />
            AI-Powered ECG Analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">AI ECG Report Analyzer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Comprehensive ECG parameter analysis with AI-powered interpretation, risk stratification, and clinical recommendations.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="space-y-5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">ECG Parameters</h2>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Heart Rate (bpm)</span>
                <input type="number" min="20" max="300" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="72" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">Normal: 60-100 bpm</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">PR Interval (ms)</span>
                <input type="number" min="50" max="500" value={pr} onChange={(e) => setPr(e.target.value)} placeholder="160" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">Normal: 120-200 ms</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">QRS Duration (ms)</span>
                <input type="number" min="40" max="250" value={qrs} onChange={(e) => setQrs(e.target.value)} placeholder="90" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">Normal: 80-100 ms</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">QTc (ms) (Optional)</span>
                <input type="number" min="200" max="700" value={qtc} onChange={(e) => setQt(e.target.value)} placeholder="420" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">Male: 350-450 | Female: 360-460</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Gender</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Morphology</h2>
              {[
                { label: "Rhythm", value: rhythm, set: setRhythm, options: RHYTHM_OPTIONS },
                { label: "Axis", value: axis, set: setAxis, options: AXIS_OPTIONS },
                { label: "ST Segment", value: st, set: setSt, options: ST_OPTIONS },
                { label: "T Waves", value: tWave, set: setTWave, options: T_WAVE_OPTIONS },
              ].map((f) => (
                <label key={f.label} className="mt-4 block">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{f.label}</span>
                  <select value={f.value} onChange={(e) => f.set(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={analyze} disabled={!canAnalyze} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Analyze ECG</button>
              <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)] active:scale-[0.98]"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`rounded-lg border p-4 ${result.riskBg} ${result.riskBorder}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.riskColor}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.riskColor}`}>Overall Risk: {result.risk} ({result.score}/25)</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">Based on heart rate, intervals, morphology, and rhythm analysis.</p>
                    </div>
                  </div>
                </div>

                {result.findings.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Key Findings ({result.findings.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {result.findings.map((f) => (
                        <span key={f} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-[var(--background)] p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Interval Analysis</p>
                  <ResultRow label={`Heart Rate (${result.hr} bpm)`} value={result.hrCat.label} cat={result.hrCat} />
                  <ResultRow label={`PR Interval (${result.pr} ms)`} value={result.prCat.label} cat={result.prCat} />
                  <ResultRow label={`QRS Duration (${result.qrs} ms)`} value={result.qrsCat.label} cat={result.qrsCat} />
                  {result.qtcCatVal && <ResultRow label={`QTc (${result.qtc} ms)`} value={result.qtcCatVal.label} cat={result.qtcCatVal} />}
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Morphology Assessment</p>
                  <ResultRow label="Rhythm" value={result.rhythmInfo?.label} cat={result.rhythmInfo} />
                  <ResultRow label="Axis" value={result.axisInfo?.label} cat={result.axisInfo} />
                  <ResultRow label="ST Segment" value={result.stInfo?.label} cat={result.stInfo} />
                  <ResultRow label="T Waves" value={result.tInfo?.label} cat={result.tInfo} />
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
                <Activity className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted-foreground)]">Enter ECG parameters to generate analysis</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Fill in at least one interval value to begin AI-powered interpretation.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Understanding ECG Parameters</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Interval Significance</p>
              <p>ECG intervals reflect the electrical conduction through the heart. PR interval measures atrial-to-ventricular conduction, QRS measures ventricular depolarization, and QTc measures the total ventricular electric systole. Abnormalities in any interval can indicate conduction blocks, ischemia, or arrhythmia risk.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Morphology Analysis</p>
              <p>ST segment and T wave changes are critical markers of myocardial ischemia and infarction. ST elevation in specific leads localizes the infarct territory. T wave inversion may indicate chronic ischemia or ventricular strain patterns. Always correlate with clinical symptoms.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
