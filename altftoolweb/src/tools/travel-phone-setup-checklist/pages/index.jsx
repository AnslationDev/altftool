"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CONNECTIVITY_PLANS,
  MAX_LEAD_DAYS,
  PRIORITY_LABEL,
  buildChecklist,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  daysUntilDeparture: "3",
  plan: "esim",
  international: true,
  flying: true,
  driving: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const TOGGLE_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const PRIORITY_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  recommended: "bg-[var(--warning-soft)] text-[var(--warning-text)]",
  optional: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [daysUntilDeparture, setDaysUntilDeparture] = useState(DEFAULTS.daysUntilDeparture);
  const [plan, setPlan] = useState(DEFAULTS.plan);
  const [international, setInternational] = useState(DEFAULTS.international);
  const [flying, setFlying] = useState(DEFAULTS.flying);
  const [driving, setDriving] = useState(DEFAULTS.driving);
  const [checkedIds, setCheckedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(
    () => buildChecklist({ daysUntilDeparture, plan, international, flying, driving }),
    [daysUntilDeparture, plan, international, flying, driving],
  );

  const score = useMemo(() => {
    if (checklist.error) return { error: checklist.error };
    return scoreChecklist(checklist.items, checkedIds);
  }, [checklist, checkedIds]);

  const ok = !checklist.error && !score.error;
  const errorMessage = checklist.error || score.error || "";

  const toggle = (id) => {
    setCheckedIds((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const remaining = checklist.items.filter((item) => !checkedIds.includes(item.id));
    return [
      "Travel phone setup checklist",
      `${checklist.planLabel} · ${checklist.daysUntilDeparture} day(s) until departure`,
      `Readiness ${score.percent}% (${score.doneCount} of ${score.totalCount} done, ${score.criticalRemaining} critical items left)`,
      "",
      remaining.length === 0
        ? "Nothing outstanding."
        : `Still to do (${remaining.length}):`,
      ...remaining.map(
        (item) => `  [ ] ${item.label} — ${PRIORITY_LABEL[item.priority]}, do it ${item.leadDays} day(s) out`,
      ),
    ].join("\n");
  }, [ok, checklist, checkedIds, score]);

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
    setDaysUntilDeparture(DEFAULTS.daysUntilDeparture);
    setPlan(DEFAULTS.plan);
    setInternational(DEFAULTS.international);
    setFlying(DEFAULTS.flying);
    setDriving(DEFAULTS.driving);
    setCheckedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Travel connectivity
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Travel Phone Setup Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it how you are travelling and how you plan to get data, and it builds the phone
          checklist for that trip — backups, offline maps, roaming toggles, power and safety
          contacts — then scores your readiness by weight, so an unticked critical item costs three
          times an optional one.
        </p>
      </header>

      <section className={CARD} aria-labelledby="tp-trip">
        <h2 id="tp-trip" className="text-base font-semibold">
          About the trip
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-days">
              Days until departure
            </label>
            <input
              id="tp-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_LEAD_DAYS}
              step="1"
              value={daysUntilDeparture}
              onChange={(event) => setDaysUntilDeparture(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-plan">
              How you will get mobile data
            </label>
            <select
              id="tp-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
            >
              {Object.entries(CONNECTIVITY_PLANS).map(([id, entry]) => (
                <option key={id} value={id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
            <label className={TOGGLE_ROW} htmlFor="tp-intl">
              <input
                id="tp-intl"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={international}
                onChange={(event) => setInternational(event.target.checked)}
              />
              Leaving the country
            </label>
            <label className={TOGGLE_ROW} htmlFor="tp-flying">
              <input
                id="tp-flying"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={flying}
                onChange={(event) => setFlying(event.target.checked)}
              />
              Flying
            </label>
            <label className={TOGGLE_ROW} htmlFor="tp-driving">
              <input
                id="tp-driving"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={driving}
                onChange={(event) => setDriving(event.target.checked)}
              />
              Driving there
            </label>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-labelledby="tp-score">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="tp-score"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              Phone readiness
            </h2>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(score.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${score.status} · ${score.doneCount} of ${score.totalCount} tasks ticked`
                : "Fix the input above to see your score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the outstanding checklist items"
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
              aria-label="Reset the trip options and untick everything"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuenow={ok ? score.percent : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist completion"
        >
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-[width] motion-reduce:transition-none"
            style={{ width: `${ok ? score.percent : 0}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Connectivity plan", ok ? checklist.planLabel : DASH],
            [
              "Tasks on this list",
              ok ? `${NUM.format(score.totalCount)} (weighted total ${score.weightTotal})` : DASH,
            ],
            [
              "Critical items outstanding",
              ok ? `${NUM.format(score.criticalRemaining)} of ${score.criticalTotal}` : DASH,
            ],
            [
              "Due by now",
              ok
                ? `${NUM.format(score.dueNowRemaining)} of ${score.dueNowTotal} not yet done`
                : DASH,
            ],
            [
              "Days until departure",
              ok ? `${NUM.format(checklist.daysUntilDeparture)}` : DASH,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && score.criticalRemaining > 0 ? (
          <p className="mt-4 flex gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {score.criticalRemaining} critical item
              {score.criticalRemaining === 1 ? "" : "s"} still outstanding. The score cannot read
              &quot;Ready to fly&quot; until all of them are ticked.
            </span>
          </p>
        ) : null}
      </section>

      {ok
        ? checklist.sections.map((section) => (
            <section key={section.id} className={`mt-6 ${CARD}`} aria-labelledby={`tp-${section.id}`}>
              <h2 id={`tp-${section.id}`} className="text-base font-semibold">
                {section.label}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => {
                  const done = checkedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label
                        htmlFor={`tp-item-${item.id}`}
                        className="flex min-h-11 cursor-pointer gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                      >
                        <input
                          id={`tp-item-${item.id}`}
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                          checked={done}
                          onChange={() => toggle(item.id)}
                        />
                        <span className="min-w-0">
                          <span
                            className={
                              done
                                ? "font-semibold text-[var(--muted-foreground)] line-through"
                                : "font-semibold"
                            }
                          >
                            {item.label}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[item.priority]}`}
                            >
                              {PRIORITY_LABEL[item.priority]}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              Do it {item.leadDays} day{item.leadDays === 1 ? "" : "s"} before
                              departure
                            </span>
                            {item.dueNow && !done ? (
                              <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--warning-text)]">
                                Due now
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block text-[var(--muted-foreground)]">
                            {item.detail}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The list is generated from your trip options, so changing the connectivity plan or the
        flying and driving toggles adds and removes tasks. Ticks are held in the page only and are
        lost on refresh — use Copy result to keep the outstanding items. Airline and carrier rules,
        including lithium-battery allowances, are set by each operator and should be confirmed with
        them.
      </p>
    </main>
  );
}
