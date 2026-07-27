"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw } from "lucide-react";

import { AREA_TYPES, UTILITIES, buildUtilityPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const todayIso = () => new Date().toISOString().slice(0, 10);

const MS_PER_DAY = 86400000;
const defaultMoveDate = () => new Date(Date.now() + 45 * MS_PER_DAY).toISOString().slice(0, 10);

const DEFAULT_SELECTED = ["electricity", "water", "lpg", "broadband"];
const DEFAULT_AREA = "urban";

const KIND_LABEL = {
  new: "Connect at the new address",
  close: "Close or transfer at the old address",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const prettyDate = (iso) => {
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed) ? iso : DATE_FMT.format(parsed);
};

function ActionBlock({ action, onToggle }) {
  return (
    <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <label htmlFor={`ut-${action.key}`} className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
        <input
          id={`ut-${action.key}`}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          checked={action.done}
          onChange={onToggle}
        />
        <span className="flex-1">
          <span className={action.done ? "font-semibold line-through" : "font-semibold"}>
            {KIND_LABEL[action.kind]}
          </span>
          <span
            className={`mt-1 block text-xs font-semibold ${
              action.late ? "text-[var(--danger)]" : "text-[var(--primary)]"
            }`}
          >
            Start by {prettyDate(action.startBy)} · {action.leadDays} days before the move ·{" "}
            {action.done
              ? "done"
              : action.late
                ? `${NUM.format(Math.abs(action.daysLeft))} day(s) late`
                : `${NUM.format(action.daysLeft)} day(s) left`}
          </span>
        </span>
      </label>
      <ul className="mt-2 list-disc space-y-1 pl-9 text-sm text-[var(--muted-foreground)]">
        {action.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ToolHome() {
  const [today, setToday] = useState(todayIso);
  const [moveDate, setMoveDate] = useState(defaultMoveDate);
  const [areaType, setAreaType] = useState(DEFAULT_AREA);
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildUtilityPlan({ moveDate, today, areaType, selected, done }),
    [moveDate, today, areaType, selected, done],
  );

  const hasError = Boolean(result.error);

  const toggleUtility = (id) => () => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleAction = (key) => () => {
    setDone((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      `Utility transfer plan — moving ${prettyDate(result.moveDate)}`,
      `Start the earliest application by ${prettyDate(result.startEverythingBy)}`,
      `${result.doneCount}/${result.totalActions} actions done · ${result.lateCount} already late`,
      "",
    ];
    for (const row of result.rows) {
      lines.push(`${row.name} (${row.slaNote})`);
      for (const action of [row.newAction, row.closeAction]) {
        lines.push(
          `  [${action.done ? "x" : " "}] ${KIND_LABEL[action.kind]} — start by ${prettyDate(action.startBy)}`,
        );
        for (const step of action.steps) lines.push(`      - ${step}`);
      }
      lines.push(`  Documents: ${row.docs.join("; ")}`);
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n").trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setToday(todayIso());
    setMoveDate(defaultMoveDate());
    setAreaType(DEFAULT_AREA);
    setSelected(DEFAULT_SELECTED);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Utility Transfer Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two actions per utility — connect at the new address, close or transfer at the old one —
          each dated backwards from moving day. Electricity uses the statutory new-connection window
          for your area under the Electricity (Rights of Consumers) Rules, 2020.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-move">
              Moving day
            </label>
            <input
              id="ut-move"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={moveDate}
              onChange={(event) => setMoveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-today">
              Today
            </label>
            <input
              id="ut-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ut-area">
              New address is in a
            </label>
            <select
              id="ut-area"
              className={`mt-2 ${INPUT_CLASS}`}
              value={areaType}
              onChange={(event) => setAreaType(event.target.value)}
            >
              {AREA_TYPES.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Utilities to plan</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {UTILITIES.map((utility) => (
              <label
                key={utility.id}
                htmlFor={`ut-sel-${utility.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`ut-sel-${utility.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={selected.includes(utility.id)}
                  onChange={toggleUtility(utility.id)}
                />
                <span>{utility.name}</span>
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
              Start the first application by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : prettyDate(result.startEverythingBy)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to build the plan."
                : `${NUM.format(result.longestLead)} days before moving day · ${NUM.format(result.totalActions)} actions`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the utility transfer plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the plan" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Days until moving day", hasError ? DASH : NUM.format(result.daysUntilMove)],
            ["Actions done", hasError ? DASH : `${NUM.format(result.doneCount)} / ${NUM.format(result.totalActions)}`],
            ["Progress", hasError ? DASH : `${NUM.format(result.percentDone)}%`],
            ["Actions already past their start date", hasError ? DASH : NUM.format(result.lateCount)],
            [
              "Next thing to do",
              hasError
                ? DASH
                : result.nextAction
                  ? `${result.nextAction.utilityName} — ${KIND_LABEL[result.nextAction.kind].toLowerCase()}`
                  : "Everything is ticked",
            ],
            ["Electricity SLA for this area", hasError ? DASH : `${NUM.format(result.electricitySlaDays)} days`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasError
        ? null
        : result.rows.map((row) => (
            <section
              key={row.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <h2 className="text-base font-semibold">{row.name}</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{row.slaNote}</p>
              <ActionBlock action={row.newAction} onToggle={toggleAction(row.newAction.key)} />
              <ActionBlock action={row.closeAction} onToggle={toggleAction(row.closeAction.key)} />
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                <span className="font-semibold">Keep handy:</span> {row.docs.join(" · ")}
              </p>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General guidance, not a service commitment. The statutory electricity timeline binds the
        distribution licensee once a complete application and deposit are in; provider lead times for
        gas, water and broadband vary by city and by building. Always photograph the final and
        opening meter readings — they are your only evidence at billing disputes.
      </p>
    </main>
  );
}
