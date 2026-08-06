"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dices, RotateCcw, Sparkles } from "lucide-react";

import {
  DRAW_TYPES,
  LEVELS,
  MAX_PLAYERS,
  MAX_ROUNDS,
  buildRoundList,
  drawPrompt,
  parsePlayers,
  promptPoolSize,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PLAYERS = ["Ana", "Ben", "Cy", "Dee"].join("\n");

export default function ToolHome() {
  const [level, setLevel] = useState("family");
  const [type, setType] = useState("random");
  const [playersRaw, setPlayersRaw] = useState(DEFAULT_PLAYERS);
  const [rounds, setRounds] = useState(2);
  const [gameNumber, setGameNumber] = useState(1);
  const [drawSeed, setDrawSeed] = useState(7);
  const [usedIds, setUsedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const players = useMemo(() => parsePlayers(playersRaw), [playersRaw]);

  const single = useMemo(
    () => drawPrompt({ level, type, seed: drawSeed, usedIds }),
    [level, type, drawSeed, usedIds],
  );

  const list = useMemo(
    () => buildRoundList({ players, rounds: Number(rounds), level, type, seed: gameNumber }),
    [players, rounds, level, type, gameNumber],
  );

  const singleError = Boolean(single.error);
  const listError = Boolean(list.error);

  const nextPrompt = () => {
    if (single.error) return;
    setUsedIds((prev) => {
      if (!single.recycled) return [...prev, single.id];
      // Only forget the sub-pool (truth or dare) that was actually exhausted —
      // wiping the whole combined list would also reset tracking for the other
      // type, which hasn't been drawn out yet.
      const prefix = `${level}-${single.type}-`;
      return [...prev.filter((id) => !id.startsWith(prefix)), single.id];
    });
    setDrawSeed((prev) => Number(prev) + 1);
  };

  const summary = useMemo(() => {
    if (listError) return "";
    return [
      `Truth or Dare — ${LEVELS[list.level]} · ${DRAW_TYPES[list.type]}`,
      `${list.playerCount} players · ${list.rounds} rounds · game #${gameNumber}`,
      "",
      ...list.turns.map((t) => `${t.turn}. ${t.player} — ${t.type.toUpperCase()}: ${t.text}`),
    ].join("\n");
  }, [listError, list, gameNumber]);

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
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset the game? This clears your player list, round count, and game number and cannot be undone.",
      )
    ) {
      return;
    }
    setLevel("family");
    setType("random");
    setPlayersRaw(DEFAULT_PLAYERS);
    setRounds(2);
    setGameNumber(1);
    setDrawSeed(7);
    setUsedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Dices className="h-4 w-4" aria-hidden="true" />
          Party game
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Truth Or Dare Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draw one prompt at a time, or generate a whole round list so every player knows
          their turn. Each game is tied to a game number, so sharing that number rebuilds
          exactly the same set of prompts.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tod-level">
              Level
            </label>
            <select
              id="tod-level"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setUsedIds([]);
              }}
              className={`${INPUT_CLASS} mt-1`}
            >
              {Object.entries(LEVELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tod-type">
              Draw
            </label>
            <select
              id="tod-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setUsedIds([]);
              }}
              className={`${INPUT_CLASS} mt-1`}
            >
              {Object.entries(DRAW_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {singleError && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {single.error}
          </p>
        )}
        <p className="text-sm text-[var(--muted-foreground)]">
          {singleError ? "Current draw" : single.type === "truth" ? "Truth" : "Dare"}
        </p>
        <p className="text-2xl leading-snug font-semibold sm:text-3xl">
          {singleError ? DASH : single.text}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {singleError
            ? DASH
            : `${LEVELS[level]} · ${usedIds.length} prompt${usedIds.length === 1 ? "" : "s"} used of ${promptPoolSize(level, type)}`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={nextPrompt} disabled={singleError} className={PRIMARY_BTN}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Next prompt
          </button>
          <button
            type="button"
            onClick={() => setUsedIds([])}
            className={GHOST_BTN}
            aria-label="Reshuffle the used prompts back into the deck"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reshuffle deck
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Round list for the group</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tod-players">
              Players (one per line, up to {MAX_PLAYERS})
            </label>
            <textarea
              id="tod-players"
              value={playersRaw}
              onChange={(e) => setPlayersRaw(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tod-rounds">
              Rounds per player (1–{MAX_ROUNDS})
            </label>
            <input
              id="tod-rounds"
              type="number"
              min="1"
              max={MAX_ROUNDS}
              step="1"
              inputMode="numeric"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tod-game">
              Game number
            </label>
            <input
              id="tod-game"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={gameNumber}
              onChange={(e) => setGameNumber(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
        </div>

        {listError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {list.error}
          </p>
        ) : (
          <>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Total turns</dt>
                <dd className="text-sm font-semibold">{list.totalTurns}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Truths / dares</dt>
                <dd className="text-sm font-semibold">
                  {list.truthCount} / {list.dareCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Players</dt>
                <dd className="text-sm font-semibold">{list.playerCount}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Prompt pool</dt>
                <dd className="text-sm font-semibold">{list.poolSize}</dd>
              </div>
            </dl>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[26rem] text-left text-sm">
                <caption className="sr-only">Turn order with prompts</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      #
                    </th>
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Player
                    </th>
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Type
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      Prompt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.turns.map((turn) => (
                    <tr key={turn.turn} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{turn.turn}</td>
                      <td className="py-2 pr-3 font-medium">{turn.player}</td>
                      <td className="py-2 pr-3 uppercase">{turn.type}</td>
                      <td className="py-2">{turn.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setGameNumber((prev) => Number(prev || 0) + 1)}
            className={PRIMARY_BTN}
          >
            <Dices className="h-4 w-4" aria-hidden="true" />
            New game
          </button>
          <button
            type="button"
            onClick={copyResult}
            disabled={listError}
            className={GHOST_BTN}
            aria-label="Copy the full round list"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy round list"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset the generator">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
