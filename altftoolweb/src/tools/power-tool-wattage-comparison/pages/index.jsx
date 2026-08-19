"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  BATTERY_CHEMISTRY,
  DEFAULT_INVERTER_EFFICIENCY,
  MOTOR_TYPES,
  TOOL_LIBRARY,
  comparePowerTools,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const w0 = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} W` : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  selection: { "circular-saw": 1, "led-light": 1, vacuum: 1 },
  voltage: "230",
  supplyType: "generator",
  running: "3000",
  surge: "3500",
  altitude: "0",
  ambient: "25",
  batteryAh: "100",
  batteryV: "12",
  chemistry: "lead",
  efficiency: String(DEFAULT_INVERTER_EFFICIENCY),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [selection, setSelection] = useState(DEFAULTS.selection);
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [supplyType, setSupplyType] = useState(DEFAULTS.supplyType);
  const [running, setRunning] = useState(DEFAULTS.running);
  const [surge, setSurge] = useState(DEFAULTS.surge);
  const [altitude, setAltitude] = useState(DEFAULTS.altitude);
  const [ambient, setAmbient] = useState(DEFAULTS.ambient);
  const [batteryAh, setBatteryAh] = useState(DEFAULTS.batteryAh);
  const [batteryV, setBatteryV] = useState(DEFAULTS.batteryV);
  const [chemistry, setChemistry] = useState(DEFAULTS.chemistry);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [copied, setCopied] = useState(false);

  const selectionList = useMemo(
    () => Object.entries(selection).map(([id, quantity]) => ({ id, quantity })),
    [selection],
  );

  const result = useMemo(
    () =>
      comparePowerTools({
        selection: selectionList,
        voltage: toNumber(voltage),
        supplyType,
        supplyRunningW: toNumber(running),
        supplySurgeW: toNumber(surge),
        altitudeM: toNumber(altitude),
        ambientC: toNumber(ambient),
        batteryAh: toNumber(batteryAh),
        batteryV: toNumber(batteryV),
        chemistry,
        inverterEfficiency: toNumber(efficiency),
      }),
    [
      selectionList,
      voltage,
      supplyType,
      running,
      surge,
      altitude,
      ambient,
      batteryAh,
      batteryV,
      chemistry,
      efficiency,
    ],
  );

  const failed = Boolean(result.error);

  const toggleTool = (id) =>
    setSelection((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });

  const setQuantity = (id, value) =>
    setSelection((prev) => {
      const quantity = Math.max(1, Math.round(Number(value) || 1));
      return { ...prev, [id]: quantity };
    });

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Power Tool Load Check",
      ...result.items.map(
        (item) =>
          `${item.quantity} × ${item.label}: ${w0(item.runningW)} running, ${w0(item.surgeW)} starting (${item.motor.label})`,
      ),
      "",
      `Total running: ${w0(result.runningW)} / ${num0Safe(result.runningVA)} VA at PF ${num2(result.combinedPowerFactor)}`,
      `Current: ${num1(result.runningAmps)} A at ${result.voltage} V`,
      `Worst start: ${result.hardest.label} needs ${w0(result.peakW)}`,
      result.supplyType === "generator"
        ? `Generator derated to ${NUM0.format(result.derate * 100)}%: ${w0(result.availableRunningW)} continuous, ${w0(result.availableSurgeW)} surge`
        : `Inverter: ${w0(result.availableRunningW)} continuous, ${w0(result.availableSurgeW)} surge, runtime ${num1(result.runtimeHours)} h`,
      result.verdict,
    ].join("\n");
  }, [failed, result]);

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
    setSelection(DEFAULTS.selection);
    setVoltage(DEFAULTS.voltage);
    setSupplyType(DEFAULTS.supplyType);
    setRunning(DEFAULTS.running);
    setSurge(DEFAULTS.surge);
    setAltitude(DEFAULTS.altitude);
    setAmbient(DEFAULTS.ambient);
    setBatteryAh(DEFAULTS.batteryAh);
    setBatteryV(DEFAULTS.batteryV);
    setChemistry(DEFAULTS.chemistry);
    setEfficiency(DEFAULTS.efficiency);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Site power
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Power Tool Wattage Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The number on the tool is what it draws once it is turning. What trips a generator is the
          start: an induction motor pulls around five times running power for the first second, and
          a brushed one about twice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Tools running at once</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOOL_LIBRARY.map((tool) => {
            const active = Boolean(selection[tool.id]);
            return (
              <div
                key={tool.id}
                className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <input
                  id={`pt-${tool.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={active}
                  onChange={() => toggleTool(tool.id)}
                />
                <label htmlFor={`pt-${tool.id}`} className="min-w-0 flex-1 cursor-pointer text-sm">
                  <span className="block truncate">{tool.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {tool.watts} W · {MOTOR_TYPES[tool.motor].label}
                  </span>
                </label>
                {active && (
                  <input
                    aria-label={`Quantity of ${tool.label}`}
                    className="h-9 w-14 shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="20"
                    step="1"
                    value={selection[tool.id]}
                    onChange={(event) => setQuantity(tool.id, event.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your supply</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-supply">
              Supply type
            </label>
            <select
              id="pt-supply"
              className={`mt-2 ${INPUT_CLASS}`}
              value={supplyType}
              onChange={(event) => setSupplyType(event.target.value)}
            >
              <option value="generator">Petrol or diesel generator</option>
              <option value="inverter">Battery inverter</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-voltage">
              Mains voltage (V)
            </label>
            <select
              id="pt-voltage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={voltage}
              onChange={(event) => setVoltage(event.target.value)}
            >
              <option value="230">230 V</option>
              <option value="240">240 V</option>
              <option value="120">120 V</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-running">
              Continuous rating (W)
            </label>
            <input
              id="pt-running"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={running}
              onChange={(event) => setRunning(event.target.value)}
            />
            <p className={HINT_CLASS}>
              A generator sold as 3.5 kVA at power factor 0.8 is 2,800 W continuous.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-surge">
              Surge or peak rating (W)
            </label>
            <input
              id="pt-surge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={surge}
              onChange={(event) => setSurge(event.target.value)}
            />
          </div>

          {supplyType === "generator" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="pt-altitude">
                  Altitude (m)
                </label>
                <input
                  id="pt-altitude"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="100"
                  value={altitude}
                  onChange={(event) => setAltitude(event.target.value)}
                />
                <p className={HINT_CLASS}>Output falls about 3% per 300 m of elevation.</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pt-ambient">
                  Ambient temperature (°C)
                </label>
                <input
                  id="pt-ambient"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="-30"
                  max="60"
                  step="1"
                  value={ambient}
                  onChange={(event) => setAmbient(event.target.value)}
                />
                <p className={HINT_CLASS}>And about 1% per 5.6 °C above 25 °C.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="pt-ah">
                  Battery capacity (Ah)
                </label>
                <input
                  id="pt-ah"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="10"
                  value={batteryAh}
                  onChange={(event) => setBatteryAh(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pt-bv">
                  Battery voltage (V)
                </label>
                <select
                  id="pt-bv"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={batteryV}
                  onChange={(event) => setBatteryV(event.target.value)}
                >
                  <option value="12">12 V</option>
                  <option value="24">24 V</option>
                  <option value="48">48 V</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pt-chem">
                  Battery chemistry
                </label>
                <select
                  id="pt-chem"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={chemistry}
                  onChange={(event) => setChemistry(event.target.value)}
                >
                  {Object.entries(BATTERY_CHEMISTRY).map(([id, entry]) => (
                    <option key={id} value={id}>
                      {entry.label} — {Math.round(entry.depthOfDischarge * 100)}% usable
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pt-eff">
                  Inverter efficiency
                </label>
                <input
                  id="pt-eff"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  max="1"
                  step="0.01"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section aria-live="polite" role="status" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Peak demand at start-up
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : w0(result.peakW)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Add tools and a supply rating above."
                : `${w0(result.runningW)} running, worst start is the ${result.hardest.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the load calculation"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.passes
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total running power", failed ? DASH : w0(result.runningW)],
            [
              "Apparent power",
              failed ? DASH : `${NUM0.format(result.runningVA)} VA at PF ${num2(result.combinedPowerFactor)}`,
            ],
            ["Running current", failed ? DASH : `${num1(result.runningAmps)} A`],
            ["Current during the worst start", failed ? DASH : `${num1(result.peakAmps)} A`],
            [
              "Supply after derating",
              failed
                ? DASH
                : `${w0(result.availableRunningW)} continuous / ${w0(result.availableSurgeW)} surge`,
            ],
            [
              "Derating factor",
              failed || result.supplyType !== "generator"
                ? DASH
                : `${NUM1.format(result.derate * 100)} %`,
            ],
            ["Headroom on continuous", failed ? DASH : `${NUM0.format(result.headroomPct)} %`],
            ["Smallest supply that copes", failed ? DASH : w0(result.recommendedSupplyW)],
            [
              "Usable battery energy",
              failed || result.usableWh === null ? DASH : `${NUM0.format(result.usableWh)} Wh`,
            ],
            [
              "Runtime at this load",
              failed || result.runtimeHours === null
                ? DASH
                : `${num1(result.runtimeHours)} h (${NUM0.format(result.runtimeHours * 60)} min)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Tool by tool</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tool
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Running
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Starting
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Amps each
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Motor
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.quantity}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{w0(item.runningW)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{w0(item.surgeW)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {num1(item.ampsEach)} A
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{item.motor.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why motor type decides everything</h2>
        <dl className="mt-3 space-y-3 text-sm">
          {Object.entries(MOTOR_TYPES).map(([id, motor]) => (
            <div key={id}>
              <dt className="font-semibold">
                {motor.label} — {motor.surgeFactor}× surge, power factor {motor.powerFactor}
              </dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{motor.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Wattages are typical figures for tools of that size; the rating plate on your own tool is
        the authority. Surge multiples are family averages and a particular motor can be higher.
        Generators, extension leads and portable supplies all have their own safety requirements —
        never run a fuel generator indoors or in a partly enclosed space, and have any permanent
        wiring or changeover switching done by a qualified electrician.
      </p>
    </main>
  );
}

function num0Safe(value) {
  return Number.isFinite(value) ? NUM0.format(value) : DASH;
}
