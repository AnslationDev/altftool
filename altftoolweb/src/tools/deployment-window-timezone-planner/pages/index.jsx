"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Rocket, RotateCcw } from "lucide-react";

import { REGION_PRESETS, planDeploymentWindow } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_REGIONS = ["us-east", "eu-central", "india"];
const DASH = "—";

const hh = (hour) => `${String(hour).padStart(2, "0")}:00`;

export default function ToolHome() {
  const [regionIds, setRegionIds] = useState(DEFAULT_REGIONS);
  const [avoidStartHour, setAvoidStartHour] = useState("8");
  const [avoidEndHour, setAvoidEndHour] = useState("22");
  const [windowLengthHours, setWindowLengthHours] = useState("2");
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (String(value).trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      planDeploymentWindow({
        regionIds,
        avoidStartHour: asNumber(avoidStartHour),
        avoidEndHour: asNumber(avoidEndHour),
        windowLengthHours: asNumber(windowLengthHours),
      }),
    [regionIds, avoidStartHour, avoidEndHour, windowLengthHours],
  );

  const hasError = Boolean(result.error);

  const toggleRegion = (id) => {
    setRegionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const rec = result.recommendation;
    return [
      "Deployment window plan",
      `Regions: ${result.regions.join("; ")}`,
      `Avoid locally: ${hh(Number(avoidStartHour))}-${hh(Number(avoidEndHour) % 24)}`,
      `Recommended window: ${hh(rec.startUtcHour)}-${hh(rec.endUtcHour)} UTC (${rec.lengthHours} h)${rec.fullyClear ? " — clear in every region" : ` — overlaps ${rec.blockedRegionHours} blocked region-hour(s)`}`,
      ...rec.localTimes.map((t) => `  ${t.label}: ${t.start}-${t.end} local`),
      `Fully clear UTC hours in the day: ${result.totalClearHours}`,
    ].join("\n");
  }, [hasError, result, avoidStartHour, avoidEndHour]);

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
    setRegionIds(DEFAULT_REGIONS);
    setAvoidStartHour("8");
    setAvoidEndHour("22");
    setWindowLengthHours("2");
    setCopied(false);
  };

  const selectedRegions = REGION_PRESETS.filter((r) => regionIds.includes(r.id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Release management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Deployment Window Timezone Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the regions you serve and the local hours to avoid (business plus peak traffic). The
          planner scans all 24 UTC start hours and recommends the release window that stays out of
          everyone&apos;s busy time — or overlaps it least when the map never fully clears.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Regions served</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {REGION_PRESETS.map((region) => (
              <label
                key={region.id}
                htmlFor={`dw-region-${region.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`dw-region-${region.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={regionIds.includes(region.id)}
                  onChange={() => toggleRegion(region.id)}
                />
                {region.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dw-start">
              Avoid from (local hour)
            </label>
            <select
              id="dw-start"
              className={`mt-2 ${INPUT_CLASS}`}
              value={avoidStartHour}
              onChange={(event) => setAvoidStartHour(event.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {hh(i)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dw-end">
              Avoid until (local hour, exclusive)
            </label>
            <select
              id="dw-end"
              className={`mt-2 ${INPUT_CLASS}`}
              value={avoidEndHour}
              onChange={(event) => setAvoidEndHour(event.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {hh(i)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dw-length">
              Window length (hours)
            </label>
            <input
              id="dw-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={windowLengthHours}
              onChange={(event) => setWindowLengthHours(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended window (UTC)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${hh(result.recommendation.startUtcHour)}–${hh(result.recommendation.endUtcHour)}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a recommendation."
                : result.recommendation.fullyClear
                  ? "Outside the avoid hours in every selected region."
                  : `No fully clear ${result.recommendation.lengthHours}-hour window exists — this start overlaps the fewest blocked region-hours (${result.recommendation.blockedRegionHours}).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the deployment window plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? null : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {result.recommendation.localTimes.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{entry.label}</dt>
                <dd className="text-right font-semibold">
                  {entry.start}–{entry.end} local
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Fully clear UTC hours per day</dt>
              <dd className="text-right font-semibold">{result.totalClearHours}</dd>
            </div>
          </dl>
        )}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hour-by-hour map (UTC day)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    UTC
                  </th>
                  {selectedRegions.map((region) => (
                    <th key={region.id} scope="col" className="py-2 pr-3 font-semibold">
                      {region.label.split(" (")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.matrix.map((row) => (
                  <tr
                    key={row.utcHour}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.blockedCount === 0 ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-1.5 pr-3 font-mono font-semibold">{hh(row.utcHour)}</td>
                    {row.entries.map((entry) => (
                      <td
                        key={entry.id}
                        className={`py-1.5 pr-3 font-mono ${
                          entry.blocked
                            ? "text-[var(--danger)]"
                            : "font-semibold text-[var(--success)]"
                        }`}
                      >
                        {entry.localTime}
                        {entry.blocked ? " ✕" : " ✓"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Offsets are standard-time values; regions with daylight saving (US, UK, EU, Sydney) shift
        one hour for part of the year, so re-check windows near DST transitions. Traffic patterns
        matter more than clocks — validate the quiet window against your own analytics before a
        high-risk release.
      </p>
    </main>
  );
}
