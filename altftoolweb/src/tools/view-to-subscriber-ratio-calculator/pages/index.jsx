"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserPlus } from "lucide-react";
import { RATE_BASE_VIEWS, YPP_SUBSCRIBER_REQUIREMENT, computeViewToSubRatio, projectSubscribers } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  views: "250000",
  subsGained: "380",
  previousViews: "200000",
  previousSubsGained: "260",
  currentSubscribers: "4200",
  subscriberGoal: "10000",
  plannedViews: "1000000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [views, setViews] = useState(DEFAULTS.views);
  const [subsGained, setSubsGained] = useState(DEFAULTS.subsGained);
  const [previousViews, setPreviousViews] = useState(DEFAULTS.previousViews);
  const [previousSubsGained, setPreviousSubsGained] = useState(DEFAULTS.previousSubsGained);
  const [currentSubscribers, setCurrentSubscribers] = useState(DEFAULTS.currentSubscribers);
  const [subscriberGoal, setSubscriberGoal] = useState(DEFAULTS.subscriberGoal);
  const [plannedViews, setPlannedViews] = useState(DEFAULTS.plannedViews);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeViewToSubRatio({
        views: toNumber(views),
        subsGained: toNumber(subsGained),
        previousViews: previousViews.trim() === "" ? null : toNumber(previousViews),
        previousSubsGained: previousSubsGained.trim() === "" ? null : toNumber(previousSubsGained),
        currentSubscribers: toNumber(currentSubscribers),
        subscriberGoal: toNumber(subscriberGoal),
      }),
    [views, subsGained, previousViews, previousSubsGained, currentSubscribers, subscriberGoal],
  );

  const projection = useMemo(() => {
    if (result.error) return null;
    return projectSubscribers({ subsPerThousand: result.subsPerThousand, plannedViews: toNumber(plannedViews) });
  }, [result, plannedViews]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "View to Subscriber Ratio",
      `Views: ${NUM.format(result.views)} · Subscribers gained: ${NUM.format(result.subsGained)}`,
      `Subscribers per ${NUM.format(RATE_BASE_VIEWS)} views: ${DEC.format(result.subsPerThousand)}`,
      `Conversion rate: ${DEC.format(result.conversionPct)}%`,
      result.viewsPerSub ? `Views per subscriber: ${NUM.format(Math.round(result.viewsPerSub))}` : null,
      result.viewsForThousandSubs
        ? `Views needed per ${NUM.format(YPP_SUBSCRIBER_REQUIREMENT)} subscribers: ${NUM.format(Math.round(result.viewsForThousandSubs))}`
        : null,
      result.viewsToGoal
        ? `Views still needed for the goal: ${NUM.format(Math.round(result.viewsToGoal))}`
        : null,
      result.trend
        ? `Previous period: ${DEC.format(result.trend.previousRatio)} per 1,000 (${result.trend.direction}${
            result.trend.changePct === null ? "" : ` ${DEC.format(Math.abs(result.trend.changePct))}%`
          })`
        : null,
      `Band: ${result.band.label}`,
    ]
      .filter(Boolean)
      .join("\n");
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
    setViews(DEFAULTS.views);
    setSubsGained(DEFAULTS.subsGained);
    setPreviousViews(DEFAULTS.previousViews);
    setPreviousSubsGained(DEFAULTS.previousSubsGained);
    setCurrentSubscribers(DEFAULTS.currentSubscribers);
    setSubscriberGoal(DEFAULTS.subscriberGoal);
    setPlannedViews(DEFAULTS.plannedViews);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Creator analytics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">View To Subscriber Ratio Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn views and new subscribers into a subscribers-per-1,000-views rate, compare it with your last
          period, and see how many views your current conversion needs to hit a subscriber goal.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">This period</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="v2s-views">
              Views
            </label>
            <input
              id="v2s-views"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={views}
              onChange={(event) => setViews(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="v2s-subs">
              Subscribers gained
            </label>
            <input
              id="v2s-subs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={subsGained}
              onChange={(event) => setSubsGained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="v2s-prev-views">
              Previous period views (optional)
            </label>
            <input
              id="v2s-prev-views"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={previousViews}
              onChange={(event) => setPreviousViews(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="v2s-prev-subs">
              Previous period subscribers (optional)
            </label>
            <input
              id="v2s-prev-subs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={previousSubsGained}
              onChange={(event) => setPreviousSubsGained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="v2s-current">
              Current subscriber count
            </label>
            <input
              id="v2s-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={currentSubscribers}
              onChange={(event) => setCurrentSubscribers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="v2s-goal">
              Subscriber goal
            </label>
            <input
              id="v2s-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={subscriberGoal}
              onChange={(event) => setSubscriberGoal(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="v2s-planned">
              Planned views to project from
            </label>
            <input
              id="v2s-planned"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10000"
              value={plannedViews}
              onChange={(event) => setPlannedViews(event.target.value)}
            />
          </div>
        </div>
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
              Subscribers per 1,000 views
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : DEC.format(result.subsPerThousand)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.band.label} · ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the ratio result" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Conversion rate", hasError ? dash : `${DEC.format(result.conversionPct)}%`],
            [
              "Views per new subscriber",
              hasError || !result.viewsPerSub ? dash : NUM.format(Math.round(result.viewsPerSub)),
            ],
            [
              `Views needed per ${NUM.format(YPP_SUBSCRIBER_REQUIREMENT)} subscribers`,
              hasError || !result.viewsForThousandSubs ? dash : NUM.format(Math.round(result.viewsForThousandSubs)),
            ],
            [
              "Subscribers still needed for goal",
              hasError ? dash : NUM.format(result.remainingToGoal),
            ],
            [
              "Views still needed for goal",
              hasError || result.viewsToGoal === null ? dash : NUM.format(Math.round(result.viewsToGoal)),
            ],
            [
              "Previous period ratio",
              hasError || !result.trend ? dash : `${DEC.format(result.trend.previousRatio)} per 1,000`,
            ],
            [
              "Change vs previous period",
              hasError || !result.trend || result.trend.changePct === null
                ? dash
                : `${result.trend.delta >= 0 ? "+" : "−"}${DEC.format(Math.abs(result.trend.delta))} (${DEC.format(Math.abs(result.trend.changePct))}% ${result.trend.direction})`,
            ],
            [
              "Projected subscribers from planned views",
              hasError || !projection || projection.error ? dash : NUM.format(Math.round(projection.subscribers)),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Projections assume your current conversion rate holds, which it rarely does exactly — a viral video
        usually converts worse per view than your regular audience. Use the figures to compare periods, not
        as a forecast.
      </p>
    </main>
  );
}
