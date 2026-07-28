"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Languages, RotateCcw, Search } from "lucide-react";

import {
  CYRILLIC_LETTERS,
  DEFAULT_SYSTEM,
  TRANSLIT_SYSTEMS,
  falseFriends,
  letterCounts,
  readabilityScore,
  searchLetters,
  transliterate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  text: "Москва, Санкт-Петербург, Чайковский, Юлия",
  system: DEFAULT_SYSTEM,
  query: "",
  filter: "all",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TYPE_FILTERS = [
  { id: "all", label: "All 33" },
  { id: "vowel", label: "Vowels" },
  { id: "consonant", label: "Consonants" },
  { id: "sign", label: "Signs" },
];

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [system, setSystem] = useState(DEFAULTS.system);
  const [query, setQuery] = useState(DEFAULTS.query);
  const [filter, setFilter] = useState(DEFAULTS.filter);
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);

  const romanised = useMemo(() => transliterate(text, system), [text, system]);
  const score = useMemo(() => readabilityScore(text), [text]);
  const counts = useMemo(() => letterCounts(), []);
  const traps = useMemo(() => falseFriends(), []);

  const results = useMemo(() => {
    const found = searchLetters(query);
    return filter === "all" ? found : found.filter((letter) => letter.type === filter);
  }, [query, filter]);

  const activeSystem = useMemo(
    () => TRANSLIT_SYSTEMS.find((item) => item.id === system) || TRANSLIT_SYSTEMS[0],
    [system],
  );

  const hasError = Boolean(score.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cyrillic transliteration",
      `System: ${activeSystem.label}`,
      `Cyrillic: ${text.trim()}`,
      `Latin: ${romanised.trim()}`,
      `Cyrillic letters: ${score.letters} (${NUM.format(score.familiarPct)}% share a shape and sound with Latin)`,
    ].join("\n");
  }, [hasError, activeSystem, text, romanised, score]);

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
    setText(DEFAULTS.text);
    setSystem(DEFAULTS.system);
    setQuery(DEFAULTS.query);
    setFilter(DEFAULTS.filter);
    setOpenId(null);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          Script learning
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Cyrillic Alphabet Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The 33 letters of the Russian alphabet with their names, sounds and the shapes that trick
          Latin readers — В is v, Н is n, Р is r, С is s. Romanise any text using the ICAO passport
          standard or ISO 9.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Transliterate</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="cyr-system">
              Romanisation standard
            </label>
            <select
              id="cyr-system"
              className={`mt-2 ${INPUT_CLASS}`}
              value={system}
              onChange={(event) => setSystem(event.target.value)}
            >
              {TRANSLIT_SYSTEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{activeSystem.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cyr-text">
              Cyrillic text
            </label>
            <textarea
              id="cyr-text"
              className={`mt-2 ${AREA_CLASS}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {score.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Romanised
            </p>
            <p className="mt-1 text-2xl font-semibold break-words text-[var(--primary)] sm:text-3xl">
              {hasError ? dash : romanised}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Paste some Cyrillic above" : `${activeSystem.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the transliteration"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset everything" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cyrillic letters in the text", hasError ? dash : NUM.format(score.letters)],
            ["Letters that look and sound Latin", hasError ? dash : NUM.format(score.familiar)],
            ["Letters you have to learn", hasError ? dash : NUM.format(score.unfamiliar)],
            ["Share already readable", hasError ? dash : `${NUM.format(score.familiarPct)}%`],
            ["Vowels in the alphabet", NUM.format(counts.vowel)],
            ["Consonants in the alphabet", NUM.format(counts.consonant)],
            ["Silent signs", NUM.format(counts.sign)],
            ["Letters that look like Latin but are not", NUM.format(traps.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The alphabet</h2>

        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="cyr-search">
            Search a letter, sound or name
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              id="cyr-search"
              className={`${INPUT_CLASS} pl-9`}
              type="search"
              placeholder="soft sign, zh, щ, loch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {TYPE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                filter === item.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {NUM.format(results.length)} of {NUM.format(CYRILLIC_LETTERS.length)} letters shown
        </p>

        <ul className="mt-3 grid gap-2">
          {results.map((letter) => {
            const open = openId === letter.id;
            return (
              <li key={letter.id} className="rounded-md border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : letter.id)}
                  aria-expanded={open}
                  className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <span className="w-14 shrink-0 text-2xl font-semibold text-[var(--primary)]">
                    {letter.upper} {letter.lower}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {letter.name}{" "}
                      <span className="font-normal text-[var(--muted-foreground)]">
                        ({letter.english})
                      </span>
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      passport “{letter.icao || "dropped"}” · ISO 9 “{letter.iso9}”
                    </span>
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-[var(--border)] px-3 py-3 text-sm">
                    <p>
                      <span className="font-semibold">Sound: </span>
                      {letter.sound}
                    </p>
                    {letter.lookalike ? (
                      <p className="mt-2">
                        <span className="font-semibold">Watch out: </span>
                        {letter.lookalike}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {results.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No letter matches that search. Try a sound such as “sh”, a name such as “soft sign”, or a
            letter such as ж.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sounds shown are standard Russian. Other Cyrillic languages use different inventories —
        Ukrainian has і, ї and є, Serbian has ј, љ and њ, and г is pronounced differently again in
        each.
      </p>
    </main>
  );
}
