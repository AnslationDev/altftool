"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";
import {
  DPDP_ACCESS_SECTION,
  EXPORT_CATEGORIES,
  GRIEVANCE_ACK_HOURS,
  GRIEVANCE_RESOLVE_DAYS,
  REQUEST_STEPS,
  estimateExport,
  formatSize,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SELECTED = ["orders", "addresses", "payments", "location", "support"];
const DEFAULT_YEARS = "6";
const DEFAULT_ORDERS = "8";
const DEFAULT_ADDRESSES = "6";
const DEFAULT_CARDS = "3";

const DASH = "—";

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState([]);

  const result = useMemo(
    () =>
      estimateExport({
        selectedIds: selected,
        years: years.trim() === "" ? Number.NaN : Number(years),
        ordersPerMonth: orders.trim() === "" ? Number.NaN : Number(orders),
        savedAddresses: addresses.trim() === "" ? Number.NaN : Number(addresses),
        savedCards: cards.trim() === "" ? Number.NaN : Number(cards),
      }),
    [selected, years, orders, addresses, cards],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const toggleStep = (index) =>
    setDone((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Food-delivery data request plan",
      `Categories selected: ${result.count}`,
      `Estimated archive: ${result.totalLabel}`,
      `Orders covered: ${result.totalOrders}`,
      `Address snapshots frozen into past orders: ${result.addressSnapshots}`,
      `Saved addresses you could delete now: ${result.trimmableAddresses}`,
      `Saved payment methods you could remove: ${result.trimmableCards}`,
      `Sensitivity: ${result.sensitivityScore}/100 (${result.band})`,
      `Grievance Officer: acknowledge in ${GRIEVANCE_ACK_HOURS} h, dispose in ${GRIEVANCE_RESOLVE_DAYS} days`,
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
    setSelected(DEFAULT_SELECTED);
    setYears(DEFAULT_YEARS);
    setOrders(DEFAULT_ORDERS);
    setAddresses(DEFAULT_ADDRESSES);
    setCards(DEFAULT_CARDS);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Data access
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Swiggy Zomato Data Request Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Food-delivery apps have no export button, so the request goes to a Grievance Officer. Plan
          what to ask for, see how many address snapshots are frozen into your past orders, and find
          out how much you can delete straight away.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Choose what to ask for</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EXPORT_CATEGORIES.map((category) => {
            const checked = selected.includes(category.id);
            return (
              <label
                key={category.id}
                htmlFor={`food-${category.id}`}
                className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`food-${category.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(category.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{category.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {category.what}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelected(EXPORT_CATEGORIES.map((category) => category.id))}
            className={GHOST_BTN}
          >
            Select all
          </button>
          <button type="button" onClick={() => setSelected([])} className={GHOST_BTN}>
            Deselect all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Describe your account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="food-years">
              Years using the app
            </label>
            <input
              id="food-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="18"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="food-orders">
              Orders per month
            </label>
            <input
              id="food-orders"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="200"
              step="1"
              value={orders}
              onChange={(event) => setOrders(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="food-addresses">
              Saved addresses in the app
            </label>
            <input
              id="food-addresses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="50"
              step="1"
              value={addresses}
              onChange={(event) => setAddresses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="food-cards">
              Saved payment methods
            </label>
            <input
              id="food-cards"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={cards}
              onChange={(event) => setCards(event.target.value)}
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
              Address snapshots stored about you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.addressSnapshots)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `One per order, across about ${NUM.format(result.totalOrders)} orders`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the food-delivery data request plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the food-delivery data request planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Estimated archive size", hasError ? DASH : result.totalLabel],
            ["Categories selected", hasError ? DASH : NUM.format(result.count)],
            ["Largest single category", hasError ? DASH : result.largestLabel],
            [
              "Saved addresses you could delete now",
              hasError ? DASH : NUM.format(result.trimmableAddresses),
            ],
            [
              "Saved payment methods you could remove",
              hasError ? DASH : NUM.format(result.trimmableCards),
            ],
            [
              "Diet and routine inference index",
              hasError ? DASH : `${result.dietInference}/99`,
            ],
            [
              "Sensitivity of this selection",
              hasError ? DASH : `${result.sensitivityScore}/100 — ${result.band}`,
            ],
            [
              "Grievance Officer deadlines",
              `${GRIEVANCE_ACK_HOURS} h to acknowledge, ${GRIEVANCE_RESOLVE_DAYS} days to dispose`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Ask for the copy under {DPDP_ACCESS_SECTION} of the DPDP Act 2023 first, and delete the
          account only afterwards — once it is closed the history goes with it.
        </p>

        {!hasError && result.criticalCategories.length > 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Highest-risk items here: {result.criticalCategories.join(", ")}. Rewrite delivery notes
            so they no longer contain gate codes or where the spare key is kept.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Size and risk by category</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Estimated size
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Sensitivity
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {row.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right align-top">{formatSize(row.sizeMb)}</td>
                    <td className="py-2 text-right align-top">{row.sensitivity}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">How to make the request</h2>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {done.length}/{REQUEST_STEPS.length} done
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {REQUEST_STEPS.map(([title, detail], index) => {
            const checked = done.includes(index);
            return (
              <li key={title}>
                <label
                  htmlFor={`food-step-${index}`}
                  className="flex min-h-11 cursor-pointer gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <input
                    id={`food-step-${index}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStep(index)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${checked ? "text-[var(--success)]" : ""}`}
                    >
                      {index + 1}. {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {detail}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes and counts are planning estimates, not a measurement of your account. This page is
        informational and is not legal advice; consult a qualified professional about your rights
        under the DPDP Act 2023 or any other law that applies to you.
      </p>
    </main>
  );
}
