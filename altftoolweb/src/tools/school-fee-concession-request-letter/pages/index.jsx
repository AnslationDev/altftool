"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, School } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CONCESSION_GROUNDS,
  CONCESSION_MODES,
  FEE_LABELS,
  MAX_CONCESSION_PERCENT,
  MAX_INSTALMENTS,
  MAX_INTERVAL_MONTHS,
  REQUEST_KINDS,
  RTE_RESERVED_SHARE_PERCENT,
  buildFeeConcessionLetter,
  buildInstalmentPlan,
  computeAffordability,
  computeConcession,
  computeFeeTotal,
  formatINR,
  formatLongDate,
  formatPercent,
  groundById,
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

const REQUEST_KIND_OPTIONS = [
  [REQUEST_KINDS.BOTH, "Concession and instalments"],
  [REQUEST_KINDS.CONCESSION, "Concession only"],
  [REQUEST_KINDS.INSTALMENTS, "Instalments only"],
];

const DEFAULTS = {
  parentName: "Sunita Bhatt",
  studentName: "Aditya Bhatt",
  admissionNumber: "2021/0782",
  className: "VIII",
  section: "C",
  academicYear: "2026-27",
  schoolName: "Delhi Public School, Sector 45",
  schoolAddress: "Sector 45, Gurugram, Haryana 122003",
  addressee: "",
  letterDate: "2026-07-28",
  tuition: "84000",
  transport: "24000",
  activity: "6000",
  exam: "3000",
  other: "2000",
  arrears: "0",
  concessionPercent: "30",
  concessionAmount: "35700",
  instalments: "4",
  intervalMonths: "3",
  firstDue: "2026-08-05",
  monthlyIncome: "40000",
  groundId: "job-loss",
  groundDetail: "",
  occupation: "a logistics supervisor until my role was made redundant in May",
  siblingDetail: "",
  phone: "99xxxxxx06",
  email: "sunita.bhatt@example.com",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [requestKind, setRequestKind] = useState(REQUEST_KINDS.BOTH);
  const [concessionMode, setConcessionMode] = useState(CONCESSION_MODES.PERCENT);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const ground = groundById(form.groundId);
  const wantsConcession = requestKind !== REQUEST_KINDS.INSTALMENTS;
  const wantsInstalments = requestKind !== REQUEST_KINDS.CONCESSION;

  const fee = useMemo(
    () =>
      computeFeeTotal({
        tuition: Number(form.tuition),
        transport: Number(form.transport),
        activity: Number(form.activity),
        exam: Number(form.exam),
        other: Number(form.other),
      }),
    [form.tuition, form.transport, form.activity, form.exam, form.other],
  );

  const concession = useMemo(() => {
    if (fee.error) return { error: fee.error };
    return computeConcession({
      total: fee.total,
      mode: wantsConcession ? concessionMode : CONCESSION_MODES.PERCENT,
      concessionPercent: wantsConcession ? Number(form.concessionPercent) : 0,
      concessionAmount: Number(form.concessionAmount),
      arrears: Number(form.arrears),
    });
  }, [fee, wantsConcession, concessionMode, form.concessionPercent, form.concessionAmount, form.arrears]);

  const plan = useMemo(() => {
    if (concession.error) return { error: concession.error };
    return buildInstalmentPlan({
      payable: concession.payable,
      instalments: Number(form.instalments),
      firstDueISO: form.firstDue,
      intervalMonths: Number(form.intervalMonths),
    });
  }, [concession, form.instalments, form.firstDue, form.intervalMonths]);

  const affordability = useMemo(() => {
    if (concession.error) return { error: concession.error };
    return computeAffordability({ payable: concession.payable, monthlyIncome: Number(form.monthlyIncome) });
  }, [concession, form.monthlyIncome]);

  const letter = useMemo(
    () =>
      buildFeeConcessionLetter({
        parentName: form.parentName,
        studentName: form.studentName,
        admissionNumber: form.admissionNumber,
        className: form.className,
        section: form.section,
        academicYear: form.academicYear,
        schoolName: form.schoolName,
        schoolAddress: form.schoolAddress,
        addressee: form.addressee,
        letterDateISO: form.letterDate,
        requestKind,
        groundId: form.groundId,
        groundDetail: form.groundDetail,
        occupation: form.occupation,
        siblingDetail: form.siblingDetail,
        fee,
        concession,
        plan,
        affordability,
        phone: form.phone,
        email: form.email,
      }),
    [form, requestKind, fee, concession, plan, affordability],
  );

  const error =
    fee.error ||
    concession.error ||
    (wantsInstalments ? plan.error : "") ||
    affordability.error ||
    letter.error ||
    "";

  const reset = () => {
    if (!window.confirm("Reset all fields? This will discard everything you've entered, including any typed circumstances.")) {
      return;
    }
    setForm(DEFAULTS);
    setRequestKind(REQUEST_KINDS.BOTH);
    setConcessionMode(CONCESSION_MODES.PERCENT);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          School Fee Concession Request Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the fee heads and the relief you need. The tool works out the concession, what is
          left to pay, a dated instalment schedule that adds back exactly, and the fee as a share of
          your household income — then writes the request without pleading or exaggeration.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-base font-semibold">What are you asking for?</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {REQUEST_KIND_OPTIONS.map(([value, label]) => (
              <label
                key={value}
                htmlFor={`fc-kind-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold ${
                  requestKind === value ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`fc-kind-${value}`}
                  type="radio"
                  name="fc-kind"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={requestKind === value}
                  onChange={() => setRequestKind(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fc-ground">
              Ground for the request
            </label>
            <select id="fc-ground" className={INPUT} value={form.groundId} onChange={set("groundId")}>
              {CONCESSION_GROUNDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fc-ground-detail">
              {form.groundId === "other" ? "Describe the circumstances" : "Anything to add (optional)"}
            </label>
            <textarea id="fc-ground-detail" rows={3} className={AREA} value={form.groundDetail} onChange={set("groundDetail")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-occupation">
              What you do (optional)
            </label>
            <input id="fc-occupation" className={INPUT} value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-income">
              Monthly household income
            </label>
            <input id="fc-income" className={INPUT} type="number" inputMode="decimal" min="0" step="1000" value={form.monthlyIncome} onChange={set("monthlyIncome")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fc-sibling">
              Note about siblings in the school (optional)
            </label>
            <input id="fc-sibling" className={INPUT} value={form.siblingDetail} onChange={set("siblingDetail")} placeholder="My daughter Ananya is in Class V-B, admission number 2023/0416." />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The fee for the year</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["tuition", FEE_LABELS.tuition],
            ["transport", FEE_LABELS.transport],
            ["activity", FEE_LABELS.activity],
            ["exam", FEE_LABELS.exam],
            ["other", FEE_LABELS.other],
            ["arrears", "Arrears already outstanding"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className={LABEL} htmlFor={`fc-${key}`}>
                {label}
              </label>
              <input
                id={`fc-${key}`}
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={form[key]}
                onChange={set(key)}
              />
            </div>
          ))}
        </div>
      </section>

      {wantsConcession ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The concession you are asking for</h2>
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Ask by</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                [CONCESSION_MODES.PERCENT, "A percentage of the fee"],
                [CONCESSION_MODES.AMOUNT, "A specific amount"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  htmlFor={`fc-cmode-${value}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold ${
                    concessionMode === value ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`fc-cmode-${value}`}
                    type="radio"
                    name="fc-cmode"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={concessionMode === value}
                    onChange={() => setConcessionMode(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {concessionMode === CONCESSION_MODES.PERCENT ? (
              <div>
                <label className={LABEL} htmlFor="fc-percent">
                  Concession (0% to {MAX_CONCESSION_PERCENT}%)
                </label>
                <input id="fc-percent" className={INPUT} type="number" inputMode="decimal" min="0" max={MAX_CONCESSION_PERCENT} step="5" value={form.concessionPercent} onChange={set("concessionPercent")} />
              </div>
            ) : (
              <div>
                <label className={LABEL} htmlFor="fc-amount">
                  Concession amount
                </label>
                <input id="fc-amount" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.concessionAmount} onChange={set("concessionAmount")} />
              </div>
            )}
          </div>
        </section>
      ) : null}

      {wantsInstalments ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The instalment plan you are offering</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="fc-instalments">
                Number of instalments (1 to {MAX_INSTALMENTS})
              </label>
              <input id="fc-instalments" className={INPUT} type="number" inputMode="numeric" min="1" max={MAX_INSTALMENTS} step="1" value={form.instalments} onChange={set("instalments")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="fc-interval">
                Months between instalments (1 to {MAX_INTERVAL_MONTHS})
              </label>
              <input id="fc-interval" className={INPUT} type="number" inputMode="numeric" min="1" max={MAX_INTERVAL_MONTHS} step="1" value={form.intervalMonths} onChange={set("intervalMonths")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="fc-first-due">
                First instalment on
              </label>
              <input id="fc-first-due" className={INPUT} type="date" value={form.firstDue} onChange={set("firstDue")} />
            </div>
          </div>
        </section>
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Amount payable after the concession
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite" aria-atomic="true">
              {error ? DASH : formatINR(concession.payable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the amounts above."
                : `Concession of ${formatINR(concession.concessionAmount)} (${formatPercent(concession.concessionPercent)}) on a fee of ${formatINR(fee.total)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label={isCopied("summary") ? "Copied the fee concession summary to clipboard" : "Copy the fee concession summary"}
              onClick={() =>
                copy(
                  "summary",
                  error
                    ? ""
                    : [
                        "School fee concession request",
                        `Annual fee: ${formatINR(fee.total)}`,
                        `Concession asked: ${formatINR(concession.concessionAmount)} (${formatPercent(concession.concessionPercent)})`,
                        `Arrears: ${formatINR(concession.arrears)}`,
                        `Payable: ${formatINR(concession.payable)}`,
                        wantsInstalments && !plan.error
                          ? `Instalments: ${plural(plan.rows.length, "instalment")} of about ${formatINR(plan.perInstalment)} from ${formatLongDate(plan.rows[0].dueISO)}`
                          : "",
                        affordability.feeShare !== null ? `Share of annual household income: ${formatPercent(affordability.feeShare)}` : "",
                      ]
                        .filter(Boolean)
                        .join("\n"),
                  { label: "fee concession summary" },
                )
              }
            >
              {isCopied("summary") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("summary") ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total fee for the year", error ? DASH : formatINR(fee.total)],
            ["Concession asked for", error ? DASH : `${formatINR(concession.concessionAmount)} (${formatPercent(concession.concessionPercent)})`],
            ["Fee after the concession", error ? DASH : formatINR(concession.netFee)],
            ["Arrears added back", error ? DASH : formatINR(concession.arrears)],
            [
              "Share of annual household income",
              error ? DASH : affordability.feeShare === null ? "Enter a monthly income" : formatPercent(affordability.feeShare),
            ],
            [
              "Instalment size",
              error || !wantsInstalments || plan.error ? DASH : `${formatINR(plan.perInstalment)} × ${plan.rows.length}, last ${formatINR(plan.lastInstalment)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && wantsInstalments && !plan.error ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">Proposed instalment schedule</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due on
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row) => (
                  <tr key={row.number} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.number}</td>
                    <td className="py-2 pr-3">{formatLongDate(row.dueISO)}</td>
                    <td className="py-2 text-right font-semibold">{formatINR(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Documents to enclose for this ground: {ground.proof.toLowerCase()}.
          {ground.rte
            ? ` Section 12(1)(c) of the RTE Act, 2009 reserves ${RTE_RESERVED_SHARE_PERCENT} per cent of class I in a private unaided school for children from weaker sections and disadvantaged groups.`
            : ""}
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Student, school and contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="fc-parent">
              Your name
            </label>
            <input id="fc-parent" className={INPUT} value={form.parentName} onChange={set("parentName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-student">
              Student&apos;s name
            </label>
            <input id="fc-student" className={INPUT} value={form.studentName} onChange={set("studentName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-admission">
              Admission number
            </label>
            <input id="fc-admission" className={INPUT} value={form.admissionNumber} onChange={set("admissionNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-class">
              Class
            </label>
            <input id="fc-class" className={INPUT} value={form.className} onChange={set("className")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-section">
              Section
            </label>
            <input id="fc-section" className={INPUT} value={form.section} onChange={set("section")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-year">
              Academic year
            </label>
            <input id="fc-year" className={INPUT} value={form.academicYear} onChange={set("academicYear")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-school">
              School name
            </label>
            <input id="fc-school" className={INPUT} value={form.schoolName} onChange={set("schoolName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-addressee">
              Addressed to (default: The Principal)
            </label>
            <input id="fc-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} placeholder="The Principal" />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-letter-date">
              Date of this letter
            </label>
            <input id="fc-letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="fc-phone">
              Phone
            </label>
            <input id="fc-phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fc-email">
              Email
            </label>
            <input id="fc-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="fc-school-address">
            School address
          </label>
          <textarea id="fc-school-address" rows={2} className={AREA} value={form.schoolAddress} onChange={set("schoolAddress")} />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your request letter</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label={isCopied("letter") ? "Copied the fee concession request letter to clipboard" : "Copy the fee concession request letter"}
            onClick={() => copy("letter", letter.error ? "" : letter.body, { label: "fee concession request letter" })}
          >
            {isCopied("letter") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {isCopied("letter") ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{letter.wordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Outside the RTE entitlement a fee concession is at the
        school&apos;s discretion, and fee regulation itself is state law — several states have a fee
        regulatory committee that hears parent representations. Deliver the letter in person if you
        can and ask for a receipt.
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </main>
  );
}
