"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, NotebookPen, RotateCcw, Trash2 } from "lucide-react";

import {
  ACCLIMATISATION_WEEKS,
  DEFAULT_PROGRAMMES,
  ISSUE_TYPES,
  RATING_MAX,
  RATING_MIN,
  SITUATIONS,
  VOLUME_MAX,
  VOLUME_MIN,
  bestProgrammePerSituation,
  notesToText,
  programmeStats,
  recurringIssues,
  summariseNotes,
  validateNote,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const STORAGE_KEY = "altft-hearing-aid-notes-v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EXAMPLE_ROWS = [
  { date: "2026-07-20", programmeId: "p1", situationId: "restaurant", clarity: 2, comfort: 3, volumeOffset: 2, issues: ["feedback"] },
  { date: "2026-07-21", programmeId: "p1", situationId: "restaurant", clarity: 2, comfort: 3, volumeOffset: 2, issues: [] },
  { date: "2026-07-22", programmeId: "p2", situationId: "restaurant", clarity: 4, comfort: 4, volumeOffset: 1, issues: [] },
  { date: "2026-07-23", programmeId: "p2", situationId: "restaurant", clarity: 5, comfort: 4, volumeOffset: 1, issues: [] },
  { date: "2026-07-24", programmeId: "p1", situationId: "quiet", clarity: 5, comfort: 5, volumeOffset: 0, issues: [] },
  { date: "2026-07-25", programmeId: "p1", situationId: "tv", clarity: 3, comfort: 4, volumeOffset: 2, issues: ["muffled"] },
  { date: "2026-07-26", programmeId: "p3", situationId: "music", clarity: 4, comfort: 5, volumeOffset: 0, issues: [] },
  { date: "2026-07-27", programmeId: "p1", situationId: "tv", clarity: 3, comfort: 3, volumeOffset: 2, issues: ["muffled"] },
];

const EXAMPLE_NOTES = EXAMPLE_ROWS.map((row) => validateNote(row)).filter((note) => !note.error);

const BLANK_DRAFT = {
  date: "",
  programmeId: "p1",
  situationId: "quiet",
  clarity: "4",
  comfort: "4",
  volumeOffset: "0",
  issues: [],
  note: "",
};

export default function ToolHome() {
  const [programmes, setProgrammes] = useState(DEFAULT_PROGRAMMES);
  const [notes, setNotes] = useState(EXAMPLE_NOTES);
  const [usingExamples, setUsingExamples] = useState(true);
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
        const storedProgrammes = Array.isArray(parsed && parsed.programmes)
          ? parsed.programmes.filter((row) => row && row.id && typeof row.label === "string")
          : null;
        const activeProgrammes =
          storedProgrammes && storedProgrammes.length > 0 ? storedProgrammes : DEFAULT_PROGRAMMES;
        const clean = Array.isArray(parsed && parsed.notes)
          ? parsed.notes.map((row) => validateNote(row, activeProgrammes)).filter((row) => !row.error)
          : [];
        if (clean.length > 0) {
          setProgrammes(activeProgrammes);
          setNotes(clean);
          setUsingExamples(false);
        }
      } catch {
        /* corrupted store: keep the examples */
      }
    }
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setDraft((prev) => ({ ...prev, date: iso }));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || usingExamples) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ programmes, notes }));
    } catch {
      /* storage unavailable — the log still works for this session */
    }
  }, [programmes, notes, usingExamples, loaded]);

  const summary = useMemo(() => summariseNotes(notes, programmes), [notes, programmes]);
  const bySituation = useMemo(
    () => bestProgrammePerSituation(notes, programmes),
    [notes, programmes],
  );
  const perProgramme = useMemo(() => programmeStats(notes, programmes), [notes, programmes]);
  const issues = useMemo(() => recurringIssues(notes), [notes]);

  const addNote = () => {
    const entry = validateNote(
      {
        date: draft.date,
        programmeId: draft.programmeId,
        situationId: draft.situationId,
        clarity: draft.clarity === "" ? NaN : Number(draft.clarity),
        comfort: draft.comfort === "" ? NaN : Number(draft.comfort),
        volumeOffset: draft.volumeOffset === "" ? NaN : Number(draft.volumeOffset),
        issues: draft.issues,
        note: draft.note,
      },
      programmes,
    );
    if (entry.error) {
      setFormError(entry.error);
      return;
    }
    setFormError("");
    setNotes((prev) => {
      const base = usingExamples ? [] : prev.filter((row) => row.id !== entry.id);
      return [...base, entry].sort((a, b) => a.dayNumber - b.dayNumber);
    });
    setUsingExamples(false);
    setDraft((prev) => ({ ...prev, issues: [], note: "" }));
  };

  const removeNote = (id) => {
    setNotes((prev) => prev.filter((row) => row.id !== id));
    setUsingExamples(false);
  };

  const clearAll = () => {
    setNotes([]);
    setUsingExamples(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  };

  const restoreExamples = () => {
    setProgrammes(DEFAULT_PROGRAMMES);
    setNotes(EXAMPLE_NOTES);
    setUsingExamples(true);
    setFormError("");
  };

  const renameProgramme = (id, label) => {
    setProgrammes((prev) => prev.map((row) => (row.id === id ? { ...row, label } : row)));
  };

  const toggleDraftIssue = (id) => {
    setDraft((prev) => ({
      ...prev,
      issues: prev.issues.includes(id)
        ? prev.issues.filter((item) => item !== id)
        : [...prev.issues, id],
    }));
  };

  const copyResult = async () => {
    if (summary.error) return;
    try {
      await navigator.clipboard.writeText(notesToText(notes, summary, programmes));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const recent = summary.error ? [] : summary.sorted.slice().reverse().slice(0, 12);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Hearing health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hearing Aid Notes Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Note which programme you used where, rate clarity and comfort out of five, and record how
          far you moved the volume. After a couple of weeks you get a programme-per-situation
          shortlist and a list of things to raise at your follow-up. Notes stay in this browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your programmes</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          Rename these to match what your audiologist set up on your aids.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {programmes.map((programme) => (
            <div key={programme.id}>
              <label className={LABEL_CLASS} htmlFor={`han-prog-${programme.id}`}>
                Programme {programme.id.toUpperCase()}
              </label>
              <input
                id={`han-prog-${programme.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                maxLength={40}
                value={programme.label}
                onChange={(event) => renameProgramme(programme.id, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add a note</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="han-date">
              Date
            </label>
            <input
              id="han-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={draft.date}
              onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="han-situation">
              Listening situation
            </label>
            <select
              id="han-situation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.situationId}
              onChange={(event) => setDraft((prev) => ({ ...prev, situationId: event.target.value }))}
            >
              {SITUATIONS.map((situation) => (
                <option key={situation.id} value={situation.id}>
                  {situation.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="han-programme">
              Programme used
            </label>
            <select
              id="han-programme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.programmeId}
              onChange={(event) => setDraft((prev) => ({ ...prev, programmeId: event.target.value }))}
            >
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="han-volume">
              Volume steps from the fitted setting ({draft.volumeOffset})
            </label>
            <input
              id="han-volume"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={VOLUME_MIN}
              max={VOLUME_MAX}
              step="1"
              value={draft.volumeOffset}
              onChange={(event) => setDraft((prev) => ({ ...prev, volumeOffset: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="han-clarity">
              Clarity ({draft.clarity} of {RATING_MAX})
            </label>
            <input
              id="han-clarity"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={RATING_MIN}
              max={RATING_MAX}
              step="1"
              value={draft.clarity}
              onChange={(event) => setDraft((prev) => ({ ...prev, clarity: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="han-comfort">
              Comfort ({draft.comfort} of {RATING_MAX})
            </label>
            <input
              id="han-comfort"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={RATING_MIN}
              max={RATING_MAX}
              step="1"
              value={draft.comfort}
              onChange={(event) => setDraft((prev) => ({ ...prev, comfort: event.target.value }))}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Anything wrong this time</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ISSUE_TYPES.map((issue) => (
              <label
                key={issue.id}
                htmlFor={`han-issue-${issue.id}`}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <input
                  id={`han-issue-${issue.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={draft.issues.includes(issue.id)}
                  onChange={() => toggleDraftIssue(issue.id)}
                />
                {issue.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="han-note">
            Note (optional)
          </label>
          <input
            id="han-note"
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
          <button type="button" onClick={addNote} className={PRIMARY_BTN}>
            Save note
          </button>
          <button type="button" onClick={clearAll} className={GHOST_BTN} aria-label="Delete every note">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear notes
          </button>
          {!usingExamples ? (
            <button type="button" onClick={restoreExamples} className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Show example data
            </button>
          ) : null}
        </div>

        {usingExamples ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            You are looking at example notes so the summary has something to show. Saving your first
            note replaces them.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Average clarity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {summary.error ? DASH : `${NUM1.format(summary.meanClarity)} / ${RATING_MAX}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {summary.error
                ? "No notes yet."
                : `${summary.count} notes over ${summary.spanDays} days · ${summary.situationsWithRecommendation} of ${summary.situationsLogged} logged situations have a clear best programme`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the notes as text"
            className={GHOST_BTN}
            disabled={Boolean(summary.error)}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy notes"}
          </button>
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
              ["Average comfort", `${NUM1.format(summary.meanComfort)} / ${RATING_MAX}`],
              ["Combined score", `${NUM1.format(summary.meanScore)} / ${RATING_MAX}`],
              [
                "Average volume offset",
                `${summary.meanVolumeOffset >= 0 ? "+" : ""}${NUM2.format(summary.meanVolumeOffset)} steps`,
              ],
              ["Situations logged", `${summary.situationsLogged} of ${summary.situationsTotal}`],
              ["Weeks of notes", NUM1.format(summary.weeksLogged)],
              ["First and last note", `${summary.firstDate} to ${summary.lastDate}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {bySituation.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What works where</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Situation</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Best programme</th>
                  <th scope="col" className="py-2 text-right font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {bySituation.map((row) => (
                  <tr key={row.situationId} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3">
                      {row.best ? (
                        row.best.label
                      ) : (
                        <span className="text-[var(--muted-foreground)]">
                          {row.noteCount} note{row.noteCount === 1 ? "" : "s"} — need more
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {row.best ? `${NUM1.format(row.best.meanScore)} / ${RATING_MAX}` : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {perProgramme.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Programme by programme</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Programme</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Notes</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Clarity</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Comfort</th>
                  <th scope="col" className="py-2 text-right font-semibold">Volume</th>
                </tr>
              </thead>
              <tbody>
                {perProgramme.map((row) => (
                  <tr key={row.programmeId} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{row.count}</td>
                    <td className="py-2 pr-3 text-right">{NUM1.format(row.meanClarity)}</td>
                    <td className="py-2 pr-3 text-right">{NUM1.format(row.meanComfort)}</td>
                    <td
                      className={`py-2 text-right font-semibold ${row.volumeFlagged ? "text-[var(--danger)]" : ""}`}
                    >
                      {row.meanVolumeOffset >= 0 ? "+" : ""}
                      {NUM1.format(row.meanVolumeOffset)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {perProgramme.some((row) => row.volumeFlagged) ? (
            <p className="mt-3 text-xs leading-5 text-[var(--danger)]">
              You are consistently moving the volume away from the fitted setting on at least one
              programme. That is worth mentioning at your next appointment — it usually points at
              prescribed gain rather than at your choice of programme.
            </p>
          ) : null}
        </section>
      ) : null}

      {issues.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth raising at your follow-up</h2>
          <ul className="mt-3 space-y-2">
            {issues.map((issue) => (
              <li
                key={issue.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">
                  {issue.label} — {issue.count} time{issue.count === 1 ? "" : "s"}
                  {issue.flagged ? "" : " (log it again if it keeps happening)"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{issue.advice}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Recent notes</h2>
          <ul className="mt-3 space-y-2">
            {recent.map((note) => (
              <li
                key={note.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {note.date} ·{" "}
                    {(SITUATIONS.find((s) => s.id === note.situationId) || {}).label} ·{" "}
                    {(programmes.find((p) => p.id === note.programmeId) || {}).label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    Clarity {note.clarity}, comfort {note.comfort}, volume{" "}
                    {note.volumeOffset >= 0 ? "+" : ""}
                    {note.volumeOffset}
                    {note.note ? ` · ${note.note}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNote(note.id)}
                  aria-label={`Delete the note from ${note.date}`}
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This is a personal log, not a hearing test, a fitting record or medical
        advice. New aids commonly take around {ACCLIMATISATION_WEEKS} weeks to settle, so early
        ratings will look worse than later ones. Take programme changes, volume offsets and
        persistent whistling or discomfort to your audiologist rather than adjusting your own
        prescription. Notes are stored only in this browser.
      </p>
    </main>
  );
}
