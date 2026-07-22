"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BatteryCharging,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Download,
  Gauge,
  Home,
  Info,
  Leaf,
  RefreshCw,
  Settings2,
  Sparkles,
  Sun,
  Target,
  Wallet,
  Zap,
} from "lucide-react";

const SYSTEM_PRESETS = [
  {
    label: "Balcony 800W",
    region: "Apartment",
    panelWattage: 400,
    panels: 2,
    sunHours: 4.2,
    systemLoss: 12,
    shadingLoss: 8,
    temperatureLoss: 7,
    inverterEfficiency: 94,
    selfUse: 90,
    tariff: 8,
    roofArea: 5,
  },
  {
    label: "Home 3kW",
    region: "Rooftop",
    panelWattage: 500,
    panels: 6,
    sunHours: 5.1,
    systemLoss: 10,
    shadingLoss: 4,
    temperatureLoss: 8,
    inverterEfficiency: 96,
    selfUse: 70,
    tariff: 8.5,
    roofArea: 18,
  },
  {
    label: "Home 5kW",
    region: "Rooftop",
    panelWattage: 500,
    panels: 10,
    sunHours: 5.4,
    systemLoss: 10,
    shadingLoss: 3,
    temperatureLoss: 9,
    inverterEfficiency: 96,
    selfUse: 65,
    tariff: 8.5,
    roofArea: 31,
  },
  {
    label: "Shop 10kW",
    region: "Commercial",
    panelWattage: 550,
    panels: 18,
    sunHours: 5.3,
    systemLoss: 11,
    shadingLoss: 5,
    temperatureLoss: 9,
    inverterEfficiency: 97,
    selfUse: 85,
    tariff: 10,
    roofArea: 60,
  },
  {
    label: "Portable 200W",
    region: "Travel",
    panelWattage: 200,
    panels: 1,
    sunHours: 4,
    systemLoss: 15,
    shadingLoss: 10,
    temperatureLoss: 6,
    inverterEfficiency: 90,
    selfUse: 100,
    tariff: 8,
    roofArea: 2,
  },
];

const MONTH_FACTORS = [
  ["Jan", 0.82],
  ["Feb", 0.9],
  ["Mar", 1.02],
  ["Apr", 1.1],
  ["May", 1.12],
  ["Jun", 0.95],
  ["Jul", 0.78],
  ["Aug", 0.82],
  ["Sep", 0.94],
  ["Oct", 1.02],
  ["Nov", 0.92],
  ["Dec", 0.8],
];

function clampNumber(value, min, max) {
  const next = Number(value);
  if (!Number.isFinite(next)) return min;
  return Math.min(max, Math.max(min, next));
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatInteger(value) {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-IN");
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "INR 0";
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function downloadFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function calculateSolar(inputs) {
  const panelWattage = clampNumber(inputs.panelWattage, 1, 1500);
  const panels = clampNumber(inputs.panels, 1, 1000);
  const sunHours = clampNumber(inputs.sunHours, 0.5, 12);
  const systemLoss = clampNumber(inputs.systemLoss, 0, 60);
  const shadingLoss = clampNumber(inputs.shadingLoss, 0, 80);
  const temperatureLoss = clampNumber(inputs.temperatureLoss, 0, 50);
  const inverterEfficiency = clampNumber(inputs.inverterEfficiency, 50, 100);
  const batteryEfficiency = clampNumber(inputs.batteryEfficiency, 50, 100);
  const selfUse = clampNumber(inputs.selfUse, 0, 100);
  const tariff = clampNumber(inputs.tariff, 0, 100);
  const roofArea = clampNumber(inputs.roofArea, 1, 5000);
  const co2Factor = clampNumber(inputs.co2Factor, 0, 2);

  const peakKw = (panelWattage * panels) / 1000;
  const rawDailyKwh = peakKw * sunHours;
  const combinedEfficiency =
    (1 - systemLoss / 100) *
    (1 - shadingLoss / 100) *
    (1 - temperatureLoss / 100) *
    (inverterEfficiency / 100);
  const dailyKwh = rawDailyKwh * combinedEfficiency;
  const monthlyKwh = dailyKwh * 30;
  const annualKwh = dailyKwh * 365;
  const usableSelfKwh = dailyKwh * (selfUse / 100);
  const exportedKwh = Math.max(0, dailyKwh - usableSelfKwh);
  const batteryUsableKwh = dailyKwh * (batteryEfficiency / 100);
  const monthlySavings = monthlyKwh * (selfUse / 100) * tariff;
  const annualSavings = monthlySavings * 12;
  const co2SavedKg = annualKwh * co2Factor;
  const panelArea = panels * 2.2;
  const areaFit = panelArea <= roofArea;
  const areaUse = Math.min(100, (panelArea / roofArea) * 100);
  const performanceRatio = combinedEfficiency * 100;
  const monthly = MONTH_FACTORS.map(([month, factor]) => ({
    month,
    value: dailyKwh * 30 * factor,
  }));

  let tone = "good";
  let label = "Strong output";
  let advice = "The system looks well balanced for daily production.";
  if (performanceRatio < 55 || shadingLoss > 25) {
    tone = "bad";
    label = "High loss risk";
    advice = "Losses are high. Check shade, wiring, panel angle, and inverter sizing.";
  } else if (performanceRatio < 70 || !areaFit) {
    tone = "warn";
    label = areaFit ? "Moderate output" : "Area tight";
    advice = areaFit
      ? "Output is usable, but reducing losses can noticeably improve generation."
      : "Panel area is above available roof area. Reduce panel count or increase area.";
  }

  return {
    panelWattage,
    panels,
    sunHours,
    systemLoss,
    shadingLoss,
    temperatureLoss,
    inverterEfficiency,
    batteryEfficiency,
    selfUse,
    tariff,
    roofArea,
    co2Factor,
    peakKw,
    rawDailyKwh,
    dailyKwh,
    monthlyKwh,
    annualKwh,
    usableSelfKwh,
    exportedKwh,
    batteryUsableKwh,
    monthlySavings,
    annualSavings,
    co2SavedKg,
    panelArea,
    areaFit,
    areaUse,
    performanceRatio,
    monthly,
    tone,
    label,
    advice,
  };
}

function MetricCard({ icon: Icon, label, value, detail, tone = "info" }) {
  const toneClass = {
    info: "bg-[var(--section-highlight)] text-[var(--primary)]",
    good: "tool-status-good",
    warn: "tool-status-warn",
    bad: "tool-status-bad",
  }[tone];

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 text-center sm:!p-5 xl:!p-6">
      <div className="grid min-w-0 gap-3">
        <span className={`mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">
            {label}
          </p>
          <p className="mt-1 whitespace-nowrap text-2xl font-black leading-tight text-[var(--foreground)] sm:text-[1.7rem]">
            {value}
          </p>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

function OutputBar({ label, value, max, suffix = "kWh" }) {
  const width = max ? Math.max(8, Math.round((value / max) * 100)) : 0;
  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <p className="break-words text-sm font-black text-[var(--foreground)]">{label}</p>
        <p className="whitespace-nowrap text-sm font-bold text-[var(--muted-foreground)]">{formatNumber(value, 1)} {suffix}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function MonthChart({ months }) {
  const max = Math.max(...months.map((item) => item.value), 1);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 sm:p-5">
      <div className="grid h-64 min-w-0 grid-cols-12 items-end gap-2">
        {months.map((item) => (
          <div key={item.month} className="grid min-w-0 gap-2 text-center">
            <div className="flex h-48 items-end justify-center rounded-lg bg-[var(--muted)] px-1">
              <div
                className="w-full rounded-t-lg bg-[linear-gradient(180deg,var(--primary),#0ea5e9)]"
                style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
                title={`${item.month}: ${formatNumber(item.value, 1)} kWh`}
              />
            </div>
            <span className="truncate text-[0.65rem] font-bold text-[var(--muted-foreground)]">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SolarPreview({ result }) {
  const activePanels = Math.min(24, Math.max(1, Math.round(result.panels)));
  const panelCells = Array.from({ length: activePanels }, (_, index) => index);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,var(--background),var(--section-highlight))] p-4 sm:p-6">
      <div className="mx-auto grid max-w-3xl gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,#e0f2fe,#f8fafc)] p-5 shadow-inner dark:bg-[linear-gradient(135deg,#0f172a,#111827)]">
          <div className="absolute right-5 top-5 grid h-16 w-16 place-items-center rounded-full bg-amber-300 text-amber-900 shadow-lg">
            <Sun className="h-8 w-8" />
          </div>
          <div className="grid min-h-72 place-items-center pt-12">
            <div className="grid w-full max-w-xl grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {panelCells.map((cell) => (
                <div key={cell} className="aspect-[4/3] rounded-lg border border-blue-400/50 bg-[linear-gradient(135deg,#1d4ed8,#0f172a)] p-1 shadow-sm">
                  <div className="grid h-full grid-cols-2 gap-1">
                    <span className="rounded-sm bg-white/15" />
                    <span className="rounded-sm bg-white/10" />
                    <span className="rounded-sm bg-white/10" />
                    <span className="rounded-sm bg-white/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-white/70 bg-white/80 p-4 text-center backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Estimated daily AC output</p>
            <p className="mt-1 text-3xl font-black text-[var(--foreground)]">{formatNumber(result.dailyKwh, 1)} kWh</p>
          </div>
        </div>

        <div className="tool-compact-grid">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Peak capacity</p>
            <p className="mt-2 text-xl font-black text-[var(--foreground)]">{formatNumber(result.peakKw, 2)} kW</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Performance ratio</p>
            <p className="mt-2 text-xl font-black text-[var(--foreground)]">{formatNumber(result.performanceRatio, 1)}%</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Panel area</p>
            <p className="mt-2 text-xl font-black text-[var(--foreground)]">{formatNumber(result.panelArea, 1)} sqm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolarPanelOutputEstimator() {
  const [inputs, setInputs] = useState({
    panelWattage: 500,
    panels: 6,
    sunHours: 5.1,
    systemLoss: 10,
    shadingLoss: 4,
    temperatureLoss: 8,
    inverterEfficiency: 96,
    batteryEfficiency: 92,
    selfUse: 70,
    tariff: 8.5,
    roofArea: 18,
    co2Factor: 0.82,
  });

  const result = useMemo(() => calculateSolar(inputs), [inputs]);
  const maxMonth = Math.max(...result.monthly.map((item) => item.value), 1);

  const updateInput = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (preset) => {
    setInputs((current) => ({
      ...current,
      panelWattage: preset.panelWattage,
      panels: preset.panels,
      sunHours: preset.sunHours,
      systemLoss: preset.systemLoss,
      shadingLoss: preset.shadingLoss,
      temperatureLoss: preset.temperatureLoss,
      inverterEfficiency: preset.inverterEfficiency,
      selfUse: preset.selfUse,
      tariff: preset.tariff,
      roofArea: preset.roofArea,
    }));
  };

  const resetSample = () => {
    applyPreset(SYSTEM_PRESETS[1]);
    setInputs((current) => ({ ...current, batteryEfficiency: 92, co2Factor: 0.82 }));
  };

  const summary = [
    "Solar Panel Output Estimator",
    `Panels: ${formatInteger(result.panels)} x ${formatInteger(result.panelWattage)} W`,
    `Peak capacity: ${formatNumber(result.peakKw, 2)} kW`,
    `Sun hours: ${formatNumber(result.sunHours, 1)} h/day`,
    `Daily AC output: ${formatNumber(result.dailyKwh, 2)} kWh`,
    `Monthly output: ${formatNumber(result.monthlyKwh, 1)} kWh`,
    `Annual output: ${formatNumber(result.annualKwh, 0)} kWh`,
    `Performance ratio: ${formatNumber(result.performanceRatio, 1)}%`,
    `Monthly savings: ${formatMoney(result.monthlySavings)}`,
    `Annual savings: ${formatMoney(result.annualSavings)}`,
    `CO2 saved: ${formatNumber(result.co2SavedKg, 0)} kg/year`,
    `Verdict: ${result.label} - ${result.advice}`,
  ].join("\n");

  const copySummary = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Panel wattage", result.panelWattage],
      ["Panel count", result.panels],
      ["Peak capacity kW", result.peakKw.toFixed(2)],
      ["Sun hours", result.sunHours],
      ["Daily output kWh", result.dailyKwh.toFixed(2)],
      ["Monthly output kWh", result.monthlyKwh.toFixed(2)],
      ["Annual output kWh", result.annualKwh.toFixed(2)],
      ["Performance ratio", result.performanceRatio.toFixed(2)],
      ["Self-use kWh daily", result.usableSelfKwh.toFixed(2)],
      ["Exported kWh daily", result.exportedKwh.toFixed(2)],
      ["Monthly savings INR", result.monthlySavings.toFixed(0)],
      ["Annual savings INR", result.annualSavings.toFixed(0)],
      ["CO2 saved kg/year", result.co2SavedKg.toFixed(0)],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile("solar-panel-output-estimator.csv", csv, "text/csv");
  };

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Solar production planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${result.tone === "good" ? "tool-status-good" : result.tone === "warn" ? "tool-status-warn" : "tool-status-bad"}`}>
              {result.tone === "bad" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {result.label}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Solar Panel Output Estimator
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            A practical electronics tool for managing solar panel output workflows efficiently with panel capacity, sun hours, system losses, self-use savings, battery output, and monthly generation estimates.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={Zap} label="Daily Output" value={`${formatNumber(result.dailyKwh, 1)} kWh`} detail={`${formatNumber(result.peakKw, 2)} kW peak system.`} tone={result.tone} />
          <MetricCard icon={CalendarDays} label="Monthly Output" value={`${formatNumber(result.monthlyKwh, 0)} kWh`} detail="Based on 30-day estimate." />
          <MetricCard icon={Wallet} label="Monthly Savings" value={formatMoney(result.monthlySavings)} detail={`${formatNumber(result.selfUse, 0)}% self-use assumption.`} tone="good" />
          <MetricCard icon={Leaf} label="CO2 Offset" value={`${formatNumber(result.co2SavedKg, 0)} kg`} detail="Estimated yearly grid carbon offset." tone="good" />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Sun className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Panel Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Enter panel wattage, panel count, and usable peak sun hours.</p>
              </div>
            </div>

            <div className="tool-form-grid min-w-0">
              <Field label="Panel wattage">
                <input
                  type="number"
                  min="1"
                  max="1500"
                  value={inputs.panelWattage}
                  onChange={(event) => updateInput("panelWattage", clampNumber(event.target.value, 1, 1500))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Number of panels">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={inputs.panels}
                  onChange={(event) => updateInput("panels", clampNumber(event.target.value, 1, 1000))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Peak sun hours / day">
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.1"
                  value={inputs.sunHours}
                  onChange={(event) => updateInput("sunHours", clampNumber(event.target.value, 0.5, 12))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Settings2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Loss Factors</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Model real-world shade, heat, wiring, inverter, and battery losses.</p>
              </div>
            </div>

            <div className="tool-form-grid min-w-0">
              <Field label="System loss %">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={inputs.systemLoss}
                  onChange={(event) => updateInput("systemLoss", clampNumber(event.target.value, 0, 60))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Shading loss %">
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={inputs.shadingLoss}
                  onChange={(event) => updateInput("shadingLoss", clampNumber(event.target.value, 0, 80))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Temperature loss %">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={inputs.temperatureLoss}
                  onChange={(event) => updateInput("temperatureLoss", clampNumber(event.target.value, 0, 50))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Inverter efficiency %">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={inputs.inverterEfficiency}
                  onChange={(event) => updateInput("inverterEfficiency", clampNumber(event.target.value, 50, 100))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Target className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Quick Presets</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Start from common residential, shop, and portable setups.</p>
              </div>
            </div>

            <div className="tool-tab-grid min-w-0">
              {SYSTEM_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left text-sm font-black text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--section-highlight)]"
                >
                  <span className="block truncate">{preset.label}</span>
                  <span className="mt-1 block truncate text-xs font-semibold text-[var(--muted-foreground)]">{preset.region}</span>
                </button>
              ))}
            </div>
          </article>
        </div>

        <article className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Gauge className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Output Result</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{result.advice}</p>
                </div>
              </div>
            </div>
            <div className="tool-action-grid min-w-0 lg:min-w-[28rem]">
              <button type="button" className="btn-primary" onClick={copySummary}>
                <Clipboard className="h-4 w-4" />
                Copy
              </button>
              <button type="button" className="btn-secondary" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button type="button" className="btn-secondary" onClick={resetSample}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_0.9fr]">
            <SolarPreview result={result} />

            <div className="grid min-w-0 content-start gap-4">
              <div className={`rounded-xl border p-4 ${result.tone === "good" ? "tool-callout-good" : result.tone === "warn" ? "tool-callout-warn" : "tool-callout-bad"}`}>
                <div className="flex min-w-0 items-start gap-3">
                  {result.tone === "bad" ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 tool-text-bad" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 tool-text-good" />}
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-[var(--foreground)]">{result.label}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Performance ratio is {formatNumber(result.performanceRatio, 1)}%. Raw DC estimate is {formatNumber(result.rawDailyKwh, 1)} kWh/day before losses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="tool-compact-grid min-w-0">
                <article className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <BatteryCharging className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Battery usable</p>
                  <p className="mt-1 whitespace-nowrap text-xl font-black text-[var(--foreground)]">{formatNumber(result.batteryUsableKwh, 1)} kWh</p>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{formatNumber(result.batteryEfficiency, 0)}% storage efficiency.</p>
                </article>

                <article className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <Home className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Roof area fit</p>
                  <p className="mt-1 whitespace-nowrap text-xl font-black text-[var(--foreground)]">{result.areaFit ? "Fits" : "Tight"}</p>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{formatNumber(result.panelArea, 1)} sqm used of {formatNumber(result.roofArea, 1)} sqm.</p>
                </article>
              </div>

              <div className="tool-form-grid min-w-0">
                <Field label="Battery efficiency %">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={inputs.batteryEfficiency}
                    onChange={(event) => updateInput("batteryEfficiency", clampNumber(event.target.value, 50, 100))}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </Field>
                <Field label="Self-use %">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputs.selfUse}
                    onChange={(event) => updateInput("selfUse", clampNumber(event.target.value, 0, 100))}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </Field>
                <Field label="Tariff INR / kWh">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputs.tariff}
                    onChange={(event) => updateInput("tariff", clampNumber(event.target.value, 0, 100))}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </Field>
                <Field label="Available area sqm">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={inputs.roofArea}
                    onChange={(event) => updateInput("roofArea", clampNumber(event.target.value, 1, 5000))}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-[var(--foreground)]">Formula used</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Daily output = panel kW x sun hours x combined loss efficiency.
                    </p>
                    <p className="mt-2 rounded-lg bg-[var(--muted)] px-3 py-2 font-mono text-xs font-bold text-[var(--foreground)]">
                      {formatNumber(result.peakKw, 2)} kW x {formatNumber(result.sunHours, 1)} h x {formatNumber(result.performanceRatio, 1)}% = {formatNumber(result.dailyKwh, 2)} kWh/day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Monthly Output Curve</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Seasonal estimate using simple monthly sun variation factors.</p>
              </div>
            </div>
            <MonthChart months={result.monthly} />
          </article>

          <aside className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Energy Split</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">See usable home energy, exported energy, and best output months.</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              <OutputBar label="Self-used daily energy" value={result.usableSelfKwh} max={result.dailyKwh} />
              <OutputBar label="Exported daily energy" value={result.exportedKwh} max={result.dailyKwh} />
              <OutputBar label="Best month estimate" value={maxMonth} max={maxMonth} />
              <div className="rounded-xl border tool-callout-good p-4">
                <Leaf className="h-5 w-5 tool-text-good" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">Annual impact</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  {formatNumber(result.annualKwh, 0)} kWh/year can offset about {formatNumber(result.co2SavedKg, 0)} kg CO2 and save around {formatMoney(result.annualSavings)} yearly.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
