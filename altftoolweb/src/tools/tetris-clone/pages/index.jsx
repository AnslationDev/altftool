"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Blocks, Check, Copy, Pause, Play, RotateCcw } from "lucide-react";

import {
  COLS,
  createGame,
  gravityMs,
  previewGrid,
  renderGrid,
  stackHeight,
  step,
  VISIBLE_ROWS,
} from "../lib";

/** Tailwind palette classes per tetromino — no raw colour literals. */
const PIECE_CLASS = {
  I: "bg-cyan-500 dark:bg-cyan-400",
  J: "bg-blue-600 dark:bg-blue-500",
  L: "bg-orange-500 dark:bg-orange-400",
  O: "bg-yellow-400 dark:bg-yellow-300",
  S: "bg-green-500 dark:bg-green-400",
  T: "bg-purple-500 dark:bg-purple-400",
  Z: "bg-red-500 dark:bg-red-400",
};

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PAD_BTN =
  "inline-flex h-12 min-h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";

const KEY_ACTIONS = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "soft-drop",
  ArrowUp: "rotate-cw",
  KeyX: "rotate-cw",
  KeyZ: "rotate-ccw",
  Space: "hard-drop",
  KeyC: "hold",
  ShiftLeft: "hold",
};

function MiniGrid({ type, label }) {
  const grid = previewGrid(type);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </p>
      <div className="mt-1 grid grid-cols-4 gap-px rounded-md bg-[var(--border)] p-px">
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className={`aspect-square rounded-[2px] ${cell ? PIECE_CLASS[cell] : "bg-[var(--card)]"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [seedInput, setSeedInput] = useState("2026");
  const [startLevel, setStartLevel] = useState("1");
  const [game, setGame] = useState(() => createGame(2026, 1));
  const [copied, setCopied] = useState(false);
  const [best, setBest] = useState(0);

  const act = useCallback((action) => {
    setGame((prev) => step(prev, action));
  }, []);

  // Gravity. The interval is rebuilt whenever the level or the run state changes.
  useEffect(() => {
    if (game.status !== "running") return undefined;
    const delay = gravityMs(game.level);
    const id = setInterval(() => act("gravity"), delay);
    return () => clearInterval(id);
  }, [game.status, game.level, act]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        setGame((prev) =>
          prev.status === "running"
            ? step(prev, "pause")
            : prev.status === "paused"
              ? step(prev, "resume")
              : prev,
        );
        return;
      }
      const action = KEY_ACTIONS[e.code];
      if (!action) return;
      e.preventDefault();
      act(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  const grid = useMemo(() => renderGrid(game), [game]);
  const height = useMemo(() => stackHeight(game.board), [game.board]);
  // Best of the runs already finished, or this one if it is ahead.
  const sessionBest = game.score > best ? game.score : best;

  const newGame = () => {
    const seed = Number(String(seedInput).replace(/\D/g, "")) || 1;
    const lvl = Number(startLevel) || 1;
    setBest(sessionBest);
    setGame(createGame(seed, lvl));
    setCopied(false);
  };

  const copy = async () => {
    const lines = [
      "Tetris — session result",
      `Score: ${NUM.format(game.score)}`,
      `Lines cleared: ${NUM.format(game.lines)}`,
      `Level reached: ${NUM.format(game.level)}`,
      `Pieces placed: ${NUM.format(game.pieces)}`,
      `Seed: ${seedInput}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const running = game.status === "running";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Blocks className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tetris Clone</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            A 10 × 20 falling-block game with SRS rotation, wall kicks, a 7-bag randomiser,
            hold, ghost piece and guideline scoring. Everything runs in your browser.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <div>
          <div
            className="mx-auto grid w-full max-w-[19rem] gap-px rounded-xl bg-[var(--border)] p-px ring-1 ring-[var(--border)]"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${VISIBLE_ROWS}, minmax(0, 1fr))`,
            }}
            role="img"
            aria-label={`Playfield, ${game.lines} lines cleared, score ${game.score}`}
          >
            {grid.flat().map((cell, i) =>
              cell.type === null ? (
                <div key={i} className="aspect-square bg-[var(--card)]" />
              ) : (
                <div
                  key={i}
                  className={`aspect-square ${
                    cell.ghost
                      ? `${PIECE_CLASS[cell.type]} opacity-25`
                      : PIECE_CLASS[cell.type]
                  }`}
                />
              ),
            )}
          </div>

          {game.status === "over" ? (
            <div
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              Game over — the stack reached the top. Start a new game to play again.
            </div>
          ) : null}
          {game.status === "paused" ? (
            <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)]">
              Paused. Press P or the resume button to carry on.
            </p>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          <MiniGrid type={game.queue[0] ?? null} label="Next" />
          <MiniGrid type={game.hold} label="Hold" />
          <div className="rounded-xl bg-[var(--card)] p-3 ring-1 ring-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Score
            </p>
            <p className="text-2xl font-bold tracking-tight text-[var(--primary)]">
              {NUM.format(game.score)}
            </p>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--muted-foreground)]">Lines</dt>
                <dd className="font-semibold text-[var(--foreground)]">{NUM.format(game.lines)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--muted-foreground)]">Level</dt>
                <dd className="font-semibold text-[var(--foreground)]">{NUM.format(game.level)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--muted-foreground)]">Pieces</dt>
                <dd className="font-semibold text-[var(--foreground)]">{NUM.format(game.pieces)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--muted-foreground)]">Stack height</dt>
                <dd className="font-semibold text-[var(--foreground)]">{NUM.format(height)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--muted-foreground)]">Drop every</dt>
                <dd className="font-semibold text-[var(--foreground)]">{gravityMs(game.level)} ms</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--muted-foreground)]">Session best</dt>
                <dd className="font-semibold text-[var(--success)]">
                  {sessionBest > 0 ? NUM.format(sessionBest) : DASH}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <section className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
        <button type="button" className={PAD_BTN} onClick={() => act("left")} aria-label="Move piece left">
          ←
        </button>
        <button type="button" className={PAD_BTN} onClick={() => act("rotate-cw")} aria-label="Rotate piece clockwise">
          ⟳
        </button>
        <button type="button" className={PAD_BTN} onClick={() => act("right")} aria-label="Move piece right">
          →
        </button>
        <button type="button" className={PAD_BTN} onClick={() => act("soft-drop")} aria-label="Soft drop">
          ↓
        </button>
        <button type="button" className={PAD_BTN} onClick={() => act("hard-drop")} aria-label="Hard drop">
          Drop
        </button>
        <button type="button" className={PAD_BTN} onClick={() => act("hold")} aria-label="Hold the current piece">
          Hold
        </button>
      </section>

      <section className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={() => act(running ? "pause" : "resume")}
          disabled={game.status === "over"}
          aria-label={running ? "Pause the game" : "Resume the game"}
        >
          {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {running ? "Pause" : "Resume"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={newGame} aria-label="Start a new game with the chosen seed and level">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          New game
        </button>
        <button type="button" className={GHOST_BTN} onClick={copy} aria-label="Copy the session score to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tet-seed">
            Piece seed
          </label>
          <input
            id="tet-seed"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="numeric"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            The same seed always deals the same piece order, so you can replay a run.
          </p>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tet-level">
            Starting level
          </label>
          <select
            id="tet-level"
            className={`${INPUT_CLASS} mt-1`}
            value={startLevel}
            onChange={(e) => setStartLevel(e.target.value)}
          >
            {Array.from({ length: 15 }, (_, i) => String(i + 1)).map((l) => (
              <option key={l} value={l}>
                Level {l} — {gravityMs(Number(l))} ms per row
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Takes effect when you press New game.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Controls and scoring</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] border-collapse text-sm">
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Move / soft drop</th>
                <td className="py-2 text-[var(--foreground)]">Arrow keys</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Rotate</th>
                <td className="py-2 text-[var(--foreground)]">Up or X clockwise, Z anticlockwise</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Hard drop</th>
                <td className="py-2 text-[var(--foreground)]">Space — 2 points per cell</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Hold</th>
                <td className="py-2 text-[var(--foreground)]">C or Shift, once per piece</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Line clears</th>
                <td className="py-2 text-[var(--foreground)]">100 / 300 / 500 / 800 × level for 1 / 2 / 3 / 4 rows</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
