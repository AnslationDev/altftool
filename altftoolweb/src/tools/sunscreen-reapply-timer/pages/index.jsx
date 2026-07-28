"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  BODY_REGIONS,
  WATER_RESISTANCE_MINUTES,
  buildSunscreenSchedule,
  formatDuration,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ACTIVITY_LABEL = {
  dry: "Dry — shade, walking, sitting out",
  sweating: "Sweating heavily — sport, hiking, hot work",
  water: "In and out of water — pool, sea, watersports",
};

const WATER_RESISTANCE_LABEL = {
  0: "No water-resistance claim",
  40: "Water resistant (40 minutes)",
  80: "Water resistant (80 minutes)",
};

const DEFAULTS = {
  outdoorStart: "10:00",
  exposureMinutes: "240",
  activity: "dry",
  waterResistanceMinutes: 80,
  regions: BODY_REGIONS.map((region) => region.key),
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [outdoorStart, setOutdoorStart] = useState(DEFAULTS.outdoorStart);
  const [exposureMinutes, setExposureMinutes] = useState(DEFAULTS.exposureMinutes);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [waterResistanceMinutes, setWaterResistanceMinutes] = useState(DEFAULTS.waterResistanceMinutes);
  const [regions, setRegions] = useState(DEFAULTS.regions);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSunscreenSchedule({
        outdoorStart,
        exposureMinutes: toNumber(exposureMinutes),
        activity,
        waterResistanceMinutes,
        regions,
      }),
    [outdoorStart, exposureMinutes, activity, waterResistanceMinutes, regions],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const toggleRegion = (key) => {
    setRegions((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sunscreen reapplication plan",
      `Outdoors ${result.outdoorStartAt}–${result.finishAt} (${formatDuration(result.exposureMinutes)})`,
      `Reapply every ${formatDuration(result.intervalMinutes)}`,
      "",
      ...result.applications.map((application) => `${application.clock} — ${application.label}`),
      "",
      `Amount each time: ${NUM.format(result.mlPerApplication)} ml (${result.teaspoonsPerApplication} tsp)`,
      `Total for the session: ${NUM.format(result.totalMl)} ml`,
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
    setOutdoorStart(DEFAULTS.outdoorStart);
    setExposureMinutes(DEFAULTS.exposureMinutes);
    setActivity(DEFAULTS.activity);
    setWaterResistanceMinutes(DEFAULTS.waterResistanceMinutes);
    setRegions(DEFAULTS.regions);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Skin care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sunscreen Reapply Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns the label directions — apply 15 minutes before you go out, reapply at least every two
          hours, and follow the water-resistance rating once you are wet — into clock times for today.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-start">
              Time you go outdoors
            </label>
            <input
              id="sr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={outdoorStart}
              onChange={(event) => setOutdoorStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-exposure">
              Time outdoors (minutes)
            </label>
            <input
              id="sr-exposure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="15"
              value={exposureMinutes}
              onChange={(event) => setExposureMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-activity">
              What you will be doing
            </label>
            <select
              id="sr-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {ACTIVITY_LABEL[level]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-water">
              Water resistance on the bottle
            </label>
            <select
              id="sr-water"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(waterResistanceMinutes)}
              onChange={(event) => setWaterResistanceMinutes(Number(event.target.value))}
            >
              {WATER_RESISTANCE_MINUTES.map((minutes) => (
                <option key={minutes} value={String(minutes)}>
                  {WATER_RESISTANCE_LABEL[minutes]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Areas you are covering</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {BODY_REGIONS.map((region) => (
              <label
                key={region.key}
                htmlFor={`sr-region-${region.key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`sr-region-${region.key}`}
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={regions.includes(region.key)}
                  onChange={() => toggleRegion(region.key)}
                />
                <span className="font-medium">{region.label}</span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">{region.teaspoons} tsp</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Reapply every
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : formatDuration(result.intervalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : result.intervalReason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy sunscreen reapplication schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
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
          {[
            ["First application", hasError ? dash : `${result.firstApplyAt} (15 min before you step out)`],
            ["Outdoors from", hasError ? dash : `${result.outdoorStartAt} to ${result.finishAt}`],
            ["Applications needed", hasError ? dash : String(result.applicationCount)],
            [
              "Amount each time",
              hasError ? dash : `${NUM.format(result.mlPerApplication)} ml (${result.teaspoonsPerApplication} tsp)`,
            ],
            [
              "Total for the session",
              hasError ? dash : `${NUM.format(result.totalMl)} ml (${NUM.format(result.totalTeaspoons)} tsp)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.needsImmediateReapply && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This sunscreen carries no water-resistance claim, so its label requires reapplying
            immediately after every swim or heavy sweat — the times below are only a minimum.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Today&apos;s schedule</h2>
          <ol className="mt-3 space-y-3">
            {result.applications.map((application) => (
              <li
                key={application.minutesFromFirst}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
              >
                <span className="min-w-[4.5rem] text-lg font-semibold text-[var(--primary)]">
                  {application.clock}
                </span>
                <span className="text-sm font-semibold">{application.label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{application.offsetLabel}</span>
                <span className="w-full text-sm text-[var(--muted-foreground)]">{application.detail}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Reapply off-schedule too: straight after towel drying, after a long swim, or if you have
            wiped or rubbed an area. Sunscreen is the last layer of defence — shade, clothing, a hat
            and sunglasses do more.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Intervals follow standard sunscreen label directions and are not tailored
        to your skin type, medication, altitude or the day&apos;s UV index. Speak to a doctor or
        dermatologist about photosensitising medication, a history of skin cancer, or any changing mole.
      </p>
    </main>
  );
}
