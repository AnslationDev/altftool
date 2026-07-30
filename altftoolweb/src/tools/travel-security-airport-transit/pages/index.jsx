"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw, ShieldAlert } from "lucide-react";

import { ITEMS, PHASES, applicableItems, scoreTransitReadiness } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

/** First paint: the things most travellers already have, none of the border discipline. */
const DEFAULT_DONE = ["fde", "findmy", "updates", "nocheck", "powerbank"];

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export default function ToolHome() {
  const [doneIds, setDoneIds] = useState(DEFAULT_DONE);
  const [crossingBorder, setCrossingBorder] = useState(true);
  const [workDevice, setWorkDevice] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreTransitReadiness({ doneIds, crossingBorder, workDevice }),
    [doneIds, crossingBorder, workDevice],
  );
  const hasError = Boolean(result.error);

  const visibleItems = useMemo(
    () => applicableItems({ crossingBorder, workDevice }),
    [crossingBorder, workDevice],
  );

  const visiblePhases = useMemo(
    () =>
      PHASES.filter((phase) => {
        if (phase.context === "border") return crossingBorder;
        if (phase.context === "work") return workDevice;
        return true;
      }).map((phase) => ({
        ...phase,
        items: visibleItems.filter((item) => item.phase === phase.id),
      })),
    [crossingBorder, workDevice, visibleItems],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Airport and transit security check",
      `Readiness: ${result.readinessPercent}% — ${result.band.label}`,
      `Done: ${result.doneCount} of ${result.totalCount} applicable items (${result.earned} of ${result.totalWeight} severity points)`,
      result.criticalOpen.length
        ? `CRITICAL still open: ${result.criticalOpen.map((item) => item.label).join("; ")}`
        : "All critical items are done.",
      "",
      "By phase:",
      ...result.phases.map((phase) => `${phase.label}: ${phase.done}/${phase.total}`),
      "",
      "Do next:",
      ...result.topThree.map((item, index) => `${index + 1}. ${item.label}`),
      "",
      result.verdict,
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
    setDoneIds(DEFAULT_DONE);
    setCrossingBorder(true);
    setWorkDevice(false);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Items completed", DASH],
        ["Severity points earned", DASH],
        ["Critical items open", DASH],
        ["Highest-value gap", DASH],
      ]
    : [
        ["Items completed", `${NUM.format(result.doneCount)} of ${NUM.format(result.totalCount)}`],
        [
          "Severity points earned",
          `${NUM.format(result.earned)} of ${NUM.format(result.totalWeight)}`,
        ],
        [
          "Critical items open",
          `${NUM.format(result.criticalOpen.length)} of ${NUM.format(result.criticalTotal)}`,
        ],
        ["Highest-value gap", result.topThree.length ? result.topThree[0].label : "None left"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Travel security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Airport and Transit Security Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work through the trip in order: home, the security queue, the lounge and cabin, and the
          border. Four items are marked critical — encryption, a real passcode, and powering
          devices off before immigration — and leaving any of them undone caps the score however
          much else is ticked.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">This trip</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="ctx-border">
            <input
              id="ctx-border"
              type="checkbox"
              className={CHECKBOX}
              checked={crossingBorder}
              onChange={(event) => setCrossingBorder(event.target.checked)}
            />
            <span className="leading-6">Crossing an international border</span>
          </label>
          <label className={CHECK_ROW} htmlFor="ctx-work">
            <input
              id="ctx-work"
              type="checkbox"
              className={CHECKBOX}
              checked={workDevice}
              onChange={(event) => setWorkDevice(event.target.checked)}
            />
            <span className="leading-6">Carrying a work-owned device</span>
          </label>
        </div>
      </section>

      {visiblePhases.map((phase) => (
        <section key={phase.id} className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">{phase.label}</h2>
          <div className="mt-3 grid gap-2">
            {phase.items.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`item-${item.id}`}>
                <input
                  id={`item-${item.id}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={doneIds.includes(item.id)}
                  onChange={() => setDoneIds((current) => toggle(current, item.id))}
                />
                <span className="leading-6">
                  <span className="font-medium">{item.label}</span>
                  {item.critical ? (
                    <span className="ml-2 rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                      critical
                    </span>
                  ) : null}
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.why}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Transit readiness
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]}`}
            >
              {hasError ? DASH : `${NUM.format(result.readinessPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? DASH : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the transit security result"
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
              aria-label="Reset the checklist to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.criticalOpen.length ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {NUM.format(result.criticalOpen.length)} critical item(s) open:{" "}
              {result.criticalOpen.map((item) => item.label).join("; ")}.
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the selection above to see a verdict." : result.verdict}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <caption className="sr-only">Completion by phase</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Phase
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Done
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Complete
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.phases.map((phase) => (
                  <tr key={phase.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">{phase.label}</td>
                    <td className="py-2.5 pr-3">
                      {NUM.format(phase.done)} / {NUM.format(phase.total)}
                    </td>
                    <td className="py-2.5 font-semibold">{NUM.format(phase.percent)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && result.topThree.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Do these next
            </h3>
            <ol className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.topThree.map((item, index) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">{index + 1}.</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Border officers' powers to inspect, copy or retain
        devices differ sharply between countries, and refusing a request carries different
        consequences in each — check the rules for your destination and your employer's policy
        before you fly. Nothing you tick here leaves your browser.
      </p>
    </main>
  );
}
