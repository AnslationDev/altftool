"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import {
  APPLIANCE_PRESETS,
  NOMINAL_VOLTAGE,
  RANGE_BUFFER_VOLTS,
  SUPPLY_TOLERANCE_PCT,
  WORKING_RANGES,
  selectStabilizer,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PRESET = "ac-1.5";
const DEFAULTS = {
  presetId: DEFAULT_PRESET,
  watts: "1500",
  powerFactor: "0.85",
  marginFactor: "2",
  siteMinVolts: "170",
  siteMaxVolts: "260",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [watts, setWatts] = useState(DEFAULTS.watts);
  const [powerFactor, setPowerFactor] = useState(DEFAULTS.powerFactor);
  const [marginFactor, setMarginFactor] = useState(DEFAULTS.marginFactor);
  const [siteMinVolts, setSiteMinVolts] = useState(DEFAULTS.siteMinVolts);
  const [siteMaxVolts, setSiteMaxVolts] = useState(DEFAULTS.siteMaxVolts);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectStabilizer({
        watts: toNumber(watts),
        powerFactor: toNumber(powerFactor),
        marginFactor: toNumber(marginFactor),
        siteMinVolts: toNumber(siteMinVolts),
        siteMaxVolts: toNumber(siteMaxVolts),
        nominalVolts: NOMINAL_VOLTAGE,
      }),
    [watts, powerFactor, marginFactor, siteMinVolts, siteMaxVolts],
  );

  const ok = !result.error;
  const presetLabel =
    APPLIANCE_PRESETS.find((preset) => preset.id === presetId)?.label ?? "Custom appliance";

  const applyPreset = (id) => {
    const preset = APPLIANCE_PRESETS.find((entry) => entry.id === id);
    setPresetId(id);
    if (!preset) return;
    setWatts(String(preset.watts));
    setPowerFactor(String(preset.pf));
    setMarginFactor(String(preset.margin));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Voltage Stabilizer Selector",
      `Appliance: ${presetLabel} — ${watts} W at power factor ${powerFactor}`,
      `Load: ${NUM.format(result.loadVa)} VA · with ${marginFactor}x margin: ${NUM.format(result.requiredVa)} VA`,
      `Recommended stabilizer: ${NUM1.format(result.recommendedKva)} kVA (${NUM.format(result.recommendedVa)} VA)`,
      `Site voltage swing: ${siteMinVolts}–${siteMaxVolts} V`,
      `Working range needed: ${result.chosenRange ? result.chosenRange.label : "wider than any standard domestic unit"}`,
      `Output current at ${NOMINAL_VOLTAGE} V: ${NUM2.format(result.outputCurrent)} A`,
      `Input current at ${siteMinVolts} V: ${NUM2.format(result.inputCurrentAtMin)} A`,
      ...result.notes.map((note) => `- ${note}`),
    ].join("\n");
  }, [ok, result, presetLabel, watts, powerFactor, marginFactor, siteMinVolts, siteMaxVolts]);

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
    setPresetId(DEFAULTS.presetId);
    setWatts(DEFAULTS.watts);
    setPowerFactor(DEFAULTS.powerFactor);
    setMarginFactor(DEFAULTS.marginFactor);
    setSiteMinVolts(DEFAULTS.siteMinVolts);
    setSiteMaxVolts(DEFAULTS.siteMaxVolts);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Home electrical
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Voltage Stabilizer Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two decisions, one screen: the kVA rating that carries your appliance including its
          start-up surge, and the working range wide enough to cover the voltage your supply
          actually swings between.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vss-preset">
              Appliance
            </label>
            <select
              id="vss-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {APPLIANCE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vss-watts">
              Running power (W)
            </label>
            <input
              id="vss-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={watts}
              onChange={(event) => setWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vss-pf">
              Power factor
            </label>
            <input
              id="vss-pf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.05"
              value={powerFactor}
              onChange={(event) => setPowerFactor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vss-margin">
              Safety margin (x load VA)
            </label>
            <input
              id="vss-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="4"
              step="0.25"
              value={marginFactor}
              onChange={(event) => setMarginFactor(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              2x for anything with a compressor or motor, 1.25x for electronics.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:col-span-1">
            <div>
              <label className={LABEL_CLASS} htmlFor="vss-vmin">
                Lowest supply voltage (V)
              </label>
              <input
                id="vss-vmin"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="50"
                max="400"
                step="1"
                value={siteMinVolts}
                onChange={(event) => setSiteMinVolts(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vss-vmax">
                Highest supply voltage (V)
              </label>
              <input
                id="vss-vmax"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="50"
                max="400"
                step="1"
                value={siteMaxVolts}
                onChange={(event) => setSiteMaxVolts(event.target.value)}
              />
            </div>
          </div>
        </div>
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
              Buy this stabilizer
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite" aria-atomic="true">
              {ok ? `${NUM1.format(result.recommendedKva)} kVA` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.oversizedRequirement
                  ? `Exceeds the ${NUM.format(result.recommendedVa)} VA domestic ceiling — use a commercial/industrial unit.`
                  : result.chosenRange
                    ? `Working range ${result.chosenRange.label}`
                    : "No standard domestic working range covers your voltage swing."
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy stabilizer recommendation"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Load in VA (watts / power factor)", ok ? `${NUM.format(result.loadVa)} VA` : DASH],
            ["Required capacity with margin", ok ? `${NUM.format(result.requiredVa)} VA` : DASH],
            ["Standard size chosen", ok ? `${NUM.format(result.recommendedVa)} VA` : DASH],
            [
              ok && result.oversizedRequirement ? "Shortfall" : "Spare capacity",
              ok ? `${NUM1.format(result.headroomPct)}%` : DASH,
            ],
            [
              `Output current at ${NOMINAL_VOLTAGE} V`,
              ok ? `${NUM2.format(result.outputCurrent)} A` : DASH,
            ],
            [
              "Input current at your lowest voltage",
              ok ? `${NUM2.format(result.inputCurrentAtMin)} A` : DASH,
            ],
            ["Boost needed at lowest voltage", ok ? `${NUM1.format(result.boostRatio * 100 - 100)}%` : DASH],
            [
              `Statutory band (+/-${SUPPLY_TOLERANCE_PCT}%)`,
              ok
                ? `${NUM.format(result.toleranceLow)}–${NUM.format(result.toleranceHigh)} V · your supply is ${
                    result.withinStatutory ? "inside it" : "outside it"
                  }`
                : DASH,
            ],
            ["Stabilizer technology", ok && result.chosenRange ? result.chosenRange.type : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd
                className={`text-right font-semibold ${
                  ok && result.oversizedRequirement && label === "Shortfall" ? "text-[var(--danger)]" : ""
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {ok && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.notes.map((note) => (
              <li
                key={note}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Working ranges on the market</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A range is only usable if it clears your swing by at least {RANGE_BUFFER_VOLTS} V at each
          end, otherwise the unit cuts off during a dip or spike.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Range</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                <th scope="col" className="py-2 text-right font-semibold">Covers your swing</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.rangeFit : WORKING_RANGES).map((range) => (
                <tr key={range.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{range.label}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{range.type}</td>
                  <td className="py-2 text-right font-semibold">
                    {!ok ? DASH : range.covers ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Measure your supply with a multimeter across a few days — including
        evening peak — before fixing the range, and let a licensed electrician install anything
        drawing more than a normal 6 A socket.
      </p>
    </main>
  );
}
