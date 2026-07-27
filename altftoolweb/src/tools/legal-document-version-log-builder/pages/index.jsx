"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileClock, Plus, RotateCcw, Trash2 } from "lucide-react";

import { CHANGE_TYPES, STALE_DAYS, addDays, computeVersionLog } from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const LONG_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ICON_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TYPE_PILL = {
  revision: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  circulated: "bg-[var(--warning-soft)] text-[var(--warning)]",
  execution: "bg-[var(--success-soft)] text-[var(--success)]",
};

function todayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10);
}

function buildDefaults() {
  const base = todayIso();
  return {
    title: "Master Services Agreement",
    today: base,
    entries: [
      {
        id: "v1",
        date: addDays(base, -36),
        author: "A. Sharma",
        reviewer: "Partner",
        type: "revision",
        summary: "First draft prepared from the firm precedent",
      },
      {
        id: "v2",
        date: addDays(base, -32),
        author: "A. Sharma",
        reviewer: "Partner",
        type: "revision",
        summary: "Indemnity and liability cap reworked after partner comments",
      },
      {
        id: "v3",
        date: addDays(base, -26),
        author: "R. Iyer",
        reviewer: "Client",
        type: "circulated",
        summary: "Clean version circulated to the counterparty",
      },
      {
        id: "v4",
        date: addDays(base, -8),
        author: "M. Nair",
        reviewer: "Counterparty counsel",
        type: "revision",
        summary: "Counterparty mark-up accepted except governing-law clause",
      },
    ],
  };
}

const formatDate = (iso) => {
  const parts = String(iso ?? "").split("-");
  if (parts.length !== 3) return DASH;
  const ts = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isFinite(ts) ? LONG_DATE.format(new Date(ts)) : DASH;
};

export default function ToolHome() {
  const [state, setState] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);
  const [seq, setSeq] = useState(0);

  const result = useMemo(
    () => computeVersionLog({ title: state.title, today: state.today, entries: state.entries }),
    [state.title, state.today, state.entries],
  );

  const ok = !result.error;

  const setField = (key) => (event) =>
    setState((prev) => ({ ...prev, [key]: event.target.value }));

  const setEntry = (id, key) => (event) => {
    const value = event.target.value;
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)),
    }));
  };

  const addRow = () => {
    const nextId = `new-${seq}`;
    setSeq((n) => n + 1);
    setState((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        { id: nextId, date: prev.today, author: "", reviewer: "", type: "revision", summary: "" },
      ],
    }));
  };

  const removeRow = (id) =>
    setState((prev) => ({ ...prev, entries: prev.entries.filter((entry) => entry.id !== id) }));

  const reset = () => {
    setState(buildDefaults());
    setCopied(false);
  };

  const copyResult = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileClock className="h-4 w-4" aria-hidden="true" />
          Legal utilities
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Legal Document Version Log Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter each draft with its date, who touched it and what changed. Version numbers are
          assigned automatically on the 0.1 / 1.0 draft convention, the turnaround between rounds is
          measured, and the whole log comes out as a table you can paste into the document.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="vlb-title">
              Document name
            </label>
            <input
              id="vlb-title"
              className={INPUT}
              type="text"
              placeholder="Master Services Agreement"
              value={state.title}
              onChange={setField("title")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="vlb-today">
              Log prepared on
            </label>
            <input
              id="vlb-today"
              className={INPUT}
              type="date"
              value={state.today}
              onChange={setField("today")}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-xs text-[var(--muted-foreground)]">
          {CHANGE_TYPES.map((type) => (
            <p key={type.id}>
              <span className="font-semibold text-[var(--foreground)]">{type.label}</span> —{" "}
              {type.hint}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Versions</h2>
          <button type="button" className={GHOST_BTN} onClick={addRow}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add version
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {state.entries.map((entry, index) => (
            <div
              key={entry.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor={`vlb-date-${entry.id}`}>
                    Date of version {index + 1}
                  </label>
                  <input
                    id={`vlb-date-${entry.id}`}
                    className={INPUT}
                    type="date"
                    value={entry.date}
                    onChange={setEntry(entry.id, "date")}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`vlb-type-${entry.id}`}>
                    Change type
                  </label>
                  <select
                    id={`vlb-type-${entry.id}`}
                    className={INPUT}
                    value={entry.type}
                    onChange={setEntry(entry.id, "type")}
                  >
                    {CHANGE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor={`vlb-author-${entry.id}`}>
                    Drafted by
                  </label>
                  <input
                    id={`vlb-author-${entry.id}`}
                    className={INPUT}
                    type="text"
                    placeholder="A. Sharma"
                    value={entry.author}
                    onChange={setEntry(entry.id, "author")}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className={LABEL} htmlFor={`vlb-reviewer-${entry.id}`}>
                      Reviewed by
                    </label>
                    <input
                      id={`vlb-reviewer-${entry.id}`}
                      className={INPUT}
                      type="text"
                      placeholder="Partner"
                      value={entry.reviewer}
                      onChange={setEntry(entry.id, "reviewer")}
                    />
                  </div>
                  <button
                    type="button"
                    className={ICON_BTN}
                    onClick={() => removeRow(entry.id)}
                    aria-label={`Remove version ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor={`vlb-summary-${entry.id}`}>
                    What changed
                  </label>
                  <textarea
                    id={`vlb-summary-${entry.id}`}
                    className="mt-2 min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    placeholder="Indemnity cap reduced to 12 months' fees"
                    value={entry.summary}
                    onChange={setEntry(entry.id, "summary")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
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
              Current version
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `v${result.currentVersion}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.currentIsFinal
                  ? "Execution version — the log is closed."
                  : result.stale
                    ? `No movement for ${NUM.format(result.daysSinceLastVersion)} days — over the ${STALE_DAYS}-day stale mark.`
                    : `Last touched ${NUM.format(result.daysSinceLastVersion)} day(s) ago.`
                : "Fix the entries above to build the log."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the version log as text"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy log"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the sample version log"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? [
                ["Versions recorded", NUM.format(result.versionCount)],
                ["Internal revisions", NUM.format(result.revisionCount)],
                ["Circulated / execution versions", NUM.format(result.roundCount)],
                ["Days from first to latest version", `${NUM.format(result.spanDays)} days`],
                [
                  "Average turnaround between versions",
                  result.averageGapDays === null
                    ? DASH
                    : `${NUM1.format(result.averageGapDays)} days`,
                ],
                [
                  "Longest gap",
                  result.longestGap === null
                    ? DASH
                    : `${NUM.format(result.longestGap.gapDays)} days before v${result.longestGap.version}`,
                ],
                ["Days since the latest version", NUM.format(result.daysSinceLastVersion)],
                ["Signed / execution version reached", result.executed ? "Yes" : "Not yet"],
              ]
            : [
                ["Versions recorded", DASH],
                ["Days from first to latest version", DASH],
                ["Average turnaround between versions", DASH],
                ["Days since the latest version", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.contributors.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {result.contributors.map((person) => (
              <span
                key={person.name}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                {person.name}: {NUM.format(person.count)}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Revision history</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Version
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Gap
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Drafted / reviewed
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">v{row.version}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.gapDays === null ? DASH : `${NUM.format(row.gapDays)} d`}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="block">{row.author || DASH}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.reviewer || "No reviewer noted"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`mb-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${TYPE_PILL[row.typeId]}`}
                      >
                        {row.typeLabel}
                      </span>
                      <span className="block">{row.summary}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational document-management aid, not legal advice. The numbering convention is a
        drafting practice, not a rule — follow your firm's or client's house style where it differs,
        and keep the authoritative record in your document-management system.
      </p>
    </main>
  );
}
