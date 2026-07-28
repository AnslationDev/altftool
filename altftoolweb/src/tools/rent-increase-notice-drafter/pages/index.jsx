"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import {
  DELHI_CAP_PERCENT,
  DELHI_CAP_PERIOD_YEARS,
  MAHARASHTRA_ANNUAL_CAP_PERCENT,
  MAX_DEPOSIT_MONTHS,
  MAX_INCREASE_PERCENT,
  MIN_INCREASE_PERCENT,
  MTA_REVISION_NOTICE_MONTHS,
  REVISION_GROUNDS,
  REVISION_MODES,
  assessRentRevision,
  buildRentRevisionNotice,
  formatINR,
  formatLongDate,
  formatPercent,
  plural,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  landlordName: "Mr. Vivek Deshpande",
  landlordAddress: "9, Sadashiv Peth, Pune 411030",
  tenantName: "Sneha Kulkarni",
  tenantAddress: "Flat 302, Ashirwad Apartments, Aundh, Pune 411007",
  premisesAddress: "Flat 302, Ashirwad Apartments, Aundh, Pune 411007",
  agreementDate: "2024-09-01",
  noticeDate: "2026-07-28",
  effectiveDate: "2026-11-01",
  lastRevisionDate: "2025-08-01",
  currentRent: "25000",
  increasePercent: "8",
  newRentInput: "27000",
  depositMonths: "2",
  currentDeposit: "50000",
  groundId: "market",
  groundDetail: "",
  paymentDueDay: "5",
  paymentMethod: "by NEFT to the account already on record",
  phone: "98xxxxxx41",
  email: "vivek.deshpande@example.com",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [mode, setMode] = useState(REVISION_MODES.PERCENT);
  const [requireDepositTopUp, setRequireDepositTopUp] = useState(true);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const assessment = useMemo(
    () =>
      assessRentRevision({
        currentRent: Number(form.currentRent),
        mode,
        increasePercent: Number(form.increasePercent),
        newRentInput: Number(form.newRentInput),
        noticeDateISO: form.noticeDate,
        effectiveDateISO: form.effectiveDate,
        lastRevisionDateISO: form.lastRevisionDate,
        depositMonths: Number(form.depositMonths),
        currentDeposit: Number(form.currentDeposit),
      }),
    [form, mode],
  );

  const notice = useMemo(
    () =>
      buildRentRevisionNotice({
        landlordName: form.landlordName,
        landlordAddress: form.landlordAddress,
        tenantName: form.tenantName,
        tenantAddress: form.tenantAddress,
        premisesAddress: form.premisesAddress,
        agreementDateISO: form.agreementDate,
        noticeDateISO: form.noticeDate,
        effectiveDateISO: form.effectiveDate,
        groundId: form.groundId,
        groundDetail: form.groundDetail,
        paymentDueDay: Number(form.paymentDueDay),
        paymentMethod: form.paymentMethod,
        requireDepositTopUp,
        phone: form.phone,
        email: form.email,
        assessment,
      }),
    [form, requireDepositTopUp, assessment],
  );

  const error = assessment.error || notice.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setMode(REVISION_MODES.PERCENT);
    setRequireDepositTopUp(true);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Rent Increase Notice Drafter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the new rent as a percentage or a flat figure. The tool works out the annual impact on
          the tenant, annualises the rise since the rent was last fixed, checks the{" "}
          {MTA_REVISION_NOTICE_MONTHS}-month notice rule and computes any deposit top-up.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The revision</h2>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Set the new rent by</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              [REVISION_MODES.PERCENT, "Percentage increase"],
              [REVISION_MODES.AMOUNT, "New rent amount"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`rr-mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold ${
                  mode === value ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`rr-mode-${value}`}
                  type="radio"
                  name="rr-mode"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rr-current-rent">
              Present monthly rent
            </label>
            <input id="rr-current-rent" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.currentRent} onChange={set("currentRent")} />
          </div>
          {mode === REVISION_MODES.PERCENT ? (
            <div>
              <label className={LABEL} htmlFor="rr-percent">
                Increase ({MIN_INCREASE_PERCENT}% to {MAX_INCREASE_PERCENT}%)
              </label>
              <input
                id="rr-percent"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min={MIN_INCREASE_PERCENT}
                max={MAX_INCREASE_PERCENT}
                step="0.5"
                value={form.increasePercent}
                onChange={set("increasePercent")}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL} htmlFor="rr-new-rent">
                Revised monthly rent
              </label>
              <input id="rr-new-rent" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.newRentInput} onChange={set("newRentInput")} />
            </div>
          )}
          <div>
            <label className={LABEL} htmlFor="rr-notice-date">
              Date of this notice
            </label>
            <input id="rr-notice-date" className={INPUT} type="date" value={form.noticeDate} onChange={set("noticeDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-effective-date">
              Revised rent effective from
            </label>
            <input id="rr-effective-date" className={INPUT} type="date" value={form.effectiveDate} onChange={set("effectiveDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-last-revision">
              Rent last fixed on
            </label>
            <input id="rr-last-revision" className={INPUT} type="date" value={form.lastRevisionDate} onChange={set("lastRevisionDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-ground">
              Ground for the revision
            </label>
            <select id="rr-ground" className={INPUT} value={form.groundId} onChange={set("groundId")}>
              {REVISION_GROUNDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-deposit-months">
              Deposit in the agreement (months of rent)
            </label>
            <input
              id="rr-deposit-months"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_DEPOSIT_MONTHS}
              step="0.5"
              value={form.depositMonths}
              onChange={set("depositMonths")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-current-deposit">
              Deposit currently held
            </label>
            <input id="rr-current-deposit" className={INPUT} type="number" inputMode="decimal" min="0" step="1000" value={form.currentDeposit} onChange={set("currentDeposit")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rr-ground-detail">
              {form.groundId === "other" ? "Describe the ground" : "Anything to add (optional)"}
            </label>
            <textarea id="rr-ground-detail" rows={2} className={AREA} value={form.groundDetail} onChange={set("groundDetail")} />
          </div>
        </div>

        {mode === REVISION_MODES.PERCENT ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {[5, 8, 10, 12].map((value) => (
              <button key={value} type="button" className={CHIP} onClick={() => setForm((prev) => ({ ...prev, increasePercent: String(value) }))}>
                {value}%
              </button>
            ))}
          </div>
        ) : null}

        <label
          htmlFor="rr-topup"
          className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
        >
          <input
            id="rr-topup"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={requireDepositTopUp}
            onChange={(event) => setRequireDepositTopUp(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold">Ask for a matching deposit top-up</span>
            <span className="block text-xs text-[var(--muted-foreground)]">
              Untick and the notice says the existing deposit stays as it is.
            </span>
          </span>
        </label>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Revised monthly rent
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : formatINR(assessment.newRent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the amounts above."
                : `${assessment.isReduction ? "Down" : "Up"} ${formatINR(Math.abs(assessment.increaseAmount))} (${formatPercent(Math.abs(assessment.increasePercent))}) from ${formatINR(assessment.currentRent)}, effective ${formatLongDate(form.effectiveDate)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the rent revision summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Rent revision",
                        `Present rent: ${formatINR(assessment.currentRent)}`,
                        `Revised rent: ${formatINR(assessment.newRent)}`,
                        `Change: ${formatINR(assessment.increaseAmount)} (${formatPercent(assessment.increasePercent)})`,
                        `Effective from: ${formatLongDate(form.effectiveDate)}`,
                        `Change in annual outgo: ${formatINR(assessment.annualExtra)}`,
                        `Notice given: ${plural(assessment.noticeDaysGiven, "day")}`,
                        `Deposit top-up: ${formatINR(assessment.depositTopUp)}`,
                      ].join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Change per month", error ? DASH : formatINR(assessment.increaseAmount)],
            ["Change over twelve months", error ? DASH : formatINR(assessment.annualExtra)],
            [
              "Annualised rate since the rent was last fixed",
              error ? DASH : assessment.annualisedPercent === null ? "Enter the last revision date" : `${formatPercent(assessment.annualisedPercent)} a year over ${assessment.yearsSinceRevision.toFixed(1)} years`,
            ],
            ["Notice given before the effective date", error ? DASH : plural(assessment.noticeDaysGiven, "day")],
            [
              `Model Tenancy Act ${MTA_REVISION_NOTICE_MONTHS}-month notice`,
              error ? DASH : assessment.mtaCompliant ? "Met" : `Short by ${plural(assessment.mtaShortfallDays, "day")} — earliest ${formatLongDate(assessment.mtaDueISO)}`,
            ],
            ["Deposit required at the new rent", error ? DASH : formatINR(assessment.newDepositRequired)],
            ["Deposit top-up", error ? DASH : formatINR(assessment.depositTopUp)],
            [
              `Maharashtra Rent Control cap (${MAHARASHTRA_ANNUAL_CAP_PERCENT}% a year)`,
              error ? DASH : assessment.maharashtraCapRent === null ? "Enter the last revision date" : `${formatINR(assessment.maharashtraCapRent)}${assessment.overMaharashtraCap ? " — your figure is higher" : ""}`,
            ],
            [
              `Delhi Rent Control cap (${DELHI_CAP_PERCENT}% every ${DELHI_CAP_PERIOD_YEARS} years)`,
              error ? DASH : assessment.delhiCapRent === null ? "Enter the last revision date" : `${formatINR(assessment.delhiCapRent)}${assessment.overDelhiCap ? " — your figure is higher" : ""}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          The two rent-control figures are comparisons, not limits on your tenancy. They bind only
          premises actually governed by those Acts — most market-rate tenancies signed today are
          outside them, and the agreement&apos;s own escalation clause governs instead.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties, premises and payment</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rr-landlord">
              Landlord&apos;s name (you)
            </label>
            <input id="rr-landlord" className={INPUT} value={form.landlordName} onChange={set("landlordName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-tenant">
              Tenant&apos;s name
            </label>
            <input id="rr-tenant" className={INPUT} value={form.tenantName} onChange={set("tenantName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-agreement-date">
              Rent agreement date
            </label>
            <input id="rr-agreement-date" className={INPUT} type="date" value={form.agreementDate} onChange={set("agreementDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-due-day">
              Rent due on day of month (1 to 28)
            </label>
            <input id="rr-due-day" className={INPUT} type="number" inputMode="numeric" min="1" max="28" step="1" value={form.paymentDueDay} onChange={set("paymentDueDay")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rr-payment-method">
              How the rent should be paid
            </label>
            <input id="rr-payment-method" className={INPUT} value={form.paymentMethod} onChange={set("paymentMethod")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-phone">
              Phone
            </label>
            <input id="rr-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-email">
              Email
            </label>
            <input id="rr-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="rr-premises">
              Address of the premises
            </label>
            <textarea id="rr-premises" rows={2} className={AREA} value={form.premisesAddress} onChange={set("premisesAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-tenant-address">
              Address to send the notice to
            </label>
            <textarea id="rr-tenant-address" rows={2} className={AREA} value={form.tenantAddress} onChange={set("tenantAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-landlord-address">
              Your address
            </label>
            <textarea id="rr-landlord-address" rows={2} className={AREA} value={form.landlordAddress} onChange={set("landlordAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your rent revision notice</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the rent revision notice"
            onClick={() => copy(notice.error ? "" : notice.body, "notice")}
          >
            {copied === "notice" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "notice" ? "Copied!" : "Copy notice"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{notice.wordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {notice.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Your tenancy agreement governs whether and by how much
        the rent can be revised mid-term, and rent control law in your state may restrict it
        further. Serve the notice by a method that gives you proof of delivery, since notice periods
        run from receipt.
      </p>
    </main>
  );
}
