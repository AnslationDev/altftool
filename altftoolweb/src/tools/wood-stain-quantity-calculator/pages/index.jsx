"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Paintbrush, RotateCcw } from "lucide-react";

import {
  CAN_SIZES_L,
  FIRST_COAT_FACTOR,
  POROSITIES,
  PRODUCTS,
  TEXTURES,
  computeStain,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : "—");

const DEFAULTS = {
  mode: "pieces",
  areaValue: "20",
  areaUnit: "m2",
  lengthM: "1.8",
  widthM: "0.9",
  thicknessMm: "40",
  count: "1",
  bothSides: true,
  includeEdges: true,
  product: "oil-stain",
  texture: "smooth",
  porosity: "medium",
  coats: "2",
  bareWood: true,
  wastePct: "10",
  canSizeL: "1",
  pricePerLitre: "0",
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
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      computeStain({
        mode: form.mode,
        areaValue: form.areaValue,
        areaUnit: form.areaUnit,
        lengthM: form.lengthM,
        widthM: form.widthM,
        thicknessMm: form.thicknessMm,
        count: form.count,
        bothSides: form.bothSides,
        includeEdges: form.includeEdges,
        product: form.product,
        texture: form.texture,
        porosity: form.porosity,
        coats: Number(form.coats),
        bareWood: form.bareWood,
        wastePct: form.wastePct,
        canSizeL: form.canSizeL,
        pricePerLitre: form.pricePerLitre,
      }),
    [form],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Wood Stain Quantity Calculator",
      `Surface area: ${n2(result.areaM2)} m2 (${n0(result.areaSqft)} sqft)`,
      `Product: ${result.product}`,
      `Effective coverage: ${n2(result.effectiveCoverage)} m2 per litre per coat`,
      `Coats: ${result.perCoat.length}`,
      `Net requirement: ${n3(result.netLitres)} litres`,
      `With ${n0(result.wastePct)}% wastage: ${n3(result.totalLitres)} litres`,
      `Buy ${result.cans} x ${n2(result.canSizeL)} L tin(s) = ${n2(result.litresPurchased)} litres`,
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Paintbrush className="h-4 w-4" aria-hidden="true" />
          Carpentry &amp; woodwork
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Wood Stain Quantity Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the litres of stain, oil, sealer or varnish a job needs. The spreading rate on the
          tin is adjusted for how rough the surface is and how thirsty the timber is, and the first
          coat on bare wood is loaded by {FIRST_COAT_FACTOR}× because bare grain soaks it up.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Surface</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ws-mode">
              How do you want to give the area?
            </label>
            <select id="ws-mode" className={`mt-2 ${INPUT_CLASS}`} value={form.mode} onChange={set("mode")}>
              <option value="pieces">From piece dimensions</option>
              <option value="direct">I already know the area</option>
            </select>
          </div>

          {form.mode === "direct" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ws-area">
                  Surface area
                </label>
                <input
                  id="ws-area"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={form.areaValue}
                  onChange={set("areaValue")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ws-area-unit">
                  Area unit
                </label>
                <select
                  id="ws-area-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={form.areaUnit}
                  onChange={set("areaUnit")}
                >
                  <option value="m2">square metres</option>
                  <option value="sqft">square feet</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ws-length">
                  Piece length (m)
                </label>
                <input
                  id="ws-length"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={form.lengthM}
                  onChange={set("lengthM")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ws-width">
                  Piece width (m)
                </label>
                <input
                  id="ws-width"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={form.widthM}
                  onChange={set("widthM")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ws-thickness">
                  Piece thickness (mm)
                </label>
                <input
                  id="ws-thickness"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.thicknessMm}
                  onChange={set("thicknessMm")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ws-count">
                  Number of pieces
                </label>
                <input
                  id="ws-count"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.count}
                  onChange={set("count")}
                />
              </div>
              <div className="sm:col-span-2 grid gap-2">
                <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ws-both">
                  <input
                    id="ws-both"
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={form.bothSides}
                    onChange={set("bothSides")}
                  />
                  Finish both faces
                </label>
                <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ws-edges">
                  <input
                    id="ws-edges"
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={form.includeEdges}
                    onChange={set("includeEdges")}
                  />
                  Include the four edges
                </label>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Finish</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ws-product">
              Product
            </label>
            <select id="ws-product" className={`mt-2 ${INPUT_CLASS}`} value={form.product} onChange={set("product")}>
              {PRODUCTS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {entry.coverage} m²/L, usually {entry.coats} coat
                  {entry.coats > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-texture">
              Surface texture
            </label>
            <select id="ws-texture" className={`mt-2 ${INPUT_CLASS}`} value={form.texture} onChange={set("texture")}>
              {TEXTURES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-porosity">
              Wood porosity
            </label>
            <select id="ws-porosity" className={`mt-2 ${INPUT_CLASS}`} value={form.porosity} onChange={set("porosity")}>
              {POROSITIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-coats">
              Number of coats
            </label>
            <input
              id="ws-coats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.coats}
              onChange={set("coats")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-waste">
              Brush loss and wastage (%)
            </label>
            <input
              id="ws-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              value={form.wastePct}
              onChange={set("wastePct")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-can">
              Tin size (litres)
            </label>
            <select id="ws-can" className={`mt-2 ${INPUT_CLASS}`} value={form.canSizeL} onChange={set("canSizeL")}>
              {CAN_SIZES_L.map((size) => (
                <option key={size} value={String(size)}>
                  {size} L
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-price">
              Price per litre (INR, optional)
            </label>
            <input
              id="ws-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.pricePerLitre}
              onChange={set("pricePerLitre")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ws-bare">
              <input
                id="ws-bare"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.bareWood}
                onChange={set("bareWood")}
              />
              The wood is bare (never finished before)
            </label>
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
              Finish to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n2(result.totalLitres)} L` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.cans} × ${n2(result.canSizeL)} L tin${result.cans > 1 ? "s" : ""} covers ${n2(result.areaM2)} m² in ${result.perCoat.length} coat${result.perCoat.length > 1 ? "s" : ""}`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy stain quantity result"
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
            ["Surface area", ok ? `${n2(result.areaM2)} m² · ${n0(result.areaSqft)} sqft` : "—"],
            ["Base spreading rate", ok ? `${n2(result.baseCoverage)} m² per litre per coat` : "—"],
            ["Texture × porosity adjustment", ok ? `× ${n2(result.textureFactor)} × ${n2(result.porosityFactor)}` : "—"],
            [
              "Effective coverage",
              ok
                ? `${n2(result.effectiveCoverage)} m²/L · ${n0(result.effectiveCoverageSqftPerGallon)} sqft per US gallon`
                : "—",
            ],
            ["Net requirement", ok ? `${n3(result.netLitres)} L` : "—"],
            [`With ${ok ? n0(result.wastePct) : "—"}% wastage`, ok ? `${n3(result.totalLitres)} L` : "—"],
            ["Tins to buy", ok ? `${result.cans} × ${n2(result.canSizeL)} L = ${n2(result.litresPurchased)} L` : "—"],
            ["Left over", ok ? `${n2(result.leftoverLitres)} L` : "—"],
            ["Cost", ok && result.cost > 0 ? INR.format(result.cost) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <caption className="sr-only">Litres per coat</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Coat</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Loading</th>
                  <th scope="col" className="py-2 text-right font-semibold">Litres</th>
                </tr>
              </thead>
              <tbody>
                {result.perCoat.map((coat) => (
                  <tr key={coat.coat} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Coat {coat.coat}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">× {n2(coat.loading)}</td>
                    <td className="py-2 text-right">{n3(coat.litres)} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Spreading rates here are mid-range figures — always check the tin, because two products from
        the same brand can differ by a third. Buy the finish for a whole job in one batch so the
        colour matches, and test on an offcut of the same timber before committing.
      </p>
    </main>
  );
}
