"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, ShoppingBasket, Trash2 } from "lucide-react";

import {
  addDays,
  DEFAULT_REMINDER_DAYS,
  describeDaysLeft,
  FOOD_TYPES,
  pantryToText,
  STORAGE_LOCATIONS,
  suggestExpiry,
  summarisePantry,
} from "../lib";

/** Fixed date used for the very first render so the server and client agree. */
const REFERENCE_TODAY = "2026-07-27";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_STYLE = {
  expired: "bg-[var(--danger-soft)] text-[var(--danger)]",
  today: "bg-[var(--danger-soft)] text-[var(--danger)]",
  critical: "bg-[var(--muted)] text-[var(--foreground)]",
  soon: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  fresh: "bg-[var(--muted)] text-[var(--success)]",
};

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

/** Demo pantry, positioned relative to whatever "today" is, so it always reads sensibly. */
function makeDefaultItems(todayISO) {
  return [
    { id: 1, name: "Milk", foodKey: "milk", storage: "fridge", expiryISO: addDays(todayISO, 1), quantity: "2", unitCost: "60" },
    { id: 2, name: "Chicken breast", foodKey: "raw-poultry", storage: "fridge", expiryISO: addDays(todayISO, -1), quantity: "1", unitCost: "320" },
    { id: 3, name: "Baby spinach", foodKey: "leafy-greens", storage: "fridge", expiryISO: addDays(todayISO, 6), quantity: "1", unitCost: "40" },
    { id: 4, name: "Basmati rice", foodKey: "dry-staples", storage: "pantry", expiryISO: addDays(todayISO, 705), quantity: "1", unitCost: "900" },
  ];
}

export default function ToolHome() {
  const [todayISO, setTodayISO] = useState(REFERENCE_TODAY);
  const [items, setItems] = useState(() => makeDefaultItems(REFERENCE_TODAY));
  const [reminderDays, setReminderDays] = useState(String(DEFAULT_REMINDER_DAYS));
  const [nextId, setNextId] = useState(5);
  const [seeded, setSeeded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Move to the real current date once, on the client only, and re-seed the demo pantry
  // around it so the example items keep making sense.
  useEffect(() => {
    if (seeded) return;
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setTodayISO(iso);
    setItems(makeDefaultItems(iso));
    setSeeded(true);
  }, [seeded]);

  const summary = useMemo(
    () =>
      summarisePantry(
        items.map((row) => ({
          name: row.name,
          expiryISO: row.expiryISO,
          quantity: toNumber(row.quantity),
          unitCost: toNumber(row.unitCost),
          storage: row.storage,
        })),
        todayISO,
        toNumber(reminderDays),
      ),
    [items, todayISO, reminderDays],
  );

  const hasError = Boolean(summary.error);

  const updateItem = (id, field, value) => {
    setItems((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const applyShelfLife = (id) => {
    setItems((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        const suggestion = suggestExpiry(row.foodKey, row.storage, todayISO);
        if (suggestion.error) return row;
        return { ...row, expiryISO: suggestion.expiryISO };
      }),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: nextId,
        name: "",
        foodKey: "leftovers",
        storage: "fridge",
        expiryISO: addDays(todayISO, 3),
        quantity: "1",
        unitCost: "0",
      },
    ]);
    setNextId((current) => current + 1);
  };

  const removeItem = (id) => {
    setItems((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(pantryToText(summary, "INR"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setItems(makeDefaultItems(todayISO));
    setReminderDays(String(DEFAULT_REMINDER_DAYS));
    setNextId(5);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
          USDA FoodKeeper shelf life
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Pantry Expiry Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what is in the fridge, freezer and cupboard. The tracker sorts everything by days
          remaining, flags what to use first, and shows the money sitting at risk this week.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="today-date">
              Today&apos;s date
            </label>
            <input
              id="today-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={todayISO}
              onChange={(event) => setTodayISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="reminder-days">
              Remind me this many days ahead
            </label>
            <input
              id="reminder-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={reminderDays}
              onChange={(event) => setReminderDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Items needing attention
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {hasError ? DASH : summary.needsAttention}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the dates above to see the pantry summary."
                : `of ${summary.totalItems} tracked items, within ${summary.reminderDays} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pantry summary to the clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the pantry" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite">
          {[
            ["Already expired", hasError ? DASH : `${summary.counts.expired} items`],
            ["Use today", hasError ? DASH : `${summary.counts.today} items`],
            ["Use within 2 days", hasError ? DASH : `${summary.counts.critical} items`],
            ["Value at risk this window", hasError ? DASH : INR.format(summary.atRiskValue)],
            ["Value already lost", hasError ? DASH : INR.format(summary.expiredValue)],
            [
              "Share of pantry value wasted",
              hasError ? DASH : `${summary.wastePercent.toFixed(1)}%`,
            ],
            [
              "Next thing to expire",
              hasError || !summary.nextExpiry
                ? DASH
                : `${summary.nextExpiry.name} — ${describeDaysLeft(summary.nextExpiry.daysLeft)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Use-first order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Expires</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                  <th scope="col" className="py-2 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {summary.items.map((row) => (
                  <tr key={`${row.name}-${row.expiryISO}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{describeDaysLeft(row.daysLeft)}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="py-2 text-right">{INR.format(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your pantry</h2>
          <button type="button" onClick={addItem} className={GHOST_BTN} aria-label="Add a pantry item">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {items.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(row.id)}
                  disabled={items.length === 1}
                  aria-label={`Remove item ${index + 1}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`item-name-${row.id}`}>
                    Name
                  </label>
                  <input
                    id={`item-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder="What is it"
                    onChange={(event) => updateItem(row.id, "name", event.target.value)}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS} htmlFor={`item-food-${row.id}`}>
                    Food type
                  </label>
                  <select
                    id={`item-food-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.foodKey}
                    onChange={(event) => updateItem(row.id, "foodKey", event.target.value)}
                  >
                    {FOOD_TYPES.map((food) => (
                      <option key={food.key} value={food.key}>
                        {food.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS} htmlFor={`item-storage-${row.id}`}>
                    Stored in
                  </label>
                  <select
                    id={`item-storage-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.storage}
                    onChange={(event) => updateItem(row.id, "storage", event.target.value)}
                  >
                    {STORAGE_LOCATIONS.map((place) => (
                      <option key={place.key} value={place.key}>
                        {place.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS} htmlFor={`item-expiry-${row.id}`}>
                    Use by
                  </label>
                  <input
                    id={`item-expiry-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.expiryISO}
                    onChange={(event) => updateItem(row.id, "expiryISO", event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => applyShelfLife(row.id)}
                    className={`mt-2 ${GHOST_BTN}`}
                    aria-label={`Use the FoodKeeper shelf life for item ${index + 1}`}
                  >
                    Use FoodKeeper shelf life
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`item-qty-${row.id}`}>
                      Quantity
                    </label>
                    <input
                      id={`item-qty-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={row.quantity}
                      onChange={(event) => updateItem(row.id, "quantity", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`item-cost-${row.id}`}>
                      Unit cost (INR)
                    </label>
                    <input
                      id={`item-cost-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="10"
                      value={row.unitCost}
                      onChange={(event) => updateItem(row.id, "unitCost", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Shelf-life suggestions use the conservative end of the USDA FoodKeeper ranges and assume a
        refrigerator at 4 °C or below and a freezer at −18 °C. They are guidance for quality and
        safety planning, not a substitute for the date printed on the pack. Nothing is uploaded —
        the list stays in this browser tab.
      </p>
    </main>
  );
}
