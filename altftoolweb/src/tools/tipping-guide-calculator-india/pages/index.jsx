"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HandCoins, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CCPA_GUIDELINE_DATE,
  CONSUMER_HELPLINE,
  GENEROSITY_LEVELS,
  GST_BANDS,
  PERCENT_SERVICES,
  SERVICE_GROUPS,
  UNIT_SERVICES,
  buildTipPlan,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENTRIES = {
  restaurant: "3000",
  bar: "",
  salon: "",
  porter: "4",
  housekeeping: "5",
  roomService: "",
  valet: "",
  auto: "8",
  cab: "4",
  driver: "",
  coolie: "",
  guide: "2",
  shoeStand: "3",
  boatman: "",
  delivery: "3",
  grocery: "",
  barber: "",
  fuel: "",
  helper: "",
};

const DEFAULTS = {
  generosity: "typical",
  gstBandId: "standard",
  serviceChargePct: "0",
  travellers: "2",
  tripDays: "7",
  rateAdjustPct: "0",
  inrPerHomeUnit: "",
  homeCurrency: "USD",
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setEntry = (key, value) => setEntries((current) => ({ ...current, [key]: value }));

  const numericEntries = useMemo(() => {
    const out = {};
    for (const [key, value] of Object.entries(entries)) {
      out[key] = value === "" ? 0 : Number(value);
    }
    return out;
  }, [entries]);

  const result = useMemo(
    () =>
      buildTipPlan({
        generosity: form.generosity,
        gstBandId: form.gstBandId,
        serviceChargePct: form.serviceChargePct === "" ? 0 : Number(form.serviceChargePct),
        travellers: form.travellers === "" ? Number.NaN : Number(form.travellers),
        tripDays: form.tripDays === "" ? Number.NaN : Number(form.tripDays),
        rateAdjustPct: form.rateAdjustPct === "" ? 0 : Number(form.rateAdjustPct),
        entries: numericEntries,
        inrPerHomeUnit: form.inrPerHomeUnit === "" ? 0 : Number(form.inrPerHomeUnit),
      }),
    [form, numericEntries],
  );

  const hasError = Boolean(result.error);
  const bill = hasError ? null : result.billCheck;

  const summary = useMemo(() => {
    if (hasError) return "";
    const currencyName = form.homeCurrency.trim() || "home currency";
    return [
      "India tipping plan",
      `Level: ${result.generosityLabel}  |  Travellers: ${result.travellers}  |  Trip: ${result.tripDays} day(s)`,
      "",
      ...result.byGroup.flatMap((group) => [
        `${group.group} — Rs ${group.totalInr}`,
        ...group.lines.map((line) => `  ${line.label}: ${line.basis} = Rs ${line.tipInr}`),
      ]),
      "",
      `Total tips: Rs ${result.totalInr}`,
      `Per traveller: Rs ${result.perTravellerInr}`,
      `Per day: Rs ${result.perDayInr}`,
      result.homeTotal !== null ? `Total in ${currencyName}: ${result.homeTotal}` : null,
      bill
        ? `Restaurant bill check: Rs ${bill.subtotal} + ${bill.gstPct}% GST = Rs ${bill.payableWithoutServiceCharge} payable`
        : null,
    ]
      .filter((line) => line !== null)
      .join("\n");
  }, [hasError, result, bill, form.homeCurrency]);

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
    setEntries(DEFAULT_ENTRIES);
    setCopied(false);
  };

  const unitByGroup = SERVICE_GROUPS.map((group) => ({
    group,
    services: UNIT_SERVICES.filter((service) => service.group === group),
  })).filter((entry) => entry.services.length > 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HandCoins className="h-4 w-4" aria-hidden="true" />
          India
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tipping Guide Calculator for India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Around 10% of the pre-GST subtotal in a restaurant, and fixed rupee amounts per bag, per
          night, per ride or per guiding day everywhere else. A service charge is not the same thing
          as a tip: under the CCPA guidelines of {CCPA_GUIDELINE_DATE} it cannot be added to your
          bill by default.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your trip</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="in-level">
              How generous
            </label>
            <select
              id="in-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.generosity}
              onChange={(event) => setField("generosity", event.target.value)}
            >
              {GENEROSITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {GENEROSITY_LEVELS.find((level) => level.id === form.generosity)?.note}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-adjust">
              Adjust every fixed rate by (%)
            </label>
            <input
              id="in-adjust"
              type="number"
              inputMode="numeric"
              min="-80"
              max="400"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.rateAdjustPct}
              onChange={(event) => setField("rateAdjustPct", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Metro rates are built in; drop them for smaller towns.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-travellers">
              People sharing the cost
            </label>
            <input
              id="in-travellers"
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.travellers}
              onChange={(event) => setField("travellers", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-days">
              Trip length in days
            </label>
            <input
              id="in-days"
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tripDays}
              onChange={(event) => setField("tripDays", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-rate">
              Rupees per 1 unit of your currency
            </label>
            <input
              id="in-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Optional"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.inrPerHomeUnit}
              onChange={(event) => setField("inrPerHomeUnit", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-currency">
              Your currency code
            </label>
            <input
              id="in-currency"
              type="text"
              maxLength={8}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.homeCurrency}
              onChange={(event) => setField("homeCurrency", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Bills you will settle</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Enter the food-and-drink subtotal for the whole trip, before GST.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {PERCENT_SERVICES.map((service) => (
            <div key={service.id}>
              <label className={LABEL_CLASS} htmlFor={`in-p-${service.id}`}>
                {service.label}
              </label>
              <input
                id={`in-p-${service.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="50"
                placeholder="0"
                className={`mt-2 ${INPUT_CLASS}`}
                value={entries[service.id]}
                onChange={(event) => setEntry(service.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{service.unitLabel}</p>
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="in-gst">
              GST band on the restaurant
            </label>
            <select
              id="in-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.gstBandId}
              onChange={(event) => setField("gstBandId", event.target.value)}
            >
              {GST_BANDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {GST_BANDS.find((option) => option.id === form.gstBandId)?.note}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-sc">
              Service charge printed on the bill (%)
            </label>
            <input
              id="in-sc"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.serviceChargePct}
              onChange={(event) => setField("serviceChargePct", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Enter it to see what it costs you. It is not a tip and it is not payable by default.
            </p>
          </div>
        </div>

        {bill ? (
          <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
            <table className="w-full min-w-[24rem] text-left text-sm">
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--muted-foreground)]">Food and drink</td>
                  <td className="px-3 py-2 text-right font-semibold">{inr.format(bill.subtotal)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--muted-foreground)]">
                    GST at {bill.gstPct}%
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {inr.format(bill.gstOnFood)}
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--muted-foreground)]">
                    Payable without a service charge
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-[var(--success)]">
                    {inr.format(bill.payableWithoutServiceCharge)}
                  </td>
                </tr>
                {bill.serviceCharge > 0 ? (
                  <tr>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">
                      Billed if the service charge stays, and GST is charged on it
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-[var(--danger)]">
                      {inr.format(bill.billedWithServiceCharge)}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {unitByGroup.map(({ group, services }) => (
        <section
          key={group}
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        >
          <h2 className="text-base font-semibold">{group}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.id}>
                <label className={LABEL_CLASS} htmlFor={`in-u-${service.id}`}>
                  {service.label}
                </label>
                <input
                  id={`in-u-${service.id}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="999"
                  step="1"
                  placeholder="0"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={entries[service.id]}
                  onChange={(event) => setEntry(service.id, event.target.value)}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {service.unitLabel} — Rs {service.low}&ndash;{service.high} per {service.each}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Tips for the whole trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : inr.format(result.totalInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the figures."
                : `${result.generosityLabel} level across ${result.tripDays} day(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the India tipping plan"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Per person", hasError ? DASH : inr.format(result.perTravellerInr)],
            ["Per day", hasError ? DASH : inr.format(result.perDayInr)],
            ["From bills (percentage)", hasError ? DASH : inr.format(result.percentTotalInr)],
            ["Fixed cash tips", hasError ? DASH : inr.format(result.unitTotalInr)],
            ["Of that, small change", hasError ? DASH : inr.format(result.smallNoteTotalInr)],
            [
              `Total in ${form.homeCurrency.trim() || "your currency"}`,
              hasError || result.homeTotal === null
                ? DASH
                : `${plain.format(result.homeTotal)} (${plain.format(result.homePerTraveller)} each)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.dailyNotes.length > 0 && (
          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              A day&apos;s cash, as notes
            </p>
            <p className="mt-1 text-sm">
              {result.dailyNotes
                .map((note) => `${note.count} x Rs ${note.denomination}`)
                .join("  ·  ")}
            </p>
          </div>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--muted-foreground)]">{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.byGroup.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Line by line</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-semibold">Service</th>
                  <th className="py-2 pr-3 font-semibold">Rate</th>
                  <th className="py-2 pr-3 font-semibold">Working</th>
                  <th className="py-2 text-right font-semibold">Tip</th>
                </tr>
              </thead>
              <tbody>
                {result.byGroup.map((group) =>
                  group.lines.map((line) => (
                    <tr key={line.id} className="border-b border-[var(--border)] align-top">
                      <td className="py-2.5 pr-3">
                        <span className="block font-semibold">{line.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {line.note}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                        {line.rateLabel}
                      </td>
                      <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{line.basis}</td>
                      <td className="py-2.5 text-right font-semibold">{inr.format(line.tipInr)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal or financial advice. Tipping in India is voluntary and the
        amounts here are common ranges rather than official rates. A service charge is a separate
        matter from a tip; if one is added to your bill against your wishes you can take it up with
        the establishment or the National Consumer Helpline on {CONSUMER_HELPLINE}. Confirm current
        GST rates with your own tax adviser.
      </p>
    </main>
  );
}
