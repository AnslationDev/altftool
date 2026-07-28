"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Omega, RotateCcw, Search } from "lucide-react";

import {
  GREEK_LETTERS,
  MAX_NUMERAL,
  MIN_NUMERAL,
  OBSOLETE_NUMERALS,
  fromGreekNumeral,
  searchLetters,
  toGreekNumeral,
  transliterate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  query: "",
  numberInput: "1996",
  greekText: "άγγελος φιλοσοφία Οδυσσεύς",
  numeralInput: "ρκγ",
  sounds: "classical",
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

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [numberInput, setNumberInput] = useState(DEFAULTS.numberInput);
  const [greekText, setGreekText] = useState(DEFAULTS.greekText);
  const [numeralInput, setNumeralInput] = useState(DEFAULTS.numeralInput);
  const [sounds, setSounds] = useState(DEFAULTS.sounds);
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => searchLetters(query), [query]);
  const numeral = useMemo(() => toGreekNumeral(toInt(numberInput)), [numberInput]);
  const decoded = useMemo(() => fromGreekNumeral(numeralInput), [numeralInput]);
  const latin = useMemo(() => transliterate(greekText), [greekText]);

  const hasError = Boolean(numeral.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Greek Alphabet Explorer",
      `${NUM.format(numeral.value)} in Greek numerals: ${numeral.numeral}`,
      `Thousands ${numeral.parts.thousands} · hundreds ${numeral.parts.hundreds} · tens ${numeral.parts.tens} · units ${numeral.parts.units}`,
      greekText.trim() ? `Transliteration: ${greekText.trim()} → ${latin}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [numeral, hasError, greekText, latin]);

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
    setQuery(DEFAULTS.query);
    setNumberInput(DEFAULTS.numberInput);
    setGreekText(DEFAULTS.greekText);
    setNumeralInput(DEFAULTS.numeralInput);
    setSounds(DEFAULTS.sounds);
    setOpenId(null);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Omega className="h-4 w-4" aria-hidden="true" />
          Script learning
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Greek Alphabet Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          All 24 letters with their names, classical and modern sounds, Latin transliteration and
          Milesian numeral value — plus what each symbol stands for in maths, physics and statistics.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Greek numerals</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Before Arabic digits, Greeks wrote numbers with letters: α is 1, ρ is 100, and a leading ͵
          multiplies by a thousand. There is no zero in the system.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="greek-number">
              Number to convert ({MIN_NUMERAL}–{NUM.format(MAX_NUMERAL)})
            </label>
            <input
              id="greek-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_NUMERAL}
              max={MAX_NUMERAL}
              step="1"
              value={numberInput}
              onChange={(event) => setNumberInput(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="greek-numeral">
              Greek numeral to read back
            </label>
            <input
              id="greek-numeral"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={numeralInput}
              onChange={(event) => setNumeralInput(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {numeral.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              In Greek numerals
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : numeral.numeral}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Enter a whole number in range" : `= ${NUM.format(numeral.value)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Greek numeral and transliteration"
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
            ["Thousands part", hasError ? dash : NUM.format(numeral.parts.thousands)],
            ["Hundreds part", hasError ? dash : NUM.format(numeral.parts.hundreds)],
            ["Tens part", hasError ? dash : NUM.format(numeral.parts.tens)],
            ["Units part", hasError ? dash : NUM.format(numeral.parts.units)],
            [
              "Numeral you typed reads as",
              decoded.error ? dash : NUM.format(decoded.value),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {decoded.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {decoded.error}
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
              Three letters survive only as numerals
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Letter</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {OBSOLETE_NUMERALS.map((item) => (
                <tr key={item.char} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-lg font-semibold">{item.upper} {item.char}</td>
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 text-right font-semibold">{NUM.format(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Transliterate Greek to Latin letters</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="greek-text">
            Greek text
          </label>
          <textarea
            id="greek-text"
            className={`mt-2 ${AREA_CLASS}`}
            value={greekText}
            onChange={(event) => setGreekText(event.target.value)}
          />
        </div>
        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm break-words">
          {latin || <span className="text-[var(--muted-foreground)]">Type Greek above.</span>}
        </p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Accents and breathings are ignored. Gamma becomes n before γ, κ, ξ or χ, and upsilon
          becomes u inside the diphthongs αυ, ευ, ηυ and ου.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">The 24 letters</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" htmlFor="greek-sounds">
              Sounds
            </label>
            <select
              id="greek-sounds"
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={sounds}
              onChange={(event) => setSounds(event.target.value)}
            >
              <option value="classical">Classical</option>
              <option value="modern">Modern Greek</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="greek-search">
            Search a letter, sound or use
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              id="greek-search"
              className={`${INPUT_CLASS} pl-9`}
              type="search"
              placeholder="wavelength, sigma, θ, standard deviation"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {NUM.format(results.length)} of {NUM.format(GREEK_LETTERS.length)} letters shown
          </p>
        </div>

        <ul className="mt-4 grid gap-2">
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
                  <span className="w-16 shrink-0 text-2xl font-semibold text-[var(--primary)]">
                    {letter.upper} {letter.lower}
                    {letter.finalLower ? ` ${letter.finalLower}` : ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {letter.name} <span className="font-normal text-[var(--muted-foreground)]">{letter.greekName}</span>
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      writes as “{letter.translit}” · numeral value {NUM.format(letter.value)}
                    </span>
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-[var(--border)] px-3 py-3 text-sm">
                    <p>
                      <span className="font-semibold">
                        {sounds === "modern" ? "Modern Greek sound: " : "Classical sound: "}
                      </span>
                      {sounds === "modern" ? letter.modern : letter.classical}
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">Used for: </span>
                      {letter.usage}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {results.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No letter matches that search. Try a symbol, a name such as lambda, or a use such as
            &ldquo;wavelength&rdquo;.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Classical pronunciations are scholarly reconstructions and vary between teaching traditions;
        modern Greek sounds are the ones you will hear in Greece today.
      </p>
    </main>
  );
}
