"use client";

import { useMemo, useState } from "react";
import { Check, CircleGauge, Copy, RotateCcw } from "lucide-react";
import { CADENCE_BANDS, WHEEL_SIZES, computeGearing } from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const n1 = (value) => (Number.isFinite(value) ? N1.format(value) : "—");
const n2 = (value) => (Number.isFinite(value) ? N2.format(value) : "—");
const n3 = (value) => (Number.isFinite(value) ? N3.format(value) : "—");

const DEFAULT_WHEEL = "700x25c";

const DEFAULTS = {
  chainringTeeth: "50",
  cogTeeth: "17",
  wheel: DEFAULT_WHEEL,
  circumferenceMm: String(WHEEL_SIZES[DEFAULT_WHEEL]),
  cadenceRpm: "90",
  crankLengthMm: "172.5",
  targetSpeedKmph: "40",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [chainringTeeth, setChainringTeeth] = useState(DEFAULTS.chainringTeeth);
  const [cogTeeth, setCogTeeth] = useState(DEFAULTS.cogTeeth);
  const [wheel, setWheel] = useState(DEFAULTS.wheel);
  const [circumferenceMm, setCircumferenceMm] = useState(DEFAULTS.circumferenceMm);
  const [cadenceRpm, setCadenceRpm] = useState(DEFAULTS.cadenceRpm);
  const [crankLengthMm, setCrankLengthMm] = useState(DEFAULTS.crankLengthMm);
  const [targetSpeedKmph, setTargetSpeedKmph] = useState(DEFAULTS.targetSpeedKmph);
  const [copied, setCopied] = useState(false);

  const changeWheel = (next) => {
    setWheel(next);
    if (WHEEL_SIZES[next]) setCircumferenceMm(String(WHEEL_SIZES[next]));
  };

  const result = useMemo(
    () =>
      computeGearing({
        chainringTeeth: toNumber(chainringTeeth),
        cogTeeth: toNumber(cogTeeth),
        circumferenceMm: toNumber(circumferenceMm),
        cadenceRpm: toNumber(cadenceRpm),
        crankLengthMm: toNumber(crankLengthMm),
        targetSpeedKmph:
          targetSpeedKmph.trim() === "" ? undefined : toNumber(targetSpeedKmph),
      }),
    [chainringTeeth, cogTeeth, circumferenceMm, cadenceRpm, crankLengthMm, targetSpeedKmph],
  );

  const ok = !result.error;
  const maxSweep = ok
    ? result.sweep.reduce((max, row) => Math.max(max, row.speedKmph || 0), 1)
    : 1;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Cycling Gearing and Cadence",
      `${chainringTeeth}t chainring / ${cogTeeth}t cog · ${circumferenceMm} mm wheel · ${crankLengthMm} mm cranks`,
      `Gear ratio: ${n3(result.ratio)}`,
      `Speed at ${n1(result.cadenceRpm)} rpm: ${n2(result.speedKmph)} km/h (${n2(result.speedMs)} m/s)`,
      `Development: ${n3(result.developmentM)} m per crank revolution`,
      `Gear inches: ${n1(result.gearInches)}`,
      `Gain ratio: ${n2(result.gainRatio)}`,
      `Cadence band: ${result.band.label} — ${result.band.note}`,
    ];
    if (Number.isFinite(result.requiredCadence)) {
      lines.push(
        `Cadence needed for ${n1(result.targetSpeedKmph)} km/h: ${n1(result.requiredCadence)} rpm`,
      );
    }
    lines.push(
      "",
      ...result.sweep.map((row) => `${row.rpm} rpm: ${n2(row.speedKmph)} km/h`),
    );
    return lines.join("\n");
  }, [ok, result, chainringTeeth, cogTeeth, circumferenceMm, crankLengthMm]);

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
    setChainringTeeth(DEFAULTS.chainringTeeth);
    setCogTeeth(DEFAULTS.cogTeeth);
    setWheel(DEFAULTS.wheel);
    setCircumferenceMm(DEFAULTS.circumferenceMm);
    setCadenceRpm(DEFAULTS.cadenceRpm);
    setCrankLengthMm(DEFAULTS.crankLengthMm);
    setTargetSpeedKmph(DEFAULTS.targetSpeedKmph);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleGauge className="h-4 w-4" aria-hidden="true" />
          Gearing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cycling Cadence Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One turn of the cranks moves you forward by the gear ratio times your wheel circumference.
          Enter chainring, cog, wheel and cadence and get road speed, gear inches, gain ratio and
          metres of development — plus the cadence you would need to hit a target speed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-ring">
              Chainring (teeth)
            </label>
            <input
              id="cd-ring"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="8"
              max="80"
              step="1"
              value={chainringTeeth}
              onChange={(event) => setChainringTeeth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-cog">
              Rear cog (teeth)
            </label>
            <input
              id="cd-cog"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="8"
              max="60"
              step="1"
              value={cogTeeth}
              onChange={(event) => setCogTeeth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-wheel">
              Wheel and tyre
            </label>
            <select
              id="cd-wheel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={wheel}
              onChange={(event) => changeWheel(event.target.value)}
            >
              {Object.entries(WHEEL_SIZES).map(([key, value]) => (
                <option key={key} value={key}>
                  {key} — {value} mm
                </option>
              ))}
              <option value="custom">Custom circumference</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-circ">
              Wheel circumference (mm)
            </label>
            <input
              id="cd-circ"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="800"
              max="3000"
              step="1"
              value={circumferenceMm}
              onChange={(event) => {
                setWheel("custom");
                setCircumferenceMm(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-cadence">
              Cadence (rpm)
            </label>
            <input
              id="cd-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="250"
              step="1"
              value={cadenceRpm}
              onChange={(event) => setCadenceRpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-crank">
              Crank length (mm)
            </label>
            <input
              id="cd-crank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="220"
              step="2.5"
              value={crankLengthMm}
              onChange={(event) => setCrankLengthMm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cd-target">
              Target speed (km/h, optional)
            </label>
            <input
              id="cd-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={targetSpeedKmph}
              onChange={(event) => setTargetSpeedKmph(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          For the exact circumference, mark the tyre and the floor, roll the bike one full wheel turn
          with your weight on it, and measure between the marks.
        </p>
      </section>

      {result.error ? (
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
              Speed at {ok ? n1(result.cadenceRpm) : "—"} rpm
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n2(result.speedKmph)} km/h` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.band.label} — ${result.band.note}`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy gearing and cadence result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && Number.isFinite(result.requiredCadence) ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.requiredCadenceRealistic
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            Holding {n1(result.targetSpeedKmph)} km/h in this gear needs{" "}
            {n1(result.requiredCadence)} rpm
            {result.requiredCadenceRealistic
              ? "."
              : " — outside the range most riders can sustain, so change gear."}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Gear ratio", ok ? `${n3(result.ratio)} : 1` : "—"],
            ["Development per crank turn", ok ? `${n3(result.developmentM)} m` : "—"],
            ["Gear inches", ok ? n1(result.gearInches) : "—"],
            ["Gain ratio", ok ? n2(result.gainRatio) : "—"],
            ["Speed in m/s", ok ? n2(result.speedMs) : "—"],
            [
              "Wheel diameter",
              ok ? `${n1(result.wheelDiameterMm)} mm (${n1(result.wheelDiameterIn)} in)` : "—",
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
        <h2 className="text-base font-semibold">Speed across the cadence range</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same gear, different pedalling speeds.
        </p>
        <ul className="mt-4 space-y-3">
          {ok ? (
            result.sweep.map((row) => (
              <li key={row.rpm}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--muted-foreground)]">{row.rpm} rpm</span>
                  <span className="font-semibold">{n2(row.speedKmph)} km/h</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${Math.max(2, Math.min(100, ((row.speedKmph || 0) / maxSweep) * 100))}%`,
                    }}
                  />
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-[var(--muted-foreground)]">—</li>
          )}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the numbers mean</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Cadence</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">What it feels like</th>
              </tr>
            </thead>
            <tbody>
              {CADENCE_BANDS.map((band, index) => {
                const lower = index === 0 ? 0 : CADENCE_BANDS[index - 1].max;
                const active = ok && result.band.label === band.label;
                return (
                  <tr
                    key={band.label}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "bg-[var(--primary-soft)]" : ""}`}
                  >
                    <td className="py-2 pr-3">
                      {band.max === Infinity ? `Above ${lower} rpm` : `${lower}-${band.max} rpm`}
                    </td>
                    <td className="py-2 pr-3 font-semibold">{band.label}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Gear inches multiplies the ratio by wheel diameter in inches. Gain ratio divides wheel
          radius by crank length first, so it also captures the leverage your cranks give you — two
          bikes at the same gear inches but different crank lengths are not the same gear.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are geometric figures with no allowance for wheel slip, chain flex or the power needed
        to actually turn that gear. A big gear at 90 rpm on paper still has to be pushed on the road.
      </p>
    </main>
  );
}
