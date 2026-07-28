"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Cross, RotateCcw } from "lucide-react";
import { GENDERS, INITIALS, NAMES, ORIGINS, SOURCES, findNames } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  letter: "any",
  gender: "any",
  origin: "any",
  source: "any",
  meaning: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const TOGGLE_ON = "bg-[var(--primary)] text-[var(--primary-foreground)]";
const TOGGLE_OFF =
  "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]";
const TOGGLE_BASE =
  "min-h-11 rounded-md text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [letter, setLetter] = useState(DEFAULTS.letter);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [source, setSource] = useState(DEFAULTS.source);
  const [meaning, setMeaning] = useState(DEFAULTS.meaning);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => findNames({ letter, gender, origin, source, meaning }),
    [letter, gender, origin, source, meaning],
  );

  const hasError = Boolean(result.error);
  const names = hasError ? [] : result.names;

  const copyList = async () => {
    if (hasError || names.length === 0) return;
    const text = names
      .map((n) => `${n.name} (${n.gender}, ${n.origin}) — ${n.meaning}; ${n.figure}`)
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
    setLetter(DEFAULTS.letter);
    setGender(DEFAULTS.gender);
    setOrigin(DEFAULTS.origin);
    setSource(DEFAULTS.source);
    setMeaning(DEFAULTS.meaning);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cross className="h-4 w-4" aria-hidden="true" />
          {NUM.format(NAMES.length)} names · Old and New Testament
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Christian Baby Name Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Filter biblical and Christian names by starting letter, gender, origin language and where
          the name appears — the Old Testament, the New Testament, the calendar of saints, or the
          virtue-name tradition. Each entry shows the root-word meaning and the figure it belongs to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
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
            {INITIALS.map((item) => (
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-gender">
              Gender
            </label>
            <select
              id="cb-gender"
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
            <label className={LABEL_CLASS} htmlFor="cb-source">
              Where the name comes from
            </label>
            <select
              id="cb-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              {SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-origin">
              Origin language
            </label>
            <select
              id="cb-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              <option value="any">Any language</option>
              {ORIGINS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-meaning">
              Meaning or figure contains
            </label>
            <input
              id="cb-meaning"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={meaning}
              placeholder="light, gift, prophet, apostle…"
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
            ["Old Testament names", hasError ? DASH : NUM.format(result.bySource.old)],
            ["New Testament names", hasError ? DASH : NUM.format(result.bySource.new)],
            ["Saints & tradition", hasError ? DASH : NUM.format(result.bySource.saint)],
            ["Virtue names", hasError ? DASH : NUM.format(result.bySource.virtue)],
            ["Origin language", origin === "any" ? "Any" : origin],
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
              No names match all of those filters. Clear the meaning box or widen the source and
              origin filters.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Origin
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Meaning
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Figure / source
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
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{entry.origin}</td>
                      <td className="py-2 pr-3">{entry.meaning}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {entry.figure}
                        <span className="block text-xs">{entry.sourceLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meanings are the conventional scholarly gloss of the root word; several biblical names have
        more than one accepted reading, and spellings differ between the Hebrew, Greek and Latin
        traditions. Check with your parish or minister if the name is being chosen for baptism.
      </p>
    </main>
  );
}
