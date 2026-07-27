"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle } from "lucide-react";

import {
  BUDGETS,
  CUISINES,
  DIFFICULTIES,
  drawNames,
  hashSeed,
  makeTeams,
  MAX_TEAMS,
  MEAL_TYPES,
  MIN_TEAMS,
  pickLunch,
  pickTruthOrDare,
} from "../lib";

const DEFAULTS = {
  tab: "lunch",
  cuisine: "any",
  budget: "any",
  mealType: "any",
  minRating: "4",
  mode: "either",
  difficulty: "medium",
  names: "Ana\nBen\nCara\nDev\nEli\nFay\nGus",
  drawCount: "1",
  teamCount: "3",
  seed: 20260727,
};

const TABS = [
  ["lunch", "Lunch picker"],
  ["truthdare", "Truth or Dare"],
  ["names", "Name picker"],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[9rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [tab, setTab] = useState(DEFAULTS.tab);
  const [cuisine, setCuisine] = useState(DEFAULTS.cuisine);
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [mealType, setMealType] = useState(DEFAULTS.mealType);
  const [minRating, setMinRating] = useState(DEFAULTS.minRating);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [difficulty, setDifficulty] = useState(DEFAULTS.difficulty);
  const [namesText, setNamesText] = useState(DEFAULTS.names);
  const [drawCount, setDrawCount] = useState(DEFAULTS.drawCount);
  const [teamCount, setTeamCount] = useState(DEFAULTS.teamCount);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copied, setCopied] = useState(false);

  const names = useMemo(
    () => namesText.split(/\r?\n|,/).map((name) => name.trim()).filter(Boolean),
    [namesText],
  );

  const lunch = useMemo(
    () => pickLunch({ cuisine, budget, type: mealType, minRating: toNumber(minRating), seed }),
    [cuisine, budget, mealType, minRating, seed],
  );

  const card = useMemo(
    () => pickTruthOrDare({ mode, difficulty, seed }),
    [mode, difficulty, seed],
  );

  const draw = useMemo(() => drawNames(names, toNumber(drawCount), seed), [names, drawCount, seed]);
  const teams = useMemo(() => makeTeams(names, toNumber(teamCount), seed), [names, teamCount, seed]);

  const active = tab === "lunch" ? lunch : tab === "truthdare" ? card : draw;
  const hasError = Boolean(active.error);

  const headline =
    tab === "lunch"
      ? lunch.error
        ? DASH
        : lunch.pick.name
      : tab === "truthdare"
        ? card.error
          ? DASH
          : card.kind === "truth"
            ? "Truth"
            : "Dare"
        : draw.error
          ? DASH
          : draw.winners.join(", ");

  const summary = useMemo(() => {
    if (hasError) return "";
    if (tab === "lunch") {
      return `Lunch pick: ${lunch.pick.name} — ${lunch.pick.cuisine}, ${lunch.pick.budget}, rated ${lunch.pick.rating}. Chosen from ${lunch.matches.length} matching places.`;
    }
    if (tab === "truthdare") {
      return `${card.kind === "truth" ? "Truth" : "Dare"} (${difficulty}): ${card.prompt}`;
    }
    const teamText = teams.error
      ? ""
      : `\nTeams: ${teams.teams.map((team) => `${team.name}: ${team.members.join(", ")}`).join(" | ")}`;
    return `Drawn: ${draw.winners.join(", ")}${teamText}`;
  }, [hasError, tab, lunch, card, difficulty, draw, teams]);

  const spin = () => {
    // A fresh seed per spin. Randomness lives here in the event handler, never in the
    // pure functions, so any given seed always reproduces the same result.
    setSeed(hashSeed(`${seed}-${Math.random()}`));
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

  const reset = () => {
    setTab(DEFAULTS.tab);
    setCuisine(DEFAULTS.cuisine);
    setBudget(DEFAULTS.budget);
    setMealType(DEFAULTS.mealType);
    setMinRating(DEFAULTS.minRating);
    setMode(DEFAULTS.mode);
    setDifficulty(DEFAULTS.difficulty);
    setNamesText(DEFAULTS.names);
    setDrawCount(DEFAULTS.drawCount);
    setTeamCount(DEFAULTS.teamCount);
    setSeed(DEFAULTS.seed);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Three pickers in one
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Random Fun Picker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Settle lunch, run a Truth or Dare round, or draw names and split teams. Every draw uses a
          Fisher-Yates shuffle on a seeded generator, so each option has exactly the same chance.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Picker</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {TABS.map(([value, label]) => (
              <label
                key={value}
                htmlFor={`tab-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  tab === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`tab-${value}`}
                  type="radio"
                  name="picker-tab"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={tab === value}
                  onChange={(event) => setTab(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {tab === "lunch" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="lunch-cuisine">
                Cuisine
              </label>
              <select
                id="lunch-cuisine"
                className={`mt-2 ${INPUT_CLASS}`}
                value={cuisine}
                onChange={(event) => setCuisine(event.target.value)}
              >
                <option value="any">Any cuisine</option>
                {CUISINES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.emoji} {entry.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="lunch-budget">
                Budget
              </label>
              <select
                id="lunch-budget"
                className={`mt-2 ${INPUT_CLASS}`}
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              >
                <option value="any">Any budget</option>
                {BUDGETS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.emoji} {entry.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="lunch-type">
                Meal type
              </label>
              <select
                id="lunch-type"
                className={`mt-2 ${INPUT_CLASS}`}
                value={mealType}
                onChange={(event) => setMealType(event.target.value)}
              >
                <option value="any">Any type</option>
                {MEAL_TYPES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.emoji} {entry.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="lunch-rating">
                Minimum rating (0 to 5)
              </label>
              <input
                id="lunch-rating"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
              />
            </div>
          </div>
        )}

        {tab === "truthdare" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="td-mode">
                Draw
              </label>
              <select
                id="td-mode"
                className={`mt-2 ${INPUT_CLASS}`}
                value={mode}
                onChange={(event) => setMode(event.target.value)}
              >
                <option value="either">Either — let the coin decide</option>
                <option value="truth">Truth only</option>
                <option value="dare">Dare only</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="td-difficulty">
                Difficulty
              </label>
              <select
                id="td-difficulty"
                className={`mt-2 ${INPUT_CLASS}`}
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                {DIFFICULTIES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label} — {entry.note}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {tab === "names" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="names-list">
                Names — one per line, or comma separated
              </label>
              <textarea
                id="names-list"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={namesText}
                onChange={(event) => setNamesText(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="draw-count">
                How many to draw
              </label>
              <input
                id="draw-count"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={drawCount}
                onChange={(event) => setDrawCount(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="team-count">
                Split into how many teams ({MIN_TEAMS}–{MAX_TEAMS})
              </label>
              <input
                id="team-count"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_TEAMS}
                max={MAX_TEAMS}
                step="1"
                value={teamCount}
                onChange={(event) => setTeamCount(event.target.value)}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={spin} className={PRIMARY_BTN} aria-label="Draw again">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Spin again
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset every picker">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {active.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {tab === "lunch" ? "Lunch is" : tab === "truthdare" ? "You drew" : "Drawn"}
            </p>
            <p className="mt-1 text-3xl leading-snug font-semibold break-words text-[var(--primary)] sm:text-4xl">
              {headline}
            </p>
            {tab === "truthdare" && !hasError && (
              <p className="mt-2 text-base leading-6">{card.prompt}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the result to the clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {tab === "lunch" &&
            [
              ["Cuisine", hasError ? DASH : lunch.pick.cuisine],
              ["Budget", hasError ? DASH : lunch.pick.budget],
              ["Type", hasError ? DASH : lunch.pick.type],
              ["Rating", hasError ? DASH : `${lunch.pick.rating} / 5`],
              ["Places that matched", hasError ? DASH : String(lunch.matches.length)],
              [
                "Chance this one came up",
                hasError ? DASH : `${PCT.format(lunch.chancePercent)}%`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}

          {tab === "truthdare" &&
            [
              ["Difficulty", difficulty],
              ["Cards in this deck", hasError ? DASH : String(card.deckSize)],
              [
                "Chance of this card",
                hasError ? DASH : `${PCT.format(card.chancePercent)}%`,
              ],
              ["Truth or dare split", mode === "either" ? "50 / 50" : "fixed by your choice"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}

          {tab === "names" &&
            [
              ["Names in the hat", String(names.length)],
              [
                "Chance of being drawn",
                hasError ? DASH : `${PCT.format(draw.chancePercent)}%`,
              ],
              ["Not drawn", hasError ? DASH : draw.remaining.join(", ") || "nobody"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold break-words">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      {tab === "names" && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Teams</h2>
          {teams.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {teams.error}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Split as evenly as possible: {teams.smallest} or {teams.largest} people per team.
              </p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {teams.teams.map((team) => (
                  <li key={team.name} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-sm font-semibold">{team.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {team.members.join(", ") || "empty"}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {tab === "lunch" && !hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Everything that matched</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Place</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Cuisine</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Budget</th>
                  <th scope="col" className="py-2 text-right font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {lunch.matches.map((place) => (
                  <tr key={place.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{place.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{place.cuisine}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{place.budget}</td>
                    <td className="py-2 text-right">{place.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Restaurant names and ratings are sample data for the demo, not listings from any review
        site. Truth and Dare prompts are meant for willing players — skip anything that would make
        someone uncomfortable.
      </p>
    </main>
  );
}
