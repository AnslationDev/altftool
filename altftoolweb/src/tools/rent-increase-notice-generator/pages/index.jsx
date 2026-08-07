"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, FileText, RotateCcw } from "lucide-react";

import {
  DEFAULT_REVISION_NOTICE_MONTHS,
  PROPERTY_USES,
  buildRentIncreaseNotice,
  computeRentRevision,
  formatLongDate,
  formatMoney,
  parseISODate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const todayISO = () => new Date().toISOString().slice(0, 10);

const addMonthsISO = (iso, months) => {
  const date = parseISODate(iso);
  if (!date) return iso;
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDay),
    ),
  )
    .toISOString()
    .slice(0, 10);
};

const buildDefaults = () => {
  const notice = todayISO();
  return {
    currentRent: "20000",
    mode: "percent",
    increasePercent: "8",
    newRentAmount: "22000",
    noticeDate: notice,
    effectiveDate: addMonthsISO(notice, 4),
    noticeMonths: String(DEFAULT_REVISION_NOTICE_MONTHS),
    propertyUse: "residential",
    depositHeld: "40000",
    reviseDeposit: true,
    landlordName: "",
    landlordAddress: "",
    tenantName: "",
    propertyAddress: "",
    agreementDate: "",
    reason: "",
    contact: "",
  };
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(buildDefaults);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const result = useMemo(
    () =>
      computeRentRevision({
        currentRent: toNumber(form.currentRent),
        mode: form.mode,
        increasePercent: toNumber(form.increasePercent),
        newRentAmount: toNumber(form.newRentAmount),
        noticeDate: form.noticeDate,
        effectiveDate: form.effectiveDate,
        noticeMonths: toNumber(form.noticeMonths),
        propertyUse: form.propertyUse,
        depositHeld: toNumber(form.depositHeld),
        reviseDeposit: form.reviseDeposit,
      }),
    [form],
  );

  const letter = useMemo(
    () =>
      buildRentIncreaseNotice(result, {
        landlordName: form.landlordName.trim() || "[Landlord name]",
        landlordAddress: form.landlordAddress,
        tenantName: form.tenantName.trim() || "[Tenant name]",
        propertyAddress: form.propertyAddress.trim() || "[Property address]",
        agreementDate: form.agreementDate,
        reason: form.reason,
        contact: form.contact,
      }),
    [result, form],
  );

  const invalid = Boolean(result.error);
  const nonCompliant = !invalid && result.compliant === false;

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

  const summary = invalid
    ? ""
    : [
        "Rent revision notice",
        `Current rent: ${formatMoney(result.currentRent)} per month`,
        `Revised rent: ${formatMoney(result.newRent)} per month`,
        `Increase: ${formatMoney(result.increaseAmount)} (${result.increasePercent.toFixed(1)}%)`,
        `Extra over 12 months: ${formatMoney(result.annualExtra)}`,
        `Notice date: ${formatLongDate(parseISODate(result.noticeDate))}`,
        `Effective from: ${formatLongDate(parseISODate(result.effectiveDate))}`,
        `Notice given: ${result.noticeDays} days (required ${result.requiredDays})`,
        `Revised deposit: ${formatMoney(result.newDeposit)}`,
      ].join("\n");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Tenancy notice
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Rent Increase Notice Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the revised rent, the deposit top-up and whether the effective date leaves the
          three months&rsquo; written notice the Model Tenancy Act, 2021 expects — then copy the
          finished letter.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Rent and dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-current">
              Current monthly rent (INR)
            </label>
            <input
              id="rin-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.currentRent}
              onChange={set("currentRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-mode">
              Express the revision as
            </label>
            <select
              id="rin-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.mode}
              onChange={set("mode")}
            >
              <option value="percent">A percentage increase</option>
              <option value="amount">A new rent amount</option>
            </select>
          </div>
          {form.mode === "percent" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rin-percent">
                Increase (% over current rent)
              </label>
              <input
                id="rin-percent"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={form.increasePercent}
                onChange={set("increasePercent")}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="rin-newrent">
                Revised monthly rent (INR)
              </label>
              <input
                id="rin-newrent"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={form.newRentAmount}
                onChange={set("newRentAmount")}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-notice-months">
              Agreed notice period (months)
            </label>
            <input
              id="rin-notice-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="12"
              step="1"
              value={form.noticeMonths}
              onChange={set("noticeMonths")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-notice-date">
              Date of this notice
            </label>
            <input
              id="rin-notice-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.noticeDate}
              onChange={set("noticeDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-effective-date">
              Revised rent effective from
            </label>
            <input
              id="rin-effective-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.effectiveDate}
              onChange={set("effectiveDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-use">
              Premises used as
            </label>
            <select
              id="rin-use"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.propertyUse}
              onChange={set("propertyUse")}
            >
              {PROPERTY_USES.map((use) => (
                <option key={use.id} value={use.id}>
                  {use.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-deposit">
              Security deposit held (INR)
            </label>
            <input
              id="rin-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.depositHeld}
              onChange={set("depositHeld")}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium"
          htmlFor="rin-revise-deposit"
        >
          <input
            id="rin-revise-deposit"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.reviseDeposit}
            onChange={set("reviseDeposit")}
          />
          Raise the deposit in proportion to the new rent
        </label>
      </section>

      {invalid ? (
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
              Revised monthly rent
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {invalid ? DASH : formatMoney(result.newRent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {invalid
                ? "Fix the highlighted input to see the revised figures."
                : `Up ${formatMoney(result.increaseAmount)} (${result.increasePercent.toFixed(1)}%) from ${formatMoney(result.currentRent)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the rent revision summary"
              className={GHOST_BTN}
              disabled={invalid}
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(buildDefaults());
                setCopied("");
              }}
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
            ["Increase per month", invalid ? DASH : formatMoney(result.increaseAmount)],
            ["Extra over twelve months", invalid ? DASH : formatMoney(result.annualExtra)],
            [
              "Effective from",
              invalid ? DASH : formatLongDate(parseISODate(result.effectiveDate)),
            ],
            [
              "Notice given",
              invalid ? DASH : `${result.noticeDays} days (needs ${result.requiredDays})`,
            ],
            [
              "Earliest compliant effective date",
              invalid ? DASH : formatLongDate(parseISODate(result.earliestEffectiveDate)),
            ],
            ["Revised security deposit", invalid ? DASH : formatMoney(result.newDeposit)],
            [
              "Deposit to be collected now",
              invalid ? DASH : formatMoney(result.depositTopUp),
            ],
            [
              "Statutory deposit ceiling",
              invalid
                ? DASH
                : `${formatMoney(result.depositCap)} (${result.depositCapMonths} months' rent)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!invalid && (
          <p
            aria-live="polite"
            role="status"
            className={`mt-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              result.compliant
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.compliant ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {result.compliant
                ? `The effective date leaves ${result.noticeDays} days of notice, meeting the ${result.noticeMonths}-month requirement.`
                : `The effective date is ${result.shortfallDays} day${result.shortfallDays === 1 ? "" : "s"} too early — move it to ${formatLongDate(parseISODate(result.earliestEffectiveDate))} or later.`}
            </span>
          </p>
        )}
        {!invalid && result.depositCapped && (
          <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The proportionate deposit was trimmed to the {result.depositCapMonths}-month ceiling for{" "}
            {result.propertyUse === "commercial" ? "non-residential" : "residential"} premises.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and premises</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-landlord">
              Landlord name
            </label>
            <input
              id="rin-landlord"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.landlordName}
              onChange={set("landlordName")}
              placeholder="R. Sharma"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-tenant">
              Tenant name
            </label>
            <input
              id="rin-tenant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.tenantName}
              onChange={set("tenantName")}
              placeholder="A. Verma"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rin-address">
              Premises address
            </label>
            <input
              id="rin-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.propertyAddress}
              onChange={set("propertyAddress")}
              placeholder="Flat 4B, Green Acres, Pune 411045"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-agreement">
              Tenancy agreement dated
            </label>
            <input
              id="rin-agreement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.agreementDate}
              onChange={set("agreementDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rin-contact">
              Contact for queries
            </label>
            <input
              id="rin-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contact}
              onChange={set("contact")}
              placeholder="98xxxxxx01 / name@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rin-reason">
              Reason for the revision (optional)
            </label>
            <input
              id="rin-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.reason}
              onChange={set("reason")}
              placeholder="Municipal tax and maintenance revision"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rin-landlord-address">
              Landlord address (optional)
            </label>
            <input
              id="rin-landlord-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.landlordAddress}
              onChange={set("landlordAddress")}
              placeholder="12 Palm Road, Pune 411001"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Notice letter</h2>
          <button
            type="button"
            onClick={() => copy(letter, "letter")}
            aria-label={
              nonCompliant
                ? "Notice period is non-compliant; fix the effective date before copying the letter"
                : "Copy the rent increase notice letter"
            }
            title={
              nonCompliant
                ? "This notice does not meet the required notice period. Adjust the effective date before copying."
                : undefined
            }
            className={GHOST_BTN}
            disabled={invalid || nonCompliant}
          >
            {copied === "letter" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {nonCompliant ? (
          <p className="mt-2 text-xs font-medium text-[var(--danger)]">
            Copying is disabled because this notice does not meet the required notice period —
            move the effective date to {formatLongDate(parseISODate(result.earliestEffectiveDate))}{" "}
            or later.
          </p>
        ) : null}
        <label className="sr-only" htmlFor="rin-letter">
          Generated notice letter
        </label>
        <textarea
          id="rin-letter"
          className={`mt-3 ${AREA_CLASS} min-h-[22rem] font-mono text-xs leading-5`}
          value={invalid ? "" : letter}
          readOnly
        />
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The Model Tenancy Act, 2021 is a template that each
        State adopts with its own changes, and a registered agreement may fix a different notice
        period or escalation clause — read your agreement and consult a lawyer for a disputed
        tenancy.
      </p>
    </main>
  );
}
