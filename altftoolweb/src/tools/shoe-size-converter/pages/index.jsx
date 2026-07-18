"use client";

import { useMemo, useState } from "react";
import { Copy, Footprints, Info, PencilRuler, RotateCcw, Ruler, Table2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { SHOE_TABLES, SIZE_SYSTEMS } from "../data";

const GROUPS = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
];

const PRESETS = [
  { label: "Men · UK 8", group: "men", system: "uk", value: "8" },
  { label: "Women · EU 38", group: "women", system: "eu", value: "38" },
  { label: "Kids · 17.5 cm foot", group: "kids", system: "cm", value: "17.5" },
];

const MEASURE_STEPS = [
  "Tape a sheet of paper to a hard floor with its short edge against a wall.",
  "Stand on the paper with your heel lightly touching the wall, wearing the socks you plan to use.",
  "Mark the tip of your longest toe, then measure from the wall edge to the mark in cm with a ruler.",
  "Measure in the evening (feet swell through the day) and do both feet — always use the longer one.",
  "Add about 1 cm of toe room, then enter that length in the Foot cm field above.",
];

const BRAND_NOTES = [
  "Nike and Puma often run about half a size small — most people size up.",
  "adidas and New Balance are broadly true to size (New Balance runs a little wide).",
  "Converse and Vans tend to run large — many wearers go half a size down.",
  "For kids, add a thumb's width (~1 cm) of growing room to the measured foot.",
];

const formatSize = (value) =>
  Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);

function usDisplay(row) {
  return row.usLabel || formatSize(row.us);
}

function findMatch(rows, system, value) {
  if (!Number.isFinite(value) || value < 0) return null;
  if (system === "cm") {
    const exact = rows.find((row) => Math.abs(row.cm - value) < 0.05);
    if (exact) return { row: exact, kind: "exact" };
    if (value < rows[0].cm) return { row: rows[0], kind: "below" };
    const larger = rows.find((row) => row.cm > value);
    if (!larger) return { row: rows[rows.length - 1], kind: "above" };
    return { row: larger, kind: "sizeUp" };
  }
  const field = system;
  let best = rows[0];
  let bestDiff = Math.abs(rows[0][field] - value);
  rows.forEach((row) => {
    const diff = Math.abs(row[field] - value);
    if (diff < bestDiff - 1e-9 || (Math.abs(diff - bestDiff) < 1e-9 && row.uk > best.uk)) {
      best = row;
      bestDiff = diff;
    }
  });
  let kind = "nearest";
  if (bestDiff < 0.05) kind = "exact";
  else if (value < rows[0][field]) kind = "below";
  else if (value > rows[rows.length - 1][field]) kind = "above";
  return { row: best, kind };
}

function matchNote(match, system, group) {
  if (!match) return "Enter a value to see every equivalent size.";
  const systemLabel = SIZE_SYSTEMS.find((item) => item.id === system)?.label || system;
  if (match.kind === "exact") return `Exact match on the ${systemLabel} column of the ${group} chart.`;
  if (match.kind === "sizeUp")
    return `That length falls between sizes — we recommend sizing up to UK ${formatSize(match.row.uk)}.`;
  if (match.kind === "below") return "Below this chart's range — showing the smallest size.";
  if (match.kind === "above") return "Above this chart's range — showing the largest size.";
  return `Closest half-size shown for ${systemLabel}. If you sit between sizes, take the larger one.`;
}

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div role="group" aria-label={ariaLabel} className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
            value === option.id
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EquivalentCard({ label, value, hint, highlight }) {
  return (
    <div
      className={`rounded-md border p-4 ${
        highlight
          ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)]"
          : "border-[var(--border)] bg-[var(--background)]"
      }`}
    >
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

function SizeTable({ group, rows, activeUk }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            <th className="px-3 py-2">UK</th>
            <th className="px-3 py-2">US {group === "kids" ? "(C/Y)" : ""}</th>
            <th className="px-3 py-2">EU</th>
            <th className="px-3 py-2">IN</th>
            <th className="px-3 py-2">Foot length (cm)</th>
            <th className="px-3 py-2">Foot length (in)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.uk}
              className={`border-b border-[var(--border)] ${
                activeUk === row.uk ? "bg-[var(--anslation-ds-primary-soft)] font-semibold" : ""
              }`}
            >
              <td className="px-3 py-2">{formatSize(row.uk)}</td>
              <td className="px-3 py-2">{usDisplay(row)}</td>
              <td className="px-3 py-2">{formatSize(row.eu)}</td>
              <td className="px-3 py-2">{formatSize(row.ind)}</td>
              <td className="px-3 py-2">{row.cm.toFixed(1)}</td>
              <td className="px-3 py-2">{(row.cm / 2.54).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToolHome() {
  const [group, setGroup] = useState("men");
  const [system, setSystem] = useState("uk");
  const [rawValue, setRawValue] = useState("8");
  const [copied, setCopied] = useState(false);

  const table = SHOE_TABLES[group];
  const value = Number(rawValue);
  const match = useMemo(
    () => (rawValue === "" ? null : findMatch(table.rows, system, value)),
    [rawValue, system, table, value]
  );
  const row = match?.row || null;

  const summary = row
    ? [
        `My shoe sizes (${table.label})`,
        `UK ${formatSize(row.uk)} · US ${usDisplay(row)} · EU ${formatSize(row.eu)} · IN ${formatSize(row.ind)}`,
        `Foot length: ${row.cm.toFixed(1)} cm (${(row.cm / 2.54).toFixed(1)} in)`,
        "Converted with the ALTFTool Shoe Size Converter.",
      ].join("\n")
    : "";

  const applyPreset = (preset) => {
    setGroup(preset.group);
    setSystem(preset.system);
    setRawValue(preset.value);
  };

  const copySizes = async () => {
    if (!summary) return;
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Footprints className="h-4 w-4" />
            Lifestyle utility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Shoe Size Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter any one size — UK, US, EU, IN, or your foot length in cm — and instantly see every
            equivalent for men, women, and kids, half sizes included.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="mb-2 text-sm font-semibold">Who is the shoe for?</p>
            <Segmented options={GROUPS} value={group} onChange={setGroup} ariaLabel="Gender or age group" />

            <p className="mb-2 mt-5 text-sm font-semibold">I know my size in</p>
            <div role="group" aria-label="Size system" className="grid grid-cols-5 gap-2">
              {SIZE_SYSTEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSystem(item.id)}
                  className={`rounded-md border px-1 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    system === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">
                {system === "cm"
                  ? "Foot length in cm"
                  : `${SIZE_SYSTEMS.find((item) => item.id === system)?.label} size`}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step={system === "cm" ? 0.1 : 0.5}
                value={rawValue}
                onChange={(event) => setRawValue(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
            {group === "kids" && system === "us" ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                US kids sizes run 1C–13.5C, then youth sizes — enter 14 for 1Y.
              </p>
            ) : null}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={() => {
                    setGroup("men");
                    setSystem("uk");
                    setRawValue("8");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {row ? `Closest match: UK ${formatSize(row.uk)} (${table.label})` : "Your sizes"}
              </p>
              <button
                type="button"
                onClick={copySizes}
                disabled={!row}
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy my sizes"}
              </button>
            </div>

            <p aria-live="polite" className="mt-2 text-sm text-[var(--muted-foreground)]">
              {matchNote(match, system, table.label.toLowerCase())}
            </p>

            {row ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <EquivalentCard label="UK size" value={formatSize(row.uk)} highlight={system === "uk"} />
                <EquivalentCard
                  label="US size"
                  value={usDisplay(row)}
                  hint={group === "women" ? "US women's scale" : group === "kids" ? "C = child, Y = youth" : null}
                  highlight={system === "us"}
                />
                <EquivalentCard label="EU size" value={formatSize(row.eu)} highlight={system === "eu"} />
                <EquivalentCard label="India (IN)" value={formatSize(row.ind)} hint="IN follows UK sizing" highlight={system === "ind"} />
                <EquivalentCard label="Foot length" value={`${row.cm.toFixed(1)} cm`} highlight={system === "cm"} />
                <EquivalentCard label="Foot length" value={`${(row.cm / 2.54).toFixed(1)} in`} />
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-6 text-sm text-[var(--muted-foreground)]">
                Type a size or foot length on the left to see the full conversion.
              </div>
            )}

            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">Chart basis: {table.formula}.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              <PencilRuler className="h-4 w-4" />
              Measure your foot at home
            </div>
            <ol className="grid gap-3">
              {MEASURE_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
              <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              If your measurement lands between two sizes on the chart, always take the larger size.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              <Info className="h-4 w-4" />
              Brand fit notes
            </div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Size charts describe the last (the foot form a shoe is built on), not the brand&apos;s cut —
              so the same UK size can fit differently across brands.
            </p>
            <ul className="mt-3 grid gap-2">
              {BRAND_NOTES.map((note) => (
                <li key={note} className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              <Table2 className="h-4 w-4" />
              Full {table.label.toLowerCase()} size chart
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Half sizes included · your match is highlighted
            </p>
          </div>
          <SizeTable group={group} rows={table.rows} activeUk={row ? row.uk : null} />
        </section>
      </div>
    </main>
  );
}
