"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  Clock,
  Copy,
  Info,
  Lightbulb,
  Plus,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { APPLIANCES, BATTERY_TYPES, TIPS } from "../data";

const POWER_FACTOR = 0.8;
const VA_SIZES = [600, 900, 1100, 1500, 2500];
const AH_SIZES = [100, 150, 180, 220];
const SYSTEM_VOLTAGES = [12, 24, 48];

const num = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampMin = (value, min = 0) => Math.max(min, toNumber(value));

const clampRange = (value, min, max) => Math.min(max, Math.max(min, toNumber(value)));

const nextStandard = (value, sizes) => sizes.find((size) => size >= value) || null;

const uid = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const defaultRows = () => [
  { key: uid(), id: "led-bulb", qty: 4, hours: 4 },
  { key: uid(), id: "ceiling-fan", qty: 2, hours: 4 },
  { key: uid(), id: "led-tv", qty: 1, hours: 2 },
  { key: uid(), id: "wifi-router", qty: 1, hours: 4 },
];

const inputClass =
  "h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";
const smallInputClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";
const cardClass =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]";

const GROUPS = [...new Set(APPLIANCES.map((item) => item.group))];

export default function ToolHome() {
  const [rows, setRows] = useState(defaultRows);
  const [picker, setPicker] = useState("led-bulb");
  const [masterHours, setMasterHours] = useState(4);
  const [systemV, setSystemV] = useState(12);
  const [efficiency, setEfficiency] = useState(0.8);
  const [dod, setDod] = useState(0.8);
  const [batteryAh, setBatteryAh] = useState(150);
  const [chargeCurrent, setChargeCurrent] = useState(15);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const catalog = useMemo(() => new Map(APPLIANCES.map((item) => [item.id, item])), []);

  const items = useMemo(
    () =>
      rows
        .map((row) => {
          const spec = catalog.get(row.id);
          if (!spec) return null;
          const qty = Math.max(0, Math.round(clampMin(row.qty)));
          const hours = clampMin(row.hours);
          const unitWatts =
            row.watts !== undefined && row.watts !== null && row.watts !== ""
              ? clampMin(row.watts, 0)
              : spec.watts;
          const watts = qty * unitWatts;
          return { ...row, spec, qty, hours, unitWatts, watts, wh: watts * hours };
        })
        .filter(Boolean),
    [rows, catalog]
  );

  const load = useMemo(() => {
    const totalW = items.reduce((sum, item) => sum + item.watts, 0);
    const energyWh = items.reduce((sum, item) => sum + item.wh, 0);
    const vaRequired = totalW / POWER_FACTOR;
    const recommendedVA = nextStandard(vaRequired, VA_SIZES);
    const utilisation = recommendedVA ? (vaRequired / recommendedVA) * 100 : 0;

    const surgeItems = items.filter((item) => item.spec.surge && item.qty > 0);
    const worst = surgeItems.reduce(
      (best, item) => {
        const extra = item.spec.surge - item.spec.watts;
        return extra > best.extra ? { extra, item } : best;
      },
      { extra: 0, item: null }
    );
    const peakW = totalW + worst.extra;
    const peakVA = peakW / POWER_FACTOR;
    const surgeSafeVA = nextStandard(peakVA, VA_SIZES);
    const surgeRisk = Boolean(worst.item) && recommendedVA !== null && peakVA > recommendedVA;

    return {
      totalW,
      energyWh,
      vaRequired,
      recommendedVA,
      utilisation,
      worst,
      peakW,
      peakVA,
      surgeSafeVA,
      surgeRisk,
    };
  }, [items]);

  const battery = useMemo(() => {
    const volts = clampMin(systemV, 12);
    const eff = Math.min(1, Math.max(0.1, clampMin(efficiency, 0.1)));
    const depth = Math.min(1, Math.max(0.1, clampMin(dod, 0.1)));
    const divisor = volts * eff * depth;
    const requiredAh = divisor > 0 ? load.energyWh / divisor : 0;
    const recommendedAh = nextStandard(requiredAh, AH_SIZES);
    const maxStandardAh = AH_SIZES[AH_SIZES.length - 1];
    const recommendedParallelCount =
      !recommendedAh && requiredAh > 0 ? Math.ceil(requiredAh / maxStandardAh) : 0;
    const chosenAh = clampMin(batteryAh, 1);
    const seriesCount = Math.max(1, Math.round(volts / 12));
    const recommendedTotalCount = recommendedParallelCount * seriesCount;
    const parallelStrings = chosenAh > 0 ? Math.max(1, Math.ceil(requiredAh / chosenAh)) : 1;
    const totalBatteries = seriesCount * parallelStrings;
    const bankAh = chosenAh * parallelStrings;

    const actualHours = load.totalW > 0 ? (bankAh * volts * eff * depth) / load.totalW : 0;
    const current = clampMin(chargeCurrent, 0.1);
    const chargeHours = current > 0 ? (bankAh / current) * 1.2 : 0;

    return {
      volts,
      eff,
      depth,
      divisor,
      requiredAh,
      recommendedAh,
      maxStandardAh,
      recommendedParallelCount,
      recommendedTotalCount,
      chosenAh,
      seriesCount,
      parallelStrings,
      totalBatteries,
      bankAh,
      actualHours,
      chargeHours,
    };
  }, [systemV, efficiency, dod, batteryAh, chargeCurrent, load.energyWh, load.totalW]);

  const hoursLabel = (value) => {
    if (!Number.isFinite(value) || value <= 0) return "—";
    let h = Math.floor(value);
    let m = Math.round((value - h) * 60);
    if (m === 60) {
      m = 0;
      h += 1;
    }
    if (h === 0) return `${m} min`;
    return `${h} h ${m} min`;
  };

  const addRow = () => {
    if (!catalog.has(picker)) return;
    setRows((current) => [...current, { key: uid(), id: picker, qty: 1, hours: clampMin(masterHours) }]);
  };

  const resetRows = () => {
    if (!window.confirm("Reset the appliance list? This replaces your current rows with the default example and cannot be undone.")) {
      return;
    }
    setRows(defaultRows());
  };

  const updateRow = (key, patch) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const applyHoursToAll = () => {
    const hours = clampMin(masterHours);
    setRows((current) => current.map((row) => ({ ...row, hours })));
  };

  const report = useMemo(
    () =>
      [
        "Inverter & Battery Sizing Report",
        "",
        "APPLIANCE LOAD",
        ...items.map(
          (item) =>
            `  ${item.spec.name} × ${item.qty} @ ${num(item.unitWatts)} W for ${num(item.hours, 1)} h = ${num(
              item.watts
            )} W / ${num(item.wh)} Wh`
        ),
        `  Total connected load: ${num(load.totalW)} W`,
        `  Energy needed: ${num(load.energyWh)} Wh`,
        "",
        "INVERTER",
        `  VA required = ${num(load.totalW)} W ÷ ${POWER_FACTOR} power factor = ${num(load.vaRequired)} VA`,
        `  Recommended inverter: ${load.recommendedVA ? `${num(load.recommendedVA)} VA` : "above 2500 VA — needs a 3.5/5 kVA unit"}`,
        load.worst.item
          ? `  Peak with ${load.worst.item.spec.name} starting: ${num(load.peakW)} W (${num(load.peakVA)} VA)`
          : "  No high-surge appliances in the list.",
        "",
        "BATTERY",
        `  Ah = energy ÷ (system V × efficiency × depth of discharge)`,
        `  Ah = ${num(load.energyWh)} ÷ (${battery.volts} × ${battery.eff} × ${battery.depth}) = ${num(
          battery.requiredAh,
          1
        )} Ah`,
        `  Recommended standard size: ${
          battery.recommendedAh
            ? `${num(battery.recommendedAh)} Ah`
            : `above ${num(battery.maxStandardAh)} Ah — needs ${battery.recommendedTotalCount} × ${num(battery.maxStandardAh)} Ah batteries total (${battery.seriesCount} in series × ${battery.recommendedParallelCount} parallel)`
        }`,
        `  Bank: ${battery.totalBatteries} × 12 V ${num(battery.chosenAh)} Ah (${battery.seriesCount} in series × ${battery.parallelStrings} parallel) = ${num(battery.bankAh)} Ah at ${battery.volts} V`,
        `  Actual backup at ${num(load.totalW)} W: ${hoursLabel(battery.actualHours)}`,
        `  Charging time at ${num(clampMin(chargeCurrent, 0.1))} A (incl. 20% losses): ${hoursLabel(battery.chargeHours)}`,
        "",
        `Generated: ${new Date().toLocaleString("en-IN")}`,
      ].join("\n"),
    [items, load, battery, chargeCurrent]
  );

  const copyReport = async () => {
    const ok = await safeCopyText(report);
    if (!ok) return;
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setCopied(true);
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className={`${cardClass} 2xl:p-8`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <BatteryCharging className="h-4 w-4" />
            Home power backup
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Inverter &amp; Battery Backup Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            List what you actually want running during a power cut and for how long. Get the VA rating, the
            battery Ah, how many batteries the bank needs, the real backup time, and the charging time — with
            every formula shown.
          </p>
          <div className="tool-compact-grid mt-6">
            {[
              ["Connected load", `${num(load.totalW)} W`],
              ["Energy needed", `${num(load.energyWh)} Wh`],
              ["Inverter", load.recommendedVA ? `${num(load.recommendedVA)} VA` : "3.5 kVA+"],
              [
                "Battery",
                battery.recommendedAh
                  ? `${num(battery.recommendedAh)} Ah`
                  : `${battery.recommendedTotalCount} × ${num(battery.maxStandardAh)} Ah`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_390px]">
          <div className={cardClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">What you want to run</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Wattages are typical Indian ratings — edit any of them to match the label on your appliance.
                </p>
              </div>
              <button
                type="button"
                onClick={resetRows}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <label className="block">
                <span className="sr-only">Choose an appliance to add</span>
                <select
                  value={picker}
                  onChange={(event) => setPicker(event.target.value)}
                  className={inputClass}
                >
                  {GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {APPLIANCES.filter((item) => item.group === group).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {item.watts} W
                          {item.surge ? ` (${item.surge} W surge)` : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <button type="button" onClick={addRow} className="btn-secondary h-12 px-4 text-sm">
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <label className="block">
                <span className="text-sm font-semibold">Desired backup (hours)</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={masterHours}
                  onChange={(event) => setMasterHours(Number(event.target.value))}
                  className="mt-2 h-10 w-32 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <button type="button" onClick={applyHoursToAll} className="btn-secondary min-h-10 px-3 py-1.5 text-sm">
                Apply to every appliance
              </button>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Or set different hours per row — the fridge runs all night, the TV does not.
              </p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="p-2 font-semibold">Appliance</th>
                    <th className="p-2 font-semibold">Watts each</th>
                    <th className="p-2 font-semibold">Qty</th>
                    <th className="p-2 font-semibold">Hours</th>
                    <th className="p-2 text-right font-semibold">Load</th>
                    <th className="p-2 text-right font-semibold">Energy</th>
                    <th className="p-2 sr-only">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-[var(--muted-foreground)]">
                        Add an appliance above to start sizing.
                      </td>
                    </tr>
                  )}
                  {items.map((item) => (
                    <tr key={item.key} className="border-b border-[var(--border)]">
                      <td className="p-2">
                        <span className="font-semibold">{item.spec.name}</span>
                        {item.spec.surge && (
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {item.spec.surge} W starting surge
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <label className="block">
                          <span className="sr-only">Watts each for {item.spec.name}</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unitWatts}
                            onChange={(event) => updateRow(item.key, { watts: Number(event.target.value) })}
                            className={`w-20 ${smallInputClass}`}
                          />
                        </label>
                      </td>
                      <td className="p-2">
                        <label className="block">
                          <span className="sr-only">Quantity of {item.spec.name}</span>
                          <input
                            type="number"
                            min="0"
                            value={item.qty}
                            onChange={(event) => updateRow(item.key, { qty: Number(event.target.value) })}
                            className={`w-20 ${smallInputClass}`}
                          />
                        </label>
                      </td>
                      <td className="p-2">
                        <label className="block">
                          <span className="sr-only">Backup hours for {item.spec.name}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.hours}
                            onChange={(event) => updateRow(item.key, { hours: Number(event.target.value) })}
                            className={`w-20 ${smallInputClass}`}
                          />
                        </label>
                      </td>
                      <td className="p-2 text-right font-semibold tabular-nums">{num(item.watts)} W</td>
                      <td className="p-2 text-right tabular-nums text-[var(--muted-foreground)]">
                        {num(item.wh)} Wh
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => setRows((current) => current.filter((row) => row.key !== item.key))}
                          aria-label={`Remove ${item.spec.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="p-2" colSpan={4}>
                      Total
                    </td>
                    <td className="p-2 text-right tabular-nums text-[var(--primary)]">{num(load.totalW)} W</td>
                    <td className="p-2 text-right tabular-nums text-[var(--primary)]">
                      {num(load.energyWh)} Wh
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {items.some((item) => item.spec.note) && (
              <div className="mt-4 grid gap-2">
                {items
                  .filter((item) => item.spec.note)
                  .map((item) => (
                    <p
                      key={`note-${item.key}`}
                      className="flex items-start gap-2 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3 text-xs leading-5"
                    >
                      <AlertTriangle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: item.spec.heavy ? "var(--anslation-ds-danger)" : "var(--primary)" }}
                      />
                      <span>
                        <strong>{item.spec.name}:</strong> {item.spec.note}
                      </span>
                    </p>
                  ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className={cardClass}>
              <div className="mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Inverter size</h2>
              </div>
              <div className="mt-3 rounded-md bg-[var(--muted)] p-4" aria-live="polite">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Recommended rating
                </p>
                <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                  {load.recommendedVA ? `${num(load.recommendedVA)} VA` : "3.5 kVA+"}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula: {num(load.totalW)} W ÷ {POWER_FACTOR} power factor = {num(load.vaRequired)} VA
                  required, rounded up to the next standard size.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {VA_SIZES.map((size) => {
                  const active = size === load.recommendedVA;
                  return (
                    <span
                      key={size}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        active
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {num(size)} VA
                    </span>
                  );
                })}
              </div>

              {load.recommendedVA && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                    <span>Utilisation of a {num(load.recommendedVA)} VA unit</span>
                    <span className="font-semibold">{num(load.utilisation)}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, load.utilisation)}%`,
                        background:
                          load.utilisation > 80 ? "var(--anslation-ds-danger)" : "var(--anslation-ds-success)",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    {load.utilisation > 80
                      ? "Above 80% — go one size up so the inverter is not running at its limit."
                      : "Comfortable — under the 80% loading you want for a long inverter life."}
                  </p>
                </div>
              )}

              {!load.recommendedVA && (
                <p className="mt-3 flex items-start gap-2 text-xs leading-5">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: "var(--anslation-ds-danger)" }}
                  />
                  <span className="text-[var(--muted-foreground)]">
                    {num(load.vaRequired)} VA is past the 2500 VA home range. You are into 3.5/5 kVA
                    territory — that is a 48 V bank and a dedicated installation, not a plug-in home inverter.
                  </span>
                </p>
              )}

              {load.surgeRisk && load.worst.item && (
                <div
                  role="alert"
                  className="mt-3 rounded-md border p-3 text-xs leading-5"
                  style={{ borderColor: "var(--anslation-ds-danger)" }}
                >
                  <p className="flex items-start gap-2">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: "var(--anslation-ds-danger)" }}
                    />
                    <span>
                      <strong>Surge warning.</strong> When the {load.worst.item.spec.name} starts, the draw
                      jumps to {num(load.peakW)} W ({num(load.peakVA)} VA) for a moment — past the{" "}
                      {num(load.recommendedVA)} VA unit. Either size up to{" "}
                      {load.surgeSafeVA ? `${num(load.surgeSafeVA)} VA` : "a 3.5 kVA+ unit"} or make sure it is
                      not starting while everything else is on.
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className={cardClass}>
              <div className="mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Backup &amp; charging</h2>
              </div>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Reverse check — what your chosen bank actually delivers.
              </p>

              <div className="mt-3 grid gap-3">
                <div className="rounded-md bg-[var(--muted)] p-4" aria-live="polite">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Real backup at {num(load.totalW)} W
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                    {hoursLabel(battery.actualHours)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    ({num(battery.bankAh)} Ah × {battery.volts} V × {battery.eff} × {battery.depth}) ÷{" "}
                    {num(load.totalW)} W
                  </p>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold">Charging current (A)</span>
                  <input
                    type="number"
                    min="1"
                    value={chargeCurrent}
                    onChange={(event) => setChargeCurrent(Number(event.target.value))}
                    onBlur={(event) => setChargeCurrent(clampMin(event.target.value, 0.1))}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>

                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Time to charge from flat</p>
                  <p className="mt-1 text-xl font-semibold">{hoursLabel(battery.chargeHours)}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    Formula: {num(battery.bankAh)} Ah ÷ {num(clampMin(chargeCurrent, 0.1))} A × 1.2 (20%
                    charging losses).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${cardClass} mt-6`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Battery sizing</h2>
            </div>
            <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy sizing report"}
            </button>
          </div>

          <div className="rounded-md bg-[var(--muted)] p-4" aria-live="polite">
            <p className="text-sm font-semibold">
              Ah = (load W × backup hrs) ÷ (battery V × inverter efficiency × depth of discharge)
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Ah = {num(load.energyWh)} Wh ÷ ({battery.volts} × {battery.eff} × {battery.depth}) ={" "}
              {num(load.energyWh)} ÷ {num(battery.divisor, 2)} ={" "}
              <strong className="text-[var(--primary)]">{num(battery.requiredAh, 1)} Ah</strong>
            </p>
          </div>

          <div className="tool-compact-grid mt-4">
            {[
              ["Energy needed", `${num(load.energyWh)} Wh`, "Σ (watts × qty × hours) across every row"],
              ["System voltage", `${battery.volts} V`, `${battery.seriesCount} × 12 V battery in series`],
              ["Inverter efficiency", `${battery.eff}`, "Losses converting DC to AC — typically 0.75–0.85"],
              ["Depth of discharge", `${battery.depth}`, "How far you may safely drain a lead-acid battery"],
            ].map(([label, value, hint]) => (
              <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
                <p className="mt-1 text-xs leading-4 text-[var(--muted-foreground)]">{hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div>
              <span className="text-sm font-semibold">System voltage</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {SYSTEM_VOLTAGES.map((volts) => (
                  <button
                    key={volts}
                    type="button"
                    onClick={() => setSystemV(volts)}
                    aria-pressed={systemV === volts}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      systemV === volts
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {volts} V
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold">Inverter efficiency</span>
              <input
                type="number"
                min="0.1"
                max="1"
                step="0.05"
                value={efficiency}
                onChange={(event) => setEfficiency(Number(event.target.value))}
                onBlur={(event) => setEfficiency(clampRange(event.target.value, 0.1, 1))}
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Depth of discharge</span>
              <input
                type="number"
                min="0.1"
                max="1"
                step="0.05"
                value={dod}
                onChange={(event) => setDod(Number(event.target.value))}
                onBlur={(event) => setDod(clampRange(event.target.value, 0.1, 1))}
                className={`mt-2 ${inputClass}`}
              />
              <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                0.8 for tubular, 0.5–0.6 for flat plate, up to 0.9 for lithium
              </span>
            </label>
          </div>

          <div className="mt-5">
            <span className="text-sm font-semibold">Standard battery sizes</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {AH_SIZES.map((size) => {
                const selected = size === battery.chosenAh;
                const suggested = size === battery.recommendedAh;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBatteryAh(size)}
                    aria-pressed={selected}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {size} Ah{suggested ? " · recommended" : ""}
                  </button>
                );
              })}
            </div>
            {!battery.recommendedAh && (
              <p className="mt-3 flex items-start gap-2 text-xs leading-5">
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--anslation-ds-danger)" }}
                />
                <span className="text-[var(--muted-foreground)]">
                  {num(battery.requiredAh, 1)} Ah needed is past the largest standard size (
                  {num(battery.maxStandardAh)} Ah). No single battery covers this — you would need{" "}
                  {battery.recommendedTotalCount} × {num(battery.maxStandardAh)} Ah batteries total (
                  {battery.seriesCount} in series × {battery.recommendedParallelCount} parallel strings), or
                  a custom higher-capacity bank, to actually get this backup time.
                </span>
              </p>
            )}
          </div>

          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4" aria-live="polite">
            <p className="text-sm font-semibold">Your battery bank</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {battery.totalBatteries} × 12 V {num(battery.chosenAh)} Ah
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {battery.seriesCount > 1
                ? `${battery.seriesCount} batteries in series make the ${battery.volts} V bank`
                : `A single 12 V battery per string`}
              {battery.parallelStrings > 1
                ? `, and ${battery.parallelStrings} such strings in parallel give ${num(battery.bankAh)} Ah — ${num(battery.requiredAh, 1)} Ah was needed.`
                : `, giving ${num(battery.bankAh)} Ah against the ${num(battery.requiredAh, 1)} Ah needed.`}
              {battery.bankAh < battery.requiredAh &&
                " This bank is smaller than required — expect less backup than you asked for."}
            </p>
          </div>
        </section>

        <section className={`${cardClass} mt-6`}>
          <div className="mb-1 flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Which battery type?</h2>
          </div>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            The cheapest battery is rarely the cheapest over five years. Cost per cycle is what actually
            matters.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="p-2 font-semibold">Type</th>
                  <th className="p-2 font-semibold">Life</th>
                  <th className="p-2 font-semibold">Typical cost</th>
                  <th className="p-2 font-semibold">Maintenance</th>
                  <th className="p-2 font-semibold">Usable depth</th>
                  <th className="p-2 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody>
                {BATTERY_TYPES.map((type) => (
                  <tr key={type.id} className="border-b border-[var(--border)]">
                    <td className="p-2 font-semibold">
                      {type.name}
                      {type.popular && (
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase text-[var(--primary)]">
                          Most popular in India
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-[var(--muted-foreground)]">{type.life}</td>
                    <td className="p-2 text-[var(--muted-foreground)]">{type.cost}</td>
                    <td className="p-2 text-[var(--muted-foreground)]">{type.maintenance}</td>
                    <td className="p-2 text-[var(--muted-foreground)]">{type.dod}</td>
                    <td className="p-2 text-[var(--muted-foreground)]">{type.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Prices are indicative Indian retail ranges and move with lead and lithium rates — treat them as a
            comparison, not a quote.
          </p>
        </section>

        <section className={`${cardClass} mt-6`}>
          <div className="mb-1 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Before you buy</h2>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {TIPS.map(([title, body]) => (
              <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
