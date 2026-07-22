"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  Gauge,
  Home,
  Maximize2,
  Monitor,
  MoveHorizontal,
  Plus,
  RefreshCw,
  Ruler,
  Sparkles,
  Target,
  Tv,
  Video,
} from "lucide-react";

const ASPECT_RATIOS = {
  "16:9": { label: "16:9 Standard TV", w: 16, h: 9 },
  "21:9": { label: "21:9 Ultrawide", w: 21, h: 9 },
  "4:3": { label: "4:3 Classic", w: 4, h: 3 },
};

const RESOLUTIONS = {
  hd: {
    label: "720p HD",
    minMultiplier: 2.4,
    idealMultiplier: 2.8,
    maxMultiplier: 3.4,
    note: "Sit farther back because pixel structure is easier to notice.",
  },
  fullhd: {
    label: "1080p Full HD",
    minMultiplier: 1.6,
    idealMultiplier: 2.0,
    maxMultiplier: 2.5,
    note: "Balanced for older TVs, sports, cable boxes, and streaming.",
  },
  fourk: {
    label: "4K UHD",
    minMultiplier: 1.0,
    idealMultiplier: 1.25,
    maxMultiplier: 1.6,
    note: "Allows closer seating while keeping the image sharp.",
  },
  eightk: {
    label: "8K UHD",
    minMultiplier: 0.75,
    idealMultiplier: 1.0,
    maxMultiplier: 1.25,
    note: "Designed for very close, highly immersive seating.",
  },
};

const USE_CASES = {
  cinema: {
    label: "Cinema / Movies",
    fov: 40,
    note: "Immersive movie-night setup with a wider field of view.",
  },
  mixed: {
    label: "Mixed Streaming",
    fov: 36,
    note: "Good everyday balance for OTT, shows, sports, and YouTube.",
  },
  sports: {
    label: "Sports / TV Channels",
    fov: 32,
    note: "Comfortable distance for fast movement and full-screen scanning.",
  },
  gaming: {
    label: "Gaming",
    fov: 42,
    note: "Closer, more responsive setup for console gaming.",
  },
  bedroom: {
    label: "Bedroom Casual",
    fov: 30,
    note: "Relaxed viewing from bed or a longer room depth.",
  },
};

const TV_PRESETS = [32, 43, 50, 55, 65, 75, 85, 98];

function diagonalToSize(diagonal, ratioKey) {
  const ratio = ASPECT_RATIOS[ratioKey] || ASPECT_RATIOS["16:9"];
  const divisor = Math.sqrt(ratio.w ** 2 + ratio.h ** 2);
  return {
    width: (diagonal * ratio.w) / divisor,
    height: (diagonal * ratio.h) / divisor,
  };
}

function toDistanceInches(value, unit) {
  const safe = Number(value) || 0;
  return unit === "m" ? safe * 39.3701 : safe * 12;
}

function formatDistance(inches, unit) {
  if (!Number.isFinite(inches)) return unit === "m" ? "0.0 m" : "0.0 ft";
  if (unit === "m") return `${(inches / 39.3701).toFixed(2)} m`;
  return `${(inches / 12).toFixed(1)} ft`;
}

function formatInches(value) {
  return `${Number(value || 0).toFixed(1)} in`;
}

function fovDistance(widthInches, fov) {
  return widthInches / (2 * Math.tan((fov * Math.PI) / 360));
}

function fovAtDistance(widthInches, distanceInches) {
  if (!distanceInches) return 0;
  return (2 * Math.atan(widthInches / (2 * distanceInches)) * 180) / Math.PI;
}

function qualityTone(value, min, max) {
  if (value < min * 0.92) return "too-close";
  if (value > max * 1.08) return "too-far";
  if (value < min || value > max) return "near-edge";
  return "ideal";
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildSummary(inputs, results) {
  return [
    "# TV Viewing Distance Guide",
    `Screen: ${inputs.screenSize} inch ${ASPECT_RATIOS[inputs.aspectRatio].label}`,
    `Resolution: ${RESOLUTIONS[inputs.resolution].label}`,
    `Use case: ${USE_CASES[inputs.useCase].label}`,
    `Ideal distance: ${formatDistance(results.idealDistance, inputs.unit)}`,
    `Comfort range: ${formatDistance(results.minDistance, inputs.unit)} - ${formatDistance(results.maxDistance, inputs.unit)}`,
    `Current distance: ${formatDistance(results.currentDistance, inputs.unit)}`,
    `Current field of view: ${results.currentFov.toFixed(1)} deg`,
    `Screen width: ${formatInches(results.screen.width)}`,
    `Screen height: ${formatInches(results.screen.height)}`,
    `Room fit: ${results.roomFitLabel}`,
  ].join("\n");
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

function RangeBar({ current, min, ideal, max, unit }) {
  const scaleMax = Math.max(max * 1.25, current * 1.1, ideal * 1.2, 1);
  const currentLeft = Math.min(100, Math.max(0, (current / scaleMax) * 100));
  const minLeft = Math.min(100, Math.max(0, (min / scaleMax) * 100));
  const maxLeft = Math.min(100, Math.max(0, (max / scaleMax) * 100));
  const idealLeft = Math.min(100, Math.max(0, (ideal / scaleMax) * 100));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <p className="text-sm font-black text-[var(--foreground)]">Comfort Range</p>
        <p className="text-xs font-bold text-[var(--muted-foreground)]">{formatDistance(min, unit)} - {formatDistance(max, unit)}</p>
      </div>
      <div className="relative h-14">
        <div className="absolute left-0 right-0 top-6 h-2 rounded-full bg-[var(--muted)]" />
        <div
          className="absolute top-6 h-2 rounded-full bg-[var(--primary)]"
          style={{ left: `${minLeft}%`, width: `${Math.max(3, maxLeft - minLeft)}%` }}
        />
        <div className="absolute top-3 h-8 w-1 rounded-full bg-emerald-500" style={{ left: `${idealLeft}%` }} />
        <div className="absolute top-1 h-12 w-1.5 rounded-full bg-rose-500 shadow" style={{ left: `${currentLeft}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs font-bold text-[var(--muted-foreground)]">
        <span>Min {formatDistance(min, unit)}</span>
        <span className="text-center tool-text-good">Ideal {formatDistance(ideal, unit)}</span>
        <span className="text-right">Max {formatDistance(max, unit)}</span>
      </div>
    </div>
  );
}

function PresetButton({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-xl border px-4 py-3 text-sm font-black transition ${active ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}
    >
      {value}"
    </button>
  );
}

export default function TvViewingDistanceGuide() {
  const [inputs, setInputs] = useState({
    screenSize: 55,
    aspectRatio: "16:9",
    resolution: "fourk",
    useCase: "mixed",
    unit: "ft",
    roomDepth: 11,
    currentDistance: 7,
    eyeLevel: 42,
    tvCenterHeight: 44,
  });

  const results = useMemo(() => {
    const screenSize = Math.max(20, Math.min(140, Number(inputs.screenSize) || 55));
    const screen = diagonalToSize(screenSize, inputs.aspectRatio);
    const resolution = RESOLUTIONS[inputs.resolution];
    const useCase = USE_CASES[inputs.useCase];
    const minDistance = screenSize * resolution.minMultiplier;
    const clarityIdeal = screenSize * resolution.idealMultiplier;
    const maxDistance = screenSize * resolution.maxMultiplier;
    const immersiveDistance = fovDistance(screen.width, useCase.fov);
    const idealDistance = clarityIdeal * 0.48 + immersiveDistance * 0.52;
    const currentDistance = toDistanceInches(inputs.currentDistance, inputs.unit);
    const roomDepth = toDistanceInches(inputs.roomDepth, inputs.unit);
    const currentFov = fovAtDistance(screen.width, currentDistance);
    const tone = qualityTone(currentDistance, minDistance, maxDistance);
    const roomFit = roomDepth >= minDistance;
    const mountDelta = Math.abs((Number(inputs.tvCenterHeight) || 0) - (Number(inputs.eyeLevel) || 0));
    const recommendedTvSize = Math.max(24, Math.round((currentDistance / resolution.idealMultiplier) / 5) * 5);
    const widthPercent = Math.min(100, Math.max(22, (screen.width / 86) * 100));
    const heightPercent = Math.min(75, Math.max(12, (screen.height / 49) * 75));
    const statusLabel =
      tone === "too-close"
        ? "Too close"
        : tone === "too-far"
          ? "Too far"
          : tone === "near-edge"
            ? "Near edge"
            : "Ideal zone";
    const statusDetail =
      tone === "too-close"
        ? "Move seating back or choose a smaller screen."
        : tone === "too-far"
          ? "Move seating closer or choose a bigger screen."
          : tone === "near-edge"
            ? "Comfortable, but adjust slightly for best immersion."
            : "Distance is inside the recommended comfort range.";
    const roomFitLabel = roomFit
      ? `Room depth supports at least ${formatDistance(minDistance, inputs.unit)} viewing.`
      : `Room is shorter than the minimum ${formatDistance(minDistance, inputs.unit)} recommendation.`;

    return {
      screen,
      minDistance,
      maxDistance,
      idealDistance,
      immersiveDistance,
      clarityIdeal,
      currentDistance,
      roomDepth,
      currentFov,
      tone,
      statusLabel,
      statusDetail,
      roomFit,
      roomFitLabel,
      mountDelta,
      recommendedTvSize,
      widthPercent,
      heightPercent,
    };
  }, [inputs]);

  const updateInput = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const copySummary = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildSummary(inputs, results));
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Screen Size", "Resolution", "Use Case", "Ideal Distance", "Min Distance", "Max Distance", "Current Distance", "Current FOV", "Room Fit"],
      [
        `${inputs.screenSize} inch`,
        RESOLUTIONS[inputs.resolution].label,
        USE_CASES[inputs.useCase].label,
        formatDistance(results.idealDistance, inputs.unit),
        formatDistance(results.minDistance, inputs.unit),
        formatDistance(results.maxDistance, inputs.unit),
        formatDistance(results.currentDistance, inputs.unit),
        `${results.currentFov.toFixed(1)} deg`,
        results.roomFit ? "Yes" : "No",
      ],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile("tv-viewing-distance-guide.csv", csv, "text/csv");
  };

  const resetSample = () => {
    setInputs({
      screenSize: 55,
      aspectRatio: "16:9",
      resolution: "fourk",
      useCase: "mixed",
      unit: "ft",
      roomDepth: 11,
      currentDistance: 7,
      eyeLevel: 42,
      tvCenterHeight: 44,
    });
  };

  const tone = results.tone === "ideal" ? "good" : results.tone === "near-edge" ? "warn" : "bad";
  const mountTone = results.mountDelta > 10 ? "warn" : "good";

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Home theater planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${results.tone === "ideal" ? "tool-status-good" : "tool-status-warn"}`}>
              {results.tone === "ideal" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              {results.statusLabel}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            TV Viewing Distance Guide
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Find the right sofa distance for your TV by screen size, resolution, room depth, viewing style, current seating distance, and field-of-view comfort.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={Target} label="Ideal Distance" value={formatDistance(results.idealDistance, inputs.unit)} detail={`${USE_CASES[inputs.useCase].fov} deg target field of view.`} tone="good" />
          <MetricCard icon={MoveHorizontal} label="Comfort Range" value={`${formatDistance(results.minDistance, inputs.unit)} - ${formatDistance(results.maxDistance, inputs.unit)}`} detail={RESOLUTIONS[inputs.resolution].note} />
          <MetricCard icon={Eye} label="Current FOV" value={`${results.currentFov.toFixed(1)} deg`} detail={results.statusDetail} tone={tone} />
          <MetricCard icon={Monitor} label="Screen Size" value={`${inputs.screenSize}"`} detail={`${formatInches(results.screen.width)} wide x ${formatInches(results.screen.height)} tall.`} />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Tv className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">TV Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{USE_CASES[inputs.useCase].note}</p>
              </div>
            </div>

            <div className="tool-tab-grid mb-5 min-w-0">
              {TV_PRESETS.map((size) => (
                <PresetButton key={size} value={size} active={Number(inputs.screenSize) === size} onClick={(value) => updateInput("screenSize", value)} />
              ))}
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Screen size (inches)</span>
                <input
                  type="number"
                  min="20"
                  max="140"
                  value={inputs.screenSize}
                  onChange={(event) => updateInput("screenSize", Math.max(20, Math.min(140, Number(event.target.value) || 20)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Aspect ratio</span>
                <select
                  value={inputs.aspectRatio}
                  onChange={(event) => updateInput("aspectRatio", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(ASPECT_RATIOS).map(([key, ratio]) => (
                    <option key={key} value={key}>{ratio.label}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Resolution</span>
                <select
                  value={inputs.resolution}
                  onChange={(event) => updateInput("resolution", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(RESOLUTIONS).map(([key, resolution]) => (
                    <option key={key} value={key}>{resolution.label}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Viewing style</span>
                <select
                  value={inputs.useCase}
                  onChange={(event) => updateInput("useCase", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(USE_CASES).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Home className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Room & Seating</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Compare current sofa distance with the recommended viewing zone.</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Distance unit</span>
                <select
                  value={inputs.unit}
                  onChange={(event) => updateInput("unit", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="ft">Feet</option>
                  <option value="m">Meters</option>
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Current sofa distance</span>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={inputs.currentDistance}
                  onChange={(event) => updateInput("currentDistance", Math.max(1, Number(event.target.value) || 1))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Room depth</span>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={inputs.roomDepth}
                  onChange={(event) => updateInput("roomDepth", Math.max(1, Number(event.target.value) || 1))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Eye level (inches)</span>
                <input
                  type="number"
                  min="20"
                  max="80"
                  value={inputs.eyeLevel}
                  onChange={(event) => updateInput("eyeLevel", Math.max(20, Math.min(80, Number(event.target.value) || 20)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">TV center height (inches)</span>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={inputs.tvCenterHeight}
                  onChange={(event) => updateInput("tvCenterHeight", Math.max(20, Math.min(90, Number(event.target.value) || 20)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={copySummary}>
                <Clipboard className="h-4 w-4" />
                Copy Guide
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
          </article>
        </div>

        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Gauge className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Viewing Result</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{results.statusDetail}</p>
              </div>
            </div>

            <RangeBar
              current={results.currentDistance}
              min={results.minDistance}
              ideal={results.idealDistance}
              max={results.maxDistance}
              unit={inputs.unit}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={`rounded-xl border p-4 ${results.tone === "ideal" ? "tool-callout-good" : results.tone === "near-edge" ? "tool-callout-warn" : "tool-callout-bad"}`}>
                <Eye className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">{results.statusLabel}</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{results.statusDetail}</p>
              </div>
              <div className={`rounded-xl border p-4 ${results.roomFit ? "tool-callout-good" : "tool-callout-bad"}`}>
                <Home className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">Room Fit</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{results.roomFitLabel}</p>
              </div>
              <div className={`rounded-xl border p-4 ${mountTone === "good" ? "tool-callout-good" : "tool-callout-warn"}`}>
                <Ruler className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">Mount Height</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Center is {results.mountDelta.toFixed(0)} in from eye level. {results.mountDelta > 10 ? "Tilt or lower the TV if possible." : "Height looks comfortable."}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <Maximize2 className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">Size Suggestion</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  At your current distance, about {results.recommendedTvSize}" works well for {RESOLUTIONS[inputs.resolution].label}.
                </p>
              </div>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Video className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Room Preview</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">A simple visual read of screen, sofa, and distance position.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,var(--background),var(--section-highlight))] p-4 sm:p-6">
              <div className="mx-auto max-w-2xl">
                <div className="mx-auto flex h-52 items-center justify-center rounded-xl border border-[var(--border)] tool-preview-frame p-3 shadow-lg sm:h-64">
                  <div
                    className="grid place-items-center rounded-md tool-preview-display shadow-inner"
                    style={{ width: `${results.widthPercent}%`, height: `${results.heightPercent}%` }}
                  >
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">
                      {inputs.screenSize}" {RESOLUTIONS[inputs.resolution].label}
                    </span>
                  </div>
                </div>

                <div className="relative mx-auto mt-6 h-28 max-w-xl">
                  <div className="absolute left-0 right-0 top-8 h-2 rounded-full bg-[var(--muted)]" />
                  <div className="absolute left-0 top-8 h-2 rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, (results.idealDistance / Math.max(results.roomDepth, results.idealDistance)) * 100)}%` }} />
                  <div className="absolute top-2 -translate-x-1/2 text-center" style={{ left: `${Math.min(96, Math.max(5, (results.currentDistance / Math.max(results.roomDepth, results.currentDistance)) * 100))}%` }}>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] shadow-sm">
                      <Armchair className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <p className="mt-2 whitespace-nowrap text-xs font-black text-[var(--foreground)]">
                      Sofa {formatDistance(results.currentDistance, inputs.unit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-3">
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <Target className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">FOV Target</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{USE_CASES[inputs.useCase].fov} deg for {USE_CASES[inputs.useCase].label}.</p>
            </article>
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <Monitor className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">Screen Footprint</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{formatInches(results.screen.width)} wide and {formatInches(results.screen.height)} tall.</p>
            </article>
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <Plus className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">Upgrade Hint</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">For closer seating, 4K or 8K usually gives cleaner detail than HD/FHD.</p>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
