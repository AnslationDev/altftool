"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  LEASE_PURPOSES,
  NOTICE_PRESETS,
  SERVICE_MODES,
  computeOverstayCompensation,
  computeVacateDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed) ? DASH : DATE_FMT.format(new Date(parsed));
};

const todayIso = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10);
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

export default function ToolHome() {
  const [today] = useState(() => todayIso());
  const [dispatchDate, setDispatchDate] = useState(() => todayIso());
  const [serviceMode, setServiceMode] = useState("registeredAd");
  const [receiptDate, setReceiptDate] = useState(() => todayIso());
  const [noticeValue, setNoticeValue] = useState("1");
  const [noticeUnit, setNoticeUnit] = useState("months");
  const [leasePurpose, setLeasePurpose] = useState("other");
  const [alignToRentMonth, setAlignToRentMonth] = useState(false);
  const [rentDay, setRentDay] = useState("1");
  const [monthlyRent, setMonthlyRent] = useState("25000");
  const [overstayMonths, setOverstayMonths] = useState("1");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeVacateDate({
        dispatchDate,
        receiptDate,
        serviceMode,
        noticeValue: Number(noticeValue),
        noticeUnit,
        leasePurpose,
        alignToRentMonth,
        rentDay: Number(rentDay),
        todayDate: today,
      }),
    [
      dispatchDate,
      receiptDate,
      serviceMode,
      noticeValue,
      noticeUnit,
      leasePurpose,
      alignToRentMonth,
      rentDay,
      today,
    ],
  );

  const overstay = useMemo(
    () =>
      computeOverstayCompensation({
        monthlyRent: Number(monthlyRent),
        monthsOverstayed: Number(overstayMonths),
      }),
    [monthlyRent, overstayMonths],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Notice to Vacate — key dates",
      `Notice dispatched: ${prettyDate(result.dispatchDate)}`,
      `Served by: ${result.serviceLabel}`,
      `Deemed / actual receipt: ${prettyDate(result.receiptDate)} (+${result.deemedServiceDays} day(s))`,
      `Notice period runs from: ${prettyDate(result.noticeStartDate)}`,
      `Vacate by (end of day): ${prettyDate(result.vacateDate)}`,
      `Possession due: ${prettyDate(result.possessionDate)}`,
      `Total notice given from receipt: ${result.totalNoticeDays} days`,
      result.alignedFrom
        ? `Aligned to the end of a rent month, pushed from ${prettyDate(result.alignedFrom)}`
        : "No rent-month alignment applied",
      `Statutory floor for this use: ${result.statutoryLabel} — ${
        result.meetsStatutoryMinimum
          ? "satisfied"
          : `short by ${result.statutoryShortfallDays} days`
      }`,
    ].join("\n");
  }, [ok, result]);

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
    setDispatchDate(todayIso());
    setServiceMode("registeredAd");
    setReceiptDate(todayIso());
    setNoticeValue("1");
    setNoticeUnit("months");
    setLeasePurpose("other");
    setAlignToRentMonth(false);
    setRentDay("1");
    setMonthlyRent("25000");
    setOverstayMonths("1");
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setNoticeValue(String(preset.value));
    setNoticeUnit(preset.unit);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Rental calculators
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Notice to Vacate Date Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Section 106(2) of the Transfer of Property Act runs the notice period from the date the
          notice is <em>received</em>, not the date it was posted. Enter the dispatch date, how it
          was served and how long the notice is, and get the vacate and possession dates.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-dispatch">
              Date the notice was sent or handed over
            </label>
            <input
              id="ntv-dispatch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dispatchDate}
              onChange={(event) => setDispatchDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-mode">
              How it was served
            </label>
            <select
              id="ntv-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={serviceMode}
              onChange={(event) => setServiceMode(event.target.value)}
            >
              {SERVICE_MODES.map((mode) => (
                <option key={mode.key} value={mode.key}>
                  {mode.label}
                  {mode.days > 0 ? ` (+${mode.days} days)` : ""}
                </option>
              ))}
            </select>
          </div>

          {serviceMode === "knownReceipt" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ntv-receipt">
                Actual date of receipt
              </label>
              <input
                id="ntv-receipt"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={receiptDate}
                onChange={(event) => setReceiptDate(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-value">
              Notice length
            </label>
            <input
              id="ntv-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={noticeValue}
              onChange={(event) => setNoticeValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-unit">
              Counted in
            </label>
            <select
              id="ntv-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={noticeUnit}
              onChange={(event) => setNoticeUnit(event.target.value)}
            >
              <option value="days">Days</option>
              <option value="months">Calendar months</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ntv-purpose">
              What the premises are used for
            </label>
            <select
              id="ntv-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={leasePurpose}
              onChange={(event) => setLeasePurpose(event.target.value)}
            >
              {LEASE_PURPOSES.map((purpose) => (
                <option key={purpose.key} value={purpose.key}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={alignToRentMonth}
                onChange={(event) => setAlignToRentMonth(event.target.checked)}
              />
              The agreement says the notice must expire at the end of a rent month
            </label>
          </div>

          {alignToRentMonth ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ntv-rentday">
                Day of the month rent falls due
              </label>
              <input
                id="ntv-rentday"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                step="1"
                value={rentDay}
                onChange={(event) => setRentDay(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {NOTICE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Vacate by end of
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? prettyDate(result.vacateDate) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Possession due on ${prettyDate(result.possessionDate)} · ${result.totalNoticeDays} days of notice from receipt`
                : "Correct the input above to see the dates"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the notice-to-vacate date summary"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset every field to the defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {[
            ["Notice dispatched", ok ? prettyDate(result.dispatchDate) : DASH],
            [
              "Deemed or actual receipt",
              ok ? `${prettyDate(result.receiptDate)} (+${result.deemedServiceDays} day(s))` : DASH,
            ],
            ["Notice period starts", ok ? prettyDate(result.noticeStartDate) : DASH],
            ["Last day of the notice", ok ? prettyDate(result.vacateDate) : DASH],
            ["Possession due", ok ? prettyDate(result.possessionDate) : DASH],
            ["Notice days from receipt", ok ? `${result.totalNoticeDays} days` : DASH],
            [
              "Rent-month alignment",
              ok
                ? result.alignedFrom
                  ? `Pushed from ${prettyDate(result.alignedFrom)}`
                  : "Not applied"
                : DASH,
            ],
            [
              "Days still to run",
              ok && result.daysRemaining !== null
                ? result.daysRemaining > 0
                  ? `${result.daysRemaining} days`
                  : result.daysRemaining === 0
                    ? "Expires today"
                    : `Expired ${Math.abs(result.daysRemaining)} days ago`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section
          aria-live="polite"
          aria-atomic="true"
          className={`mt-6 rounded-xl p-5 ring-1 ${
            result.meetsStatutoryMinimum
              ? "bg-[var(--card)] ring-[var(--border)]"
              : "bg-[var(--danger-soft)] ring-[var(--danger)]"
          }`}
        >
          <h2 className="text-base font-semibold">Statutory minimum check</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.purposeNote} On these facts the statutory period would expire on{" "}
            <strong className="text-[var(--foreground)]">{prettyDate(result.statutoryExpiry)}</strong>
            .
          </p>
          {result.meetsStatutoryMinimum ? (
            <p className="mt-2 text-sm font-semibold text-[var(--success)]">
              The notice you have given meets or exceeds the {result.statutoryLabel} floor.
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[var(--danger)]">
              Short of the {result.statutoryLabel} floor by {result.statutoryShortfallDays} days.
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            A shorter period in the notice is not automatically fatal — s.106(3) saves a notice where
            the suit is filed after the correct period has in fact expired — but a longer notice is
            always the safer course.
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">If the tenant stays on past the date</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          In states that have enacted the Model Tenancy Act, 2021, s.22(2) sets compensation at twice
          the monthly rent for the first two months of overstay and four times thereafter.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-rent">
              Monthly rent (INR)
            </label>
            <input
              id="ntv-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-overstay">
              Months of overstay
            </label>
            <input
              id="ntv-overstay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={overstayMonths}
              onChange={(event) => setOverstayMonths(event.target.value)}
            />
          </div>
        </div>

        {overstay.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {overstay.error}
          </p>
        ) : null}

        <dl
          className="mt-4 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {[
            [
              "First two months at twice the rent",
              overstay.error ? DASH : money(overstay.firstAmount),
            ],
            [
              "Later months at four times the rent",
              overstay.error ? DASH : money(overstay.laterAmount),
            ],
            ["Rent that would otherwise be due", overstay.error ? DASH : money(overstay.normalRent)],
            ["Total compensation", overstay.error ? DASH : money(overstay.total)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal advice. Rent control statutes, a state Rent Act, a
        registered agreement or local usage can override the default periods in the Transfer of
        Property Act. Postal deemed-service days are a working presumption, not a fixed rule — where
        possible use the actual acknowledgement date. Consult a lawyer before you act on a notice.
      </p>
    </main>
  );
}
