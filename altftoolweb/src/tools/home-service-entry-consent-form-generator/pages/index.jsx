"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import { ACCESS_METHODS, SERVICE_TYPES, buildHomeServiceEntryConsent } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  occupierName: "Meera Nair",
  occupierPhone: "+91 90080 33221",
  propertyAddress: "Flat 502, Ashwin Residency, Koramangala, Bengaluru 560095",
  companyName: "CoolAir Services Pvt Ltd",
  technicianName: "S. Prakash",
  jobReference: "CA-2026-77410",
  workDescription: "Service both split AC units, clean filters, gas top-up if pressure is low.",
  offLimitsAreas: "Master bedroom wardrobe, home office",
  petsNote: "One cat, kept in the study during the visit",
  currencySymbol: "INR",
  visitDate: "2026-08-05",
  windowStart: "10:00",
  windowEnd: "13:00",
  accessId: "presentThroughout",
  serviceId: "hvac",
  homeRecording: true,
  idCheckRequired: true,
  utilitiesIsolated: true,
  jobMinutes: "75",
  incrementMinutes: "30",
  minimumMinutes: "60",
  callOutFee: "300",
  hourlyRate: "600",
  partsCost: "1200",
  taxPercent: "18",
  damageExcess: "500",
  cancellationNoticeHours: "24",
};

const NUMERIC_FIELDS = [
  "jobMinutes",
  "incrementMinutes",
  "minimumMinutes",
  "callOutFee",
  "hourlyRate",
  "partsCost",
  "taxPercent",
  "damageExcess",
  "cancellationNoticeHours",
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const numbers = {};
    for (const key of NUMERIC_FIELDS) {
      numbers[key] = form[key] === "" ? NaN : Number(form[key]);
    }
    return buildHomeServiceEntryConsent({ ...form, ...numbers });
  }, [form]);

  const hasError = Boolean(result.error);

  const money = (value) =>
    (result.currencySymbol || "").toUpperCase() === "INR"
      ? INR.format(value)
      : `${result.currencySymbol} ${NUM.format(value)}`;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.documentText);
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

  const rows = hasError
    ? [
        ["Arrival window", DASH],
        ["Job estimate", DASH],
        ["Labour billed", DASH],
        ["Labour charge", DASH],
        ["Call-out", DASH],
        ["Parts and materials", DASH],
        ["Subtotal", DASH],
        ["Tax", DASH],
        ["Damage excess", DASH],
        ["Free cancellation until", DASH],
      ]
    : [
        ["Arrival window", `${NUM2.format(result.windowHours)} hours`],
        ["Job estimate", `${NUM.format(result.jobMinutes)} minutes`],
        [
          "Labour billed",
          `${NUM.format(result.billedMinutes)} minutes (${NUM2.format(result.billedHours)} h)`,
        ],
        ["Labour charge", money(result.labourCost)],
        ["Call-out", money(result.callOutFee)],
        ["Parts and materials", money(result.partsCost)],
        ["Subtotal", money(result.subtotal)],
        [
          "Tax",
          result.taxPercent > 0 ? `${money(result.taxAmount)} at ${result.taxPercent}%` : "None",
        ],
        [
          "Damage excess",
          result.damageExcess > 0 ? money(result.damageExcess) : "None stated",
        ],
        [
          "Free cancellation until",
          result.cancelBy ? `${result.cancelBy.date} ${result.cancelBy.time}` : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Consent forms
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Home Service Entry Consent Form Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the permission a technician is entering on: the arrival window, how they get in, the
          rooms they may use, what happens if something breaks, and a quote that shows how part-hours
          are actually billed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who and where</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-occupier">
              Occupier giving permission
            </label>
            <input
              id="hse-occupier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.occupierName}
              onChange={(event) => set("occupierName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-phone">
              Occupier phone
            </label>
            <input
              id="hse-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.occupierPhone}
              onChange={(event) => set("occupierPhone", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hse-address">
              Property address
            </label>
            <input
              id="hse-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.propertyAddress}
              onChange={(event) => set("propertyAddress", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-company">
              Service company
            </label>
            <input
              id="hse-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyName}
              onChange={(event) => set("companyName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-tech">
              Technician name
            </label>
            <input
              id="hse-tech"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.technicianName}
              onChange={(event) => set("technicianName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-ref">
              Job reference
            </label>
            <input
              id="hse-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.jobReference}
              onChange={(event) => set("jobReference", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-service">
              Type of work
            </label>
            <select
              id="hse-service"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.serviceId}
              onChange={(event) => set("serviceId", event.target.value)}
            >
              {SERVICE_TYPES.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hse-work">
              Work agreed
            </label>
            <textarea
              id="hse-work"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={form.workDescription}
              onChange={(event) => set("workDescription", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Visit and access</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-date">
              Visit date
            </label>
            <input
              id="hse-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.visitDate}
              onChange={(event) => set("visitDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-notice">
              Free-cancellation notice (hours)
            </label>
            <input
              id="hse-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="168"
              step="1"
              value={form.cancellationNoticeHours}
              onChange={(event) => set("cancellationNoticeHours", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-start">
              Window opens
            </label>
            <input
              id="hse-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.windowStart}
              onChange={(event) => set("windowStart", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-end">
              Window closes
            </label>
            <input
              id="hse-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.windowEnd}
              onChange={(event) => set("windowEnd", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hse-access">
              How the technician gets in
            </label>
            <select
              id="hse-access"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accessId}
              onChange={(event) => set("accessId", event.target.value)}
            >
              {ACCESS_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-offlimits">
              Off-limits areas
            </label>
            <input
              id="hse-offlimits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.offLimitsAreas}
              onChange={(event) => set("offLimitsAreas", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-pets">
              Pets on site
            </label>
            <input
              id="hse-pets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.petsNote}
              onChange={(event) => set("petsNote", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="hse-id">
            <input
              id="hse-id"
              className={CHECKBOX}
              type="checkbox"
              checked={form.idCheckRequired}
              onChange={(event) => set("idCheckRequired", event.target.checked)}
            />
            <span>Photo ID and job reference must be shown at the door</span>
          </label>
          <label className={CHECK_ROW} htmlFor="hse-recording">
            <input
              id="hse-recording"
              className={CHECKBOX}
              type="checkbox"
              checked={form.homeRecording}
              onChange={(event) => set("homeRecording", event.target.checked)}
            />
            <span>Cameras or a video doorbell may record during the visit</span>
          </label>
          <label className={CHECK_ROW} htmlFor="hse-isolate">
            <input
              id="hse-isolate"
              className={CHECKBOX}
              type="checkbox"
              checked={form.utilitiesIsolated}
              onChange={(event) => set("utilitiesIsolated", event.target.checked)}
            />
            <span>Water, gas or power will be isolated before work starts</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Quote</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-jobmin">
              Estimated job length (minutes)
            </label>
            <input
              id="hse-jobmin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="5"
              value={form.jobMinutes}
              onChange={(event) => set("jobMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-rate">
              Hourly labour rate
            </label>
            <input
              id="hse-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.hourlyRate}
              onChange={(event) => set("hourlyRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-increment">
              Billing block (minutes)
            </label>
            <input
              id="hse-increment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="240"
              step="15"
              value={form.incrementMinutes}
              onChange={(event) => set("incrementMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-minimum">
              Minimum charge (minutes)
            </label>
            <input
              id="hse-minimum"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={form.minimumMinutes}
              onChange={(event) => set("minimumMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-callout">
              Call-out fee
            </label>
            <input
              id="hse-callout"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.callOutFee}
              onChange={(event) => set("callOutFee", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-parts">
              Parts and materials
            </label>
            <input
              id="hse-parts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.partsCost}
              onChange={(event) => set("partsCost", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-tax">
              Tax (%)
            </label>
            <input
              id="hse-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={form.taxPercent}
              onChange={(event) => set("taxPercent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-excess">
              Damage excess borne by occupier
            </label>
            <input
              id="hse-excess"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.damageExcess}
              onChange={(event) => set("damageExcess", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hse-currency">
              Currency label
            </label>
            <input
              id="hse-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.currencySymbol}
              onChange={(event) => set("currencySymbol", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section
        aria-live="polite"
        aria-atomic="false"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to build the form"
                : `${result.serviceLabel} ${DASH} ${result.accessLabel.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the entry consent form"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy form"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Entry consent and work authorisation</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
              {result.documentText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Consumer-contract, tenancy and trade-licensing
        rules differ by country and by state {DASH} check your own before relying on the liability and
        cancellation wording, and take professional advice for anything contentious.
      </p>
    </main>
  );
}
