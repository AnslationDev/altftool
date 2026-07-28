"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";
import {
  CLOSURE_REASONS,
  CLOSURE_WORKING_DAYS,
  CONFIRMATION_ASKS,
  DELAY_PENALTY_PER_DAY,
  buildClosureRequest,
  formatLongDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  cardholderName: "Ravi Iyer",
  address: "44 MG Road, Bengaluru 560001",
  email: "ravi.iyer@example.com",
  phone: "98xxxxxx10",
  issuerName: "HDFC Bank",
  cardVariant: "Regalia credit card",
  cardLastFour: "4321",
  requestDate: "2026-01-05",
  statusDate: "2026-01-20",
  outstandingDues: "0",
  reason: CLOSURE_REASONS[0],
  claimPenalty: true,
};

export default function ToolHome() {
  const [cardholderName, setCardholderName] = useState(DEFAULTS.cardholderName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [issuerName, setIssuerName] = useState(DEFAULTS.issuerName);
  const [cardVariant, setCardVariant] = useState(DEFAULTS.cardVariant);
  const [cardLastFour, setCardLastFour] = useState(DEFAULTS.cardLastFour);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [statusDate, setStatusDate] = useState(DEFAULTS.statusDate);
  const [outstandingDues, setOutstandingDues] = useState(DEFAULTS.outstandingDues);
  const [reason, setReason] = useState(DEFAULTS.reason);
  const [asks, setAsks] = useState(CONFIRMATION_ASKS.slice(0, 4));
  const [claimPenalty, setClaimPenalty] = useState(DEFAULTS.claimPenalty);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildClosureRequest({
        cardholderName,
        address,
        email,
        phone,
        issuerName,
        cardVariant,
        cardLastFour,
        requestDate,
        statusDate,
        outstandingDues,
        reason,
        asks,
        claimPenalty,
      }),
    [
      cardholderName,
      address,
      email,
      phone,
      issuerName,
      cardVariant,
      cardLastFour,
      requestDate,
      statusDate,
      outstandingDues,
      reason,
      asks,
      claimPenalty,
    ],
  );

  const failed = Boolean(result.error);
  const timeline = failed ? null : result.timeline;

  const toggleAsk = (option) => {
    setAsks((list) =>
      list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
    );
  };

  const copyLetter = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCardholderName(DEFAULTS.cardholderName);
    setAddress(DEFAULTS.address);
    setEmail(DEFAULTS.email);
    setPhone(DEFAULTS.phone);
    setIssuerName(DEFAULTS.issuerName);
    setCardVariant(DEFAULTS.cardVariant);
    setCardLastFour(DEFAULTS.cardLastFour);
    setRequestDate(DEFAULTS.requestDate);
    setStatusDate(DEFAULTS.statusDate);
    setOutstandingDues(DEFAULTS.outstandingDues);
    setReason(DEFAULTS.reason);
    setAsks(CONFIRMATION_ASKS.slice(0, 4));
    setClaimPenalty(DEFAULTS.claimPenalty);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Banking letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Credit Card Closure Confirmation Request
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a closure letter that asks for written confirmation, a no-dues certificate and a
          bureau status update — with the {CLOSURE_WORKING_DAYS}-working-day RBI deadline and the{" "}
          {money(DELAY_PENALTY_PER_DAY)}-a-day delay compensation worked out for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cardholder and card</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-name">
              Cardholder name
            </label>
            <input
              id="ccc-name"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-issuer">
              Card issuer
            </label>
            <input
              id="ccc-issuer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={issuerName}
              onChange={(event) => setIssuerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-variant">
              Card variant
            </label>
            <input
              id="ccc-variant"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cardVariant}
              onChange={(event) => setCardVariant(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-four">
              Card last 4 digits
            </label>
            <input
              id="ccc-four"
              className={`mt-2 ${INPUT_CLASS}`}
              inputMode="numeric"
              maxLength={4}
              value={cardLastFour}
              onChange={(event) => setCardLastFour(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-address">
              Postal address
            </label>
            <input
              id="ccc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-email">
              Email
            </label>
            <input
              id="ccc-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-phone">
              Phone
            </label>
            <input
              id="ccc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-reason">
              Reason for closing
            </label>
            <select
              id="ccc-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              {CLOSURE_REASONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Dates and dues</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-req-date">
              Closure request sent on
            </label>
            <input
              id="ccc-req-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-status-date">
              Status as on (blank if you are only sending it now)
            </label>
            <input
              id="ccc-status-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={statusDate}
              onChange={(event) => setStatusDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-dues">
              Outstanding balance on the card (INR)
            </label>
            <input
              id="ccc-dues"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={outstandingDues}
              onChange={(event) => setOutstandingDues(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            id="ccc-claim"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={claimPenalty}
            onChange={(event) => setClaimPenalty(event.target.checked)}
          />
          <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="ccc-claim">
            Include a paragraph claiming delay compensation — added only when the deadline has
            actually passed and no balance is outstanding.
          </label>
        </div>

        <div className="mt-5">
          <p className={LABEL_CLASS}>What you want confirmed in writing</p>
          <div className="mt-2 space-y-2">
            {CONFIRMATION_ASKS.map((option, index) => (
              <div key={option} className="flex items-start gap-3">
                <input
                  id={`ccc-ask-${index}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={asks.includes(option)}
                  onChange={() => toggleAsk(option)}
                />
                <label
                  className="text-sm leading-6 text-[var(--muted-foreground)]"
                  htmlFor={`ccc-ask-${index}`}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Closure due by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {timeline ? formatLongDate(timeline.deadline) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {timeline ? timeline.note : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the credit card closure letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `Deadline (${CLOSURE_WORKING_DAYS} working days)`,
              timeline ? formatLongDate(timeline.deadline) : "—",
            ],
            ["Days of delay so far", timeline ? String(timeline.delayDays) : "—"],
            ["Delay compensation claimable", timeline ? money(timeline.penaltyAmount) : "—"],
            ["Outstanding balance", timeline ? money(timeline.outstandingDues) : "—"],
            [
              "Bureau should show closed by",
              timeline ? formatLongDate(timeline.bureauDeadline) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Letter preview</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.letter}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or financial advice. Send the request through a
        channel that leaves a record — the issuer&apos;s grievance email or a registered letter —
        and keep the acknowledgement.
      </p>
    </main>
  );
}
