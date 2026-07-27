"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  DEFAULT_CERAMIC,
  DEFAULT_VITRIFIED,
  TILE_FACTS,
  compareTileCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  area: "500",
  horizon: "25",
  vTile: String(DEFAULT_VITRIFIED.tilePerSqft),
  vLabour: String(DEFAULT_VITRIFIED.labourPerSqft),
  vBedding: String(DEFAULT_VITRIFIED.beddingPerSqft),
  vLife: String(DEFAULT_VITRIFIED.lifeYears),
  vMaint: String(DEFAULT_VITRIFIED.maintenancePerSqftYear),
  cTile: String(DEFAULT_CERAMIC.tilePerSqft),
  cLabour: String(DEFAULT_CERAMIC.labourPerSqft),
  cBedding: String(DEFAULT_CERAMIC.beddingPerSqft),
  cLife: String(DEFAULT_CERAMIC.lifeYears),
  cMaint: String(DEFAULT_CERAMIC.maintenancePerSqftYear),
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [vTile, setVTile] = useState(DEFAULTS.vTile);
  const [vLabour, setVLabour] = useState(DEFAULTS.vLabour);
  const [vBedding, setVBedding] = useState(DEFAULTS.vBedding);
  const [vLife, setVLife] = useState(DEFAULTS.vLife);
  const [vMaint, setVMaint] = useState(DEFAULTS.vMaint);
  const [cTile, setCTile] = useState(DEFAULTS.cTile);
  const [cLabour, setCLabour] = useState(DEFAULTS.cLabour);
  const [cBedding, setCBedding] = useState(DEFAULTS.cBedding);
  const [cLife, setCLife] = useState(DEFAULTS.cLife);
  const [cMaint, setCMaint] = useState(DEFAULTS.cMaint);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareTileCost({
        areaSqft: toNumber(area),
        horizonYears: toNumber(horizon),
        vitrified: {
          tilePerSqft: toNumber(vTile),
          labourPerSqft: toNumber(vLabour),
          beddingPerSqft: toNumber(vBedding),
          lifeYears: toNumber(vLife),
          maintenancePerSqftYear: toNumber(vMaint),
        },
        ceramic: {
          tilePerSqft: toNumber(cTile),
          labourPerSqft: toNumber(cLabour),
          beddingPerSqft: toNumber(cBedding),
          lifeYears: toNumber(cLife),
          maintenancePerSqftYear: toNumber(cMaint),
        },
      }),
    [area, horizon, vTile, vLabour, vBedding, vLife, vMaint, cTile, cLabour, cBedding, cLife, cMaint],
  );

  const failed = Boolean(result.error);
  const winnerLabel = failed
    ? DASH
    : result.verdict === "tie"
      ? "Line ball"
      : TILE_FACTS[result.verdict].label;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Vitrified vs ceramic over ${result.horizonYears} years on ${result.areaSqft} sqft`,
      `Vitrified laid cost: ${money(result.vitrified.laidCost)} (${money2(result.vitrified.laidPerSqft)}/sqft)`,
      `Ceramic laid cost: ${money(result.ceramic.laidCost)} (${money2(result.ceramic.laidPerSqft)}/sqft)`,
      `Vitrified whole-life cost: ${money(result.vitrified.lifetimeCost)}`,
      `Ceramic whole-life cost: ${money(result.ceramic.lifetimeCost)}`,
      `Cheaper over the horizon: ${winnerLabel}, by ${money(result.savings)}`,
      result.breakEvenYears
        ? `Vitrified pays back its higher laid cost in about ${num(result.breakEvenYears)} years`
        : "Vitrified is not more expensive to lay at these prices",
    ].join("\n");
  }, [failed, result, winnerLabel]);

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
    setArea(DEFAULTS.area);
    setHorizon(DEFAULTS.horizon);
    setVTile(DEFAULTS.vTile);
    setVLabour(DEFAULTS.vLabour);
    setVBedding(DEFAULTS.vBedding);
    setVLife(DEFAULTS.vLife);
    setVMaint(DEFAULTS.vMaint);
    setCTile(DEFAULTS.cTile);
    setCLabour(DEFAULTS.cLabour);
    setCBedding(DEFAULTS.cBedding);
    setCLife(DEFAULTS.cLife);
    setCMaint(DEFAULTS.cMaint);
    setCopied(false);
  };

  const compareRows = [
    [
      "Laid cost per sqft",
      failed ? DASH : money2(result.vitrified.laidPerSqft),
      failed ? DASH : money2(result.ceramic.laidPerSqft),
    ],
    [
      "Cost to lay the whole floor",
      failed ? DASH : money(result.vitrified.laidCost),
      failed ? DASH : money(result.ceramic.laidCost),
    ],
    [
      "Service life",
      failed ? DASH : `${result.vitrified.lifeYears} yrs`,
      failed ? DASH : `${result.ceramic.lifeYears} yrs`,
    ],
    [
      "Re-lays inside the horizon",
      failed ? DASH : `${result.vitrified.relaysNeeded}`,
      failed ? DASH : `${result.ceramic.relaysNeeded}`,
    ],
    [
      "Installation cost prorated to horizon",
      failed ? DASH : money(result.vitrified.proratedInstallCost),
      failed ? DASH : money(result.ceramic.proratedInstallCost),
    ],
    [
      "Cleaning and upkeep over horizon",
      failed ? DASH : money(result.vitrified.maintenanceCost),
      failed ? DASH : money(result.ceramic.maintenanceCost),
    ],
    [
      "Whole-life cost",
      failed ? DASH : money(result.vitrified.lifetimeCost),
      failed ? DASH : money(result.ceramic.lifetimeCost),
    ],
    [
      "Cost per year",
      failed ? DASH : money(result.vitrified.annualCost),
      failed ? DASH : money(result.ceramic.annualCost),
    ],
    [
      "Cost per sqft per year",
      failed ? DASH : money2(result.vitrified.costPerSqftPerYear),
      failed ? DASH : money2(result.ceramic.costPerSqftPerYear),
    ],
  ];

  const optionFields = (prefix, label, values) => (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <h3 className="text-sm font-semibold">{label}</h3>
      <div className="mt-3 grid gap-3">
        {values.map(({ id, text, value, setter, step, min }) => (
          <div key={id}>
            <label className={LABEL} htmlFor={`${prefix}-${id}`}>
              {text}
            </label>
            <input
              id={`${prefix}-${id}`}
              className={FIELD}
              type="number"
              inputMode="decimal"
              min={min}
              step={step}
              value={value}
              onChange={(event) => setter(event.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Flooring
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Vitrified vs Ceramic Tile Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare the two on laid cost, service life and upkeep, so the decision rests on what the
          floor costs over the years you will actually live on it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="vc-area">
              Floor area (sqft)
            </label>
            <input
              id="vc-area"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="vc-horizon">
              Years you plan to keep the floor
            </label>
            <input
              id="vc-horizon"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {optionFields("vc-v", "Vitrified", [
            { id: "tile", text: "Tile price (INR/sqft)", value: vTile, setter: setVTile, step: "1", min: "0" },
            { id: "labour", text: "Laying labour (INR/sqft)", value: vLabour, setter: setVLabour, step: "1", min: "0" },
            { id: "bed", text: "Adhesive or mortar (INR/sqft)", value: vBedding, setter: setVBedding, step: "1", min: "0" },
            { id: "life", text: "Service life (years)", value: vLife, setter: setVLife, step: "1", min: "1" },
            { id: "maint", text: "Upkeep (INR/sqft/year)", value: vMaint, setter: setVMaint, step: "0.5", min: "0" },
          ])}
          {optionFields("vc-c", "Ceramic", [
            { id: "tile", text: "Tile price (INR/sqft)", value: cTile, setter: setCTile, step: "1", min: "0" },
            { id: "labour", text: "Laying labour (INR/sqft)", value: cLabour, setter: setCLabour, step: "1", min: "0" },
            { id: "bed", text: "Adhesive or mortar (INR/sqft)", value: cBedding, setter: setCBedding, step: "1", min: "0" },
            { id: "life", text: "Service life (years)", value: cLife, setter: setCLife, step: "1", min: "1" },
            { id: "maint", text: "Upkeep (INR/sqft/year)", value: cMaint, setter: setCMaint, step: "0.5", min: "0" },
          ])}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cheaper over your horizon
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{winnerLabel}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a comparison."
                : `Saves ${money(result.savings)} over ${result.horizonYears} years on ${result.areaSqft} sqft`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy tile cost comparison"
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
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Item
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Vitrified
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Ceramic
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map(([label, v, c]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{v}</td>
                  <td className="py-2 text-right font-semibold">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!failed && (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Extra cost to lay vitrified</dt>
              <dd className="text-right font-semibold">{money(result.upfrontGap)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Whole-life difference</dt>
              <dd className="text-right font-semibold">{money(result.lifetimeGap)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Vitrified pays back its premium in</dt>
              <dd className="text-right font-semibold">
                {result.breakEvenYears ? `${num(result.breakEvenYears)} years` : "No premium to recover"}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {Object.entries(TILE_FACTS).map(([key, fact]) => (
          <div key={key} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">{fact.label}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-[var(--muted-foreground)]">Water absorption</dt>
                <dd className="font-medium">{fact.absorption}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Body</dt>
                <dd className="font-medium">{fact.body}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Best for</dt>
                <dd className="font-medium">{fact.bestFor}</dd>
              </div>
            </dl>
          </div>
        ))}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Installation cost is spread across the horizon so two tiles with different lives can be
        compared fairly. Prices vary widely by brand, size and city, so replace the defaults with your
        own dealer quotes before you decide.
      </p>
    </main>
  );
}
