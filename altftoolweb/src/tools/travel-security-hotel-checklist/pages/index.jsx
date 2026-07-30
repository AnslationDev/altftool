"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import { ITEMS, PHASES, PROPERTY_TYPES, isCriticalAt, scoreHotelRoutine } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";
const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

/** First paint: the checks most guests do without thinking, none of the network or camera work. */
const DEFAULT_DONE = ["deadbolt", "peephole", "safe-code", "window-balcony"];
const DEFAULT_PROPERTY = "chain";

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export default function ToolHome() {
  const [doneIds, setDoneIds] = useState(DEFAULT_DONE);
  const [propertyType, setPropertyType] = useState(DEFAULT_PROPERTY);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreHotelRoutine({ doneIds, propertyType }),
    [doneIds, propertyType],
  );
  const hasError = Boolean(result.error);

  const grouped = useMemo(
    () =>
      PHASES.map((phase) => ({
        ...phase,
        items: ITEMS.filter((item) => item.phase === phase.id),
      })),
    [],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Hotel arrival routine — ${result.property.label}`,
      `Readiness: ${result.readinessPercent}% — ${result.band.label}`,
      `Done: ${result.doneCount} of ${result.totalCount} items (${result.earned} of ${result.totalWeight} severity points)`,
      result.criticalOpen.length
        ? `CRITICAL still open: ${result.criticalOpen.map((item) => item.label).join("; ")}`
        : "All critical items are done.",
      result.safeOverconfidence
        ? "Note: you are relying on the in-room safe with nothing at the front desk."
        : "",
      "",
      "By stage:",
      ...result.phases.map((phase) => `${phase.label}: ${phase.done}/${phase.total}`),
      "",
      "Do next:",
      ...result.topThree.map((item, index) => `${index + 1}. ${item.label}`),
      "",
      result.verdict,
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
    setDoneIds(DEFAULT_DONE);
    setPropertyType(DEFAULT_PROPERTY);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Items completed", DASH],
        ["Severity points earned", DASH],
        ["Critical items open", DASH],
        ["Raised to critical here", DASH],
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
        [
          "Raised to critical here",
          result.escalated.length ? NUM.format(result.escalated.length) : "None",
        ],
      ];

  const selectedProperty = PROPERTY_TYPES.find((entry) => entry.id === propertyType);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          Travel security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Hotel Wi-Fi and Safe Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A room-arrival routine covering the door, the network, the in-room safe and the smart
          devices. Which items count as critical changes with the property: a chain hotel is a
          network problem, a short-term rental is a camera and smart-device problem.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className="block text-sm font-semibold" htmlFor="property-type">
          Where are you staying?
        </label>
        <select
          id="property-type"
          className={`mt-2 ${FIELD}`}
          value={propertyType}
          onChange={(event) => setPropertyType(event.target.value)}
        >
          {PROPERTY_TYPES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
        {selectedProperty ? (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {selectedProperty.note}
          </p>
        ) : null}
      </section>

      {grouped.map((phase) => (
        <section
          key={phase.id}
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        >
          <h2 className="text-base font-semibold">{phase.label}</h2>
          <div className="mt-3 grid gap-2">
            {phase.items.map((item) => {
              const critical = isCriticalAt(item, propertyType);
              return (
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
                    {critical ? (
                      <span className="ml-2 rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                        critical here
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {item.why}
                    </span>
                  </span>
                </label>
              );
            })}
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
              Room readiness
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
              aria-label="Copy the hotel security result"
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
              {NUM.format(result.criticalOpen.length)} critical item(s) open for this property type:{" "}
              {result.criticalOpen.map((item) => item.label).join("; ")}.
            </span>
          </p>
        ) : null}

        {!hasError && result.safeOverconfidence ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            You are relying on the in-room safe with nothing lodged at the front desk. The safe
            stops an opportunist; it does not stop anyone holding the override code.
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
              <caption className="sr-only">Completion by stage</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stage
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
        Informational only. Local law on carrying identification, on recording in private
        accommodation and on hotel liability for deposited valuables varies by country — check
        before you rely on any of it. Nothing you tick here leaves your browser.
      </p>
    </main>
  );
}
