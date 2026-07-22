"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  Gauge,
  Info,
  Laptop,
  Maximize2,
  Monitor,
  RefreshCw,
  Ruler,
  Sparkles,
  Target,
} from "lucide-react";

const RESOLUTION_PRESETS = [
  { label: "24in FHD", diagonal: 24, width: 1920, height: 1080, type: "Desktop" },
  { label: "27in QHD", diagonal: 27, width: 2560, height: 1440, type: "Desktop" },
  { label: "27in 4K", diagonal: 27, width: 3840, height: 2160, type: "Creator" },
  { label: "32in 4K", diagonal: 32, width: 3840, height: 2160, type: "Productivity" },
  { label: "34in UWQHD", diagonal: 34, width: 3440, height: 1440, type: "Ultrawide" },
  { label: "49in DQHD", diagonal: 49, width: 5120, height: 1440, type: "Super ultrawide" },
  { label: "13.3in Retina", diagonal: 13.3, width: 2560, height: 1600, type: "Laptop" },
  { label: "16in Retina", diagonal: 16, width: 3456, height: 2234, type: "Laptop" },
];

const VIEWING_MODES = {
  desk: { label: "Desk work", distance: 24, ideal: 110, note: "Comfortable for normal monitor distance and daily work." },
  design: { label: "Design / code", distance: 22, ideal: 135, note: "Sharper text, cleaner UI edges, and easier pixel checking." },
  gaming: { label: "Gaming", distance: 30, ideal: 95, note: "Balanced sharpness at a slightly relaxed viewing distance." },
  laptop: { label: "Laptop close", distance: 18, ideal: 160, note: "Higher density helps when the screen is closer to your eyes." },
};

function clampNumber(value, min, max) {
  const next = Number(value);
  if (!Number.isFinite(next)) return min;
  return Math.min(max, Math.max(min, next));
}

function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
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

function calculateProfile(inputs) {
  const width = clampNumber(inputs.width, 1, 20000);
  const height = clampNumber(inputs.height, 1, 20000);
  const diagonal = clampNumber(inputs.diagonal, 1, 300);
  const viewingDistance = clampNumber(inputs.viewingDistance, 4, 120);
  const diagonalPixels = Math.sqrt(width ** 2 + height ** 2);
  const ppi = diagonalPixels / diagonal;
  const pitchMm = 25.4 / ppi;
  const megapixels = (width * height) / 1_000_000;
  const ratioGcd = gcd(width, height);
  const aspectRatio = `${Math.round(width / ratioGcd)}:${Math.round(height / ratioGcd)}`;
  const retinaDistance = 3438 / ppi;
  const pixelsPerDegree = (viewingDistance * ppi * Math.PI) / 180;
  const densityScore = Math.min(100, Math.round((ppi / VIEWING_MODES[inputs.mode].ideal) * 85));
  const meetsMode = ppi >= VIEWING_MODES[inputs.mode].ideal;

  let classLabel = "Standard";
  let tone = "info";
  let advice = "Good for office work, browsing, and everyday productivity.";
  if (ppi < 90) {
    classLabel = "Soft";
    tone = "warn";
    advice = "Text may look soft up close. Sit farther away or choose more pixels.";
  } else if (ppi >= 90 && ppi < 130) {
    classLabel = "Comfort";
    tone = "good";
    advice = "Balanced monitor density for normal desk distance.";
  } else if (ppi >= 130 && ppi < 200) {
    classLabel = "Sharp";
    tone = "good";
    advice = "Great clarity for code, design, spreadsheets, and mixed work.";
  } else {
    classLabel = "Ultra sharp";
    tone = "good";
    advice = "Very high density. Scaling may be needed for comfortable text.";
  }

  return {
    width,
    height,
    diagonal,
    viewingDistance,
    diagonalPixels,
    ppi,
    pitchMm,
    megapixels,
    aspectRatio,
    retinaDistance,
    pixelsPerDegree,
    densityScore,
    classLabel,
    tone,
    advice,
    meetsMode,
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

function DensityBar({ value, ideal }) {
  const score = Math.min(100, Math.max(0, Math.round((value / 240) * 100)));
  const idealScore = Math.min(100, Math.max(0, Math.round((ideal / 240) * 100)));

  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <p className="break-words text-sm font-black text-[var(--foreground)]">Density scale</p>
        <p className="whitespace-nowrap text-sm font-bold text-[var(--muted-foreground)]">Ideal {formatNumber(ideal, 0)} PPI</p>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${score}%` }} />
        <span className="absolute top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-emerald-500" style={{ left: `${idealScore}%` }} />
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs font-bold text-[var(--muted-foreground)]">
        <span>Soft</span>
        <span>Comfort</span>
        <span>Sharp</span>
      </div>
    </div>
  );
}

function MonitorPreview({ profile }) {
  const ratio = profile.width / profile.height;
  const boxWidth = ratio >= 2.2 ? "92%" : ratio >= 1.7 ? "82%" : "70%";
  const boxHeight = ratio >= 2.2 ? "35%" : ratio >= 1.7 ? "48%" : "58%";

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,var(--background),var(--section-highlight))] p-4 sm:p-6">
      <div className="mx-auto grid max-w-3xl place-items-center gap-5">
        <div className="grid h-56 w-full place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-inner sm:h-72">
          <div className="grid place-items-center rounded-xl tool-preview-display shadow-2xl" style={{ width: boxWidth, height: boxHeight }}>
            <div className="text-center">
              <p className="text-lg font-black text-white">{formatInteger(profile.width)} x {formatInteger(profile.height)}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/75">{formatNumber(profile.diagonal, 1)} in diagonal</p>
            </div>
          </div>
        </div>
        <div className="tool-compact-grid w-full">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Aspect ratio</p>
            <p className="mt-2 text-xl font-black text-[var(--foreground)]">{profile.aspectRatio}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Pixels</p>
            <p className="mt-2 text-xl font-black text-[var(--foreground)]">{formatNumber(profile.megapixels, 2)} MP</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Pixel pitch</p>
            <p className="mt-2 text-xl font-black text-[var(--foreground)]">{formatNumber(profile.pitchMm, 3)} mm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonitorPpiCalculator() {
  const [inputs, setInputs] = useState({
    diagonal: 27,
    width: 2560,
    height: 1440,
    mode: "design",
    viewingDistance: 24,
  });

  const profile = useMemo(() => calculateProfile(inputs), [inputs]);
  const mode = VIEWING_MODES[inputs.mode];
  const verdictTone = profile.meetsMode ? profile.tone : "warn";
  const verdictText = profile.meetsMode ? "Great fit" : "Below target";

  const updateInput = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (preset) => {
    setInputs((current) => ({
      ...current,
      diagonal: preset.diagonal,
      width: preset.width,
      height: preset.height,
      mode: preset.type === "Laptop" ? "laptop" : current.mode,
      viewingDistance: preset.type === "Laptop" ? 18 : current.viewingDistance,
    }));
  };

  const resetSample = () => {
    setInputs({
      diagonal: 27,
      width: 2560,
      height: 1440,
      mode: "design",
      viewingDistance: 24,
    });
  };

  const summary = [
    "Monitor PPI Calculator",
    `Resolution: ${formatInteger(profile.width)} x ${formatInteger(profile.height)}`,
    `Diagonal: ${formatNumber(profile.diagonal, 1)} inches`,
    `PPI: ${formatNumber(profile.ppi, 1)}`,
    `Pixel pitch: ${formatNumber(profile.pitchMm, 3)} mm`,
    `Aspect ratio: ${profile.aspectRatio}`,
    `Total pixels: ${formatNumber(profile.megapixels, 2)} MP`,
    `Retina distance: ${formatNumber(profile.retinaDistance, 1)} in`,
    `Viewing mode: ${mode.label}`,
    `Verdict: ${verdictText} - ${profile.advice}`,
  ].join("\n");

  const copySummary = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Width", profile.width],
      ["Height", profile.height],
      ["Diagonal inches", profile.diagonal],
      ["PPI", profile.ppi.toFixed(2)],
      ["Pixel pitch mm", profile.pitchMm.toFixed(4)],
      ["Aspect ratio", profile.aspectRatio],
      ["Megapixels", profile.megapixels.toFixed(2)],
      ["Retina distance inches", profile.retinaDistance.toFixed(2)],
      ["Pixels per degree", profile.pixelsPerDegree.toFixed(0)],
      ["Viewing mode", mode.label],
      ["Verdict", verdictText],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile("monitor-ppi-calculator.csv", csv, "text/csv");
  };

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Display density planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${profile.meetsMode ? "tool-status-good" : "tool-status-warn"}`}>
              {profile.meetsMode ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              {verdictText}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Monitor PPI Calculator
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Calculate monitor ppi values quickly with diagonal size, pixel resolution, viewing distance, pixel pitch, aspect ratio, retina distance, and sharpness guidance.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={Gauge} label="Pixel Density" value={`${formatNumber(profile.ppi, 1)} PPI`} detail={`${profile.classLabel} density class.`} tone={verdictTone} />
          <MetricCard icon={Ruler} label="Pixel Pitch" value={`${formatNumber(profile.pitchMm, 3)} mm`} detail="Smaller pitch means sharper pixels." />
          <MetricCard icon={Eye} label="Retina Distance" value={`${formatNumber(profile.retinaDistance, 1)} in`} detail="Approx distance where pixels blend for 20/20 vision." tone="good" />
          <MetricCard icon={Maximize2} label="Total Pixels" value={`${formatNumber(profile.megapixels, 2)} MP`} detail={`${profile.aspectRatio} aspect ratio.`} />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Monitor className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Monitor Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Enter diagonal size and native pixel resolution.</p>
              </div>
            </div>

            <div className="tool-form-grid min-w-0">
              <Field label="Diagonal size (inches)">
                <input
                  type="number"
                  min="1"
                  max="300"
                  step="0.1"
                  value={inputs.diagonal}
                  onChange={(event) => updateInput("diagonal", clampNumber(event.target.value, 1, 300))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Width pixels">
                <input
                  type="number"
                  min="1"
                  max="20000"
                  value={inputs.width}
                  onChange={(event) => updateInput("width", clampNumber(event.target.value, 1, 20000))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Height pixels">
                <input
                  type="number"
                  min="1"
                  max="20000"
                  value={inputs.height}
                  onChange={(event) => updateInput("height", clampNumber(event.target.value, 1, 20000))}
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
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Viewing Goal</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{mode.note}</p>
              </div>
            </div>

            <div className="tool-form-grid min-w-0">
              <Field label="Viewing mode">
                <select
                  value={inputs.mode}
                  onChange={(event) => updateInput("mode", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(VIEWING_MODES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Viewing distance (inches)">
                <input
                  type="number"
                  min="4"
                  max="120"
                  value={inputs.viewingDistance}
                  onChange={(event) => updateInput("viewingDistance", clampNumber(event.target.value, 4, 120))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
            </div>

            <DensityBar value={profile.ppi} ideal={mode.ideal} />
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Laptop className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Quick Presets</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Use common laptop, monitor, and ultrawide setups.</p>
              </div>
            </div>

            <div className="tool-tab-grid min-w-0">
              {RESOLUTION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left text-sm font-black text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--section-highlight)]"
                >
                  <span className="block truncate">{preset.label}</span>
                  <span className="mt-1 block truncate text-xs font-semibold text-[var(--muted-foreground)]">
                    {preset.width} x {preset.height}
                  </span>
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
                  <Calculator className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">PPI Result</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{profile.advice}</p>
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
            <MonitorPreview profile={profile} />

            <div className="grid min-w-0 content-start gap-4">
              <div className={`rounded-xl border p-4 ${profile.meetsMode ? "tool-callout-good" : "tool-callout-warn"}`}>
                <div className="flex min-w-0 items-start gap-3">
                  {profile.meetsMode ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 tool-text-good" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 tool-text-warn" />}
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-[var(--foreground)]">{verdictText} for {mode.label}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Target is around {formatNumber(mode.ideal, 0)} PPI. Your monitor is {formatNumber(profile.ppi, 1)} PPI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="tool-compact-grid min-w-0">
                <article className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <Eye className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Pixels / degree</p>
                  <p className="mt-1 whitespace-nowrap text-xl font-black text-[var(--foreground)]">{formatNumber(profile.pixelsPerDegree, 0)}</p>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">At {formatNumber(profile.viewingDistance, 0)} in viewing distance.</p>
                </article>

                <article className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <Gauge className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Sharpness score</p>
                  <p className="mt-1 whitespace-nowrap text-xl font-black text-[var(--foreground)]">{profile.densityScore}/100</p>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Relative to selected goal.</p>
                </article>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-[var(--foreground)]">Formula used</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      PPI = sqrt(width pixels squared + height pixels squared) / diagonal inches.
                    </p>
                    <p className="mt-2 rounded-lg bg-[var(--muted)] px-3 py-2 font-mono text-xs font-bold text-[var(--foreground)]">
                      sqrt({formatInteger(profile.width)}^2 + {formatInteger(profile.height)}^2) / {formatNumber(profile.diagonal, 1)} = {formatNumber(profile.ppi, 2)} PPI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
