"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Vote } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  MAX_LABEL_LENGTH,
  MAX_NAMES,
  MAX_VOTERS,
  RATING_LABELS,
  RATING_MAX,
  RATING_MIN,
  boardToText,
  tallyBoard,
} from "../lib";

const STORAGE_KEY = "altft-baby-name-voting-board-v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STARTER_NAMES = [
  { id: 1, label: "Aarav" },
  { id: 2, label: "Ira" },
  { id: 3, label: "Vihaan" },
  { id: 4, label: "Anika" },
];
const STARTER_VOTERS = [
  { id: 1, label: "Parent 1" },
  { id: 2, label: "Parent 2" },
];
const STARTER_VOTES = {
  1: { 1: 5, 2: 4, 3: 3, 4: 4 },
  2: { 1: 4, 2: 5, 3: 4, 4: 3 },
};

const RATINGS = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);
const DASH = "—";
const AVG = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const nextId = (items) => items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;

export default function ToolHome() {
  const [names, setNames] = useState(STARTER_NAMES);
  const [voters, setVoters] = useState(STARTER_VOTERS);
  const [votes, setVotes] = useState(STARTER_VOTES);
  const [activeVoter, setActiveVoter] = useState(STARTER_VOTERS[0].id);
  const [newName, setNewName] = useState("");
  const [newVoter, setNewVoter] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.names) && Array.isArray(saved.voters) && saved.voters.length) {
          setNames(saved.names);
          setVoters(saved.voters);
          setVotes(saved.votes || {});
          setActiveVoter(saved.voters[0].id);
        }
      }
    } catch {
      // A corrupt or blocked store just means we start from the sample board.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ names, voters, votes }));
    } catch {
      // Storage may be full or disabled; the board still works for this session.
    }
  }, [loaded, names, voters, votes]);

  const tally = useMemo(() => tallyBoard({ names, voters, votes }), [names, voters, votes]);

  const summary = useMemo(() => boardToText(tally, voters), [tally, voters]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "shortlist results" });
  };

  const addName = () => {
    const label = newName.trim();
    if (!label || names.length >= MAX_NAMES) return;
    setNames((current) => [...current, { id: nextId(current), label: label.slice(0, MAX_LABEL_LENGTH) }]);
    setNewName("");
  };

  const removeName = (id) => {
    setNames((current) => current.filter((entry) => entry.id !== id));
    setVotes((current) => {
      const next = {};
      Object.keys(current).forEach((voterId) => {
        const { [id]: dropped, ...rest } = current[voterId] || {};
        void dropped;
        next[voterId] = rest;
      });
      return next;
    });
  };

  const addVoter = () => {
    const label = newVoter.trim();
    if (!label || voters.length >= MAX_VOTERS) return;
    const id = nextId(voters);
    setVoters((current) => [...current, { id, label: label.slice(0, MAX_LABEL_LENGTH) }]);
    setActiveVoter(id);
    setNewVoter("");
  };

  const removeVoter = (id) => {
    const remaining = voters.filter((entry) => entry.id !== id);
    setVoters(remaining);
    setVotes((current) => {
      const { [id]: dropped, ...rest } = current;
      void dropped;
      return rest;
    });
    if (activeVoter === id && remaining.length) setActiveVoter(remaining[0].id);
  };

  const rate = (nameId, rating) => {
    setVotes((current) => {
      const existing = current[activeVoter] || {};
      const nextForVoter = { ...existing };
      if (nextForVoter[nameId] === rating) delete nextForVoter[nameId];
      else nextForVoter[nameId] = rating;
      return { ...current, [activeVoter]: nextForVoter };
    });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the whole board? This clears every name, voter and vote and cannot be undone.",
      )
    ) {
      return;
    }
    setNames(STARTER_NAMES);
    setVoters(STARTER_VOTERS);
    setVotes(STARTER_VOTES);
    setActiveVoter(STARTER_VOTERS[0].id);
    setNewName("");
    setNewVoter("");
    resetCopyState();
  };

  const activeVotes = votes[activeVoter] || {};

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Vote className="h-4 w-4" aria-hidden="true" />
          Shortlist voting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Baby Name Shortlist Voting Board</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add the names, add the people, and let each person rate every name from 1 to 5. A rating of 1
          counts as a veto and drops the name to the bottom whatever it averages. Everything stays in
          this browser — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who is voting right now?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {voters.map((voter) => (
            <button
              key={voter.id}
              type="button"
              onClick={() => setActiveVoter(voter.id)}
              aria-pressed={activeVoter === voter.id}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                activeVoter === voter.id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {voter.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={LABEL_CLASS} htmlFor="board-new-voter">
              Add a voter
            </label>
            <input
              id="board-new-voter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_LABEL_LENGTH}
              placeholder="Dadi, Nana, Aunt Meera…"
              value={newVoter}
              onChange={(event) => setNewVoter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addVoter();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={addVoter}
            className={`${PRIMARY_BTN} sm:mt-8`}
            disabled={voters.length >= MAX_VOTERS}
            aria-label="Add this voter to the board"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add voter
          </button>
        </div>

        {voters.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {voters.map((voter) => (
              <button
                key={voter.id}
                type="button"
                onClick={() => removeVoter(voter.id)}
                className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                aria-label={`Remove voter ${voter.label}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {voter.label}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          Ratings from {voters.find((voter) => voter.id === activeVoter)?.label || "this voter"}
        </h2>
        <ul className="mt-3 grid gap-3">
          {names.map((name) => (
            <li key={name.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold">{name.label}</span>
                <button
                  type="button"
                  onClick={() => removeName(name.id)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  aria-label={`Remove ${name.label} from the shortlist`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {RATINGS.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => rate(name.id, rating)}
                    aria-pressed={activeVotes[name.id] === rating}
                    aria-label={`${RATING_LABELS[rating]} for ${name.label}`}
                    title={RATING_LABELS[rating]}
                    className={`min-h-11 min-w-11 rounded-md border text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      activeVotes[name.id] === rating
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {activeVotes[name.id] ? RATING_LABELS[activeVotes[name.id]] : "Not rated yet"}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={LABEL_CLASS} htmlFor="board-new-name">
              Add a name to the shortlist
            </label>
            <input
              id="board-new-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_LABEL_LENGTH}
              placeholder="Type a name and press Enter"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addName();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={addName}
            className={`${PRIMARY_BTN} sm:mt-8`}
            disabled={names.length >= MAX_NAMES}
            aria-label="Add this name to the shortlist"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add name
          </button>
        </div>
      </section>

      {tally.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {tally.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Leading name
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {tally.error || !tally.winner ? DASH : tally.winner.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {tally.error || !tally.winner
                ? DASH
                : `${AVG.format(tally.winner.average)} average from ${tally.winner.votesCast} vote${
                    tally.winner.votesCast === 1 ? "" : "s"
                  } · ${tally.winner.consensusBand.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!summary}
              aria-label={
                isCopied("result")
                  ? "Copied the shortlist results to clipboard"
                  : "Copy the shortlist results"
              }
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy results"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the whole board" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset board
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite">
          {[
            [
              "Votes collected",
              tally.error ? DASH : `${tally.castVotes} of ${tally.possibleVotes} (${tally.completion}%)`,
            ],
            ["Names vetoed", tally.error ? DASH : String(tally.vetoedCount)],
            ["Unanimous names", tally.error ? DASH : String(tally.unanimousCount)],
            [
              "Most divisive name",
              tally.error || !tally.mostDivisive
                ? DASH
                : `${tally.mostDivisive.label} (consensus ${tally.mostDivisive.consensus})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!tally.error ? (
        <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[340px] text-left text-sm">
            <caption className="sr-only">Shortlist ranked by average rating, with vetoed names last</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 font-semibold">#</th>
                <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Average</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Consensus</th>
              </tr>
            </thead>
            <tbody>
              {tally.rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 align-top font-semibold">{row.rank}</td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-semibold">{row.label}</span>
                    {row.vetoed ? (
                      <span className="ml-2 rounded bg-[var(--danger-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--danger-text)]">
                        vetoed ×{row.vetoes}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {row.votesCast} of {voters.length} voted
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right align-top font-semibold">
                    {row.votesCast ? AVG.format(row.average) : DASH}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {row.votesCast ? `${row.consensus}` : DASH}
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {row.votesCast ? row.consensusBand : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The board is stored only in this browser, so open it on one device and pass it around, or copy
        the results into a family chat. Clearing site data clears the board.
      </p>
    </main>
  );
}
