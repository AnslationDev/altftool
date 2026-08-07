"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Wrench } from "lucide-react";
import {
  DEFAULT_ITEMS,
  DEFAULT_PARTS_MARKUP_PCT,
  DEFAULT_TOOL_LIFE_SERVICES,
  PARTS_GST_RATE,
  SERVICE_GST_RATE,
  annualiseSaving,
  compareServiceCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SCALARS = {
  markup: "20",
  labourHours: "2.5",
  labourRate: "450",
  diyHours: "2",
  hourlyValue: "0",
  toolCost: "3500",
  toolLife: "10",
  disposal: "100",
  perYear: "2",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" ? NaN : value;
};

const seedRows = () =>
  DEFAULT_ITEMS.map((item) => ({
    key: item.id,
    name: item.name,
    unit: item.unit,
    qty: String(item.qty),
    price: String(item.price),
  }));

export default function ToolHome() {
  const [rows, setRows] = useState(seedRows);
  const [nextId, setNextId] = useState(1);
  const [markup, setMarkup] = useState(DEFAULT_SCALARS.markup);
  const [labourHours, setLabourHours] = useState(DEFAULT_SCALARS.labourHours);
  const [labourRate, setLabourRate] = useState(DEFAULT_SCALARS.labourRate);
  const [diyHours, setDiyHours] = useState(DEFAULT_SCALARS.diyHours);
  const [hourlyValue, setHourlyValue] = useState(DEFAULT_SCALARS.hourlyValue);
  const [toolCost, setToolCost] = useState(DEFAULT_SCALARS.toolCost);
  const [toolLife, setToolLife] = useState(DEFAULT_SCALARS.toolLife);
  const [disposal, setDisposal] = useState(DEFAULT_SCALARS.disposal);
  const [perYear, setPerYear] = useState(DEFAULT_SCALARS.perYear);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareServiceCost({
        items: rows.map((row) => ({
          name: row.name,
          qty: toNumber(row.qty),
          price: toNumber(row.price),
        })),
        partsMarkupPct: toNumber(markup),
        labourHours: toNumber(labourHours),
        labourRate: toNumber(labourRate),
        diyHours: toNumber(diyHours),
        hourlyValue: toNumber(hourlyValue),
        toolCost: toNumber(toolCost),
        toolLifeServices: toNumber(toolLife),
        disposalCost: toNumber(disposal),
      }),
    [rows, markup, labourHours, labourRate, diyHours, hourlyValue, toolCost, toolLife, disposal],
  );

  const annual = useMemo(() => {
    if (result.error) return { error: result.error };
    return annualiseSaving(result.cashSaving, toNumber(perYear));
  }, [result, perYear]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "DIY vs Garage Service Cost",
      `Do it yourself (cash): ${money(result.diyCash)}`,
      `Workshop invoice: ${money(result.garageTotal)}`,
      `Cash saving per service: ${money(result.cashSaving)} (${pct(result.savingPct)})`,
      result.effectiveHourly === null
        ? "Effective value of your time: enter DIY hours"
        : `Effective value of your time: ${money(result.effectiveHourly)} per hour`,
      result.breakEvenServices === null
        ? "Tool kit never pays back at these prices"
        : `Tool kit pays for itself after ${result.breakEvenServices} service(s)`,
      annual.error ? "" : `Saving across ${toNumber(perYear) || 0} services a year: ${money(annual.annualSaving)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result, annual, perYear]);

  const updateRow = (key, field, value) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = () => {
    const key = `custom-${nextId}`;
    setNextId((value) => value + 1);
    setRows((current) => [
      ...current,
      { key, name: "New part", unit: "piece", qty: "1", price: "0" },
    ]);
  };

  const removeRow = (key) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

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
    setRows(seedRows());
    setNextId(1);
    setMarkup(DEFAULT_SCALARS.markup);
    setLabourHours(DEFAULT_SCALARS.labourHours);
    setLabourRate(DEFAULT_SCALARS.labourRate);
    setDiyHours(DEFAULT_SCALARS.diyHours);
    setHourlyValue(DEFAULT_SCALARS.hourlyValue);
    setToolCost(DEFAULT_SCALARS.toolCost);
    setToolLife(DEFAULT_SCALARS.toolLife);
    setDisposal(DEFAULT_SCALARS.disposal);
    setPerYear(DEFAULT_SCALARS.perYear);
    setCopied(false);
  };

  const headline = failed
    ? "—"
    : result.cheaper === "diy"
      ? money(result.cashSaving)
      : money(Math.abs(result.cashSaving));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          DIY vs Garage Service Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price the same minor service both ways — parts you buy yourself versus a workshop bill
          with parts markup, labour and {Math.round(SERVICE_GST_RATE * 100)}% GST — and see how many
          services it takes for a tool kit to pay for itself.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Parts and consumables (price excluding GST)</h2>
        <div className="mt-4 grid gap-4">
          {rows.map((row) => (
            <div key={row.key} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`name-${row.key}`}>
                    Part
                  </label>
                  <input
                    id={`name-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(row.key, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qty-${row.key}`}>
                    Qty ({row.unit})
                  </label>
                  <input
                    id={`qty-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={row.qty}
                    onChange={(event) => updateRow(row.key, "qty", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`price-${row.key}`}>
                    Unit price (INR)
                  </label>
                  <input
                    id={`price-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={row.price}
                    onChange={(event) => updateRow(row.key, "price", event.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label={`Remove ${row.name}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add part
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Workshop quote</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="markup">
              Parts markup at the garage (%)
            </label>
            <input
              id="markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="5"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Authorised service centres commonly add around {DEFAULT_PARTS_MARKUP_PCT}%.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="labour-rate">
              Labour rate (INR per hour, ex-GST)
            </label>
            <input
              id="labour-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={labourRate}
              onChange={(event) => setLabourRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="labour-hours">
              Labour hours billed
            </label>
            <input
              id="labour-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={labourHours}
              onChange={(event) => setLabourHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="per-year">
              Services of this type per year
            </label>
            <input
              id="per-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={perYear}
              onChange={(event) => setPerYear(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your side of the job</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="diy-hours">
              Hours it takes you
            </label>
            <input
              id="diy-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={diyHours}
              onChange={(event) => setDiyHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hourly-value">
              Value of your time (INR per hour)
            </label>
            <input
              id="hourly-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={hourlyValue}
              onChange={(event) => setHourlyValue(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave at 0 to compare cash only.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tool-cost">
              One-time tool kit cost (INR)
            </label>
            <input
              id="tool-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={toolCost}
              onChange={(event) => setToolCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tool-life">
              Services that kit will cover
            </label>
            <input
              id="tool-life"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={toolLife}
              onChange={(event) => setToolLife(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Default spreads it over {DEFAULT_TOOL_LIFE_SERVICES} services.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="disposal">
              Used-oil disposal, rags and cleaner per service (INR)
            </label>
            <input
              id="disposal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={disposal}
              onChange={(event) => setDisposal(event.target.value)}
            />
          </div>
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

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {failed
                ? "Saving per service"
                : result.cheaper === "garage"
                  ? "The workshop is cheaper by"
                  : "You save per service"}
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                failed || result.cheaper !== "garage"
                  ? "text-[var(--primary)]"
                  : "text-[var(--danger)]"
              }`}
            >
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the comparison."
                : `${pct(Math.abs(result.savingPct))} of the workshop invoice`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the DIY versus garage comparison"
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
            ["Parts you buy (ex-GST)", failed ? "—" : money(result.partsNet)],
            [
              `GST on parts (${Math.round(PARTS_GST_RATE * 100)}%)`,
              failed ? "—" : money(result.diyPartsGst),
            ],
            ["Tool kit share for this service", failed ? "—" : money(result.toolPerService)],
            ["Disposal and consumables", failed ? "—" : money(result.disposalCost)],
            ["Do it yourself — cash out", failed ? "—" : money(result.diyCash)],
            ["Same parts at garage price", failed ? "—" : money(result.garagePartsNet)],
            ["Garage labour (ex-GST)", failed ? "—" : money(result.garageLabourNet)],
            [
              `GST on labour (${Math.round(SERVICE_GST_RATE * 100)}%)`,
              failed ? "—" : money(result.garageLabourGst),
            ],
            ["Workshop invoice total", failed ? "—" : money(result.garageTotal)],
            [
              "Your time priced in",
              failed ? "—" : `${money(result.diyTimeValue)} → net ${money(result.savingAfterTime)}`,
            ],
            [
              "What your hours effectively earn",
              failed || result.effectiveHourly === null
                ? "—"
                : `${money(result.effectiveHourly)} / hour`,
            ],
            [
              "Tool kit payback",
              failed
                ? "—"
                : result.breakEvenServices === null
                  ? "Never at these prices"
                  : result.breakEvenServices === 0
                    ? "No tool cost entered"
                    : `${result.breakEvenServices} service${result.breakEvenServices === 1 ? "" : "s"}`,
            ],
            [
              "Saving over a year",
              failed || annual.error ? "—" : money(annual.annualSaving),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Doing your own service can void a manufacturer warranty if the
        vehicle is still inside its warranty period, and used engine oil must go to an authorised
        collection point — check your owner&apos;s manual and warranty terms before you start.
      </p>
    </main>
  );
}
