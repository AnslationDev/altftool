"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Copy,
  Info,
  LandPlot,
  MapPin,
  Maximize2,
  RotateCcw,
  Ruler,
  Table,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { FAMILY_LABELS, QUICK_FACTS, STATES, UNIVERSAL_UNITS } from "../data";

const DIM_UNITS = [
  { id: "ft", label: "Feet", toFt: 1 },
  { id: "m", label: "Metres", toFt: 3.280839895 },
  { id: "yd", label: "Yards (gaj)", toFt: 3 },
];

const formatArea = (value) => {
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  let digits = 2;
  if (abs < 0.01) digits = 8;
  else if (abs < 1) digits = 6;
  else if (abs < 100) digits = 4;
  else if (abs < 1000) digits = 3;
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
};

const sanitizeNumeric = (text) =>
  String(text)
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1");

const familyStateCount = {};
STATES.forEach((state) => {
  const seen = new Set();
  state.units.forEach((unit) => {
    if (seen.has(unit.family)) return;
    seen.add(unit.family);
    familyStateCount[unit.family] = (familyStateCount[unit.family] || 0) + 1;
  });
});

const rowsForFamily = (family) =>
  STATES.flatMap((state) =>
    state.units
      .filter((unit) => unit.family === family)
      .map((unit) => ({ ...unit, stateId: state.id, stateName: state.name }))
  );

const COMPARABLE_FAMILIES = Object.keys(familyStateCount)
  .filter((family) => familyStateCount[family] > 1)
  .map((family) => {
    const values = rowsForFamily(family).map((row) => row.sqft);
    return {
      id: family,
      label: FAMILY_LABELS[family] || family,
      states: familyStateCount[family],
      spread: Math.max(...values) / Math.min(...values),
    };
  })
  .sort((a, b) => b.spread - a.spread || b.states - a.states);

const REFERENCE_ROWS = [
  ...UNIVERSAL_UNITS.map((unit) => ({
    key: `all:${unit.id}`,
    name: unit.name,
    region: "All India",
    sqft: unit.sqft,
    basis: unit.basis,
  })),
  ...STATES.flatMap((state) =>
    state.units.map((unit) => ({
      key: `${state.id}:${unit.id}`,
      name: unit.name,
      region: state.name,
      sqft: unit.sqft,
      basis: unit.basis,
    }))
  ),
].sort((a, b) => b.sqft - a.sqft);

export default function ToolHome() {
  const [stateId, setStateId] = useState("up");
  const [baseSqft, setBaseSqft] = useState(27000);
  const [activeUnit, setActiveUnit] = useState("");
  const [activeRaw, setActiveRaw] = useState("");
  const [dimLength, setDimLength] = useState(30);
  const [dimWidth, setDimWidth] = useState(40);
  const [dimUnit, setDimUnit] = useState("ft");
  const [familyId, setFamilyId] = useState("bigha");
  const [tableFilter, setTableFilter] = useState("");
  const [showAllRows, setShowAllRows] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeState = useMemo(
    () => STATES.find((state) => state.id === stateId) || STATES[0],
    [stateId]
  );

  const handleUnitInput = (key, factor, text) => {
    const cleaned = sanitizeNumeric(text);
    setActiveUnit(key);
    setActiveRaw(cleaned);
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) setBaseSqft(parsed * factor);
  };

  const displayValue = (key, factor) =>
    activeUnit === key ? activeRaw : formatArea(baseSqft / factor);

  const setArea = (sqft) => {
    setBaseSqft(sqft);
    setActiveUnit("");
    setActiveRaw("");
  };

  const plotSqft = useMemo(() => {
    const factor = DIM_UNITS.find((item) => item.id === dimUnit)?.toFt || 1;
    const length = (Number(dimLength) || 0) * factor;
    const width = (Number(dimWidth) || 0) * factor;
    return length * width;
  }, [dimLength, dimWidth, dimUnit]);

  const presets = useMemo(() => {
    const list = [
      { label: "1 acre", sqft: 43560 },
      { label: "1 hectare", sqft: 107639.104167 },
      { label: "1,200 sq ft flat", sqft: 1200 },
      { label: "100 gaj plot", sqft: 900 },
    ];
    const first = activeState.units[0];
    if (first) list.unshift({ label: `1 ${first.name}`, sqft: first.sqft });
    return list;
  }, [activeState]);

  const comparisonRows = useMemo(
    () => rowsForFamily(familyId).sort((a, b) => b.sqft - a.sqft),
    [familyId]
  );

  const comparison = useMemo(() => {
    if (comparisonRows.length < 2) return null;
    const largest = comparisonRows[0];
    const smallest = comparisonRows[comparisonRows.length - 1];
    return {
      largest,
      smallest,
      ratio: smallest.sqft === 0 ? 1 : largest.sqft / smallest.sqft,
      max: largest.sqft,
    };
  }, [comparisonRows]);

  const filteredRows = useMemo(() => {
    const query = tableFilter.trim().toLowerCase();
    if (!query) return REFERENCE_ROWS;
    return REFERENCE_ROWS.filter(
      (row) =>
        row.name.toLowerCase().includes(query) || row.region.toLowerCase().includes(query)
    );
  }, [tableFilter]);

  const visibleRows = showAllRows ? filteredRows : filteredRows.slice(0, 12);

  const report = useMemo(
    () =>
      [
        "Land Area Converter - Result",
        `State basis: ${activeState.name}`,
        `Area: ${formatArea(baseSqft)} sq ft`,
        "",
        "Universal units",
        ...UNIVERSAL_UNITS.map(
          (unit) => `  ${unit.name}: ${formatArea(baseSqft / unit.sqft)}`
        ),
        "",
        `Regional units in ${activeState.name}`,
        ...activeState.units.map(
          (unit) => `  ${unit.name}: ${formatArea(baseSqft / unit.sqft)}  (${unit.basis})`
        ),
        "",
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [activeState, baseSqft]
  );

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const reset = () => {
    setStateId("up");
    setArea(27000);
    setDimLength(30);
    setDimWidth(40);
    setDimUnit("ft");
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <LandPlot className="h-4 w-4" />
            Indian land units
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Land Area Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            A bigha is 27,225 sq ft in Rajasthan and 6,804 sq ft in Uttarakhand. Pick your state, type
            any unit, and every other unit updates with the value your revenue records actually use.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[400px_1fr]">
          <div className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">State basis</h2>
              </div>
              <label className="mt-3 block">
                <span className="text-sm font-semibold">Which state is the land in?</span>
                <select
                  value={stateId}
                  onChange={(event) => setStateId(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {STATES.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3 rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">{activeState.note}</p>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">Quick presets</span>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setArea(preset.sqft)}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Plot dimensions</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Know the length and width instead? Enter them here to get the area in every unit.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Length</span>
                  <input
                    type="number"
                    min="0"
                    value={dimLength}
                    onChange={(event) => setDimLength(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Width</span>
                  <input
                    type="number"
                    min="0"
                    value={dimWidth}
                    onChange={(event) => setDimWidth(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>
              <label className="mt-3 block">
                <span className="text-sm font-semibold">Measured in</span>
                <select
                  value={dimUnit}
                  onChange={(event) => setDimUnit(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {DIM_UNITS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3 rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Formula: length x width</p>
                <p className="mt-1 text-xl font-semibold text-[var(--primary)]">
                  {formatArea(plotSqft)} sq ft
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatArea(plotSqft / 9)} gaj · {formatArea(plotSqft / 43560)} acre
                </p>
              </div>
              <button
                type="button"
                onClick={() => setArea(plotSqft)}
                className="btn-secondary mt-3 w-full justify-center"
              >
                <Maximize2 className="h-4 w-4" />
                Use this area
              </button>
            </div>
          </div>

          <div className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Current area
                  </p>
                  <p aria-live="polite" className="mt-2 text-4xl font-semibold text-[var(--primary)]">
                    {formatArea(baseSqft)}
                    <span className="ml-2 text-lg font-semibold text-[var(--muted-foreground)]">
                      sq ft
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {formatArea(baseSqft / 9)} gaj · {formatArea(baseSqft / 10.7639104167)} sq m ·{" "}
                    {formatArea(baseSqft / 43560)} acre · {formatArea(baseSqft / 107639.104167)} hectare
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyReport}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy results"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold">Universal units</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                These mean the same thing in every state. Type in any box.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {UNIVERSAL_UNITS.map((unit) => {
                  const key = `all:${unit.id}`;
                  return (
                    <label key={unit.id} className="block">
                      <span className="text-sm font-semibold">{unit.name}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={displayValue(key, unit.sqft)}
                        onChange={(event) => handleUnitInput(key, unit.sqft, event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                      <span className="mt-1.5 block text-[11px] leading-4 text-[var(--muted-foreground)]">
                        {unit.basis}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Regional units in {activeState.name}</h2>
                <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-[11px] font-semibold text-[var(--primary)]">
                  {activeState.zone}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Switch the state above and these boxes change, because the units themselves change size.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {activeState.units.map((unit) => {
                  const key = `${activeState.id}:${unit.id}`;
                  return (
                    <label key={unit.id} className="block rounded-md bg-[var(--muted)] p-3">
                      <span className="text-sm font-semibold">{unit.name}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={displayValue(key, unit.sqft)}
                        onChange={(event) => handleUnitInput(key, unit.sqft, event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                      <span className="mt-1.5 block text-[11px] leading-4 text-[var(--muted-foreground)]">
                        <span className="font-semibold text-[var(--primary)]">{activeState.name}</span>
                        {" · "}
                        {unit.basis}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Same unit, different state</h2>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--muted-foreground)]">
                This is why the state picker matters. The same word buys you very different amounts of
                land depending on where the plot is.
              </p>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Compare unit</span>
              <select
                value={familyId}
                onChange={(event) => setFamilyId(event.target.value)}
                className="mt-1 h-10 w-full min-w-[200px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {COMPARABLE_FAMILIES.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.label} ({family.states} states)
                  </option>
                ))}
              </select>
            </label>
          </div>

          {comparison ? (
            <div
              className="mt-4 rounded-md p-4"
              style={{
                background:
                  comparison.ratio > 1.05
                    ? "var(--anslation-ds-warning-soft)"
                    : "var(--anslation-ds-success-soft)",
              }}
            >
              {comparison.ratio > 1.05 ? (
                <p className="text-sm leading-6">
                  <strong>1 {FAMILY_LABELS[familyId] || familyId}</strong> ranges from{" "}
                  <strong>{formatArea(comparison.smallest.sqft)} sq ft</strong> in{" "}
                  {comparison.smallest.stateName} to{" "}
                  <strong>{formatArea(comparison.largest.sqft)} sq ft</strong> in{" "}
                  {comparison.largest.stateName} — a{" "}
                  <strong>{comparison.ratio.toFixed(2)}x difference</strong> for the same word.
                </p>
              ) : (
                <p className="text-sm leading-6">
                  <strong>1 {FAMILY_LABELS[familyId] || familyId}</strong> is{" "}
                  <strong>{formatArea(comparison.largest.sqft)} sq ft</strong> in every state that uses
                  it. This unit is derived from the acre, so it cannot drift.
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {comparisonRows.map((row) => (
              <div
                key={`${row.stateId}-${row.id}`}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {row.stateName}
                    <span className="ml-1 font-normal text-[var(--muted-foreground)]">· {row.name}</span>
                  </p>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {formatArea(row.sqft)} sq ft
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(row.sqft / (comparison?.max || row.sqft)) * 100}%`,
                      background: "var(--primary)",
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-4 text-[var(--muted-foreground)]">
                  {formatArea(row.sqft / 9)} gaj · {formatArea(row.sqft / 43560)} acre · {row.basis}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Full reference table</h2>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Every unit in this tool, largest first, with the exact basis for each value.
              </p>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                Filter by unit or state
              </span>
              <input
                type="text"
                value={tableFilter}
                onChange={(event) => setTableFilter(event.target.value)}
                placeholder="katha, kanal, Bihar..."
                className="mt-1 h-10 w-full min-w-[220px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
          </div>

          {filteredRows.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              No unit matches that search. Try bigha, cent, guntha or a state name.
            </p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Unit</th>
                      <th className="py-2 pr-3 font-semibold">Region</th>
                      <th className="py-2 pr-3 text-right font-semibold">Sq ft</th>
                      <th className="py-2 pr-3 text-right font-semibold">Gaj</th>
                      <th className="py-2 pr-3 text-right font-semibold">Sq m</th>
                      <th className="py-2 text-right font-semibold">Acre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.key} className="border-b border-[var(--border)] align-top">
                        <td className="py-2.5 pr-3">
                          <p className="font-semibold">{row.name}</p>
                          <p className="mt-0.5 max-w-[300px] text-[11px] leading-4 text-[var(--muted-foreground)]">
                            {row.basis}
                          </p>
                        </td>
                        <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{row.region}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{formatArea(row.sqft)}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {formatArea(row.sqft / 9)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {formatArea(row.sqft / 10.7639104167)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {formatArea(row.sqft / 43560)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 12 ? (
                <button
                  type="button"
                  onClick={() => setShowAllRows((value) => !value)}
                  className="btn-secondary mt-4 min-h-9 px-3 py-1.5 text-sm"
                >
                  {showAllRows ? "Show fewer" : `Show all ${filteredRows.length} units`}
                </button>
              ) : null}
            </>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Before you sign anything</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUICK_FACTS.map((fact) => (
              <div key={fact.title} className="rounded-md bg-[var(--muted)] p-4">
                <p className="text-sm font-semibold">{fact.title}</p>
                <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">{fact.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Values follow the standard revenue definitions in each state. Some districts and tehsils use
            their own local variant, so confirm against your khasra, khatauni, 7/12 or RTC record before
            a transaction.
          </p>
        </section>
      </div>
    </main>
  );
}
