"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HandCoins, RotateCcw, TriangleAlert } from "lucide-react";

import {
  EGYPT_VAT_PCT,
  GENEROSITY_LEVELS,
  PERCENT_SERVICES,
  SERVICE_GROUPS,
  TYPICAL_SERVICE_CHARGE_PCT,
  UNIT_SERVICES,
  buildTipPlan,
  grossRestaurantBill,
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
  restaurant: "800",
  cafe: "",
  spa: "",
  porter: "4",
  housekeeping: "5",
  doorman: "",
  taxi: "6",
  rideshare: "",
  driver: "",
  coachDriver: "",
  guide: "3",
  siteBaksheesh: "4",
  camel: "1",
  felucca: "1",
  cruiseCrew: "",
  balloon: "",
  diveCrew: "",
  restroom: "6",
  shoeAttendant: "2",
  delivery: "",
};

const DEFAULTS = {
  generosity: "typical",
  serviceChargeOnBill: true,
  travellers: "2",
  tripDays: "8",
  rateAdjustPct: "0",
  egpPerHomeUnit: "",
  homeCurrency: "USD",
};

const egp = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
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
        serviceChargeOnBill: form.serviceChargeOnBill,
        travellers: form.travellers === "" ? Number.NaN : Number(form.travellers),
        tripDays: form.tripDays === "" ? Number.NaN : Number(form.tripDays),
        rateAdjustPct: form.rateAdjustPct === "" ? 0 : Number(form.rateAdjustPct),
        entries: numericEntries,
        egpPerHomeUnit: form.egpPerHomeUnit === "" ? 0 : Number(form.egpPerHomeUnit),
      }),
    [form, numericEntries],
  );

  const hasError = Boolean(result.error);

  const billPreview = useMemo(() => {
    const subtotal = entries.restaurant === "" ? 0 : Number(entries.restaurant);
    if (!form.serviceChargeOnBill || !Number.isFinite(subtotal) || subtotal <= 0) return null;
    const gross = grossRestaurantBill(subtotal, TYPICAL_SERVICE_CHARGE_PCT);
    return gross.error ? null : gross;
  }, [entries.restaurant, form.serviceChargeOnBill]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const currencyName = form.homeCurrency.trim() || "home currency";
    return [
      "Egypt tipping plan (baksheesh)",
      `Level: ${result.generosityLabel}  |  Travellers: ${result.travellers}  |  Trip: ${result.tripDays} day(s)`,
      `Bills ${result.serviceChargeOnBill ? "include" : "do not include"} a service charge`,
      "",
      ...result.byGroup.flatMap((group) => [
        `${group.group} — ${group.totalEgp} EGP`,
        ...group.lines.map((line) => `  ${line.label}: ${line.basis} = ${line.tipEgp} EGP`),
      ]),
      "",
      `Total baksheesh: ${result.totalEgp} EGP`,
      `Per traveller: ${result.perTravellerEgp} EGP`,
      `Per day: ${result.perDayEgp} EGP`,
      result.homeTotal !== null ? `Total in ${currencyName}: ${result.homeTotal}` : null,
      result.dailyNotes.length
        ? `Daily cash as notes: ${result.dailyNotes.map((n) => `${n.count} x ${n.denomination}`).join(", ")}`
        : null,
    ]
      .filter((line) => line !== null)
      .join("\n");
  }, [hasError, result, form.homeCurrency]);

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
          Egypt
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tipping Guide Calculator for Egypt
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Baksheesh in Egypt runs on two separate rules: a percentage of the pre-tax subtotal on a
          restaurant or salon bill, and small fixed amounts per bag, per night, per ride or per
          guiding day everywhere else. Fill in what your trip involves and get the customary
          amounts, a trip total and the notes to carry.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your trip</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-level">
              How generous
            </label>
            <select
              id="eg-level"
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
            <label className={LABEL_CLASS} htmlFor="eg-adjust">
              Adjust every fixed rate by (%)
            </label>
            <input
              id="eg-adjust"
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
              Push the built-in ranges up if prices have moved since your last visit.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-travellers">
              Travellers sharing the cost
            </label>
            <input
              id="eg-travellers"
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
            <label className={LABEL_CLASS} htmlFor="eg-days">
              Trip length in days
            </label>
            <input
              id="eg-days"
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
            <label className={LABEL_CLASS} htmlFor="eg-rate">
              Pounds per 1 unit of your currency
            </label>
            <input
              id="eg-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Optional"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.egpPerHomeUnit}
              onChange={(event) => setField("egpPerHomeUnit", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-currency">
              Your currency code
            </label>
            <input
              id="eg-currency"
              type="text"
              maxLength={8}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.homeCurrency}
              onChange={(event) => setField("homeCurrency", event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          htmlFor="eg-sc"
        >
          <input
            id="eg-sc"
            type="checkbox"
            className="h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={form.serviceChargeOnBill}
            onChange={() => setField("serviceChargeOnBill", !form.serviceChargeOnBill)}
          />
          <span>
            Bills already show a service charge of about {TYPICAL_SERVICE_CHARGE_PCT}% (usual in
            tourist restaurants)
          </span>
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Bills you will settle</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Enter the food-and-drink subtotal for the whole trip, before service charge and before{" "}
          {EGYPT_VAT_PCT}% VAT.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {PERCENT_SERVICES.map((service) => (
            <div key={service.id}>
              <label className={LABEL_CLASS} htmlFor={`eg-p-${service.id}`}>
                {service.label}
              </label>
              <input
                id={`eg-p-${service.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                placeholder="0"
                className={`mt-2 ${INPUT_CLASS}`}
                value={entries[service.id]}
                onChange={(event) => setEntry(service.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{service.unitLabel}</p>
            </div>
          ))}
        </div>
        {billPreview ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            A {egp.format(billPreview.subtotal)} restaurant subtotal prints as{" "}
            {egp.format(billPreview.total)} once the {TYPICAL_SERVICE_CHARGE_PCT}% service charge (
            {egp.format(billPreview.serviceCharge)}) and {EGYPT_VAT_PCT}% VAT (
            {egp.format(billPreview.vat)}) are added. Tip on the subtotal, not that total.
          </p>
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
                <label className={LABEL_CLASS} htmlFor={`eg-u-${service.id}`}>
                  {service.label}
                </label>
                <input
                  id={`eg-u-${service.id}`}
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
                  {service.unitLabel} — {service.low}&ndash;{service.high} EGP per {service.each}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Baksheesh for the whole trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : egp.format(result.totalEgp)}
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
              aria-label="Copy the Egypt tipping plan"
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
            ["Per traveller", hasError ? DASH : egp.format(result.perTravellerEgp)],
            ["Per day", hasError ? DASH : egp.format(result.perDayEgp)],
            ["From bills (percentage)", hasError ? DASH : egp.format(result.percentTotalEgp)],
            ["Fixed baksheesh", hasError ? DASH : egp.format(result.unitTotalEgp)],
            [
              "Of that, in small notes",
              hasError ? DASH : egp.format(result.smallNoteTotalEgp),
            ],
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
                .map((note) => `${note.count} x ${note.denomination} EGP`)
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
                      <td className="py-2.5 text-right font-semibold">{egp.format(line.tipEgp)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Tipping in Egypt is customary rather than compulsory, the amounts here
        are typical tourist-area ranges rather than official rates, and the pound has moved a long
        way since it was floated in March 2024 — use the adjustment field and check current prices
        locally. Nothing here is financial advice.
      </p>
    </main>
  );
}
