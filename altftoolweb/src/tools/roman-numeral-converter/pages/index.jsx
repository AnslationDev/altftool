"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, BookOpen, Calendar, CircleAlert, Copy, Hash, Sparkles } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STRICT_RE = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

const SYMBOL_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

const SYMBOL_TABLE = [
  ["I", 1],
  ["V", 5],
  ["X", 10],
  ["L", 50],
  ["C", 100],
  ["D", 500],
  ["M", 1000],
];

const SUBTRACTIVE_PAIRS = [
  ["IV", 4],
  ["IX", 9],
  ["XL", 40],
  ["XC", 90],
  ["CD", 400],
  ["CM", 900],
];

const ALLOWED_PAIRS = SUBTRACTIVE_PAIRS.map(([pair]) => pair);

const ROMAN_PAIRS = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const CURRENT_YEAR = new Date().getFullYear();

function toRoman(value) {
  let rest = value;
  let out = "";
  ROMAN_PAIRS.forEach(([n, symbol]) => {
    while (rest >= n) {
      out += symbol;
      rest -= n;
    }
  });
  return out;
}

function fromRoman(value) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) {
    const cur = SYMBOL_VALUES[value[i]];
    const next = SYMBOL_VALUES[value[i + 1]] || 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

function explainRomanError(value) {
  const bad = value.match(/[^IVXLCDM]/);
  if (bad) {
    return `"${bad[0]}" is not a Roman symbol — only I, V, X, L, C, D and M are allowed.`;
  }
  const four = value.match(/I{4,}|X{4,}|C{4,}|M{4,}/);
  if (four) {
    return `"${four[0]}" repeats a symbol more than 3 times — write 4 as IV, 40 as XL, 400 as CD.`;
  }
  const repeat = value.match(/V{2,}|L{2,}|D{2,}/);
  if (repeat) {
    return `"${repeat[0]}" is invalid — V, L and D can never repeat.`;
  }
  for (let i = 0; i < value.length - 1; i += 1) {
    if (SYMBOL_VALUES[value[i]] < SYMBOL_VALUES[value[i + 1]]) {
      const pair = value.slice(i, i + 2);
      if (!ALLOWED_PAIRS.includes(pair)) {
        return `"${pair}" is not an allowed subtraction — only IV, IX, XL, XC, CD and CM are valid.`;
      }
    }
  }
  return "Symbols must run from largest to smallest, and each subtractive pair (IV, IX, XL, XC, CD, CM) can appear at most once.";
}

const parseYear = (raw) => {
  const trimmed = String(raw).trim();
  const n = Number(trimmed);
  return trimmed && Number.isInteger(n) && n >= 1 && n <= 3999 ? n : null;
};

const placeLabels = ["Thousands", "Hundreds", "Tens", "Units"];

function getBreakdown(value) {
  const parts = [
    Math.floor(value / 1000) * 1000,
    Math.floor((value % 1000) / 100) * 100,
    Math.floor((value % 100) / 10) * 10,
    value % 10,
  ];
  return parts
    .map((part, index) => ({ value: part, label: placeLabels[index], roman: toRoman(part) }))
    .filter((part) => part.value > 0);
}

function FieldError({ message }) {
  return (
    <p
      className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5"
      style={{ color: "var(--anslation-ds-danger)" }}
      role="alert"
    >
      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default function ToolHome() {
  const [numberInput, setNumberInput] = useState("2024");
  const [romanInput, setRomanInput] = useState("MMXXIV");
  const [birthYear, setBirthYear] = useState("2000");
  const [copied, setCopied] = useState(null);

  const numberError = useMemo(() => {
    const trimmed = numberInput.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return "That is not a number — digits only.";
    if (!Number.isInteger(n)) return "Roman numerals only represent whole numbers — no decimals.";
    if (n < 1) return "Romans had no zero or negative numbers — use 1 to 3999.";
    if (n > 3999) return "Standard Roman numerals stop at 3999 (MMMCMXCIX).";
    return null;
  }, [numberInput]);

  const romanError = useMemo(() => {
    const trimmed = romanInput.trim();
    if (!trimmed) return null;
    if (STRICT_RE.test(trimmed)) return null;
    return explainRomanError(trimmed);
  }, [romanInput]);

  const activeNumber = useMemo(() => {
    const value = parseYear(numberInput);
    if (value !== null) return value;
    const up = romanInput.trim();
    if (up && STRICT_RE.test(up)) return fromRoman(up);
    return null;
  }, [numberInput, romanInput]);

  // Each Copy button must only ever copy what its OWN field currently, validly
  // shows — never activeNumber's cross-field fallback — otherwise an invalid
  // edit in one field leaves its Copy button silently copying stale text from
  // the other field instead of erroring or copying nothing.
  const numberFieldValue = useMemo(() => parseYear(numberInput), [numberInput]);
  const romanFieldValue = useMemo(() => {
    const up = romanInput.trim();
    return up && STRICT_RE.test(up) ? up : null;
  }, [romanInput]);

  const breakdown = useMemo(
    () => (activeNumber === null ? [] : getBreakdown(activeNumber)),
    [activeNumber]
  );

  const birthRoman = useMemo(() => {
    const year = parseYear(birthYear);
    return year === null ? null : toRoman(year);
  }, [birthYear]);

  const handleNumberChange = (raw) => {
    setNumberInput(raw);
    const value = parseYear(raw);
    if (value !== null) setRomanInput(toRoman(value));
  };

  const handleRomanChange = (raw) => {
    const up = raw.toUpperCase().trim();
    setRomanInput(up);
    if (up && STRICT_RE.test(up)) setNumberInput(String(fromRoman(up)));
  };

  const applyYear = (year) => {
    setNumberInput(String(year));
    setRomanInput(toRoman(year));
  };

  const copyValue = async (id, text) => {
    const success = await safeCopyText(text);
    if (!success) return;
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const yearPresets = [
    { label: `This year (${CURRENT_YEAR})`, year: CURRENT_YEAR },
    { label: "1947", year: 1947 },
    { label: "1999", year: 1999 },
    { label: "2000", year: 2000 },
    { label: `Next year (${CURRENT_YEAR + 1})`, year: CURRENT_YEAR + 1 },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Hash className="h-4 w-4" />
            Number converter
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Roman Numeral Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert any number from 1 to 3999 into Roman numerals and back — with strict validation
            that explains exactly why a numeral like IIII or VX is invalid.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Number (1 – 3999)</span>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={3999}
                  step={1}
                  value={numberInput}
                  onChange={(event) => handleNumberChange(event.target.value)}
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <button
                  type="button"
                  onClick={() =>
                    numberFieldValue !== null && copyValue("number", String(numberFieldValue))
                  }
                  disabled={numberFieldValue === null}
                  className="btn-secondary min-h-12 shrink-0 px-3 text-sm disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied === "number" ? "Copied" : "Copy"}
                </button>
              </div>
            </label>
            {numberError && <FieldError message={numberError} />}

            <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              <span className="h-px flex-1 bg-[var(--border)]" />
              <ArrowLeftRight className="h-4 w-4 text-[var(--primary)]" />
              Two-way live conversion
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <label className="block">
              <span className="text-sm font-semibold">Roman numeral</span>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  maxLength={15}
                  value={romanInput}
                  onChange={(event) => handleRomanChange(event.target.value)}
                  placeholder="MMXXIV"
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-semibold uppercase tracking-widest outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <button
                  type="button"
                  onClick={() => romanFieldValue !== null && copyValue("roman", romanFieldValue)}
                  disabled={romanFieldValue === null}
                  className="btn-secondary min-h-12 shrink-0 px-3 text-sm disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied === "roman" ? "Copied" : "Copy"}
                </button>
              </div>
            </label>
            {romanError && <FieldError message={romanError} />}

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-[var(--primary)]" />
                Year quick-presets
              </p>
              <div className="flex flex-wrap gap-2">
                {yearPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyYear(preset.year)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Place-value breakdown
            </p>
            <div aria-live="polite">
              {activeNumber === null ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Enter a valid number or Roman numeral to see how it splits into thousands,
                  hundreds, tens and units.
                </p>
              ) : (
                <>
                  <p className="mt-4 text-3xl font-semibold">
                    {new Intl.NumberFormat("en-IN").format(activeNumber)} ={" "}
                    <span className="tracking-widest text-[var(--primary)]">{toRoman(activeNumber)}</span>
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {breakdown.map((part, index) => (
                      <div key={part.label} className="flex items-center gap-3">
                        {index > 0 && (
                          <span className="text-xl font-semibold text-[var(--muted-foreground)]">+</span>
                        )}
                        <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-center">
                          <p className="text-xl font-semibold tracking-widest text-[var(--primary)]">
                            {part.roman}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                            {new Intl.NumberFormat("en-IN").format(part.value)} · {part.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                    Each place value is written separately with its own symbols, then joined from
                    largest to smallest — that is all a Roman numeral is.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4 text-[var(--primary)]" />
              Symbol reference
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {SYMBOL_TABLE.map(([symbol, value]) => (
                <div
                  key={symbol}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-3 text-center"
                >
                  <p className="text-xl font-semibold text-[var(--primary)]">{symbol}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    {new Intl.NumberFormat("en-IN").format(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold">Subtractive notation rules</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUBTRACTIVE_PAIRS.map(([pair, value]) => (
                <span
                  key={pair}
                  className="rounded-md bg-[var(--muted)] px-3 py-1.5 text-sm font-semibold text-[var(--primary)]"
                >
                  {pair} = {value}
                </span>
              ))}
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>Only these six pairs may place a smaller symbol before a larger one.</li>
              <li>I, X, C and M can repeat up to 3 times in a row; V, L and D never repeat.</li>
              <li>Everything else must run from largest to smallest, left to right.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="w-full max-w-xs">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                Your birth year in Roman
              </p>
              <label className="block">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Birth year (1 – 3999)
                </span>
                <input
                  type="number"
                  min={1}
                  max={3999}
                  step={1}
                  value={birthYear}
                  onChange={(event) => setBirthYear(event.target.value)}
                  className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>
            <div aria-live="polite" className="min-h-12">
              {birthRoman ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Born in{" "}
                  <span className="text-2xl font-semibold tracking-widest text-[var(--primary)]">
                    {birthRoman}
                  </span>{" "}
                  — carve it above your door.
                </p>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Enter a year between 1 and 3999 to see it in Roman numerals.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
