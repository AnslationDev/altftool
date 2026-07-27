"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, DoorOpen, RotateCcw } from "lucide-react";

import {
  HANDOVER_ITEMS,
  NOTICE_PRESETS,
  buildVacateNotice,
  computeVacateSettlement,
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

const shiftISO = (iso, days) => {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Date(date.getTime() + days * 86400000).toISOString().slice(0, 10);
};

const endOfMonthISO = (iso) => {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);
};

const buildDefaults = () => {
  const notice = todayISO();
  return {
    monthlyRent: "25000",
    noticeDate: notice,
    vacateDate: shiftISO(notice, 35),
    noticeDays: "30",
    rentPaidUpto: endOfMonthISO(notice),
    depositHeld: "50000",
    deductions: "0",
    pendingBills: "3000",
    propertyUse: "residential",
    tenantName: "",
    landlordName: "",
    propertyAddress: "",
    agreementDate: "",
    forwardingAddress: "",
    bankDetails: "",
    contact: "",
    reason: "",
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
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const result = useMemo(
    () =>
      computeVacateSettlement({
        monthlyRent: toNumber(form.monthlyRent),
        noticeDate: form.noticeDate,
        vacateDate: form.vacateDate,
        noticeDays: toNumber(form.noticeDays),
        rentPaidUpto: form.rentPaidUpto,
        depositHeld: toNumber(form.depositHeld),
        deductions: toNumber(form.deductions),
        pendingBills: toNumber(form.pendingBills),
        propertyUse: form.propertyUse,
      }),
    [form],
  );

  const letter = useMemo(
    () =>
      buildVacateNotice(result, {
        tenantName: form.tenantName.trim() || "[Tenant name]",
        landlordName: form.landlordName.trim() || "[Landlord name]",
        propertyAddress: form.propertyAddress.trim() || "[Property address]",
        agreementDate: form.agreementDate,
        forwardingAddress: form.forwardingAddress,
        bankDetails: form.bankDetails,
        contact: form.contact,
        reason: form.reason,
      }),
    [result, form],
  );

  const invalid = Boolean(result.error);

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
        "Notice to vacate — settlement",
        `Handover date: ${formatLongDate(parseISODate(result.vacateDate))}`,
        `Notice served: ${result.servedDays} of ${result.noticeDays} days`,
        `Rent to handover: ${formatMoney(result.rentDue)}`,
        `Rent in lieu of short notice: ${formatMoney(result.rentInLieu)}`,
        `Utility and maintenance dues: ${formatMoney(result.pendingBills)}`,
        `Agreed deductions: ${formatMoney(result.deductions)}`,
        `Deposit held: ${formatMoney(result.depositHeld)}`,
        result.netRefund >= 0
          ? `Refund due to tenant: ${formatMoney(result.netRefund)}`
          : `Balance payable by tenant: ${formatMoney(result.tenantOwes)}`,
      ].join("\n");

  const headline = invalid
    ? DASH
    : formatMoney(result.netRefund >= 0 ? result.netRefund : result.tenantOwes);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <DoorOpen className="h-4 w-4" aria-hidden="true" />
          Tenancy notice
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tenant Notice to Vacate Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your handover date, check it against the notice period in the agreement, and settle
          the final rent and security deposit in the same letter.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Tenancy and dates</h2>
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
              value={form.monthlyRent}
              onChange={set("monthlyRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-notice-days">
              Notice period in the agreement (days)
            </label>
            <input
              id="ntv-notice-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={form.noticeDays}
              onChange={set("noticeDays")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-notice-date">
              Date this notice is served
            </label>
            <input
              id="ntv-notice-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.noticeDate}
              onChange={set("noticeDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-vacate-date">
              Intended handover date
            </label>
            <input
              id="ntv-vacate-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.vacateDate}
              onChange={set("vacateDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-paid-upto">
              Rent paid up to
            </label>
            <input
              id="ntv-paid-upto"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.rentPaidUpto}
              onChange={set("rentPaidUpto")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-use">
              Premises used as
            </label>
            <select
              id="ntv-use"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.propertyUse}
              onChange={set("propertyUse")}
            >
              <option value="residential">Residential</option>
              <option value="commercial">Non-residential (shop, office)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {NOTICE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, noticeDays: String(preset.days) }));
                setCopied("");
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Deposit and dues</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-deposit">
              Security deposit held (INR)
            </label>
            <input
              id="ntv-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.depositHeld}
              onChange={set("depositHeld")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-bills">
              Utility and maintenance dues (INR)
            </label>
            <input
              id="ntv-bills"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.pendingBills}
              onChange={set("pendingBills")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ntv-deductions">
              Agreed damage or cleaning deductions (INR)
            </label>
            <input
              id="ntv-deductions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.deductions}
              onChange={set("deductions")}
            />
          </div>
        </div>
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
              {invalid || result.netRefund >= 0 ? "Deposit refund due to you" : "Balance you owe"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {invalid
                ? "Fix the highlighted input to see the settlement."
                : `On handover ${formatLongDate(parseISODate(result.vacateDate))}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the vacating settlement summary"
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
            [
              "Notice served",
              invalid ? DASH : `${result.servedDays} days (needs ${result.noticeDays})`,
            ],
            [
              "Earliest compliant handover",
              invalid ? DASH : formatLongDate(parseISODate(result.earliestVacateDate)),
            ],
            ["Daily rent used", invalid ? DASH : formatMoney(result.dailyRent)],
            [
              "Rent for days after paid-up date",
              invalid ? DASH : `${formatMoney(result.rentDue)} (${result.unpaidDays} days)`,
            ],
            [
              "Advance rent refundable",
              invalid ? DASH : `${formatMoney(result.advanceRentRefund)} (${result.advanceDays} days)`,
            ],
            ["Rent in lieu of short notice", invalid ? DASH : formatMoney(result.rentInLieu)],
            ["Utility and maintenance dues", invalid ? DASH : formatMoney(result.pendingBills)],
            ["Agreed deductions", invalid ? DASH : formatMoney(result.deductions)],
            ["Security deposit held", invalid ? DASH : formatMoney(result.depositHeld)],
            ["Total recoveries by landlord", invalid ? DASH : formatMoney(result.totalRecoveries)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!invalid && (
          <p
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
                ? `Your handover date gives ${result.servedDays} days of notice, meeting the ${result.noticeDays}-day requirement.`
                : `You are ${result.shortfallDays} day${result.shortfallDays === 1 ? "" : "s"} short — either hand over on ${formatLongDate(parseISODate(result.earliestVacateDate))} or offer ${formatMoney(result.rentInLieu)} as rent in lieu.`}
            </span>
          </p>
        )}
        {!invalid && result.depositAboveCap && (
          <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The deposit held exceeds the {result.depositCapMonths}-month ceiling of{" "}
            {formatMoney(result.depositCap)} that the Model Tenancy Act, 2021 sets for these
            premises.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and premises</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-tenant">
              Your name (tenant)
            </label>
            <input
              id="ntv-tenant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.tenantName}
              onChange={set("tenantName")}
              placeholder="A. Verma"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-landlord">
              Landlord name
            </label>
            <input
              id="ntv-landlord"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.landlordName}
              onChange={set("landlordName")}
              placeholder="R. Sharma"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ntv-address">
              Premises address
            </label>
            <input
              id="ntv-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.propertyAddress}
              onChange={set("propertyAddress")}
              placeholder="Flat 4B, Green Acres, Pune 411045"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-agreement">
              Tenancy agreement dated
            </label>
            <input
              id="ntv-agreement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.agreementDate}
              onChange={set("agreementDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ntv-contact">
              Your contact
            </label>
            <input
              id="ntv-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contact}
              onChange={set("contact")}
              placeholder="98xxxxxx01 / name@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ntv-forwarding">
              Forwarding address (optional)
            </label>
            <input
              id="ntv-forwarding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.forwardingAddress}
              onChange={set("forwardingAddress")}
              placeholder="22 Lake View, Pune 411004"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ntv-bank">
              Refund account details (optional)
            </label>
            <input
              id="ntv-bank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.bankDetails}
              onChange={set("bankDetails")}
              placeholder="Account name, bank, IFSC"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ntv-reason">
              Reason for vacating (optional)
            </label>
            <input
              id="ntv-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.reason}
              onChange={set("reason")}
              placeholder="Relocating for work"
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
            aria-label="Copy the notice to vacate letter"
            className={GHOST_BTN}
            disabled={invalid}
          >
            {copied === "letter" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        <label className="sr-only" htmlFor="ntv-letter">
          Generated notice to vacate
        </label>
        <textarea
          id="ntv-letter"
          className={`mt-3 ${AREA_CLASS} min-h-[24rem] font-mono text-xs leading-5`}
          value={invalid ? "" : letter}
          readOnly
        />
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Handover checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {HANDOVER_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Your registered tenancy agreement governs the notice
        period, lock-in and deposit terms; consult a lawyer if the landlord disputes the
        settlement.
      </p>
    </main>
  );
}
