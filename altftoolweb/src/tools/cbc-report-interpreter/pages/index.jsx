"use client";

import { useState, useCallback } from "react";
import { TestTube, RotateCcw, Info, Copy, Download, CheckCircle2, AlertTriangle, Shield, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const WBC_RANGES = { min: 4.5, max: 11.0, unit: "K/uL" };
const RBC_MALE = { min: 4.5, max: 5.5, unit: "M/uL" };
const RBC_FEMALE = { min: 4.0, max: 5.0, unit: "M/uL" };
const HGB_MALE = { min: 13.5, max: 17.5, unit: "g/dL" };
const HGB_FEMALE = { min: 12.0, max: 16.0, unit: "g/dL" };
const HCT_MALE = { min: 41, max: 53, unit: "%" };
const HCT_FEMALE = { min: 36, max: 46, unit: "%" };
const PLT_RANGES = { min: 150, max: 400, unit: "K/uL" };
const MCV_RANGES = { min: 80, max: 100, unit: "fL" };
const MCH_RANGES = { min: 27, max: 33, unit: "pg" };
const MCHC_RANGES = { min: 32, max: 36, unit: "g/dL" };
const RDW_RANGES = { min: 11.5, max: 14.5, unit: "%" };
const MPV_RANGES = { min: 7.5, max: 11.5, unit: "fL" };

const DIFF_RANGES = {
  neutrophils: { min: 40, max: 70, unit: "%", absMin: 1.5, absMax: 8.0 },
  lymphocytes: { min: 20, max: 40, unit: "%", absMin: 1.0, absMax: 4.8 },
  monocytes: { min: 2, max: 8, unit: "%", absMin: 0.2, absMax: 0.8 },
  eosinophils: { min: 1, max: 4, unit: "%", absMin: 0.04, absMax: 0.45 },
  basophils: { min: 0, max: 1, unit: "%", absMin: 0.01, absMax: 0.1 },
};

function classify(val, range) {
  if (val === "" || val === null) return null;
  const num = parseFloat(val);
  if (isNaN(num)) return null;
  if (num < range.min) return "low";
  if (num > range.max) return "high";
  return "normal";
}

function getStatus(val, range) {
  const cls = classify(val, range);
  if (cls === "low") return { label: "Low", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  if (cls === "high") return { label: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  return { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
}

function getAnemiaType(mcv, mch, mchc, rdw) {
  const mcvCls = classify(mcv, MCV_RANGES);
  const mchCls = classify(mch, MCH_RANGES);
  const mchcCls = classify(mchc, MCHC_RANGES);
  const rdwCls = classify(rdw, RDW_RANGES);

  if (mcvCls === "low" && mchcCls === "low") {
    return { type: "Microcytic Hypochromic", desc: "Small, pale RBCs. Top differential: Iron deficiency anemia, thalassemia, anemia of chronic disease, sideroblastic anemia.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  }
  if (mcvCls === "high") {
    return { type: "Macrocytic", desc: "Large RBCs. Top differential: B12 deficiency, folate deficiency, liver disease, hypothyroidism, myelodysplastic syndrome, reticulocytosis.", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  }
  if (mcvCls === "normal" && mchcCls === "normal") {
    return { type: "Normocytic Normochromic", desc: "Normal-sized RBCs. Consider: Anemia of chronic disease, early iron/B12 deficiency, acute blood loss, hemolytic anemia, renal anemia.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  }
  if (mcvCls === "low") {
    return { type: "Microcytic", desc: "Small RBCs. Evaluate iron studies, B12/folate, and consider thalassemia screening.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  }
  if (rdwCls === "high" && mcvCls === "normal") {
    return { type: "Dimorphic / Mixed", desc: "Elevated RDW with normal MCV suggests mixed picture. Consider combined deficiencies or early disease.", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  }
  return { type: "Normal RBC Morphology", desc: "RBC indices are within normal limits.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
}

function getInfectionPattern(wbc, neut, lym, mono, eos) {
  const findings = [];
  const wbcCls = classify(wbc, WBC_RANGES);
  const neutAbs = (neut / 100) * wbc;
  const lymAbs = (lym / 100) * wbc;
  const monoAbs = (mono / 100) * wbc;
  const eosAbs = (eos / 100) * wbc;

  if (wbcCls === "high" && neut > 70) findings.push({ pattern: "Neutrophilic Leukocytosis", desc: "Elevated WBC with neutrophilia. Suggests bacterial infection, stress response, corticosteroid use, or tissue necrosis.", severity: 2 });
  else if (wbcCls === "low" && lym > 50) findings.push({ pattern: "Relative Lymphocytosis", desc: "Low WBC with lymphocyte predominance. Consider viral infection, CLL, or relative neutropenia.", severity: 1 });
  else if (wbcCls === "high" && lym > 50) findings.push({ pattern: "Lymphocytosis", desc: "Elevated lymphocytes. Consider viral infection (EBV, CMV), pertussis, or lymphoproliferative disorder.", severity: 1 });
  else if (wbcCls === "high" && eos > 5) findings.push({ pattern: "Eosinophilia", desc: "Elevated eosinophils. Consider parasitic infection, allergic reaction, drug hypersensitivity, or eosinophilic disorders.", severity: 1 });
  else if (wbcCls === "high" && mono > 8) findings.push({ pattern: "Monocytosis", desc: "Elevated monocytes. Consider chronic infection (TB, endocarditis), autoimmune disease, or monocytic leukemia.", severity: 1 });
  else if (wbcCls === "low") findings.push({ pattern: "Leukopenia", desc: "Low WBC count. Evaluate for viral infection, bone marrow suppression, medication effect, or autoimmune conditions.", severity: 2 });

  if (neutAbs < 1.5) findings.push({ pattern: "Neutropenia", desc: "Absolute neutrophil count critically low. High infection risk. Avoid live vaccines. Consider G-CSF if ANC < 0.5.", severity: 3 });

  return findings;
}

function getPlateletAssessment(plt, mpv) {
  const pltCls = classify(plt, PLT_RANGES);
  const mpvCls = classify(mpv, MPV_RANGES);

  if (pltCls === "low") {
    if (mpvCls === "high") return { assessment: "Thrombocytopenia + High MPV", desc: "Large platelets suggest increased destruction (ITP, TTP, DIC) or recovery phase. Check peripheral smear for giant platelets.", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    if (mpvCls === "low") return { assessment: "Thrombocytopenia + Low MPV", desc: "Small platelets suggest decreased production (marrow failure, aplastic anemia, infiltration). Consider bone marrow biopsy.", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return { assessment: "Thrombocytopenia", desc: "Low platelet count. Assess bleeding risk. Check peripheral smear, coagulation studies. Consider ITP, TTP, DIC, medication effect.", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  }
  if (pltCls === "high") {
    return { assessment: "Thrombocytosis", desc: "Elevated platelets. Evaluate for reactive cause (infection, inflammation, iron deficiency, malignancy) vs. essential thrombocythemia.", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  }
  return { assessment: "Normal Platelets", desc: "Platelet count and size are within normal limits.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
}

function LabRow({ label, value, range, status }) {
  if (value === "" || value === null) return null;
  const numVal = parseFloat(value);
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${status.bg} ${status.border}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[var(--foreground)]">{label}</span>
        <span className={`font-bold ${status.color}`}>{numVal} {range.unit}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-[var(--muted-foreground)]">Range: {range.min}-{range.max}</span>
        <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
      </div>
    </div>
  );
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{title}</h3>
        {open ? <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function LabInput({ label, value, onChange, placeholder, range }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{range.unit}</span>
      </div>
      <input type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
      <span className="text-xs text-[var(--muted-foreground)]">Range: {range.min}-{range.max}</span>
    </label>
  );
}

export default function ToolHome() {
  const [gender, setGender] = useState("male");
  const [wbc, setWbc] = useState("");
  const [rbc, setRbc] = useState("");
  const [hgb, setHgb] = useState("");
  const [hct, setHct] = useState("");
  const [plt, setPlt] = useState("");
  const [mcv, setMcv] = useState("");
  const [mch, setMch] = useState("");
  const [mchc, setMchc] = useState("");
  const [rdw, setRdw] = useState("");
  const [mpv, setMpv] = useState("");
  const [neut, setNeut] = useState("");
  const [lym, setLym] = useState("");
  const [mono, setMono] = useState("");
  const [eos, setEos] = useState("");
  const [baso, setBaso] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const hasAny = wbc || rbc || hgb || hct || plt || mcv || mch || mchc || rdw || mpv || neut || lym || mono || eos || baso;

  const analyze = useCallback(() => {
    const findings = [];
    let totalSeverity = 0;
    let totalTests = 0;

    const hgbRange = gender === "male" ? HGB_MALE : HGB_FEMALE;
    const rbcRange = gender === "male" ? RBC_MALE : RBC_FEMALE;
    const hctRange = gender === "male" ? HCT_MALE : HCT_FEMALE;

    const tests = [
      { label: "WBC", value: wbc, range: WBC_RANGES },
      { label: "RBC", value: rbc, range: rbcRange },
      { label: "Hemoglobin", value: hgb, range: hgbRange },
      { label: "Hematocrit", value: hct, range: hctRange },
      { label: "Platelets", value: plt, range: PLT_RANGES },
      { label: "MCV", value: mcv, range: MCV_RANGES },
      { label: "MCH", value: mch, range: MCH_RANGES },
      { label: "MCHC", value: mchc, range: MCHC_RANGES },
      { label: "RDW", value: rdw, range: RDW_RANGES },
      { label: "MPV", value: mpv, range: MPV_RANGES },
    ];

    tests.forEach((t) => {
      if (t.value === "") return;
      const cls = classify(t.value, t.range);
      if (cls === "low" || cls === "high") {
        findings.push({ test: t.label, value: `${t.value} ${t.range.unit}`, status: getStatus(t.value, t.range), severity: cls === "high" && parseFloat(t.value) > t.range.max * 1.5 ? 3 : cls === "low" && parseFloat(t.value) < t.range.min * 0.5 ? 3 : 1 });
        totalSeverity += cls === "high" ? 1 : 1;
      }
      totalTests++;
    });

    const anemiaType = (hgb !== "" && mcv !== "") ? getAnemiaType(mcv, mch, mchc, rdw) : null;
    const infectionPattern = (wbc !== "" && neut !== "" && lym !== "") ? getInfectionPattern(parseFloat(wbc) || 0, parseFloat(neut) || 0, parseFloat(lym) || 0, parseFloat(mono) || 0, parseFloat(eos) || 0) : [];
    const plateletAssess = plt !== "" ? getPlateletAssessment(parseFloat(plt) || 0, parseFloat(mpv) || 0) : null;

    infectionPattern.forEach((p) => { totalSeverity += p.severity; });

    let overallRisk, riskColor, riskBg, riskBorder;
    if (totalSeverity <= 2) { overallRisk = "Low Risk"; riskColor = "text-emerald-600"; riskBg = "bg-emerald-50"; riskBorder = "border-emerald-200"; }
    else if (totalSeverity <= 5) { overallRisk = "Moderate Risk"; riskColor = "text-amber-600"; riskBg = "bg-amber-50"; riskBorder = "border-amber-200"; }
    else if (totalSeverity <= 10) { overallRisk = "High Risk"; riskColor = "text-orange-600"; riskBg = "bg-orange-50"; riskBorder = "border-orange-200"; }
    else { overallRisk = "Critical Risk"; riskColor = "text-red-600"; riskBg = "bg-red-50"; riskBorder = "border-red-200"; }

    const recs = [];
    if (anemiaType && anemiaType.type !== "Normal RBC Morphology") recs.push({ title: "Anemia Evaluation", text: `${anemiaType.type} pattern detected. ${anemiaType.desc}`, icon: AlertTriangle, color: "text-orange-600" });
    infectionPattern.forEach((p) => { recs.push({ title: p.pattern, text: p.desc, icon: AlertTriangle, color: p.severity >= 2 ? "text-red-600" : "text-amber-600" }); });
    if (plateletAssess && plateletAssess.assessment !== "Normal Platelets") recs.push({ title: plateletAssess.assessment, text: plateletAssess.desc, icon: AlertTriangle, color: "text-orange-600" });
    if (recs.length === 0) recs.push({ title: "Routine Follow-Up", text: "CBC values are within normal limits or minor deviations. Continue routine monitoring.", icon: Shield, color: "text-emerald-600" });

    setResult({
      gender, wbc, rbc, hgb, hct, plt, mcv, mch, mchc, rdw, mpv,
      neut, lym, mono, eos, baso,
      findings, totalSeverity, totalTests, overallRisk, riskColor, riskBg, riskBorder,
      anemiaType, infectionPattern, plateletAssess, recs,
      date: new Date().toLocaleString(),
    });
  }, [gender, wbc, rbc, hgb, hct, plt, mcv, mch, mchc, rdw, mpv, neut, lym, mono, eos, baso]);

  const reset = useCallback(() => {
    setGender("male"); setWbc(""); setRbc(""); setHgb(""); setHct(""); setPlt("");
    setMcv(""); setMch(""); setMchc(""); setRdw(""); setMpv("");
    setNeut(""); setLym(""); setMono(""); setEos(""); setBaso("");
    setResult(null);
  }, []);

  const buildReportText = useCallback(() => {
    if (!result) return "";
    return `
CBC REPORT INTERPRETATION
Generated: ${result.date}
================================
GENDER: ${result.gender}

HEMATOLOGY:
- WBC: ${result.wbc || "N/A"} K/uL
- RBC: ${result.rbc || "N/A"} M/uL
- Hemoglobin: ${result.hgb || "N/A"} g/dL
- Hematocrit: ${result.hct || "N/A"}%
- Platelets: ${result.plt || "N/A"} K/uL

RBC INDICES:
- MCV: ${result.mcv || "N/A"} fL
- MCH: ${result.mch || "N/A"} pg
- MCHC: ${result.mchc || "N/A"} g/dL
- RDW: ${result.rdw || "N/A"}%
- MPV: ${result.mpv || "N/A"} fL

DIFFERENTIAL:
- Neutrophils: ${result.neut || "N/A"}%
- Lymphocytes: ${result.lym || "N/A"}%
- Monocytes: ${result.mono || "N/A"}%
- Eosinophils: ${result.eos || "N/A"}%
- Basophils: ${result.baso || "N/A"}%

ASSESSMENT:
- Overall: ${result.overallRisk}
- Abnormal Findings: ${result.findings.length} of ${result.totalTests} tests
${result.anemiaType ? `- Anemia Pattern: ${result.anemiaType.type}` : ""}
${result.plateletAssess ? `- Platelet Status: ${result.plateletAssess.assessment}` : ""}
${result.infectionPattern.length > 0 ? `- Infection Pattern: ${result.infectionPattern.map((p) => p.pattern).join(", ")}` : ""}

KEY FINDINGS:
${result.findings.length > 0 ? result.findings.map((f) => `- ${f.test}: ${f.value} (${f.status.label})`).join("\n") : "  None"}

RECOMMENDATIONS:
${result.recs.map((r) => `- ${r.title}: ${r.text}`).join("\n")}

================================
This interpretation is for educational and informational purposes only.
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
    link.download = `CBC_Report_${result.date.replace(/[/,: ]/g, "-")}.txt`;
    link.click();
  }, [result, buildReportText]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This interpreter is for educational and informational purposes only. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <TestTube className="h-4 w-4" />
            CBC Interpretation
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">CBC Report Interpreter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Comprehensive Complete Blood Count interpretation with differential analysis, anemia classification, infection pattern recognition, and clinical recommendations.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <label className="block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Gender</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <span className="text-xs text-[var(--muted-foreground)]">Affects RBC, Hgb, Hct reference ranges</span>
              </label>
            </div>

            <Section title="CBC Parameters" defaultOpen={true}>
              <LabInput label="WBC" value={wbc} onChange={setWbc} placeholder="7.0" range={WBC_RANGES} />
              <LabInput label="RBC" value={rbc} onChange={setRbc} placeholder="5.0" range={gender === "male" ? RBC_MALE : RBC_FEMALE} />
              <LabInput label="Hemoglobin" value={hgb} onChange={setHgb} placeholder="15.0" range={gender === "male" ? HGB_MALE : HGB_FEMALE} />
              <LabInput label="Hematocrit" value={hct} onChange={setHct} placeholder="45" range={gender === "male" ? HCT_MALE : HCT_FEMALE} />
              <LabInput label="Platelets" value={plt} onChange={setPlt} placeholder="250" range={PLT_RANGES} />
            </Section>

            <Section title="RBC Indices">
              <LabInput label="MCV" value={mcv} onChange={setMcv} placeholder="88" range={MCV_RANGES} />
              <LabInput label="MCH" value={mch} onChange={setMch} placeholder="30" range={MCH_RANGES} />
              <LabInput label="MCHC" value={mchc} onChange={setMchc} placeholder="34" range={MCHC_RANGES} />
              <LabInput label="RDW" value={rdw} onChange={setRdw} placeholder="13" range={RDW_RANGES} />
              <LabInput label="MPV" value={mpv} onChange={setMpv} placeholder="9.5" range={MPV_RANGES} />
            </Section>

            <Section title="WBC Differential (%)">
              <LabInput label="Neutrophils" value={neut} onChange={setNeut} placeholder="60" range={{ min: DIFF_RANGES.neutrophils.min, max: DIFF_RANGES.neutrophils.max, unit: "%" }} />
              <LabInput label="Lymphocytes" value={lym} onChange={setLym} placeholder="30" range={{ min: DIFF_RANGES.lymphocytes.min, max: DIFF_RANGES.lymphocytes.max, unit: "%" }} />
              <LabInput label="Monocytes" value={mono} onChange={setMono} placeholder="5" range={{ min: DIFF_RANGES.monocytes.min, max: DIFF_RANGES.monocytes.max, unit: "%" }} />
              <LabInput label="Eosinophils" value={eos} onChange={setEos} placeholder="2" range={{ min: DIFF_RANGES.eosinophils.min, max: DIFF_RANGES.eosinophils.max, unit: "%" }} />
              <LabInput label="Basophils" value={baso} onChange={setBaso} placeholder="0.5" range={{ min: DIFF_RANGES.basophils.min, max: DIFF_RANGES.basophils.max, unit: "%" }} />
            </Section>

            <div className="flex gap-3">
              <button onClick={analyze} disabled={!hasAny} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Interpret CBC</button>
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
                      <p className={`text-sm font-bold ${result.riskColor}`}>Overall Assessment: {result.overallRisk}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.findings.length} abnormal finding{result.findings.length !== 1 ? "s" : ""} across {result.totalTests} tests analyzed.</p>
                    </div>
                  </div>
                </div>

                {result.findings.length > 0 && (
                  <div className="rounded-lg bg-[var(--background)] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Abnormal Findings</p>
                    <div className="space-y-2">
                      {result.findings.map((f, i) => (
                        <div key={i} className={`rounded-lg border px-3 py-2.5 text-sm ${f.status.bg} ${f.status.border}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--foreground)]">{f.test}</span>
                            <span className={`font-bold ${f.status.color}`}>{f.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.anemiaType && result.anemiaType.type !== "Normal RBC Morphology" && (
                  <div className={`rounded-lg border p-4 ${result.anemiaType.bg} ${result.anemiaType.border}`}>
                    <p className="text-sm font-bold text-[var(--foreground)]">{result.anemiaType.type}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{result.anemiaType.desc}</p>
                  </div>
                )}

                {result.infectionPattern.length > 0 && (
                  <div className="rounded-lg bg-[var(--background)] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Infection Pattern</p>
                    <div className="space-y-2">
                      {result.infectionPattern.map((p, i) => (
                        <div key={i} className={`rounded-lg border px-3 py-2.5 text-sm ${p.severity >= 2 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                          <p className={`font-bold ${p.severity >= 2 ? "text-red-600" : "text-amber-600"}`}>{p.pattern}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.plateletAssess && result.plateletAssess.assessment !== "Normal Platelets" && (
                  <div className={`rounded-lg border p-4 ${result.plateletAssess.bg} ${result.plateletAssess.border}`}>
                    <p className="text-sm font-bold text-[var(--foreground)]">{result.plateletAssess.assessment}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{result.plateletAssess.desc}</p>
                  </div>
                )}

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
                <TestTube className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted-foreground)]">Enter CBC values to generate interpretation</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Fill in any CBC parameters to begin comprehensive analysis.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Understanding CBC Interpretation</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">RBC Indices</p>
              <p>MCV measures RBC size (microcytic/normocytic/macrocytic). MCH and MCHC measure hemoglobin content (hypochromic/normochromic). RDW measures RBC size variation (anisocytosis). Together they narrow the differential diagnosis of anemia.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">WBC Differential</p>
              <p>Neutrophils elevate in bacterial infection. Lymphocytes elevate in viral infection. Eosinophils elevate in parasites/allergy. Monocytes elevate in chronic infection. Absolute counts (derived from % and WBC) are more clinically significant than percentages alone.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
