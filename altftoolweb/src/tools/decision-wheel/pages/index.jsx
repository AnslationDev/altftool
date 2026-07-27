"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Play, RotateCcw, Trophy } from "lucide-react";

import {
  MAX_ENTRIES,
  buildSegments,
  nextRotation,
  parseEntries,
  spinStatistics,
  spinWheel,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]";

const DASH = "—";
const CANVAS_PIXELS = 420;
const SPIN_MS = 4200;

const DEFAULT_LIST = `Pizza x3
Sushi
Tacos x2
Curry
Salad`;

export default function ToolHome() {
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const [list, setList] = useState(DEFAULT_LIST);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [removeWinners, setRemoveWinners] = useState(false);
  const [drawn, setDrawn] = useState([]);
  const [themeTick, setThemeTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseEntries(list), [list]);
  const built = useMemo(
    () => (parsed.error ? parsed : buildSegments(parsed.entries)),
    [parsed],
  );
  const stats = useMemo(
    () => (built.error ? built : spinStatistics(built.segments, history)),
    [built, history],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (typeof MutationObserver === "undefined") return undefined;
    const observer = new MutationObserver(() => setThemeTick((tick) => tick + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const styles = getComputedStyle(canvas);
    const border = styles.getPropertyValue("--border").trim() || "currentColor";
    const surface = styles.getPropertyValue("--card").trim() || "transparent";

    context.clearRect(0, 0, CANVAS_PIXELS, CANVAS_PIXELS);
    context.fillStyle = surface;
    context.fillRect(0, 0, CANVAS_PIXELS, CANVAS_PIXELS);
    if (built.error) return;

    const centre = CANVAS_PIXELS / 2;
    const radius = centre - 6;
    const quarterTurn = Math.PI / 2;
    const toRadians = Math.PI / 180;

    for (const segment of built.segments) {
      const start = segment.startAngle * toRadians - quarterTurn;
      const end = segment.endAngle * toRadians - quarterTurn;
      context.beginPath();
      context.moveTo(centre, centre);
      context.arc(centre, centre, radius, start, end);
      context.closePath();
      context.fillStyle = styles.getPropertyValue(segment.token).trim() || border;
      context.fill();
      context.strokeStyle = border;
      context.lineWidth = 2;
      context.stroke();

      context.save();
      context.translate(centre, centre);
      context.rotate(segment.midAngle * toRadians - quarterTurn);
      context.fillStyle = surface;
      context.font = "600 15px system-ui, sans-serif";
      context.textAlign = "right";
      context.textBaseline = "middle";
      context.fillText(segment.label.slice(0, 16), radius - 14, 0);
      context.restore();
    }
  }, [built, themeTick]);

  const spin = () => {
    if (built.error || spinning) return;
    const seed = Math.floor(Math.random() * 2147483647);
    const excluded = removeWinners ? drawn : [];
    const result = spinWheel(parsed.entries, seed, excluded);
    if (result.error) {
      setWinner({ error: result.error });
      return;
    }
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setWinner(null);
    setRotation((previous) => nextRotation(previous, result.rotationDeg));
    setSpinning(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => {
        setSpinning(false);
        setWinner(result.winner);
        setHistory((current) => [...current, result.winner.label]);
        if (removeWinners) setDrawn((current) => [...current, result.winnerIndex]);
      },
      reduceMotion ? 0 : SPIN_MS,
    );
  };

  const copyResult = async () => {
    if (built.error || history.length === 0) return;
    const text = [
      "Decision wheel results",
      ...history.map((label, index) => `${index + 1}. ${label}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setList(DEFAULT_LIST);
    setRotation(0);
    setSpinning(false);
    setWinner(null);
    setHistory([]);
    setDrawn([]);
    setRemoveWinners(false);
    setCopied(false);
  };

  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)` : "none",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Trophy className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Decision Wheel
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One entry per line. Add <code className="font-mono">x3</code> after a name to give it
          three times the slice, and three times the chance.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="wheel-entries">
            Entries (max {MAX_ENTRIES})
          </label>
          <textarea
            id="wheel-entries"
            rows={6}
            value={list}
            onChange={(event) => setList(event.target.value)}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
        </div>
        <label className={CHECK_ROW} htmlFor="wheel-remove">
          <input
            id="wheel-remove"
            type="checkbox"
            checked={removeWinners}
            onChange={(event) => {
              setRemoveWinners(event.target.checked);
              setDrawn([]);
            }}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Remove each winner from the next draw
        </label>
      </section>

      {built.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {built.error}
        </p>
      )}

      {winner && winner.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {winner.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Winner</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {built.error || !winner || winner.error ? DASH : winner.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {built.error || !winner || winner.error
                ? DASH
                : `had a ${winner.sharePercent}% chance`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the results so far"
              className={GHOST_BTN}
              disabled={Boolean(built.error) || history.length === 0}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy results"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the wheel and history" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div
            className="h-0 w-0"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "18px solid var(--foreground)",
            }}
            aria-hidden="true"
          />
          <div className="mt-1 w-full max-w-[420px]" style={wheelStyle}>
            <canvas
              ref={canvasRef}
              width={CANVAS_PIXELS}
              height={CANVAS_PIXELS}
              role="img"
              aria-label={
                built.error ? "Wheel unavailable" : `Wheel with ${built.segments.length} entries`
              }
              className="block h-auto w-full rounded-full border border-[var(--border)]"
            />
          </div>
          <button
            type="button"
            onClick={spin}
            disabled={Boolean(built.error) || spinning}
            aria-label="Spin the wheel"
            className={`${PRIMARY_BTN} mt-5 w-full sm:w-auto sm:px-10`}
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {spinning ? "Spinning…" : "Spin"}
          </button>
          <p aria-live="polite" className="mt-2 min-h-5 text-sm text-[var(--success)]">
            {!spinning && winner && !winner.error ? `${winner.label} wins!` : ""}
          </p>
        </div>
      </section>

      {!built.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Odds and results</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">Entry</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Chance</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Wins</th>
                  <th scope="col" className="py-2 font-semibold">Actual</th>
                </tr>
              </thead>
              <tbody>
                {stats.rows.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)]">
                    <th scope="row" className="py-2.5 pr-4 font-semibold text-[var(--foreground)]">
                      {row.label}
                    </th>
                    <td className="py-2.5 pr-4 text-[var(--muted-foreground)]">
                      {row.expectedPercent}%
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--foreground)]">{row.wins}</td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">
                      {stats.spins === 0 ? DASH : `${row.observedPercent}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Spins so far", String(stats.spins)],
              ["Most drawn", stats.mostDrawn || DASH],
              ["Never drawn", stats.neverDrawn.length ? stats.neverDrawn.join(", ") : DASH],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Each spin draws from a seeded generator, so the slice widths are the real odds — an entry
        with three times the weight wins three times as often over a long run. Short runs will look
        lopsided, and that is normal.
      </p>
    </main>
  );
}
