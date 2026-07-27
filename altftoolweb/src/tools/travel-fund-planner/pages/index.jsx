"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";

import { TCS_MODES, planTravelFund } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  travellers: "2",
  nights: "7",
  flight: "45000",
  stay: "8000",
  daily: "3000",
  activities: "25000",
  visa: "8000",
  insurance: "2500",
  misc: "20000",
  foreignShare: "70",
  markup: "2",
  contingency: "10",
  tcsMode: "none",
  remitted: "0",
  months: "10",
  existing: "50000",
  returnPct: "6",
};

export default function ToolHome() {
  const [travellers, setTravellers] = useState(DEFAULTS.travellers);
  const [nights, setNights] = useState(DEFAULTS.nights);
  const [flight, setFlight] = useState(DEFAULTS.flight);
  const [stay, setStay] = useState(DEFAULTS.stay);
  const [daily, setDaily] = useState(DEFAULTS.daily);
  const [activities, setActivities] = useState(DEFAULTS.activities);
  const [visa, setVisa] = useState(DEFAULTS.visa);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [misc, setMisc] = useState(DEFAULTS.misc);
  const [foreignShare, setForeignShare] = useState(DEFAULTS.foreignShare);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [contingency, setContingency] = useState(DEFAULTS.contingency);
  const [tcsMode, setTcsMode] = useState(DEFAULTS.tcsMode);
  const [remitted, setRemitted] = useState(DEFAULTS.remitted);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planTravelFund({
        travellers,
        nights,
        flightPerPerson: flight,
        stayPerNight: stay,
        dailyPerPerson: daily,
        activities,
        visaPerPerson: visa,
        insurancePerPerson: insurance,
        misc,
        foreignSharePct: foreignShare,
        forexMarkupPct: markup,
        contingencyPct: contingency,
        tcsMode,
        alreadyRemitted: remitted,
        monthsToTrip: months,
        existingSavings: existing,
        expectedReturn: returnPct,
      }),
    [
      travellers, nights, flight, stay, daily, activities, visa, insurance, misc,
      foreignShare, markup, contingency, tcsMode, remitted, months, existing, returnPct,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Travel Fund Plan",
      `${result.travellers} traveller(s), ${result.nights} night(s)`,
      `Trip budget: ${money(result.baseBudget)}`,
      `Forex markup: ${money(result.forexCost)}`,
      `Contingency buffer: ${money(result.contingency)}`,
      result.tcs > 0 ? `TCS under section 206C(1G): ${money(result.tcs)}` : "TCS: nil",
      `Total to fund: ${money(result.totalNeeded)} (${money(result.perPerson)} per person)`,
      `Existing savings by departure: ${money(result.existingFuture)}`,
      result.fullyFunded
        ? "Already funded."
        : `Save ${money(result.monthlySaving)} a month for ${result.months} months.`,
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
    setTravellers(DEFAULTS.travellers);
    setNights(DEFAULTS.nights);
    setFlight(DEFAULTS.flight);
    setStay(DEFAULTS.stay);
    setDaily(DEFAULTS.daily);
    setActivities(DEFAULTS.activities);
    setVisa(DEFAULTS.visa);
    setInsurance(DEFAULTS.insurance);
    setMisc(DEFAULTS.misc);
    setForeignShare(DEFAULTS.foreignShare);
    setMarkup(DEFAULTS.markup);
    setContingency(DEFAULTS.contingency);
    setTcsMode(DEFAULTS.tcsMode);
    setRemitted(DEFAULTS.remitted);
    setMonths(DEFAULTS.months);
    setExisting(DEFAULTS.existing);
    setReturnPct(DEFAULTS.returnPct);
    setCopied(false);
  };

  const tripFields = [
    { id: "tf-travellers", label: "Travellers", value: travellers, set: setTravellers, step: "1", min: "1" },
    { id: "tf-nights", label: "Nights away", value: nights, set: setNights, step: "1", min: "1" },
    { id: "tf-flight", label: "Return airfare per person (₹)", value: flight, set: setFlight, step: "1000", min: "0" },
    { id: "tf-stay", label: "Accommodation per night, total (₹)", value: stay, set: setStay, step: "500", min: "0" },
    { id: "tf-daily", label: "Food & local spend per person per day (₹)", value: daily, set: setDaily, step: "250", min: "0" },
    { id: "tf-activities", label: "Activities & tickets, total (₹)", value: activities, set: setActivities, step: "1000", min: "0" },
    { id: "tf-visa", label: "Visa & processing per person (₹)", value: visa, set: setVisa, step: "500", min: "0" },
    { id: "tf-insurance", label: "Travel insurance per person (₹)", value: insurance, set: setInsurance, step: "250", min: "0" },
    { id: "tf-misc", label: "Shopping & extras, total (₹)", value: misc, set: setMisc, step: "1000", min: "0" },
  ];

  const loadingFields = [
    { id: "tf-share", label: "Share paid in foreign currency (%)", value: foreignShare, set: setForeignShare, step: "5", min: "0" },
    { id: "tf-markup", label: "Forex markup on that share (%)", value: markup, set: setMarkup, step: "0.25", min: "0" },
    { id: "tf-contingency", label: "Contingency buffer (%)", value: contingency, set: setContingency, step: "1", min: "0" },
    { id: "tf-remitted", label: "Overseas spend already made this FY (₹)", value: remitted, set: setRemitted, step: "50000", min: "0" },
  ];

  const savingFields = [
    { id: "tf-months", label: "Months until departure", value: months, set: setMonths, step: "1", min: "1" },
    { id: "tf-existing", label: "Already saved for the trip (₹)", value: existing, set: setExisting, step: "5000", min: "0" },
    { id: "tf-return", label: "Return on those savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
  ];

  const rows = hasError
    ? [
        ["Trip budget", DASH],
        ["Forex markup", DASH],
        ["Contingency buffer", DASH],
        ["TCS under section 206C(1G)", DASH],
        ["Total to fund", DASH],
        ["Per person", DASH],
        ["Per night", DASH],
        ["Existing savings by departure", DASH],
        ["Shortfall to save", DASH],
      ]
    : [
        ["Trip budget", money(result.baseBudget)],
        [
          "Forex markup",
          `${money(result.forexCost)} on ${money(result.foreignPortion)} of foreign spend`,
        ],
        ["Contingency buffer", money(result.contingency)],
        ["TCS under section 206C(1G)", money(result.tcs)],
        ["Total to fund", money(result.totalNeeded)],
        ["Per person", money(result.perPerson)],
        ["Per night", money(result.perDay)],
        ["Existing savings by departure", money(result.existingFuture)],
        ["Shortfall to save", money(result.gap)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Trip budget
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Travel Fund Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the whole trip cost — flights, stay, daily spend, visas, forex loading, a
          contingency buffer and tax collected at source — then back-solve the monthly amount that
          gets you there without a card balance following you home.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {tripFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Forex, buffer and tax</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tf-tcs">
              How the overseas payment is made
            </label>
            <select
              id="tf-tcs"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tcsMode}
              onChange={(event) => setTcsMode(event.target.value)}
            >
              {TCS_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          {loadingFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How you are funding it</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {savingFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
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
              Save every month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.monthlySaving)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : result.fullyFunded
                  ? "What you have already saved covers the trip."
                  : `For ${result.months} months, to fund ${money(result.totalNeeded)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy travel fund plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the budget goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{line.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(line.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {num(line.sharePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.tcs > 0 && (
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              TCS is applied at 5% on {money(result.tcsLowSlab)} within the ₹10 lakh
              financial-year threshold and 20% on {money(result.tcsHighSlab)} above it for a tour
              package; other LRS remittances attract 20% only on the amount above the threshold.
              TCS is not a cost — it is credited against your income tax or refunded when you file.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Forex markups, airline fares and hotel rates move constantly, and TCS rates and thresholds
        under section 206C(1G) are set by the Finance Act and can change. Confirm the current
        position with your bank or a tax professional before relying on these figures. Informational
        only — not tax advice.
      </p>
    </main>
  );
}
