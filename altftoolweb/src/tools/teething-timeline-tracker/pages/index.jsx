"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import { addMonths, buildTeethTimeline, parseISODate, toISODate, PRIMARY_TEETH } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DASH = "—";

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Default the date of birth to a 10-month-old so the chart is mid-teething at first paint. */
const defaultBirth = (iso) => {
  const parsed = parseISODate(iso);
  return parsed ? toISODate(addMonths(parsed, -10)) : iso;
};

const STATUS_LABEL = {
  erupted: "Through",
  due: "Due now",
  upcoming: "Later",
  late: "Past window",
};

const STATUS_CLASS = {
  erupted: "text-[var(--success)]",
  due: "text-[var(--primary)]",
  upcoming: "text-[var(--muted-foreground)]",
  late: "text-[var(--danger)]",
};

const prettyDate = (iso) => {
  const parsed = parseISODate(iso);
  if (!parsed) return DASH;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
};

export default function ToolHome() {
  const [asOf, setAsOf] = useState(() => todayIso());
  const [birthDate, setBirthDate] = useState(() => defaultBirth(todayIso()));
  const [eruptedIds, setEruptedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const timeline = useMemo(
    () => buildTeethTimeline({ birthDate, today: asOf, eruptedIds }),
    [birthDate, asOf, eruptedIds],
  );

  const hasError = Boolean(timeline.error);

  const toggleTooth = (id) => {
    setEruptedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    const iso = todayIso();
    setAsOf(iso);
    setBirthDate(defaultBirth(iso));
    setEruptedIds([]);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Teething Timeline Tracker",
      `Age on ${prettyDate(asOf)}: ${timeline.ageLabel}`,
      `Teeth through: ${timeline.eruptedCount} of ${timeline.totalTeeth}`,
      timeline.nextTooth
        ? `Next expected: ${timeline.nextTooth.name} (${prettyDate(timeline.nextTooth.expectedFrom)} to ${prettyDate(timeline.nextTooth.expectedTo)})`
        : "Next expected: all primary teeth recorded",
      `Pairs inside their usual window now: ${timeline.dueNowCount}`,
      `First dental check-up by: ${prettyDate(timeline.firstVisitBy)}`,
      "",
      ...timeline.teeth.map(
        (tooth) =>
          `${tooth.name}: ${prettyDate(tooth.expectedFrom)} - ${prettyDate(tooth.expectedTo)} (${STATUS_LABEL[tooth.status]})`,
      ),
    ].join("\n");
  }, [hasError, timeline, asOf]);

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

  const rows = hasError
    ? [
        ["Age on this date", DASH],
        ["Next tooth pair expected", DASH],
        ["Its usual window", DASH],
        ["Pairs inside their window now", DASH],
        ["Pairs past their usual window", DASH],
        ["Teeth still to come", DASH],
        ["First dental check-up by", DASH],
      ]
    : [
        ["Age on this date", timeline.ageLabel],
        ["Next tooth pair expected", timeline.nextTooth ? timeline.nextTooth.name : "All recorded"],
        [
          "Its usual window",
          timeline.nextTooth
            ? `${prettyDate(timeline.nextTooth.expectedFrom)} – ${prettyDate(timeline.nextTooth.expectedTo)}`
            : DASH,
        ],
        ["Pairs inside their window now", String(timeline.dueNowCount)],
        ["Pairs past their usual window", String(timeline.lateCount)],
        ["Teeth still to come", String(timeline.remainingCount)],
        ["First dental check-up by", prettyDate(timeline.firstVisitBy)],
      ];

  const progress = hasError
    ? 0
    : Math.max(0, Math.min(100, (timeline.eruptedCount / timeline.totalTeeth) * 100));

  const tableRows = hasError ? PRIMARY_TEETH : timeline.teeth;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Teething Timeline Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a date of birth into calendar dates for all 20 baby teeth using the standard primary
          tooth eruption chart, then tick off each pair as it comes through.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ttt-birth">
              Date of birth
            </label>
            <input
              id="ttt-birth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={birthDate}
              onChange={(event) => {
                setBirthDate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ttt-asof">
              Check the chart as at
            </label>
            <input
              id="ttt-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOf}
              onChange={(event) => {
                setAsOf(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {timeline.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Baby teeth through
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${timeline.eruptedCount} of ${timeline.totalTeeth}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the dates above to see the chart." : `Age ${timeline.ageLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the teething timeline"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy timeline"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${Math.round(progress)} percent of the primary teeth have come through`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every tooth pair, in the order they usually arrive</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick a pair once you can see or feel both teeth. Each row covers the left and right tooth.
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Through?
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tooth pair
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Expected window
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Falls out
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((tooth) => (
                <tr key={tooth.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <input
                      id={`ttt-${tooth.id}`}
                      type="checkbox"
                      checked={eruptedIds.includes(tooth.id)}
                      onChange={() => toggleTooth(tooth.id)}
                      className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                  </td>
                  <th scope="row" className="py-2 pr-3 text-left font-semibold">
                    <label htmlFor={`ttt-${tooth.id}`} className="flex min-h-11 flex-col justify-center">
                      <span>{tooth.name}</span>
                      <span className="text-xs font-normal text-[var(--muted-foreground)]">
                        {tooth.eruptMinMonths}-{tooth.eruptMaxMonths} months
                      </span>
                    </label>
                  </th>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {hasError
                      ? DASH
                      : `${prettyDate(tooth.expectedFrom)} – ${prettyDate(tooth.expectedTo)}`}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {tooth.shedMinYears}-{tooth.shedMaxYears} yrs
                  </td>
                  <td className={`py-2 font-semibold ${hasError ? "" : STATUS_CLASS[tooth.status]}`}>
                    {hasError ? DASH : STATUS_LABEL[tooth.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to watch for</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {timeline.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Eruption timing varies widely and a few months either side of these windows
        is normal. Teething does not cause high fever or diarrhoea — see a doctor if your baby is
        genuinely unwell, and see a dentist about teeth that are very late, discoloured or painful.
      </p>
    </main>
  );
}
