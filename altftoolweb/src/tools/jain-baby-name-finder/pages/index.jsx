"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw, Shuffle } from "lucide-react";

import {
  CATEGORIES,
  GENDERS,
  ORIGINS,
  TIRTHANKARA_COUNT,
  availableInitials,
  findJainNames,
  maxSyllables,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  gender: "any",
  category: "any",
  origin: "any",
  letter: "",
  syllables: "",
  query: "",
  limit: "12",
  seed: 0,
};

const EM_DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const initials = useMemo(() => availableInitials(), []);
  const syllableCeiling = useMemo(() => maxSyllables(), []);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => findJainNames(form), [form]);
  const failed = Boolean(result.error);

  const shuffle = () => {
    setForm((current) => ({ ...current, seed: (Number(current.seed) || 0) + 1 }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const copyList = async () => {
    if (failed) return;
    const text = result.names.map((entry) => `${entry.name} - ${entry.meaning}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const pickLetter = (letter) => {
    setForm((current) => ({ ...current, letter: current.letter === letter ? "" : letter }));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Baby names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Jain Baby Name Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Names drawn from the {TIRTHANKARA_COUNT} Tirthankaras, the ten dharmas of Paryushan, Jain
          doctrine and named figures from the Agamas — each with its Sanskrit or Prakrit meaning and
          the tradition it comes from.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jbn-gender">
              Gender
            </label>
            <select id="jbn-gender" className={`mt-2 ${INPUT_CLASS}`} value={form.gender} onChange={setField("gender")}>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jbn-category">
              Source in the tradition
            </label>
            <select
              id="jbn-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.category}
              onChange={setField("category")}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jbn-origin">
              Language of origin
            </label>
            <select id="jbn-origin" className={`mt-2 ${INPUT_CLASS}`} value={form.origin} onChange={setField("origin")}>
              {ORIGINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jbn-syllables">
              Syllables
            </label>
            <select
              id="jbn-syllables"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.syllables}
              onChange={setField("syllables")}
            >
              <option value="">Any</option>
              {Array.from({ length: syllableCeiling }, (_, index) => index + 1).map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jbn-query">
              Search name or meaning
            </label>
            <input
              id="jbn-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              placeholder="forgiveness, lotus, Tirthankara…"
              value={form.query}
              onChange={setField("query")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jbn-limit">
              Names to show
            </label>
            <input
              id="jbn-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={form.limit}
              onChange={setField("limit")}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Starting letter</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {initials.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => pickLetter(letter)}
                aria-pressed={form.letter === letter}
                className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  form.letter === letter
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={shuffle} aria-label="Show a different slice of the matches" className={PRIMARY_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={copyList}
            disabled={failed}
            aria-label="Copy the list of names and meanings"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy list"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset all filters" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Names matching your filters
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {failed ? EM_DASH : result.matchedCount}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Shown below", failed ? EM_DASH : String(result.shownCount)],
            ["Boys / girls in the match", failed ? EM_DASH : `${result.byGender.boy} / ${result.byGender.girl}`],
            ["Names in the full list", failed ? EM_DASH : String(result.totalCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.names.length === 0 ? (
        <p className="mt-6 rounded-xl bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
          No name in the list matches every filter. Try clearing the starting letter or the syllable
          count.
        </p>
      ) : null}

      {!failed && result.names.length > 0 ? (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Meaning</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Origin</th>
                <th scope="col" className="py-2 font-semibold">Where it comes from</th>
              </tr>
            </thead>
            <tbody>
              {result.names.map((entry) => (
                <tr key={entry.name} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-3 pr-3">
                    <span className="font-semibold">{entry.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {entry.gender === "boy" ? "Boy" : "Girl"} · {entry.syllables}{" "}
                      {entry.syllables === 1 ? "syllable" : "syllables"}
                    </span>
                  </td>
                  <td className="py-3 pr-3">{entry.meaning}</td>
                  <td className="py-3 pr-3 text-[var(--muted-foreground)]">{entry.origin}</td>
                  <td className="py-3 text-[var(--muted-foreground)]">{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meanings and associations are given as they appear in Jain tradition; Digambara and
        Shvetambara accounts differ on some details, including the gender of the nineteenth
        Tirthankara. Check any name with your own family and community before you settle on it.
      </p>
    </main>
  );
}
