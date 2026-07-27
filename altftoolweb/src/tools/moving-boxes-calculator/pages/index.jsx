"use client";

import { useMemo, useState } from "react";
import { Boxes, Check, Copy, RotateCcw } from "lucide-react";

import { DENSITY_LEVELS, KITCHEN_SIZES, estimateBoxes } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  bedrooms: "3",
  livingRooms: "2",
  occupants: "4",
  kitchenSize: "standard",
  homeOffice: false,
  bookShelfFeet: "20",
  hangingRailFeet: "12",
  density: "average",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [bedrooms, setBedrooms] = useState(DEFAULTS.bedrooms);
  const [livingRooms, setLivingRooms] = useState(DEFAULTS.livingRooms);
  const [occupants, setOccupants] = useState(DEFAULTS.occupants);
  const [kitchenSize, setKitchenSize] = useState(DEFAULTS.kitchenSize);
  const [homeOffice, setHomeOffice] = useState(DEFAULTS.homeOffice);
  const [bookShelfFeet, setBookShelfFeet] = useState(DEFAULTS.bookShelfFeet);
  const [hangingRailFeet, setHangingRailFeet] = useState(DEFAULTS.hangingRailFeet);
  const [density, setDensity] = useState(DEFAULTS.density);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateBoxes({
        bedrooms: bedrooms === "" ? 0 : Number(bedrooms),
        livingRooms: livingRooms === "" ? 0 : Number(livingRooms),
        occupants: occupants === "" ? 0 : Number(occupants),
        kitchenSize,
        homeOffice,
        bookShelfFeet: bookShelfFeet === "" ? 0 : Number(bookShelfFeet),
        hangingRailFeet: hangingRailFeet === "" ? 0 : Number(hangingRailFeet),
        density,
      }),
    [bedrooms, livingRooms, occupants, kitchenSize, homeOffice, bookShelfFeet, hangingRailFeet, density],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      "Moving carton estimate",
      `Total cartons: ${NUM.format(result.totalCartons)}`,
      `Packed volume: ${DEC.format(result.totalCuft)} cu ft (${DEC2.format(result.totalM3)} m3)`,
      "",
      ...result.byType.map((carton) => `${carton.count} x ${carton.name} — ${carton.inches}`),
      "",
      "Supplies:",
      `Packing tape: ${NUM.format(result.supplies.tapeRolls)} roll(s) of 50 m`,
      `Packing paper: ${DEC.format(result.supplies.paperKg)} kg`,
      `Bubble wrap: ${NUM.format(result.supplies.bubbleWrapMetres)} m`,
      `Marker pens: ${NUM.format(result.supplies.markers)}`,
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
    setBedrooms(DEFAULTS.bedrooms);
    setLivingRooms(DEFAULTS.livingRooms);
    setOccupants(DEFAULTS.occupants);
    setKitchenSize(DEFAULTS.kitchenSize);
    setHomeOffice(DEFAULTS.homeOffice);
    setBookShelfFeet(DEFAULTS.bookShelfFeet);
    setHangingRailFeet(DEFAULTS.hangingRailFeet);
    setDensity(DEFAULTS.density);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Boxes className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Moving Boxes Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many cartons of each standard size your home needs — plus tape, packing paper
          and bubble wrap — from your rooms, occupants, bookshelves and hanging clothes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-bedrooms">
              Bedrooms
            </label>
            <input
              id="mb-bedrooms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-living">
              Living / dining rooms
            </label>
            <input
              id="mb-living"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={livingRooms}
              onChange={(event) => setLivingRooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-occupants">
              People living there
            </label>
            <input
              id="mb-occupants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={occupants}
              onChange={(event) => setOccupants(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-kitchen">
              Kitchen size
            </label>
            <select
              id="mb-kitchen"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kitchenSize}
              onChange={(event) => setKitchenSize(event.target.value)}
            >
              {KITCHEN_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
              <option value="none">No kitchen to pack</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-books">
              Shelved books &amp; media (linear feet)
            </label>
            <input
              id="mb-books"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="1"
              value={bookShelfFeet}
              onChange={(event) => setBookShelfFeet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-rail">
              Hanging clothes (linear feet of rail)
            </label>
            <input
              id="mb-rail"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="1"
              value={hangingRailFeet}
              onChange={(event) => setHangingRailFeet(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mb-density">
              How heavily is the home packed?
            </label>
            <select
              id="mb-density"
              className={`mt-2 ${INPUT_CLASS}`}
              value={density}
              onChange={(event) => setDensity(event.target.value)}
            >
              {DENSITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          htmlFor="mb-office"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        >
          <input
            id="mb-office"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={homeOffice}
            onChange={(event) => setHomeOffice(event.target.checked)}
          />
          <span>There is a home office or study to pack</span>
        </label>
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
              Cartons needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalCartons)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see an estimate." : `Across ${result.byType.length} carton sizes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the moving carton estimate"
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
            ["Packed volume", hasError ? DASH : `${DEC.format(result.totalCuft)} cu ft`],
            ["Packed volume (metric)", hasError ? DASH : `${DEC2.format(result.totalM3)} m³`],
            ["Packing tape (50 m rolls)", hasError ? DASH : NUM.format(result.supplies.tapeRolls)],
            ["Packing paper", hasError ? DASH : `${DEC.format(result.supplies.paperKg)} kg`],
            ["Bubble wrap", hasError ? DASH : `${NUM.format(result.supplies.bubbleWrapMetres)} m`],
            ["Marker pens", hasError ? DASH : NUM.format(result.supplies.markers)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Carton breakdown</h2>
        {hasError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Carton
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Size
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Max weight
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.byType.map((carton) => (
                  <tr key={carton.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{carton.name}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{carton.use}</span>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold text-[var(--primary)]">
                      {NUM.format(carton.count)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {carton.inches}
                      <span className="block text-xs">{DEC.format(carton.cuft)} cu ft</span>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {NUM.format(carton.maxKg)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate, not a quote. Buy about 10% spare cartons — running out mid-pack costs
        more than the extra boxes. Keep every carton under roughly 23 kg so it can be carried safely,
        and put books in small cartons only.
      </p>
    </main>
  );
}
