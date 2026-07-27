"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Hand, Info, RotateCcw } from "lucide-react";

import {
  buildGestureBriefing,
  buildTripBriefing,
  GESTURES,
  REGIONS,
  RISK_LEVELS,
} from "../lib";

const DEFAULT_REGIONS = ["greece", "middle-east"];
const DEFAULT_GESTURE = "thumbs-up";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const RISK_STYLE = {
  offensive: "bg-[var(--danger-soft)] text-[var(--danger)]",
  caution: "bg-[var(--muted)] text-[var(--foreground)]",
  safe: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_REGIONS);
  const [gestureId, setGestureId] = useState(DEFAULT_GESTURE);
  const [copied, setCopied] = useState(false);

  const briefing = useMemo(() => buildTripBriefing(selected), [selected]);
  const gestureBriefing = useMemo(() => buildGestureBriefing(gestureId), [gestureId]);

  const hasError = Boolean(briefing.error);

  const flagged = hasError ? [] : briefing.entries.filter((entry) => entry.risk !== "safe");

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Hand gesture warnings",
      `Destinations: ${briefing.regions.map((region) => region.label).join("; ")}`,
      `Gestures to watch: ${briefing.avoidCount} of ${briefing.gestureCount}`,
      `Outright offensive: ${briefing.counts.offensive}`,
      `Means something else: ${briefing.counts.caution}`,
      "",
    ];
    for (const entry of flagged) {
      lines.push(`${RISK_LEVELS[entry.risk].label.toUpperCase()} — ${entry.name}: ${entry.meaning}`);
      lines.push(`  Instead: ${entry.alternative}`);
    }
    return lines.join("\n");
  }, [hasError, briefing, flagged]);

  const toggleRegion = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

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
    setSelected(DEFAULT_REGIONS);
    setGestureId(DEFAULT_GESTURE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Hand className="h-4 w-4" aria-hidden="true" />
          Travel etiquette
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Hand Gesture Meaning Warning Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the places on your itinerary and see which everyday gestures change meaning or turn
          insulting there, with a safer way to say the same thing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Where are you going?
          </legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Regions are grouped by shared gesture conventions, not by geography alone.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {REGIONS.map((region) => {
              const checked = selected.includes(region.id);
              return (
                <label
                  key={region.id}
                  htmlFor={`region-${region.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`region-${region.id}`}
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleRegion(region.id)}
                  />
                  <span>
                    <span className="block font-semibold text-[var(--foreground)]">
                      {region.label}
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {region.countries}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {briefing.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Gestures to watch
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : briefing.avoidCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Tick at least one destination above."
                : `of ${briefing.gestureCount} common gestures in this guide`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the gesture warning list to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset destinations and gesture lookup"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Destinations selected", hasError ? DASH : String(briefing.regions.length)],
            ["Outright offensive there", hasError ? DASH : String(briefing.counts.offensive)],
            ["Means something else there", hasError ? DASH : String(briefing.counts.caution)],
            ["Reads as you intend", hasError ? DASH : String(briefing.counts.safe)],
            [
              "Gesture risk index",
              hasError ? DASH : `${NUM.format(briefing.riskIndexPercent)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">What to avoid, and what to do instead</h2>
          {flagged.length === 0 ? (
            <p className="mt-3 rounded-xl bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
              Nothing in this guide is flagged for the destinations you picked, beyond the gestures
              that are rude everywhere.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {flagged.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${RISK_STYLE[entry.risk]}`}
                    >
                      {entry.risk === "offensive" ? (
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {RISK_LEVELS[entry.risk].label}
                    </span>
                    <h3 className="text-base font-semibold">{entry.name}</h3>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">{entry.howItLooks}</p>
                  <p className="mt-2 text-sm leading-6">{entry.meaning}</p>
                  {entry.flaggedIn.length > 0 && (
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      Flagged in: {entry.flaggedIn.join(", ")}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-6">
                    <span className="font-semibold">Instead: </span>
                    {entry.alternative}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Look up one gesture worldwide</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="gesture-picker">
            Gesture
          </label>
          <select
            id="gesture-picker"
            className={`mt-2 ${INPUT_CLASS}`}
            value={gestureId}
            onChange={(event) => setGestureId(event.target.value)}
          >
            {GESTURES.map((gesture) => (
              <option key={gesture.id} value={gesture.id}>
                {gesture.name}
              </option>
            ))}
          </select>
        </div>

        {!gestureBriefing.error && (
          <>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {gestureBriefing.gesture.howItLooks}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Region
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Reading
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      What it says there
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gestureBriefing.readings.map((reading) => (
                    <tr key={reading.regionId} className="border-b border-[var(--border)] align-top">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{reading.regionLabel}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${RISK_STYLE[reading.risk]}`}
                        >
                          {RISK_LEVELS[reading.risk].label}
                        </span>
                      </td>
                      <td className="py-2 text-[var(--muted-foreground)]">{reading.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are broad regional conventions reported in travel-etiquette literature, not rules about
        any individual. Customs vary by generation, city and community, and a friendly manner covers
        most accidental slips.
      </p>
    </main>
  );
}
