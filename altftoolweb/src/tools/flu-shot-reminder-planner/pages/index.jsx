"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Syringe } from "lucide-react";

import {
  CHILD_SECOND_DOSE_MIN_DAYS,
  HEMISPHERES,
  HEMISPHERE_LABELS,
  PROTECTION_LEAD_DAYS,
  planFluShot,
} from "../lib";

const DASH = "—";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(year, month - 1, day)));
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_TEXT = {
  "before-window": "The ideal window has not opened yet",
  "in-window": "You are inside the ideal window",
  "late-but-worthwhile": "Past the ideal window, still worth doing",
  "between-seasons": "Between seasons",
};

export default function ToolHome() {
  const [hemisphere, setHemisphere] = useState("northern");
  const [today, setToday] = useState(todayISO);
  const [lastDose, setLastDose] = useState("");
  const [travel, setTravel] = useState("");
  const [firstTimeChild, setFirstTimeChild] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planFluShot({
        hemisphere,
        todayISO: today,
        lastDoseISO: lastDose,
        travelISO: travel,
        firstTimeChild,
      }),
    [hemisphere, today, lastDose, travel, firstTimeChild],
  );

  const ok = !result.error;

  const summaryText = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Flu vaccination plan",
      `${result.hemisphereLabel} · ${result.seasonLabel}`,
      `Ideal window: ${prettyDate(result.windowStartISO)} to ${prettyDate(result.windowEndISO)} (by the ${result.deadlineLabel})`,
      `Book your dose for: ${prettyDate(result.recommendedISO)}`,
      `Protected from: ${prettyDate(result.protectedFromISO)}`,
      `Season peak: ${result.peakLabel}`,
    ];
    if (result.secondDoseISO) {
      lines.push(`Second priming dose: ${prettyDate(result.secondDoseISO)}`);
      lines.push(`Fully protected from: ${prettyDate(result.fullyProtectedISO)}`);
    }
    if (result.travelISO) {
      lines.push(`Travel on ${prettyDate(result.travelISO)} — last useful dose date ${prettyDate(result.latestForTravelISO)}`);
    }
    return lines.join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setHemisphere("northern");
    setToday(todayISO());
    setLastDose("");
    setTravel("");
    setFirstTimeChild(false);
    setCopied(false);
  };

  const rows = ok
    ? [
        ["Season", result.seasonLabel],
        [
          "Ideal window",
          `${prettyDate(result.windowStartISO)} – ${prettyDate(result.windowEndISO)}`,
        ],
        ["Aim to be done by", `the ${result.deadlineLabel}`],
        ["Season peak", result.peakLabel],
        ["Protected from", prettyDate(result.protectedFromISO)],
        [
          "Second priming dose",
          result.secondDoseISO
            ? `${prettyDate(result.secondDoseISO)} (${CHILD_SECOND_DOSE_MIN_DAYS} days later)`
            : "Not needed",
        ],
        [
          "Fully protected from",
          result.secondDoseISO ? prettyDate(result.fullyProtectedISO) : prettyDate(result.protectedFromISO),
        ],
        [
          "Last season's dose",
          result.lastDoseISO
            ? `${prettyDate(result.lastDoseISO)} · ${result.daysSinceLastDose} days ago`
            : "Not entered",
        ],
        [
          "Due for this season",
          result.dueAgain ? "Yes — no dose recorded for this season" : "No — already covered",
        ],
        [
          "Latest useful date for travel",
          result.latestForTravelISO ? prettyDate(result.latestForTravelISO) : "No travel entered",
        ],
      ]
    : [
        ["Season", DASH],
        ["Ideal window", DASH],
        ["Aim to be done by", DASH],
        ["Protected from", DASH],
        ["Due for this season", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Syringe className="h-4 w-4" aria-hidden="true" />
          Seasonal flu
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Flu Shot Reminder Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out the vaccination window for your hemisphere, the date you would actually be
          protected ({PROTECTION_LEAD_DAYS} days after the injection), and whether upcoming travel
          means going earlier.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="flu-hemisphere">
              Where do you live?
            </label>
            <select
              id="flu-hemisphere"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hemisphere}
              onChange={(event) => setHemisphere(event.target.value)}
            >
              {HEMISPHERES.map((key) => (
                <option key={key} value={key}>
                  {HEMISPHERE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flu-today">
              Planning from (today)
            </label>
            <input
              id="flu-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flu-last">
              Last flu vaccination (optional)
            </label>
            <input
              id="flu-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastDose}
              onChange={(event) => setLastDose(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flu-travel">
              Travelling on (optional)
            </label>
            <input
              id="flu-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={travel}
              onChange={(event) => setTravel(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          <input
            id="flu-child"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={firstTimeChild}
            onChange={(event) => setFirstTimeChild(event.target.checked)}
          />
          <label className="text-sm leading-6 text-[var(--foreground)]" htmlFor="flu-child">
            Child aged 6 months to 8 years having a flu vaccine for the first time (needs two doses{" "}
            {CHILD_SECOND_DOSE_MIN_DAYS} days apart)
          </label>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Book your flu shot for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? prettyDate(result.recommendedISO) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.daysUntilRecommended <= 0
                  ? `${STATUS_TEXT[result.status]} — book as soon as you can.`
                  : `${STATUS_TEXT[result.status]} — that is ${result.daysUntilRecommended} days away.`
                : "Fix the highlighted input to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the flu vaccination plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
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

        {ok && (
          <div className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.status === "before-window" && result.daysUntilWindowOpens > 0 && (
              <p>
                The window opens in {result.daysUntilWindowOpens} days. Doses for this season are
                usually available from around {prettyDate(result.availableFromISO)}.
              </p>
            )}
            {result.status === "in-window" && (
              <p>{result.daysLeftInWindow} days left in the ideal window.</p>
            )}
            {result.status === "late-but-worthwhile" && (
              <p>
                Vaccination is still recommended while flu is circulating — about{" "}
                {result.daysLeftInSeason} days of this season remain.
              </p>
            )}
            {result.travelTooSoon && (
              <p>
                Your trip is less than {PROTECTION_LEAD_DAYS} days away, so protection will not be
                fully developed before you leave. Getting the dose now still shortens the unprotected
                period.
              </p>
            )}
            {result.travelISO && !result.travelTooSoon && result.protectedBeforeTravel && (
              <p>
                With a dose on {prettyDate(result.recommendedISO)} you would be protected before
                travelling on {prettyDate(result.travelISO)}.
              </p>
            )}
            {result.hemisphere === "tropical" && (
              <p>
                In equatorial regions flu circulates all year, so the practical rule is one dose every
                12 months and at least {PROTECTION_LEAD_DAYS} days before travel.
              </p>
            )}
            {!result.dueAgain && (
              <p>
                A dose is already recorded for this season, so a repeat is not normally needed until
                the next season&apos;s vaccine is reformulated.
              </p>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational scheduling only. National programmes differ on eligibility, funded age groups
        and which product is used, and some people need a different schedule — check with your
        doctor, nurse or pharmacist before booking.
      </p>
    </main>
  );
}
