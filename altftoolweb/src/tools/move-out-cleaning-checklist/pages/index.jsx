"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SprayCan } from "lucide-react";

import { WEIGHT_LABELS, buildCleaningPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DEFAULTS = {
  bathrooms: "2",
  bedrooms: "2",
  living: "1",
  includeOutdoor: false,
  hourlyRate: "300",
  deposit: "60000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const formatDuration = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0 min";
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${NUM.format(hours)} h`;
  return `${NUM.format(hours)} h ${rest} min`;
};

export default function ToolHome() {
  const [bathrooms, setBathrooms] = useState(DEFAULTS.bathrooms);
  const [bedrooms, setBedrooms] = useState(DEFAULTS.bedrooms);
  const [living, setLiving] = useState(DEFAULTS.living);
  const [includeOutdoor, setIncludeOutdoor] = useState(DEFAULTS.includeOutdoor);
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCleaningPlan({
        rooms: {
          bathroom: bathrooms === "" ? 0 : Number(bathrooms),
          bedroom: bedrooms === "" ? 0 : Number(bedrooms),
          living: living === "" ? 0 : Number(living),
        },
        includeOutdoor,
        done,
        hourlyRate: hourlyRate === "" ? 0 : Number(hourlyRate),
        deposit: deposit === "" ? 0 : Number(deposit),
      }),
    [bathrooms, bedrooms, living, includeOutdoor, done, hourlyRate, deposit],
  );

  const hasError = Boolean(result.error);

  const toggleTask = (key) => () => {
    setDone((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      "Move-out cleaning plan",
      result.verdict,
      `Done: ${result.doneCount}/${result.totalTasks} (${result.percentDone}% by weight)`,
      `Work left: ${formatDuration(result.remainingMinutes)} of ${formatDuration(result.totalMinutes)}`,
      `At ${INR.format(result.hourlyRate)}/hour that is about ${INR.format(result.estimatedCost)} of work`,
      "",
    ];
    for (const section of result.sections) {
      lines.push(`${section.name}${section.countable ? ` x ${section.count}` : ""}`);
      for (const task of section.tasks) {
        lines.push(`  [${task.done ? "x" : " "}] ${task.text} (${formatDuration(task.minutes)})`);
      }
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
    if (!window.confirm("Reset the checklist? This clears every ticked task and cannot be undone.")) {
      return;
    }
    setBathrooms(DEFAULTS.bathrooms);
    setBedrooms(DEFAULTS.bedrooms);
    setLiving(DEFAULTS.living);
    setIncludeOutdoor(DEFAULTS.includeOutdoor);
    setHourlyRate(DEFAULTS.hourlyRate);
    setDeposit(DEFAULTS.deposit);
    setDone([]);
    setCopied(false);
  };

  const levelTone =
    !hasError && result.level === "ready"
      ? "text-[var(--success)]"
      : !hasError && result.level === "risk"
        ? "text-[var(--danger)]"
        : "text-[var(--primary)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SprayCan className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Move Out Cleaning Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The jobs that actually show up in deposit deductions — oven, limescale, grout mould, carpet
          stains, wall marks, rubbish left behind — room by room, with a professional time allowance
          for each and what the remaining work would cost.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mo-bedrooms">
              Bedrooms
            </label>
            <input
              id="mo-bedrooms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mo-bathrooms">
              Bathrooms
            </label>
            <input
              id="mo-bathrooms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={bathrooms}
              onChange={(event) => setBathrooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mo-living">
              Living / dining rooms
            </label>
            <input
              id="mo-living"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={living}
              onChange={(event) => setLiving(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mo-rate">
              Cleaner&apos;s rate (₹ per hour)
            </label>
            <input
              id="mo-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10000"
              step="25"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mo-deposit">
              Deposit held (₹)
            </label>
            <input
              id="mo-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
          </div>
        </div>

        <label
          htmlFor="mo-outdoor"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        >
          <input
            id="mo-outdoor"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeOutdoor}
            onChange={(event) => setIncludeOutdoor(event.target.checked)}
          />
          <span>There is a balcony, garden or parking space to hand back</span>
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cleaning still to do
            </p>
            <p className={`mt-1 text-4xl font-semibold ${levelTone}`}>
              {hasError ? DASH : formatDuration(result.remainingMinutes)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to build the plan." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the move-out cleaning plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Whole job", hasError ? DASH : `${formatDuration(result.totalMinutes)} (${DEC.format(result.totalHours)} h)`],
            ["Tasks done", hasError ? DASH : `${NUM.format(result.doneCount)} / ${NUM.format(result.totalTasks)}`],
            ["Progress, weighted by risk", hasError ? DASH : `${NUM.format(result.percentDone)}%`],
            ["Deduction magnets still open", hasError ? DASH : NUM.format(result.openCritical.length)],
            ["Remaining work priced at your rate", hasError ? DASH : INR.format(result.estimatedCost)],
            [
              "As a share of the deposit",
              hasError ? DASH : result.depositShare === null ? "Enter a deposit above" : `${NUM.format(result.depositShare)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${result.percentDone}% of the weighted cleaning work is done`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percentDone))}%` }}
              />
            </div>
          </div>
        ) : null}
      </section>

      {!hasError && result.openCritical.length > 0 ? (
        <section
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <p className="font-semibold">Do these first — they are the usual deduction lines:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.openCritical.map((task) => (
              <li key={task.key}>{task.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasError
        ? null
        : result.sections.map((section) => (
            <section
              key={section.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">
                  {section.name}
                  {section.countable && section.count > 1 ? (
                    <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                      × {section.count}
                    </span>
                  ) : null}
                </h2>
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {section.doneCount}/{section.tasks.length} · {formatDuration(section.remainingMinutes)} left
                </p>
              </div>
              <div className="mt-3 grid gap-2">
                {section.tasks.map((task) => (
                  <label
                    key={task.key}
                    htmlFor={`mo-${task.key}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  >
                    <input
                      id={`mo-${task.key}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={task.done}
                      onChange={toggleTask(task.key)}
                    />
                    <span className="flex-1">
                      <span className={task.done ? "text-[var(--muted-foreground)] line-through" : ""}>
                        {task.text}
                      </span>
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                          task.weight === "critical"
                            ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {WEIGHT_LABELS[task.weight]} · {formatDuration(task.minutes)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Practical guidance, not legal advice. The standard you owe is normally the condition recorded
        at check-in, less fair wear and tear — what can actually be deducted depends on your agreement,
        the inventory and local tenancy law. Dated photographs taken after cleaning are the single
        most useful thing you can produce in a dispute.
      </p>
    </main>
  );
}
