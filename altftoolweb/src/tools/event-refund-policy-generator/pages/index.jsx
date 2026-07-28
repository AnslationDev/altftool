"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Ticket, Trash2 } from "lucide-react";

import {
  CANCEL_REASONS,
  DEFAULT_TIERS,
  buildEventRefundPolicy,
  computeEventRefund,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const DEFAULTS = {
  organiserName: "Northlight Live",
  eventName: "Monsoon Music Festival 2026",
  eventDate: "2026-09-01",
  contactEmail: "tickets@northlightlive.in",
  tierRows: DEFAULT_TIERS.map((tier) => ({
    days: String(tier.minDaysBefore),
    percent: String(tier.refundPercent),
  })),
  bookingFeeRefundable: false,
  transferAllowed: true,
  transferCutoffDays: 7,
  ackHours: 24,
  redressDays: 10,
  gstPercent: 18,
  ticketPrice: 2000,
  quantity: 2,
  bookingFeePerTicket: 100,
  cancelDate: "2026-08-20",
  reasonId: "attendee",
};

export default function ToolHome() {
  const [organiserName, setOrganiserName] = useState(DEFAULTS.organiserName);
  const [eventName, setEventName] = useState(DEFAULTS.eventName);
  const [eventDate, setEventDate] = useState(DEFAULTS.eventDate);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [tierRows, setTierRows] = useState(DEFAULTS.tierRows);
  const [bookingFeeRefundable, setBookingFeeRefundable] = useState(DEFAULTS.bookingFeeRefundable);
  const [transferAllowed, setTransferAllowed] = useState(DEFAULTS.transferAllowed);
  const [transferCutoffDays, setTransferCutoffDays] = useState(String(DEFAULTS.transferCutoffDays));
  const [ackHours, setAckHours] = useState(String(DEFAULTS.ackHours));
  const [redressDays, setRedressDays] = useState(String(DEFAULTS.redressDays));
  const [gstPercent, setGstPercent] = useState(String(DEFAULTS.gstPercent));

  const [ticketPrice, setTicketPrice] = useState(String(DEFAULTS.ticketPrice));
  const [quantity, setQuantity] = useState(String(DEFAULTS.quantity));
  const [bookingFeePerTicket, setBookingFeePerTicket] = useState(
    String(DEFAULTS.bookingFeePerTicket),
  );
  const [cancelDate, setCancelDate] = useState(DEFAULTS.cancelDate);
  const [reasonId, setReasonId] = useState(DEFAULTS.reasonId);

  const [copied, setCopied] = useState(false);

  const tiers = useMemo(
    () => tierRows.map((row) => ({ minDaysBefore: Number(row.days), refundPercent: Number(row.percent) })),
    [tierRows],
  );

  const refund = useMemo(
    () =>
      computeEventRefund({
        ticketPrice: Number(ticketPrice),
        quantity: Number(quantity),
        bookingFeePerTicket: Number(bookingFeePerTicket),
        gstPercent: Number(gstPercent),
        eventDate,
        cancelDate,
        tiers,
        reasonId,
        bookingFeeRefundable,
      }),
    [
      ticketPrice,
      quantity,
      bookingFeePerTicket,
      gstPercent,
      eventDate,
      cancelDate,
      tiers,
      reasonId,
      bookingFeeRefundable,
    ],
  );

  const policy = useMemo(
    () =>
      buildEventRefundPolicy({
        organiserName,
        eventName,
        eventDate,
        contactEmail,
        tiers,
        bookingFeeRefundable,
        transferAllowed,
        transferCutoffDays: Number(transferCutoffDays),
        ackHours: Number(ackHours),
        redressDays: Number(redressDays),
        gstPercent: Number(gstPercent),
      }),
    [
      organiserName,
      eventName,
      eventDate,
      contactEmail,
      tiers,
      bookingFeeRefundable,
      transferAllowed,
      transferCutoffDays,
      ackHours,
      redressDays,
      gstPercent,
    ],
  );

  const refundError = Boolean(refund.error);
  const policyError = Boolean(policy.error);

  const patchTier = (index, key, value) => {
    setTierRows((current) =>
      current.map((row, position) => (position === index ? { ...row, [key]: value } : row)),
    );
  };

  const addTier = () => {
    setTierRows((current) => [...current, { days: "0", percent: "0" }]);
  };

  const removeTier = (index) => {
    setTierRows((current) => current.filter((_, position) => position !== index));
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
    setOrganiserName(DEFAULTS.organiserName);
    setEventName(DEFAULTS.eventName);
    setEventDate(DEFAULTS.eventDate);
    setContactEmail(DEFAULTS.contactEmail);
    setTierRows(DEFAULTS.tierRows);
    setBookingFeeRefundable(DEFAULTS.bookingFeeRefundable);
    setTransferAllowed(DEFAULTS.transferAllowed);
    setTransferCutoffDays(String(DEFAULTS.transferCutoffDays));
    setAckHours(String(DEFAULTS.ackHours));
    setRedressDays(String(DEFAULTS.redressDays));
    setGstPercent(String(DEFAULTS.gstPercent));
    setTicketPrice(String(DEFAULTS.ticketPrice));
    setQuantity(String(DEFAULTS.quantity));
    setBookingFeePerTicket(String(DEFAULTS.bookingFeePerTicket));
    setCancelDate(DEFAULTS.cancelDate);
    setReasonId(DEFAULTS.reasonId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Event operations
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Event Refund Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a refund ladder by days before the event, then see exactly what one booking gets back
          — including the GST split, which follows CBIC Circular 178/10/2022-GST: tax comes back
          only on the refunded slice of the ticket.
        </p>
      </header>

      <section className={CARD} aria-labelledby="ladder-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ladder-heading" className="text-base font-semibold">
            Refund ladder
          </h2>
          <button type="button" onClick={addTier} className={GHOST_BTN} aria-label="Add a refund tier">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add tier
          </button>
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each row means &ldquo;cancel this many or more days before the event and get this much
          back&rdquo;. Keep a 0-day row so every cancellation has an answer.
        </p>
        <div className="mt-4 space-y-3">
          {tierRows.map((row, index) => (
            <div
              key={`tier-${index}-${row.days}`}
              className="grid gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <div>
                <label className={SMALL_LABEL} htmlFor={`ev-tier-days-${index}`}>
                  Days before the event (from)
                </label>
                <input
                  id={`ev-tier-days-${index}`}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="1095"
                  step="1"
                  value={row.days}
                  onChange={(event) => patchTier(index, "days", event.target.value)}
                />
              </div>
              <div>
                <label className={SMALL_LABEL} htmlFor={`ev-tier-pct-${index}`}>
                  Refund percentage
                </label>
                <input
                  id={`ev-tier-pct-${index}`}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="5"
                  value={row.percent}
                  onChange={(event) => patchTier(index, "percent", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeTier(index)}
                className={GHOST_BTN}
                aria-label={`Remove the tier starting at ${row.days} days`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="booking-heading">
        <h2 id="booking-heading" className="text-base font-semibold">
          Price one cancellation
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-price">
              Ticket price before GST (INR)
            </label>
            <input
              id="ev-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={ticketPrice}
              onChange={(event) => setTicketPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-qty">
              Number of tickets
            </label>
            <input
              id="ev-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-fee">
              Booking fee per ticket (INR)
            </label>
            <input
              id="ev-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={bookingFeePerTicket}
              onChange={(event) => setBookingFeePerTicket(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-gst">
              GST on the ticket (%)
            </label>
            <input
              id="ev-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={gstPercent}
              onChange={(event) => setGstPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-event-date">
              Event date
            </label>
            <input
              id="ev-event-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-cancel-date">
              Cancellation date
            </label>
            <input
              id="ev-cancel-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={cancelDate}
              onChange={(event) => setCancelDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ev-reason">
              Who is cancelling and why
            </label>
            <select
              id="ev-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reasonId}
              onChange={(event) => setReasonId(event.target.value)}
            >
              {CANCEL_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="ev-fee-refundable"
        >
          <input
            id="ev-fee-refundable"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={bookingFeeRefundable}
            onChange={(event) => setBookingFeeRefundable(event.target.checked)}
          />
          Refund the booking fee even when the attendee cancels
        </label>
      </section>

      {refundError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {refund.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Refund payable
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {refundError ? DASH : money(refund.refundTotal)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {refundError
            ? DASH
            : `${refund.daysBefore} day${refund.daysBefore === 1 ? "" : "s"} before the event — ${refund.tierLabel} — ${refund.refundPercent}% of the ticket price`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total paid by the attendee", refundError ? DASH : money(refund.grossPaid)],
            ["Ticket face value", refundError ? DASH : money(refund.ticketFace)],
            ["GST charged on tickets", refundError ? DASH : money(refund.gstOnTickets)],
            ["Booking fees", refundError ? DASH : money(refund.fees)],
            ["Refund of ticket price", refundError ? DASH : money(refund.refundOnFace)],
            ["Refund of GST", refundError ? DASH : money(refund.refundOnGst)],
            ["Refund of booking fees", refundError ? DASH : money(refund.refundOnFees)],
            ["Organiser retains", refundError ? DASH : money(refund.retained)],
            ["GST inside the retained amount", refundError ? DASH : money(refund.retainedGst)],
            [
              "Share of the amount paid returned",
              refundError ? DASH : `${refund.effectivePercent}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!refundError ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{refund.reasonNote}</p>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="policy-heading">
        <h2 id="policy-heading" className="text-base font-semibold">
          Policy wording
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-organiser">
              Organiser name
            </label>
            <input
              id="ev-organiser"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={organiserName}
              onChange={(event) => setOrganiserName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-name">
              Event name
            </label>
            <input
              id="ev-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-email">
              Refund contact email
            </label>
            <input
              id="ev-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-cutoff">
              Name transfer closes (days before)
            </label>
            <input
              id="ev-cutoff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={transferCutoffDays}
              onChange={(event) => setTransferCutoffDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-ack">
              Acknowledge within (hours, max 48)
            </label>
            <input
              id="ev-ack"
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
            <label className={LABEL_CLASS} htmlFor="ev-redress">
              Settle refunds within (days, max 30)
            </label>
            <input
              id="ev-redress"
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
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="ev-transfer"
        >
          <input
            id="ev-transfer"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={transferAllowed}
            onChange={(event) => setTransferAllowed(event.target.checked)}
          />
          Allow a free name transfer instead of a refund
        </label>
      </section>

      {policyError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {policy.error}
        </p>
      ) : null}

      {!policyError && policy.warning ? (
        <p className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {policy.warning}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Policy for
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {policyError ? DASH : policy.eventLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {policyError ? DASH : `${policy.tierCount} tiers, 9 clauses`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPolicy}
              disabled={policyError}
              aria-label="Copy the generated event refund policy"
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
        Informational template, not legal or tax advice. The GST treatment of retained cancellation
        charges follows CBIC Circular No. 178/10/2022-GST of 3 August 2022; confirm the rate that
        applies to your category of event with your tax adviser, and have a lawyer review the policy
        before you publish it or print it on a ticket.
      </p>
    </main>
  );
}
