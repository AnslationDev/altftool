"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  EXIT_REASONS,
  FITNESS_GST_PERCENT,
  buildMembershipPolicy,
  computeMembershipRefund,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  clubName: "Ironline Fitness",
  city: "Bengaluru",
  contactEmail: "members@ironlinefitness.in",
  effectiveDate: "2026-08-01",
  planFee: 24000,
  joiningFee: 2000,
  gstPercent: FITNESS_GST_PERCENT,
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  cancelDate: "2026-07-01",
  freezeDaysUsed: 0,
  cancellationFeePercent: 10,
  cancellationFeeCap: 2000,
  lockInDays: 90,
  noticeDays: 7,
  joiningFeeRefundable: false,
  reasonId: "member-choice",
  freezeAllowed: true,
  maxFreezeDaysPerYear: 30,
  minFreezeBlockDays: 7,
  transferAllowed: true,
  transferFee: 500,
  ackHours: 24,
  redressDays: 14,
};

export default function ToolHome() {
  const [clubName, setClubName] = useState(DEFAULTS.clubName);
  const [city, setCity] = useState(DEFAULTS.city);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);

  const [planFee, setPlanFee] = useState(String(DEFAULTS.planFee));
  const [joiningFee, setJoiningFee] = useState(String(DEFAULTS.joiningFee));
  const [gstPercent, setGstPercent] = useState(String(DEFAULTS.gstPercent));
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);
  const [cancelDate, setCancelDate] = useState(DEFAULTS.cancelDate);
  const [freezeDaysUsed, setFreezeDaysUsed] = useState(String(DEFAULTS.freezeDaysUsed));
  const [reasonId, setReasonId] = useState(DEFAULTS.reasonId);

  const [cancellationFeePercent, setCancellationFeePercent] = useState(
    String(DEFAULTS.cancellationFeePercent),
  );
  const [cancellationFeeCap, setCancellationFeeCap] = useState(String(DEFAULTS.cancellationFeeCap));
  const [lockInDays, setLockInDays] = useState(String(DEFAULTS.lockInDays));
  const [noticeDays, setNoticeDays] = useState(String(DEFAULTS.noticeDays));
  const [joiningFeeRefundable, setJoiningFeeRefundable] = useState(DEFAULTS.joiningFeeRefundable);
  const [freezeAllowed, setFreezeAllowed] = useState(DEFAULTS.freezeAllowed);
  const [maxFreezeDaysPerYear, setMaxFreezeDaysPerYear] = useState(
    String(DEFAULTS.maxFreezeDaysPerYear),
  );
  const [minFreezeBlockDays, setMinFreezeBlockDays] = useState(String(DEFAULTS.minFreezeBlockDays));
  const [transferAllowed, setTransferAllowed] = useState(DEFAULTS.transferAllowed);
  const [transferFee, setTransferFee] = useState(String(DEFAULTS.transferFee));
  const [ackHours, setAckHours] = useState(String(DEFAULTS.ackHours));
  const [redressDays, setRedressDays] = useState(String(DEFAULTS.redressDays));

  const [copied, setCopied] = useState(false);

  const refund = useMemo(
    () =>
      computeMembershipRefund({
        planFee: Number(planFee),
        joiningFee: Number(joiningFee),
        gstPercent: Number(gstPercent),
        startDate,
        endDate,
        cancelDate,
        freezeDaysUsed: Number(freezeDaysUsed),
        cancellationFeePercent: Number(cancellationFeePercent),
        cancellationFeeCap: Number(cancellationFeeCap),
        lockInDays: Number(lockInDays),
        joiningFeeRefundable,
        reasonId,
      }),
    [
      planFee,
      joiningFee,
      gstPercent,
      startDate,
      endDate,
      cancelDate,
      freezeDaysUsed,
      cancellationFeePercent,
      cancellationFeeCap,
      lockInDays,
      joiningFeeRefundable,
      reasonId,
    ],
  );

  const policy = useMemo(
    () =>
      buildMembershipPolicy({
        clubName,
        city,
        contactEmail,
        effectiveDate,
        lockInDays: Number(lockInDays),
        noticeDays: Number(noticeDays),
        cancellationFeePercent: Number(cancellationFeePercent),
        cancellationFeeCap: Number(cancellationFeeCap),
        joiningFeeRefundable,
        freezeAllowed,
        maxFreezeDaysPerYear: Number(maxFreezeDaysPerYear),
        minFreezeBlockDays: Number(minFreezeBlockDays),
        transferAllowed,
        transferFee: Number(transferFee),
        ackHours: Number(ackHours),
        redressDays: Number(redressDays),
        gstPercent: Number(gstPercent),
      }),
    [
      clubName,
      city,
      contactEmail,
      effectiveDate,
      lockInDays,
      noticeDays,
      cancellationFeePercent,
      cancellationFeeCap,
      joiningFeeRefundable,
      freezeAllowed,
      maxFreezeDaysPerYear,
      minFreezeBlockDays,
      transferAllowed,
      transferFee,
      ackHours,
      redressDays,
      gstPercent,
    ],
  );

  const refundError = Boolean(refund.error);
  const policyError = Boolean(policy.error);

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
    setClubName(DEFAULTS.clubName);
    setCity(DEFAULTS.city);
    setContactEmail(DEFAULTS.contactEmail);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setPlanFee(String(DEFAULTS.planFee));
    setJoiningFee(String(DEFAULTS.joiningFee));
    setGstPercent(String(DEFAULTS.gstPercent));
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
    setCancelDate(DEFAULTS.cancelDate);
    setFreezeDaysUsed(String(DEFAULTS.freezeDaysUsed));
    setReasonId(DEFAULTS.reasonId);
    setCancellationFeePercent(String(DEFAULTS.cancellationFeePercent));
    setCancellationFeeCap(String(DEFAULTS.cancellationFeeCap));
    setLockInDays(String(DEFAULTS.lockInDays));
    setNoticeDays(String(DEFAULTS.noticeDays));
    setJoiningFeeRefundable(DEFAULTS.joiningFeeRefundable);
    setFreezeAllowed(DEFAULTS.freezeAllowed);
    setMaxFreezeDaysPerYear(String(DEFAULTS.maxFreezeDaysPerYear));
    setMinFreezeBlockDays(String(DEFAULTS.minFreezeBlockDays));
    setTransferAllowed(DEFAULTS.transferAllowed);
    setTransferFee(String(DEFAULTS.transferFee));
    setAckHours(String(DEFAULTS.ackHours));
    setRedressDays(String(DEFAULTS.redressDays));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Club operations
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Membership Refund Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your lock-in, freeze allowance, cancellation charge and transfer rules, then see the
          pro-rata refund a real member would get. Frozen days never count as used days, and GST
          comes back only on the refunded slice.
        </p>
      </header>

      <section className={CARD} aria-labelledby="member-heading">
        <h2 id="member-heading" className="text-base font-semibold">
          Price one cancellation
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-plan">
              Plan fee excluding GST (INR)
            </label>
            <input
              id="mb-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={planFee}
              onChange={(event) => setPlanFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-joining">
              Joining fee excluding GST (INR)
            </label>
            <input
              id="mb-joining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={joiningFee}
              onChange={(event) => setJoiningFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-start">
              Membership starts
            </label>
            <input
              id="mb-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-end">
              Membership ends
            </label>
            <input
              id="mb-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-cancel">
              Cancellation effective from
            </label>
            <input
              id="mb-cancel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={cancelDate}
              onChange={(event) => setCancelDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-frozen">
              Days already frozen
            </label>
            <input
              id="mb-frozen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={freezeDaysUsed}
              onChange={(event) => setFreezeDaysUsed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-gst">
              GST on membership (%)
            </label>
            <input
              id="mb-gst"
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
            <label className={LABEL_CLASS} htmlFor="mb-reason">
              Reason for leaving
            </label>
            <select
              id="mb-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reasonId}
              onChange={(event) => setReasonId(event.target.value)}
            >
              {EXIT_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {refundError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {refund.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Refund due to the member
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {refundError ? DASH : money(refund.totalRefund)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {refundError
            ? DASH
            : `${NUM.format(refund.unusedDays)} unused of ${NUM.format(refund.termDays)} days in the term`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total paid including GST", refundError ? DASH : money(refund.grossPaid)],
            ["Active days used", refundError ? DASH : NUM.format(refund.activeDaysUsed)],
            ["Unused days", refundError ? DASH : NUM.format(refund.unusedDays)],
            ["Pro-rata plan refund", refundError ? DASH : money(refund.proRataRefund)],
            ["Cancellation charge deducted", refundError ? DASH : money(refund.cancellationCharge)],
            ["Joining fee refunded", refundError ? DASH : money(refund.joiningRefund)],
            ["Refund before GST", refundError ? DASH : money(refund.refundExGst)],
            ["GST returned", refundError ? DASH : money(refund.gstRefund)],
            ["Club retains", refundError ? DASH : money(refund.retained)],
            [
              "Share of the amount paid returned",
              refundError ? DASH : `${refund.refundSharePercent}%`,
            ],
            ["End date after freezes", refundError ? DASH : refund.extendedEndDate],
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="text-base font-semibold">
          Policy rules
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-club">
              Gym or club name
            </label>
            <input
              id="mb-club"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={clubName}
              onChange={(event) => setClubName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-city">
              City
            </label>
            <input
              id="mb-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-email">
              Cancellation contact email
            </label>
            <input
              id="mb-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-effective">
              Policy effective from
            </label>
            <input
              id="mb-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-lockin">
              Lock-in (days, 0 for none)
            </label>
            <input
              id="mb-lockin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={lockInDays}
              onChange={(event) => setLockInDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-notice">
              Notice period (days)
            </label>
            <input
              id="mb-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-charge">
              Cancellation charge (% of refund)
            </label>
            <input
              id="mb-charge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={cancellationFeePercent}
              onChange={(event) => setCancellationFeePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-cap">
              Cap on that charge (INR, 0 = none)
            </label>
            <input
              id="mb-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={cancellationFeeCap}
              onChange={(event) => setCancellationFeeCap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-freeze-max">
              Freeze allowance per year (days)
            </label>
            <input
              id="mb-freeze-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={maxFreezeDaysPerYear}
              onChange={(event) => setMaxFreezeDaysPerYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-freeze-min">
              Minimum freeze block (days)
            </label>
            <input
              id="mb-freeze-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={minFreezeBlockDays}
              onChange={(event) => setMinFreezeBlockDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-transfer-fee">
              Transfer fee (INR)
            </label>
            <input
              id="mb-transfer-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={transferFee}
              onChange={(event) => setTransferFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-ack">
              Acknowledge within (hours, max 48)
            </label>
            <input
              id="mb-ack"
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
            <label className={LABEL_CLASS} htmlFor="mb-redress">
              Settle within (days, max 30)
            </label>
            <input
              id="mb-redress"
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

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="mb-joining-ref">
            <input
              id="mb-joining-ref"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={joiningFeeRefundable}
              onChange={(event) => setJoiningFeeRefundable(event.target.checked)}
            />
            Joining fee is refundable
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="mb-freeze-allowed">
            <input
              id="mb-freeze-allowed"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={freezeAllowed}
              onChange={(event) => setFreezeAllowed(event.target.checked)}
            />
            Members may freeze the membership
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="mb-transfer-allowed">
            <input
              id="mb-transfer-allowed"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={transferAllowed}
              onChange={(event) => setTransferAllowed(event.target.checked)}
            />
            Membership may be transferred
          </label>
        </div>
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
              Policy effective from
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {policyError ? DASH : policy.effectiveLong}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPolicy}
              disabled={policyError}
              aria-label="Copy the generated membership policy"
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
        Informational template, not legal or tax advice. Health club and fitness centre services
        (SAC 999723) are generally taxed at 18% GST, and retained cancellation charges follow CBIC
        Circular No. 178/10/2022-GST of 3 August 2022. Long lock-ins and heavy exit charges can be
        examined as unfair contract terms under the Consumer Protection Act 2019 — have a lawyer
        review the wording before you put it on a membership form.
      </p>
    </main>
  );
}
