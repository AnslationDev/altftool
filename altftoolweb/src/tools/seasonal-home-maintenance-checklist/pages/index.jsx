"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  FEATURES,
  HOME_TYPES,
  HOURS_PER_SESSION,
  SEASONS,
  ZONES,
  buildMaintenancePlan,
  seasonForMonth,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const hours = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)} h`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRIORITY_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  important: "bg-[var(--muted)] text-[var(--primary)]",
  routine: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULT_FEATURES = ["ac", "geyser", "tank", "chimney", "purifier"];

export default function ToolHome() {
  const [zone, setZone] = useState("composite");
  const [homeType, setHomeType] = useState("apartment");
  const [season, setSeason] = useState(() => seasonForMonth(new Date().getMonth()) ?? "monsoon");
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => buildMaintenancePlan({ zone, season, homeType, features }),
    [zone, season, homeType, features],
  );

  const hasPlan = !plan.error;
  const doneSet = useMemo(() => new Set(done), [done]);

  const summary = useMemo(() => {
    if (!hasPlan) return "";
    const zoneLabel = ZONES.find((entry) => entry.id === zone)?.label ?? zone;
    const seasonLabel =
      season === "year" ? "Whole year" : SEASONS.find((entry) => entry.id === season)?.label ?? season;
    const lines = [
      `Home maintenance checklist — ${seasonLabel}, ${zoneLabel} zone`,
      `${plan.taskCount} tasks · about ${NUM1.format(plan.totalHours)} hours · ${plan.sessions} half-day sessions`,
      "",
    ];
    for (const block of plan.bySeason) {
      lines.push(`${block.label} (${block.months})`);
      for (const task of block.tasks) {
        lines.push(`  [ ] ${task.title} — ${task.minutes} min, ${task.priority}`);
      }
      lines.push("");
    }
    return lines.join("\n").trimEnd();
  }, [hasPlan, plan, zone, season]);

  const toggleFeature = (id) => {
    setFeatures((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
    setCopied(false);
  };

  const toggleDone = (id) => {
    setDone((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
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
    setZone("composite");
    setHomeType("apartment");
    setSeason(seasonForMonth(new Date().getMonth()) ?? "monsoon");
    setFeatures(DEFAULT_FEATURES);
    setDone([]);
    setCopied(false);
  };

  const completed = hasPlan ? plan.tasks.filter((task) => doneSet.has(task.id)).length : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Seasonal Home Maintenance Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your climate zone, home type and the systems you own. You get the jobs that actually
          matter for that season, ranked by urgency, with a realistic time estimate for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hm-zone">
              Climate zone
            </label>
            <select
              id="hm-zone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={zone}
              onChange={(event) => setZone(event.target.value)}
            >
              {ZONES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {entry.example}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hm-home">
              Home type
            </label>
            <select
              id="hm-home"
              className={`mt-2 ${INPUT_CLASS}`}
              value={homeType}
              onChange={(event) => setHomeType(event.target.value)}
            >
              {HOME_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hm-season">
              Season
            </label>
            <select
              id="hm-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} ({entry.months})
                </option>
              ))}
              <option value="year">Whole year — every season</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Systems in this home</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <label
                key={feature.id}
                htmlFor={`hm-f-${feature.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`hm-f-${feature.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={features.includes(feature.id)}
                  onChange={() => toggleFeature(feature.id)}
                />
                <span>{feature.label}</span>
              </label>
            ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Jobs on your list
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasPlan ? plan.taskCount : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasPlan
                ? `${completed} of ${plan.taskCount} ticked off`
                : "Fix the selections above to build a list"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the maintenance checklist"
              className={GHOST_BTN}
              disabled={!hasPlan}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all selections" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Estimated hands-on time", hasPlan ? hours(plan.totalHours) : DASH],
            [
              "Half-day sessions needed",
              hasPlan ? `${plan.sessions} × ${HOURS_PER_SESSION} h` : DASH,
            ],
            ["Do-first (safety critical)", hasPlan ? `${plan.counts.critical} tasks` : DASH],
            ["Important", hasPlan ? `${plan.counts.important} tasks` : DASH],
            ["Routine", hasPlan ? `${plan.counts.routine} tasks` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasPlan
        ? plan.bySeason.map((block) => (
            <section
              key={block.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{block.label}</h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {block.months} · {block.count} tasks · {hours(block.hours)}
                </p>
              </div>
              <ul className="mt-3 space-y-2">
                {block.tasks.map((task) => (
                  <li key={task.id}>
                    <label
                      htmlFor={`hm-t-${task.id}`}
                      className="flex min-h-11 cursor-pointer gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <input
                        id={`hm-t-${task.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={doneSet.has(task.id)}
                        onChange={() => toggleDone(task.id)}
                      />
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-semibold ${
                            doneSet.has(task.id) ? "text-[var(--muted-foreground)] line-through" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {task.why}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_STYLE[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            about {task.minutes} min
                          </span>
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))
        : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Seasons follow the India Meteorological Department calendar and zones follow the National
        Building Code climate classification. Time estimates are for a typical two- to three-bedroom
        home. Gas, electrical and roof work should be done by a licensed technician.
      </p>
    </main>
  );
}
