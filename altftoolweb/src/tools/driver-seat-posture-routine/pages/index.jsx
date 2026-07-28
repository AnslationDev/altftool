"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

import {
  BREAK_ROUTINE,
  BREAK_ROUTINE_SECONDS,
  PROFESSIONAL_BREAK_SPLIT,
  clockAt,
  formatMinutes,
  formatSeconds,
  planDrivingDay,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  driveHours: "6",
  heightCm: "175",
  mode: "private",
  startTime: "08:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const cm = (value) => `${NUM.format(value)} cm`;

export default function ToolHome() {
  const [driveHours, setDriveHours] = useState(DEFAULTS.driveHours);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planDrivingDay({ driveHours, heightCm, professional: mode === "professional" }),
    [driveHours, heightCm, mode],
  );

  const start = useMemo(() => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(startTime).trim());
    if (!match) return { hour: 8, minute: 0 };
    return { hour: Number(match[1]) % 24, minute: Number(match[2]) % 60 };
  }, [startTime]);

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Driver Seat Posture Routine",
      `Rule applied: ${plan.ruleLabel}`,
      `Driving: ${formatMinutes(plan.totalDriveMin)} · Breaks: ${plan.breakCount} × ${plan.breakLengthMin} min`,
      `Door to door: ${formatMinutes(plan.totalTripMin)} (arrive ${clockAt(start.hour, start.minute, plan.totalTripMin)})`,
      `Head restraint top: ${cm(plan.seat.headRestraintTopCm)} above the seat cushion`,
      `Head restraint backset: ${plan.seat.backsetMaxCm} cm or less`,
      `Sternum to air-bag cover: at least ${plan.seat.sternumToAirbagMinCm} cm`,
      `Seat back: ${plan.seat.seatBackAngleDeg[0]}–${plan.seat.seatBackAngleDeg[1]}° · Knee angle: ${plan.seat.kneeAngleDeg[0]}–${plan.seat.kneeAngleDeg[1]}°`,
      `Break routine: ${formatSeconds(plan.routineSeconds)} each`,
    ].join("\n");
  }, [hasError, plan, start.hour, start.minute]);

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
    setDriveHours(DEFAULTS.driveHours);
    setHeightCm(DEFAULTS.heightCm);
    setMode(DEFAULTS.mode);
    setStartTime(DEFAULTS.startTime);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Driver Seat Posture Routine
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the seat, wheel and head restraint to measurable targets, then plan the breaks the
          Highway Code or EU drivers&apos; hours rules expect — with a stretch sequence to run at
          each one.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dspr-hours">
              Time behind the wheel (hours)
            </label>
            <input
              id="dspr-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="18"
              step="0.25"
              value={driveHours}
              onChange={(event) => setDriveHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dspr-start">
              Departure time
            </label>
            <input
              id="dspr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dspr-height">
              Your height (cm)
            </label>
            <input
              id="dspr-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="220"
              step="1"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dspr-mode">
              Which break rule applies
            </label>
            <select
              id="dspr-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="private">Private driving — 15 min every 2 h</option>
              <option value="professional">Professional — 45 min after 4.5 h</option>
            </select>
          </div>
        </div>
      </section>

      {hasError && (
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
              Door to door
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatMinutes(plan.totalTripMin)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the schedule."
                : `Arrive about ${clockAt(start.hour, start.minute, plan.totalTripMin)} · ${plan.ruleLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy driving plan and seat targets"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Driving time", hasError ? DASH : formatMinutes(plan.totalDriveMin)],
            [
              "Breaks",
              hasError
                ? DASH
                : plan.breakCount === 0
                  ? "None required"
                  : `${plan.breakCount} × ${plan.breakLengthMin} min = ${formatMinutes(plan.totalBreakMin)}`,
            ],
            ["Longest legal stint", hasError ? DASH : formatMinutes(plan.driveLimitMin)],
            ["Stretching time in total", hasError ? DASH : formatSeconds(plan.totalRoutineSeconds)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.professional && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Under EU Regulation 561/2006 the {plan.breakLengthMin}-minute break may be taken as{" "}
            {PROFESSIONAL_BREAK_SPLIT[0]} minutes followed later by {PROFESSIONAL_BREAK_SPLIT[1]}{" "}
            minutes within the same 4.5-hour driving period.
          </p>
        )}

        {!hasError && plan.overDailyLimit && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formatMinutes(plan.totalDriveMin)} of driving exceeds the{" "}
            {formatMinutes(plan.dailyLimitMin)} daily limit for professional drivers
            {plan.overExtendedLimit
              ? " and also the 10-hour extension allowed twice a week."
              : ". The 10-hour extension is only allowed twice in any week."}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Journey schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    From
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    To
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    What
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((block) => (
                  <tr key={block.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold">
                      {clockAt(start.hour, start.minute, block.startMin)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {clockAt(start.hour, start.minute, block.endMin)}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          block.kind === "break"
                            ? "font-semibold text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]"
                        }
                      >
                        {block.kind === "break" ? "Break + stretch" : "Drive"}
                      </span>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {formatMinutes(block.lengthMin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Seat set-up targets</h2>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Head restraint top, above the seat cushion",
              hasError
                ? DASH
                : `${cm(plan.seat.headRestraintTopCm)} — level with the top of your head`,
            ],
            [
              "Gap behind your head (backset)",
              hasError ? DASH : `${plan.seat.backsetMaxCm} cm or less`,
            ],
            [
              "Chest to air-bag cover",
              hasError ? DASH : `At least ${plan.seat.sternumToAirbagMinCm} cm`,
            ],
            [
              "Seat back angle",
              hasError
                ? DASH
                : `${plan.seat.seatBackAngleDeg[0]}–${plan.seat.seatBackAngleDeg[1]}° — not bolt upright`,
            ],
            [
              "Knee angle, pedal fully down",
              hasError ? DASH : `${plan.seat.kneeAngleDeg[0]}–${plan.seat.kneeAngleDeg[1]}°`,
            ],
            [
              "Eye height above the wheel rim",
              hasError ? DASH : `At least ${plan.seat.eyeAboveWheelMinCm} cm`,
            ],
            ["Head to roof lining", hasError ? DASH : `About ${plan.seat.roofClearanceCm} cm`],
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
          Break routine — {formatSeconds(BREAK_ROUTINE_SECONDS)}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Move
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Time
                </th>
                <th scope="col" className="py-2 font-semibold">
                  How
                </th>
              </tr>
            </thead>
            <tbody>
              {BREAK_ROUTINE.map((step) => (
                <tr key={step.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{step.name}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {formatSeconds(step.seconds)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{step.cue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — not legal advice on drivers&apos; hours, and not a substitute for your
        vehicle handbook, which takes precedence on air-bag and head-restraint positioning. Head
        restraint heights are proportional estimates from 50th-percentile adult body dimensions.
        Never drive while sleepy: pull over somewhere safe and rest.
      </p>
    </main>
  );
}
