"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { FEE_GROUPS, ROUTES, buildVacDayPlan, planToText } from "../lib";

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DEFAULTS = {
  appointmentTime: "10:00",
  travelMinutes: "45",
  bufferMinutes: "30",
  route: "study",
  applicantAge: "22",
  people: "1",
  feeGroup: "individual",
  bilIssueDate: "",
  hasHenna: false,
  wearsGlasses: false,
};

const DASH = "—";

const TOGGLES = [
  ["wearsGlasses", "I normally wear glasses"],
  ["hasHenna", "I have fresh henna or mehndi on my hands"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [ticked, setTicked] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const plan = useMemo(
    () =>
      buildVacDayPlan({
        appointmentTime: form.appointmentTime,
        travelMinutes: Number(form.travelMinutes),
        bufferMinutes: Number(form.bufferMinutes),
        route: form.route,
        applicantAge: Number(form.applicantAge),
        people: Number(form.people),
        feeGroup: form.feeGroup,
        bilIssueDate: form.bilIssueDate,
        hasHenna: form.hasHenna,
        wearsGlasses: form.wearsGlasses,
      }),
    [form],
  );

  const hasError = Boolean(plan.error);
  const text = useMemo(() => (hasError ? "" : planToText(plan)), [plan, hasError]);

  const tickedCount = useMemo(() => {
    if (hasError) return 0;
    let count = 0;
    for (const section of plan.sections) {
      for (const item of section.items) if (ticked.has(item)) count += 1;
    }
    return count;
  }, [plan, hasError, ticked]);

  const toggleItem = (item) =>
    setTicked((previous) => {
      const next = new Set(previous);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });

  const copyResult = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setTicked(new Set());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Visa appointment
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Canada VAC India Appointment Day Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Get a leave-home time for your biometric slot, the exact CAD collection fee for your
          party, the date your Biometric Instruction Letter expires, and a checklist of what to
          carry, wear and leave outside the centre.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-time">
              Appointment slot (24-hour)
            </label>
            <input
              id="cvac-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.appointmentTime}
              onChange={(event) => update("appointmentTime", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-travel">
              Travel time door to centre (minutes)
            </label>
            <input
              id="cvac-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="720"
              step="5"
              value={form.travelMinutes}
              onChange={(event) => update("travelMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-buffer">
              Traffic and parking buffer (minutes)
            </label>
            <input
              id="cvac-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="5"
              value={form.bufferMinutes}
              onChange={(event) => update("bufferMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-route">
              Application type
            </label>
            <select
              id="cvac-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.route}
              onChange={(event) => update("route", event.target.value)}
            >
              {ROUTES.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-age">
              Applicant age (years)
            </label>
            <input
              id="cvac-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={form.applicantAge}
              onChange={(event) => update("applicantAge", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-people">
              People giving biometrics
            </label>
            <input
              id="cvac-people"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={form.people}
              onChange={(event) => update("people", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-feegroup">
              Fee group
            </label>
            <select
              id="cvac-feegroup"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.feeGroup}
              onChange={(event) => update("feeGroup", event.target.value)}
            >
              {FEE_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvac-bil">
              BIL issue date (optional)
            </label>
            <input
              id="cvac-bil"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.bilIssueDate}
              onChange={(event) => update("bilIssueDate", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {TOGGLES.map(([key, label]) => (
            <label
              key={key}
              className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`cvac-${key}`}
            >
              <input
                id={`cvac-${key}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={form[key]}
                onChange={(event) => update(key, event.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Leave home by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.leaveHomeBy}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the timings."
                : `${plan.leaveHomePreviousDay ? "the previous evening — " : ""}so you are at the entrance by ${plan.arriveBy}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Canada appointment day checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist and inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Appointment slot", hasError ? DASH : plan.appointmentTime],
            ["Be at the entrance by", hasError ? DASH : plan.arriveBy],
            ["Total head start", hasError ? DASH : `${plan.totalLeadMinutes} min`],
            [
              "Biometric collection fee",
              hasError
                ? DASH
                : `${CAD.format(plan.biometricFeeCad)}${plan.feeCapped ? ` (capped from ${CAD.format(plan.biometricFeeGrossCad)})` : ""}`,
            ],
            [
              "Biometrics needed for this applicant",
              hasError ? DASH : plan.biometricsRequired ? "Yes" : "No — age exempt",
            ],
            [
              "BIL must be used by",
              hasError ? DASH : plan.bilDeadline || `within ${plan.bilValidDays} days of issue`,
            ],
            [
              "Checklist progress",
              hasError ? DASH : `${tickedCount} of ${plan.totalItems} items ticked`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError &&
        plan.sections.map((section) => (
          <section
            key={section.title}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{section.title}</h2>
            <ul className="mt-3 grid gap-1">
              {section.items.map((item) => (
                <li key={item}>
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                      checked={ticked.has(item)}
                      onChange={() => toggleItem(item)}
                    />
                    <span
                      className={
                        ticked.has(item)
                          ? "text-[var(--muted-foreground)] line-through"
                          : "text-[var(--foreground)]"
                      }
                    >
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid, not immigration advice. Fees, centre rules and document
        requirements change — follow the Biometric Instruction Letter, the document checklist in
        your IRCC account and the appointment email, and consult a licensed immigration consultant
        or lawyer about your case.
      </p>
    </main>
  );
}
