"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plug, RotateCcw } from "lucide-react";

import {
  DEVICE_KINDS,
  DEVICE_PRESETS,
  HOME_COUNTRIES,
  JAPAN_OUTLET_AMPS,
  JAPAN_PLUG_TYPES,
  JAPAN_REGIONS,
  JAPAN_VOLTAGE,
  checkJapanCompatibility,
  findCountry,
  presetToInputs,
  regionForCity,
} from "../lib";

const NUM = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const DASH = "—";

const watts = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} W`;
const amps = (value) => `${NUM2.format(Number.isFinite(value) ? value : 0)} A`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICTS = {
  fine: { label: "Plug it straight in", tone: "bg-[var(--success-soft)] text-[var(--success)]" },
  adapter: { label: "Works with a plug adapter", tone: "bg-[var(--info-soft)] text-[var(--info)]" },
  "works-weaker": { label: "Works, but weaker on 100 V", tone: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  caution: { label: "Works, with a catch", tone: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  underpowered: { label: "Badly underpowered on 100 V", tone: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  unsafe: { label: "Do not plug this in", tone: "bg-[var(--danger-soft)] text-[var(--danger)]" },
};

const DEFAULT_HOME = "gb";
const DEFAULT_CITY = "Tokyo";
const DEFAULT_PRESET = "laptop";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const initialFields = (homeId, presetId) => {
  const home = findCountry(homeId);
  const inputs = presetToInputs(presetId, home?.voltage ?? 230);
  return {
    kindId: inputs?.kindId ?? "electronics",
    minVoltage: String(inputs?.minVoltage ?? 100),
    maxVoltage: String(inputs?.maxVoltage ?? 240),
    ratedVoltage: String(inputs?.ratedVoltage ?? 240),
    ratedWatts: String(inputs?.ratedWatts ?? 65),
  };
};

export default function ToolHome() {
  const [homeId, setHomeId] = useState(DEFAULT_HOME);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [presetId, setPresetId] = useState(DEFAULT_PRESET);
  const [fields, setFields] = useState(() => initialFields(DEFAULT_HOME, DEFAULT_PRESET));
  const [copied, setCopied] = useState(false);

  const region = regionForCity(city) ?? JAPAN_REGIONS[0];
  const home = findCountry(homeId) ?? HOME_COUNTRIES[0];

  const result = useMemo(() => {
    const minVoltage = toNumber(fields.minVoltage);
    const maxVoltage = toNumber(fields.maxVoltage);
    const ratedVoltage = toNumber(fields.ratedVoltage);
    const ratedWatts = toNumber(fields.ratedWatts);
    if ([minVoltage, maxVoltage, ratedVoltage, ratedWatts].some(Number.isNaN)) {
      return { error: "Enter the voltage and wattage figures printed on the device label." };
    }
    return checkJapanCompatibility({
      homeId,
      regionId: region.id,
      kindId: fields.kindId,
      minVoltage,
      maxVoltage,
      ratedVoltage,
      ratedWatts,
    });
  }, [homeId, region, fields]);

  const failed = Boolean(result.error);
  const verdict = failed ? null : VERDICTS[result.verdict] ?? VERDICTS.caution;

  const applyHome = (nextHome) => {
    setHomeId(nextHome);
    setFields(initialFields(nextHome, presetId));
  };

  const applyPreset = (nextPreset) => {
    setPresetId(nextPreset);
    setFields(initialFields(homeId, nextPreset));
  };

  const updateField = (patch) => setFields((current) => ({ ...current, ...patch }));

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      `Plugs and voltage in Japan — ${city}`,
      `Supply: ${JAPAN_VOLTAGE} V, ${result.japanHz} Hz, sockets Type ${JAPAN_PLUG_TYPES.join(" and ")}`,
      `Coming from: ${result.home.label} (${result.home.voltage} V, ${result.home.hz} Hz, Type ${result.home.plugs.join("/")})`,
      `Device: ${result.kind.label}, ${fields.minVoltage}-${fields.maxVoltage} V, ${result.ratedWatts} W`,
      "",
      `Verdict: ${VERDICTS[result.verdict]?.label ?? result.verdict}`,
      ...result.actions.map((action) => `  • ${action}`),
      ...result.warnings.map((warning) => `  ! ${warning}`),
      "",
      `Power on 100 V: ${result.actualWatts} W (${result.powerPct}% of rated)`,
      `Current drawn: ${result.currentAmps} A of the ${JAPAN_OUTLET_AMPS} A a Japanese socket supplies`,
    ];
    return lines.join("\n");
  }, [failed, result, city, fields]);

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
    setHomeId(DEFAULT_HOME);
    setCity(DEFAULT_CITY);
    setPresetId(DEFAULT_PRESET);
    setFields(initialFields(DEFAULT_HOME, DEFAULT_PRESET));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plug className="h-4 w-4" aria-hidden="true" />
          Japan power
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Plug and Voltage Guide for Japan
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Japan runs on 100 V — the lowest mains voltage in the world — with Type A sockets and a
          grid that splits at 50 Hz in the east and 60 Hz in the west. Tell it where you are from
          and what you are packing, and it works out whether you need an adapter, a converter, or
          nothing at all.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-home">
              Your device was bought in
            </label>
            <select
              id="jp-home"
              className={`mt-2 ${INPUT_CLASS}`}
              value={homeId}
              onChange={(event) => applyHome(event.target.value)}
            >
              {HOME_COUNTRIES.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.label} — {country.voltage} V, {country.hz} Hz
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-city">
              Where in Japan
            </label>
            <select
              id="jp-city"
              className={`mt-2 ${INPUT_CLASS}`}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              {JAPAN_REGIONS.map((item) => (
                <optgroup key={item.id} label={item.label}>
                  {item.cities.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {city} is on the {region.hz} Hz grid ({region.utilities}).
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jp-preset">
              What are you plugging in
            </label>
            <select
              id="jp-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {DEVICE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jp-kind">
              How it uses power
            </label>
            <select
              id="jp-kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.kindId}
              onChange={(event) => updateField({ kindId: event.target.value })}
            >
              {DEVICE_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="jp-min">
              Lowest voltage on the label (V)
            </label>
            <input
              id="jp-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={fields.minVoltage}
              onChange={(event) => updateField({ minVoltage: event.target.value })}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-max">
              Highest voltage on the label (V)
            </label>
            <input
              id="jp-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={fields.maxVoltage}
              onChange={(event) => updateField({ maxVoltage: event.target.value })}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-rated-v">
              Voltage the wattage is quoted at (V)
            </label>
            <input
              id="jp-rated-v"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={fields.ratedVoltage}
              onChange={(event) => updateField({ ratedVoltage: event.target.value })}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-watts">
              Wattage on the label (W)
            </label>
            <input
              id="jp-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={fields.ratedWatts}
              onChange={(event) => updateField({ ratedWatts: event.target.value })}
            />
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          The figures you need are printed on the plug brick or the appliance base, usually as
          something like &quot;INPUT: 100-240V~ 50/60Hz&quot;. A label reading 100-240V needs no
          converter anywhere in the world.
        </p>
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
              Verdict
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {failed ? DASH : verdict.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fill in the label figures above."
                : `${city} · ${JAPAN_VOLTAGE} V · ${result.japanHz} Hz · sockets Type ${JAPAN_PLUG_TYPES.join(" and ")}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the Japan power compatibility result"
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

        {!failed ? (
          <>
            <div className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${verdict.tone}`}>
              {verdict.label}
            </div>

            <ul className="mt-4 grid gap-2 text-sm">
              {result.actions.map((action) => (
                <li key={action} className="rounded-md border border-[var(--border)] px-3 py-2">
                  {action}
                </li>
              ))}
              {result.warnings.map((warning) => (
                <li
                  key={warning}
                  className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
                >
                  {warning}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Plug adapter needed", failed ? DASH : result.adapterNeeded ? `Yes — Type ${result.adapterType}` : "No"],
            ["Voltage converter needed", failed ? DASH : result.converterNeeded ? `Yes — ${result.converterDirection}` : "No"],
            ["Power delivered on 100 V", failed ? DASH : `${watts(result.actualWatts)} (${pct(result.powerPct)} of rated)`],
            ["Longer to heat up", failed || result.timeFactor === null ? DASH : `${NUM2.format(result.timeFactor)}×`],
            ["Current drawn", failed ? DASH : `${amps(result.currentAmps)} of ${JAPAN_OUTLET_AMPS} A available`],
            ["Frequency in this region", failed ? DASH : `${result.japanHz} Hz (you are used to ${result.home.hz} Hz)`],
            ["Motor or clock speed here", failed || result.speedRatio === null ? DASH : pct(result.speedRatio * 100)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The 50 Hz / 60 Hz split</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Japan is the only country with a permanently divided grid. In the 1890s Tokyo bought 50 Hz
          generators from AEG in Germany and Osaka bought 60 Hz machines from General Electric in the
          United States, and the two halves were never unified. The boundary runs roughly along the
          Fuji River in Shizuoka and the Itoigawa in Niigata, with a handful of frequency converter
          stations linking the two.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Grid</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Cities</th>
                <th scope="col" className="py-2 text-right font-semibold">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {JAPAN_REGIONS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold">{item.label.split(" — ")[0]}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.cities.join(", ")}</td>
                  <td className="py-2 text-right font-semibold">{item.hz} Hz</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guide. Always read your own device label rather than relying on a preset, and
        never run an appliance above its rated voltage — plug adapters change the shape of the pins
        only, not the voltage. If in doubt about a medical device, ask its manufacturer.
      </p>
    </main>
  );
}
