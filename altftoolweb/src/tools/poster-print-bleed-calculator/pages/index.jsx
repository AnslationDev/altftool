"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Crop, RotateCcw } from "lucide-react";

import { BLEED_PRESETS_MM, computePosterSetup } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SIZE_PRESETS = [
  { id: "a3", label: "A3", w: 297, h: 420, unit: "mm" },
  { id: "a2", label: "A2", w: 420, h: 594, unit: "mm" },
  { id: "a1", label: "A1", w: 594, h: 841, unit: "mm" },
  { id: "a0", label: "A0", w: 841, h: 1189, unit: "mm" },
  { id: "rollup", label: "Roll-up 850x2000", w: 850, h: 2000, unit: "mm" },
  { id: "us2436", label: "US 24x36 in", w: 24, h: 36, unit: "in" },
];

const BLEED_CHOICES = [
  { id: "none", label: "No bleed" },
  { id: "iso3", label: "3 mm (ISO)" },
  { id: "us125", label: "1/8 in (US)" },
  { id: "large5", label: "5 mm" },
  { id: "wide10", label: "10 mm" },
];

const DEFAULTS = {
  width: "594",
  height: "841",
  unit: "mm",
  bleed: "3",
  safeMargin: "10",
  distance: "2",
  distanceUnit: "m",
  ppiMode: "auto",
  ppi: "150",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const len = (value, unit) =>
  Number.isFinite(value) ? `${NUM2.format(value)} ${unit}` : DASH;

export default function ToolHome() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [bleed, setBleed] = useState(DEFAULTS.bleed);
  const [safeMargin, setSafeMargin] = useState(DEFAULTS.safeMargin);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [distanceUnit, setDistanceUnit] = useState(DEFAULTS.distanceUnit);
  const [ppiMode, setPpiMode] = useState(DEFAULTS.ppiMode);
  const [ppi, setPpi] = useState(DEFAULTS.ppi);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePosterSetup({
        trimWidth: toNumber(width),
        trimHeight: toNumber(height),
        unit,
        bleed: toNumber(bleed),
        safeMargin: toNumber(safeMargin),
        viewingDistance: toNumber(distance),
        distanceUnit,
        ppiOverride: ppiMode === "manual" ? toNumber(ppi) : null,
      }),
    [width, height, unit, bleed, safeMargin, distance, distanceUnit, ppiMode, ppi],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (preset) => {
    setUnit(preset.unit);
    setWidth(String(preset.w));
    setHeight(String(preset.h));
    if (preset.unit === "in") {
      setBleed("0.125");
      setSafeMargin("0.5");
    } else {
      setBleed("3");
      setSafeMargin("10");
    }
  };

  const applyBleedPreset = (id) => {
    const mm = BLEED_PRESETS_MM[id];
    if (!Number.isFinite(mm)) return;
    if (unit === "mm") setBleed(String(mm));
    else if (unit === "cm") setBleed(String(mm / 10));
    else setBleed(String(Number((mm / 25.4).toFixed(4))));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Poster Print Bleed Calculator",
      `Trim size: ${len(result.trimWidth, unit)} x ${len(result.trimHeight, unit)}`,
      `Document size with bleed: ${len(result.docWidth, unit)} x ${len(result.docHeight, unit)}`,
      `Bleed per edge: ${len(result.bleedPerEdge, unit)}`,
      `Safe area: ${len(result.safeWidth, unit)} x ${len(result.safeHeight, unit)}`,
      `Viewing distance: ${NUM2.format(result.distanceM)} m (${NUM1.format(result.distanceFt)} ft)`,
      `Export resolution: ${INT.format(result.exportPpi)} PPI (${result.ppiSource})`,
      `Pixel dimensions: ${INT.format(result.pixelWidth)} x ${INT.format(result.pixelHeight)} px`,
      `Flat CMYK 8-bit file: ~${NUM1.format(result.fileSizeCmykMb)} MB`,
      ...result.textSizes.map(
        (tier) =>
          `${tier.label}: cap height ${NUM1.format(tier.capHeightMm)} mm (~${NUM1.format(tier.fontSizePt)} pt)`,
      ),
    ].join("\n");
  }, [hasError, result, unit]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setUnit(DEFAULTS.unit);
    setBleed(DEFAULTS.bleed);
    setSafeMargin(DEFAULTS.safeMargin);
    setDistance(DEFAULTS.distance);
    setDistanceUnit(DEFAULTS.distanceUnit);
    setPpiMode(DEFAULTS.ppiMode);
    setPpi(DEFAULTS.ppi);
    setCopied(false);
  };

  const docLabel = hasError
    ? DASH
    : `${NUM2.format(result.docWidth)} x ${NUM2.format(result.docHeight)} ${unit}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Crop className="h-4 w-4" aria-hidden="true" />
          Print &amp; prepress
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Poster Print Bleed Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a finished poster size into the artboard you should actually set up: document size
          with bleed, safe area, export resolution for the viewing distance, and the smallest text
          that will still read from where people stand.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-width">
              Finished width (trim)
            </label>
            <input
              id="poster-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-height">
              Finished height (trim)
            </label>
            <input
              id="poster-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-unit">
              Size unit
            </label>
            <select
              id="poster-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="mm">Millimetres</option>
              <option value="cm">Centimetres</option>
              <option value="in">Inches</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-bleed">
              Bleed per edge ({unit})
            </label>
            <input
              id="poster-bleed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={bleed}
              onChange={(event) => setBleed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-safe">
              Safe margin inside trim ({unit})
            </label>
            <input
              id="poster-safe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={safeMargin}
              onChange={(event) => setSafeMargin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-distance">
              Typical viewing distance
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="poster-distance"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
              />
              <select
                aria-label="Viewing distance unit"
                className={`${INPUT_CLASS} w-28`}
                value={distanceUnit}
                onChange={(event) => setDistanceUnit(event.target.value)}
              >
                <option value="m">metres</option>
                <option value="cm">cm</option>
                <option value="ft">feet</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-ppi-mode">
              Export resolution
            </label>
            <select
              id="poster-ppi-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ppiMode}
              onChange={(event) => setPpiMode(event.target.value)}
            >
              <option value="auto">Auto from viewing distance</option>
              <option value="manual">Set PPI myself</option>
            </select>
          </div>
          {ppiMode === "manual" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="poster-ppi">
                PPI at final size
              </label>
              <input
                id="poster-ppi"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="10"
                value={ppi}
                onChange={(event) => setPpi(event.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {BLEED_CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => applyBleedPreset(choice.id)}
              className={CHIP_BTN}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Set up your document at
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {docLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the artboard size."
                : `${NUM2.format(result.bleedPerEdge)} ${unit} bleed on every edge, then trim to ${NUM2.format(result.trimWidth)} x ${NUM2.format(result.trimHeight)} ${unit}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy poster setup result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Trim (finished) size",
              hasError ? DASH : `${len(result.trimWidth, unit)} x ${len(result.trimHeight, unit)}`,
            ],
            [
              "Safe area (keep text inside)",
              hasError ? DASH : `${len(result.safeWidth, unit)} x ${len(result.safeHeight, unit)}`,
            ],
            [
              "Live area kept after margins",
              hasError ? DASH : PCT.format(result.liveAreaShare),
            ],
            [
              "Export resolution",
              hasError ? DASH : `${INT.format(result.exportPpi)} PPI - ${result.ppiSource}`,
            ],
            [
              "Pixel dimensions of the artboard",
              hasError
                ? DASH
                : `${INT.format(result.pixelWidth)} x ${INT.format(result.pixelHeight)} px (${NUM1.format(result.megapixels)} MP)`,
            ],
            [
              "Flattened file size (CMYK 8-bit)",
              hasError ? DASH : `~${NUM1.format(result.fileSizeCmykMb)} MB`,
            ],
            [
              "Flattened file size (RGB 8-bit)",
              hasError ? DASH : `~${NUM1.format(result.fileSizeRgbMb)} MB`,
            ],
            [
              "Resolution floor for 20/20 vision",
              hasError ? DASH : `${INT.format(result.acuityFloorPpi)} PPI at this distance`,
            ],
            [
              "Printed area",
              hasError ? DASH : `${NUM2.format(result.trimAreaSqM)} sq m`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Minimum text sizes at{" "}
          {hasError ? DASH : `${NUM2.format(result.distanceM)} m (${NUM1.format(result.distanceFt)} ft)`}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Based on the sign-industry rule of one inch of capital-letter height per ten feet of
          viewing distance for headlines, with smaller tiers for text people step in to read.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Text role
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Cap height
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Font size
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.textSizes.map((tier) => (
                  <tr key={tier.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{tier.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM1.format(tier.capHeightMm)} mm
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(tier.fontSizePt)} pt
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Font sizes assume a cap height of about 70% of the point size, which is typical for text
        faces; condensed and display faces differ. Always confirm bleed, safe margin and colour
        profile against your printer&apos;s own spec sheet before sending artwork.
      </p>
    </main>
  );
}
