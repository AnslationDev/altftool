"use client";

import { useState, useCallback } from "react";
import { Wind, RotateCcw, Info, Copy, Download, CheckCircle2, AlertTriangle, Shield, Activity } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEVICES = [
  { id: "nasal-cannula", name: "Nasal Cannula", minFlow: 1, maxFlow: 6, baseFio2: 0.24, fio2PerL: 0.04, desc: "Most common low-flow device. Comfortable for prolonged use. Delivers 24-44% FiO2.", bestFor: "Mild to moderate hypoxemia (SpO2 90-95%), stable patients" },
  { id: "simple-mask", name: "Simple Face Mask", minFlow: 5, maxFlow: 10, baseFio2: 0.40, fio2PerL: 0.04, desc: "Covers nose and mouth. Requires minimum 5 L/min to prevent CO2 rebreathing. Delivers 40-60% FiO2.", bestFor: "Moderate hypoxemia, short-term oxygen therapy" },
  { id: "partial-rebreather", name: "Partial Rebreather Mask", minFlow: 6, maxFlow: 10, baseFio2: 0.50, fio2PerL: 0.05, desc: "Has reservoir bag. Allows partial rebreathing of expired air. Delivers 50-70% FiO2.", bestFor: "Moderate to severe hypoxemia requiring higher FiO2" },
  { id: "non-rebreather", name: "Non-Rebreather Mask", minFlow: 10, maxFlow: 15, baseFio2: 0.60, fio2PerL: 0.04, desc: "Full reservoir bag with one-way valves. Delivers highest FiO2 of low-flow devices (60-90%).", bestFor: "Severe hypoxemia, emergency situations, pre-intubation" },
  { id: "venturi", name: "Venturi Mask", minFlow: 4, maxFlow: 12, baseFio2: 0.24, fio2PerL: 0, desc: "High-flow device delivering precise FiO2 (24-60%) via color-coded adapters. Most accurate FiO2 delivery.", bestFor: "COPD patients requiring precise FiO2 control" },
];

const VENTURI_FIO2 = [
  { fio2: 24, flow: 4, color: "blue" },
  { fio2: 28, flow: 4, color: "white" },
  { fio2: 31, flow: 6, color: "orange" },
  { fio2: 35, flow: 6, color: "yellow" },
  { fio2: 40, flow: 8, color: "red" },
  { fio2: 50, flow: 10, color: "purple" },
  { fio2: 60, flow: 12, color: "pink" },
];

function calculateFio2(device, flow) {
  if (device.id === "venturi") return null;
  const flowAboveMin = Math.max(0, flow - device.minFlow);
  return Math.min(100, Math.round((device.baseFio2 + device.fio2PerL * flowAboveMin) * 100));
}

function calculateFlowForFio2(device, targetFio2) {
  if (device.id === "venturi") return null;
  const flowAboveMin = (targetFio2 / 100 - device.baseFio2) / device.fio2PerL;
  const needed = device.minFlow + flowAboveMin;
  return Math.max(device.minFlow, Math.min(device.maxFlow, Math.round(needed * 10) / 10));
}

function getOxygenRequirement(spo2, ageGroup) {
  if (spo2 >= 96) return { level: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", severity: 0, desc: "SpO2 is within normal range. No supplemental oxygen required." };
  if (spo2 >= 94) return { level: "Mild Hypoxemia", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", severity: 1, desc: "SpO2 is borderline. Monitor closely. Consider supplemental O2 if symptomatic." };
  if (spo2 >= 90) return { level: "Moderate Hypoxemia", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", severity: 2, desc: "SpO2 is below normal. Supplemental oxygen recommended. Target SpO2 94-98%." };
  if (spo2 >= 85) return { level: "Severe Hypoxemia", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", severity: 3, desc: "SpO2 critically low. Urgent oxygen therapy required. Consider high-flow or NIV." };
  return { level: "Critical Hypoxemia", color: "text-red-700", bg: "bg-red-50", border: "border-red-300", severity: 3, desc: "SpO2 dangerously low. Emergency intervention required. Prepare for intubation if not improving." };
}

function getTargetSpo2(ageGroup) {
  switch (ageGroup) {
    case "neonate": return { min: 94, max: 98, label: "94-98%" };
    case "infant": return { min: 94, max: 98, label: "94-98%" };
    case "child": return { min: 95, max: 99, label: "95-99%" };
    case "copd": return { min: 88, max: 92, label: "88-92%" };
    default: return { min: 94, max: 98, label: "94-98%" };
  }
}

function getRecommendations(level, spo2, ageGroup, devices) {
  const recs = [];
  const target = getTargetSpo2(ageGroup);

  if (level.severity === 0) {
    recs.push({ title: "No Supplemental O2 Needed", text: `SpO2 ${spo2}% is within normal range. Target: ${target.label}. Continue monitoring if at risk.`, icon: Shield, color: "text-emerald-600" });
    return recs;
  }

  if (level.severity >= 3) {
    recs.push({ title: "Urgent Oxygen Therapy", text: "Critical hypoxemia requires immediate intervention. Start with non-rebreather mask at 10-15 L/min. If no improvement within 5 minutes, consider NIV or intubation.", icon: AlertTriangle, color: "text-red-600" });
  }

  if (ageGroup === "copd") {
    recs.push({ title: "COPD Patient — Controlled O2", text: "Target SpO2 88-92% to avoid suppressing hypoxic drive. Use Venturi mask for precise FiO2 control. Monitor for CO2 retention (check ABG after 30-60 min).", icon: AlertTriangle, color: "text-amber-600" });
  }

  if (level.severity === 1) {
    recs.push({ title: "Mild Hypoxemia", text: "Consider nasal cannula at 1-2 L/min. Reassess SpO2 in 15-30 minutes. If SpO2 remains < target, increase flow or switch device.", icon: Activity, color: "text-amber-600" });
  }

  if (level.severity === 2) {
    recs.push({ title: "Moderate Hypoxemia", text: "Start with nasal cannula at 2-4 L/min or simple mask at 5-8 L/min. Reassess in 15 minutes. Titrate to target SpO2.", icon: AlertTriangle, color: "text-orange-600" });
  }

  recs.push({ title: "Monitoring", text: "Continuously monitor SpO2. Check ABG if SpO2 not improving or if patient has COPD/obesity/hypoventilation. Document flow rate and device used.", icon: Activity, color: "text-[var(--muted-foreground)]" });

  return recs;
}

export default function ToolHome() {
  const [weight, setWeight] = useState("");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [spo2, setSpo2] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("nasal-cannula");
  const [flowRate, setFlowRate] = useState("2");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const analyze = useCallback(() => {
    const spo2Val = parseInt(spo2) || 0;
    const weightVal = parseFloat(weight) || 70;
    if (spo2Val < 50 || spo2Val > 100) return;

    const device = DEVICES.find((d) => d.id === selectedDevice);
    const flow = parseFloat(flowRate) || 2;
    const fio2 = calculateFio2(device, flow);
    const requirement = getOxygenRequirement(spo2Val, ageGroup);
    const target = getTargetSpo2(ageGroup);
    const recs = getRecommendations(requirement, spo2Val, ageGroup, DEVICES);

    const allDevices = DEVICES.map((d) => {
      const suggestedFlow = calculateFlowForFio2(d, Math.min(90, target.max + 5));
      return {
        ...d,
        suggestedFlow,
        suggestedFio2: d.id === "venturi" ? null : calculateFio2(d, suggestedFlow || d.minFlow),
      };
    });

    setResult({
      spo2: spo2Val, weight: weightVal, ageGroup, target,
      device, flow, fio2, requirement, recs, allDevices,
      date: new Date().toLocaleString(),
    });
  }, [spo2, weight, ageGroup, selectedDevice, flowRate]);

  const reset = useCallback(() => {
    setWeight(""); setSpo2(""); setAgeGroup("adult");
    setSelectedDevice("nasal-cannula"); setFlowRate("2"); setResult(null);
  }, []);

  const buildReportText = useCallback(() => {
    if (!result) return "";
    const deviceComparisonLines = result.allDevices
      .map((d) => {
        if (d.suggestedFlow === null || d.suggestedFlow === undefined) {
          return `- ${d.name}: See colour-coded adapter chart for precise FiO2`;
        }
        return `- ${d.name}: ${d.suggestedFlow} L/min (${d.suggestedFio2 ? d.suggestedFio2 + "%" : "Precise"})`;
      })
      .join("\n");
    return `
OXYGEN REQUIREMENT REPORT
Generated: ${result.date}
================================
PATIENT PARAMETERS:
- Weight: ${result.weight} kg
- Age Group: ${result.ageGroup}
- Current SpO2: ${result.spo2}%
- Target SpO2: ${result.target.label}

OXYGEN STATUS:
- Classification: ${result.requirement.level}
- ${result.requirement.desc}

CURRENT DEVICE:
- Device: ${result.device.name}
- Flow Rate: ${result.flow} L/min
- Estimated FiO2: ${result.fio2 ? result.fio2 + "%" : "Precise (Venturi)"}

DEVICE COMPARISON:
${deviceComparisonLines}

RECOMMENDATIONS:
${result.recs.map((r) => `- ${r.title}: ${r.text}`).join("\n")}

================================
This calculator is for educational and informational purposes only.
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
    link.download = `Oxygen_Report_${result.spo2}SpO2_${result.date.replace(/[/,: ]/g, "-")}.txt`;
    link.click();
  }, [result, buildReportText]);

  const canAnalyze = spo2;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This calculator is for educational and informational purposes only. Clinical decisions should always be made by qualified healthcare professionals.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wind className="h-4 w-4" />
            Oxygen Therapy Planning
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Oxygen Requirement Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Calculate oxygen requirements, FiO2 delivery, and select appropriate oxygen delivery devices based on patient parameters and SpO2 targets.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="space-y-5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Patient Parameters</h2>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Weight (kg)</span>
                <input type="number" min="0.5" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">For dosing reference</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Current SpO2 (%)</span>
                <input type="number" min="50" max="100" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="94" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">Pulse oximetry reading</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Age Group</span>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                  <option value="adult">Adult</option>
                  <option value="child">Child (1-12 yrs)</option>
                  <option value="infant">Infant (0-1 yr)</option>
                  <option value="neonate">Neonate (0-28 days)</option>
                  <option value="copd">COPD / Chronic Lung Disease</option>
                </select>
                <span className="text-xs text-[var(--muted-foreground)]">Affects target SpO2 range</span>
              </label>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Delivery Device</h2>
              <label className="block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Device Type</span>
                <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                  {DEVICES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--foreground)]">Flow Rate (L/min)</span>
                <input type="number" min="1" max="60" value={flowRate} onChange={(e) => setFlowRate(e.target.value)} placeholder="2" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
                <span className="text-xs text-[var(--muted-foreground)]">{DEVICES.find((d) => d.id === selectedDevice)?.minFlow}-{DEVICES.find((d) => d.id === selectedDevice)?.maxFlow} L/min for {DEVICES.find((d) => d.id === selectedDevice)?.name}</span>
              </label>

              {selectedDevice === "venturi" && (
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Venturi Colour-Coded Adapters</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[var(--muted-foreground)]">
                          <th className="py-1 pr-2 font-semibold">Adapter Colour</th>
                          <th className="py-1 pr-2 font-semibold">FiO2</th>
                          <th className="py-1 font-semibold">Flow Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {VENTURI_FIO2.map((v) => (
                          <tr key={`${v.color}-${v.fio2}`} className="border-t border-[var(--border)]">
                            <td className="py-1.5 pr-2 capitalize text-[var(--foreground)]">{v.color}</td>
                            <td className="py-1.5 pr-2 font-semibold text-[var(--foreground)]">{v.fio2}%</td>
                            <td className="py-1.5 text-[var(--foreground)]">{v.flow} L/min</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={analyze} disabled={!canAnalyze} className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--anslation-ds-shadow-sm)] transition-all hover:shadow-[var(--anslation-ds-shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">Calculate</button>
              <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)] active:scale-[0.98]"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`rounded-lg border p-4 ${result.requirement.bg} ${result.requirement.border}`}>
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 mt-0.5 shrink-0 ${result.requirement.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${result.requirement.color}`}>{result.requirement.level}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{result.requirement.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Current Setup</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                      <span className="text-xs text-[var(--muted-foreground)]">SpO2</span>
                      <p className={`text-2xl font-black ${result.requirement.color}`}>{result.spo2}%</p>
                      <span className="text-xs text-[var(--muted-foreground)]">Target: {result.target.label}</span>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
                      <span className="text-xs text-[var(--muted-foreground)]">FiO2</span>
                      <p className="text-2xl font-black text-[var(--foreground)]">{result.fio2 ? `${result.fio2}%` : "Precise"}</p>
                      <span className="text-xs text-[var(--muted-foreground)]">{result.flow} L/min</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Device: {result.device.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{result.device.desc}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2"><span className="font-semibold text-[var(--foreground)]">Best for:</span> {result.device.bestFor}</p>
                </div>

                <div className="rounded-lg bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">All Devices Comparison</p>
                  <div className="space-y-2">
                    {result.allDevices.map((d) => (
                      <div key={d.id} className={`rounded-lg border px-3 py-2.5 text-sm ${d.id === result.device.id ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-[var(--card)]"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--foreground)]">{d.name}</span>
                          <span className="font-bold text-[var(--primary)]">{d.suggestedFlow} L/min {d.suggestedFio2 ? `(${d.suggestedFio2}%)` : ""}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{d.desc}</p>
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
                <Wind className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                <p className="text-lg font-semibold text-[var(--muted-foreground)]">Enter patient parameters to calculate oxygen requirements</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">Current SpO2 is required. Age group refines the target range; weight is optional and shown in the report for reference only.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Understanding Oxygen Therapy</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">FiO2 Estimation</p>
              <p>For low-flow devices, FiO2 is estimated based on flow rate and device characteristics. Nasal cannula delivers approximately 24% + 4% per L/min above 1 L/min. Actual FiO2 varies with patient respiratory pattern and tidal volume.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">COPD Considerations</p>
              <p>COPD patients may rely on hypoxic drive for ventilation. Target SpO2 88-92% to avoid suppressing respiratory drive. Use Venturi mask for precise FiO2 control. Always check ABG 30-60 minutes after initiating or changing oxygen therapy.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
