"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Star } from "lucide-react";
import { DEITIES, GENDERS, NAKSHATRAS, NAMES, PADA_COUNT, findNames } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";
const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVY".split("");

const DEFAULTS = {
  mode: "letter",
  letter: "A",
  nakshatra: "Rohini",
  pada: "any",
  gender: "any",
  deity: "any",
  meaning: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TOGGLE_ON = "bg-[var(--primary)] text-[var(--primary-foreground)]";
const TOGGLE_OFF =
  "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]";
const TOGGLE_BASE =
  "min-h-11 rounded-md text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [letter, setLetter] = useState(DEFAULTS.letter);
  const [nakshatra, setNakshatra] = useState(DEFAULTS.nakshatra);
  const [pada, setPada] = useState(DEFAULTS.pada);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [deity, setDeity] = useState(DEFAULTS.deity);
  const [meaning, setMeaning] = useState(DEFAULTS.meaning);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => findNames({ mode, letter, nakshatra, pada, gender, deity, meaning }),
    [mode, letter, nakshatra, pada, gender, deity, meaning],
  );

  const hasError = Boolean(result.error);
  const names = hasError ? [] : result.names;

  const copyList = async () => {
    if (hasError || names.length === 0) return;
    const text = names
      .map(
        (n) =>
          `${n.name} (${n.gender}) — ${n.meaning}; root ${n.root}${n.deity ? `; ${n.deity}` : ""}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setLetter(DEFAULTS.letter);
    setNakshatra(DEFAULTS.nakshatra);
    setPada(DEFAULTS.pada);
    setGender(DEFAULTS.gender);
    setDeity(DEFAULTS.deity);
    setMeaning(DEFAULTS.meaning);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Star className="h-4 w-4" aria-hidden="true" />
          {NUM.format(NAMES.length)} names · 27 nakshatras
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hindu Baby Name Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search by starting letter, or by the nakshatra and pada from the birth chart, which give
          the traditional starting syllable. Every name shows its Sanskrit root, meaning and the
          deity or figure it is linked to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Search by</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["letter", "Starting letter"],
              ["nakshatra", "Nakshatra & pada"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={`${TOGGLE_BASE} px-4 ${mode === id ? TOGGLE_ON : TOGGLE_OFF}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {mode === "letter" ? (
          <fieldset className="mt-5">
            <legend className={LABEL_CLASS}>Starting letter</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLetter("any")}
                aria-pressed={letter === "any"}
                className={`${TOGGLE_BASE} min-w-11 px-3 ${letter === "any" ? TOGGLE_ON : TOGGLE_OFF}`}
              >
                All
              </button>
              {ALPHABET.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLetter(item)}
                  aria-pressed={letter === item}
                  aria-label={`Names starting with ${item}`}
                  className={`${TOGGLE_BASE} min-w-11 px-2 ${letter === item ? TOGGLE_ON : TOGGLE_OFF}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="hn-nakshatra">
                Nakshatra (birth star)
              </label>
              <select
                id="hn-nakshatra"
                className={`mt-2 ${INPUT_CLASS}`}
                value={nakshatra}
                onChange={(event) => setNakshatra(event.target.value)}
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="hn-pada">
                Pada (quarter)
              </label>
              <select
                id="hn-pada"
                className={`mt-2 ${INPUT_CLASS}`}
                value={pada}
                onChange={(event) => setPada(event.target.value)}
              >
                <option value="any">All four padas</option>
                {Array.from({ length: PADA_COUNT }, (_, index) => index + 1).map((p) => (
                  <option key={p} value={p}>
                    Pada {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hn-gender">
              Gender
            </label>
            <select
              id="hn-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              {GENDERS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hn-deity">
              Linked deity or figure
            </label>
            <select
              id="hn-deity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deity}
              onChange={(event) => setDeity(event.target.value)}
            >
              <option value="any">Any</option>
              {DEITIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hn-meaning">
              Meaning contains
            </label>
            <input
              id="hn-meaning"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={meaning}
              placeholder="light, sun, victory, peace…"
              onChange={(event) => setMeaning(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={reset}
            aria-label="Reset all filters"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset filters
          </button>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Names matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.matched)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the filters above to see names."
                : `out of ${NUM.format(result.total)} names in the list`}
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={copyList}
            aria-label="Copy the matching names with their meanings"
            disabled={hasError || names.length === 0}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy list"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Search mode", mode === "letter" ? "Starting letter" : "Nakshatra & pada"],
            [
              mode === "letter" ? "Letter" : "Nakshatra",
              mode === "letter" ? (letter === "any" ? "All" : letter) : nakshatra,
            ],
            [
              "Suggested syllables",
              mode !== "nakshatra"
                ? "Not used in letter mode"
                : hasError
                  ? DASH
                  : `${result.syllables.join(", ")} (${result.padaLabel})`,
            ],
            ["Gender", GENDERS.find((g) => g.id === gender)?.label ?? DASH],
            ["Linked deity", deity === "any" ? "Any" : deity],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Matching names</h2>
          {names.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              No names in this list start with those syllables. Try all four padas, clear the deity
              or meaning filter, or switch to searching by letter.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Sanskrit root
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Meaning
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Deity / figure
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {names.map((entry) => (
                    <tr key={entry.name} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {entry.name}
                        <span className="ml-2 text-xs font-normal capitalize text-[var(--muted-foreground)]">
                          {entry.gender}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{entry.root}</td>
                      <td className="py-2 pr-3">{entry.meaning}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{entry.deity || DASH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Syllable matching runs on the romanised spelling, so treat it as a starting point rather
        than a substitute for a family astrologer — regional traditions differ on a few pada
        syllables. Sanskrit roots are given in IAST transliteration.
      </p>
    </main>
  );
}
