"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";
import { GENDERS, NAMES, ORIGINS, TAGS, checkAbdName, filterNames } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const DEFAULTS = {
  letter: "A",
  gender: "any",
  origin: "any",
  tag: "any",
  meaning: "",
  abdCheck: "Abdul Rahman",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_BASE =
  "min-h-11 min-w-11 rounded-md text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_ON = "bg-[var(--primary)] text-[var(--primary-foreground)]";
const TOGGLE_OFF = "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]";

export default function ToolHome() {
  const [letter, setLetter] = useState(DEFAULTS.letter);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [tag, setTag] = useState(DEFAULTS.tag);
  const [meaning, setMeaning] = useState(DEFAULTS.meaning);
  const [abdCheck, setAbdCheck] = useState(DEFAULTS.abdCheck);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => filterNames({ letter, gender, origin, tag, meaning }),
    [letter, gender, origin, tag, meaning],
  );
  const abd = useMemo(() => checkAbdName(abdCheck), [abdCheck]);

  const hasError = Boolean(result.error);
  const names = hasError ? [] : result.names;

  const copyList = async () => {
    if (hasError || names.length === 0) return;
    const text = names
      .map((n) => `${n.name} ${n.arabic} / ${n.urdu} (${n.gender}) — ${n.meaning}`)
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
    setTag(DEFAULTS.tag);
    setMeaning(DEFAULTS.meaning);
    setAbdCheck(DEFAULTS.abdCheck);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          {NUM.format(NAMES.length)} names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Muslim Baby Name Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Browse names with their Arabic spelling, the usual Urdu form, and what the word actually
          means. Names belonging to a prophet, a companion or the family of the Prophet are marked.
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
              className={`${TOGGLE_BASE} px-3 ${letter === "any" ? TOGGLE_ON : TOGGLE_OFF}`}
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
                className={`${TOGGLE_BASE} px-2 ${letter === item ? TOGGLE_ON : TOGGLE_OFF}`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mn-gender">
              Gender
            </label>
            <select
              id="mn-gender"
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
            <label className={LABEL_CLASS} htmlFor="mn-tag">
              Category
            </label>
            <select
              id="mn-tag"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            >
              {TAGS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mn-origin">
              Language of origin
            </label>
            <select
              id="mn-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              <option value="any">Any</option>
              {ORIGINS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mn-meaning">
              Meaning contains
            </label>
            <input
              id="mn-meaning"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={meaning}
              placeholder="light, mercy, star, pure…"
              onChange={(event) => setMeaning(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={reset} aria-label="Reset all filters">
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
            ["Starting letter", letter === "any" ? "All letters" : letter],
            ["Gender", GENDERS.find((g) => g.id === gender)?.label ?? DASH],
            ["Category", TAGS.find((t) => t.id === tag)?.label ?? DASH],
            ["Language of origin", origin === "any" ? "Any" : origin],
            ["Meaning filter", meaning.trim() ? meaning.trim() : "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check an &quot;Abd&quot; compound name</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="mn-abd">
          Name to check
        </label>
        <input
          id="mn-abd"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          value={abdCheck}
          placeholder="Abdul Rahman"
          onChange={(event) => setAbdCheck(event.target.value)}
        />
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            abd.ok === true
              ? "bg-[var(--success)]/15 text-[var(--success)]"
              : abd.ok === false
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
          role={abd.ok === false ? "alert" : undefined}
        >
          {abd.message || "Not an Abd- compound, so this rule does not apply."}
        </p>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Matching names</h2>
          {names.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              No names match those filters. Try a different letter or clear the category and meaning
              filters.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Arabic</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Urdu</th>
                    <th scope="col" className="py-2 font-semibold">Meaning</th>
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
                      <td className="py-2 pr-3 text-base" lang="ar" dir="rtl">
                        {entry.arabic}
                      </td>
                      <td className="py-2 pr-3 text-base" lang="ur" dir="rtl">
                        {entry.urdu}
                      </td>
                      <td className="py-2">
                        {entry.meaning}
                        {entry.tag && (
                          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                            {TAGS.find((t) => t.id === entry.tag)?.label}
                          </span>
                        )}
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
        The Urdu column applies the two standard orthographic conventions — final ة becomes ہ and
        final ي becomes ی — so a few names differ from the Arabic. Transliterations and family
        spellings vary; this page is informational and not a religious ruling.
      </p>
    </main>
  );
}
