"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import { computeZones, estimateFtp, formatHours, polarisedSplit } from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  ftp: "250",
  mass: "70",
  weeklyHours: "8",
  testWatts: "300",
  testId: "twenty",
};

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [ftp, setFtp] = useState(DEFAULTS.ftp);
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [weeklyHours, setWeeklyHours] = useState(DEFAULTS.weeklyHours);
  const [testWatts, setTestWatts] = useState(DEFAULTS.testWatts);
  const [testId, setTestId] = useState(DEFAULTS.testId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeZones(toNumber(ftp), toNumber(mass) || 0), [ftp, mass]);
  const failed = Boolean(result.error);

  const estimate = useMemo(() => estimateFtp(toNumber(testWatts), testId), [testWatts, testId]);
  const split = useMemo(() => polarisedSplit(toNumber(weeklyHours)), [weeklyHours]);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "FTP Training Zones Calculator",
      `FTP: ${INT.format(result.ftpWatts)} W${result.wattsPerKg ? ` (${NUM2.format(result.wattsPerKg)} W/kg)` : ""}`,
    ];
    result.zones.forEach((zone) => {
      const range =
        zone.highWattsRounded === null
          ? `${INT.format(zone.lowWattsRounded)} W and above`
          : `${INT.format(zone.lowWattsRounded)}-${INT.format(zone.highWattsRounded)} W`;
      lines.push(`Z${zone.id} ${zone.name}: ${range}`);
    });
    return lines.join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFtp(DEFAULTS.ftp);
    setMass(DEFAULTS.mass);
    setWeeklyHours(DEFAULTS.weeklyHours);
    setTestWatts(DEFAULTS.testWatts);
    setTestId(DEFAULTS.testId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Cycling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          FTP Training Zones Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn one number — your functional threshold power — into the seven Coggan power zones in
          watts, ready to type into a head unit or a smart trainer. Includes a 20-minute test
          estimator and an 80/20 polarised split of your week.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-value">
              FTP (watts)
            </label>
            <input
              id="ftp-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="800"
              step="1"
              value={ftp}
              onChange={(event) => setFtp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-mass">
              Body mass (kg, optional)
            </label>
            <input
              id="ftp-mass"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="250"
              step="0.5"
              value={mass}
              onChange={(event) => setMass(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Adds W/kg to every zone.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-weekly">
              Weekly riding hours
            </label>
            <input
              id="ftp-weekly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
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
              Threshold zone (Z4)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed
                ? DASH
                : `${INT.format(result.thresholdBandLow)}–${INT.format(result.thresholdBandHigh)} W`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Enter a valid FTP above."
                : `91–105% of an FTP of ${INT.format(result.ftpWatts)} W${result.wattsPerKg ? ` · ${NUM2.format(result.wattsPerKg)} W/kg` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy all power zones" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy zones"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [
                ["Zone 1 Active recovery", DASH],
                ["Zone 2 Endurance", DASH],
                ["Zone 3 Tempo", DASH],
                ["Zone 4 Lactate threshold", DASH],
                ["Zone 5 VO2max", DASH],
                ["Zone 6 Anaerobic capacity", DASH],
                ["Zone 7 Neuromuscular power", DASH],
              ]
            : result.zones.map((zone) => [
                `Zone ${zone.id} ${zone.name}`,
                zone.highWattsRounded === null
                  ? `${INT.format(zone.lowWattsRounded)} W and above`
                  : `${INT.format(zone.lowWattsRounded)}–${INT.format(zone.highWattsRounded)} W`,
              ])
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Full zone table</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Zone</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">% of FTP</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Watts</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">W/kg</th>
                  <th scope="col" className="py-2 font-semibold">Typical block</th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((zone) => (
                  <tr key={zone.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      Z{zone.id} {zone.name}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {zone.highPct === null
                        ? `${Math.round(zone.lowPct * 100)}%+`
                        : `${Math.round(zone.lowPct * 100)}–${Math.round(zone.highPct * 100)}%`}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {zone.highWattsRounded === null
                        ? `${INT.format(zone.lowWattsRounded)}+`
                        : `${INT.format(zone.lowWattsRounded)}–${INT.format(zone.highWattsRounded)}`}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {zone.lowWattsPerKg === null
                        ? DASH
                        : zone.highWattsPerKg === null
                          ? `${NUM2.format(zone.lowWattsPerKg)}+`
                          : `${NUM2.format(zone.lowWattsPerKg)}–${NUM2.format(zone.highWattsPerKg)}`}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{zone.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.zones[3].purpose}
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Estimate FTP from a shorter test</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-test-watts">
              Average power in the test (watts)
            </label>
            <input
              id="ftp-test-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={testWatts}
              onChange={(event) => setTestWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-test-type">
              Test length
            </label>
            <select
              id="ftp-test-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={testId}
              onChange={(event) => setTestId(event.target.value)}
            >
              <option value="twenty">20-minute test (95% of average)</option>
              <option value="eight">8-minute test (90% of average)</option>
            </select>
          </div>
        </div>

        {estimate.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {estimate.error}
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border)] p-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              Estimated FTP from your {estimate.testLabel}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold tabular-nums text-[var(--primary)]">
                {INT.format(estimate.ftpWatts)} W
              </span>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => setFtp(String(Math.round(estimate.ftpWatts)))}
                aria-label="Use the estimated FTP in the zone calculator"
              >
                Use this FTP
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Polarised 80/20 week</h2>
        {split.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {split.error}
          </p>
        ) : (
          <>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Easy riding (zones 1-2)", formatHours(split.easyHours)],
                ["Hard riding (zone 4 and above)", formatHours(split.hardHours)],
                ["Weekly total", formatHours(split.weeklyHours)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <div
              className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label="80 percent easy riding, 20 percent hard riding"
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: "80%" }} />
              <span className="block h-full bg-[var(--danger)]" style={{ width: "20%" }} />
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Zone boundaries are a model, not a physiological measurement — a lab lactate test will place
        your threshold more precisely. Retest FTP every 6 to 8 weeks, and treat this as general
        training information rather than medical advice.
      </p>
    </main>
  );
}
