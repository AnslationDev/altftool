"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import {
  ENTRY_OPTIONS,
  EXTENSION_OF_STAY_FEE_THB,
  OVERSTAY_FINE_CAP_THB,
  OVERSTAY_FINE_PER_DAY_THB,
  TDAC_WINDOW_DAYS,
  estimateThailandVisaCost,
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
const THB = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const baht = (value) => THB.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const REENTRY_OPTIONS = [
  { id: "none", label: "No re-entry permit" },
  { id: "single", label: "Single re-entry permit" },
  { id: "multiple", label: "Multiple re-entry permit" },
];

const DEFAULTS = {
  entryOptionId: "exemption",
  travellers: "2",
  extensions: "0",
  reentryPermit: "none",
  overstayDays: "0",
  exchangeRate: "2.6",
  agentFee: "0",
  photos: "0",
  insurance: "800",
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
  const [entryOptionId, setEntryOptionId] = useState(DEFAULTS.entryOptionId);
  const [travellers, setTravellers] = useState(DEFAULTS.travellers);
  const [extensions, setExtensions] = useState(DEFAULTS.extensions);
  const [reentryPermit, setReentryPermit] = useState(DEFAULTS.reentryPermit);
  const [overstayDays, setOverstayDays] = useState(DEFAULTS.overstayDays);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [agentFee, setAgentFee] = useState(DEFAULTS.agentFee);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateThailandVisaCost({
        entryOptionId,
        travellers: toNumber(travellers),
        extensionsPerTraveller: toNumber(extensions),
        reentryPermit,
        overstayDays: toNumber(overstayDays),
        exchangeRate: toNumber(exchangeRate),
        agentFeeInrPerTraveller: toNumber(agentFee),
        photoFeeInrPerTraveller: toNumber(photos),
        insuranceInrPerTraveller: toNumber(insurance),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      entryOptionId,
      travellers,
      extensions,
      reentryPermit,
      overstayDays,
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
      "Thailand Visa Cost Estimator",
      `Entry route: ${result.entryOptionLabel}`,
      `Travellers: ${result.travellers}`,
      `Thai visa fee: ${baht(result.visaFeeThb)}`,
      `Extensions of stay: ${baht(result.extensionFeeThb)}`,
      `Re-entry permit: ${baht(result.reentryFeeThb)}`,
      `Overstay fine: ${baht(result.overstayFineThb)}`,
      `Thai fees in rupees: ${moneyExact(result.totalThbInr)}`,
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
    setEntryOptionId(DEFAULTS.entryOptionId);
    setTravellers(DEFAULTS.travellers);
    setExtensions(DEFAULTS.extensions);
    setReentryPermit(DEFAULTS.reentryPermit);
    setOverstayDays(DEFAULTS.overstayDays);
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
          <Sun className="h-4 w-4" aria-hidden="true" />
          Thai entry costs
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Thailand Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Many tourists now enter Thailand without a visa at all. This prices whichever route
          applies to you — exemption, e-Visa, extension of stay or a re-entry permit — and applies
          the capped overstay fine if you need it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Entry route</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-option">
              How are you entering
            </label>
            <select
              id="th-option"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entryOptionId}
              onChange={(event) => setEntryOptionId(event.target.value)}
            >
              {ENTRY_OPTIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              The exemption list and the length of stay it grants are reviewed periodically — check
              the Thai embassy site for your passport before you travel.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-travellers">
              Travellers
            </label>
            <input
              id="th-travellers"
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
            <label className={LABEL_CLASS} htmlFor="th-fx">
              Exchange rate (rupees per THB 1)
            </label>
            <input
              id="th-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-extensions">
              Extensions of stay per traveller
            </label>
            <input
              id="th-extensions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={extensions}
              onChange={(event) => setExtensions(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {baht(EXTENSION_OF_STAY_FEE_THB)} per application at an immigration office.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="th-reentry">
              Re-entry permit
            </label>
            <select
              id="th-reentry"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reentryPermit}
              onChange={(event) => setReentryPermit(event.target.value)}
            >
              {REENTRY_OPTIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="th-overstay">
              Overstay days (leave at 0 if none)
            </label>
            <input
              id="th-overstay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={overstayDays}
              onChange={(event) => setOverstayDays(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {baht(OVERSTAY_FINE_PER_DAY_THB)} a day per person, capped at{" "}
              {baht(OVERSTAY_FINE_CAP_THB)}.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="th-agent">
              Agent or e-Visa handling, per traveller (INR)
            </label>
            <input
              id="th-agent"
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
            <label className={LABEL_CLASS} htmlFor="th-photos">
              Photographs, per traveller (INR)
            </label>
            <input
              id="th-photos"
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
            <label className={LABEL_CLASS} htmlFor="th-insurance">
              Travel insurance, per traveller (INR)
            </label>
            <input
              id="th-insurance"
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
            <label className={LABEL_CLASS} htmlFor="th-courier">
              Courier and document handling (INR)
            </label>
            <input
              id="th-courier"
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
            <label className={LABEL_CLASS} htmlFor="th-other">
              Other charges (INR)
            </label>
            <input
              id="th-other"
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
            <label className={LABEL_CLASS} htmlFor="th-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="th-markup"
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
                : `${show(result.perTravellerInr)} per traveller across ${result.travellers} traveller${
                    result.travellers === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Thailand entry cost breakdown"
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
            ["Thai visa fee", hasError ? DASH : baht(result.visaFeeThb)],
            ["Extensions of stay", hasError ? DASH : baht(result.extensionFeeThb)],
            ["Re-entry permit", hasError ? DASH : baht(result.reentryFeeThb)],
            ["Overstay fine", hasError ? DASH : baht(result.overstayFineThb)],
            ["Thai fees converted to rupees", show(result.totalThbInr)],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Thai government share of the total", hasError ? DASH : `${NUM.format(result.thaiSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.overstayCapReached && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            The daily fine would come to {baht(result.overstayUncappedThb)} per person, but it stops
            at the statutory ceiling of {baht(OVERSTAY_FINE_CAP_THB)}. A long overstay also carries
            a re-entry ban, which no fine buys off.
          </p>
        )}

        {!hasError && result.visaExempt && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            No visa fee applies on this route. The Thailand Digital Arrival Card is still required
            and is free — file it within {TDAC_WINDOW_DAYS} days before arrival.
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
        Informational estimate only, not immigration advice. Thai visa rules, exemption lists and
        fees change frequently — confirm the current position with the Royal Thai Embassy or the
        official e-Visa portal before you book, and consult an immigration lawyer about an overstay.
      </p>
    </main>
  );
}
