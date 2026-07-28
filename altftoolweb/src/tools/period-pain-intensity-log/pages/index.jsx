"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, Copy, PlusCircle, RotateCcw, Trash2 } from "lucide-react";

import {
  PAIN_BANDS,
  PAIN_MAX,
  PAIN_MIN,
  RELIEF_METHODS,
  SEVERE_THRESHOLD,
  reliefComparison,
  summariseLog,
  validateEntry,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const score = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM0.format(value)}%` : DASH);

const STORAGE_KEY = "altft-period-pain-log-v1";

const SEED_ENTRIES = [
  { id: 1, date: "2026-06-02", cycleDay: 1, pain: 8, methods: ["heat", "nsaid"], note: "Worst day" },
  { id: 2, date: "2026-06-03", cycleDay: 2, pain: 5, methods: ["heat"], note: "" },
  { id: 3, date: "2026-07-01", cycleDay: 1, pain: 7, methods: ["nsaid"], note: "" },
  { id: 4, date: "2026-07-02", cycleDay: 2, pain: 3, methods: [], note: "" },
];

const BLANK_DRAFT = { date: "2026-07-28", cycleDay: "1", pain: "5", methods: [], note: "" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {
      // unreadable storage: keep the seed entries
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // storage may be full or blocked; the log still works in memory
    }
  }, [entries, loaded]);

  const summary = useMemo(() => summariseLog(entries), [entries]);
  const relief = useMemo(() => reliefComparison(entries), [entries]);
  const ok = !summary.error;

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries],
  );

  const addEntry = () => {
    const checked = validateEntry({
      date: draft.date,
      cycleDay: toNumber(draft.cycleDay),
      pain: toNumber(draft.pain),
      methods: draft.methods,
      note: draft.note,
    });
    if (checked.error) {
      setFormError(checked.error);
      return;
    }
    setFormError("");
    setEntries((current) => {
      const nextId = current.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
      return [...current, { id: nextId, ...checked.entry }];
    });
    setDraft((current) => ({ ...BLANK_DRAFT, date: current.date }));
  };

  const removeEntry = (id) => {
    setEntries((current) => current.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setEntries([]);
    setDraft(BLANK_DRAFT);
    setFormError("");
    setCopied(false);
  };

  const toggleMethod = (id) => {
    setDraft((current) => ({
      ...current,
      methods: current.methods.includes(id)
        ? current.methods.filter((item) => item !== id)
        : [...current.methods, id],
    }));
  };

  const summaryText = useMemo(() => {
    if (!ok) return "";
    return [
      "Period Pain Intensity Log",
      `Entries: ${NUM0.format(summary.count)} between ${summary.firstDate} and ${summary.lastDate}`,
      `Average pain: ${score(summary.averagePain)} / ${PAIN_MAX}${summary.averageBand ? ` (${summary.averageBand.label})` : ""}`,
      `Worst day: ${summary.peakPain} / ${PAIN_MAX} on ${summary.worstEntry.date}, cycle day ${summary.worstEntry.cycleDay}`,
      `Days in the severe band (${SEVERE_THRESHOLD}+): ${NUM0.format(summary.severeCount)}`,
      "By cycle day:",
      ...summary.byCycleDay.map(
        (row) => `  Day ${row.cycleDay}: average ${score(row.averagePain)}, peak ${row.peakPain}`,
      ),
      ...summary.flags.map((flag) => `Note: ${flag}`),
    ].join("\n");
  }, [ok, summary]);

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

  const rows = [
    ["Entries logged", ok ? NUM0.format(summary.count) : DASH],
    ["Date range", ok ? `${summary.firstDate} to ${summary.lastDate}` : DASH],
    [
      "Worst day",
      ok
        ? `${summary.peakPain} / ${PAIN_MAX} on ${summary.worstEntry.date} (cycle day ${summary.worstEntry.cycleDay})`
        : DASH,
    ],
    ["Lowest logged score", ok ? `${summary.lowestPain} / ${PAIN_MAX}` : DASH],
    [`Days in the severe band (${SEVERE_THRESHOLD}+)`, ok ? NUM0.format(summary.severeCount) : DASH],
    ["Share of days that were severe", ok ? pct(summary.severeShare) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Cycle tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Period Pain Intensity Log
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record cramp intensity on the 0-10 Numeric Rating Scale used in clinics, note what you
          tried, and see how the pattern sits across cycle days. Entries stay in this browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add an entry</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pain-date">
              Date
            </label>
            <input
              id="pain-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={draft.date}
              onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pain-cycle-day">
              Cycle day (day 1 is the first day of bleeding)
            </label>
            <input
              id="pain-cycle-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="45"
              step="1"
              value={draft.cycleDay}
              onChange={(event) =>
                setDraft((current) => ({ ...current, cycleDay: event.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pain-score">
              Pain score ({PAIN_MIN} = none, {PAIN_MAX} = worst imaginable)
            </label>
            <input
              id="pain-score"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={PAIN_MIN}
              max={PAIN_MAX}
              step="1"
              value={draft.pain}
              onChange={(event) => setDraft((current) => ({ ...current, pain: event.target.value }))}
            />
            <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
              {draft.pain} / {PAIN_MAX}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className={LABEL_CLASS}>What you used</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {RELIEF_METHODS.map((method) => {
                const active = draft.methods.includes(method.id);
                return (
                  <button
                    key={method.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleMethod(method.id)}
                    className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pain-note">
              Note (optional)
            </label>
            <input
              id="pain-note"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={200}
              value={draft.note}
              onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            />
          </div>
        </div>

        {formError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addEntry}
            className={PRIMARY_BTN}
            aria-label="Add this entry to the log"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Add entry
          </button>
          <button
            type="button"
            onClick={clearAll}
            className={GHOST_BTN}
            aria-label="Clear the whole log"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear log
          </button>
        </div>
      </section>

      {summary.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Average pain across the log
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${score(summary.averagePain)} / ${PAIN_MAX}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok && summary.averageBand
                ? `${summary.averageBand.label} band across ${NUM0.format(summary.count)} logged days`
                : "Add an entry to see a summary."}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the pain log summary"
            className={GHOST_BTN}
            disabled={!ok}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={summary.bandCounts
                .map((band) => `${band.label} ${pct(band.share)}`)
                .join(", ")}
            >
              {summary.bandCounts.map((band) => (
                <span
                  key={band.id}
                  className={
                    band.id === "severe"
                      ? "block h-full bg-[var(--danger)]"
                      : band.id === "moderate"
                        ? "block h-full bg-[var(--primary)]"
                        : "block h-full bg-[var(--success)]"
                  }
                  style={{ width: `${band.share}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {summary.bandCounts
                .filter((band) => band.count > 0)
                .map((band) => `${band.label} ${pct(band.share)}`)
                .join(" · ")}
            </p>
          </div>
        ) : null}

        {ok && summary.flags.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {summary.flags.map((flag) => (
              <li
                key={flag}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 text-[var(--danger)]"
              >
                {flag}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Pain by cycle day</h2>
          <table className="mt-3 w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Cycle day
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Entries
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Average
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Peak
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.byCycleDay.map((row) => (
                <tr key={row.cycleDay} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">Day {row.cycleDay}</td>
                  <td className="py-2 pr-3 text-right">{NUM0.format(row.entries)}</td>
                  <td className="py-2 pr-3 text-right">{score(row.averagePain)}</td>
                  <td className="py-2 text-right font-semibold">{row.peakPain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {relief.length > 0 ? (
        <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Relief methods you logged</h2>
          <table className="mt-3 w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Method
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Days used
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Average when used
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Average when not
                </th>
              </tr>
            </thead>
            <tbody>
              {relief.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM0.format(row.uses)}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{score(row.averageWith)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.averageWithout === null ? DASH : score(row.averageWithout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Read this as description, not proof. You reach for stronger relief on your worst days, so
            a method can show a higher average simply because it was used when the pain was already
            high.
          </p>
        </section>
      ) : null}

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your entries</h2>
        {sortedEntries.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            The log is empty. Add an entry above to start tracking.
          </p>
        ) : (
          <table className="mt-3 w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Day
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Pain
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Used
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 whitespace-nowrap">{item.date}</td>
                  <td className="py-2 pr-3 text-right">{item.cycleDay}</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {item.pain} / {PAIN_MAX}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {!item.methods || item.methods.length === 0
                      ? "Nothing"
                      : item.methods
                          .map(
                            (id) =>
                              (RELIEF_METHODS.find((method) => method.id === id) || {}).label || id,
                          )
                          .join(", ")}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeEntry(item.id)}
                      aria-label={`Remove the entry for ${item.date}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The 0-10 scale</h2>
        <table className="mt-3 w-full min-w-[300px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Score
              </th>
              <th scope="col" className="py-2 font-semibold">
                Band
              </th>
            </tr>
          </thead>
          <tbody>
            {PAIN_BANDS.map((band) => (
              <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3 whitespace-nowrap">
                  {band.min === band.max ? band.min : `${band.min}-${band.max}`}
                </td>
                <td className="py-2 font-semibold">{band.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not a diagnosis. Period pain that stops you going to work or school,
        gets worse over time, does not respond to over-the-counter painkillers, or comes with heavy
        bleeding, fever or pain during sex should be assessed by a clinician — conditions such as
        endometriosis and fibroids are common and treatable. Entries are stored in this browser only.
      </p>
    </main>
  );
}
