"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheck, CircleX, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { ACTIVITIES, STATES, checkCompositionEligibility } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  turnover: "8000000",
  services: "300000",
  state: "Maharashtra",
  activityId: "trader",
};

const DISQUALIFIERS = [
  { key: "nonTaxableSupplies", id: "cec-nontax", label: "I supply alcohol, petrol, diesel or ATF" },
  { key: "interStateOutward", id: "cec-inter", label: "I sell to customers in other states" },
  { key: "ecommerceTcs", id: "cec-ecom", label: "I sell through a marketplace that collects TCS" },
  {
    key: "notifiedGoods",
    id: "cec-notified",
    label: "I manufacture ice cream, pan masala, tobacco, aerated water or bricks",
  },
  {
    key: "casualOrNonResident",
    id: "cec-casual",
    label: "I am a casual or non-resident taxable person",
  },
  {
    key: "otherPanUnitsRegular",
    id: "cec-pan",
    label: "Another registration on my PAN stays under the regular scheme",
  },
];

export default function ToolHome() {
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [services, setServices] = useState(DEFAULTS.services);
  const [state, setState] = useState(DEFAULTS.state);
  const [activityId, setActivityId] = useState(DEFAULTS.activityId);
  const [flags, setFlags] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkCompositionEligibility({
        previousYearTurnover: turnover.trim() === "" ? Number.NaN : Number(turnover),
        serviceTurnover: services.trim() === "" ? 0 : Number(services),
        state,
        activityId,
        ...flags,
      }),
    [turnover, services, state, activityId, flags],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST composition scheme eligibility",
      `Activity: ${result.activity} | State: ${result.state}`,
      `Turnover tested: ${money(result.turnover)} against a ceiling of ${money(result.ceiling)}`,
      `Verdict: ${result.eligible ? `Eligible under section ${result.route} at ${result.rate}%` : "Not eligible"}`,
      ...(result.eligible ? [] : ["Conditions not met:", ...result.failedReasons.map((reason) => `- ${reason}`)]),
      ...(result.fallbackRoute ? [`Alternative: ${result.fallbackRoute.reason}`] : []),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
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
    setTurnover(DEFAULTS.turnover);
    setServices(DEFAULTS.services);
    setState(DEFAULTS.state);
    setActivityId(DEFAULTS.activityId);
    setFlags({});
    setCopied(false);
  };

  const toggleFlag = (key, value) => {
    setFlags((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Section 10 CGST Act
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Composition Scheme Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight statutory conditions decide whether you can pay tax at a flat 1%, 5% or 6% of
          turnover instead of the regular scheme. Answer them here and see exactly which one blocks
          you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cec-activity">
              What does the business do?
            </label>
            <select
              id="cec-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activityId}
              onChange={(event) => setActivityId(event.target.value)}
            >
              {ACTIVITIES.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cec-state">
              State or union territory
            </label>
            <select
              id="cec-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              {STATES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cec-turnover">
              Aggregate turnover last financial year (INR)
            </label>
            <input
              id="cec-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={turnover}
              onChange={(event) => setTurnover(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cec-services">
              Of that, value of services supplied (INR)
            </label>
            <input
              id="cec-services"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={services}
              onChange={(event) => setServices(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Tick anything that applies to you</legend>
          <div className="mt-3 grid gap-1">
            {DISQUALIFIERS.map((item) => (
              <label
                key={item.key}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
                htmlFor={item.id}
              >
                <input
                  id={item.id}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={Boolean(flags[item.key])}
                  onChange={(event) => toggleFlag(item.key, event.target.checked)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Composition levy rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !result.eligible ? DASH : `${result.rate}%`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.eligible
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError
                ? "Fix the input above to see a result."
                : result.eligible
                  ? `Eligible under section ${result.route}`
                  : `Not eligible — ${result.failedCount} condition${result.failedCount === 1 ? "" : "s"} not met`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the composition eligibility verdict"
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
              aria-label="Reset all answers"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Turnover ceiling for your route", hasError ? DASH : money(result.ceiling)],
            ["Turnover you entered", hasError ? DASH : money(result.turnover)],
            [
              "Service supplies allowed alongside goods",
              hasError ? DASH : money(result.serviceAllowance),
            ],
            ["Conditions not met", hasError ? DASH : String(result.failedCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.fallbackRoute ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
            {result.fallbackRoute.reason}
          </p>
        ) : null}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Condition by condition</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {result.checks.map((check) => (
              <li key={check.id} className="flex items-start gap-3 py-3">
                {check.passed ? (
                  <CircleCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleX
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {check.label}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">
                      ({check.section})
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {check.detail}
                  </p>
                  <span className="sr-only">{check.passed ? "Condition met" : "Condition not met"}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Opting in is done by filing Form CMP-02 before the start
        of the financial year, and a composition dealer files quarterly CMP-08 and annual GSTR-4.
        Eligibility turns on the exact facts of your business — confirm with a GST practitioner
        before switching schemes.
      </p>
    </main>
  );
}
