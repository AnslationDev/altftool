"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  APPLICATION_ROUTES,
  MAX_STAY_IN_WINDOW_DAYS,
  QUALIFYING_DOCUMENTS,
  ROLLING_WINDOW_DAYS,
  estimateTurkeyVisaCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_EXACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const USD = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const dollars = (value) => USD.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  routeId: "e-visa",
  travellers: "2",
  plannedStayDays: "10",
  daysAlreadyUsed: "0",
  holdsQualifyingDocument: true,
  visaFee: "43",
  exchangeRate: "85",
  agentFee: "0",
  photos: "0",
  insurance: "900",
  courier: "0",
  other: "0",
  markup: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [routeId, setRouteId] = useState(DEFAULTS.routeId);
  const [travellers, setTravellers] = useState(DEFAULTS.travellers);
  const [plannedStayDays, setPlannedStayDays] = useState(DEFAULTS.plannedStayDays);
  const [daysAlreadyUsed, setDaysAlreadyUsed] = useState(DEFAULTS.daysAlreadyUsed);
  const [holdsQualifyingDocument, setHoldsQualifyingDocument] = useState(
    DEFAULTS.holdsQualifyingDocument,
  );
  const [visaFee, setVisaFee] = useState(DEFAULTS.visaFee);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [agentFee, setAgentFee] = useState(DEFAULTS.agentFee);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const changeRoute = (nextId) => {
    setRouteId(nextId);
    const route = APPLICATION_ROUTES.find((entry) => entry.id === nextId);
    if (route) setVisaFee(String(route.defaultFeeUsd));
  };

  const result = useMemo(
    () =>
      estimateTurkeyVisaCost({
        routeId,
        travellers: toNumber(travellers),
        plannedStayDays: toNumber(plannedStayDays),
        daysAlreadyUsedInWindow: toNumber(daysAlreadyUsed),
        holdsQualifyingDocument,
        visaFeeUsdPerTraveller: toNumber(visaFee),
        exchangeRate: toNumber(exchangeRate),
        agentFeeInrPerTraveller: toNumber(agentFee),
        photoFeeInrPerTraveller: toNumber(photos),
        insuranceInrPerTraveller: toNumber(insurance),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      routeId,
      travellers,
      plannedStayDays,
      daysAlreadyUsed,
      holdsQualifyingDocument,
      visaFee,
      exchangeRate,
      agentFee,
      photos,
      insurance,
      courier,
      other,
      markup,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Turkey Visa Cost Estimator",
      `Route: ${result.routeLabel}`,
      `Travellers: ${result.travellers}`,
      `Stay: ${result.plannedStayDays} days`,
      `Visa fee: ${dollars(result.visaFeeUsd)} = ${moneyExact(result.visaFeeInr)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total: ${moneyExact(result.totalInr)}`,
      `Per traveller: ${moneyExact(result.perTravellerInr)}`,
      `Days left in the ${ROLLING_WINDOW_DAYS}-day window after this trip: ${result.daysRemainingAfterTrip}`,
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
    setRouteId(DEFAULTS.routeId);
    setTravellers(DEFAULTS.travellers);
    setPlannedStayDays(DEFAULTS.plannedStayDays);
    setDaysAlreadyUsed(DEFAULTS.daysAlreadyUsed);
    setHoldsQualifyingDocument(DEFAULTS.holdsQualifyingDocument);
    setVisaFee(DEFAULTS.visaFee);
    setExchangeRate(DEFAULTS.exchangeRate);
    setAgentFee(DEFAULTS.agentFee);
    setPhotos(DEFAULTS.photos);
    setInsurance(DEFAULTS.insurance);
    setCourier(DEFAULTS.courier);
    setOther(DEFAULTS.other);
    setMarkup(DEFAULTS.markup);
    setCopied(false);
  };

  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Turkish visa costs
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Turkey Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turkey&apos;s e-Visa is conditional for many passports and stays are capped at{" "}
          {MAX_STAY_IN_WINDOW_DAYS} days in any {ROLLING_WINDOW_DAYS}. The tool checks both rules
          before it gives you a rupee total.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Trip and eligibility</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-route">
              Application route
            </label>
            <select
              id="tr-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={routeId}
              onChange={(event) => changeRoute(event.target.value)}
            >
              {APPLICATION_ROUTES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-start gap-3 text-sm font-semibold">
          <input
            id="tr-qualifying"
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={holdsQualifyingDocument}
            onChange={(event) => setHoldsQualifyingDocument(event.target.checked)}
          />
          <span>
            Every traveller holds a qualifying supporting document
            <span className="block text-xs font-normal text-[var(--muted-foreground)]">
              {QUALIFYING_DOCUMENTS.join(" · ")}
            </span>
          </span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-travellers">
              Travellers
            </label>
            <input
              id="tr-travellers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-stay">
              Length of this stay (days)
            </label>
            <input
              id="tr-stay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={plannedStayDays}
              onChange={(event) => setPlannedStayDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-used">
              Days already spent in Turkey in the last {ROLLING_WINDOW_DAYS}
            </label>
            <input
              id="tr-used"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={daysAlreadyUsed}
              onChange={(event) => setDaysAlreadyUsed(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The {MAX_STAY_IN_WINDOW_DAYS}-day ceiling counts every visit in the rolling window.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-fee">
              Visa fee per traveller (USD)
            </label>
            <input
              id="tr-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={visaFee}
              onChange={(event) => setVisaFee(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The e-Visa charge is a visa fee plus a service fee and varies by nationality.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tr-fx">
              Exchange rate (rupees per USD 1)
            </label>
            <input
              id="tr-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-agent">
              Agent or handling charge, per traveller (INR)
            </label>
            <input
              id="tr-agent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={agentFee}
              onChange={(event) => setAgentFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-photos">
              Photographs, per traveller (INR)
            </label>
            <input
              id="tr-photos"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={photos}
              onChange={(event) => setPhotos(event.target.value)}
            />
            <p className={HINT_CLASS}>An e-Visa needs no photograph; a sticker visa does.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-insurance">
              Travel insurance, per traveller (INR)
            </label>
            <input
              id="tr-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-courier">
              Courier and document handling (INR)
            </label>
            <input
              id="tr-courier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={courier}
              onChange={(event) => setCourier(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-other">
              Other charges (INR)
            </label>
            <input
              id="tr-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tr-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="tr-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total visa cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted problem to see a total."
                : `${show(result.perTravellerInr)} per traveller for a ${result.plannedStayDays}-day stay`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Turkey visa cost breakdown"
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
              aria-label="Reset every input to its default"
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
              "Visa fee",
              hasError
                ? DASH
                : `${dollars(result.visaFeePerTravellerUsd)} each = ${money(result.visaFeeInr)}`,
            ],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per traveller", show(result.perTravellerInr)],
            ["Cost per day of the trip", show(result.perDayInr)],
            [
              `Days left in the ${ROLLING_WINDOW_DAYS}-day window after this trip`,
              hasError ? DASH : `${result.daysRemainingAfterTrip} days`,
            ],
            ["Visa fee share of the total", hasError ? DASH : `${NUM.format(result.visaSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.routeId === "e-visa" && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            A conditional e-Visa is valid for {result.evisaValidityDays} days from issue, allows{" "}
            {result.evisaEntries} entry and permits a stay of up to {result.routeMaxStayDays} days.
            The supporting Schengen, US, UK or Ireland document must still be valid on the day you
            enter Turkey.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Line by line</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Charge
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{line.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {line.note}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold whitespace-nowrap">
                      {money(line.amountInr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only, not immigration advice. Turkish e-Visa conditions and fees are
        set by nationality and change without notice — check your own passport&apos;s requirements
        on the official portal at evisa.gov.tr, and use only that site to apply.
      </p>
    </main>
  );
}
