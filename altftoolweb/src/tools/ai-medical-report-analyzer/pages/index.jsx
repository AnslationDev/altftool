"use client";

import { useState, useCallback, useMemo } from "react";
import { FileText, RotateCcw, Info, Copy, Download, CheckCircle2, AlertTriangle, Shield, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CBC_RANGES = {
  wbc: { min: 4.5, max: 11.0, unit: "K/uL", low: { label: "Leukopenia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "Low WBC. May indicate bone marrow suppression, viral infection, or autoimmune conditions." }, high: { label: "Leukocytosis", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated WBC. May indicate infection, inflammation, stress, or hematologic malignancy." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal white blood cell count." } },
  rbc: { min: 4.5, max: 5.5, unit: "M/uL", low: { label: "Low RBC", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "Low red blood cell count. May indicate anemia or blood loss." }, high: { label: "High RBC", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Elevated RBC. May indicate polycythemia, dehydration, or chronic hypoxia." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal red blood cell count." } },
  hgb: { min: 13.5, max: 17.5, unit: "g/dL", low: { label: "Anemia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low hemoglobin. Evaluate for anemia type (iron, B12, folate, chronic disease)." }, high: { label: "Elevated Hgb", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Elevated hemoglobin. May indicate polycythemia or dehydration." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal hemoglobin level." } },
  hct: { min: 41, max: 53, unit: "%", low: { label: "Low Hct", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "Low hematocrit. Consistent with anemia." }, high: { label: "High Hct", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Elevated hematocrit. May indicate polycythemia or dehydration." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal hematocrit." } },
  plt: { min: 150, max: 400, unit: "K/uL", low: { label: "Thrombocytopenia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low platelets. Risk of bleeding. Evaluate for ITP, TTP, DIC, or marrow failure." }, high: { label: "Thrombocytosis", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Elevated platelets. May indicate reactive process or essential thrombocythemia." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal platelet count." } },
  mcv: { min: 80, max: 100, unit: "fL", low: { label: "Microcytic", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "Small RBCs. Consider iron deficiency, thalassemia, or chronic disease." }, high: { label: "Macrocytic", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Large RBCs. Consider B12/folate deficiency, liver disease, or hypothyroidism." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal RBC size." } },
};

const BMP_RANGES = {
  glucose: { min: 70, max: 100, unit: "mg/dL", low: { label: "Hypoglycemia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low blood glucose. Risk of confusion, seizures. Check insulin levels." }, high: { label: "Hyperglycemia", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated glucose. Evaluate for diabetes, stress response, or steroid use." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal fasting glucose." } },
  bun: { min: 7, max: 20, unit: "mg/dL", low: { label: "Low BUN", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low BUN. May indicate malnutrition, liver disease, or overhydration." }, high: { label: "Elevated BUN", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Elevated BUN. May indicate dehydration, renal impairment, or high protein intake." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal BUN level." } },
  creatinine: { min: 0.7, max: 1.3, unit: "mg/dL", low: { label: "Low Cr", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low creatinine. May indicate low muscle mass." }, high: { label: "Elevated Cr", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated creatinine. Indicates renal impairment. Calculate GFR for staging." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal creatinine level." } },
  sodium: { min: 136, max: 145, unit: "mEq/L", low: { label: "Hyponatremia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low sodium. Evaluate for SIADH, heart failure, or diuretic use." }, high: { label: "Hypernatremia", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated sodium. May indicate dehydration or diabetes insipidus." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal sodium level." } },
  potassium: { min: 3.5, max: 5.0, unit: "mEq/L", low: { label: "Hypokalemia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low potassium. Risk of arrhythmias. Check Mg2+ and acid-base status." }, high: { label: "Hyperkalemia", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 3, desc: "Elevated potassium. Risk of fatal arrhythmias. ECG changes may be present." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal potassium level." } },
  chloride: { min: 98, max: 106, unit: "mEq/L", low: { label: "Low Cl", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low chloride. May indicate metabolic alkalosis." }, high: { label: "High Cl", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 0, desc: "Elevated chloride. May indicate metabolic acidosis." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal chloride level." } },
  calcium: { min: 8.5, max: 10.5, unit: "mg/dL", low: { label: "Hypocalcemia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low calcium. Check PTH and vitamin D. Risk of tetany and Chvostek/Trousseau signs." }, high: { label: "Hypercalcemia", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated calcium. Evaluate for malignancy, hyperparathyroidism, or granulomatous disease." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal calcium level." } },
};

const LFT_RANGES = {
  alt: { min: 7, max: 56, unit: "U/L", low: { label: "Low ALT", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low ALT. Generally not clinically significant." }, high: { label: "Elevated ALT", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated ALT. Hepatocellular injury. Consider viral hepatitis, NAFLD, drug toxicity." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal ALT level." } },
  ast: { min: 10, max: 40, unit: "U/L", low: { label: "Low AST", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low AST. Generally not clinically significant." }, high: { label: "Elevated AST", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated AST. Consider liver injury, MI, or muscle damage." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal AST level." } },
  alp: { min: 44, max: 147, unit: "U/L", low: { label: "Low ALP", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low ALP. May indicate zinc deficiency or hypothyroidism." }, high: { label: "Elevated ALP", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 1, desc: "Elevated ALP. Consider cholestasis, bone disease, or pregnancy." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal ALP level." } },
  bilirubin: { min: 0.1, max: 1.2, unit: "mg/dL", low: { label: "Low Bili", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low bilirubin. Generally not clinically significant." }, high: { label: "Hyperbilirubinemia", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated bilirubin. Evaluate for hemolysis, hepatitis, or obstruction." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal bilirubin level." } },
  albumin: { min: 3.5, max: 5.0, unit: "g/dL", low: { label: "Hypoalbuminemia", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 2, desc: "Low albumin. May indicate malnutrition, liver disease, nephrotic syndrome, or inflammation." }, high: { label: "Elevated Albumin", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 0, desc: "Elevated albumin. Usually indicates dehydration." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal albumin level." } },
};

const THYROID_RANGES = {
  tsh: { min: 0.4, max: 4.0, unit: "mIU/L", low: { label: "Suppressed TSH", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Low TSH. May indicate hyperthyroidism. Check Free T4 and Free T3." }, high: { label: "Elevated TSH", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated TSH. May indicate hypothyroidism. Check Free T4." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal TSH level." } },
  freeT4: { min: 0.8, max: 1.8, unit: "ng/dL", low: { label: "Low Free T4", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 1, desc: "Low Free T4. May indicate hypothyroidism or sick euthyroid syndrome." }, high: { label: "Elevated Free T4", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Elevated Free T4. May indicate hyperthyroidism or thyroid hormone excess." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal Free T4 level." } },
};

const COAG_RANGES = {
  pt: { min: 11, max: 13.5, unit: "sec", low: { label: "Short PT", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Short PT. Generally not clinically significant unless on warfarin." }, high: { label: "Prolonged PT", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Prolonged PT. Evaluate for liver disease, vitamin K deficiency, or anticoagulation." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal PT." } },
  inr: { min: 0.8, max: 1.1, unit: "", low: { label: "Low INR", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Low INR. Patient not anticoagulated." }, high: { label: "Elevated INR", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 2, desc: "Elevated INR. If on warfarin, assess for supratherapeutic level and bleeding risk." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal INR." } },
  ptt: { min: 25, max: 35, unit: "sec", low: { label: "Short PTT", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", severity: 0, desc: "Short PTT. Generally not clinically significant." }, high: { label: "Prolonged PTT", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "Prolonged PTT. Evaluate for heparin effect, factor deficiency, or lupus anticoagulant." }, normal: { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "Normal PTT." } },
};

function classifyRange(range, val) {
  if (val === "" || val === null || val === undefined) return null;
  const numVal = parseFloat(val);
  if (isNaN(numVal)) return null;
  if (numVal < range.min) return range.low;
  if (numVal > range.max) return range.high;
  return range.normal;
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
  const cat = classifyRange(range, value);
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
        {cat && <span className={`text-xs font-bold ${cat.color}`}>{cat.label}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
        <span className="mt-2 text-xs text-[var(--muted-foreground)] whitespace-nowrap">{range.unit}</span>
      </div>
      <span className="text-xs text-[var(--muted-foreground)]">Range: {range.min}-{range.max} {range.unit}</span>
    </label>
  );
}

export default function ToolHome() {
  const [cbc, setCbc] = useState({ wbc: "", rbc: "", hgb: "", hct: "", plt: "", mcv: "" });
  const [bmp, setBmp] = useState({ glucose: "", bun: "", creatinine: "", sodium: "", potassium: "", chloride: "", calcium: "" });
  const [lft, setLft] = useState({ alt: "", ast: "", alp: "", bilirubin: "", albumin: "" });
  const [thyroid, setThyroid] = useState({ tsh: "", freeT4: "" });
  const [coag, setCoag] = useState({ pt: "", inr: "", ptt: "" });
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateCbc = useCallback((key, val) => setCbc((p) => ({ ...p, [key]: val })), []);
  const updateBmp = useCallback((key, val) => setBmp((p) => ({ ...p, [key]: val })), []);
  const updateLft = useCallback((key, val) => setLft((p) => ({ ...p, [key]: val })), []);
  const updateThyroid = useCallback((key, val) => setThyroid((p) => ({ ...p, [key]: val })), []);
  const updateCoag = useCallback((key, val) => setCoag((p) => ({ ...p, [key]: val })), []);

  const hasAnyValue = useMemo(() => {
    const allVals = [...Object.values(cbc), ...Object.values(bmp), ...Object.values(lft), ...Object.values(thyroid), ...Object.values(coag)];
    return allVals.some((v) => v !== "");
  }, [cbc, bmp, lft, thyroid, coag]);

  const analyze = useCallback(() => {
    const findings = [];
    let totalSeverity = 0;
    let totalTests = 0;

    const analyzeSet = (ranges, values, prefix) => {
      Object.entries(ranges).forEach(([key, range]) => {
        const val = values[key];
        if (val === "" || val === null || val === undefined) return;
        const cat = classifyRange(range, val);
        if (cat && cat.severity > 0) {
          totalSeverity += cat.severity;
          findings.push({ test: `${prefix} ${key.toUpperCase()}`, value: `${val} ${range.unit}`, ...cat });
        }
        totalTests++;
      });
    };

    analyzeSet(CBC_RANGES, cbc, "CBC");
    analyzeSet(BMP_RANGES, bmp, "BMP");
    analyzeSet(LFT_RANGES, lft, "LFT");
    analyzeSet(THYROID_RANGES, thyroid, "Thyroid");
    analyzeSet(COAG_RANGES, coag, "Coag");

    findings.sort((a, b) => b.severity - a.severity);

    let overallRisk, riskColor, riskBg, riskBorder;
    if (totalSeverity <= 2) { overallRisk = "Low Risk"; riskColor = "text-emerald-600"; riskBg = "bg-emerald-50"; riskBorder = "border-emerald-200"; }
    else if (totalSeverity <= 6) { overallRisk = "Moderate Risk"; riskColor = "text-amber-600"; riskBg = "bg-amber-50"; riskBorder = "border-amber-200"; }
    else if (totalSeverity <= 12) { overallRisk = "High Risk"; riskColor = "text-orange-600"; riskBg = "bg-orange-50"; riskBorder = "border-orange-200"; }
    else { overallRisk = "Critical Risk"; riskColor = "text-red-600"; riskBg = "bg-red-50"; riskBorder = "border-red-200"; }

    const recs = [];
    if (findings.some((f) => f.test.includes("POTASSIUM") && f.severity >= 2)) recs.push({ title: "Potassium Abnormality", text: "Critical potassium level detected. Obtain stat ECG. For hyperkalemia: check for peaked T waves, consider calcium gluconate, insulin/glucose, kayexalate. For hypokalemia: replace and check Mg2+.", icon: AlertTriangle, color: "text-red-600" });
    if (findings.some((f) => f.test.includes("CREATININE") && f.severity >= 2)) recs.push({ title: "Renal Function Impairment", text: "Elevated creatinine indicates renal impairment. Calculate eGFR, review nephrotoxic medications, ensure adequate hydration. Consider nephrology referral if GFR < 30.", icon: AlertTriangle, color: "text-orange-600" });
    if (findings.some((f) => f.test.includes("GLUCOSE") && f.severity >= 2)) recs.push({ title: "Glucose Abnormality", text: "Significant glucose abnormality. For hyperglycemia: check HbA1c, initiate insulin if needed. For hypoglycemia: give dextrose, identify cause (insulin, oral hypoglycemics, liver disease).", icon: AlertTriangle, color: "text-orange-600" });
    if (findings.some((f) => f.test.includes("INR") && f.severity >= 2)) recs.push({ title: "Coagulation Abnormality", text: "Abnormal INR detected. If on warfarin: assess for supratherapeutic level and bleeding risk. Consider holding dose and giving vitamin K if INR > 5.", icon: AlertTriangle, color: "text-orange-600" });
    if (findings.some((f) => f.test.includes("HGB") && f.severity >= 2)) recs.push({ title: "Anemia Detected", text: "Low hemoglobin indicates anemia. Check iron studies, B12, folate, reticulocyte count. Consider transfusion if symptomatic or Hgb < 7.", icon: AlertTriangle, color: "text-orange-600" });
    if (findings.some((f) => f.test.includes("PLT") && f.severity >= 2)) recs.push({ title: "Platelet Abnormality", text: "Significant platelet count abnormality. For thrombocytopenia: assess bleeding risk, check peripheral smear. For thrombocytosis: evaluate for reactive vs. clonal process.", icon: AlertTriangle, color: "text-orange-600" });
    if (findings.some((f) => f.test.includes("TSH") && f.severity >= 2)) recs.push({ title: "Thyroid Dysfunction", text: "Abnormal thyroid function. For elevated TSH: check Free T4, consider levothyroxine. For suppressed TSH: check Free T4/T3, evaluate for hyperthyroidism.", icon: AlertTriangle, color: "text-amber-600" });
    if (findings.some((f) => f.test.includes("ALT") || f.test.includes("AST")) && findings.some((f) => (f.test.includes("ALT") || f.test.includes("AST")) && f.severity >= 2)) recs.push({ title: "Liver Enzyme Elevation", text: "Elevated liver enzymes indicate hepatocellular injury. Check viral hepatitis panel, review medications, consider imaging. AST:ALT ratio > 2 suggests alcoholic liver disease.", icon: AlertTriangle, color: "text-orange-600" });
    if (recs.length === 0) recs.push({ title: "Routine Follow-Up", text: "All analyzed values are within normal limits or minor deviations. Continue routine monitoring as per age and risk factor profile.", icon: Shield, color: "text-emerald-600" });

    setResult({
      findings, totalSeverity, totalTests, overallRisk, riskColor, riskBg, riskBorder, recs,
      cbc: { ...cbc }, bmp: { ...bmp }, lft: { ...lft }, thyroid: { ...thyroid }, coag: { ...coag },
      date: new Date().toLocaleString(),
    });
  }, [cbc, bmp, lft, thyroid, coag]);

  const reset = useCallback(() => {
    setCbc({ wbc: "", rbc: "", hgb: "", hct: "", plt: "", mcv: "" });
    setBmp({ glucose: "", bun: "", creatinine: "", sodium: "", potassium: "", chloride: "", calcium: "" });
    setLft({ alt: "", ast: "", alp: "", bilirubin: "", albumin: "" });
    setThyroid({ tsh: "", freeT4: "" });
    setCoag({ pt: "", inr: "", ptt: "" });
    setResult(null);
  }, []);

  const buildReportText = useCallback(() => {
    if (!result) return "";
    const labLines = (ranges, values, prefix) => Object.entries(ranges).map(([key, range]) => {
      const val = values[key];
      if (val === "") return null;
      const cat = classifyRange(range, val);
      return `- ${prefix} ${key.toUpperCase()}: ${val} ${range.unit} (${cat?.label || "N/A"})`;
    }).filter(Boolean).join("\n");

    return `
AI MEDICAL REPORT ANALYSIS
Generated: ${result.date}
================================
CBC:
${labLines(CBC_RANGES, result.cbc, "CBC") || "  No values provided"}

BASIC METABOLIC PANEL:
${labLines(BMP_RANGES, result.bmp, "BMP") || "  No values provided"}

LIVER FUNCTION:
${labLines(LFT_RANGES, result.lft, "LFT") || "  No values provided"}

THYROID:
${labLines(THYROID_RANGES, result.thyroid, "Thyroid") || "  No values provided"}

COAGULATION:
${labLines(COAG_RANGES, result.coag, "Coag") || "  No values provided"}

================================
RISK ASSESSMENT:
- Overall: ${result.overallRisk}
- Abnormal Findings: ${result.findings.length} of ${result.totalTests} tests analyzed
- Severity Score: ${result.totalSeverity}

KEY FINDINGS:
${result.findings.length > 0 ? result.findings.map((f) => `- ${f.test}: ${f.value} — ${f.label} (${f.desc})`).join("\n") : "  None"}

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
    link.download = `Medical_Report_${result.date.replace(/[/,: ]/g, "-")}.txt`;
    link.click();
  }, [result, buildReportText]);

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
            <FileText className="h-4 w-4" />
            AI-Powered Report Analysis
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">AI Medical Report Analyzer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Comprehensive medical report analysis covering CBC, metabolic panel, liver function, thyroid, and coagulation with AI-powered interpretation and risk assessment.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="space-y-4">
            <Section title="Complete Blood Count (CBC)" defaultOpen={true}>
              <LabInput label="WBC" value={cbc.wbc} onChange={(v) => updateCbc("wbc", v)} placeholder="6.5" range={CBC_RANGES.wbc} />
              <LabInput label="RBC" value={cbc.rbc} onChange={(v) => updateCbc("rbc", v)} placeholder="5.0" range={CBC_RANGES.rbc} />
              <LabInput label="Hemoglobin" value={cbc.hgb} onChange={(v) => updateCbc("hgb", v)} placeholder="15.0" range={CBC_RANGES.hgb} />
              <LabInput label="Hematocrit" value={cbc.hct} onChange={(v) => updateCbc("hct", v)} placeholder="45" range={CBC_RANGES.hct} />
              <LabInput label="Platelets" value={cbc.plt} onChange={(v) => updateCbc("plt", v)} placeholder="250" range={CBC_RANGES.plt} />
              <LabInput label="MCV" value={cbc.mcv} onChange={(v) => updateCbc("mcv", v)} placeholder="88" range={CBC_RANGES.mcv} />
            </Section>

            <Section title="Basic Metabolic Panel (BMP)">
              <LabInput label="Glucose" value={bmp.glucose} onChange={(v) => updateBmp("glucose", v)} placeholder="90" range={BMP_RANGES.glucose} />
              <LabInput label="BUN" value={bmp.bun} onChange={(v) => updateBmp("bun", v)} placeholder="15" range={BMP_RANGES.bun} />
              <LabInput label="Creatinine" value={bmp.creatinine} onChange={(v) => updateBmp("creatinine", v)} placeholder="1.0" range={BMP_RANGES.creatinine} />
              <LabInput label="Sodium" value={bmp.sodium} onChange={(v) => updateBmp("sodium", v)} placeholder="140" range={BMP_RANGES.sodium} />
              <LabInput label="Potassium" value={bmp.potassium} onChange={(v) => updateBmp("potassium", v)} placeholder="4.0" range={BMP_RANGES.potassium} />
              <LabInput label="Chloride" value={bmp.chloride} onChange={(v) => updateBmp("chloride", v)} placeholder="102" range={BMP_RANGES.chloride} />
              <LabInput label="Calcium" value={bmp.calcium} onChange={(v) => updateBmp("calcium", v)} placeholder="9.5" range={BMP_RANGES.calcium} />
            </Section>

            <Section title="Liver Function Tests (LFT)">
              <LabInput label="ALT" value={lft.alt} onChange={(v) => updateLft("alt", v)} placeholder="25" range={LFT_RANGES.alt} />
              <LabInput label="AST" value={lft.ast} onChange={(v) => updateLft("ast", v)} placeholder="25" range={LFT_RANGES.ast} />
              <LabInput label="ALP" value={lft.alp} onChange={(v) => updateLft("alp", v)} placeholder="80" range={LFT_RANGES.alp} />
              <LabInput label="Bilirubin" value={lft.bilirubin} onChange={(v) => updateLft("bilirubin", v)} placeholder="0.7" range={LFT_RANGES.bilirubin} />
              <LabInput label="Albumin" value={lft.albumin} onChange={(v) => updateLft("albumin", v)} placeholder="4.2" range={LFT_RANGES.albumin} />
            </Section>

            <Section title="Thyroid Function">
              <LabInput label="TSH" value={thyroid.tsh} onChange={(v) => updateThyroid("tsh", v)} placeholder="2.0" range={THYROID_RANGES.tsh} />
              <LabInput label="Free T4" value={thyroid.freeT4} onChange={(v) => updateThyroid("freeT4", v)} placeholder="1.2" range={THYROID_RANGES.freeT4} />
            </Section>

            <Section title="Coagulation Studies">
              <LabInput label="PT" value={coag.pt} onChange={(v) => updateCoag("pt", v)} placeholder="12.5" range={COAG_RANGES.pt} />
              <LabInput label="INR" value={coag.inr} onChange={(v) => updateCoag("inr", v)} placeholder="1.0" range={COAG_RANGES.inr} />
              <LabInput label="PTT" value={coag.ptt} onChange={(v) => updateCoag("ptt", v)} placeholder="30" range={COAG_RANGES.ptt} />
            </Section>

            <div className="flex gap-3">
              <button onClick={analyze} disabled={!hasAnyValue} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Analyze Report</button>
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
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.findings.length} abnormal finding{result.findings.length !== 1 ? "s" : ""} detected across {result.totalTests} tests analyzed.</p>
                    </div>
                  </div>
                </div>

                {result.findings.length > 0 && (
                  <div className="rounded-lg bg-[var(--background)] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Abnormal Findings</p>
                    <div className="space-y-2">
                      {result.findings.map((f, i) => (
                        <div key={i} className={`rounded-lg border px-3 py-2.5 text-sm ${f.bg} ${f.border}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--foreground)]">{f.test}</span>
                            <span className={`font-bold ${f.color}`}>{f.value}</span>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">{f.desc}</p>
                        </div>
                      ))}
                    </div>
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
                <FileText className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted-foreground)]">Enter lab values to generate analysis</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Fill in any lab values from your medical report to begin AI-powered interpretation.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Understanding Medical Reports</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Lab Value Context</p>
              <p>Lab values must always be interpreted in clinical context. A single abnormal value may not be significant, but patterns across multiple tests can reveal underlying conditions. Reference ranges may vary between laboratories and populations.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">When to Seek Care</p>
              <p>Seek immediate medical attention for critically abnormal values, especially potassium, glucose, or platelets. For moderate abnormalities, follow up with your healthcare provider within 24-48 hours. Always bring previous lab results for comparison.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
