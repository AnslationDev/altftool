"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, RotateCcw } from "lucide-react";

import {
  PRIORITY_LABELS,
  PROFILE_KEYS,
  PROFILE_LABELS,
  buildAddressChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULT_PROFILE = {
  ownsVehicle: true,
  isTenant: true,
  hasKids: false,
  investsInMarkets: true,
  runsBusiness: false,
  hasCompany: false,
  ownsNewHome: false,
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

export default function ToolHome() {
  const [today, setToday] = useState(todayIso);
  const [moveDate, setMoveDate] = useState(todayIso);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildAddressChecklist({ moveDate, today, profile, done }),
    [moveDate, today, profile, done],
  );

  const hasError = Boolean(result.error);

  const toggleProfile = (key) => (event) => {
    const next = event.target.checked;
    setProfile((current) => ({ ...current, [key]: next }));
  };

  const toggleItem = (key) => () => {
    setDone((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      `Address change checklist — moved ${prettyDate(result.moveDate)}`,
      `${result.doneCount}/${result.totalItems} done · ${result.lateCount} statutory deadline(s) missed`,
      "",
    ];
    for (const group of result.groups) {
      lines.push(group.title.toUpperCase());
      for (const item of group.items) {
        const due = item.dueDate ? ` (due ${prettyDate(item.dueDate)})` : "";
        lines.push(`  [${item.done ? "x" : " "}] ${item.title}${due} — ${item.how}`);
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
    const fresh = todayIso();
    setToday(fresh);
    setMoveDate(fresh);
    setProfile(DEFAULT_PROFILE);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Address Change Checklist India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Everywhere your address has to change after relocating in India — Aadhaar, electoral roll,
          RC, bank KYC, utilities and the rest — filtered to your situation, with the statutory
          30-day and 15-day windows dated from the day you moved.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-move">
              Date the address changed
            </label>
            <input
              id="ac-move"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={moveDate}
              onChange={(event) => setMoveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-today">
              Today
            </label>
            <input
              id="ac-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Which of these apply?</legend>
          <div className="mt-2 grid gap-2">
            {PROFILE_KEYS.map((key) => (
              <label
                key={key}
                htmlFor={`ac-p-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`ac-p-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={Boolean(profile[key])}
                  onChange={toggleProfile(key)}
                />
                <span>{PROFILE_LABELS[key]}</span>
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
              Records to update
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalItems)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the dates above to build the list."
                : `${result.doneCount} done · ${result.daysSinceMove} day(s) since the move`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the address change checklist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the dates, profile and ticked items"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Progress", hasError ? DASH : `${NUM.format(result.percentDone)}%`],
            ["Statutory deadlines in your list", hasError ? DASH : NUM.format(result.deadlines.length)],
            ["Statutory deadlines already missed", hasError ? DASH : NUM.format(result.lateCount)],
            ["High-priority items still open", hasError ? DASH : NUM.format(result.openHigh)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.deadlines.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Statutory deadlines</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Filing
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Days left
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.deadlines.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{item.title}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        Within {item.deadlineDays} days of the change
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {prettyDate(item.dueDate)}
                    </td>
                    <td
                      className={`py-2 text-right whitespace-nowrap font-semibold ${
                        item.late ? "text-[var(--danger)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {item.done ? "Done" : NUM.format(item.daysLeft)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.lateCount > 0 ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {NUM.format(result.lateCount)} statutory window has already closed. File as soon as you
              can and ask the department about a late filing — penalties and procedures differ.
            </p>
          ) : null}
        </section>
      ) : null}

      {hasError
        ? null
        : result.groups.map((group) => (
            <section
              key={group.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{group.title}</h2>
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {group.doneCount}/{group.items.length}
                </p>
              </div>
              {group.note ? (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{group.note}</p>
              ) : null}
              <div className="mt-3 grid gap-2">
                {group.items.map((item) => (
                  <label
                    key={item.key}
                    htmlFor={`ac-${item.key}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  >
                    <input
                      id={`ac-${item.key}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={item.done}
                      onChange={toggleItem(item.key)}
                    />
                    <span className="flex-1">
                      <span className={item.done ? "font-semibold line-through" : "font-semibold"}>
                        {item.title}
                      </span>
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                          item.priority === "statutory"
                            ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {PRIORITY_LABELS[item.priority]}
                      </span>
                      <span className="mt-1 block text-[var(--muted-foreground)]">{item.how}</span>
                      {item.detail ? (
                        <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      ) : null}
                      {item.dueDate ? (
                        <span
                          className={`mt-1 block text-xs font-semibold ${
                            item.late ? "text-[var(--danger)]" : "text-[var(--primary)]"
                          }`}
                        >
                          Due {prettyDate(item.dueDate)}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or tax advice. Forms, fees, portals and state-level procedures
        change — confirm the current requirement with the department concerned, or with a lawyer or
        chartered accountant, before you rely on it. Nothing you tick leaves your browser.
      </p>
    </main>
  );
}
