"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageCheck, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  REFUND_BUSINESS_DAYS_MAX,
  REFUND_BUSINESS_DAYS_MIN,
  RETAILERS,
  RETURN_STATUSES,
  computeReturnDeadline,
  summariseReturns,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const URGENCY_CLASS = {
  expired: "text-[var(--danger)]",
  critical: "text-[var(--danger)]",
  urgent: "text-[var(--warning)]",
  comfortable: "text-[var(--success)]",
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const shiftIso = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const DEFAULT_FORM = () => ({
  itemName: "Wireless headphones",
  retailerId: "amazon-us",
  purchaseDate: shiftIso(-28),
  deliveryDate: shiftIso(-26),
  customDays: "30",
  status: "deciding",
  returnedOn: "",
});

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [today, setToday] = useState(todayIso);
  const [tracked, setTracked] = useState([]);
  const [copied, setCopied] = useState(false);

  const retailer = RETAILERS.find((entry) => entry.id === form.retailerId) ?? RETAILERS[0];
  const isCustom = retailer.id === "custom";
  const needsDelivery = retailer.countFrom === "delivery";

  const result = useMemo(
    () =>
      computeReturnDeadline({
        retailerId: form.retailerId,
        purchaseDate: form.purchaseDate,
        deliveryDate: form.deliveryDate,
        customDays: Number(form.customDays),
        today,
        status: form.status,
        returnedOn: form.returnedOn,
      }),
    [form, today],
  );

  const summary = useMemo(() => summariseReturns(tracked, today), [tracked, today]);

  const hasError = Boolean(result.error);

  const update = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (hasError) return "";
    return [
      `Return deadline — ${form.itemName || "purchase"}`,
      `Retailer: ${result.retailer.label}`,
      `Window: ${result.windowDays} days from ${result.countFrom} (${result.startDate})`,
      `Last day to return: ${result.deadline}`,
      `Days remaining as of ${today}: ${result.daysRemaining}`,
      `Status: ${result.urgency.label}`,
      result.refundWindow
        ? `Refund expected between ${result.refundWindow.earliest} and ${result.refundWindow.latest}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, form.itemName, result, today]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const addToTracker = () => {
    if (hasError) return;
    setTracked((prev) => [
      ...prev,
      {
        key: `${form.itemName}-${prev.length}-${form.purchaseDate}`,
        itemName: form.itemName || "Untitled purchase",
        retailerId: form.retailerId,
        purchaseDate: form.purchaseDate,
        deliveryDate: form.deliveryDate,
        customDays: Number(form.customDays),
        status: form.status,
        returnedOn: form.returnedOn,
      },
    ]);
  };

  const removeTracked = (key) => {
    setTracked((prev) => prev.filter((row) => row.key !== key));
  };

  const reset = () => {
    setForm(DEFAULT_FORM());
    setToday(todayIso());
    setTracked([]);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Return window", DASH],
        ["Clock starts", DASH],
        ["Last day to return", DASH],
        ["Window used", DASH],
        ["Refund expected", DASH],
      ]
    : [
        ["Return window", `${NUM.format(result.windowDays)} days`],
        [
          "Clock starts",
          `${result.countFrom === "delivery" ? "Delivery" : "Purchase"} date — ${result.startDate}`,
        ],
        ["Last day to return", result.deadline],
        ["Window used", `${NUM.format(result.percentUsed)}%`],
        [
          "Refund expected",
          result.refundWindow
            ? `${result.refundWindow.earliest} to ${result.refundWindow.latest}`
            : `Add the date the retailer received it (${REFUND_BUSINESS_DAYS_MIN}–${REFUND_BUSINESS_DAYS_MAX} business days)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PackageCheck className="h-4 w-4" aria-hidden="true" />
          Shopping deadlines
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Return Deadline Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you bought and where, and this works out the last day you can send it back —
          counting from the delivery date or the purchase date depending on that retailer&apos;s
          published policy — plus when a card refund should realistically post.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rdt-item">
              What did you buy?
            </label>
            <input
              id="rdt-item"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.itemName}
              onChange={update("itemName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rdt-retailer">
              Retailer or policy
            </label>
            <select
              id="rdt-retailer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.retailerId}
              onChange={update("retailerId")}
            >
              {RETAILERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.days ? ` (${entry.days} days)` : ""}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{retailer.note}</p>
          </div>
          {isCustom ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rdt-custom">
                Return window (days)
              </label>
              <input
                id="rdt-custom"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.customDays}
                onChange={update("customDays")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="rdt-purchase">
              Purchase date
            </label>
            <input
              id="rdt-purchase"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.purchaseDate}
              onChange={update("purchaseDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rdt-delivery">
              Delivery date {needsDelivery ? "(required)" : "(optional)"}
            </label>
            <input
              id="rdt-delivery"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.deliveryDate}
              onChange={update("deliveryDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rdt-today">
              Today
            </label>
            <input
              id="rdt-today"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rdt-status">
              Return status
            </label>
            <select
              id="rdt-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.status}
              onChange={update("status")}
            >
              {RETURN_STATUSES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rdt-returned">
              Date the retailer received the return (optional)
            </label>
            <input
              id="rdt-returned"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.returnedOn}
              onChange={update("returnedOn")}
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
              Days left to return
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--primary)]" : URGENCY_CLASS[result.urgency.id]
              }`}
            >
              {hasError ? DASH : NUM.format(result.daysRemaining)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.lodged
                  ? "Return already lodged — the deadline no longer applies to this item."
                  : result.expired
                    ? `The window closed on ${result.deadline}. Ask about a goodwill exception or a manufacturer warranty claim.`
                    : `${result.urgency.label} — last day is ${result.deadline}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the return deadline result"
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
              aria-label="Reset the tracker to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={addToTracker}
          disabled={hasError}
          aria-label="Add this purchase to the tracked list"
          className={`mt-5 ${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add to tracked list
        </button>
      </section>

      {tracked.length > 0 && !summary.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Tracked purchases</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {summary.openCount} open · {summary.urgentCount} closing this week ·{" "}
              {summary.expiredCount} expired
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Retailer
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Deadline
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Days left
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{row.itemName}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                      {row.result.error ? DASH : row.result.retailer.label}
                    </td>
                    <td className="py-2.5 pr-3">{row.result.error ? DASH : row.result.deadline}</td>
                    <td
                      className={`py-2.5 pr-3 font-semibold ${
                        row.result.error ? "" : URGENCY_CLASS[row.result.urgency.id]
                      }`}
                    >
                      {row.result.error ? DASH : NUM.format(row.result.daysRemaining)}
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => removeTracked(row.key)}
                        aria-label={`Remove ${row.itemName} from the tracked list`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {summary.nextDeadline ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Next deadline across all open items: {summary.nextDeadline}
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Return windows are each retailer&apos;s published standard policy for general merchandise
        and can differ by category, marketplace seller and country. Always confirm the window shown
        on your own order page — that is the one the retailer will enforce.
      </p>
    </main>
  );
}
