"use client";

import { useMemo, useState } from "react";
import { Box, Check, Copy, RotateCcw } from "lucide-react";

import {
  CFT_PER_M3,
  DRY_VOLUME_FACTOR,
  LENGTH_UNITS,
  MIX_RATIOS,
  SHAPES,
  computeConcrete,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : "—");

const DEFAULTS = {
  shape: "rectangular",
  unit: "m",
  length: "5",
  width: "4",
  depth: "0.125",
  diameter: "0.3",
  topLength: "1",
  topWidth: "1",
  count: "1",
  grade: "M20",
  wastagePct: "5",
  waterCementRatio: "0.5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      computeConcrete({
        shape: form.shape,
        unit: form.unit,
        length: form.length,
        width: form.width,
        depth: form.depth,
        diameter: form.diameter,
        topLength: form.topLength,
        topWidth: form.topWidth,
        count: form.count,
        grade: form.grade,
        wastagePct: form.wastagePct,
        waterCementRatio: form.waterCementRatio,
      }),
    [form],
  );

  const ok = !result.error;
  const unitLabel = LENGTH_UNITS.find((u) => u.id === form.unit)?.id ?? "m";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Concrete Volume Calculator",
      `Grade ${result.grade} (${result.ratioLabel})`,
      `Members: ${result.count} x ${n3(result.volumePerMember)} m3`,
      `Net volume: ${n3(result.netVolume)} m3`,
      `Order volume incl. ${n0(result.wastagePct)}% wastage: ${n3(result.wetVolume)} m3 (${n2(result.volumeCft)} cft)`,
      `Cement: ${n2(result.cementBags)} bags (${n0(result.cementKg)} kg)`,
      `Sand: ${n3(result.sandVolume)} m3 (${n2(result.sandCft)} cft)`,
      `Aggregate: ${n3(result.aggregateVolume)} m3 (${n2(result.aggregateCft)} cft)`,
      `Water: ${n0(result.waterLitres)} litres at w/c ${n2(result.waterCementRatio)}`,
    ].join("\n");
  }, [ok, result]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const dimensionFields =
    form.shape === "circular"
      ? [
          ["diameter", "Diameter"],
          ["depth", "Height"],
        ]
      : form.shape === "trapezoidal"
        ? [
            ["length", "Bottom length"],
            ["width", "Bottom width"],
            ["topLength", "Top length"],
            ["topWidth", "Top width"],
            ["depth", "Height"],
          ]
        : [
            ["length", "Length"],
            ["width", "Width"],
            ["depth", "Thickness / height"],
          ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Box className="h-4 w-4" aria-hidden="true" />
          Construction materials
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Concrete Volume Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the concrete you need for a slab, beam, column, pile or sloped footing, then split
          it into cement bags, sand, coarse aggregate and mixing water using IS 456 nominal mix
          ratios and the 1.54 dry-volume factor.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-shape">
              Member shape
            </label>
            <select id="cv-shape" className={`mt-2 ${INPUT_CLASS}`} value={form.shape} onChange={set("shape")}>
              {SHAPES.map((shape) => (
                <option key={shape.id} value={shape.id}>
                  {shape.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-unit">
              Dimension unit
            </label>
            <select id="cv-unit" className={`mt-2 ${INPUT_CLASS}`} value={form.unit} onChange={set("unit")}>
              {LENGTH_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {dimensionFields.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cv-${key}`}>
                {label} ({unitLabel})
              </label>
              <input
                id={`cv-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form[key]}
                onChange={set(key)}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="cv-count">
              Number of identical members
            </label>
            <input
              id="cv-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.count}
              onChange={set("count")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-grade">
              Concrete grade
            </label>
            <select id="cv-grade" className={`mt-2 ${INPUT_CLASS}`} value={form.grade} onChange={set("grade")}>
              {MIX_RATIOS.map((mix) => (
                <option key={mix.grade} value={mix.grade}>
                  {mix.grade} — 1 : {mix.sand} : {mix.aggregate}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-waste">
              Wastage allowance (%)
            </label>
            <input
              id="cv-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.wastagePct}
              onChange={set("wastagePct")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-wcr">
              Water-cement ratio
            </label>
            <input
              id="cv-wcr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.3"
              max="0.8"
              step="0.01"
              value={form.waterCementRatio}
              onChange={set("waterCementRatio")}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Concrete to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n3(result.wetVolume)} m³` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n2(result.volumeCft)} cft · net ${n3(result.netVolume)} m³ plus ${n0(result.wastagePct)}% wastage`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy concrete take-off result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Volume of one member", ok ? `${n3(result.volumePerMember)} m³` : "—"],
            ["Net volume of all members", ok ? `${n3(result.netVolume)} m³` : "—"],
            [`Dry material volume (x ${DRY_VOLUME_FACTOR})`, ok ? `${n3(result.dryVolume)} m³` : "—"],
            ["Cement bags (50 kg)", ok ? `${n2(result.cementBags)} → buy ${n0(result.cementBagsToBuy)}` : "—"],
            ["Cement by weight", ok ? `${n0(result.cementKg)} kg` : "—"],
            ["Fine aggregate (sand)", ok ? `${n3(result.sandVolume)} m³ · ${n2(result.sandCft)} cft · ${n0(result.sandKg)} kg` : "—"],
            [
              "Coarse aggregate (20 mm)",
              ok ? `${n3(result.aggregateVolume)} m³ · ${n2(result.aggregateCft)} cft · ${n0(result.aggregateKg)} kg` : "—",
            ],
            ["Mixing water", ok ? `${n0(result.waterLitres)} litres` : "—"],
            ["Self-weight of the concrete", ok ? `${n0(result.selfWeightKg)} kg` : "—"],
            ["Mix suits", ok ? result.use : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Nominal mix reference (IS 456:2000)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Grade</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Ratio</th>
                <th scope="col" className="py-2 font-semibold">Typical use</th>
              </tr>
            </thead>
            <tbody>
              {MIX_RATIOS.map((mix) => (
                <tr key={mix.grade} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{mix.grade}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    1 : {mix.sand} : {mix.aggregate}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{mix.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          1 m³ = {n2(CFT_PER_M3)} cft. One 50 kg cement bag occupies 0.0347 m³ at a bulk density of
          1440 kg/m³.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for ordering and costing only. Nominal mixes are limited to M20 and below under IS
        456; anything structural above that needs a design mix from a qualified engineer, and site
        conditions such as sand bulking, aggregate moisture and pump losses change the real
        quantities.
      </p>
    </main>
  );
}
