"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, RotateCcw, Shuffle, Trophy } from "lucide-react";

import { MAX_WINNERS, SAMPLE_ENTRIES, runGiveaway } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

/** Fixed starting seed so the first render is identical on server and client. */
const INITIAL_SEED = 20260727;

const NUM = new Intl.NumberFormat("en-IN");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE_ENTRIES);
  const [winners, setWinners] = useState("2");
  const [alternates, setAlternates] = useState("1");
  const [seed, setSeed] = useState(INITIAL_SEED);
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [stripHandles, setStripHandles] = useState(true);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      runGiveaway({
        text,
        winners: toNumber(winners),
        alternates: toNumber(alternates),
        seed,
        mergeDuplicates,
        caseSensitive,
        stripHandles,
      }),
    [text, winners, alternates, seed, mergeDuplicates, caseSensitive, stripHandles],
  );

  const hasError = Boolean(result.error);
  const parsed = result.parsed ?? null;
  const draw = hasError ? null : result.draw;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Giveaway draw",
      `Entries in the draw: ${draw.entryCount} (total weight ${draw.totalWeight})`,
      `Seed: ${draw.seed} — re-running with this seed reproduces the same winners`,
      "",
      ...draw.winners.map((winner) => `Winner ${winner.position}: ${winner.name}`),
      ...draw.alternates.map((alt) => `Alternate ${alt.position}: ${alt.name}`),
      "",
      draw.oddsNote,
    ].join("\n");
  }, [hasError, draw]);

  const redraw = () => {
    if (!hasError && draw) {
      setHistory((prev) =>
        [{ seed: draw.seed, names: draw.winners.map((winner) => winner.name) }, ...prev].slice(0, 5),
      );
    }
    // A fresh seed comes from the clock in the handler, never during render.
    setSeed((Date.now() % 2147483647) + 1);
    setCopied(false);
  };

  const reset = () => {
    setText(SAMPLE_ENTRIES);
    setWinners("2");
    setAlternates("1");
    setSeed(INITIAL_SEED);
    setMergeDuplicates(true);
    setCaseSensitive(false);
    setStripHandles(true);
    setHistory([]);
    setCopied(false);
  };

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Giveaway draw
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Giveaway Winner Picker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your entries, spot duplicates, and draw winners with a seeded Fisher-Yates shuffle.
          The seed is shown with every result, so anyone holding the same list can re-run the draw
          and get the same names.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="entries">
          Entries — one per line. Add <code className="rounded bg-[var(--muted)] px-1">x3</code> or{" "}
          <code className="rounded bg-[var(--muted)] px-1">, 3</code> after a name for extra tickets.
        </label>
        <textarea
          id="entries"
          rows={8}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopied(false);
          }}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="winners">
              Winners to draw
            </label>
            <input
              id="winners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_WINNERS}
              step="1"
              value={winners}
              onChange={(event) => {
                setWinners(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alternates">
              Alternates (backup winners)
            </label>
            <input
              id="alternates"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="50"
              step="1"
              value={alternates}
              onChange={(event) => {
                setAlternates(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["merge", "One ticket per person (merge duplicates)", mergeDuplicates, setMergeDuplicates],
            ["handles", "Ignore a leading @ when comparing", stripHandles, setStripHandles],
            ["case", "Treat Priya and priya as different people", caseSensitive, setCaseSensitive],
          ].map(([id, label, value, setter]) => (
            <label
              key={id}
              htmlFor={id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id={id}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={value}
                onChange={(event) => {
                  setter(event.target.checked);
                  setCopied(false);
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Entries in the draw
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : num(draw.entryCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the entry list to run a draw."
                : draw.oddsPercent !== null
                  ? `Each entry had a ${draw.oddsPercent}% chance of winning`
                  : "Weighted draw — shares are shown beside each name"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={redraw} aria-label="Draw again with a new seed" className={PRIMARY_BTN}>
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Draw again
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the winners and seed to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the picker" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <ol className="mt-5 space-y-2">
          {hasError ? (
            <li className="rounded-md border border-[var(--border)] px-3 py-3 text-lg font-semibold text-[var(--muted-foreground)]">
              {DASH}
            </li>
          ) : (
            draw.winners.map((winner) => (
              <li
                key={`${winner.position}-${winner.name}`}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--primary)] bg-[var(--muted)] px-3 py-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Trophy className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                  <span className="truncate text-lg font-semibold">{winner.name}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-[var(--muted-foreground)]">
                  Winner {winner.position} · {winner.weight} ticket{winner.weight === 1 ? "" : "s"} ·{" "}
                  {winner.sharePercent}%
                </span>
              </li>
            ))
          )}
        </ol>

        {!hasError && draw.alternates.length > 0 && (
          <ol className="mt-3 space-y-2">
            {draw.alternates.map((alt) => (
              <li
                key={`alt-${alt.position}-${alt.name}`}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="truncate font-semibold">{alt.name}</span>
                <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                  Alternate {alt.position}
                </span>
              </li>
            ))}
          </ol>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Unique entrants", hasError || !parsed ? DASH : num(parsed.uniqueCount)],
            ["Duplicate lines found", hasError || !parsed ? DASH : num(parsed.duplicateLines)],
            ["Blank lines skipped", hasError || !parsed ? DASH : num(parsed.blankLines)],
            ["Lines with extra tickets", hasError || !parsed ? DASH : num(parsed.weightedLines)],
            ["Total tickets in the drum", hasError ? DASH : num(draw.totalWeight)],
            ["Draw seed", hasError ? DASH : String(draw.seed)],
            ["Method", "Seeded mulberry32 PRNG + Fisher-Yates, drawn without replacement"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && parsed && parsed.duplicates.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Duplicate entries</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {mergeDuplicates
              ? "These names appeared more than once and were merged into a single ticket each."
              : "These names appeared more than once and each repeat added another ticket."}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Times listed
                  </th>
                </tr>
              </thead>
              <tbody>
                {parsed.duplicates.map((duplicate) => (
                  <tr key={duplicate.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold break-all">{duplicate.name}</td>
                    <td className="py-2 text-right">{num(duplicate.times)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Previous draws in this session</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((entry, index) => (
              <li
                key={`${entry.seed}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2"
              >
                <span className="font-semibold break-all">{entry.names.join(", ")}</span>
                <span className="text-xs text-[var(--muted-foreground)]">seed {entry.seed}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Publish the entry list and the seed alongside the winners and anyone can verify the draw:
        the same list and seed always produce the same order. Prize draws are regulated differently
        in different places — check the rules that apply to you before running one.
      </p>
    </main>
  );
}
