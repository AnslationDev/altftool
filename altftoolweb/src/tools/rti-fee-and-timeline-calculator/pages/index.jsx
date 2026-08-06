"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import {
  APPLICATION_FEE_INR,
  FILING_ROUTES,
  INSPECTION_HOURLY_INR,
  MEDIA_FEE_INR,
  PAGE_FEE_INR,
  PENALTY_CAP_INR,
  PENALTY_PER_DAY_INR,
  computePenaltyExposure,
  computeRtiDeadlines,
  computeRtiFees,
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
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const DEFAULTS = {
  isBpl: false,
  pages: 25,
  largePages: 0,
  largePageCost: 0,
  mediaCount: 0,
  inspectionHours: 0,
  publicationCost: 0,
  deadlineMissed: false,
  applicationFee: APPLICATION_FEE_INR,
  pageFee: PAGE_FEE_INR,
  filedDate: "2026-08-03",
  routeId: "pio",
  lifeLiberty: false,
  thirdParty: false,
  feeIntimationDate: "",
  feePaidDate: "",
  appealFiledDate: "",
  asOnDate: "2026-09-30",
};

export default function ToolHome() {
  const [isBpl, setIsBpl] = useState(DEFAULTS.isBpl);
  const [pages, setPages] = useState(String(DEFAULTS.pages));
  const [largePages, setLargePages] = useState(String(DEFAULTS.largePages));
  const [largePageCost, setLargePageCost] = useState(String(DEFAULTS.largePageCost));
  const [mediaCount, setMediaCount] = useState(String(DEFAULTS.mediaCount));
  const [inspectionHours, setInspectionHours] = useState(String(DEFAULTS.inspectionHours));
  const [publicationCost, setPublicationCost] = useState(String(DEFAULTS.publicationCost));
  const [deadlineMissed, setDeadlineMissed] = useState(DEFAULTS.deadlineMissed);
  const [applicationFee, setApplicationFee] = useState(String(DEFAULTS.applicationFee));
  const [pageFee, setPageFee] = useState(String(DEFAULTS.pageFee));

  const [filedDate, setFiledDate] = useState(DEFAULTS.filedDate);
  const [routeId, setRouteId] = useState(DEFAULTS.routeId);
  const [lifeLiberty, setLifeLiberty] = useState(DEFAULTS.lifeLiberty);
  const [thirdParty, setThirdParty] = useState(DEFAULTS.thirdParty);
  const [feeIntimationDate, setFeeIntimationDate] = useState(DEFAULTS.feeIntimationDate);
  const [feePaidDate, setFeePaidDate] = useState(DEFAULTS.feePaidDate);
  const [appealFiledDate, setAppealFiledDate] = useState(DEFAULTS.appealFiledDate);
  const [asOnDate, setAsOnDate] = useState(DEFAULTS.asOnDate);

  const [copied, setCopied] = useState(false);

  const fees = useMemo(
    () =>
      computeRtiFees({
        isBpl,
        pages: Number(pages),
        largePages: Number(largePages),
        largePageCost: Number(largePageCost),
        mediaCount: Number(mediaCount),
        inspectionHours: Number(inspectionHours),
        publicationCost: Number(publicationCost),
        deadlineMissed,
        applicationFee: Number(applicationFee),
        pageFee: Number(pageFee),
      }),
    [
      isBpl,
      pages,
      largePages,
      largePageCost,
      mediaCount,
      inspectionHours,
      publicationCost,
      deadlineMissed,
      applicationFee,
      pageFee,
    ],
  );

  const deadlines = useMemo(
    () =>
      computeRtiDeadlines({
        filedDate,
        routeId,
        lifeLiberty,
        thirdParty,
        feeIntimationDate,
        feePaidDate,
        appealFiledDate,
      }),
    [filedDate, routeId, lifeLiberty, thirdParty, feeIntimationDate, feePaidDate, appealFiledDate],
  );

  const feesError = Boolean(fees.error);
  const deadlinesError = Boolean(deadlines.error);

  const penalty = useMemo(() => {
    if (deadlinesError) return { error: deadlines.error };
    return computePenaltyExposure({ replyDueIso: deadlines.replyDue.iso, asOnIso: asOnDate });
  }, [deadlines, deadlinesError, asOnDate]);

  const penaltyError = Boolean(penalty.error);

  const summary = useMemo(() => {
    if (feesError || deadlinesError) return "";
    return [
      "RTI fee and timeline",
      `Filed on: ${filedDate}`,
      `Reply basis: ${deadlines.basisText}`,
      `Total days allowed: ${deadlines.totalDays}`,
      `Reply due: ${deadlines.replyDue.long}`,
      `First appeal by: ${deadlines.firstAppealBy.long}`,
      `Second appeal by: ${deadlines.secondAppealBy.long}`,
      `Application fee: ${money(fees.applicationFee)}`,
      `Additional fee: ${money(fees.additionalFee)}`,
      `Total payable: ${money(fees.totalPayable)}`,
    ].join("\n");
  }, [fees, feesError, deadlines, deadlinesError, filedDate]);

  const copySummary = async () => {
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
    if (
      !window.confirm(
        "Reset all RTI dates and fee details? This clears everything entered and cannot be undone.",
      )
    ) {
      return;
    }
    setIsBpl(DEFAULTS.isBpl);
    setPages(String(DEFAULTS.pages));
    setLargePages(String(DEFAULTS.largePages));
    setLargePageCost(String(DEFAULTS.largePageCost));
    setMediaCount(String(DEFAULTS.mediaCount));
    setInspectionHours(String(DEFAULTS.inspectionHours));
    setPublicationCost(String(DEFAULTS.publicationCost));
    setDeadlineMissed(DEFAULTS.deadlineMissed);
    setApplicationFee(String(DEFAULTS.applicationFee));
    setPageFee(String(DEFAULTS.pageFee));
    setFiledDate(DEFAULTS.filedDate);
    setRouteId(DEFAULTS.routeId);
    setLifeLiberty(DEFAULTS.lifeLiberty);
    setThirdParty(DEFAULTS.thirdParty);
    setFeeIntimationDate(DEFAULTS.feeIntimationDate);
    setFeePaidDate(DEFAULTS.feePaidDate);
    setAppealFiledDate(DEFAULTS.appealFiledDate);
    setAsOnDate(DEFAULTS.asOnDate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          RTI toolkit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          RTI Fee and Timeline Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices an RTI under the Right to Information Rules 2012 and dates it under the Act — the
          30-day reply, the extra 5 days when an APIO takes the application, the 40-day third-party
          track, and the days excluded while a further fee is outstanding.
        </p>
      </header>

      <section className={CARD} aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-base font-semibold">
          Timeline inputs
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-filed">
              Application received on
            </label>
            <input
              id="rf-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filedDate}
              onChange={(event) => setFiledDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-route">
              Filed with
            </label>
            <select
              id="rf-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={routeId}
              onChange={(event) => setRouteId(event.target.value)}
            >
              {FILING_ROUTES.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-fee-intimation">
              Further fee demanded on (optional)
            </label>
            <input
              id="rf-fee-intimation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={feeIntimationDate}
              onChange={(event) => setFeeIntimationDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-fee-paid">
              Further fee paid on (optional)
            </label>
            <input
              id="rf-fee-paid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={feePaidDate}
              onChange={(event) => setFeePaidDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-appeal">
              First appeal actually filed on (optional)
            </label>
            <input
              id="rf-appeal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={appealFiledDate}
              onChange={(event) => setAppealFiledDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-ason">
              Delay measured on
            </label>
            <input
              id="rf-ason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOnDate}
              onChange={(event) => setAsOnDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rf-life">
            <input
              id="rf-life"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={lifeLiberty}
              onChange={(event) => setLifeLiberty(event.target.checked)}
            />
            Concerns life or liberty (48 hours)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rf-third">
            <input
              id="rf-third"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={thirdParty}
              onChange={(event) => setThirdParty(event.target.checked)}
            />
            Third-party information involved (40 days)
          </label>
        </div>
      </section>

      {deadlinesError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {deadlines.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Reply is due by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {deadlinesError ? DASH : deadlines.replyDue.long}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {deadlinesError ? DASH : deadlines.basisText}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              disabled={!summary}
              aria-label="Copy the fee and timeline summary"
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
              aria-label="Reset every field to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Base period", deadlinesError ? DASH : `${NUM.format(deadlines.baseDays)} days`],
            [
              "Added for the APIO route (Section 5(2))",
              deadlinesError ? DASH : `${NUM.format(deadlines.extraDays)} days`,
            ],
            [
              "Excluded while a further fee was outstanding (Section 7(3))",
              deadlinesError ? DASH : `${NUM.format(deadlines.excludedDays)} days`,
            ],
            ["Total days allowed", deadlinesError ? DASH : `${NUM.format(deadlines.totalDays)} days`],
            ["Transfer to the right authority by (Section 6(3))", deadlinesError ? DASH : deadlines.transferBy.long],
            ["First appeal by (Section 19(1))", deadlinesError ? DASH : deadlines.firstAppealBy.long],
            ["Appeal decided by (Section 19(6))", deadlinesError ? DASH : deadlines.faaDecisionDue.long],
            ["Outer limit with recorded reasons", deadlinesError ? DASH : deadlines.faaExtendedDue.long],
            ["Second appeal by (Section 19(3))", deadlinesError ? DASH : deadlines.secondAppealBy.long],
            ["Days of delay so far", penaltyError ? DASH : NUM.format(penalty.delayDays)],
            [
              `PIO penalty exposure at ${money(PENALTY_PER_DAY_INR)}/day (Section 20(1))`,
              penaltyError ? DASH : `${money(penalty.exposureInr)}${penalty.capped ? " (capped)" : ""}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!deadlinesError ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {deadlines.routeNote}
            {deadlines.appealAssumed
              ? " Appeal dates assume the first appeal is filed on the last permitted day."
              : ""}
            {deadlines.appealBeforeReplyDue
              ? " The first appeal date entered is earlier than the reply-period expiry, which is valid under Section 19(1) if the PIO's decision was received before then."
              : ""}
          </p>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="fee-heading">
        <h2 id="fee-heading" className="text-base font-semibold">
          Fee inputs
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-pages">
              A-4 / A-3 pages to be copied
            </label>
            <input
              id="rf-pages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={pages}
              onChange={(event) => setPages(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-inspection">
              Hours of record inspection
            </label>
            <input
              id="rf-inspection"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={inspectionHours}
              onChange={(event) => setInspectionHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-media">
              CDs or diskettes supplied
            </label>
            <input
              id="rf-media"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={mediaCount}
              onChange={(event) => setMediaCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-large-pages">
              Pages in larger paper sizes
            </label>
            <input
              id="rf-large-pages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={largePages}
              onChange={(event) => setLargePages(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-large-cost">
              Actual cost of one large page (INR)
            </label>
            <input
              id="rf-large-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={largePageCost}
              onChange={(event) => setLargePageCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-publication">
              Price of a priced publication (INR)
            </label>
            <input
              id="rf-publication"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={publicationCost}
              onChange={(event) => setPublicationCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-app-fee">
              Application fee in your state (INR)
            </label>
            <input
              id="rf-app-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={applicationFee}
              onChange={(event) => setApplicationFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rf-page-fee">
              Per-page copying rate (INR)
            </label>
            <input
              id="rf-page-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={pageFee}
              onChange={(event) => setPageFee(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rf-bpl">
            <input
              id="rf-bpl"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={isBpl}
              onChange={(event) => setIsBpl(event.target.checked)}
            />
            Applicant is below the poverty line
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rf-missed">
            <input
              id="rf-missed"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={deadlineMissed}
              onChange={(event) => setDeadlineMissed(event.target.checked)}
            />
            The reply deadline was missed (Section 7(6))
          </label>
        </div>
      </section>

      {feesError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {fees.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Total payable
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {feesError ? DASH : money(fees.totalPayable)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {feesError
            ? DASH
            : fees.exemptUnderRule8
              ? "Nothing payable — BPL exemption under Rule 8 and the proviso to Section 7(5)"
              : fees.freeUnderSection76
                ? "Only the application fee — the information itself is free under Section 7(6)"
                : "Application fee plus copying and inspection charges"}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Application fee (Rule 3)", feesError ? DASH : money(fees.applicationFee)],
            [`Page copying at ${money(Number(pageFee))} per page (Rule 4(a))`, feesError ? DASH : money(fees.pageFee)],
            ["Larger paper at actual cost (Rule 4(b))", feesError ? DASH : money(fees.largePageFee)],
            [`Electronic media at ${money(MEDIA_FEE_INR)} each (Rule 4(d))`, feesError ? DASH : money(fees.mediaFee)],
            ["Priced publication (Rule 4(e))", feesError ? DASH : money(fees.publicationFee)],
            [
              "Chargeable inspection hours after the free first hour",
              feesError ? DASH : NUM.format(fees.chargeableInspectionHours),
            ],
            [`Inspection at ${money(INSPECTION_HOURLY_INR)} per hour (Rule 4(f))`, feesError ? DASH : money(fees.inspectionFee)],
            ["Additional fee for the information", feesError ? DASH : money(fees.additionalFee)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The default rates are those in the central Right to
        Information Rules 2012 — Rs {APPLICATION_FEE_INR} to apply, Rs {PAGE_FEE_INR} per A-4 or A-3
        page, Rs {MEDIA_FEE_INR} per disc, and inspection free for the first hour then Rs{" "}
        {INSPECTION_HOURLY_INR} an hour. State governments and High Courts notify their own rules
        and several charge differently, so override the two rate boxes with your state&rsquo;s
        figures. The Section 20(1) penalty of Rs {PENALTY_PER_DAY_INR} per day up to Rs{" "}
        {PENALTY_CAP_INR} can only be imposed by an Information Commission on the officer, and is
        not compensation payable to you.
      </p>
    </main>
  );
}
