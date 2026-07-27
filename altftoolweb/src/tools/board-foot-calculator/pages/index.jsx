"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";
import {
  LENGTH_UNITS,
  PRICE_BASES,
  QUARTER_THICKNESS_INCHES,
  computeBoardFeet,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const n2 = (value) => N2.format(Number.isFinite(value) ? value : 0);
const n4 = (value) => N4.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const DEFAULTS = {
  thickness: "1",
  thicknessUnit: "in",
  width: "6",
  widthUnit: "in",
  length: "8",
  lengthUnit: "ft",
  pieces: "10",
  wastePercent: "10",
  price: "250",
  priceBasis: "boardFoot",
  billThinStockAtOneInch: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

function UnitSelect({ id, value, onChange, label }) {
  return (
    <select id={id} className={INPUT_CLASS} value={value} onChange={onChange} aria-label={label}>
      {Object.entries(LENGTH_UNITS).map(([key, entry]) => (
        <option key={key} value={key}>
          {entry.label}
        </option>
      ))}
    </select>
  );
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, [key]: checked }));
    setCopied(false);
  };

  const applyQuarter = (inches) => {
    setForm((prev) => ({ ...prev, thickness: String(inches), thicknessUnit: "in" }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeBoardFeet({
        thickness: toNumber(form.thickness),
        thicknessUnit: form.thicknessUnit,
        width: toNumber(form.width),
        widthUnit: form.widthUnit,
        length: toNumber(form.length),
        lengthUnit: form.lengthUnit,
        pieces: toNumber(form.pieces),
        wastePercent: toNumber(form.wastePercent),
        price: toNumber(form.price),
        priceBasis: form.priceBasis,
        billThinStockAtOneInch: form.billThinStockAtOneInch,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Board Foot Calculation",
      `Board size: ${n2(result.thicknessIn)} in x ${n2(result.widthIn)} in x ${n2(result.lengthIn)} in`,
      `Pieces: ${result.pieces}`,
      `Board feet per piece: ${n4(result.bfPerPiece)}`,
      `Board feet total: ${n2(result.boardFeetTotal)}`,
      `With waste allowance: ${n2(result.boardFeetWithWaste)} BF`,
      `Volume: ${n2(result.cubicFeet)} cubic feet / ${n4(result.cubicMetres)} cubic metres`,
      `Total cost: ${money(result.totalCost)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Board feet per piece", DASH],
        ["Board feet before waste", DASH],
        ["Waste allowance", DASH],
        ["Volume in cubic feet (CFT)", DASH],
        ["Volume in cubic metres", DASH],
        ["Volume in cubic inches", DASH],
        ["Running length of all pieces", DASH],
        ["Cost per piece", DASH],
        ["Effective cost per cubic foot", DASH],
      ]
    : [
        ["Board feet per piece", `${n4(result.bfPerPiece)} BF`],
        ["Board feet before waste", `${n2(result.boardFeetTotal)} BF`],
        ["Waste allowance", `${n2(result.wasteBoardFeet)} BF`],
        ["Volume in cubic feet (CFT)", `${n2(result.cubicFeet)} cu ft`],
        ["Volume in cubic metres", `${n4(result.cubicMetres)} m³`],
        ["Volume in cubic inches", `${n2(result.cubicInches)} cu in`],
        ["Running length of all pieces", `${n2(result.linearFeet)} ft`],
        ["Cost per piece", money(result.costPerPiece)],
        ["Effective cost per cubic foot", money(result.costPerCubicFoot)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Carpentry
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Board Foot Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A board foot is 144 cubic inches — one inch thick, twelve inches square. Enter your board
          in inches, feet or millimetres and get board feet, cubic feet, cubic metres and the bill.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-thickness">
              Thickness
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="bf-thickness"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.05"
                value={form.thickness}
                onChange={setField("thickness")}
              />
              <UnitSelect
                id="bf-thickness-unit"
                label="Thickness unit"
                value={form.thicknessUnit}
                onChange={setField("thicknessUnit")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-width">
              Width
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="bf-width"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={form.width}
                onChange={setField("width")}
              />
              <UnitSelect
                id="bf-width-unit"
                label="Width unit"
                value={form.widthUnit}
                onChange={setField("widthUnit")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-length">
              Length
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="bf-length"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={form.length}
                onChange={setField("length")}
              />
              <UnitSelect
                id="bf-length-unit"
                label="Length unit"
                value={form.lengthUnit}
                onChange={setField("lengthUnit")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-pieces">
              Number of pieces
            </label>
            <input
              id="bf-pieces"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.pieces}
              onChange={setField("pieces")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-waste">
              Waste allowance (%)
            </label>
            <input
              id="bf-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.wastePercent}
              onChange={setField("wastePercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-price">
              Price (INR)
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="bf-price"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={form.price}
                onChange={setField("price")}
              />
              <select
                id="bf-price-basis"
                aria-label="Price basis"
                className={INPUT_CLASS}
                value={form.priceBasis}
                onChange={setField("priceBasis")}
              >
                {Object.entries(PRICE_BASES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold">Quarter sizes (rough hardwood thickness)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(QUARTER_THICKNESS_INCHES).map(([label, inches]) => (
              <button
                key={label}
                type="button"
                className={CHIP_BTN}
                onClick={() => applyQuarter(inches)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
          htmlFor="bf-thin"
        >
          <input
            id="bf-thin"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={form.billThinStockAtOneInch}
            onChange={setToggle("billThinStockAtOneInch")}
          />
          Bill stock under 1 inch as 1 inch (hardwood yard practice)
        </label>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Board feet to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${n2(result.boardFeetWithWaste)} BF`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${result.pieces} pieces, waste included — ${money(result.totalCost)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy board foot calculation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.billedThicknessIn !== result.thicknessIn && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Billed at 1 inch thick instead of {n2(result.thicknessIn)} in, so each piece counts as{" "}
            {n4(result.bfPerPiece)} BF rather than {n4(result.actualBfPerPiece)} BF.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Board feet are measured on rough-sawn size, so a board planed to 19 mm is still sold as
        one-inch stock. Confirm with the yard whether their quote is on nominal or finished
        dimensions before you compare prices.
      </p>
    </main>
  );
}
