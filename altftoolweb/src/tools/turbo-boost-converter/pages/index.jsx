"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { PRESSURE_UNITS, convertBoost } from "../lib";

const THREE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const TWO = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const ONE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = {
  value: "15",
  unit: "psi",
  reading: "gauge",
  ambientMode: "altitude",
  altitude: "0",
  altitudeUnit: "m",
  ambientValue: "14.6959",
  ambientUnit: "psi",
  ambientTemp: "25",
  tempUnit: "c",
  compressorEff: "70",
  intercoolerEff: "75",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [reading, setReading] = useState(DEFAULTS.reading);
  const [ambientMode, setAmbientMode] = useState(DEFAULTS.ambientMode);
  const [altitude, setAltitude] = useState(DEFAULTS.altitude);
  const [altitudeUnit, setAltitudeUnit] = useState(DEFAULTS.altitudeUnit);
  const [ambientValue, setAmbientValue] = useState(DEFAULTS.ambientValue);
  const [ambientUnit, setAmbientUnit] = useState(DEFAULTS.ambientUnit);
  const [ambientTemp, setAmbientTemp] = useState(DEFAULTS.ambientTemp);
  const [tempUnit, setTempUnit] = useState(DEFAULTS.tempUnit);
  const [compressorEff, setCompressorEff] = useState(DEFAULTS.compressorEff);
  const [intercoolerEff, setIntercoolerEff] = useState(DEFAULTS.intercoolerEff);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertBoost({
        value,
        unit,
        reading,
        ambientMode,
        altitude,
        altitudeUnit,
        ambientValue,
        ambientUnit,
        ambientTemp,
        tempUnit,
        compressorEff,
        intercoolerEff,
      }),
    [
      value,
      unit,
      reading,
      ambientMode,
      altitude,
      altitudeUnit,
      ambientValue,
      ambientUnit,
      ambientTemp,
      tempUnit,
      compressorEff,
      intercoolerEff,
    ],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Turbo Boost Converter",
      `Input: ${value} ${result.sourceShort} ${reading}`,
      `Ambient: ${THREE.format(result.ambientPsi)} psi / ${THREE.format(result.ambientBar)} bar (${result.ambientNote})`,
      `Pressure ratio: ${THREE.format(result.pressureRatio)}`,
      "",
      "Unit          gauge / absolute",
      ...result.conversions.map(
        (row) => `${row.short}: ${THREE.format(row.gauge)} / ${THREE.format(row.absolute)}`,
      ),
    ];
    if (result.charge) {
      lines.push(
        "",
        `Intake air: ${ONE.format(result.charge.tInC)} °C`,
        `Compressor outlet: ${ONE.format(result.charge.tOutC)} °C (rise of ${ONE.format(result.charge.compressorRiseC)} °C)`,
        `After intercooler: ${ONE.format(result.charge.tAfterC)} °C`,
        `Charge density ratio: ${THREE.format(result.charge.densityRatio)} (${ONE.format(result.charge.extraAirPercent)}% more air than atmospheric)`,
        `Without an intercooler it would be: ${THREE.format(result.charge.densityRatioNoIc)}`,
      );
    } else {
      lines.push("", "Reading is below atmospheric — this is vacuum, not boost.");
    }
    return lines.join("\n");
  }, [failed, result, value, reading]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setReading(DEFAULTS.reading);
    setAmbientMode(DEFAULTS.ambientMode);
    setAltitude(DEFAULTS.altitude);
    setAltitudeUnit(DEFAULTS.altitudeUnit);
    setAmbientValue(DEFAULTS.ambientValue);
    setAmbientUnit(DEFAULTS.ambientUnit);
    setAmbientTemp(DEFAULTS.ambientTemp);
    setTempUnit(DEFAULTS.tempUnit);
    setCompressorEff(DEFAULTS.compressorEff);
    setIntercoolerEff(DEFAULTS.intercoolerEff);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Forced induction
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Turbo Boost Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts boost between psi, bar, kPa and inHg in both gauge and absolute terms, works out
          the pressure ratio your compressor map needs, and shows how altitude and charge heating
          change the air the engine actually gets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-value">
              Boost reading
            </label>
            <input
              id="tb-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-unit">
              Unit
            </label>
            <select
              id="tb-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {PRESSURE_UNITS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tb-reading">
              Is that gauge or absolute?
            </label>
            <select
              id="tb-reading"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reading}
              onChange={(event) => setReading(event.target.value)}
            >
              <option value="gauge">Gauge — a boost gauge, zero at atmospheric</option>
              <option value="absolute">Absolute — a MAP sensor reading</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tb-ambmode">
              Set ambient pressure by
            </label>
            <select
              id="tb-ambmode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ambientMode}
              onChange={(event) => setAmbientMode(event.target.value)}
            >
              <option value="altitude">Altitude (standard atmosphere)</option>
              <option value="pressure">A measured barometric pressure</option>
            </select>
          </div>

          {ambientMode === "altitude" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="tb-alt">
                  Altitude
                </label>
                <input
                  id="tb-alt"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  step="50"
                  value={altitude}
                  onChange={(event) => setAltitude(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tb-altunit">
                  Altitude unit
                </label>
                <select
                  id="tb-altunit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={altitudeUnit}
                  onChange={(event) => setAltitudeUnit(event.target.value)}
                >
                  <option value="m">Metres</option>
                  <option value="ft">Feet</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="tb-amb">
                  Ambient pressure
                </label>
                <input
                  id="tb-amb"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.1"
                  value={ambientValue}
                  onChange={(event) => setAmbientValue(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tb-ambunit">
                  Ambient unit
                </label>
                <select
                  id="tb-ambunit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={ambientUnit}
                  onChange={(event) => setAmbientUnit(event.target.value)}
                >
                  {PRESSURE_UNITS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.short}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="tb-temp">
              Intake air temperature
            </label>
            <input
              id="tb-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="1"
              value={ambientTemp}
              onChange={(event) => setAmbientTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-tempunit">
              Temperature unit
            </label>
            <select
              id="tb-tempunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tempUnit}
              onChange={(event) => setTempUnit(event.target.value)}
            >
              <option value="c">Celsius</option>
              <option value="f">Fahrenheit</option>
              <option value="k">Kelvin</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-ceff">
              Compressor efficiency (%)
            </label>
            <input
              id="tb-ceff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={compressorEff}
              onChange={(event) => setCompressorEff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-iceff">
              Intercooler effectiveness (%)
            </label>
            <input
              id="tb-iceff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={intercoolerEff}
              onChange={(event) => setIntercoolerEff(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pressure ratio
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : THREE.format(result.pressureRatio)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to convert."
                : `ambient ${THREE.format(result.ambientPsi)} psi / ${THREE.format(result.ambientBar)} bar — ${result.ambientNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy turbo boost conversion result"
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Unit
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Gauge
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Absolute
                </th>
              </tr>
            </thead>
            <tbody>
              {(failed ? PRESSURE_UNITS : result.conversions).map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                  <td
                    className={`py-2 pr-3 font-semibold ${
                      !failed && row.isSource ? "text-[var(--primary)]" : ""
                    }`}
                  >
                    {row.short}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {failed ? DASH : THREE.format(row.gauge)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {failed ? DASH : THREE.format(row.absolute)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!failed && result.isVacuum && (
        <p className="mt-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          This reading is below atmospheric, so it is manifold vacuum rather than boost. Charge
          heating and density figures only apply above atmospheric pressure.
        </p>
      )}

      {!failed && result.charge && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Charge air temperature and density</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            Compressing air heats it, and hot air is less dense — which is why boost pressure alone
            does not tell you how much air the engine receives.
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "Intake air",
                `${ONE.format(result.charge.tInC)} °C / ${ONE.format(result.charge.tInF)} °F`,
              ],
              [
                "Compressor outlet",
                `${ONE.format(result.charge.tOutC)} °C / ${ONE.format(result.charge.tOutF)} °F`,
              ],
              ["Temperature rise across the compressor", `${ONE.format(result.charge.compressorRiseC)} °C`],
              [
                "After the intercooler",
                `${ONE.format(result.charge.tAfterC)} °C / ${ONE.format(result.charge.tAfterF)} °F`,
              ],
              ["Intercooler removes", `${ONE.format(result.charge.intercoolerDropC)} °C`],
              ["Charge density ratio", THREE.format(result.charge.densityRatio)],
              [
                "Extra air over atmospheric",
                `${ONE.format(result.charge.extraAirPercent)}%`,
              ],
              [
                "Density ratio without an intercooler",
                THREE.format(result.charge.densityRatioNoIc),
              ],
            ].map(([label, text]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{text}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Density ratio tracks airflow, not power directly — fuelling, ignition
        timing, fuel octane and engine mechanical limits all bound what boost is safe. Raising boost
        beyond a manufacturer's calibration can damage an engine.
      </p>
    </main>
  );
}
