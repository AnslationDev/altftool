"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SprayCan } from "lucide-react";

import {
  DEFAULT_WASTAGE_PERCENT,
  PRIMER_TYPES,
  SUBSTRATES,
  computePrimer,
  roomSurfaceAreaSqft,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const litres = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)} L`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  mode: "area",
  areaSqft: "1200",
  length: "12",
  width: "10",
  height: "10",
  includeCeiling: true,
  deductions: "40",
  coats: "1",
  primerType: "interior-wall-wb",
  substrate: "bare-plaster",
  wastagePercent: String(DEFAULT_WASTAGE_PERCENT),
  pricePerLitre: "260",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [areaSqft, setAreaSqft] = useState(DEFAULTS.areaSqft);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [includeCeiling, setIncludeCeiling] = useState(DEFAULTS.includeCeiling);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  const [coats, setCoats] = useState(DEFAULTS.coats);
  const [primerType, setPrimerType] = useState(DEFAULTS.primerType);
  const [substrate, setSubstrate] = useState(DEFAULTS.substrate);
  const [wastagePercent, setWastagePercent] = useState(DEFAULTS.wastagePercent);
  const [pricePerLitre, setPricePerLitre] = useState(DEFAULTS.pricePerLitre);
  const [copied, setCopied] = useState(false);

  const roomArea = useMemo(
    () =>
      roomSurfaceAreaSqft({
        lengthFt: toNumber(length),
        widthFt: toNumber(width),
        heightFt: toNumber(height),
        includeCeiling,
        deductionsSqft: toNumber(deductions),
      }),
    [length, width, height, includeCeiling, deductions],
  );

  const effectiveArea = mode === "room" ? roomArea : toNumber(areaSqft);

  const result = useMemo(
    () =>
      computePrimer({
        areaSqft: effectiveArea,
        coats: toNumber(coats),
        primerType,
        substrate,
        wastagePercent: toNumber(wastagePercent),
        pricePerLitre: toNumber(pricePerLitre),
      }),
    [effectiveArea, coats, primerType, substrate, wastagePercent, pricePerLitre],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Primer Quantity Calculator",
      `Surface: ${NUM1.format(result.areaSqft)} sq ft × ${result.coats} coat(s)`,
      `Primer: ${result.primerLabel} (${result.primerRange})`,
      `Substrate: ${result.substrateLabel} — factor ${result.substrateFactor}`,
      `Effective coverage: ${NUM1.format(result.effectiveSpread)} sq ft per litre per coat`,
      `Primer needed: ${NUM2.format(result.litresNeeded)} L`,
      `Buy: ${result.packs.map((p) => `${p.count} × ${p.size} L`).join(" + ")} = ${result.purchasedLitres} L`,
      `Thinner (${result.thinPercent[0]}-${result.thinPercent[1]}% ${result.thinner}): ${NUM1.format(result.thinnerMinLitres)}-${NUM1.format(result.thinnerMaxLitres)} L`,
      `Material cost: ${money(result.materialCost)} (${money(result.costPerSqft)} per sq ft)`,
    ].join("\n");
  }, [hasError, result]);

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
    setMode(DEFAULTS.mode);
    setAreaSqft(DEFAULTS.areaSqft);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setIncludeCeiling(DEFAULTS.includeCeiling);
    setDeductions(DEFAULTS.deductions);
    setCoats(DEFAULTS.coats);
    setPrimerType(DEFAULTS.primerType);
    setSubstrate(DEFAULTS.substrate);
    setWastagePercent(DEFAULTS.wastagePercent);
    setPricePerLitre(DEFAULTS.pricePerLitre);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <SprayCan className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Primer Quantity Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Litres of primer for a job, from the published spreading rate scaled by how thirsty your
          surface is — plus the tin combination to buy and what it costs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap gap-2" role="group" aria-label="How to enter the surface">
          {[
            ["area", "I know the area"],
            ["room", "Work it out from a room"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "area" ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="pq-area">
              Surface to prime (sq ft)
            </label>
            <input
              id="pq-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={areaSqft}
              onChange={(event) => setAreaSqft(event.target.value)}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="pq-length">
                Room length (ft)
              </label>
              <input
                id="pq-length"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pq-width">
                Room width (ft)
              </label>
              <input
                id="pq-width"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pq-height">
                Wall height (ft)
              </label>
              <input
                id="pq-height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pq-deduct">
                Doors and windows to deduct (sq ft)
              </label>
              <input
                id="pq-deduct"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="5"
                value={deductions}
                onChange={(event) => setDeductions(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
                htmlFor="pq-ceiling"
              >
                <input
                  id="pq-ceiling"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={includeCeiling}
                  onChange={(event) => setIncludeCeiling(event.target.checked)}
                />
                Prime the ceiling too
              </label>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] sm:col-span-2">
              Surface worked out:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {Number.isFinite(roomArea) ? `${NUM1.format(roomArea)} sq ft` : dash}
              </span>
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pq-primer">
              Primer type
            </label>
            <select
              id="pq-primer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={primerType}
              onChange={(event) => setPrimerType(event.target.value)}
            >
              {PRIMER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.range}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pq-substrate">
              Surface being primed
            </label>
            <select
              id="pq-substrate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={substrate}
              onChange={(event) => setSubstrate(event.target.value)}
            >
              {SUBSTRATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (×{item.factor})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pq-coats">
              Coats
            </label>
            <input
              id="pq-coats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={coats}
              onChange={(event) => setCoats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pq-waste">
              Wastage allowance (%)
            </label>
            <input
              id="pq-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={wastagePercent}
              onChange={(event) => setWastagePercent(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pq-price">
              Primer price (INR per litre)
            </label>
            <input
              id="pq-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={pricePerLitre}
              onChange={(event) => setPricePerLitre(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Primer needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM2.format(result.litresNeeded)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `Buy ${result.packs.map((p) => `${p.count} × ${p.size} L`).join(" + ")} = ${result.purchasedLitres} L`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the primer estimate"
              className={GHOST_BTN}
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
            ["Surface primed", hasError ? dash : `${NUM1.format(result.areaSqft)} sq ft × ${result.coats} coat(s)`],
            ["Published coverage", hasError ? dash : `${result.baseSpread} sq ft / L / coat`],
            [
              "Coverage on this surface",
              hasError
                ? dash
                : `${NUM1.format(result.effectiveSpread)} sq ft / L / coat (×${result.substrateFactor})`,
            ],
            ["Before wastage", hasError ? dash : litres(result.litresBare)],
            ["Tins to buy", hasError ? dash : `${result.totalPacks} tin(s), ${result.purchasedLitres} L`],
            ["Left over", hasError ? dash : litres(result.spareLitres)],
            [
              "Fewest tins instead",
              hasError
                ? dash
                : `${result.compactTins} tin(s), ${result.compactLitres} L · ${money(result.compactCost)}`,
            ],
            [
              `Thinner (${hasError ? "" : result.thinner})`,
              hasError
                ? dash
                : `${NUM1.format(result.thinnerMinLitres)}–${NUM1.format(result.thinnerMaxLitres)} L (${result.thinPercent[0]}–${result.thinPercent[1]}%)`,
            ],
            ["Material cost", hasError ? dash : money(result.materialCost)],
            ["Cost per sq ft", hasError ? dash : money(result.costPerSqft)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.substrateLabel}: {result.substrateNote}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How absorbency changes the answer</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Surface</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Coverage</th>
                  <th scope="col" className="py-2 text-right font-semibold">Litres</th>
                </tr>
              </thead>
              <tbody>
                {SUBSTRATES.map((item) => {
                  const row = computePrimer({
                    areaSqft: result.areaSqft,
                    coats: result.coats,
                    primerType,
                    substrate: item.id,
                    wastagePercent: toNumber(wastagePercent),
                    pricePerLitre: toNumber(pricePerLitre),
                  });
                  const active = item.id === substrate;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        active ? "text-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 font-semibold">{item.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {NUM1.format(row.effectiveSpread)} sq ft/L
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {NUM2.format(row.litresNeeded)} L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Spreading rates are the mid-points of the ranges printed on Indian primer data sheets and
        assume the primer is thinned as directed and applied over a properly prepared surface. Rough,
        textured or repaired areas will always use more — check the tin for the figure your brand
        quotes.
      </p>
    </main>
  );
}
