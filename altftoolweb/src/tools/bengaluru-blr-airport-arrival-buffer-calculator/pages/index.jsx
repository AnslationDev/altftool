"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlaneTakeoff, RotateCcw } from "lucide-react";

import {
  AIRPORT,
  AREA_PRESETS,
  DEFAULTS,
  JOURNEY_TYPES,
  QUEUE_LEVELS,
  TRAFFIC_LEVELS,
  computeArrivalPlan,
  formatClock,
  formatDuration,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const dayLabel = (offset) => (offset < 0 ? " (previous day)" : "");

export default function ToolHome() {
  const [departureTime, setDepartureTime] = useState(DEFAULTS.departureTime);
  const [journeyId, setJourneyId] = useState(DEFAULTS.journeyId);
  const [bags, setBags] = useState(DEFAULTS.bags);
  const [areaId, setAreaId] = useState(DEFAULTS.areaId);
  const [driveMinutes, setDriveMinutes] = useState(String(DEFAULTS.driveMinutes));
  const [trafficId, setTrafficId] = useState(DEFAULTS.trafficId);
  const [queueId, setQueueId] = useState(DEFAULTS.queueId);
  const [parkingMinutes, setParkingMinutes] = useState(String(DEFAULTS.parkingMinutes));
  const [personalBufferMinutes, setPersonalBufferMinutes] = useState(String(DEFAULTS.personalBufferMinutes));
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      computeArrivalPlan({
        departureTime,
        journeyId,
        bags,
        driveMinutes,
        trafficId,
        queueId,
        parkingMinutes,
        personalBufferMinutes,
      }),
    [departureTime, journeyId, bags, driveMinutes, trafficId, queueId, parkingMinutes, personalBufferMinutes],
  );

  const failed = Boolean(plan.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `${AIRPORT.city} ${AIRPORT.code} departure plan`,
      `Flight departs: ${formatClock(plan.departureMinutes)}`,
      `Leave home by: ${formatClock(plan.leaveByMinutes)}${dayLabel(plan.leaveByDayOffset)}`,
      `Be at the terminal by: ${formatClock(plan.arriveTerminalMinutes)}${dayLabel(plan.arriveTerminalDayOffset)}`,
      `Bag drop closes: ${formatClock(plan.checkInCloseMinutes)}`,
      `Boarding gate closes: ${formatClock(plan.gateCloseMinutes)}`,
      `Road time with traffic: ${formatDuration(plan.roadMinutes)}`,
      `Time inside the terminal: ${formatDuration(plan.terminalLeadMinutes)}`,
      `Total door-to-departure: ${formatDuration(plan.totalLeadMinutes)}`,
    ].join("\n");
  }, [failed, plan]);

  const onAreaChange = (nextId) => {
    setAreaId(nextId);
    const preset = AREA_PRESETS.find((item) => item.id === nextId);
    if (preset && preset.driveMinutes !== null) setDriveMinutes(String(preset.driveMinutes));
  };

  const onDriveChange = (value) => {
    setDriveMinutes(value);
    setAreaId("custom");
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
    setDepartureTime(DEFAULTS.departureTime);
    setJourneyId(DEFAULTS.journeyId);
    setBags(DEFAULTS.bags);
    setAreaId(DEFAULTS.areaId);
    setDriveMinutes(String(DEFAULTS.driveMinutes));
    setTrafficId(DEFAULTS.trafficId);
    setQueueId(DEFAULTS.queueId);
    setParkingMinutes(String(DEFAULTS.parkingMinutes));
    setPersonalBufferMinutes(String(DEFAULTS.personalBufferMinutes));
    setCopied(false);
  };

  const dash = "—";
  const show = (value) => (failed ? dash : value);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
          {AIRPORT.code} {AIRPORT.city}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bengaluru BLR Airport Arrival Buffer Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Kempegowda International sits about 35 km north of the city, so the drive is usually the largest and least predictable block of time. This planner works backwards from the departure time through the gate, security, bag drop and the road.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="blr-departure">
              Scheduled departure time
            </label>
            <input
              id="blr-departure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={departureTime}
              onChange={(event) => setDepartureTime(event.target.value)}
            />
            <p className={HINT_CLASS}>Local time printed on the ticket, not the boarding time.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-journey">
              Flight type
            </label>
            <select
              id="blr-journey"
              className={`mt-2 ${INPUT_CLASS}`}
              value={journeyId}
              onChange={(event) => setJourneyId(event.target.value)}
            >
              {JOURNEY_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-bags">
              Baggage
            </label>
            <select
              id="blr-bags"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bags}
              onChange={(event) => setBags(event.target.value)}
            >
              <option value="checked">Checked bag to drop</option>
              <option value="cabin">Cabin bag only, checked in online</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-area">
              Starting from
            </label>
            <select
              id="blr-area"
              className={`mt-2 ${INPUT_CLASS}`}
              value={areaId}
              onChange={(event) => onAreaChange(event.target.value)}
            >
              {AREA_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-drive">
              Driving time with no traffic (minutes)
            </label>
            <input
              id="blr-drive"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="5"
              value={driveMinutes}
              onChange={(event) => onDriveChange(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-traffic">
              Road conditions
            </label>
            <select
              id="blr-traffic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={trafficId}
              onChange={(event) => setTrafficId(event.target.value)}
            >
              {TRAFFIC_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-queue">
              Terminal queues
            </label>
            <select
              id="blr-queue"
              className={`mt-2 ${INPUT_CLASS}`}
              value={queueId}
              onChange={(event) => setQueueId(event.target.value)}
            >
              {QUEUE_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="blr-parking">
              Parking or drop-off plus walk (minutes)
            </label>
            <input
              id="blr-parking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="5"
              value={parkingMinutes}
              onChange={(event) => setParkingMinutes(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="blr-buffer">
              Personal buffer for coffee, restroom and surprises (minutes)
            </label>
            <input
              id="blr-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={personalBufferMinutes}
              onChange={(event) => setPersonalBufferMinutes(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Leave home by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(`${formatClock(plan.leaveByMinutes)}${dayLabel(plan.leaveByDayOffset)}`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the plan."
                : `${formatDuration(plan.totalLeadMinutes)} before a ${formatClock(plan.departureMinutes)} departure`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the departure plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Be inside the terminal by",
              show(`${formatClock(plan.arriveTerminalMinutes)}${dayLabel(plan.arriveTerminalDayOffset)}`),
            ],
            ["Bag drop / check-in closes", show(plan.hasBags ? formatClock(plan.checkInCloseMinutes) : "Not needed")],
            ["Boarding gate closes", show(formatClock(plan.gateCloseMinutes))],
            ["Road time including traffic", show(formatDuration(plan.roadMinutes))],
            ["Time needed inside the terminal", show(formatDuration(plan.terminalLeadMinutes))],
            ["Spare time at the gate", show(formatDuration(plan.spareMinutes))],
            ["Total door-to-departure", show(formatDuration(plan.totalLeadMinutes))],
            ["Driven by", show(plan.governedBy)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && plan.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Minute-by-minute timeline</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    From
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Step
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Minutes
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.steps.map((step) => (
                  <tr key={step.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 font-semibold">{formatClock(step.startMinutes)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{step.label}</td>
                    <td className="py-2 text-right">{step.minutes}</td>
                  </tr>
                ))}
                <tr>
                  <td className="whitespace-nowrap py-2 pr-3 font-semibold text-[var(--primary)]">
                    {formatClock(plan.departureMinutes)}
                  </td>
                  <td className="py-2 pr-3 font-semibold">Scheduled departure</td>
                  <td className="py-2 text-right">{"—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Terminals at {AIRPORT.code}</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
          {AIRPORT.terminals.map((terminal) => (
            <li key={terminal}>{terminal}</li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate, not a guarantee. Check-in and boarding cut-offs are set by your airline and
        can differ from the defaults used here, and road conditions change without warning. Confirm the
        cut-offs on your booking and check the airport&apos;s live advisory before you travel.
      </p>
    </main>
  );
}
