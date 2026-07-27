"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PhoneCall, RotateCcw } from "lucide-react";

import {
  CURRENCIES,
  EU_INTRA_EU_CALL_CAP_EUR_PER_MINUTE,
  VOIP_MB_PER_MINUTE,
  compareCallCosts,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  days: "10",
  minutesPerDay: "15",
  callsPerDay: "2",
  currency: "USD",
  roamingRatePerMinute: "1.79",
  roamingConnectionFee: "0",
  localSimCost: "25",
  localSimRatePerMinute: "0.05",
  packPrice: "10",
  packIncludedMinutes: "100",
  packOverageRate: "0.1",
  dataPricePerGb: "5",
  voipMode: "voice",
  voipWifiPercent: "60",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => compareCallCosts(form), [form]);
  const hasError = Boolean(result.error);

  const money = useMemo(() => {
    const currency = CURRENCIES[form.currency] || CURRENCIES.USD;
    const main = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    });
    const fine = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    return {
      format: (value) => (Number.isFinite(value) ? main.format(value) : DASH),
      formatFine: (value) => (Number.isFinite(value) ? fine.format(value) : DASH),
    };
  }, [form.currency]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "International call cost comparison",
      `${result.totalMinutes} minutes over the trip (${result.totalCalls} calls)`,
      "",
      ...result.options.map(
        (option) =>
          `${option.rank}. ${option.label}: ${money.format(option.total)}` +
          (option.perMinute === null
            ? ""
            : ` (${money.formatFine(option.perMinute)}/min)`),
      ),
      "",
      `Cheapest: ${result.cheapestLabel}, saving ${money.format(result.maxSaving)} against ${result.dearestLabel}.`,
    ].join("\n");
  }, [hasError, money, result]);

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

  const numberField = (key, label, hint, extra = {}) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={`icc-${key}`}>
        {label}
      </label>
      <input
        id={`icc-${key}`}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={form[key]}
        onChange={setField(key)}
        {...extra}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Travel connectivity
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          International Call Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price the same volume of calls four ways — home-carrier roaming, a local prepaid
          SIM, VoIP over mobile data and an international calling pack — and see which one
          actually wins for your trip. Enter every price in one currency; nothing is
          converted.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          How much you will talk
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("days", "Trip length (days)", "1 to 365", { min: "1" })}
          {numberField("minutesPerDay", "Talk minutes per day")}
          {numberField("callsPerDay", "Separate calls per day", "Used for per-call connection fees")}
          <div>
            <label className={LABEL_CLASS} htmlFor="icc-currency">
              Currency
            </label>
            <select
              id="icc-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.currency}
              onChange={setField("currency")}
            >
              {Object.entries(CURRENCIES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          The four options
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("roamingRatePerMinute", "Roaming rate per minute", "Your home carrier's abroad rate")}
          {numberField("roamingConnectionFee", "Connection fee per call", "0 if your carrier does not charge one")}
          {numberField("localSimCost", "Local SIM / eSIM up-front cost")}
          {numberField("localSimRatePerMinute", "Local SIM rate per minute", "Its international dialling rate")}
          {numberField("packPrice", "Calling pack price")}
          {numberField("packIncludedMinutes", "Minutes included in the pack")}
          {numberField("packOverageRate", "Pack overage rate per minute")}
          {numberField("dataPricePerGb", "Effective price per GB of data", "For the VoIP option")}
          <div>
            <label className={LABEL_CLASS} htmlFor="icc-voipMode">
              VoIP call type
            </label>
            <select
              id="icc-voipMode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.voipMode}
              onChange={setField("voipMode")}
            >
              {Object.entries(VOIP_MB_PER_MINUTE).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} — {item.rate} MB/min
                </option>
              ))}
            </select>
          </div>
          {numberField("voipWifiPercent", "VoIP minutes on free Wi-Fi (%)", "0 to 100", {
            max: "100",
          })}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cheapest option
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money.format(result.cheapestTotal)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.cheapestLabel} — saves ${money.format(result.maxSaving)} against ${result.dearestLabel}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the international call cost comparison"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">Total talk time</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${result.totalMinutes} min`}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">Cheapest per minute</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError || result.cheapestPerMinute === null
                ? DASH
                : money.formatFine(result.cheapestPerMinute)}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">VoIP data needed</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${result.voipDataMb} MB`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Ranked comparison
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Option
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Trip cost
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Per minute
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Extra vs best
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.options.map((option) => (
                  <tr
                    key={option.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3">
                      <span className="font-medium">
                        {option.label}
                        {option.rank === 1 ? (
                          <span className="ml-2 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                            Best
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {option.detail}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold">
                      {money.format(option.total)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {option.perMinute === null ? DASH : money.formatFine(option.perMinute)}
                    </td>
                    <td className="py-2 whitespace-nowrap text-[var(--muted-foreground)]">
                      {option.extraOverCheapest === 0
                        ? DASH
                        : `+${money.format(option.extraOverCheapest)}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Reference: calls from your home EU/EEA country to another EU/EEA country are capped
          at €{EU_INTRA_EU_CALL_CAP_EUR_PER_MINUTE} per minute excluding VAT, and roaming
          inside the EU/EEA is billed at your domestic rate.
        </p>
      </section>
    </main>
  );
}
