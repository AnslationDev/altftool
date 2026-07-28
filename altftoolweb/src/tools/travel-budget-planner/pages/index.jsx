"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";

import { CURRENCIES, formatMoney, planTravelBudget } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  currency: "INR",
  travellers: "2",
  nights: "4",
  occupancyPerRoom: "2",
  flightPerPerson: "6000",
  visaInsurancePerPerson: "1200",
  nightlyRoomRate: "3500",
  foodPerPersonPerDay: "800",
  localTransportPerPersonPerDay: "300",
  activitiesPerPersonPerDay: "700",
  shoppingAndMisc: "2000",
  contingencyPercent: "10",
  alreadySaved: "10000",
  monthsToDeparture: "6",
};

const MONEY_FIELDS = [
  ["flightPerPerson", "Flights / long-distance travel (per person)"],
  ["visaInsurancePerPerson", "Visa & travel insurance (per person)"],
  ["nightlyRoomRate", "Room rate per night"],
  ["foodPerPersonPerDay", "Food per person per day"],
  ["localTransportPerPersonPerDay", "Local transport per person per day"],
  ["activitiesPerPersonPerDay", "Activities per person per day"],
  ["shoppingAndMisc", "Shopping & other one-offs (whole trip)"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      planTravelBudget({
        travellers: Number(form.travellers),
        nights: Number(form.nights),
        occupancyPerRoom: Number(form.occupancyPerRoom),
        flightPerPerson: form.flightPerPerson,
        visaInsurancePerPerson: form.visaInsurancePerPerson,
        nightlyRoomRate: form.nightlyRoomRate,
        foodPerPersonPerDay: form.foodPerPersonPerDay,
        localTransportPerPersonPerDay: form.localTransportPerPersonPerDay,
        activitiesPerPersonPerDay: form.activitiesPerPersonPerDay,
        shoppingAndMisc: form.shoppingAndMisc,
        contingencyPercent: form.contingencyPercent,
        alreadySaved: form.alreadySaved,
        monthsToDeparture: Number(form.monthsToDeparture),
      }),
    [form],
  );

  const hasError = Boolean(result.error);
  const cur = form.currency;
  const money = (value) => (hasError ? DASH : formatMoney(value, cur));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Travel budget — ${result.travellers} traveller(s), ${result.nights} night(s) / ${result.days} day(s)`,
      ...result.categories.map((c) => `${c.label}: ${formatMoney(c.amount, cur)} (${NUM.format(c.share)}%)`),
      `Subtotal: ${formatMoney(result.subtotal, cur)}`,
      `Contingency ${result.contingencyPercent}%: ${formatMoney(result.contingency, cur)}`,
      `TOTAL: ${formatMoney(result.total, cur)}`,
      `Per person: ${formatMoney(result.perPerson, cur)}`,
      `Per day: ${formatMoney(result.perDay, cur)}`,
      `Already saved: ${formatMoney(result.alreadySaved, cur)} — still needed ${formatMoney(result.remaining, cur)}`,
      result.monthlySaving === null
        ? result.savingNote
        : `Save ${formatMoney(result.monthlySaving, cur)} per month for ${result.monthsToDeparture} months`,
    ].join("\n");
  }, [hasError, result, cur]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Trip planning
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Travel Budget Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split the trip into one-off costs, room nights and daily spending, add a
          contingency buffer, and see the total per person, per day and as a monthly
          saving target. A trip with N nights is counted as N + 1 spending days.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-currency">
              Currency
            </label>
            <select
              id="tbp-currency"
              value={form.currency}
              onChange={setField("currency")}
              className={`${INPUT_CLASS} mt-1`}
            >
              {Object.entries(CURRENCIES).map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-travellers">
              Travellers
            </label>
            <input
              id="tbp-travellers"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.travellers}
              onChange={setField("travellers")}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-nights">
              Nights away
            </label>
            <input
              id="tbp-nights"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.nights}
              onChange={setField("nights")}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-occupancy">
              People per room
            </label>
            <input
              id="tbp-occupancy"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.occupancyPerRoom}
              onChange={setField("occupancyPerRoom")}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>

          {MONEY_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`tbp-${key}`}>
                {label}
              </label>
              <input
                id={`tbp-${key}`}
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={form[key]}
                onChange={setField(key)}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="tbp-contingency"
              type="number"
              min="0"
              max="100"
              step="1"
              inputMode="decimal"
              value={form.contingencyPercent}
              onChange={setField("contingencyPercent")}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-saved">
              Already saved
            </label>
            <input
              id="tbp-saved"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={form.alreadySaved}
              onChange={setField("alreadySaved")}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tbp-months">
              Months until departure
            </label>
            <input
              id="tbp-months"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.monthsToDeparture}
              onChange={setField("monthsToDeparture")}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <p className="text-sm text-[var(--muted-foreground)]">Total trip cost</p>
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {money(result.total)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${result.travellers} traveller${result.travellers === 1 ? "" : "s"} · ${result.nights} night${result.nights === 1 ? "" : "s"} · ${result.days} day${result.days === 1 ? "" : "s"} · ${result.rooms} room${result.rooms === 1 ? "" : "s"}`}
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Per person</dt>
            <dd className="text-sm font-semibold">{money(result.perPerson)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Per day</dt>
            <dd className="text-sm font-semibold">{money(result.perDay)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Per person per day</dt>
            <dd className="text-sm font-semibold">{money(result.perPersonPerDay)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">
              Contingency {hasError ? "" : `(${result.contingencyPercent}%)`}
            </dt>
            <dd className="text-sm font-semibold">{money(result.contingency)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Still to save</dt>
            <dd className="text-sm font-semibold">{money(result.remaining)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Save each month</dt>
            <dd className="text-sm font-semibold">
              {hasError || result.monthlySaving === null ? DASH : formatMoney(result.monthlySaving, cur)}
            </dd>
          </div>
        </dl>

        {!hasError && result.savingNote && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.savingNote}</p>
        )}
        {!hasError && result.fullyFunded && (
          <p className="mt-3 text-sm font-medium text-[var(--success)]">
            Your savings already cover this trip.
          </p>
        )}

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-left text-sm">
              <caption className="sr-only">Cost by category</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.categories.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right font-medium">
                      {formatMoney(row.amount, cur)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.share)}%
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Subtotal before contingency</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {formatMoney(result.subtotal, cur)}
                  </td>
                  <td className="py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyResult}
            disabled={hasError}
            className={PRIMARY_BTN}
            aria-label="Copy the travel budget breakdown"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy budget"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset the planner">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
