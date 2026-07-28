"use client";

import { useMemo, useState } from "react";
import { BookA, Check, Copy, RotateCcw, Search } from "lucide-react";

import {
  GEMATRIA_METHODS,
  HEBREW_LETTERS,
  MAX_NUMERAL,
  MIN_NUMERAL,
  NIQQUD,
  finalFormLetters,
  fromHebrewNumeral,
  gematria,
  searchLetters,
  toHebrewNumeral,
  transliterate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  word: "שלום",
  method: "hechrachi",
  numberInput: "248",
  numeralInput: "רמח",
  query: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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
  const [word, setWord] = useState(DEFAULTS.word);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [numberInput, setNumberInput] = useState(DEFAULTS.numberInput);
  const [numeralInput, setNumeralInput] = useState(DEFAULTS.numeralInput);
  const [query, setQuery] = useState(DEFAULTS.query);
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);

  const sum = useMemo(() => gematria(word, method), [word, method]);
  const numeral = useMemo(() => toHebrewNumeral(toInt(numberInput)), [numberInput]);
  const decoded = useMemo(() => fromHebrewNumeral(numeralInput), [numeralInput]);
  const latin = useMemo(() => transliterate(word), [word]);
  const results = useMemo(() => searchLetters(query), [query]);
  const finals = useMemo(() => finalFormLetters(), []);
  const activeMethod = useMemo(
    () => GEMATRIA_METHODS.find((item) => item.id === method) || GEMATRIA_METHODS[0],
    [method],
  );

  const hasError = Boolean(sum.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Hebrew Alphabet Explorer",
      `Word: ${word.trim()} (${latin})`,
      `Gematria (${activeMethod.label}): ${NUM.format(sum.total)}`,
      `Letters: ${sum.breakdown.map((item) => `${item.char}=${item.value}`).join(" + ")}`,
      numeral.error ? "" : `${NUM.format(numeral.value)} in Hebrew numerals: ${numeral.numeral}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, word, latin, activeMethod, sum, numeral]);

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
    setWord(DEFAULTS.word);
    setMethod(DEFAULTS.method);
    setNumberInput(DEFAULTS.numberInput);
    setNumeralInput(DEFAULTS.numeralInput);
    setQuery(DEFAULTS.query);
    setOpenId(null);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookA className="h-4 w-4" aria-hidden="true" />
          Script learning
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Hebrew Alphabet Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The 22 letters written right to left, the five that change shape at the end of a word, the
          niqqud vowel points, and the letter values behind gematria and Hebrew numerals.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Add up a word (gematria)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="heb-word">
              Hebrew word
            </label>
            <input
              id="heb-word"
              className={`mt-2 ${INPUT_CLASS} text-right text-lg`}
              type="text"
              dir="rtl"
              lang="he"
              value={word}
              onChange={(event) => setWord(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="heb-method">
              Counting method
            </label>
            <select
              id="heb-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {GEMATRIA_METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{activeMethod.note}</p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {sum.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Gematria value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : NUM.format(sum.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Type a Hebrew word above" : `${sum.letterCount} letters · reads as “${latin}”`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the gematria result"
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Letter</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3" colSpan={3}>
                    {dash}
                  </td>
                </tr>
              ) : (
                sum.breakdown.map((item, index) => (
                  <tr
                    key={`${item.char}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 text-xl font-semibold">{item.char}</td>
                    <td className="py-2 pr-3">
                      {item.name}
                      {item.isFinal ? (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">final form</span>
                      ) : null}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM.format(item.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Hebrew numerals</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Numbers are written with letters: 248 is רמח. Hundreds above 400 repeat ת, and 15 and 16
          are written טו and טז to avoid spelling part of the divine name.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="heb-number">
              Number ({MIN_NUMERAL}–{NUM.format(MAX_NUMERAL)})
            </label>
            <input
              id="heb-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_NUMERAL}
              max={MAX_NUMERAL}
              step="1"
              value={numberInput}
              onChange={(event) => setNumberInput(event.target.value)}
            />
            <p className="mt-2 text-xl font-semibold" dir="rtl" lang="he">
              {numeral.error ? dash : numeral.numeral}
            </p>
            {numeral.error ? (
              <p
                role="alert"
                className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {numeral.error}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="heb-numeral">
              Hebrew numeral to read back
            </label>
            <input
              id="heb-numeral"
              className={`mt-2 ${INPUT_CLASS} text-right text-lg`}
              type="text"
              dir="rtl"
              lang="he"
              value={numeralInput}
              onChange={(event) => setNumeralInput(event.target.value)}
            />
            <p className="mt-2 text-xl font-semibold">
              {decoded.error ? dash : NUM.format(decoded.value)}
            </p>
            {decoded.error ? (
              <p
                role="alert"
                className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {decoded.error}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The 22 letters</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="heb-search">
            Search a letter, name or sound
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              id="heb-search"
              className={`${INPUT_CLASS} pl-9`}
              type="search"
              placeholder="final, dagesh, shin, 400"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {NUM.format(results.length)} of {NUM.format(HEBREW_LETTERS.length)} letters shown ·{" "}
            {NUM.format(finals.length)} have final forms
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
                  <span className="w-16 shrink-0 text-2xl font-semibold text-[var(--primary)]" lang="he">
                    {letter.char}
                    {letter.final ? ` ${letter.final}` : ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {letter.name}{" "}
                      <span className="font-normal text-[var(--muted-foreground)]" lang="he">
                        {letter.hebrewName}
                      </span>
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      value {NUM.format(letter.value)}
                      {letter.finalValue ? ` · final ${NUM.format(letter.finalValue)}` : ""}
                      {letter.begadkefat ? " · takes a dagesh" : ""}
                    </span>
                  </span>
                </button>
                {open ? (
                  <div className="border-t border-[var(--border)] px-3 py-3 text-sm">
                    <p>
                      <span className="font-semibold">Sound: </span>
                      {letter.sound}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {results.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No letter matches that search. Try a name such as “shin”, a value such as “400”, or the
            word “final”.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Niqqud — the vowel points</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Everyday Hebrew is written without vowels. Niqqud marks are added in children&rsquo;s
          books, poetry and scripture, shown here on the letter bet.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Mark</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Sound</th>
                <th scope="col" className="py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {NIQQUD.map((mark) => (
                <tr key={mark.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-xl" lang="he">{`ב${mark.mark}`}</td>
                  <td className="py-2 pr-3 font-semibold">{mark.name}</td>
                  <td className="py-2 pr-3">{mark.sound}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{mark.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The transliteration shows the consonant skeleton only, because unpointed Hebrew does not
        write most vowels. Gematria is presented here as a feature of the writing system and a study
        aid, not as a method of prediction.
      </p>
    </main>
  );
}
