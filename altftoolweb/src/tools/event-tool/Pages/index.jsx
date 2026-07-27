"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_CONTINGENCY_PERCENT,
  LAYOUTS,
  SERVICE_STYLES,
  TABLE_SIZES,
  planEvent,
} from "../lib";

const DEFAULTS = {
  invited: "200",
  acceptPercent: "70",
  noShowPercent: "5",
  layout: "banquet",
  tableSize: "60",
  serviceStyle: "plated",
  hours: "4",
  servingBar: true,
  venueSqFt: "2000",
  perHeadCatering: "1200",
  venueCost: "50000",
  staffRatePerHour: "300",
  otherCosts: "15000",
  contingencyPercent: String(DEFAULT_CONTINGENCY_PERCENT),
  budget: "300000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      planEvent({
        invited: toNumber(form.invited),
        acceptPercent: toNumber(form.acceptPercent),
        noShowPercent: toNumber(form.noShowPercent),
        layout: form.layout,
        tableSize: Number(form.tableSize),
        serviceStyle: form.serviceStyle,
        hours: toNumber(form.hours),
        servingBar: form.servingBar,
        venueSqFt: toNumber(form.venueSqFt) || 0,
        perHeadCatering: toNumber(form.perHeadCatering),
        venueCost: toNumber(form.venueCost),
        staffRatePerHour: toNumber(form.staffRatePerHour),
        otherCosts: toNumber(form.otherCosts),
        contingencyPercent: toNumber(form.contingencyPercent),
        budget: toNumber(form.budget) || 0,
      }),
    [form],
  );

  const hasError = Boolean(plan.error);
  const attendance = hasError ? null : plan.attendance;
  const logistics = hasError ? null : plan.logistics;
  const budget = hasError ? null : plan.budget;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Event Planner",
      `Invited: ${num(toNumber(form.invited))} | Expected head count: ${num(attendance.expected)}`,
      `Layout: ${logistics.layoutLabel} — ${num(logistics.floorSqFt)} sq ft (${num(logistics.floorSqM)} sq m)`,
      logistics.tables
        ? `Tables: ${num(logistics.tables)} x ${logistics.seatsPerTable}-seat rounds (${num(logistics.emptySeats)} spare seats)`
        : "Tables: none (standing / rows layout)",
      `Staff: ${num(logistics.servers)} servers + ${num(logistics.bartenders)} bartenders`,
      `Catering: ${num(logistics.appetisers)} canapes, ${num(logistics.drinks)} drinks`,
      `Total cost: ${money(budget.total)} (${money(budget.perHead)} per head)`,
      `Budget variance: ${money(budget.variance)}`,
    ].join("\n");
  }, [hasError, attendance, logistics, budget, form.invited]);

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

  const venueVerdict = () => {
    if (hasError || plan.fitsVenue === null) return "Add the hall size to check it fits";
    if (plan.fitsVenue) {
      return `Fits — the hall holds about ${num(plan.venueCapacity)} guests at this layout`;
    }
    return `Too small by ${num(plan.venueShortfall)} sq ft at this layout`;
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Event planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Event Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn an invite list into the numbers you actually have to book: expected head count, floor
          space, tables, servers, bartenders, food and drink quantities, and a costed budget with
          contingency.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Guest list</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="invited">
              People invited
            </label>
            <input
              id="invited"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.invited}
              onChange={set("invited")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hours">
              Event length (hours)
            </label>
            <input
              id="hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={form.hours}
              onChange={set("hours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="acceptPercent">
              RSVP acceptance rate (%)
            </label>
            <input
              id="acceptPercent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.acceptPercent}
              onChange={set("acceptPercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noShowPercent">
              No-show rate among acceptances (%)
            </label>
            <input
              id="noShowPercent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.noShowPercent}
              onChange={set("noShowPercent")}
            />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Room and service</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="layout">
              Room layout
            </label>
            <select
              id="layout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.layout}
              onChange={set("layout")}
            >
              {Object.entries(LAYOUTS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label} — {meta.sqFtPerGuest} sq ft/guest
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tableSize">
              Banquet table size
            </label>
            <select
              id="tableSize"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tableSize}
              onChange={set("tableSize")}
              disabled={form.layout !== "banquet"}
            >
              {Object.entries(TABLE_SIZES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label} — {meta.seats} covers
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="serviceStyle">
              Service style
            </label>
            <select
              id="serviceStyle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.serviceStyle}
              onChange={set("serviceStyle")}
            >
              {Object.entries(SERVICE_STYLES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label} — 1 server per {meta.guestsPerServer}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="venueSqFt">
              Hall floor area (sq ft, 0 to skip)
            </label>
            <input
              id="venueSqFt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={form.venueSqFt}
              onChange={set("venueSqFt")}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="servingBar"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="servingBar"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.servingBar}
                onChange={set("servingBar")}
              />
              Serving drinks (adds bartenders and a drinks count)
            </label>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Costs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="perHeadCatering">
              Catering per head (INR)
            </label>
            <input
              id="perHeadCatering"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.perHeadCatering}
              onChange={set("perHeadCatering")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="venueCost">
              Venue hire (INR)
            </label>
            <input
              id="venueCost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.venueCost}
              onChange={set("venueCost")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="staffRatePerHour">
              Staff rate per person per hour (INR)
            </label>
            <input
              id="staffRatePerHour"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={form.staffRatePerHour}
              onChange={set("staffRatePerHour")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="otherCosts">
              Decor, AV and other (INR)
            </label>
            <input
              id="otherCosts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.otherCosts}
              onChange={set("otherCosts")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="contingencyPercent">
              Contingency (%)
            </label>
            <input
              id="contingencyPercent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.contingencyPercent}
              onChange={set("contingencyPercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="budget">
              Budget ceiling (INR, 0 to skip)
            </label>
            <input
              id="budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={form.budget}
              onChange={set("budget")}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Expected head count
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : num(attendance.expected)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `${num(attendance.accepted)} accepted, ${num(attendance.noShows)} expected no-shows`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the event plan to clipboard"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Floor space needed",
              hasError
                ? DASH
                : `${num(logistics.floorSqFt)} sq ft (${num(logistics.floorSqM)} sq m)`,
            ],
            ["Does the hall fit?", venueVerdict()],
            [
              "Banquet tables",
              hasError || !logistics.tables
                ? DASH
                : `${num(logistics.tables)} rounds of ${logistics.seatsPerTable} (${num(logistics.emptySeats)} spare seats)`,
            ],
            ["Servers", hasError ? DASH : num(logistics.servers)],
            ["Bartenders", hasError ? DASH : num(logistics.bartenders)],
            ["Canapes / appetiser pieces", hasError ? DASH : num(logistics.appetisers)],
            ["Drinks to stock", hasError ? DASH : num(logistics.drinks)],
            ["Catering cost", hasError ? DASH : money(budget.catering)],
            ["Venue hire", hasError ? DASH : money(budget.venue)],
            ["Staff cost", hasError ? DASH : money(budget.staff)],
            ["Decor, AV and other", hasError ? DASH : money(budget.other)],
            ["Subtotal", hasError ? DASH : money(budget.subtotal)],
            ["Contingency", hasError ? DASH : money(budget.contingency)],
            ["Total cost", hasError ? DASH : money(budget.total)],
            ["Cost per head", hasError ? DASH : money(budget.perHead)],
            [
              "Against the budget ceiling",
              hasError || !budget.budget
                ? DASH
                : budget.overBudget
                  ? `Over by ${money(Math.abs(budget.variance))}`
                  : `Under by ${money(budget.variance)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && budget.budget > 0 && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              budget.overBudget
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--success)]"
            }`}
          >
            {budget.overBudget
              ? `This plan is ${money(Math.abs(budget.variance))} above your ceiling — trim the per-head catering or the guest list.`
              : `This plan leaves ${money(budget.variance)} of headroom.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Space, staffing and quantity figures use standard venue capacity allowances (12 sq ft per
        seated banquet guest, 6 sq ft standing, 1 server per 10 plated guests, 1 bartender per 75
        guests, 1 drink per guest per hour). Always confirm the real capacity and fire limits with
        the venue before booking.
      </p>
    </main>
  );
}
