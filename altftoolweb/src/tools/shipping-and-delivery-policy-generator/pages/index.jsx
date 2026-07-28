"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Truck } from "lucide-react";

import {
  DAMAGE_STEPS,
  DELIVERY_ZONES,
  buildShippingPolicy,
  computeDeliveryEstimate,
  parseClock,
  splitHolidayList,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DASH = "—";

const DEFAULTS = {
  storeName: "Loomstead",
  dispatchCity: "Jaipur",
  contactEmail: "help@loomstead.in",
  effectiveDate: "2026-08-01",
  cutoff: "14:00",
  processingDays: 1,
  zoneIds: DELIVERY_ZONES.map((zone) => zone.id),
  shipsOnSaturday: true,
  shipsOnSunday: false,
  holidayText: "2026-08-15, 2026-10-02",
  freeShippingAbove: 999,
  flatShippingFee: 60,
  codAvailable: true,
  codFee: 40,
  codLimit: 5000,
  codExtraDays: 1,
  damageStepIds: DAMAGE_STEPS.map((step) => step.id),
  damageReportHours: 48,
  unboxingThreshold: 5000,
  ackHours: 24,
  redressDays: 7,
  orderDate: "2026-08-03",
  orderTime: "10:00",
  zoneId: "rest-of-india",
  isCod: false,
};

export default function ToolHome() {
  const [storeName, setStoreName] = useState(DEFAULTS.storeName);
  const [dispatchCity, setDispatchCity] = useState(DEFAULTS.dispatchCity);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [cutoff, setCutoff] = useState(DEFAULTS.cutoff);
  const [processingDays, setProcessingDays] = useState(String(DEFAULTS.processingDays));
  const [zoneIds, setZoneIds] = useState(DEFAULTS.zoneIds);
  const [shipsOnSaturday, setShipsOnSaturday] = useState(DEFAULTS.shipsOnSaturday);
  const [shipsOnSunday, setShipsOnSunday] = useState(DEFAULTS.shipsOnSunday);
  const [holidayText, setHolidayText] = useState(DEFAULTS.holidayText);
  const [freeShippingAbove, setFreeShippingAbove] = useState(String(DEFAULTS.freeShippingAbove));
  const [flatShippingFee, setFlatShippingFee] = useState(String(DEFAULTS.flatShippingFee));
  const [codAvailable, setCodAvailable] = useState(DEFAULTS.codAvailable);
  const [codFee, setCodFee] = useState(String(DEFAULTS.codFee));
  const [codLimit, setCodLimit] = useState(String(DEFAULTS.codLimit));
  const [codExtraDays, setCodExtraDays] = useState(String(DEFAULTS.codExtraDays));
  const [damageStepIds, setDamageStepIds] = useState(DEFAULTS.damageStepIds);
  const [damageReportHours, setDamageReportHours] = useState(String(DEFAULTS.damageReportHours));
  const [unboxingThreshold, setUnboxingThreshold] = useState(String(DEFAULTS.unboxingThreshold));
  const [ackHours, setAckHours] = useState(String(DEFAULTS.ackHours));
  const [redressDays, setRedressDays] = useState(String(DEFAULTS.redressDays));

  const [orderDate, setOrderDate] = useState(DEFAULTS.orderDate);
  const [orderTime, setOrderTime] = useState(DEFAULTS.orderTime);
  const [zoneId, setZoneId] = useState(DEFAULTS.zoneId);
  const [isCod, setIsCod] = useState(DEFAULTS.isCod);

  const [copied, setCopied] = useState(false);

  const holidays = useMemo(() => splitHolidayList(holidayText), [holidayText]);

  const estimate = useMemo(
    () =>
      computeDeliveryEstimate({
        orderDate,
        orderMinutes: parseClock(orderTime) ?? -1,
        cutoffMinutes: parseClock(cutoff) ?? -1,
        processingDays: Number(processingDays),
        zoneId,
        shipsOnSaturday,
        shipsOnSunday,
        holidays,
        isCod,
        codExtraDays: Number(codExtraDays),
      }),
    [
      orderDate,
      orderTime,
      cutoff,
      processingDays,
      zoneId,
      shipsOnSaturday,
      shipsOnSunday,
      holidays,
      isCod,
      codExtraDays,
    ],
  );

  const policy = useMemo(
    () =>
      buildShippingPolicy({
        storeName,
        dispatchCity,
        contactEmail,
        effectiveDate,
        cutoffMinutes: parseClock(cutoff) ?? -1,
        processingDays: Number(processingDays),
        zoneIds,
        shipsOnSaturday,
        shipsOnSunday,
        freeShippingAbove: Number(freeShippingAbove),
        flatShippingFee: Number(flatShippingFee),
        codAvailable,
        codFee: Number(codFee),
        codLimit: Number(codLimit),
        codExtraDays: Number(codExtraDays),
        damageStepIds,
        damageReportHours: Number(damageReportHours),
        unboxingThreshold: Number(unboxingThreshold),
        ackHours: Number(ackHours),
        redressDays: Number(redressDays),
      }),
    [
      storeName,
      dispatchCity,
      contactEmail,
      effectiveDate,
      cutoff,
      processingDays,
      zoneIds,
      shipsOnSaturday,
      shipsOnSunday,
      freeShippingAbove,
      flatShippingFee,
      codAvailable,
      codFee,
      codLimit,
      codExtraDays,
      damageStepIds,
      damageReportHours,
      unboxingThreshold,
      ackHours,
      redressDays,
    ],
  );

  const estimateError = Boolean(estimate.error);
  const policyError = Boolean(policy.error);

  const toggleZone = (id) => {
    setZoneIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleStep = (id) => {
    setDamageStepIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyPolicy = async () => {
    if (policyError) return;
    try {
      await navigator.clipboard.writeText(policy.policyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStoreName(DEFAULTS.storeName);
    setDispatchCity(DEFAULTS.dispatchCity);
    setContactEmail(DEFAULTS.contactEmail);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setCutoff(DEFAULTS.cutoff);
    setProcessingDays(String(DEFAULTS.processingDays));
    setZoneIds(DEFAULTS.zoneIds);
    setShipsOnSaturday(DEFAULTS.shipsOnSaturday);
    setShipsOnSunday(DEFAULTS.shipsOnSunday);
    setHolidayText(DEFAULTS.holidayText);
    setFreeShippingAbove(String(DEFAULTS.freeShippingAbove));
    setFlatShippingFee(String(DEFAULTS.flatShippingFee));
    setCodAvailable(DEFAULTS.codAvailable);
    setCodFee(String(DEFAULTS.codFee));
    setCodLimit(String(DEFAULTS.codLimit));
    setCodExtraDays(String(DEFAULTS.codExtraDays));
    setDamageStepIds(DEFAULTS.damageStepIds);
    setDamageReportHours(String(DEFAULTS.damageReportHours));
    setUnboxingThreshold(String(DEFAULTS.unboxingThreshold));
    setAckHours(String(DEFAULTS.ackHours));
    setRedressDays(String(DEFAULTS.redressDays));
    setOrderDate(DEFAULTS.orderDate);
    setOrderTime(DEFAULTS.orderTime);
    setZoneId(DEFAULTS.zoneId);
    setIsCod(DEFAULTS.isCod);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Ecommerce operations
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Shipping and Delivery Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a dispatch cut-off, packing time and zone-wise transit bands, and the ETA calculator
          walks real working days — skipping Sundays, your non-shipping Saturdays and every holiday
          you list — before drafting the policy customers read.
        </p>
      </header>

      <section className={CARD} aria-labelledby="eta-heading">
        <h2 id="eta-heading" className="text-base font-semibold">
          Delivery ETA check
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-order-date">
              Order placed on
            </label>
            <input
              id="sh-order-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={orderDate}
              onChange={(event) => setOrderDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-order-time">
              Order placed at
            </label>
            <input
              id="sh-order-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={orderTime}
              onChange={(event) => setOrderTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-cutoff">
              Same-day dispatch cut-off
            </label>
            <input
              id="sh-cutoff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={cutoff}
              onChange={(event) => setCutoff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-processing">
              Packing time (working days)
            </label>
            <input
              id="sh-processing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={processingDays}
              onChange={(event) => setProcessingDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-zone">
              Destination zone
            </label>
            <select
              id="sh-zone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={zoneId}
              onChange={(event) => setZoneId(event.target.value)}
            >
              {DELIVERY_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label} ({zone.minDays}–{zone.maxDays} days)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-cod-extra">
              Extra working days for COD
            </label>
            <input
              id="sh-cod-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={codExtraDays}
              onChange={(event) => setCodExtraDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sh-holidays">
              Holidays with no dispatch or delivery (yyyy-mm-dd, comma separated)
            </label>
            <textarea
              id="sh-holidays"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={holidayText}
              onChange={(event) => setHolidayText(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="sh-sat">
            <input
              id="sh-sat"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={shipsOnSaturday}
              onChange={(event) => setShipsOnSaturday(event.target.checked)}
            />
            Ships on Saturday
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="sh-sun">
            <input
              id="sh-sun"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={shipsOnSunday}
              onChange={(event) => setShipsOnSunday(event.target.checked)}
            />
            Ships on Sunday
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="sh-is-cod">
            <input
              id="sh-is-cod"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={isCod}
              onChange={(event) => setIsCod(event.target.checked)}
            />
            This order is COD
          </label>
        </div>
      </section>

      {estimateError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {estimate.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Expected delivery window
        </p>
        <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
          {estimateError ? DASH : `${estimate.earliest.long} – ${estimate.latest.long}`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {estimateError
            ? DASH
            : `${estimate.zoneLabel}: ${estimate.minTransitDays}–${estimate.maxTransitDays} working days after dispatch`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Cut-off",
              estimateError
                ? DASH
                : estimate.missedCutoff
                  ? "Missed — packing starts the next day"
                  : "Made it — packing starts the same day",
            ],
            [
              "Packing starts",
              estimateError
                ? DASH
                : `${estimate.preparationStart.long} (${estimate.preparationStart.weekday})`,
            ],
            [
              "Handed to the carrier",
              estimateError ? DASH : `${estimate.dispatch.long} (${estimate.dispatch.weekday})`,
            ],
            [
              "Earliest delivery",
              estimateError ? DASH : `${estimate.earliest.long} (${estimate.earliest.weekday})`,
            ],
            [
              "Latest delivery",
              estimateError ? DASH : `${estimate.latest.long} (${estimate.latest.weekday})`,
            ],
            [
              "Calendar days from order",
              estimateError ? DASH : `${estimate.calendarDaysMin}–${estimate.calendarDaysMax} days`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="store-heading">
        <h2 id="store-heading" className="text-base font-semibold">
          Store and charges
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-store">
              Store or brand name
            </label>
            <input
              id="sh-store"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-city">
              Dispatch city
            </label>
            <input
              id="sh-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={dispatchCity}
              onChange={(event) => setDispatchCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-email">
              Support email
            </label>
            <input
              id="sh-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-effective">
              Policy effective from
            </label>
            <input
              id="sh-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-free-above">
              Free shipping above (INR, 0 = none)
            </label>
            <input
              id="sh-free-above"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={freeShippingAbove}
              onChange={(event) => setFreeShippingAbove(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-flat">
              Flat shipping charge (INR)
            </label>
            <input
              id="sh-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={flatShippingFee}
              onChange={(event) => setFlatShippingFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-cod-fee">
              COD handling fee (INR)
            </label>
            <input
              id="sh-cod-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={codFee}
              onChange={(event) => setCodFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-cod-limit">
              COD order limit (INR, 0 = none)
            </label>
            <input
              id="sh-cod-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={codLimit}
              onChange={(event) => setCodLimit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-damage-hours">
              Damage reporting window (hours)
            </label>
            <input
              id="sh-damage-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="1"
              value={damageReportHours}
              onChange={(event) => setDamageReportHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-unboxing">
              Unboxing video asked above (INR)
            </label>
            <input
              id="sh-unboxing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={unboxingThreshold}
              onChange={(event) => setUnboxingThreshold(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-ack">
              Acknowledge within (hours, max 48)
            </label>
            <input
              id="sh-ack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="48"
              step="1"
              value={ackHours}
              onChange={(event) => setAckHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-redress">
              Resolve within (days, max 30)
            </label>
            <input
              id="sh-redress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={redressDays}
              onChange={(event) => setRedressDays(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="sh-cod-available">
          <input
            id="sh-cod-available"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={codAvailable}
            onChange={(event) => setCodAvailable(event.target.checked)}
          />
          Offer cash on delivery
        </label>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Zones to publish timelines for</legend>
          <div className="mt-2 grid gap-1">
            {DELIVERY_ZONES.map((zone) => (
              <label
                key={zone.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`sh-zone-${zone.id}`}
              >
                <input
                  id={`sh-zone-${zone.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={zoneIds.includes(zone.id)}
                  onChange={() => toggleZone(zone.id)}
                />
                <span>
                  {zone.label}
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {zone.minDays}–{zone.maxDays} working days
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Damaged parcel steps to include</legend>
          <div className="mt-2 grid gap-1">
            {DAMAGE_STEPS.map((step) => (
              <label
                key={step.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`sh-step-${step.id}`}
              >
                <input
                  id={`sh-step-${step.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={damageStepIds.includes(step.id)}
                  onChange={() => toggleStep(step.id)}
                />
                {step.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {policyError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {policy.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Policy effective from
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {policyError ? DASH : policy.effectiveLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {policyError ? DASH : `${policy.zoneCount} zones published`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPolicy}
              disabled={policyError}
              aria-label="Copy the generated shipping policy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy policy"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {policyError ? DASH : policy.policyText}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Transit bands here are ordinary courier ranges,
        not statutory limits — replace them with what your own carrier contract promises. Rule 5(3)
        of the Consumer Protection (E-Commerce) Rules 2020 requires delivery, shipment and return
        shipping cost details to be disclosed before purchase, and Section 16 of the Carriage by
        Road Act 2007 requires written notice of loss or damage to a carrier within 180 days of
        booking.
      </p>
    </main>
  );
}
