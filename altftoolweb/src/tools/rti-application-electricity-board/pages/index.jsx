"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  ARREAR_BAR_YEARS,
  COMMON_QUERIES,
  DISCONNECTION_NOTICE_DAYS,
  ISSUE_TOPICS,
  SUPPLY_PENALTY_PER_DAY_INR,
  buildElectricityRti,
  computeArrearBar,
  computeConnectionDelay,
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

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  applicantName: "Ravi Nair",
  address: "44 MG Road, Kochi 682016",
  phone: "+91 98470 00000",
  email: "ravi.nair@example.com",
  utilityName: "Kerala State Electricity Board Ltd",
  officeAddress: "Electrical Section, Ernakulam South",
  consumerNumber: "1234567890",
  topicId: "billing-dispute",
  periodFrom: "2026-01-01",
  periodTo: "2026-06-30",
  commonQueryIds: ["ledger", "cgrf", "sop"],
  filedDate: "2026-08-03",
  isBpl: false,
  isPrivateLicensee: false,
  wantsInspection: false,
  connectionApplied: "2026-04-01",
  asOnDate: "2026-08-03",
  permittedDays: 30,
  arrearDueSince: "2023-01-01",
  arrearDemandDate: "2026-08-03",
};

export default function ToolHome() {
  const [applicantName, setApplicantName] = useState(DEFAULTS.applicantName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [utilityName, setUtilityName] = useState(DEFAULTS.utilityName);
  const [officeAddress, setOfficeAddress] = useState(DEFAULTS.officeAddress);
  const [consumerNumber, setConsumerNumber] = useState(DEFAULTS.consumerNumber);
  const [topicId, setTopicId] = useState(DEFAULTS.topicId);
  const [periodFrom, setPeriodFrom] = useState(DEFAULTS.periodFrom);
  const [periodTo, setPeriodTo] = useState(DEFAULTS.periodTo);
  const [commonQueryIds, setCommonQueryIds] = useState(DEFAULTS.commonQueryIds);
  const [filedDate, setFiledDate] = useState(DEFAULTS.filedDate);
  const [isBpl, setIsBpl] = useState(DEFAULTS.isBpl);
  const [isPrivateLicensee, setIsPrivateLicensee] = useState(DEFAULTS.isPrivateLicensee);
  const [wantsInspection, setWantsInspection] = useState(DEFAULTS.wantsInspection);

  const [connectionApplied, setConnectionApplied] = useState(DEFAULTS.connectionApplied);
  const [asOnDate, setAsOnDate] = useState(DEFAULTS.asOnDate);
  const [permittedDays, setPermittedDays] = useState(String(DEFAULTS.permittedDays));
  const [arrearDueSince, setArrearDueSince] = useState(DEFAULTS.arrearDueSince);
  const [arrearDemandDate, setArrearDemandDate] = useState(DEFAULTS.arrearDemandDate);

  const [copied, setCopied] = useState(false);

  const rti = useMemo(
    () =>
      buildElectricityRti({
        applicantName,
        address,
        phone,
        email,
        utilityName,
        officeAddress,
        consumerNumber,
        topicId,
        periodFrom,
        periodTo,
        commonQueryIds,
        filedDate,
        isBpl,
        isPrivateLicensee,
        wantsInspection,
      }),
    [
      applicantName,
      address,
      phone,
      email,
      utilityName,
      officeAddress,
      consumerNumber,
      topicId,
      periodFrom,
      periodTo,
      commonQueryIds,
      filedDate,
      isBpl,
      isPrivateLicensee,
      wantsInspection,
    ],
  );

  const delay = useMemo(
    () =>
      computeConnectionDelay({
        applicationDate: connectionApplied,
        asOnDate,
        permittedDays: Number(permittedDays),
      }),
    [connectionApplied, asOnDate, permittedDays],
  );

  const arrear = useMemo(
    () => computeArrearBar({ dueSinceDate: arrearDueSince, demandDate: arrearDemandDate }),
    [arrearDueSince, arrearDemandDate],
  );

  const rtiError = Boolean(rti.error);
  const delayError = Boolean(delay.error);
  const arrearError = Boolean(arrear.error);

  const toggleQuery = (id) => {
    setCommonQueryIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyApplication = async () => {
    if (rtiError) return;
    try {
      await navigator.clipboard.writeText(rti.application);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setApplicantName(DEFAULTS.applicantName);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setUtilityName(DEFAULTS.utilityName);
    setOfficeAddress(DEFAULTS.officeAddress);
    setConsumerNumber(DEFAULTS.consumerNumber);
    setTopicId(DEFAULTS.topicId);
    setPeriodFrom(DEFAULTS.periodFrom);
    setPeriodTo(DEFAULTS.periodTo);
    setCommonQueryIds(DEFAULTS.commonQueryIds);
    setFiledDate(DEFAULTS.filedDate);
    setIsBpl(DEFAULTS.isBpl);
    setIsPrivateLicensee(DEFAULTS.isPrivateLicensee);
    setWantsInspection(DEFAULTS.wantsInspection);
    setConnectionApplied(DEFAULTS.connectionApplied);
    setAsOnDate(DEFAULTS.asOnDate);
    setPermittedDays(String(DEFAULTS.permittedDays));
    setArrearDueSince(DEFAULTS.arrearDueSince);
    setArrearDemandDate(DEFAULTS.arrearDemandDate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          RTI drafting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          RTI Application Draft for Electricity Board
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ask a distribution licensee for the records behind a delayed connection, a disputed bill
          or a suspect meter. The queries are framed against the Electricity Act 2003 so each one
          points at a document the office actually keeps.
        </p>
      </header>

      <section className={CARD} aria-labelledby="rti-heading">
        <h2 id="rti-heading" className="text-base font-semibold">
          The application
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-name">
              Your full name
            </label>
            <input
              id="eb-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-consumer">
              Consumer or application number
            </label>
            <input
              id="eb-consumer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={consumerNumber}
              onChange={(event) => setConsumerNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-utility">
              Distribution company or board
            </label>
            <input
              id="eb-utility"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={utilityName}
              onChange={(event) => setUtilityName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-office">
              Section, sub-division or circle
            </label>
            <input
              id="eb-office"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={officeAddress}
              onChange={(event) => setOfficeAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-from">
              Records from
            </label>
            <input
              id="eb-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={periodFrom}
              onChange={(event) => setPeriodFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-to">
              Records to
            </label>
            <input
              id="eb-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={periodTo}
              onChange={(event) => setPeriodTo(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-filed">
              RTI filed on
            </label>
            <input
              id="eb-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filedDate}
              onChange={(event) => setFiledDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-phone">
              Phone
            </label>
            <input
              id="eb-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-email">
              Email
            </label>
            <input
              id="eb-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eb-address">
              Postal address for the reply
            </label>
            <textarea
              id="eb-address"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eb-topic">
              What the dispute is about
            </label>
            <select
              id="eb-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
            >
              {ISSUE_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Extra questions to add</legend>
          <div className="mt-2 grid gap-1">
            {COMMON_QUERIES.map((query) => (
              <label
                key={query.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`eb-q-${query.id}`}
              >
                <input
                  id={`eb-q-${query.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={commonQueryIds.includes(query.id)}
                  onChange={() => toggleQuery(query.id)}
                />
                {query.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="eb-bpl">
            <input
              id="eb-bpl"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={isBpl}
              onChange={(event) => setIsBpl(event.target.checked)}
            />
            I hold a BPL card (fee exempt)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="eb-private">
            <input
              id="eb-private"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={isPrivateLicensee}
              onChange={(event) => setIsPrivateLicensee(event.target.checked)}
            />
            My licensee is privately owned
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="eb-inspect">
            <input
              id="eb-inspect"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={wantsInspection}
              onChange={(event) => setWantsInspection(event.target.checked)}
            />
            Ask to inspect the records first
          </label>
        </div>
      </section>

      {rtiError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {rti.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Reply is due by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {rtiError ? DASH : rti.timeline.replyDue.long}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {rtiError ? DASH : `${rti.queryCount} questions · ${rti.timeline.replyWindowText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyApplication}
              disabled={rtiError}
              aria-label="Copy the RTI application"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy application"}
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
            ["Transfer by (Section 6(3))", rtiError ? DASH : rti.timeline.transferBy.long],
            ["Reply due (Section 7(1))", rtiError ? DASH : rti.timeline.replyDue.long],
            ["First appeal by (Section 19(1))", rtiError ? DASH : rti.timeline.firstAppealBy.long],
            ["Appeal decided by", rtiError ? DASH : rti.timeline.faaDecisionDue.long],
            ["Second appeal by (Section 19(3))", rtiError ? DASH : rti.timeline.secondAppealBy.long],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!rtiError ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{rti.routeNote}</p>
        ) : null}

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {rtiError ? DASH : rti.application}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="delay-heading">
        <h2 id="delay-heading" className="text-base font-semibold">
          Section 43 connection delay check
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A licensee must supply within one month of the application under Section 43(1), unless the
          Commission has fixed a longer period for line extension work.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-applied">
              Connection applied on
            </label>
            <input
              id="eb-applied"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={connectionApplied}
              onChange={(event) => setConnectionApplied(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-ason">
              Position checked on
            </label>
            <input
              id="eb-ason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOnDate}
              onChange={(event) => setAsOnDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-permitted">
              Period allowed (days)
            </label>
            <input
              id="eb-permitted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={permittedDays}
              onChange={(event) => setPermittedDays(event.target.value)}
            />
          </div>
        </div>

        {delayError ? (
          <p role="alert" className={`mt-4 ${ERROR_CLASS}`}>
            {delay.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Supply was due by", delayError ? DASH : delay.dueBy.long],
            ["Days since the application", delayError ? DASH : NUM.format(delay.elapsedDays)],
            ["Days of default", delayError ? DASH : NUM.format(delay.delayDays)],
            [
              `Statutory ceiling at ${INR.format(SUPPLY_PENALTY_PER_DAY_INR)}/day (Section 43(3))`,
              delayError ? DASH : INR.format(delay.indicativePenaltyCeiling),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The ceiling is what Section 43(3) allows the appropriate Commission to impose on the
          licensee. It is not an amount payable to you, and only the Commission can order it.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="arrear-heading">
        <h2 id="arrear-heading" className="text-base font-semibold">
          Section 56(2) arrear age check
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A sum due for electricity supplied is not recoverable after {ARREAR_BAR_YEARS} years from
          the date it first became due, unless it has been shown continuously as a recoverable
          arrear of charges.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-due-since">
              Amount first became due on
            </label>
            <input
              id="eb-due-since"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={arrearDueSince}
              onChange={(event) => setArrearDueSince(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-demand">
              Demand raised on
            </label>
            <input
              id="eb-demand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={arrearDemandDate}
              onChange={(event) => setArrearDemandDate(event.target.value)}
            />
          </div>
        </div>

        {arrearError ? (
          <p role="alert" className={`mt-4 ${ERROR_CLASS}`}>
            {arrear.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Two-year line falls on", arrearError ? DASH : arrear.barDate.long],
            ["Days since the amount became due", arrearError ? DASH : NUM.format(arrear.daysSinceDue)],
            [
              "Demand raised after the two-year line",
              arrearError ? DASH : arrear.barLineCrossed ? "Yes — worth challenging" : "No",
            ],
            ["Notice needed before disconnection", `${DISCONNECTION_NOTICE_DAYS} clear days (Section 56(1))`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Section 43(1) of the Electricity Act 2003 requires
        supply within one month of the application, Section 55(1) forbids supply without a correct
        meter, Section 56(1) requires 15 clear days&rsquo; notice before disconnection and Section
        56(2) bars recovery of a sum more than two years after it first became due unless shown
        continuously as an arrear. Grievances go to the Consumer Grievance Redressal Forum under
        Section 42(5) and then to the Electricity Ombudsman under Section 42(6).
      </p>
    </main>
  );
}
