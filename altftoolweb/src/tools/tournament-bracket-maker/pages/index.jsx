"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Trophy } from "lucide-react";

import { BYE, MAX_ENTRANTS, SEEDING_METHODS, buildBracket, parseEntrants } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENTRANTS = [
  "Thunder FC",
  "Riverside United",
  "Northside Rovers",
  "Harbour City",
  "Old Mill Athletic",
  "Kingsway Wanderers",
].join("\n");

export default function ToolHome() {
  const [raw, setRaw] = useState(DEFAULT_ENTRANTS);
  const [seeding, setSeeding] = useState("standard");
  const [randomSeed, setRandomSeed] = useState(1);
  const [thirdPlace, setThirdPlace] = useState(false);
  const [copied, setCopied] = useState(false);

  const entrants = useMemo(() => parseEntrants(raw), [raw]);
  const result = useMemo(
    () => buildBracket({ entrants, seeding, randomSeed, thirdPlace }),
    [entrants, seeding, randomSeed, thirdPlace],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Tournament bracket — ${result.entrantCount} entrants, ${result.drawSize}-team draw`,
      `${SEEDING_METHODS[result.seeding]}`,
      `Matches to play: ${result.playableMatches}${result.thirdPlace ? " (includes third-place play-off)" : ""}`,
      `Byes: ${result.byes}`,
      "",
    ];
    result.rounds.forEach((round) => {
      lines.push(round.name);
      round.matches.forEach((m) => {
        lines.push(
          `  M${m.matchNumber}: ${m.slotA}${m.seedA ? ` (${m.seedA})` : ""} v ${m.slotB}${m.seedB ? ` (${m.seedB})` : ""}` +
            (m.autoWinner ? ` → ${m.autoWinner} advances` : ""),
        );
      });
    });
    if (result.thirdPlace) lines.push("Third-place play-off: losing semi-finalists");
    return lines.join("\n");
  }, [hasError, result]);

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
    setRaw(DEFAULT_ENTRANTS);
    setSeeding("standard");
    setRandomSeed(1);
    setThirdPlace(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Knockout draw
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tournament Bracket Maker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter one player or team per line. The draw is padded to the next power of two,
          byes go to the top seeds, and standard seeding keeps seed 1 and seed 2 on opposite
          halves until the final.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="bracket-entrants">
          Entrants (one per line, up to {MAX_ENTRANTS})
        </label>
        <textarea
          id="bracket-entrants"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={7}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {NUM.format(entrants.length)} entrant{entrants.length === 1 ? "" : "s"} detected.
          In seeded modes the first name is seed 1.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bracket-seeding">
              Seeding method
            </label>
            <select
              id="bracket-seeding"
              value={seeding}
              onChange={(e) => setSeeding(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            >
              {Object.entries(SEEDING_METHODS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={LABEL_CLASS} htmlFor="bracket-seed">
                Draw number (random mode)
              </label>
              <input
                id="bracket-seed"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={randomSeed}
                onChange={(e) => setRandomSeed(e.target.value)}
                disabled={seeding !== "random"}
                className={`${INPUT_CLASS} mt-1 disabled:opacity-60`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSeeding("random");
                setRandomSeed((prev) => Number(prev || 0) + 1);
              }}
              className={GHOST_BTN}
              aria-label="Redraw with a new random draw number"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Redraw
            </button>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={thirdPlace}
            onChange={(e) => setThirdPlace(e.target.checked)}
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
          />
          Add a third-place play-off between the losing semi-finalists
        </label>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <p className="text-sm text-[var(--muted-foreground)]">Matches to play</p>
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {hasError ? DASH : NUM.format(result.playableMatches)}
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Draw size</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.drawSize}-team bracket`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Rounds</dt>
            <dd className="text-sm font-semibold">{hasError ? DASH : result.roundCount}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Byes</dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : result.byes === 0
                  ? "None — full draw"
                  : `${result.byes} (seeds ${result.byeSeeds.join(", ")})`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">First round fixtures</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : result.rounds[0].matches.length - result.byeMatches}
            </dd>
          </div>
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <div className="flex min-w-max gap-4">
              {result.rounds.map((round) => (
                <div key={round.name} className="w-56 shrink-0">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--primary)]">
                    {round.name}
                  </h2>
                  <ul className="space-y-2">
                    {round.matches.map((match) => (
                      <li
                        key={match.matchNumber}
                        className="rounded-lg border border-[var(--border)] p-3 text-sm"
                      >
                        <p className="mb-1 text-xs text-[var(--muted-foreground)]">
                          Match {match.matchNumber}
                        </p>
                        <p className={match.slotA === BYE ? "text-[var(--muted-foreground)]" : "font-medium"}>
                          {match.seedA ? `${match.seedA}. ` : ""}
                          {match.slotA}
                        </p>
                        <p className={match.slotB === BYE ? "text-[var(--muted-foreground)]" : "font-medium"}>
                          {match.seedB ? `${match.seedB}. ` : ""}
                          {match.slotB}
                        </p>
                        {match.autoWinner && (
                          <p className="mt-1 text-xs text-[var(--success)]">
                            {match.autoWinner} advances on a bye
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {result.thirdPlace && (
                <div className="w-56 shrink-0">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--primary)]">
                    Third place
                  </h2>
                  <div className="rounded-lg border border-[var(--border)] p-3 text-sm">
                    <p className="mb-1 text-xs text-[var(--muted-foreground)]">Play-off</p>
                    <p className="font-medium">Losing semi-finalist</p>
                    <p className="font-medium">Losing semi-finalist</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyResult}
            disabled={hasError}
            className={PRIMARY_BTN}
            aria-label="Copy the full bracket as text"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy bracket"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset the bracket">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
