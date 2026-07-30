"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  COMPANY_ADDITIONAL_FEE_SLABS,
  COMPANY_NORMAL_FEE_SLABS,
  ENTITY_TYPES,
  LLP_ADDITIONAL_FEE_SLABS,
  LLP_BEYOND_360,
  LLP_NORMAL_FEE_SLABS,
  buildRocFilingPlan,
  formatIndianDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "text-xs text-[var(--muted-foreground)]";
const CARD_CLASS = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STATUS_TEXT = {
  overdue: "text-[var(--danger)]",
  "filed-late": "text-[var(--danger)]",
  "filed-on-time": "text-[var(--success)]",
  upcoming: "text-[var(--muted-foreground)]",
};

const COMPANY_FORM_FIELDS = [
  { key: "adt1", label: "ADT-1 filed on" },
  { key: "aoc4", label: "AOC-4 filed on" },
  { key: "mgt7", label: "MGT-7 / MGT-7A filed on" },
];
const LLP_FORM_FIELDS = [
  { key: "form11", label: "Form 11 filed on" },
  { key: "form8", label: "Form 8 filed on" },
];

const DEFAULTS = {
  entityType: "private",
  incorporationDate: "2019-07-15",
  financialYearEnd: "2025-03-31",
  previousAgmDate: "",
  agmHeldDate: "",
  paidUpCapital: "1000000",
  contribution: "500000",
  turnover: "3000000",
  asOnDate: "2026-07-29",
  dinKycPending: false,
  adt1: "2025-10-14",
  aoc4: "2025-12-10",
  mgt7: "",
  form11: "",
  form8: "",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const isLlp = form.entityType === "llp";
  const formFields = isLlp ? LLP_FORM_FIELDS : COMPANY_FORM_FIELDS;

  const plan = useMemo(
    () =>
      buildRocFilingPlan({
        entityType: form.entityType,
        incorporationDate: form.incorporationDate,
        financialYearEnd: form.financialYearEnd,
        agmHeldDate: form.agmHeldDate,
        previousAgmDate: form.previousAgmDate,
        paidUpCapital: toNumber(form.paidUpCapital),
        contribution: toNumber(form.contribution),
        turnover: toNumber(form.turnover),
        asOnDate: form.asOnDate,
        dinKycPending: form.dinKycPending,
        filings: {
          adt1: form.adt1,
          aoc4: form.aoc4,
          mgt7: form.mgt7,
          form11: form.form11,
          form8: form.form8,
        },
      }),
    [form],
  );

  const error = plan.error || null;
  const ok = !error;

  const copyText = () => {
    if (!ok) return "";
    const lines = [
      `MCA / ROC filing calendar — ${plan.entityLabel}`,
      `Incorporated ${formatIndianDate(plan.incorporationDate)} · financial year ended ${formatIndianDate(plan.financialYearEnd)}`,
      `Additional fee accrued to ${formatIndianDate(plan.asOnDate)}`,
      "",
    ];
    if (plan.agm && plan.agm.lastDate) {
      lines.push(
        `${plan.agm.required ? "Last permissible AGM" : "Deemed AGM date"}: ${formatIndianDate(plan.agm.lastDate)}`,
        `  ${plan.agm.basis}`,
        "",
      );
    }
    plan.rows.forEach((row) => {
      lines.push(
        `${row.form} — due ${formatIndianDate(row.dueDate)} — ${row.statusLabel}${row.daysLate ? ` by ${row.daysLate} day(s)` : ""}`,
        `  Normal fee ${INR.format(row.normalFee)} + additional fee ${INR.format(row.additionalFee)} = ${INR.format(row.totalFee)}`,
        `  ${row.feeWorkingOut}`,
        `  Due date rule: ${row.dueBasis}`,
        `  Fee rule: ${row.feeRule}`,
      );
    });
    lines.push(
      "",
      `DIR-3 KYC Web — ${plan.dir3Kyc.dueDate ? `next due ${formatIndianDate(plan.dir3Kyc.dueDate)}` : "fee payable on filing"} — ${INR.format(plan.dir3Kyc.totalFee)}`,
      `  ${plan.dir3Kyc.dueBasis}`,
      "",
      `Total additional fee: ${INR.format(plan.totals.additionalFee)}`,
      `Total payable including normal fees: ${INR.format(plan.totals.totalPayable)}`,
      "",
      `Fee rules read on ${formatIndianDate(plan.stamp.readOn)}. ${plan.stamp.companyFeeAmendment}. ${plan.stamp.llpFeeAmendment}.`,
    );
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const text = copyText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6">
      {/* ------------------------------------------------ inputs */}
      <section className={`grid gap-4 ${CARD_CLASS}`}>
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <CalendarClock aria-hidden="true" className="h-5 w-5 text-[var(--primary)]" />
          Entity and financial year
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="roc-type">
              Entity type
            </label>
            <select
              className={INPUT_CLASS}
              id="roc-type"
              onChange={set("entityType")}
              value={form.entityType}
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="roc-inc">
              Date of incorporation
            </label>
            <input
              className={INPUT_CLASS}
              id="roc-inc"
              onChange={set("incorporationDate")}
              type="date"
              value={form.incorporationDate}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="roc-fy">
              Financial year end
            </label>
            <input
              className={INPUT_CLASS}
              id="roc-fy"
              onChange={set("financialYearEnd")}
              type="date"
              value={form.financialYearEnd}
            />
            <p className={HINT_CLASS}>
              Section 2(41) fixes this at 31 March. A company&apos;s first financial year closes on 31 March of
              the calendar year after the year it was incorporated.
            </p>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="roc-ason">
              Accrue additional fee to
            </label>
            <input
              className={INPUT_CLASS}
              id="roc-ason"
              onChange={set("asOnDate")}
              type="date"
              value={form.asOnDate}
            />
            <p className={HINT_CLASS}>
              Anything still unfiled accrues additional fee up to this date.
            </p>
          </div>

          {!isLlp ? (
            <>
              <div className="grid gap-1.5">
                <label className={LABEL_CLASS} htmlFor="roc-capital">
                  Nominal / paid-up share capital (Rs)
                </label>
                <input
                  className={INPUT_CLASS}
                  id="roc-capital"
                  inputMode="numeric"
                  onChange={set("paidUpCapital")}
                  type="text"
                  value={form.paidUpCapital}
                />
                <p className={HINT_CLASS}>Sets the normal filing fee. Enter 0 if there is no share capital.</p>
              </div>

              <div className="grid gap-1.5">
                <label className={LABEL_CLASS} htmlFor="roc-agm-held">
                  AGM actually held on (optional)
                </label>
                <input
                  className={INPUT_CLASS}
                  id="roc-agm-held"
                  onChange={set("agmHeldDate")}
                  type="date"
                  value={form.agmHeldDate}
                />
                <p className={HINT_CLASS}>
                  Sections 137, 92 and 139 run from the meeting actually held. Leave blank to use the last
                  permissible AGM date.
                </p>
              </div>

              <div className="grid gap-1.5">
                <label className={LABEL_CLASS} htmlFor="roc-prev-agm">
                  Previous AGM held on (optional)
                </label>
                <input
                  className={INPUT_CLASS}
                  id="roc-prev-agm"
                  onChange={set("previousAgmDate")}
                  type="date"
                  value={form.previousAgmDate}
                />
                <p className={HINT_CLASS}>Applies the 15-month gap limit in section 96(1).</p>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-1.5">
                <label className={LABEL_CLASS} htmlFor="roc-contribution">
                  Total contribution (Rs)
                </label>
                <input
                  className={INPUT_CLASS}
                  id="roc-contribution"
                  inputMode="numeric"
                  onChange={set("contribution")}
                  type="text"
                  value={form.contribution}
                />
              </div>

              <div className="grid gap-1.5">
                <label className={LABEL_CLASS} htmlFor="roc-turnover">
                  Turnover of the year (Rs)
                </label>
                <input
                  className={INPUT_CLASS}
                  id="roc-turnover"
                  inputMode="numeric"
                  onChange={set("turnover")}
                  type="text"
                  value={form.turnover}
                />
                <p className={HINT_CLASS}>
                  Contribution and turnover together decide small-LLP status, which halves every
                  additional-fee multiple.
                </p>
              </div>
            </>
          )}
        </div>

        <fieldset className="grid gap-3 rounded-md border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
            Dates the forms were filed
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {formFields.map((field) => (
              <div className="grid gap-1.5" key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`roc-${field.key}`}>
                  {field.label}
                </label>
                <input
                  className={INPUT_CLASS}
                  id={`roc-${field.key}`}
                  onChange={set(field.key)}
                  type="date"
                  value={form[field.key]}
                />
              </div>
            ))}
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="roc-kyc"
          >
            <input
              checked={form.dinKycPending}
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              id="roc-kyc"
              onChange={set("dinKycPending")}
              type="checkbox"
            />
            DIR-3 KYC is overdue or the DIN is deactivated
          </label>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button
            aria-label="Copy the full ROC filing calendar and fee working to the clipboard"
            className={PRIMARY_BTN}
            onClick={handleCopy}
            type="button"
          >
            {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button aria-label="Reset all inputs" className={GHOST_BTN} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      {/* ------------------------------------------------ result */}
      <section className={`grid gap-4 ${CARD_CLASS}`}>
        {error ? (
          <p
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div>
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
            Additional fee accrued{ok ? ` to ${formatIndianDate(plan.asOnDate)}` : ""}
          </p>
          <p className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            {ok ? INR.format(plan.totals.additionalFee) : DASH}
          </p>
          <p className={HINT_CLASS}>
            {ok
              ? `${plan.totals.lateCount} of ${plan.totals.formCount} filings past their due date. Each form uses its own slab, shown below.`
              : "Fix the input above to see the figures."}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total payable including normal fees
            </dt>
            <dd className="text-lg font-bold text-[var(--foreground)]">
              {ok ? INR.format(plan.totals.totalPayable) : DASH}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && plan.agm && plan.agm.required ? "Last permissible AGM" : "Deemed AGM date"}
            </dt>
            <dd className="text-lg font-bold text-[var(--foreground)]">
              {ok && plan.agm && plan.agm.lastDate ? formatIndianDate(plan.agm.lastDate) : DASH}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              First financial year closes
            </dt>
            <dd className="text-lg font-bold text-[var(--foreground)]">
              {ok ? formatIndianDate(plan.firstFinancialYearEnd) : DASH}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && isLlp ? "Small LLP under s.2(1)(ta)" : "Year being filed"}
            </dt>
            <dd className="text-lg font-bold text-[var(--foreground)]">
              {!ok
                ? DASH
                : isLlp
                  ? plan.smallLlp
                    ? "Yes"
                    : "No"
                  : plan.isFirstFinancialYear
                    ? "First financial year"
                    : "A later financial year"}
            </dd>
          </div>
        </dl>

        {ok && plan.agm && plan.agm.basis ? (
          <p className={HINT_CLASS}>{plan.agm.basis}</p>
        ) : null}
        {ok && plan.agm && plan.agm.note ? <p className={HINT_CLASS}>{plan.agm.note}</p> : null}
        {ok && plan.agm && plan.agm.heldLate ? (
          <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            The AGM was held {NUM.format(plan.agm.daysLate)} day
            {plan.agm.daysLate === 1 ? "" : "s"} after the last date allowed by section 96(1).
          </p>
        ) : null}
        {ok && isLlp && plan.smallLlpBasis ? <p className={HINT_CLASS}>{plan.smallLlpBasis}</p> : null}
      </section>

      {/* ------------------------------------------------ timeline */}
      <section className="grid gap-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Timeline and fee per form</h2>

        {ok ? (
          <>
            {plan.rows.map((row) => (
              <article className={`grid gap-3 ${CARD_CLASS}`} key={row.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {row.form}
                    <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                      {row.title}
                    </span>
                  </h3>
                  <p className={`text-sm font-semibold ${STATUS_TEXT[row.status]}`}>
                    {row.statusLabel}
                    {row.daysLate ? ` by ${NUM.format(row.daysLate)} day${row.daysLate === 1 ? "" : "s"}` : ""}
                  </p>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Due date
                    </dt>
                    <dd className="text-lg font-bold text-[var(--foreground)]">
                      {formatIndianDate(row.dueDate)}
                    </dd>
                  </div>
                  <div className="grid gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {row.filedDate ? "Filed on" : "Fee accrued to"}
                    </dt>
                    <dd className="text-lg font-bold text-[var(--foreground)]">
                      {row.filedDate
                        ? formatIndianDate(row.filedDate)
                        : row.accruedTo
                          ? formatIndianDate(row.accruedTo)
                          : "Not filed yet"}
                    </dd>
                  </div>
                  <div className="grid gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Normal filing fee
                    </dt>
                    <dd className="text-lg font-bold text-[var(--foreground)]">
                      {INR.format(row.normalFee)}
                    </dd>
                  </div>
                  <div className="grid gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Additional fee
                    </dt>
                    <dd
                      className={`text-lg font-bold ${row.additionalFee ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}
                    >
                      {INR.format(row.additionalFee)}
                    </dd>
                  </div>
                </dl>

                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Total on filing {INR.format(row.totalFee)}
                  <span className="font-normal text-[var(--muted-foreground)]">
                    {" "}· {row.feeWorkingOut}
                  </span>
                </p>
                <p className={HINT_CLASS}>
                  <span className="font-semibold">Due date rule.</span> {row.dueBasis}
                </p>
                <p className={HINT_CLASS}>
                  <span className="font-semibold">Fee rule.</span> {row.feeRule}
                </p>
                {row.normalFeeSlab ? (
                  <p className={HINT_CLASS}>Normal-fee slab used: {row.normalFeeSlab}.</p>
                ) : null}
              </article>
            ))}

            <article className={`grid gap-3 ${CARD_CLASS}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {plan.dir3Kyc.form}
                  <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                    {plan.dir3Kyc.title}
                  </span>
                </h3>
                <p className={`text-sm font-semibold ${STATUS_TEXT[plan.dir3Kyc.status]}`}>
                  {plan.dir3Kyc.statusLabel}
                </p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Next routine due date
                  </dt>
                  <dd className="text-lg font-bold text-[var(--foreground)]">
                    {plan.dir3Kyc.dueDate ? formatIndianDate(plan.dir3Kyc.dueDate) : "Already past"}
                  </dd>
                </div>
                <div className="grid gap-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Fee per DIN
                  </dt>
                  <dd
                    className={`text-lg font-bold ${plan.dir3Kyc.totalFee ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}
                  >
                    {INR.format(plan.dir3Kyc.totalFee)}
                  </dd>
                </div>
              </dl>
              <p className={HINT_CLASS}>
                <span className="font-semibold">Due date rule.</span> {plan.dir3Kyc.dueBasis}
              </p>
              <p className={HINT_CLASS}>
                <span className="font-semibold">Fee rule.</span> {plan.dir3Kyc.feeRule}
              </p>
              <p className={HINT_CLASS}>{plan.dir3Kyc.changeRule}</p>
            </article>
          </>
        ) : (
          <article className={CARD_CLASS}>
            <p className="text-sm text-[var(--muted-foreground)]">
              Due dates and fees are blank until the inputs above parse. {DASH}
            </p>
          </article>
        )}
      </section>

      {/* ------------------------------------------------ slab reference */}
      <section className={`grid gap-3 ${CARD_CLASS}`}>
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          {isLlp ? "LLP additional-fee slabs" : "Fee tables used"}
        </h2>
        <div className="-mx-1 overflow-x-auto px-1">
          {isLlp ? (
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">
                LLP Form 8 and Form 11 additional-fee multiples by length of delay
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Length of delay
                  </th>
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Small LLP
                  </th>
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Any other LLP
                  </th>
                </tr>
              </thead>
              <tbody>
                {LLP_ADDITIONAL_FEE_SLABS.map((slab) => (
                  <tr className="border-b border-[var(--border)]" key={slab.label}>
                    <td className="px-2 py-2 text-[var(--foreground)]">{slab.label}</td>
                    <td className="px-2 py-2 text-[var(--foreground)]">{slab.small}x normal fee</td>
                    <td className="px-2 py-2 text-[var(--foreground)]">{slab.other}x normal fee</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-2 py-2 text-[var(--foreground)]">Beyond 360 days</td>
                  <td className="px-2 py-2 text-[var(--foreground)]">
                    {LLP_BEYOND_360.small.times}x + Rs {LLP_BEYOND_360.small.perDay}/day past 360
                  </td>
                  <td className="px-2 py-2 text-[var(--foreground)]">
                    {LLP_BEYOND_360.other.times}x + Rs {LLP_BEYOND_360.other.perDay}/day past 360
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">
                Company normal filing fee by nominal share capital and the general additional-fee slabs
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Nominal share capital
                  </th>
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Normal fee
                  </th>
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Delay (ADT-1 slabs)
                  </th>
                  <th className="px-2 py-2 font-semibold" scope="col">
                    Multiple
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPANY_NORMAL_FEE_SLABS.map((slab, index) => {
                  const addl = COMPANY_ADDITIONAL_FEE_SLABS[index];
                  return (
                    <tr className="border-b border-[var(--border)]" key={slab.label}>
                      <td className="px-2 py-2 text-[var(--foreground)]">{slab.label}</td>
                      <td className="px-2 py-2 text-[var(--foreground)]">Rs {slab.fee}</td>
                      <td className="px-2 py-2 text-[var(--foreground)]">{addl ? addl.label : ""}</td>
                      <td className="px-2 py-2 text-[var(--foreground)]">
                        {addl ? `${addl.times}x normal fee` : ""}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="px-2 py-2 text-[var(--muted-foreground)]" colSpan={2}>
                    Company without share capital: Rs 200
                  </td>
                  <td className="px-2 py-2 text-[var(--foreground)]">
                    {COMPANY_ADDITIONAL_FEE_SLABS[COMPANY_ADDITIONAL_FEE_SLABS.length - 1].label}
                  </td>
                  <td className="px-2 py-2 text-[var(--foreground)]">
                    {COMPANY_ADDITIONAL_FEE_SLABS[COMPANY_ADDITIONAL_FEE_SLABS.length - 1].times}x normal fee
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        {!isLlp ? (
          <p className={HINT_CLASS}>
            AOC-4 and MGT-7 / MGT-7A do not use these multiples. They carry a flat Rs 100 per day of delay with
            no cap, from 1 July 2018.
          </p>
        ) : (
          <p className={HINT_CLASS}>
            LLP normal fee runs from Rs {LLP_NORMAL_FEE_SLABS[0].fee} for contribution up to Rs 1,00,000 to Rs{" "}
            {LLP_NORMAL_FEE_SLABS[LLP_NORMAL_FEE_SLABS.length - 1].fee} above Rs 1,00,00,000.
          </p>
        )}
      </section>

      {/* ------------------------------------------------ notes and stamp */}
      {ok ? (
        <section className={`grid gap-2 ${CARD_CLASS}`}>
          <h2 className="text-lg font-bold text-[var(--foreground)]">How these dates were counted</h2>
          <p className={HINT_CLASS}>{plan.stamp.dayCount}</p>
          {plan.notes.map((note) => (
            <p className={HINT_CLASS} key={note}>
              {note}
            </p>
          ))}
          <p className={HINT_CLASS}>
            Fee rules read on {formatIndianDate(plan.stamp.readOn)}. Company fees reflect the{" "}
            {plan.stamp.companyFeeAmendment}. LLP fees reflect the {plan.stamp.llpFeeAmendment}.
          </p>
        </section>
      ) : null}
    </div>
  );
}
