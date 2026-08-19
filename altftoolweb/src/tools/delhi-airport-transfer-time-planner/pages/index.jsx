"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, PlaneTakeoff, RotateCcw } from "lucide-react";

import {
  AIRPORT,
  COPY,
  FLIGHT_TYPES,
  MODES,
  ORIGINS,
  TRAFFIC_LEVELS,
  formatDuration,
  getFlightType,
  getMode,
  planTransfer,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULT_FLIGHT_TYPE = "domestic";
const TRIP_DEFAULTS = {
  departureTime: "10:00",
  distanceKm: "16",
  modeId: "app-cab",
  trafficLevelId: "auto",
  isWeekend: false,
  checkedBag: true,
  personalBufferMinutes: "15",
};

/** Airline and airport lead times, editable because they are carrier rules. */
const LEAD_FIELDS = [
  { key: "reportingLeadMinutes", label: "Airport reporting advice (min before departure)" },
  { key: "checkInCloseMinutes", label: "Bag drop closes (min before departure)" },
  { key: "gateCloseMinutes", label: "Boarding gate closes (min before departure)" },
  { key: "securityMinutes", label: "Security screening queue (min)" },
  { key: "immigrationMinutes", label: "Emigration counters (min)" },
];

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function leadsToStrings(flightType) {
  const out = {};
  for (const field of LEAD_FIELDS) out[field.key] = String(flightType[field.key]);
  return out;
}

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const dayLabel = (offset) => (offset < 0 ? " (the day before)" : "");

export default function ToolHome() {
  const [flightTypeId, setFlightTypeId] = useState(DEFAULT_FLIGHT_TYPE);
  const [leadInputs, setLeadInputs] = useState(() => leadsToStrings(getFlightType(DEFAULT_FLIGHT_TYPE)));
  const [departureTime, setDepartureTime] = useState(TRIP_DEFAULTS.departureTime);
  const [distanceKm, setDistanceKm] = useState(TRIP_DEFAULTS.distanceKm);
  const [modeId, setModeId] = useState(TRIP_DEFAULTS.modeId);
  const [trafficLevelId, setTrafficLevelId] = useState(TRIP_DEFAULTS.trafficLevelId);
  const [isWeekend, setIsWeekend] = useState(TRIP_DEFAULTS.isWeekend);
  const [checkedBag, setCheckedBag] = useState(TRIP_DEFAULTS.checkedBag);
  const [personalBufferMinutes, setPersonalBufferMinutes] = useState(
    TRIP_DEFAULTS.personalBufferMinutes,
  );
  const [copied, setCopied] = useState(false);

  const mode = getMode(modeId);

  const selectFlightType = (nextId) => {
    setFlightTypeId(nextId);
    setLeadInputs(leadsToStrings(getFlightType(nextId)));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      planTransfer({
        departureTime,
        distanceKm: toNum(distanceKm),
        modeId,
        trafficLevelId,
        isWeekend,
        flightTypeId,
        checkedBag,
        reportingLeadMinutes: toNum(leadInputs.reportingLeadMinutes),
        checkInCloseMinutes: toNum(leadInputs.checkInCloseMinutes),
        gateCloseMinutes: toNum(leadInputs.gateCloseMinutes),
        securityMinutes: toNum(leadInputs.securityMinutes),
        immigrationMinutes: toNum(leadInputs.immigrationMinutes),
        personalBufferMinutes: toNum(personalBufferMinutes),
      }),
    [
      departureTime,
      distanceKm,
      modeId,
      trafficLevelId,
      isWeekend,
      flightTypeId,
      checkedBag,
      leadInputs,
      personalBufferMinutes,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${AIRPORT.city} airport transfer plan (${AIRPORT.code})`,
      `Flight departs: ${result.departureTime} (${result.flightType.label})`,
      `Leave by: ${result.leaveByTime}${dayLabel(result.leaveByDayOffset)}`,
      `Be at the terminal by: ${result.terminalArrivalTime}${dayLabel(result.terminalArrivalDayOffset)}`,
      `Journey: ${formatDuration(result.travelMinutes)} by ${result.mode.label} for ${NUM.format(toNum(distanceKm))} km`,
      `Congestion adds: ${formatDuration(result.congestionCostMinutes)} over free-flow`,
      `Terminal lead required: ${formatDuration(result.requiredLeadMinutes)} (set by: ${result.bindingConstraint})`,
      `Personal buffer: ${formatDuration(result.personalBufferMinutes)}`,
      `Total door to departure: ${formatDuration(result.totalDoorToDepartureMinutes)}`,
    ].join("\n");
  }, [hasError, result, distanceKm]);

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
    setFlightTypeId(DEFAULT_FLIGHT_TYPE);
    setLeadInputs(leadsToStrings(getFlightType(DEFAULT_FLIGHT_TYPE)));
    setDepartureTime(TRIP_DEFAULTS.departureTime);
    setDistanceKm(TRIP_DEFAULTS.distanceKm);
    setModeId(TRIP_DEFAULTS.modeId);
    setTrafficLevelId(TRIP_DEFAULTS.trafficLevelId);
    setIsWeekend(TRIP_DEFAULTS.isWeekend);
    setCheckedBag(TRIP_DEFAULTS.checkedBag);
    setPersonalBufferMinutes(TRIP_DEFAULTS.personalBufferMinutes);
    setCopied(false);
  };

  const rows = [
    [
      "Be at the terminal by",
      hasError
        ? DASH
        : `${result.terminalArrivalTime}${dayLabel(result.terminalArrivalDayOffset)}`,
    ],
    ["Journey time in that traffic", hasError ? DASH : formatDuration(result.travelMinutes)],
    ["Same journey with clear roads", hasError ? DASH : formatDuration(result.freeFlowTravelMinutes)],
    ["Congestion costs you", hasError ? DASH : formatDuration(result.congestionCostMinutes)],
    ["Congestion factor applied", hasError ? DASH : `x${NUM.format(result.factor)}`],
    ["Terminal lead required", hasError ? DASH : formatDuration(result.requiredLeadMinutes)],
    ["What sets that lead", hasError ? DASH : result.bindingConstraint],
    ["Bag-drop deadline needs", hasError ? DASH : formatDuration(result.bagDropLeadMinutes)],
    ["Gate deadline needs", hasError ? DASH : formatDuration(result.gateLeadMinutes)],
    ["Airport advice asks for", hasError ? DASH : formatDuration(result.adviceLeadMinutes)],
    ["Your personal buffer", hasError ? DASH : formatDuration(result.personalBufferMinutes)],
    [
      "Total door to departure",
      hasError ? DASH : formatDuration(result.totalDoorToDepartureMinutes),
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
          {AIRPORT.city} · {AIRPORT.code}
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          {AIRPORT.city} Airport Transfer Time Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{COPY.intro}</p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-departure">
              Scheduled departure (24-hour)
            </label>
            <input
              id="plan-departure"
              className={INPUT_CLASS}
              type="time"
              value={departureTime}
              onChange={(event) => setDepartureTime(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="plan-distance">
              Distance to the terminal (km)
            </label>
            <input
              id="plan-distance"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <fieldset>
              <legend className="text-sm font-semibold text-[var(--foreground)]">Flight type</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {FLIGHT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    aria-pressed={flightTypeId === type.id}
                    onClick={() => selectFlightType(type.id)}
                    className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      flightTypeId === type.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="plan-mode">
              How are you getting there?
            </label>
            <select
              id="plan-mode"
              className={INPUT_CLASS}
              value={modeId}
              onChange={(event) => setModeId(event.target.value)}
            >
              {MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">{mode.note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="plan-traffic">
              Traffic assumption
            </label>
            <select
              id="plan-traffic"
              className={INPUT_CLASS}
              value={trafficLevelId}
              onChange={(event) => setTrafficLevelId(event.target.value)}
              disabled={!mode.trafficSensitive}
            >
              {TRAFFIC_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
              {mode.trafficSensitive
                ? "The typical profile peaks in the morning and again from late afternoon into the evening."
                : "This mode runs on rails, so road congestion does not change the journey time."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="plan-buffer">
              Your personal buffer (minutes)
            </label>
            <input
              id="plan-buffer"
              className={INPUT_CLASS}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={personalBufferMinutes}
              onChange={(event) => setPersonalBufferMinutes(event.target.value)}
            />
          </div>

          <div className="flex flex-col justify-end gap-3">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              htmlFor="plan-bag"
            >
              <input
                id="plan-bag"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={checkedBag}
                onChange={(event) => setCheckedBag(event.target.checked)}
              />
              <span className="text-sm font-semibold">I have a bag to check in</span>
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              htmlFor="plan-weekend"
            >
              <input
                id="plan-weekend"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={isWeekend}
                onChange={(event) => setIsWeekend(event.target.checked)}
              />
              <span className="text-sm font-semibold">Weekend or public holiday</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Starting from
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ORIGINS.map((origin) => (
              <button
                key={origin.id}
                type="button"
                className={CHIP_BTN}
                onClick={() => setDistanceKm(String(origin.km))}
              >
                {origin.label} · {origin.km} km
              </button>
            ))}
          </div>
        </div>

        <details className="mt-5 rounded-lg border border-[var(--border)] p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Adjust the airline and airport lead times
          </summary>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Reporting advice comes from the airport; bag-drop and gate closing times are set by your
            airline and differ between carriers and fare types. These reset whenever you switch
            between domestic and international — check your booking and overwrite them.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {LEAD_FIELDS.map((field) => (
              <div key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`lead-${field.key}`}>
                  {field.label}
                </label>
                <input
                  id={`lead-${field.key}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5"
                  value={leadInputs[field.key]}
                  onChange={(event) =>
                    setLeadInputs((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </details>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      {!hasError && !result.converged && (
        <p
          role="status"
          className="mt-6 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning-text)]"
        >
          This trip is long enough that the hour-by-hour traffic model could not settle on one
          answer. The figures below stay internally consistent, but treat the departure time as
          approximate — check a live map before you leave.
        </p>
      )}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Leave by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.leaveByTime}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a departure time."
                : `${result.leaveByDayOffset < 0 ? "The day before your flight. " : ""}That is ${formatDuration(result.totalDoorToDepartureMinutes)} before the ${result.departureTime} departure.`}
            </p>
            {!hasError && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Deadline set by: {result.bindingConstraint}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the airport transfer plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
      </section>

      {!hasError && mode.trafficSensitive && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            The same {NUM.format(toNum(distanceKm))} km by hour of departure
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            Journey time if you set off at the top of each hour, on the assumption currently
            selected. Useful when the flight time is not fixed yet.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Leave at
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Factor
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Journey
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Vs clear roads
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.hourlyTravel.map((row) => (
                  <tr key={row.hour} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">x{NUM.format(row.factor)}</td>
                    <td className="py-2 pr-3 text-right">{formatDuration(row.minutes)}</td>
                    <td className="py-2 text-right">
                      {row.deltaMinutes > 0 ? `+${formatDuration(row.deltaMinutes)}` : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">{COPY.footnote}</p>
    </main>
  );
}
