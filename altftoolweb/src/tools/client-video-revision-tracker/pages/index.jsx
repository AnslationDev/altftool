"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_INCLUDED_ROUNDS,
  DEFAULT_MINUTES_PER_NOTE,
  NOTE_STATUSES,
  buildRevisionExport,
  formatMinutes,
  formatTimecode,
  prepareNotes,
  summariseRevisions,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const RATE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (value === null || !Number.isFinite(value) ? DASH : `${RATE.format(value)}%`);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_NOTES = [
  { id: 1, round: "1", timecodeText: "0:14", text: "Logo animation starts a beat late", status: "done" },
  { id: 2, round: "1", timecodeText: "2:14", text: "Music sits over the interview VO", status: "done" },
  { id: 3, round: "2", timecodeText: "3:20", text: "Grade feels too warm in the office scene", status: "wont-fix" },
  { id: 4, round: "2", timecodeText: "", text: "Add burnt-in subtitles across the whole cut", status: "done" },
  { id: 5, round: "3", timecodeText: "0:12", text: "Swap the opening line for the new campaign hook", status: "open" },
  { id: 6, round: "3", timecodeText: "5:00", text: "Trim eight seconds off the outro", status: "in-progress" },
];

const DEFAULT_SETTINGS = {
  lengthMinutes: "6",
  lengthSeconds: "0",
  includedRounds: String(DEFAULT_INCLUDED_ROUNDS),
  feePerExtraRound: "8000",
  minutesPerNote: String(DEFAULT_MINUTES_PER_NOTE),
};

const statusLabel = (id) => NOTE_STATUSES.find((status) => status.id === id)?.label ?? id;

export default function ToolHome() {
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  const setSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const summary = useMemo(() => {
    const prepared = prepareNotes(notes);
    if (prepared.error) return { error: prepared.error };
    return summariseRevisions({
      notes: prepared.notes,
      videoLengthSeconds: Number(settings.lengthMinutes) * 60 + Number(settings.lengthSeconds),
      includedRounds: Number(settings.includedRounds),
      feePerExtraRound: Number(settings.feePerExtraRound),
      minutesPerNote: Number(settings.minutesPerNote),
    });
  }, [notes, settings]);

  const failed = Boolean(summary.error);

  const clipboardText = useMemo(() => {
    if (failed) return "";
    return [
      "Client Video Revision Tracker",
      `Notes: ${summary.total} · resolved ${summary.resolved} · outstanding ${summary.outstanding}`,
      `Resolution rate: ${pct(summary.resolutionPct)}`,
      `Rounds used: ${summary.roundsUsed} (contract includes ${summary.includedRounds})`,
      `Billable extra rounds: ${summary.billableRounds} · ${money(summary.overageCharge)}`,
      `Estimated edit time left: ${formatMinutes(summary.remainingMinutes)}`,
      "",
      buildRevisionExport(summary.sortedNotes),
    ].join("\n");
  }, [summary, failed]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setNotes(DEFAULT_NOTES);
    setSettings(DEFAULT_SETTINGS);
    setCopied(false);
  };

  const updateNote = (id, key, value) =>
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, [key]: value } : note)));

  const addNote = () =>
    setNotes((prev) => {
      if (prev.length >= 500) return prev;
      const id = prev.reduce((max, note) => Math.max(max, note.id), 0) + 1;
      const lastRound = prev.reduce((max, note) => Math.max(max, Number(note.round) || 1), 1);
      return [...prev, { id, round: String(lastRound), timecodeText: "", text: "", status: "open" }];
    });

  const removeNote = (id) => setNotes((prev) => prev.filter((note) => note.id !== id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Client feedback
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Client Video Revision Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log every note against a timecode, mark it done or won&apos;t-fix, and see at a glance how
          much is left, which round you are on, and what the rounds beyond your contract are worth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Project settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold">Cut length</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className={SMALL_LABEL} htmlFor="cvr-len-min">
                  Minutes
                </label>
                <input
                  id="cvr-len-min"
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={settings.lengthMinutes}
                  onChange={(event) => setSetting("lengthMinutes", event.target.value)}
                />
              </div>
              <div>
                <label className={SMALL_LABEL} htmlFor="cvr-len-sec">
                  Seconds
                </label>
                <input
                  id="cvr-len-sec"
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={settings.lengthSeconds}
                  onChange={(event) => setSetting("lengthSeconds", event.target.value)}
                />
              </div>
            </div>
          </fieldset>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvr-included">
              Revision rounds included in the contract
            </label>
            <input
              id="cvr-included"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={settings.includedRounds}
              onChange={(event) => setSetting("includedRounds", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvr-fee">
              Fee per extra round (INR)
            </label>
            <input
              id="cvr-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={settings.feePerExtraRound}
              onChange={(event) => setSetting("feePerExtraRound", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvr-minutes">
              Edit minutes budgeted per note
            </label>
            <input
              id="cvr-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={settings.minutesPerNote}
              onChange={(event) => setSetting("minutesPerNote", event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
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
              Notes resolved
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : pct(summary.resolutionPct)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${summary.resolved} of ${summary.total} notes closed · ${summary.outstanding} still open`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the revision summary and note list"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rounds used", failed ? DASH : String(summary.roundsUsed)],
            ["Rounds included in contract", failed ? DASH : String(summary.includedRounds)],
            ["Billable extra rounds", failed ? DASH : String(summary.billableRounds)],
            ["Overage worth", failed ? DASH : money(summary.overageCharge)],
            ["Estimated edit time remaining", failed ? DASH : formatMinutes(summary.remainingMinutes)],
            ...NOTE_STATUSES.map((status) => [
              `Notes ${status.label.toLowerCase()}`,
              failed ? DASH : String(summary.statusCounts[status.id]),
            ]),
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && summary.billableRounds > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            Round {summary.includedRounds + 1} onwards falls outside the contracted allowance. Raise
            it with the client before the next pass, not after.
          </p>
        ) : null}
      </section>

      {failed ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Progress by round</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Round</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Notes</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Open</th>
                  <th scope="col" className="py-2 text-right font-semibold">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {summary.byRound.map((row) => (
                  <tr key={row.round} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.round}
                      {row.billable ? (
                        <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          billable
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.total}</td>
                    <td className="py-2 pr-3 text-right">{row.outstanding}</td>
                    <td className="py-2 text-right font-semibold">{pct(row.resolutionPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Feedback notes</h2>
          <button type="button" onClick={addNote} className={GHOST_BTN} aria-label="Add a feedback note">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add note
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {notes.map((note) => (
            <div key={note.id} className="rounded-md border border-[var(--border)] p-3">
              <label className={LABEL_CLASS} htmlFor={`cvr-text-${note.id}`}>
                Note
              </label>
              <textarea
                id={`cvr-text-${note.id}`}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                rows={2}
                value={note.text}
                onChange={(event) => updateNote(note.id, "text", event.target.value)}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cvr-round-${note.id}`}>
                    Round
                  </label>
                  <input
                    id={`cvr-round-${note.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={note.round}
                    onChange={(event) => updateNote(note.id, "round", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cvr-tc-${note.id}`}>
                    Timecode (M:SS)
                  </label>
                  <input
                    id={`cvr-tc-${note.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="blank = general"
                    value={note.timecodeText}
                    onChange={(event) => updateNote(note.id, "timecodeText", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cvr-status-${note.id}`}>
                    Status
                  </label>
                  <select
                    id={`cvr-status-${note.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={note.status}
                    onChange={(event) => updateNote(note.id, "status", event.target.value)}
                  >
                    {NOTE_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                className={`${GHOST_BTN} mt-3 w-full`}
                aria-label={`Remove note ${note.id}`}
                onClick={() => removeNote(note.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
          {notes.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No notes yet — add the first piece of client feedback above.
            </p>
          ) : null}
        </div>
      </section>

      {failed ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Sorted changelog</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Grouped by round and ordered by timecode — this is what the copy button sends.
          </p>
          <div className="mt-3 overflow-x-auto">
            <ul className="grid gap-2 text-sm">
              {summary.sortedNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border border-[var(--border)] px-3 py-2"
                >
                  <span className="font-semibold text-[var(--primary)]">
                    R{note.round} · {note.timecode === null ? "general" : formatTimecode(note.timecode)}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    {statusLabel(note.status)}
                  </span>
                  <span className="w-full sm:w-auto">{String(note.text || "").trim() || "(no detail)"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything stays in your browser — nothing is uploaded. The overage figure is an estimate
        from the numbers you enter; what you can actually bill depends on your signed statement of
        work.
      </p>
    </main>
  );
}
