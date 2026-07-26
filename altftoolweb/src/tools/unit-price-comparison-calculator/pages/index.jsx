"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, Plus, RotateCcw, Scale, Trash2, Trophy } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MEASURES = {
  weight: {
    label: "Weight",
    base: "g",
    display: { label: "per kg", factor: 1000 },
    units: [
      { id: "g", label: "g", toBase: 1 },
      { id: "kg", label: "kg", toBase: 1000 },
      { id: "oz", label: "oz", toBase: 28.349523125 },
      { id: "lb", label: "lb", toBase: 453.59237 },
    ],
  },
  volume: {
    label: "Volume",
    base: "ml",
    display: { label: "per litre", factor: 1000 },
    units: [
      { id: "ml", label: "ml", toBase: 1 },
      { id: "l", label: "L", toBase: 1000 },
      { id: "floz", label: "fl oz (US)", toBase: 29.5735295625 },
      { id: "gal", label: "gallon (US)", toBase: 3785.411784 },
    ],
  },
  count: {
    label: "Count",
    base: "piece",
    display: { label: "per piece", factor: 1 },
    units: [
      { id: "pc", label: "pieces", toBase: 1 },
      { id: "dozen", label: "dozen", toBase: 12 },
      { id: "hundred", label: "hundreds", toBase: 100 },
    ],
  },
};

const DEFAULT_ITEMS = {
  weight: [
    { id: "i1", name: "Small pack", price: "62", size: "500", unit: "g", packs: "1" },
    { id: "i2", name: "Family pack", price: "115", size: "1", unit: "kg", packs: "1" },
    { id: "i3", name: "Combo (2 x 750 g)", price: "168", size: "750", unit: "g", packs: "2" },
  ],
  volume: [
    { id: "i1", name: "Small bottle", price: "48", size: "500", unit: "ml", packs: "1" },
    { id: "i2", name: "Large bottle", price: "89", size: "1", unit: "l", packs: "1" },
    { id: "i3", name: "Multipack (6 x 250 ml)", price: "150", size: "250", unit: "ml", packs: "6" },
  ],
  count: [
    { id: "i1", name: "Tray of 6", price: "45", size: "6", unit: "pc", packs: "1" },
    { id: "i2", name: "Tray of 12", price: "84", size: "12", unit: "pc", packs: "1" },
    { id: "i3", name: "Bulk 30", price: "199", size: "30", unit: "pc", packs: "1" },
  ],
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

let nextId = 100;
const makeId = () => `i${(nextId += 1)}`;

export default function ToolHome() {
  const [measure, setMeasure] = useState("weight");
  const [items, setItems] = useState(DEFAULT_ITEMS.weight);
  const [copied, setCopied] = useState(false);

  const config = MEASURES[measure];

  const changeMeasure = useCallback((next) => {
    setMeasure(next);
    setItems(DEFAULT_ITEMS[next]);
  }, []);

  const errors = useMemo(() => {
    const list = [];
    if (items.some((item) => toNumber(item.price) < 0)) {
      list.push("Prices cannot be negative.");
    }
    const priced = items.filter((item) => toNumber(item.price) > 0 && toNumber(item.size) > 0);
    if (priced.length === 0) {
      list.push("Enter a price and a pack size greater than 0 for at least one option.");
    } else if (priced.length === 1) {
      list.push("Add a second option with a price and size to compare.");
    }
    if (items.some((item) => item.price !== "" && toNumber(item.size) === 0 && toNumber(item.price) > 0)) {
      list.push("Pack size must be greater than 0 to work out a unit price.");
    }
    return list;
  }, [items]);

  const result = useMemo(() => {
    const rows = items.map((item) => {
      const unit = config.units.find((entry) => entry.id === item.unit) || config.units[0];
      const price = Math.max(toNumber(item.price), 0);
      const size = Math.max(toNumber(item.size), 0);
      const packs = Math.max(toNumber(item.packs) || 1, 0);
      const totalBase = size * unit.toBase * packs;
      const valid = price > 0 && totalBase > 0;
      return {
        id: item.id,
        name: item.name || "Option",
        price,
        totalBase,
        valid,
        perBase: valid ? price / totalBase : null,
        perDisplay: valid ? (price / totalBase) * config.display.factor : null,
        sizeLabel: `${num.format(size)} ${unit.label}${packs > 1 ? ` x ${num.format(packs)}` : ""}`,
      };
    });

    const valid = rows.filter((row) => row.valid);
    const best = valid.reduce(
      (acc, row) => (acc === null || row.perBase < acc.perBase ? row : acc),
      null
    );
    const worst = valid.reduce(
      (acc, row) => (acc === null || row.perBase > acc.perBase ? row : acc),
      null
    );

    const ranked = [...valid].sort((a, b) => a.perBase - b.perBase);

    const withPremium = rows.map((row) => ({
      ...row,
      premiumPct:
        row.valid && best && best.perBase > 0 ? ((row.perBase - best.perBase) / best.perBase) * 100 : null,
    }));

    const savingsPct =
      best && worst && worst.perBase > 0 ? ((worst.perBase - best.perBase) / worst.perBase) * 100 : 0;

    return { rows: withPremium, ranked, best, worst, savingsPct, validCount: valid.length };
  }, [config, items]);

  const updateItem = useCallback((id, field, value) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => (prev.length > 2 ? prev.filter((item) => item.id !== id) : prev));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: makeId(),
        name: `Option ${prev.length + 1}`,
        price: "",
        size: "",
        unit: MEASURES[measure].units[0].id,
        packs: "1",
      },
    ]);
  }, [measure]);

  const reset = useCallback(() => {
    setMeasure("weight");
    setItems(DEFAULT_ITEMS.weight);
  }, []);

  const report = useMemo(() => {
    const lines = [
      "Unit Price Comparison",
      `Measured by: ${config.label} (${config.display.label})`,
      "",
      ...result.ranked.map(
        (row, index) =>
          `${index + 1}. ${row.name} — ${inr.format(row.price)} for ${row.sizeLabel} = ${inr.format(
            row.perDisplay
          )} ${config.display.label}`
      ),
    ];
    if (result.best) {
      lines.push("", `Best value: ${result.best.name}`);
      if (result.savingsPct > 0) {
        lines.push(
          `Cheaper than the most expensive option by ${pct.format(result.savingsPct)}% per unit.`
        );
      }
    }
    return lines.join("\n");
  }, [config, result]);

  const copyReport = async () => {
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const primaryButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
  const ghostButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            Smart shopping
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Unit Price Comparison Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Bigger packs are not always cheaper. Enter the price and pack size of each option and
            this calculator normalises everything to the same unit so you can see the real winner.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(MEASURES).map(([key, entry]) => (
            <button
              key={key}
              type="button"
              onClick={() => changeMeasure(key)}
              aria-pressed={measure === key}
              className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                measure === key
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {errors.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Options to compare</h2>
              <button type="button" onClick={addItem} className={ghostButton}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add option
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {items.map((item, index) => {
                const row = result.rows[index];
                const isBest = result.best && row && row.id === result.best.id && result.validCount > 1;
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border bg-[var(--background)] p-3 ${
                      isBest ? "border-[var(--primary)]" : "border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`name-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Option {index + 1}
                        </label>
                        <input
                          id={`name-${item.id}`}
                          type="text"
                          value={item.name}
                          onChange={(event) => updateItem(item.id, "name", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 2}
                        aria-label={`Remove ${item.name || "option"}`}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`price-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Price (₹)
                        </label>
                        <input
                          id={`price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={item.price}
                          onChange={(event) => updateItem(item.id, "price", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`packs-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Packs in the deal
                        </label>
                        <input
                          id={`packs-${item.id}`}
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={item.packs}
                          onChange={(event) => updateItem(item.id, "packs", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`size-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Size of one pack
                        </label>
                        <input
                          id={`size-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={item.size}
                          onChange={(event) => updateItem(item.id, "size", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`unit-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Unit
                        </label>
                        <select
                          id={`unit-${item.id}`}
                          value={item.unit}
                          onChange={(event) => updateItem(item.id, "unit", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        >
                          {config.units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {row && row.valid ? (
                        <>
                          <span className="rounded-md bg-[var(--muted)] px-2 py-1 font-semibold">
                            {inr.format(row.perDisplay)} {config.display.label}
                          </span>
                          {isBest ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--success-soft)] px-2 py-1 font-semibold text-[var(--success)]">
                              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                              Best value
                            </span>
                          ) : row.premiumPct !== null && row.premiumPct > 0 ? (
                            <span className="rounded-md px-2 py-1 font-semibold text-[var(--muted-foreground)]">
                              {pct.format(row.premiumPct)}% more per unit
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">
                          Add a price and size to include this option.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Best value option
              </p>
              {result.best ? (
                <>
                  <p className="mt-1 text-2xl font-semibold leading-snug">{result.best.name}</p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    {inr.format(result.best.perDisplay)}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">{config.display.label}</p>
                  {result.validCount > 1 && result.savingsPct > 0 && (
                    <p className="mt-3 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-semibold text-[var(--success)]">
                      {pct.format(result.savingsPct)}% cheaper per unit than the priciest option
                      here.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Enter a price and pack size to see the winner.
                </p>
              )}

              {result.ranked.length > 0 && (
                <ol className="mt-4 grid gap-2 text-sm">
                  {result.ranked.map((row, index) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0"
                    >
                      <span className="min-w-0 truncate text-[var(--muted-foreground)]">
                        {index + 1}. {row.name}
                      </span>
                      <span className="shrink-0 font-semibold">{inr.format(row.perDisplay)}</span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy unit price comparison"
                  className={primaryButton}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset comparison" className={ghostButton}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">How it works</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Every option is converted to the same base unit ({config.base}), so a{" "}
                {inr0.format(115)} 1&nbsp;kg pack and a {inr0.format(62)} 500&nbsp;g pack can be
                compared directly. Unit price = total price ÷ (pack size × packs), then scaled to{" "}
                {config.display.label}.
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Only compare like with like — quality, expiry date and whether you will actually
                finish the larger pack matter as much as the unit price.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
