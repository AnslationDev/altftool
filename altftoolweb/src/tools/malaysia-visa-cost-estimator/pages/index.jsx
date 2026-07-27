"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";

import {
  ENTRY_ROUTES,
  MDAC_WINDOW_DAYS,
  VISA_EXEMPTION_MAX_STAY_DAYS,
  defaultFeesFor,
  estimateMalaysiaVisaCost,
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
const MYR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const ringgit = (value) => MYR.format(Number.isFinite(value) ? value : 0);

const DASH = "—";
const START_ROUTE = "exemption";
const START_FEES = defaultFeesFor(START_ROUTE);

const DEFAULTS = {
  routeId: START_ROUTE,
  travellers: "2",
  stayDays: "10",
  visaFee: String(START_FEES.visaFeeRm),
  processingFee: String(START_FEES.processingFeeRm),
  serviceFee: "0",
  exchangeRate: "19.5",
  agentFee: "0",
  photos: "0",
  insurance: "600",
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
  const [stayDays, setStayDays] = useState(DEFAULTS.stayDays);
  const [visaFee, setVisaFee] = useState(DEFAULTS.visaFee);
  const [processingFee, setProcessingFee] = useState(DEFAULTS.processingFee);
  const [serviceFee, setServiceFee] = useState(DEFAULTS.serviceFee);
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
    const fees = defaultFeesFor(nextId);
    if (fees) {
      setVisaFee(String(fees.visaFeeRm));
      setProcessingFee(String(fees.processingFeeRm));
    }
  };

  const result = useMemo(
    () =>
      estimateMalaysiaVisaCost({
        routeId,
        travellers: toNumber(travellers),
        stayDays: toNumber(stayDays),
        visaFeeRm: toNumber(visaFee),
        processingFeeRm: toNumber(processingFee),
        serviceFeeRm: toNumber(serviceFee),
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
      stayDays,
      visaFee,
      processingFee,
      serviceFee,
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
      "Malaysia Visa Cost Estimator",
      `Route: ${result.routeLabel}`,
      `Travellers: ${result.travellers}`,
      `Stay: ${result.stayDays} days`,
      `Malaysian charges: ${ringgit(result.totalRm)} = ${moneyExact(result.totalRmInr)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total: ${moneyExact(result.totalInr)}`,
      `Per traveller: ${moneyExact(result.perTravellerInr)}`,
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
    setStayDays(DEFAULTS.stayDays);
    setVisaFee(DEFAULTS.visaFee);
    setProcessingFee(DEFAULTS.processingFee);
    setServiceFee(DEFAULTS.serviceFee);
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
          <Plane className="h-4 w-4" aria-hidden="true" />
          Malaysian entry costs
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Malaysia Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Malaysia waives the visa for eligible nationalities on visits of up to{" "}
          {VISA_EXEMPTION_MAX_STAY_DAYS} days. Enter your stay and the tool checks the waiver first,
          then prices whichever route you actually need.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Trip and route</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="my-route">
              Entry route
            </label>
            <select
              id="my-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={routeId}
              onChange={(event) => changeRoute(event.target.value)}
            >
              {ENTRY_ROUTES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              The waiver is a policy with an announced end date — check that it still covers your
              passport before you book.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="my-travellers">
              Travellers
            </label>
            <input
              id="my-travellers"
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
            <label className={LABEL_CLASS} htmlFor="my-stay">
              Length of stay (days)
            </label>
            <input
              id="my-stay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={stayDays}
              onChange={(event) => setStayDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-visa-fee">
              Visa fee per traveller (MYR)
            </label>
            <input
              id="my-visa-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={visaFee}
              onChange={(event) => setVisaFee(event.target.value)}
            />
            <p className={HINT_CLASS}>Ignored on the visa-free route.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-processing">
              eVISA processing charge per traveller (MYR)
            </label>
            <input
              id="my-processing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={processingFee}
              onChange={(event) => setProcessingFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-service">
              Portal service charge per traveller (MYR)
            </label>
            <input
              id="my-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={serviceFee}
              onChange={(event) => setServiceFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-fx">
              Exchange rate (rupees per MYR 1)
            </label>
            <input
              id="my-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
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
            <label className={LABEL_CLASS} htmlFor="my-agent">
              Agent or handling charge, per traveller (INR)
            </label>
            <input
              id="my-agent"
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
            <label className={LABEL_CLASS} htmlFor="my-photos">
              Photographs, per traveller (INR)
            </label>
            <input
              id="my-photos"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={photos}
              onChange={(event) => setPhotos(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-insurance">
              Travel insurance, per traveller (INR)
            </label>
            <input
              id="my-insurance"
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
            <label className={LABEL_CLASS} htmlFor="my-courier">
              Courier and document handling (INR)
            </label>
            <input
              id="my-courier"
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
            <label className={LABEL_CLASS} htmlFor="my-other">
              Other charges (INR)
            </label>
            <input
              id="my-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
            <p className={HINT_CLASS}>Confirmed return ticket, hotel bookings, printing.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="my-markup"
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
              Total entry cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see a total."
                : `${show(result.perTravellerInr)} per traveller for a ${result.stayDays}-day stay`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Malaysia entry cost breakdown"
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
            ["Malaysian charges per traveller", hasError ? DASH : ringgit(result.perTravellerRm)],
            ["Malaysian charges in rupees", show(result.totalRmInr)],
            ["Malaysia Digital Arrival Card", hasError ? DASH : "Free"],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per traveller", show(result.perTravellerInr)],
            ["Cost per day of the trip", show(result.perDayInr)],
            ["Malaysian government share", hasError ? DASH : `${NUM.format(result.govSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.requiresVisa && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            No visa fee applies. You have {result.daysLeftInWaiver} day
            {result.daysLeftInWaiver === 1 ? "" : "s"} of headroom left inside the{" "}
            {result.waiverMaxStayDays}-day waiver, and the arrival card is free — file it within{" "}
            {MDAC_WINDOW_DAYS} days of travel.
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
        Informational estimate only. Malaysia&apos;s visa waiver, eVISA fees and arrival card rules
        change by announcement — confirm the current position on the Immigration Department of
        Malaysia website before booking, and note that visa-free entry still requires a return
        ticket and proof of funds at the counter.
      </p>
    </main>
  );
}
