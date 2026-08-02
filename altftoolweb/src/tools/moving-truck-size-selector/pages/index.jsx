"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Truck } from "lucide-react";

import { ITEMS, VEHICLES, selectVehicle } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULT_COUNTS = {
  doubleBed: 1,
  singleBed: 1,
  wardrobe: 2,
  dresser: 0,
  sofa3: 1,
  sofa2: 0,
  armchair: 0,
  diningSet: 1,
  bookshelf: 1,
  tv: 1,
  desk: 0,
  fridge: 1,
  fridgeSingle: 0,
  washer: 1,
  ac: 2,
  acWindow: 0,
  twoWheeler: 0,
  mattressExtra: 0,
  plants: 0,
};
const DEFAULT_CARTONS = "60";
const DEFAULT_EXTRA = "0";

const GROUPS = ["Bedroom", "Living", "Appliances", "Other"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [cartons, setCartons] = useState(DEFAULT_CARTONS);
  const [extraCuft, setExtraCuft] = useState(DEFAULT_EXTRA);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectVehicle({
        counts,
        cartons: cartons === "" ? 0 : Number(cartons),
        extraCuft: extraCuft === "" ? 0 : Number(extraCuft),
      }),
    [counts, cartons, extraCuft],
  );

  const hasError = Boolean(result.error);

  const setCount = (id) => (event) => {
    const raw = event.target.value;
    setCounts((current) => ({ ...current, [id]: raw === "" ? 0 : Number(raw) }));
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      "Moving vehicle estimate",
      `Recommended: ${result.recommended.name} (${result.recommended.deck})`,
      result.fitsInOne ? "Fits in one load" : `Needs ${result.trips} loads`,
      `Packed volume: ${DEC.format(result.totalCuft)} cu ft (${DEC2.format(result.totalM3)} m3)`,
      `Estimated weight: ${NUM.format(result.weightKg)} kg`,
      `Body fill: ${NUM.format(result.fillPercent)}%`,
      "",
      "Largest contributors:",
      ...result.lines.slice(0, 8).map((line) => `${line.qty} x ${line.label} — ${DEC.format(line.cuft)} cu ft`),
      `Cartons — ${DEC.format(result.cartonCuft)} cu ft`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCounts(DEFAULT_COUNTS);
    setCartons(DEFAULT_CARTONS);
    setExtraCuft(DEFAULT_EXTRA);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Moving Truck Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count your furniture, appliances and cartons. This adds up the packed cube, estimates the
          weight at 7 lb per cubic foot, and picks the smallest tempo or truck that holds it at 85%
          stacking efficiency.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What are you moving?</h2>
        {GROUPS.map((group) => (
          <div key={group} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {group}
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {ITEMS.filter((item) => item.group === group).map((item) => (
                <div key={item.id}>
                  <label className={LABEL_CLASS} htmlFor={`mt-${item.id}`}>
                    {item.label}
                    <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                      ({item.cuft} cu ft)
                    </span>
                  </label>
                  <input
                    id={`mt-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="99"
                    step="1"
                    value={counts[item.id] ?? 0}
                    onChange={setCount(item.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mt-cartons">
              Packing cartons (any size)
            </label>
            <input
              id="mt-cartons"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="999"
              step="1"
              value={cartons}
              onChange={(event) => setCartons(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mt-extra">
              Anything else (cu ft)
            </label>
            <input
              id="mt-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5000"
              step="5"
              value={extraCuft}
              onChange={(event) => setExtraCuft(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Recommended vehicle
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.recommended.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a recommendation."
                : `Load body ${result.recommended.deck} · ${result.fitsInOne ? "one load" : `${NUM.format(result.trips)} loads needed`}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the vehicle recommendation"
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
            ["Total packed volume", hasError ? DASH : `${DEC.format(result.totalCuft)} cu ft`],
            ["Total packed volume (metric)", hasError ? DASH : `${DEC2.format(result.totalM3)} m³`],
            ["Furniture and appliances", hasError ? DASH : `${DEC.format(result.itemCuft)} cu ft`],
            ["Cartons", hasError ? DASH : `${DEC.format(result.cartonCuft)} cu ft`],
            ["Other / unlisted", hasError ? DASH : `${DEC.format(result.extraCuft)} cu ft`],
            ["Estimated weight", hasError ? DASH : `${NUM.format(result.weightKg)} kg`],
            ["Usable body volume", hasError ? DASH : `${NUM.format(result.recommended.usableCuft)} cu ft per load`],
            ["Body fill", hasError ? DASH : `${NUM.format(result.fillPercent)}%`],
            ["Spare capacity", hasError ? DASH : `${NUM.format(result.spareCuft)} cu ft`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.smaller && result.shedCuft > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Shed {NUM.format(result.shedCuft)} cu ft and a {result.smaller.name.toLowerCase()} would do
            the job{result.shedBlockedByWeight ? " on volume, though weight would then be the limit" : ""}.
          </p>
        ) : null}
      </section>

      {!hasError && result.lines.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the volume goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cu ft
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{line.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(line.qty)}
                    </td>
                    <td className="py-2 text-right font-semibold">{DEC.format(line.cuft)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The fleet compared</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Vehicle
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Load body
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Usable
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Payload
                </th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((vehicle) => {
                const isPick = !hasError && vehicle.id === result.recommended.id;
                return (
                  <tr
                    key={vehicle.id}
                    className={`border-b border-[var(--border)] last:border-0 align-top ${
                      isPick ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <span className={isPick ? "font-semibold text-[var(--primary)]" : "font-semibold"}>
                        {vehicle.name}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{vehicle.note}</span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {vehicle.deck}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {NUM.format(vehicle.usableCuft)} cu ft
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {NUM.format(vehicle.payloadKg)} kg
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate. Load-body sizes and rated payloads vary by make, model year and body
        builder — confirm the actual internal dimensions and the registration certificate&apos;s gross
        vehicle weight before you book. Overloading a goods vehicle is an offence and voids most
        transit insurance.
      </p>
    </main>
  );
}
