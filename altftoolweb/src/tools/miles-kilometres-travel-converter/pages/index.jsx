"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Route } from "lucide-react";

import {
  SPEED_LIMIT_REFERENCE,
  convertDistance,
  convertLimit,
  convertSpeed,
  estimateDriveTime,
} from "../lib";

const DEFAULTS = { distance: "250", distanceUnit: "mi", speed: "70", speedUnit: "mph" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const nf = (digits) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: digits });
const n2 = nf(2);
const n1 = nf(1);
const n0 = nf(0);

export default function ToolHome() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [distanceUnit, setDistanceUnit] = useState(DEFAULTS.distanceUnit);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [copied, setCopied] = useState(false);

  const dist = useMemo(
    () => convertDistance({ value: Number(String(distance).replace(/,/g, "").trim()), from: distanceUnit }),
    [distance, distanceUnit],
  );

  const spd = useMemo(
    () => convertSpeed({ value: Number(String(speed).replace(/,/g, "").trim()), from: speedUnit }),
    [speed, speedUnit],
  );

  const time = useMemo(() => {
    if (dist.error || spd.error) return { error: "" };
    return estimateDriveTime({ distanceKm: dist.km, speedKmh: spd.kmh });
  }, [dist, spd]);

  const error = dist.error || spd.error || (time.error ? time.error : "");
  const ok = !dist.error && !spd.error;
  const timeOk = ok && !time.error;

  const headline = useMemo(() => {
    if (!ok) return DASH;
    return distanceUnit === "mi"
      ? `${n2.format(dist.km)} km`
      : `${n2.format(dist.miles)} mi`;
  }, [ok, distanceUnit, dist]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Miles / kilometres travel conversion",
      `Distance: ${n2.format(dist.miles)} mi = ${n2.format(dist.km)} km`,
      `Speed: ${n1.format(spd.mph)} mph = ${n1.format(spd.kmh)} km/h`,
      timeOk ? `Driving time at that steady speed: ${time.label}` : "",
      "1 mile = 1.609344 km exactly",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, dist, spd, time, timeOk]);

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
    setDistance(DEFAULTS.distance);
    setDistanceUnit(DEFAULTS.distanceUnit);
    setSpeed(DEFAULTS.speed);
    setSpeedUnit(DEFAULTS.speedUnit);
    setCopied(false);
  };

  const rows = [
    ["Distance in miles", ok ? `${n2.format(dist.miles)} mi` : DASH],
    ["Distance in kilometres", ok ? `${n2.format(dist.km)} km` : DASH],
    ["Distance in metres", ok ? `${n0.format(dist.metres)} m` : DASH],
    ["Speed in mph", ok ? `${n1.format(spd.mph)} mph` : DASH],
    ["Speed in km/h", ok ? `${n1.format(spd.kmh)} km/h` : DASH],
    ["Speed in metres per second", ok ? `${n1.format(spd.metresPerSecond)} m/s` : DASH],
    ["Driving time at that steady speed", timeOk ? time.label : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" />
          Driving abroad
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Miles to Kilometres Travel Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a road distance and a posted speed limit in either direction, then see how long the
          drive takes at that steady speed. One mile is exactly 1.609344 km.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mk-distance">
              Trip distance
            </label>
            <input
              id="mk-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mk-distance-unit">
              Distance is given in
            </label>
            <select
              id="mk-distance-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={distanceUnit}
              onChange={(event) => setDistanceUnit(event.target.value)}
            >
              <option value="mi">Miles</option>
              <option value="km">Kilometres</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mk-speed">
              Speed limit or cruising speed
            </label>
            <input
              id="mk-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mk-speed-unit">
              Speed is given in
            </label>
            <select
              id="mk-speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              <option value="mph">Miles per hour</option>
              <option value="kmh">Kilometres per hour</option>
            </select>
          </div>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {distanceUnit === "mi" ? "That distance in kilometres" : "That distance in miles"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${timeOk ? `About ${time.label} of driving ` : ""}at ${n0.format(spd.kmh)} km/h (${n0.format(spd.mph)} mph)`
                : "Fix the inputs above to see the conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted distance and speed" className={GHOST_BTN}>
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Speed limits you will meet</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Typical posted limits, shown in both units. Always follow the sign at the roadside.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Posted</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">mph</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">km/h</th>
                <th scope="col" className="py-2 font-semibold">Where</th>
              </tr>
            </thead>
            <tbody>
              {SPEED_LIMIT_REFERENCE.map((row) => {
                const both = convertLimit(row);
                return (
                  <tr key={`${row.posted}-${row.unit}-${row.where}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.posted} {row.unit}
                    </td>
                    <td className="py-2 pr-3 text-right">{n0.format(both.mph)}</td>
                    <td className="py-2 pr-3 text-right">{n0.format(both.kmh)}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.where}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The driving time assumes one steady speed with no stops, traffic, tolls or roadworks. Speed
        limits change with vehicle type, weather, load and towing, and the reference rows above are
        typical defaults rather than the law for a specific road.
      </p>
    </main>
  );
}
