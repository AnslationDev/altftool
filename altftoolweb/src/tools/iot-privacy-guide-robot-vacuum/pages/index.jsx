"use client";

import { useMemo, useState } from "react";
import { Bot, Check, Copy, Map, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  FEATURES,
  GROUPS,
  profileDataFootprint,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;
const DEFAULT_FEATURES = ["cloud-map", "cloud-schedule", "app-location"];

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [enabled, setEnabled] = useState(() => DEFAULT_FEATURES.slice());
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const footprint = useMemo(() => profileDataFootprint(enabled), [enabled]);

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const toggleFeature = (id) => {
    setEnabled((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setEnabled(DEFAULT_FEATURES.slice());
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "Robot Vacuum Mapping Privacy",
      `Setup score: ${score.percent}% — ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
    ];
    if (!footprint.error) {
      lines.push(
        `Data footprint: ${footprint.percent}% — ${footprint.bandLabel} (${footprint.exposedCount} of ${footprint.totalClasses} data types leaving the home)`
      );
      for (const entry of footprint.classes.filter((item) => item.exposed)) {
        lines.push(`- ${entry.label}`);
      }
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every control is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [score, footprint]);

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

  const hasScore = !score.error;
  const hasFootprint = !footprint.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bot className="h-4 w-4" aria-hidden="true" />
          Home IoT security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Robot Vacuum Mapping Privacy Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A LIDAR map is a measured survey of your home, and camera models add photographs taken at
          ankle height. Tick the controls you have applied, then switch off the cloud features you
          do not need and watch which categories of household data stop leaving the house.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Privacy setup score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the robot vacuum privacy result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the guide" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Setup score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical controls missing",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Score band", hasScore ? score.bandLabel : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical control is open. Tick every
              control marked critical to score higher.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">What leaves your home right now</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the cloud features you have switched on. Each one is mapped to the categories of
          household data it sends out, so you can see which toggle is actually carrying the risk.
        </p>

        <ul className="mt-4 space-y-2">
          {FEATURES.map((feature) => (
            <li key={feature.id}>
              <label
                htmlFor={`feature-${feature.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
              >
                <input
                  id={`feature-${feature.id}`}
                  type="checkbox"
                  checked={enabled.includes(feature.id)}
                  onChange={() => toggleFeature(feature.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                />
                <span className="text-sm font-semibold">{feature.label}</span>
              </label>
            </li>
          ))}
        </ul>

        {footprint.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {footprint.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Household data footprint
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {hasFootprint ? `${footprint.percent}%` : DASH}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {hasFootprint ? footprint.bandLabel : DASH}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {hasFootprint ? footprint.bandHint : "Fix the problem above to see a footprint."}
          </p>

          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "Data types leaving the home",
                hasFootprint ? `${footprint.exposedCount} of ${footprint.totalClasses}` : DASH,
              ],
              [
                "Highly sensitive types exposed",
                hasFootprint ? NUM.format(footprint.highSensitivityExposed) : DASH,
              ],
              ["Cloud features switched on", hasFootprint ? NUM.format(footprint.enabledCount) : DASH],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {hasFootprint ? (
            <ul className="mt-4 space-y-2 text-sm">
              {footprint.classes.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{entry.label}</span>
                    <span
                      className={
                        entry.exposed
                          ? "rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]"
                          : "rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--success)]"
                      }
                    >
                      {entry.exposed ? "Leaving the home" : "Stays local"}
                    </span>
                  </span>
                  <span className="mt-1 block leading-6 text-[var(--muted-foreground)]">
                    {entry.why}
                  </span>
                  {entry.exposed ? (
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      Because of: {entry.drivers.join("; ")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {hasFootprint && footprint.reducers.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Switching one of these off changes something
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {footprint.reducers.map((entry) => (
                  <li key={entry.id} className="flex gap-2">
                    <span className="font-semibold text-[var(--primary)]">-{entry.removedCount}</span>
                    <span>
                      {entry.label} &mdash; stops sending {entry.removes.join(", ").toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggleStep(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Accepting the product-improvement consent during setup, which is the route by which raw
            images reach human reviewers.
          </li>
          <li>
            Keeping maps of a flat you moved out of two years ago, because deleting them was never
            part of moving.
          </li>
          <li>
            Naming rooms after the people who sleep in them, then linking the map to two voice
            assistants.
          </li>
          <li>
            Selling or giving away the robot without a factory reset, which leaves the map and the
            Wi-Fi credentials on board.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; nothing is stored or sent. Which
        features upload what varies by brand, model and firmware, so treat the footprint as a way to
        prioritise your settings review, then confirm against the vendor&rsquo;s own privacy page.
      </p>
    </main>
  );
}
