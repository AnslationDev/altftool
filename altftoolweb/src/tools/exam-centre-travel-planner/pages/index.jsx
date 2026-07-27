"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Route } from "lucide-react";

import {
  MIN_BUFFER_MINUTES,
  MODES,
  TRAFFIC_LEVELS,
  buildTravelPrepList,
  computeJourney,
  formatDuration,
  planExamTravel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  gateClose: "09:30",
  arriveEarly: "30",
  buffer: "25",
  getReady: "45",
  primary: { modeId: "car", distance: "12" },
  backup: { modeId: "metro", distance: "14" },
  useBackup: true,
  trafficId: "moderate",
};

const modeById = (id) => MODES.find((mode) => mode.id === id) ?? MODES[0];
const trafficById = (id) => TRAFFIC_LEVELS.find((level) => level.id === id) ?? TRAFFIC_LEVELS[1];

function RouteInputs({ prefix, title, modeId, distance, onMode, onDistance }) {
  return (
    <div className="rounded-md border border-[var(--border)] p-3">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor={`${prefix}-mode`}>
            Mode of travel
          </label>
          <select
            id={`${prefix}-mode`}
            className={`mt-2 ${INPUT_CLASS}`}
            value={modeId}
            onChange={(event) => onMode(event.target.value)}
          >
            {MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label} (~{mode.speedKmph} km/h door to door)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`${prefix}-distance`}>
            Distance to the centre (km)
          </label>
          <input
            id={`${prefix}-distance`}
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={distance}
            onChange={(event) => onDistance(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [gateClose, setGateClose] = useState(DEFAULTS.gateClose);
  const [arriveEarly, setArriveEarly] = useState(DEFAULTS.arriveEarly);
  const [buffer, setBuffer] = useState(DEFAULTS.buffer);
  const [getReady, setGetReady] = useState(DEFAULTS.getReady);
  const [trafficId, setTrafficId] = useState(DEFAULTS.trafficId);
  const [primaryMode, setPrimaryMode] = useState(DEFAULTS.primary.modeId);
  const [primaryDistance, setPrimaryDistance] = useState(DEFAULTS.primary.distance);
  const [useBackup, setUseBackup] = useState(DEFAULTS.useBackup);
  const [backupMode, setBackupMode] = useState(DEFAULTS.backup.modeId);
  const [backupDistance, setBackupDistance] = useState(DEFAULTS.backup.distance);
  const [copied, setCopied] = useState(false);

  const traffic = trafficById(trafficId);

  const trafficMultiplier = traffic.multiplier;

  const primaryJourney = useMemo(() => {
    const mode = modeById(primaryMode);
    return computeJourney({
      distanceKm: Number(primaryDistance),
      speedKmph: mode.speedKmph,
      trafficMultiplier,
      isRoadMode: mode.roadMode,
      headwayMinutes: mode.headway,
      accessMinutes: mode.access,
      egressMinutes: mode.egress,
      transfers: 0,
      transferMinutes: 0,
    });
  }, [primaryMode, primaryDistance, trafficMultiplier]);

  const backupJourney = useMemo(() => {
    if (!useBackup) return null;
    const mode = modeById(backupMode);
    return computeJourney({
      distanceKm: Number(backupDistance),
      speedKmph: mode.speedKmph,
      trafficMultiplier,
      isRoadMode: mode.roadMode,
      headwayMinutes: mode.headway,
      accessMinutes: mode.access,
      egressMinutes: mode.egress,
      transfers: 0,
      transferMinutes: 0,
    });
  }, [useBackup, backupMode, backupDistance, trafficMultiplier]);

  const plan = useMemo(
    () =>
      planExamTravel({
        gateCloseClock: gateClose,
        arriveEarlyMinutes: Number(arriveEarly),
        primary: primaryJourney,
        backup: backupJourney,
        bufferMinutes: Number(buffer),
        getReadyMinutes: Number(getReady),
      }),
    [gateClose, arriveEarly, primaryJourney, backupJourney, buffer, getReady],
  );

  const hasError = Boolean(plan.error);
  const prepList = useMemo(() => buildTravelPrepList(), []);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Exam centre travel plan",
      `Gate closes: ${plan.gateCloseClock}`,
      `Reach the centre by: ${plan.targetArrivalClock}`,
      `Leave home (primary route) by: ${plan.primaryDepartureClock}`,
      `Start getting ready at: ${plan.wakeUpClock}`,
    ];
    if (plan.hasBackup) {
      lines.push(`Switch to backup no later than: ${plan.switchByClock}`);
    }
    lines.push(`Primary journey: ${formatDuration(plan.primary.totalMinutes)} + ${formatDuration(plan.bufferMinutes)} buffer`);
    if (plan.hasBackup) {
      lines.push(`Backup journey: ${formatDuration(plan.backup.totalMinutes)}`);
    }
    plan.warnings.forEach((warning) => lines.push(`Warning: ${warning}`));
    return lines.join("\n");
  }, [hasError, plan]);

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
    setGateClose(DEFAULTS.gateClose);
    setArriveEarly(DEFAULTS.arriveEarly);
    setBuffer(DEFAULTS.buffer);
    setGetReady(DEFAULTS.getReady);
    setTrafficId(DEFAULTS.trafficId);
    setPrimaryMode(DEFAULTS.primary.modeId);
    setPrimaryDistance(DEFAULTS.primary.distance);
    setUseBackup(DEFAULTS.useBackup);
    setBackupMode(DEFAULTS.backup.modeId);
    setBackupDistance(DEFAULTS.backup.distance);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" />
          Reach early, not just on time
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Exam Centre Travel Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work back from the gate-closing time on your admit card: when to leave on the primary
          route, the last moment to switch to the backup, and the buffer that survives bad traffic.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-gate">
              Gate-closing time (from the admit card)
            </label>
            <input
              id="tp-gate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={gateClose}
              onChange={(event) => setGateClose(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-early">
              Arrive this many minutes before the gate closes
            </label>
            <input
              id="tp-early"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={arriveEarly}
              onChange={(event) => setArriveEarly(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-traffic">
              Expected traffic
            </label>
            <select
              id="tp-traffic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={trafficId}
              onChange={(event) => setTrafficId(event.target.value)}
            >
              {TRAFFIC_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-buffer">
              Buffer for the unexpected (minutes)
            </label>
            <input
              id="tp-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              At least {MIN_BUFFER_MINUTES} minutes is recommended, more for longer journeys.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tp-ready">
              Time to get ready at home (minutes)
            </label>
            <input
              id="tp-ready"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={getReady}
              onChange={(event) => setGetReady(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <RouteInputs
            prefix="tp-primary"
            title="Primary route"
            modeId={primaryMode}
            distance={primaryDistance}
            onMode={setPrimaryMode}
            onDistance={setPrimaryDistance}
          />

          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="tp-use-backup"
          >
            <input
              id="tp-use-backup"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={useBackup}
              onChange={(event) => setUseBackup(event.target.checked)}
            />
            Plan a backup route as well (strongly recommended)
          </label>

          {useBackup ? (
            <RouteInputs
              prefix="tp-backup"
              title="Backup route"
              modeId={backupMode}
              distance={backupDistance}
              onMode={setBackupMode}
              onDistance={setBackupDistance}
            />
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Leave home by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.primaryDepartureClock}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the plan."
                : `${formatDuration(plan.primary.totalMinutes)} of journey plus ${formatDuration(plan.bufferMinutes)} of buffer, reaching ${NUM.format(Number(arriveEarly))} minutes before the gate closes.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the exam travel plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Start getting ready at", hasError ? DASH : plan.wakeUpClock],
            ["Leave home (primary route)", hasError ? DASH : plan.primaryDepartureClock],
            [
              "Last moment to switch to the backup",
              hasError ? DASH : plan.hasBackup ? plan.switchByClock : "No backup route set",
            ],
            ["Reach the centre by", hasError ? DASH : plan.targetArrivalClock],
            ["Gate closes", hasError ? DASH : plan.gateCloseClock],
            [
              "Recommended buffer for this journey",
              hasError ? DASH : formatDuration(plan.recommendedBuffer),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Watch out</h2>
          <ul className="mt-3 space-y-2">
            {plan.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Route comparison</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Route</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Moving</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Waiting</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Access + egress</th>
                <th scope="col" className="py-2 text-right font-semibold">Door to door</th>
              </tr>
            </thead>
            <tbody>
              {(hasError
                ? []
                : [
                    ["Primary", plan.primary],
                    ...(plan.hasBackup ? [["Backup", plan.backup]] : []),
                  ]
              ).map(([label, journey]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 pr-3 text-right">{formatDuration(journey.movingMinutes)}</td>
                  <td className="py-2 pr-3 text-right">{formatDuration(journey.waitMinutes)}</td>
                  <td className="py-2 pr-3 text-right">
                    {formatDuration(journey.accessMinutes + journey.egressMinutes)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {formatDuration(journey.totalMinutes)}
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Waiting is half the service interval for the mode; traffic multiplies road modes only.
          Speeds are door-to-door planning averages — adjust distance to tune a route.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The night-before list</h2>
        <ul className="mt-3 space-y-2">
          {prepList.map((item) => (
            <li key={item.id} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid only. The reporting and gate-closing times printed on your own
        admit card or call letter are the only authority on when you must be inside the centre.
      </p>
    </main>
  );
}
