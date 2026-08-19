"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";
import { BANDS, computePowerToWeight, formatDuration, massSweep } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
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
  sex: "male",
  gradient: "8",
  elevation: "500",
  target: "4",
};

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [ftp, setFtp] = useState(DEFAULTS.ftp);
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [gradient, setGradient] = useState(DEFAULTS.gradient);
  const [elevation, setElevation] = useState(DEFAULTS.elevation);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      computePowerToWeight({
        ftpWatts: toNumber(ftp),
        massKg: toNumber(mass),
        sex,
        gradientPercent: toNumber(gradient),
        elevationGainM: toNumber(elevation),
        targetWattsPerKg: toNumber(target),
      }),
    [ftp, mass, sex, gradient, elevation, target],
  );
  const failed = Boolean(result.error);
  const climbFailed = Boolean(result.climbError);
  const targetFailed = Boolean(result.targetError);

  const sweep = useMemo(
    () => (failed ? [] : massSweep(toNumber(ftp), toNumber(mass))),
    [failed, ftp, mass],
  );

  const summary = useMemo(() => {
    if (failed) return "";
    const climbLine = result.climbError
      ? `Climb estimate: ${result.climbError}`
      : `Climbing VAM at ${NUM1.format(result.gradientPercent)}%: ${INT.format(result.vam)} vertical metres per hour\n${INT.format(result.elevationGainM)} m climb: ${formatDuration(result.climbHours)} at ${NUM1.format(result.climbSpeedKph)} km/h`;
    const targetLine = result.targetError
      ? `Target: ${result.targetError}`
      : result.wattsForTarget === null
        ? "No target set."
        : `To hit ${NUM2.format(toNumber(target))} W/kg: ${INT.format(result.wattsForTarget)} W at this weight, or ${NUM1.format(result.massForTarget)} kg at this FTP`;
    return [
      "Cycling Power to Weight Calculator",
      `FTP ${INT.format(result.ftpWatts)} W at ${NUM1.format(result.massKg)} kg`,
      `Power to weight: ${NUM2.format(result.wattsPerKg)} W/kg (${result.band.label})`,
      climbLine,
      targetLine,
    ].join("\n");
  }, [failed, result, target]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setFtp(DEFAULTS.ftp);
    setMass(DEFAULTS.mass);
    setSex(DEFAULTS.sex);
    setGradient(DEFAULTS.gradient);
    setElevation(DEFAULTS.elevation);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const table = BANDS[sex] ?? BANDS.male;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Cycling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cycling Power to Weight Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Divide your threshold power by your body mass to get the number that decides how you climb.
          This adds the rider category band, your vertical ascent rate on a chosen gradient, and what
          it would take in watts or kilograms to reach a target.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-ftp">
              FTP / threshold power (watts)
            </label>
            <input
              id="pw-ftp"
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
            <label className={LABEL_CLASS} htmlFor="pw-mass">
              Body mass (kg)
            </label>
            <input
              id="pw-mass"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="0.5"
              value={mass}
              onChange={(event) => setMass(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-sex">
              Category table
            </label>
            <select
              id="pw-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Men&apos;s bands</option>
              <option value="female">Women&apos;s bands</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-gradient">
              Climb gradient (%)
            </label>
            <input
              id="pw-gradient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="25"
              step="0.5"
              value={gradient}
              onChange={(event) => setGradient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-elevation">
              Climb height gain (m)
            </label>
            <input
              id="pw-elevation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3000"
              step="50"
              value={elevation}
              onChange={(event) => setElevation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-target">
              Target power to weight (W/kg)
            </label>
            <input
              id="pw-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="8"
              step="0.1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Set to 0 to hide the target.</p>
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
      {!failed && climbFailed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.climbError}
        </p>
      ) : null}
      {!failed && targetFailed ? (
        <p
          role="alert"
          className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.targetError}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Power to weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM2.format(result.wattsPerKg)} W/kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Enter valid numbers above." : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the power to weight result" className={GHOST_BTN}>
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
            [
              "Next band up",
              failed || !result.nextBand
                ? DASH
                : `${result.nextBand.label} at ${NUM2.format(result.nextBand.min)} W/kg`,
            ],
            [
              "Watts still needed for it",
              failed || result.wattsToNextBand === null
                ? DASH
                : `${INT.format(Math.max(0, result.wattsToNextBand))} W`,
            ],
            [
              "Climbing VAM",
              failed || climbFailed ? DASH : `${INT.format(result.vam)} vertical m/h at ${NUM1.format(result.gradientPercent)}%`,
            ],
            ["Climb length along the road", failed || climbFailed ? DASH : `${NUM1.format(result.climbDistanceKm)} km`],
            ["Time for that climb", failed || climbFailed ? DASH : formatDuration(result.climbHours)],
            ["Speed on the climb", failed || climbFailed ? DASH : `${NUM1.format(result.climbSpeedKph)} km/h`],
            [
              "Watts for your target",
              failed || result.wattsForTarget === null
                ? DASH
                : `${INT.format(result.wattsForTarget)} W (${result.extraWattsNeeded >= 0 ? "+" : ""}${INT.format(result.extraWattsNeeded)} W)`,
            ],
            [
              "Or body mass for your target",
              failed || result.massForTarget === null
                ? DASH
                : `${NUM1.format(result.massForTarget)} kg (${result.massToLose >= 0 ? "-" : "+"}${NUM1.format(Math.abs(result.massToLose))} kg)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Threshold W/kg category bands</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Boundaries follow the shape of the Coggan power-profile table for 60-minute power.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">From (W/kg)</th>
                <th scope="col" className="py-2 text-right font-semibold">Watts at your mass</th>
              </tr>
            </thead>
            <tbody>
              {table.map((band) => (
                <tr
                  key={band.label}
                  className={`border-b border-[var(--border)] last:border-0 ${!failed && band.label === result.band.label ? "text-[var(--primary)]" : ""}`}
                >
                  <td className="py-2 pr-3 font-semibold">{band.label}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {band.min > 0 ? NUM2.format(band.min) : "below"}
                  </td>
                  <td className="py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                    {failed || band.min === 0 ? DASH : `${INT.format(band.min * result.massKg)} W`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!failed && sweep.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What weight change does at the same FTP</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Body mass</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Change</th>
                  <th scope="col" className="py-2 text-right font-semibold">W/kg</th>
                </tr>
              </thead>
              <tbody>
                {sweep.map((row) => (
                  <tr key={row.offset} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{NUM1.format(row.massKg)} kg</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {row.offset === 0 ? "current" : `${row.offset > 0 ? "+" : ""}${NUM1.format(row.offset)} kg`}
                    </td>
                    <td className="py-2 text-right tabular-nums">{NUM2.format(row.wattsPerKg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        VAM estimates come from the Ferrari relation and are most accurate on sustained gradients of
        roughly 5 to 12 percent; wind, road surface and drafting all shift real climb times. Losing
        weight is not always the right way to raise W/kg — informational only, and worth discussing
        with a coach or a registered dietitian before restricting intake.
      </p>
    </main>
  );
}
