"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dices, RotateCcw } from "lucide-react";

import LudoMain from "./main";
import {
  buildOddsTable,
  chanceOfSix,
  CHANCE_OF_FORFEIT,
  EXPECTED_ROLLS_TO_ENTER,
  expectedSquaresPerTurn,
  expectedTurnsPerToken,
  HOME_STRETCH_SIZE,
  MAX_CONSECUTIVE_SIXES,
  MAX_PATH_STEPS,
  SAFE_SQUARES,
  TOKENS_PER_PLAYER,
  TOTAL_CELLS,
} from "../lib";

const DEFAULT_ROLLS = "4";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const fmt = (digits) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits });
const pct = (value) => (Number.isFinite(value) ? `${fmt(1).format(value)}%` : DASH);

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [rolls, setRolls] = useState(DEFAULT_ROLLS);
  const [copied, setCopied] = useState(false);

  const parsedRolls = useMemo(() => {
    const cleaned = rolls.trim();
    if (cleaned === "") return NaN;
    const value = Number(cleaned);
    return Number.isInteger(value) ? value : NaN;
  }, [rolls]);

  const odds = useMemo(() => chanceOfSix(parsedRolls), [parsedRolls]);
  const hasError = Boolean(odds.error);
  const table = useMemo(() => buildOddsTable(6), []);
  const perTurn = useMemo(() => expectedSquaresPerTurn(), []);
  const perToken = useMemo(() => expectedTurnsPerToken(), []);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Ludo odds",
      `Chance of at least one 6 in ${parsedRolls} rolls: ${pct(odds.percent)}`,
      `Expected rolls to release a token: ${EXPECTED_ROLLS_TO_ENTER}`,
      `Expected squares moved per turn: ${fmt(2).format(perTurn)}`,
      `Expected turns to walk one token 56 squares: ${fmt(1).format(perToken)}`,
      `Chance of forfeiting a turn with three sixes: ${pct(CHANCE_OF_FORFEIT * 100)}`,
    ].join("\n");
  }, [hasError, parsedRolls, odds, perTurn, perToken]);

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
    setRolls(DEFAULT_ROLLS);
    setCopied(false);
  };

  return (
    <>
      <LudoMain />

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
            <Dices className="h-4 w-4" aria-hidden="true" />
            Board facts and dice odds
          </div>
          <h2 className="text-2xl font-semibold">The numbers behind the board</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            The circuit is {TOTAL_CELLS} squares and each token walks {MAX_PATH_STEPS} steps in
            total — {MAX_PATH_STEPS - HOME_STRETCH_SIZE} on the shared track and{" "}
            {HOME_STRETCH_SIZE} up your own home column, with the last one needing an exact roll.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ludo-rolls">
                Rolls in a row
              </label>
              <input
                id="ludo-rolls"
                className={`${INPUT_CLASS} mt-1`}
                value={rolls}
                onChange={(event) => {
                  setRolls(event.target.value);
                  setCopied(false);
                }}
                type="number"
                min="0"
                max="1000"
                step="1"
                inputMode="numeric"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                How likely you are to see at least one 6.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
              {hasError ? (
                <p
                  role="alert"
                  className="mb-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  {odds.error}
                </p>
              ) : null}
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Chance of at least one 6
              </p>
              <p className="mt-1 text-4xl leading-none font-bold">
                {hasError ? DASH : pct(odds.percent)}
              </p>
            </div>
          </div>

          <dl className="mt-4">
            <Row label="Tokens per player" value={TOKENS_PER_PLAYER} />
            <Row label="Steps from yard to home" value={MAX_PATH_STEPS} />
            <Row label="Starred safe squares" value={SAFE_SQUARES.join(", ")} />
            <Row label="Expected rolls to release a token" value={EXPECTED_ROLLS_TO_ENTER} />
            <Row label="Expected squares moved per turn" value={fmt(2).format(perTurn)} />
            <Row label="Expected turns to walk one token home" value={fmt(1).format(perToken)} />
            <Row
              label={`Chance of ${MAX_CONSECUTIVE_SIXES} sixes in a row (turn forfeited)`}
              value={pct(CHANCE_OF_FORFEIT * 100)}
            />
          </dl>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-xs border-collapse text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">
                    Rolls
                  </th>
                  <th scope="col" className="border-b border-[var(--border)] py-2 font-medium">
                    Chance of at least one 6
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.rolls}>
                    <td className="border-b border-[var(--border)] py-2 pr-3 font-semibold">
                      {row.rolls}
                    </td>
                    <td className="border-b border-[var(--border)] py-2">{pct(row.percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={copyResult}
              aria-label="Copy the Ludo odds to the clipboard"
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
