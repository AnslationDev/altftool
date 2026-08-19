"use client";

import { useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw } from "lucide-react";

import { ROAD_QUALITY, SYMPTOMS, TRIGGER_EVENTS, planWheelServices } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  roadQuality: "poor",
  alignmentKmSince: "6000",
  alignmentMonthsSince: "5",
  balanceKmSince: "3000",
  balanceMonthsSince: "3",
  monthlyKm: "1000",
  events: [],
  symptoms: ["pulls"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_BASE =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition";

const DASH = "—";

const STATUS_TEXT = {
  ok: "On schedule",
  "due-soon": "Due soon",
  overdue: "Overdue",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function ServiceCard({ title, service, score, needed }) {
  const overdue = service.status === "overdue" || needed;
  // The headline must reflect whichever limit (distance or time) is actually
  // driving the status — otherwise a car that is overdue purely on elapsed
  // time can show a reassuring "X,XXX km" headline next to an urgent badge.
  const limitedByTime = service.limitedBy === "time";
  const headline = overdue
    ? "Now"
    : limitedByTime
      ? `${NUM.format(service.monthsRemaining)} mo`
      : `${KM.format(service.kmRemaining)} km`;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            needed
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          {needed ? "Book it" : STATUS_TEXT[service.status]}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">{headline}</p>
      <dl className="mt-3 divide-y divide-[var(--border)] text-xs">
        {[
          ["Interval", `${KM.format(service.intervalKm)} km / ${NUM.format(service.intervalMonths)} mo`],
          ["Months left", NUM.format(Math.max(0, service.monthsRemaining))],
          ["Limit that hits first", service.limitedBy],
          ["Interval used", `${NUM.format(service.percentUsed)}%`],
          ["Symptom score", String(score)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-1.5">
            <dt className="text-[var(--muted-foreground)]">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <span
          className={`block h-full ${overdue ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
          style={{ width: `${Math.max(0, Math.min(100, service.percentUsed))}%` }}
        />
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [roadQuality, setRoadQuality] = useState(DEFAULTS.roadQuality);
  const [alignmentKmSince, setAlignmentKmSince] = useState(DEFAULTS.alignmentKmSince);
  const [alignmentMonthsSince, setAlignmentMonthsSince] = useState(DEFAULTS.alignmentMonthsSince);
  const [balanceKmSince, setBalanceKmSince] = useState(DEFAULTS.balanceKmSince);
  const [balanceMonthsSince, setBalanceMonthsSince] = useState(DEFAULTS.balanceMonthsSince);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [events, setEvents] = useState(DEFAULTS.events);
  const [symptoms, setSymptoms] = useState(DEFAULTS.symptoms);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planWheelServices({
        roadQuality,
        alignmentKmSince: toNumber(alignmentKmSince),
        alignmentMonthsSince: toNumber(alignmentMonthsSince),
        balanceKmSince: toNumber(balanceKmSince),
        balanceMonthsSince: toNumber(balanceMonthsSince),
        monthlyKm: toNumber(monthlyKm),
        events,
        symptoms,
      }),
    [
      roadQuality,
      alignmentKmSince,
      alignmentMonthsSince,
      balanceKmSince,
      balanceMonthsSince,
      monthlyKm,
      events,
      symptoms,
    ],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Wheel Alignment Planner",
      `Roads: ${plan.roadLabel}`,
      `Alignment: every ${KM.format(plan.alignment.intervalKm)} km / ${NUM.format(plan.alignment.intervalMonths)} months — ${KM.format(plan.alignment.kmRemaining)} km left`,
      `Balancing: every ${KM.format(plan.balancing.intervalKm)} km / ${NUM.format(plan.balancing.intervalMonths)} months — ${KM.format(plan.balancing.kmRemaining)} km left`,
      `Symptom scores: alignment ${plan.alignmentScore}, balancing ${plan.balancingScore}`,
      `Recommendation: ${plan.recommendationLabel}`,
    ].join("\n");
  }, [plan]);

  const toggleEvent = (id) => {
    setEvents((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleSymptom = (id) => {
    setSymptoms((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

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
    setRoadQuality(DEFAULTS.roadQuality);
    setAlignmentKmSince(DEFAULTS.alignmentKmSince);
    setAlignmentMonthsSince(DEFAULTS.alignmentMonthsSince);
    setBalanceKmSince(DEFAULTS.balanceKmSince);
    setBalanceMonthsSince(DEFAULTS.balanceMonthsSince);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setEvents(DEFAULTS.events);
    setSymptoms(DEFAULTS.symptoms);
    setCopied(false);
  };

  const ok = !plan.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Wheel Alignment Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Alignment sets the geometry; balancing sorts the mass. They are different jobs with
          different symptoms, and this plans both — including the events that make one due
          immediately whatever the odometer says.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="road-quality">
              Road quality you mostly drive on
            </label>
            <select
              id="road-quality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roadQuality}
              onChange={(event) => {
                setRoadQuality(event.target.value);
                setCopied(false);
              }}
            >
              {ROAD_QUALITY.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="align-km">
              Km since last alignment
            </label>
            <input
              id="align-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={alignmentKmSince}
              onChange={(event) => {
                setAlignmentKmSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="align-months">
              Months since last alignment
            </label>
            <input
              id="align-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={alignmentMonthsSince}
              onChange={(event) => {
                setAlignmentMonthsSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="balance-km">
              Km since last balancing
            </label>
            <input
              id="balance-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={balanceKmSince}
              onChange={(event) => {
                setBalanceKmSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="balance-months">
              Months since last balancing
            </label>
            <input
              id="balance-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={balanceMonthsSince}
              onChange={(event) => {
                setBalanceMonthsSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wheel-monthly">
              Average kilometres per month
            </label>
            <input
              id="wheel-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={monthlyKm}
              onChange={(event) => {
                setMonthlyKm(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Anything happened recently?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TRIGGER_EVENTS.map((event) => {
              const active = events.includes(event.id);
              return (
                <label
                  key={event.id}
                  htmlFor={`ev-${event.id}`}
                  className={`${CHECK_BASE} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`ev-${event.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleEvent(event.id)}
                  />
                  <span>
                    <span className="block font-medium">{event.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      Forces {event.forces === "both" ? "alignment and balancing" : event.forces}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Symptoms you have noticed</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SYMPTOMS.map((symptom) => {
              const active = symptoms.includes(symptom.id);
              return (
                <label
                  key={symptom.id}
                  htmlFor={`sy-${symptom.id}`}
                  className={`${CHECK_BASE} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`sy-${symptom.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleSymptom(symptom.id)}
                  />
                  <span className="font-medium">{symptom.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommendation
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? plan.recommendationLabel : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Alignment score ${plan.alignmentScore} · balancing score ${plan.balancingScore}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy wheel alignment plan"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ServiceCard
              title="Wheel alignment"
              service={plan.alignment}
              score={plan.alignmentScore}
              needed={plan.alignmentNeeded}
            />
            <ServiceCard
              title="Wheel balancing"
              service={plan.balancing}
              score={plan.balancingScore}
              needed={plan.balancingNeeded}
            />
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">
            Alignment {DASH} · Balancing {DASH}
          </p>
        )}
      </section>

      {ok && plan.forcedByEvents.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Why it is due now regardless of distance</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {plan.forcedByEvents.map((event) => (
              <li key={event.label}>
                <span className="font-medium">{event.label}</span>
                <span className="block text-[var(--muted-foreground)]">{event.why}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ok && plan.notes.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Have worn steering or suspension joints replaced before an
        alignment, otherwise the settings will not hold.
      </p>
    </main>
  );
}
