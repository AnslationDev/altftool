"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlaneTakeoff, RotateCcw, TriangleAlert } from "lucide-react";

import {
  AIRPORT,
  DEFAULT_CONTINGENCY_MIN,
  JOURNEY_TYPES,
  MAX_CONTINGENCY_MIN,
  MIN_CONTINGENCY_MIN,
  PEAK_WINDOWS,
  PICKUP_ZONES,
  ROAD_CONDITIONS,
  TRANSPORT_MODES,
  dayOffset,
  formatDuration,
  formatHhmm,
  planAirportTransfer,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  flightTime: "06:20",
  journeyTypeId: "domestic",
  zoneId: "mi-road",
  modeId: "app-cab",
  conditionId: "clear",
  checkedBag: true,
  webCheckedIn: true,
  contingencyMin: String(DEFAULT_CONTINGENCY_MIN),
};

/** Presentation helper: turn a minute value into "03:26" plus a day note. */
function clock(minute) {
  const offset = dayOffset(minute);
  const time = formatHhmm(minute);
  if (offset < 0) return `${time} (previous day)`;
  if (offset > 0) return `${time} (next day)`;
  return time;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      planAirportTransfer({
        flightTime: form.flightTime,
        journeyTypeId: form.journeyTypeId,
        zoneId: form.zoneId,
        modeId: form.modeId,
        conditionId: form.conditionId,
        checkedBag: form.checkedBag,
        webCheckedIn: form.webCheckedIn,
        contingencyMin: form.contingencyMin === "" ? Number.NaN : Number(form.contingencyMin),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Jaipur airport (${AIRPORT.iata}) transfer plan`,
      `Flight: ${formatHhmm(result.flightMinute)} — ${result.journey.label}`,
      `From: ${result.zone.label} (${result.distanceKm} km) by ${result.mode.label}`,
      `Conditions: ${result.condition.label}`,
      "",
      `LEAVE AT ${clock(result.leaveMinute)}`,
      `Latest possible departure: ${clock(result.lastChanceLeaveMinute)}`,
      `Drive: ${formatDuration(result.driveMinutes)} at about ${result.averageSpeedKmph} km/h (${result.trafficBand})`,
      `At the terminal: ${clock(result.kerbMinute)}`,
      `Airport formalities: ${formatDuration(result.processingMin)}`,
      `Check-in closes: ${clock(result.checkInClosesAt)}`,
      `Gate closes: ${clock(result.gateClosesAt)}`,
      `Slack at the gate: ${formatDuration(result.gateSlackMin)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const selectedZone = PICKUP_ZONES.find((zone) => zone.id === form.zoneId);
  const selectedMode = TRANSPORT_MODES.find((mode) => mode.id === form.modeId);
  const selectedCondition = ROAD_CONDITIONS.find((entry) => entry.id === form.conditionId);
  const selectedJourney = JOURNEY_TYPES.find((entry) => entry.id === form.journeyTypeId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
          {AIRPORT.iata} — {AIRPORT.locality}
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Jaipur Airport Transfer Time Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work backwards from the scheduled departure to the minute you should set off, with Jaipur
          traffic simulated hour by hour and the check-in, gate and arrival-advice cutoffs all
          applied. {AIRPORT.terminalNote}
        </p>
      </header>

      <section className={CARD_CLASS}>
        <h2 className="text-base font-semibold">Your flight</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="in-flight-time">
              Scheduled departure (24-hour)
            </label>
            <input
              id="in-flight-time"
              type="time"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.flightTime}
              onChange={(event) => setField("flightTime", event.target.value)}
            />
            <p className={HINT_CLASS}>The time printed on the ticket, not the boarding time.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-journey">
              Domestic or international
            </label>
            <select
              id="in-journey"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.journeyTypeId}
              onChange={(event) => setField("journeyTypeId", event.target.value)}
            >
              {JOURNEY_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{selectedJourney?.note}</p>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">The journey</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="in-zone">
              Starting from
            </label>
            <select
              id="in-zone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.zoneId}
              onChange={(event) => setField("zoneId", event.target.value)}
            >
              {PICKUP_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label} — {zone.km} km
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{selectedZone?.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-mode">
              Getting there by
            </label>
            <select
              id="in-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.modeId}
              onChange={(event) => setField("modeId", event.target.value)}
            >
              {TRANSPORT_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{selectedMode?.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-condition">
              Road conditions
            </label>
            <select
              id="in-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.conditionId}
              onChange={(event) => setField("conditionId", event.target.value)}
            >
              {ROAD_CONDITIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{selectedCondition?.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-buffer">
              Your own buffer (minutes)
            </label>
            <input
              id="in-buffer"
              type="number"
              inputMode="numeric"
              min={MIN_CONTINGENCY_MIN}
              max={MAX_CONTINGENCY_MIN}
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.contingencyMin}
              onChange={(event) => setField("contingencyMin", event.target.value)}
            />
            <p className={HINT_CLASS}>
              Taken off the target arrival time on top of every cutoff below.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            htmlFor="in-bag"
          >
            <input
              id="in-bag"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.checkedBag}
              onChange={(event) => setField("checkedBag", event.target.checked)}
            />
            <span className="font-medium">I have a bag to check in</span>
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            htmlFor="in-web"
          >
            <input
              id="in-web"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.webCheckedIn}
              onChange={(event) => setField("webCheckedIn", event.target.checked)}
            />
            <span className="font-medium">I have already web checked in</span>
          </label>
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

      <section className={`mt-6 ${CARD_CLASS}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Leave at
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : formatHhmm(result.leaveMinute)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `${result.leaveDayOffset < 0 ? "The day before the flight — " : ""}${formatDuration(result.leadMinutes)} before the scheduled departure.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Jaipur airport transfer plan"
              className={GHOST_BTN}
              disabled={hasError}
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
              "Latest you could possibly leave",
              hasError ? DASH : clock(result.lastChanceLeaveMinute),
            ],
            [
              "Drive time",
              hasError
                ? DASH
                : `${formatDuration(result.driveMinutes)} for ${result.distanceKm} km — ${result.trafficBand}`,
            ],
            [
              "Average road speed",
              hasError ? DASH : `${result.averageSpeedKmph} km/h`,
            ],
            ["Inside the terminal by", hasError ? DASH : clock(result.kerbMinute)],
            ["Airport formalities", hasError ? DASH : formatDuration(result.processingMin)],
            ["Check-in and bag drop close", hasError ? DASH : clock(result.checkInClosesAt)],
            ["Boarding gate closes", hasError ? DASH : clock(result.gateClosesAt)],
            ["Binding cutoff", hasError ? DASH : result.bindingDeadlineLabel],
            ["Spare time at the gate", hasError ? DASH : formatDuration(result.gateSlackMin)],
            [
              "Slack over the last-chance departure",
              hasError ? DASH : formatDuration(result.marginOverLastChanceMin),
            ],
            ["Web check-in opens", hasError ? DASH : clock(result.webCheckInOpensAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">Minute by minute</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th className="py-2 pr-3 font-semibold">Time</th>
                  <th className="py-2 pr-3 font-semibold">Step</th>
                  <th className="py-2 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3 font-semibold tabular-nums whitespace-nowrap">
                      {formatHhmm(row.minute)}
                    </td>
                    <td className="py-2.5 pr-3 font-medium">{row.label}</td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.warnings.length > 0 && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--muted-foreground)]">{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={`mt-6 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">Jaipur&apos;s slow hours</h2>
        <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
          {PEAK_WINDOWS.map((window) => (
            <li key={window.label}>
              <span className="font-semibold text-[var(--foreground)]">{window.label}</span> —{" "}
              {window.from} to {window.to}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning aid only. Distances are typical road distances and the traffic profile is a model,
        not live data. Check-in and gate cutoffs vary between airlines and can change without
        notice, so confirm them with your carrier and check the live flight status before you leave.
      </p>
    </main>
  );
}
