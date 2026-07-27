"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";
import {
  CARE_LEVELS,
  GRASS_TYPES,
  MOWER_PRESETS,
  SEASONS,
  SHADE_LEVELS,
  planMowing,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : "—");
const int = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  grassTypeId: "kentucky-bluegrass",
  season: "spring",
  careId: "normal",
  shadeId: "sun",
  unit: "metric",
  cutHeight: "",
  lawnArea: "200",
  mowerWidth: "40",
  mowSpeed: "3",
  seasonWeeks: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none`;
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [grassTypeId, setGrassTypeId] = useState(DEFAULTS.grassTypeId);
  const [season, setSeason] = useState(DEFAULTS.season);
  const [careId, setCareId] = useState(DEFAULTS.careId);
  const [shadeId, setShadeId] = useState(DEFAULTS.shadeId);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [cutHeight, setCutHeight] = useState(DEFAULTS.cutHeight);
  const [lawnArea, setLawnArea] = useState(DEFAULTS.lawnArea);
  const [mowerWidth, setMowerWidth] = useState(DEFAULTS.mowerWidth);
  const [mowSpeed, setMowSpeed] = useState(DEFAULTS.mowSpeed);
  const [seasonWeeks, setSeasonWeeks] = useState(DEFAULTS.seasonWeeks);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planMowing({
        grassTypeId,
        season,
        careId,
        shadeId,
        unit,
        cutHeight: toNumber(cutHeight),
        lawnArea: toNumber(lawnArea),
        mowerWidth: toNumber(mowerWidth),
        mowSpeed: toNumber(mowSpeed),
        seasonWeeks: toNumber(seasonWeeks),
      }),
    [grassTypeId, season, careId, shadeId, unit, cutHeight, lawnArea, mowerWidth, mowSpeed, seasonWeeks],
  );

  const hasError = Boolean(result.error);
  const isMetric = unit === "metric";
  const heightUnit = isMetric ? "cm" : "in";
  const areaUnit = isMetric ? "m²" : "sq ft";
  const widthUnit = isMetric ? "cm" : "in";
  const speedUnit = isMetric ? "km/h" : "mph";

  const switchUnit = (next) => {
    if (next === unit) return;
    setUnit(next);
    setCutHeight("");
    if (next === "imperial") {
      setLawnArea("2000");
      setMowerWidth("21");
      setMowSpeed("2");
    } else {
      setLawnArea(DEFAULTS.lawnArea);
      setMowerWidth(DEFAULTS.mowerWidth);
      setMowSpeed(DEFAULTS.mowSpeed);
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lawn Mowing Schedule Planner",
      `Grass: ${result.grassLabel} (${result.grassSeasonType}-season)`,
      `Cutting height: ${one(result.cutHeight)} ${result.heightUnit}`,
      `Mow when it reaches: ${one(result.mowAtHeight)} ${result.heightUnit} (one-third rule)`,
      `Expected growth: ${one(result.weeklyGrowth)} ${result.heightUnit} per week`,
      result.dormant
        ? "Schedule: dormant — no regular mowing needed this season"
        : `Mow every ${one(result.intervalDays)} days (${one(result.mowsPerMonth)} cuts a month)`,
      `Time per cut: ${int(result.timePerMowMinutes)} minutes`,
      `Cuts this season: ${int(result.mowsInSeason)} (${one(result.seasonHours)} hours total)`,
    ].join("\n");
  }, [hasError, result]);

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
    setGrassTypeId(DEFAULTS.grassTypeId);
    setSeason(DEFAULTS.season);
    setCareId(DEFAULTS.careId);
    setShadeId(DEFAULTS.shadeId);
    setUnit(DEFAULTS.unit);
    setCutHeight(DEFAULTS.cutHeight);
    setLawnArea(DEFAULTS.lawnArea);
    setMowerWidth(DEFAULTS.mowerWidth);
    setMowSpeed(DEFAULTS.mowSpeed);
    setSeasonWeeks(DEFAULTS.seasonWeeks);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Cutting height", "—"],
        ["Recommended range", "—"],
        ["Mow when grass reaches", "—"],
        ["Growth allowed between cuts", "—"],
        ["Expected growth", "—"],
        ["Cuts per month", "—"],
        ["Time per cut", "—"],
        ["Cuts this season", "—"],
        ["Total mowing time", "—"],
      ]
    : [
        ["Cutting height", `${one(result.cutHeight)} ${result.heightUnit}${result.heightIsCustom ? " (your setting)" : " (recommended)"}`],
        ["Recommended range", `${one(result.rangeMin)}–${one(result.rangeMax)} ${result.heightUnit}`],
        ["Mow when grass reaches", `${one(result.mowAtHeight)} ${result.heightUnit}`],
        ["Growth allowed between cuts", `${one(result.allowance)} ${result.heightUnit}`],
        ["Expected growth", `${one(result.weeklyGrowth)} ${result.heightUnit} per week`],
        ["Cuts per month", result.dormant ? "0 (dormant)" : one(result.mowsPerMonth)],
        ["Time per cut", `${int(result.timePerMowMinutes)} min`],
        ["Cuts this season", int(result.mowsInSeason)],
        ["Total mowing time", `${one(result.seasonHours)} hours`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Lawn Mowing Schedule Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Built on the one-third rule: pick your grass, season and conditions and see how often to
          mow, how high to set the blade and how many hours the season will cost you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => switchUnit("metric")} className={isMetric ? CHIP_ON : CHIP_BTN} aria-pressed={isMetric}>
            Metric
          </button>
          <button type="button" onClick={() => switchUnit("imperial")} className={!isMetric ? CHIP_ON : CHIP_BTN} aria-pressed={!isMetric}>
            Imperial
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-grass">
              Grass type
            </label>
            <select id="mow-grass" className={`mt-2 ${SELECT_CLASS}`} value={grassTypeId} onChange={(e) => setGrassTypeId(e.target.value)}>
              {GRASS_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-season">
              Season
            </label>
            <select id="mow-season" className={`mt-2 ${SELECT_CLASS}`} value={season} onChange={(e) => setSeason(e.target.value)}>
              {SEASONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-care">
              Feeding and watering
            </label>
            <select id="mow-care" className={`mt-2 ${SELECT_CLASS}`} value={careId} onChange={(e) => setCareId(e.target.value)}>
              {CARE_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-shade">
              Light level
            </label>
            <select id="mow-shade" className={`mt-2 ${SELECT_CLASS}`} value={shadeId} onChange={(e) => setShadeId(e.target.value)}>
              {SHADE_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-height">
              Cutting height ({heightUnit}) — blank for recommended
            </label>
            <input id="mow-height" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" placeholder="Auto" value={cutHeight} onChange={(e) => setCutHeight(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-area">
              Lawn area ({areaUnit})
            </label>
            <input id="mow-area" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={lawnArea} onChange={(e) => setLawnArea(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-width">
              Mower cutting width ({widthUnit})
            </label>
            <input id="mow-width" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={mowerWidth} onChange={(e) => setMowerWidth(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mow-speed">
              Mowing speed ({speedUnit})
            </label>
            <input id="mow-speed" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={mowSpeed} onChange={(e) => setMowSpeed(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mow-weeks">
              Length of the growing season (weeks)
            </label>
            <input id="mow-weeks" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" max="52" step="1" value={seasonWeeks} onChange={(e) => setSeasonWeeks(e.target.value)} />
          </div>
        </div>

        {isMetric && (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-[var(--foreground)]">Common mower widths</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOWER_PRESETS.map((preset) => (
                <button key={preset.id} type="button" className={toNumber(mowerWidth) === preset.widthCm ? CHIP_ON : CHIP_BTN} onClick={() => setMowerWidth(String(preset.widthCm))}>
                  {preset.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Mow every</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.dormant ? "Dormant" : `${one(result.intervalDays)} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the schedule."
                : result.dormant
                  ? "Growth has all but stopped — tidy up only when the lawn needs it."
                  : `Blade at ${one(result.cutHeight)} ${result.heightUnit}, cut once it reaches ${one(result.mowAtHeight)} ${result.heightUnit}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy mowing schedule" className={GHOST_BTN} disabled={hasError}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.belowRange && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            That height is below the recommended range for {result.grassLabel}. Cutting this low
            weakens the roots and lets weeds in.
          </p>
        )}
        {!hasError && result.aboveRange && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            That height is above the recommended range for {result.grassLabel}. It is fine for a
            relaxed look, but the sward will get open and stemmy.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Growth rates are typical values, not a forecast — a warm wet week can double them and a
        drought can stop growth entirely. Mow on the actual blade height, not the calendar, and keep
        the blade sharp so the tips are cut rather than torn.
      </p>
    </main>
  );
}
