"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Ear, RotateCcw, Trash2 } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  EAR_OPTIONS,
  MIN_DAYS_PER_TRIGGER_GROUP,
  RED_FLAGS,
  SCALE_MAX,
  SCALE_MIN,
  SOUND_TYPES,
  TRIGGERS,
  checkRedFlags,
  diaryToText,
  summariseDiary,
  todayIso,
  triggerAssociations,
  validateEntry,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const STORAGE_KEY = "altft-tinnitus-sound-diary-v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EXAMPLE_ROWS = [
  { date: "2026-07-22", loudness: 3, annoyance: 3, triggers: ["caffeine"], sleepHours: 7, note: "Quiet office day" },
  { date: "2026-07-23", loudness: 5, annoyance: 4, triggers: ["poorsleep"], sleepHours: 5, note: "" },
  { date: "2026-07-24", loudness: 4, annoyance: 4, triggers: [], sleepHours: 8, note: "" },
  { date: "2026-07-25", loudness: 7, annoyance: 6, triggers: ["loudnoise", "stress"], sleepHours: 6, note: "Live music" },
  { date: "2026-07-26", loudness: 6, annoyance: 5, triggers: ["stress"], sleepHours: 6, note: "" },
  { date: "2026-07-27", loudness: 4, annoyance: 3, triggers: [], sleepHours: 8, note: "Rest day" },
];

const EXAMPLE_ENTRIES = EXAMPLE_ROWS.map((row) => validateEntry(row)).filter((entry) => !entry.error);

/** Which count(s) fall short of MIN_DAYS_PER_TRIGGER_GROUP, named accurately either way. */
function describeInsufficientData(row) {
  const parts = [];
  if (row.withCount < MIN_DAYS_PER_TRIGGER_GROUP) {
    parts.push(`${row.withCount} day${row.withCount === 1 ? "" : "s"} with it noted`);
  }
  if (row.withoutCount < MIN_DAYS_PER_TRIGGER_GROUP) {
    parts.push(`${row.withoutCount} day${row.withoutCount === 1 ? "" : "s"} without it noted`);
  }
  return `${parts.join(", ")} — too few to compare`;
}

const BLANK_DRAFT = {
  date: "",
  loudness: "4",
  annoyance: "4",
  ear: "both",
  soundType: "ringing",
  triggers: [],
  sleepHours: "",
  note: "",
};

export default function ToolHome() {
  // `savedEntries` is the one and only source of truth for the user's real
  // diary. `usingExamples` only controls what is *displayed* (a read-only
  // preview of demo rows) - it never substitutes for or overwrites
  // savedEntries, so previewing examples can no longer destroy real data
  // (see addEntry/clearAll/removeEntry below, which all operate on
  // savedEntries regardless of what is currently on screen).
  const [savedEntries, setSavedEntries] = useState([]);
  const [usingExamples, setUsingExamples] = useState(true);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [flags, setFlags] = useState({});
  const [formError, setFormError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const entries = usingExamples ? EXAMPLE_ENTRIES : savedEntries;

  useEffect(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.map((row) => validateEntry(row)).filter((entry) => !entry.error);
          if (clean.length > 0) {
            setSavedEntries(clean);
            setUsingExamples(false);
          }
        }
      } catch {
        /* corrupted store: keep the examples */
      }
    }
    setDraft((prev) => ({ ...prev, date: todayIso() }));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEntries));
    } catch {
      /* storage unavailable — the diary still works for this session */
    }
  }, [savedEntries, loaded]);

  const summary = useMemo(() => summariseDiary(entries), [entries]);
  const associations = useMemo(() => triggerAssociations(entries), [entries]);
  const activeFlags = useMemo(() => checkRedFlags(flags), [flags]);

  const addEntry = () => {
    const entry = validateEntry({
      date: draft.date,
      loudness: draft.loudness === "" ? NaN : Number(draft.loudness),
      annoyance: draft.annoyance === "" ? NaN : Number(draft.annoyance),
      ear: draft.ear,
      soundType: draft.soundType,
      triggers: draft.triggers,
      sleepHours: draft.sleepHours,
      note: draft.note,
    });
    if (entry.error) {
      setFormError(entry.error);
      return;
    }
    setFormError("");
    // Always builds on the real saved diary — never on whatever example
    // rows might currently be previewed on screen.
    setSavedEntries((prev) => {
      const base = prev.filter((row) => row.date !== entry.date);
      return [...base, entry].sort((a, b) => a.dayNumber - b.dayNumber);
    });
    setUsingExamples(false);
    setDraft((prev) => ({ ...prev, triggers: [], note: "" }));
  };

  const removeEntry = (date) => {
    setSavedEntries((prev) => prev.filter((row) => row.date !== date));
    setUsingExamples(false);
  };

  const clearAll = () => {
    if (savedEntries.length === 0) {
      // Nothing real to lose — either already empty or only the example
      // preview is showing. No confirmation needed.
      setUsingExamples(false);
      return;
    }
    if (
      !window.confirm(
        usingExamples
          ? `You are previewing example data, but you still have ${savedEntries.length} real saved ${savedEntries.length === 1 ? "entry" : "entries"} underneath it. Delete them permanently? This cannot be undone.`
          : "Delete every entry in your diary? This cannot be undone.",
      )
    ) {
      return;
    }
    setSavedEntries([]);
    setUsingExamples(false);
  };

  const restoreExamples = () => {
    setUsingExamples(true);
    setFormError("");
  };

  const toggleDraftTrigger = (id) => {
    setDraft((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(id)
        ? prev.triggers.filter((item) => item !== id)
        : [...prev.triggers, id],
    }));
  };

  const copyResult = () => {
    if (summary.error) return;
    copy("diary", diaryToText(entries, summary), { label: "Diary" });
  };

  const sorted = summary.error ? [] : summary.sorted.slice().reverse();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ear className="h-4 w-4" aria-hidden="true" />
          Hearing health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tinnitus Sound Diary</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rate loudness and annoyance out of ten each day, note what was going on, and see the
          averages, the trend and which noted triggers line up with worse days. Entries stay in this
          browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Today&rsquo;s entry</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tsd-date">
              Date
            </label>
            <input
              id="tsd-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              max={todayIso()}
              value={draft.date}
              onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsd-sleep">
              Sleep last night (hours, optional)
            </label>
            <input
              id="tsd-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={draft.sleepHours}
              onChange={(event) => setDraft((prev) => ({ ...prev, sleepHours: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsd-loudness">
              Loudness ({draft.loudness} of {SCALE_MAX})
            </label>
            <input
              id="tsd-loudness"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={SCALE_MIN}
              max={SCALE_MAX}
              step="1"
              value={draft.loudness}
              onChange={(event) => setDraft((prev) => ({ ...prev, loudness: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsd-annoyance">
              Annoyance ({draft.annoyance} of {SCALE_MAX})
            </label>
            <input
              id="tsd-annoyance"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={SCALE_MIN}
              max={SCALE_MAX}
              step="1"
              value={draft.annoyance}
              onChange={(event) => setDraft((prev) => ({ ...prev, annoyance: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsd-ear">
              Where you hear it
            </label>
            <select
              id="tsd-ear"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.ear}
              onChange={(event) => setDraft((prev) => ({ ...prev, ear: event.target.value }))}
            >
              {EAR_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsd-sound">
              What it sounds like
            </label>
            <select
              id="tsd-sound"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.soundType}
              onChange={(event) => setDraft((prev) => ({ ...prev, soundType: event.target.value }))}
            >
              {SOUND_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Anything notable today</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TRIGGERS.map((trigger) => (
              <label
                key={trigger.id}
                htmlFor={`tsd-trigger-${trigger.id}`}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <input
                  id={`tsd-trigger-${trigger.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={draft.triggers.includes(trigger.id)}
                  onChange={() => toggleDraftTrigger(trigger.id)}
                />
                {trigger.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="tsd-note">
            Note (optional)
          </label>
          <input
            id="tsd-note"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            maxLength={200}
            value={draft.note}
            onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
          />
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
          <button type="button" onClick={addEntry} className={PRIMARY_BTN}>
            Save entry
          </button>
          <button type="button" onClick={clearAll} className={GHOST_BTN}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear diary
          </button>
          {usingExamples ? (
            savedEntries.length > 0 ? (
              <button type="button" onClick={() => setUsingExamples(false)} className={GHOST_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Back to my diary
              </button>
            ) : null
          ) : (
            <button type="button" onClick={restoreExamples} className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Show example data
            </button>
          )}
        </div>

        {usingExamples ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {savedEntries.length > 0
              ? `You are previewing example data. Your ${savedEntries.length} saved ${savedEntries.length === 1 ? "entry is" : "entries are"} untouched — use "Back to my diary" to return to them.`
              : "You are looking at example data so the summary has something to show. Saving your first entry switches to your own diary."}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Diary summary</h2>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Last 7 days, average loudness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {summary.error ? DASH : `${NUM1.format(summary.last7Mean)} / ${SCALE_MAX}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {summary.error
                ? "No entries yet."
                : `${summary.last7Count} of the last 7 days logged · ${summary.count} entries in total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("diary") ? "Copied diary as text" : "Copy diary as text"}
              className={GHOST_BTN}
              disabled={Boolean(summary.error)}
            >
              {isCopied("diary") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("diary") ? "Copied!" : "Copy diary"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        {summary.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {summary.error}
          </p>
        ) : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Average loudness, all entries", `${NUM1.format(summary.meanLoudness)} / ${SCALE_MAX}`],
              ["Average annoyance, all entries", `${NUM1.format(summary.meanAnnoyance)} / ${SCALE_MAX}`],
              [
                "Change versus the week before",
                summary.weekOverWeekChange === null
                  ? "not enough history"
                  : `${summary.weekOverWeekChange >= 0 ? "+" : ""}${NUM2.format(summary.weekOverWeekChange)} points`,
              ],
              [
                "Trend across the whole diary",
                summary.trendPerWeek === null
                  ? "needs at least 4 entries"
                  : `${summary.trendPerWeek >= 0 ? "+" : ""}${NUM2.format(summary.trendPerWeek)} points per week`,
              ],
              ["Loudest day", `${summary.worst.date} (${summary.worst.loudness})`],
              ["Quietest day", `${summary.best.date} (${summary.best.loudness})`],
              [
                "Average sleep logged",
                summary.meanSleepHours === null ? "not logged" : `${NUM1.format(summary.meanSleepHours)} h`,
              ],
              ["Days covered", `${summary.spanDays} (${NUM1.format(summary.coverage)}% logged)`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {associations.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Noted triggers and loudness</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            Average loudness on days you ticked each item, against days you did not. This is an
            association in your own log, not proof that anything caused it.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Noted</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">On those days</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Other days</th>
                  <th scope="col" className="py-2 text-right font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {associations.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    {row.enoughData ? (
                      <>
                        <td className="py-2 pr-3 text-right">{NUM1.format(row.withMean)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {NUM1.format(row.withoutMean)}
                        </td>
                        <td
                          className={`py-2 text-right font-semibold ${row.difference > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
                        >
                          {row.difference >= 0 ? "+" : ""}
                          {NUM1.format(row.difference)}
                        </td>
                      </>
                    ) : (
                      <td className="py-2 text-right text-[var(--muted-foreground)]" colSpan={3}>
                        {describeInsufficientData(row)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {sorted.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Entries</h2>
          <ul className="mt-3 space-y-2">
            {sorted.map((entry) => (
              <li
                key={entry.date}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {entry.date} · loudness {entry.loudness}, annoyance {entry.annoyance}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {[
                      (EAR_OPTIONS.find((o) => o.id === entry.ear) || {}).label,
                      (SOUND_TYPES.find((o) => o.id === entry.soundType) || {}).label,
                      entry.sleepHours === null ? null : `${entry.sleepHours} h sleep`,
                      entry.triggers
                        .map((id) => (TRIGGERS.find((t) => t.id === id) || {}).label)
                        .filter(Boolean)
                        .join(", "),
                      entry.note,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.date)}
                  aria-label={`Delete the entry for ${entry.date}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">When to stop logging and get it looked at</h2>
        <fieldset className="mt-3">
          <legend className="sr-only">Features that need professional assessment</legend>
          <div className="grid gap-2">
            {RED_FLAGS.map((flag) => (
              <label
                key={flag.id}
                htmlFor={`tsd-flag-${flag.id}`}
                className="inline-flex min-h-11 w-full items-start gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <input
                  id={`tsd-flag-${flag.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={flags[flag.id] === true}
                  onChange={(event) =>
                    setFlags((prev) => ({ ...prev, [flag.id]: event.target.checked }))
                  }
                />
                {flag.label}
              </label>
            ))}
          </div>
        </fieldset>

        {activeFlags.length > 0 ? (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            <p className="font-semibold">Worth getting checked rather than tracked:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {activeFlags.map((flag) => (
                <li key={flag.id}>{flag.advice}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This is a self-recorded log, not a diagnosis, a hearing test or a
        substitute for assessment by an audiologist or doctor, and it does not calculate validated
        scores such as the THI or TFI. Entries are stored only in this browser.
      </p>
    </main>
  );
}
