"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BASIS_LABELS,
  CHARGE_HEADS,
  NON_OCCUPANCY_MAX_PERCENT,
  splitSocietyCharges,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_HEADS = {
  serviceCharges: "60000",
  repairsFund: "30000",
  sinkingFund: "10000",
  insurance: "0",
  leaseRent: "0",
  waterCharges: "6000",
  parkingCharges: "4000",
};

const DEFAULT_FLATS = [
  { id: 1, name: "A-101", area: "1000", inlets: "3", parking: "1", propertyTax: "2000", tenanted: false },
  { id: 2, name: "A-102", area: "500", inlets: "2", parking: "1", propertyTax: "1200", tenanted: true },
  { id: 3, name: "A-103", area: "500", inlets: "1", parking: "0", propertyTax: "1000", tenanted: false },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [heads, setHeads] = useState(DEFAULT_HEADS);
  const [flats, setFlats] = useState(DEFAULT_FLATS);
  const [nonOccupancy, setNonOccupancy] = useState("10");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const numericHeads = {};
    for (const head of CHARGE_HEADS) numericHeads[head.id] = toNumber(heads[head.id]);
    return splitSocietyCharges({
      heads: numericHeads,
      flats: flats.map((flat) => ({
        id: flat.id,
        name: flat.name,
        area: toNumber(flat.area),
        inlets: toNumber(flat.inlets),
        parking: toNumber(flat.parking),
        propertyTax: toNumber(flat.propertyTax),
        tenanted: flat.tenanted,
      })),
      nonOccupancyPercent: toNumber(nonOccupancy),
    });
  }, [heads, flats, nonOccupancy]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Society maintenance split (per month)",
      `Flats: ${result.flatCount} · total built-up area ${result.totalArea} sq ft`,
      `Service charges per flat (equal): ${money2(result.equalPerFlat)}`,
      `Area-based charges: ${money2(result.areaRatePerSqft)} per sq ft`,
      "",
      ...result.rows.map(
        (row) => `${row.name}: ${money2(row.total)} (${pct(row.sharePercent)})`,
      ),
      "",
      `Total collected each month: ${money2(result.grandTotal)}`,
      `Total for the year: ${money2(result.annualTotal)}`,
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
    setHeads(DEFAULT_HEADS);
    setFlats(DEFAULT_FLATS);
    setNonOccupancy("10");
    setCopied(false);
  };

  const updateHead = (id, value) => setHeads((prev) => ({ ...prev, [id]: value }));

  const updateFlat = (id, field, value) =>
    setFlats((prev) => prev.map((flat) => (flat.id === id ? { ...flat, [field]: value } : flat)));

  const addFlat = () =>
    setFlats((prev) => {
      const nextId = prev.reduce((max, flat) => Math.max(max, flat.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          name: `Flat ${nextId}`,
          area: "500",
          inlets: "1",
          parking: "0",
          propertyTax: "0",
          tenanted: false,
        },
      ];
    });

  const removeFlat = (id) => setFlats((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Housing society
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Property Maintenance and Society Charge Splitter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Apportion a month&apos;s society budget the way the model bye-laws require — service
          charges equally per flat, repairs and sinking fund by built-up area, water by inlets and
          parking by slot.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Monthly society budget</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CHARGE_HEADS.map((head) => (
            <div key={head.id}>
              <label className={LABEL_CLASS} htmlFor={`head-${head.id}`}>
                {head.label} (INR)
              </label>
              <input
                id={`head-${head.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={heads[head.id]}
                onChange={(event) => updateHead(head.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {BASIS_LABELS[head.basis]} · {head.hint}
              </p>
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-percent">
              Non-occupancy charge on let-out flats (%)
            </label>
            <input
              id="noc-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={NON_OCCUPANCY_MAX_PERCENT}
              step="1"
              value={nonOccupancy}
              onChange={(event) => setNonOccupancy(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Capped at {NON_OCCUPANCY_MAX_PERCENT}% of service charges
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Flats</h2>
          <button type="button" onClick={addFlat} className={GHOST_BTN} aria-label="Add another flat">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add flat
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {flats.map((flat) => (
            <div key={flat.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`flat-name-${flat.id}`}>
                    Flat number
                  </label>
                  <input
                    id={`flat-name-${flat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={flat.name}
                    onChange={(event) => updateFlat(flat.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`flat-area-${flat.id}`}>
                    Built-up area (sq ft)
                  </label>
                  <input
                    id={`flat-area-${flat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={flat.area}
                    onChange={(event) => updateFlat(flat.id, "area", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`flat-inlets-${flat.id}`}>
                    Water inlets
                  </label>
                  <input
                    id={`flat-inlets-${flat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={flat.inlets}
                    onChange={(event) => updateFlat(flat.id, "inlets", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`flat-parking-${flat.id}`}>
                    Parking slots
                  </label>
                  <input
                    id={`flat-parking-${flat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={flat.parking}
                    onChange={(event) => updateFlat(flat.id, "parking", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`flat-tax-${flat.id}`}>
                    Municipal property tax for the month (INR)
                  </label>
                  <input
                    id={`flat-tax-${flat.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={flat.propertyTax}
                    onChange={(event) => updateFlat(flat.id, "propertyTax", event.target.value)}
                  />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <label
                    htmlFor={`flat-tenanted-${flat.id}`}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
                  >
                    <input
                      id={`flat-tenanted-${flat.id}`}
                      type="checkbox"
                      className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={flat.tenanted}
                      onChange={(event) => updateFlat(flat.id, "tenanted", event.target.checked)}
                    />
                    Let out to a tenant
                  </label>
                  <button
                    type="button"
                    onClick={() => removeFlat(flat.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                    aria-label={`Remove flat ${flat.name}`}
                    disabled={flats.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Collected every month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.grandTotal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.flatCount} flats · ${money(result.annualTotal)} a year`
                : "Fix the highlighted input to see the split."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the society charge split"
              className={GHOST_BTN}
              disabled={!ok}
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
            ["Service charge per flat (equal share)", ok ? money2(result.equalPerFlat) : DASH],
            ["Area-based charges per sq ft", ok ? money2(result.areaRatePerSqft) : DASH],
            ["Total built-up area", ok ? `${result.totalArea} sq ft` : DASH],
            ["Property tax billed across flats", ok ? money2(result.totalPropertyTax) : DASH],
            ["Non-occupancy charges collected", ok ? money2(result.totalNonOccupancy) : DASH],
            ["Budget before non-occupancy charges", ok ? money2(result.budgetTotal) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Flat-wise bill</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Flat</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Service</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Area based</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Water</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Parking</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Tax</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Non-occupancy</th>
                  <th scope="col" className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{money(row.serviceShare)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.areaShare)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.waterShare)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.parkingShare)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.propertyTax)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.nonOccupancy)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Share of the total bill:{" "}
            {result.rows.map((row) => `${row.name} ${pct(row.sharePercent)}`).join(" · ")}
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on the model bye-laws for co-operative housing societies. Your
        registered bye-laws, state rules and general body resolutions decide the actual basis, and a
        society cannot charge more than 21% a year simple interest on arrears. Consult your
        managing committee or a co-operative law professional for a binding position.
      </p>
    </main>
  );
}
