"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

const DEFAULT_TITLE = "10 Café Ideas für Straßenfest — Best of 2026!";

/** Characters that NFD normalisation cannot decompose into ASCII. */
const CHAR_MAP = {
  ß: "ss", æ: "ae", Æ: "ae", œ: "oe", Œ: "oe", ø: "o", Ø: "o", å: "aa", Å: "aa",
  đ: "d", Đ: "d", ð: "d", Ð: "d", þ: "th", Þ: "th", ł: "l", Ł: "l", ı: "i", ŋ: "ng",
  "€": " euro ", "£": " pound ", "¥": " yen ", "₹": " rupees ", $: " dollar ",
  "&": " and ", "@": " at ", "%": " percent ", "+": " plus ", "©": " c ", "®": " r ",
  "°": " deg ", "№": " no ",
  // Cyrillic (BGN/PCGN-style romanisation)
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
  // Greek
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k",
  λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t",
  υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
};

const STOP_WORDS = new Set([
  "a", "an", "and", "as", "at", "be", "but", "by", "for", "from", "in", "into",
  "is", "it", "of", "on", "or", "the", "this", "that", "to", "with",
]);

const SEPARATORS = [
  { id: "-", label: "Hyphen ( - )" },
  { id: "_", label: "Underscore ( _ )" },
];

const mapChar = (char) => {
  if (Object.prototype.hasOwnProperty.call(CHAR_MAP, char)) return CHAR_MAP[char];
  const lower = char.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(CHAR_MAP, lower)) return CHAR_MAP[lower];
  return char;
};

function transliterate(input) {
  // Split accents off their base letters (NFD) and drop the combining marks
  // first, so accented Greek/Latin letters reach the map as plain letters.
  const stripped = String(input).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return Array.from(stripped).map(mapChar).join("");
}

function slugify(title, options) {
  const { separator, lowercase, removeStopWords, removeNumbers, maxLength } = options;

  const ascii = transliterate(String(title || ""));
  const cased = lowercase ? ascii.toLowerCase() : ascii;

  let words = cased
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  if (removeNumbers) {
    const withoutNumbers = words.filter((word) => !/^\d+$/.test(word));
    if (withoutNumbers.length > 0) words = withoutNumbers;
  }

  if (removeStopWords) {
    const kept = words.filter((word) => !STOP_WORDS.has(word.toLowerCase()));
    // Never return an empty slug just because every word was a stop word.
    if (kept.length > 0) words = kept;
  }

  let slug = words.join(separator);

  if (maxLength > 0 && slug.length > maxLength) {
    const cut = slug.slice(0, maxLength);
    const lastSeparator = cut.lastIndexOf(separator);
    slug = lastSeparator > 0 ? cut.slice(0, lastSeparator) : cut;
  }

  return slug;
}

const nf = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [titles, setTitles] = useState(DEFAULT_TITLE);
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [maxLengthInput, setMaxLengthInput] = useState("60");
  const [baseUrl, setBaseUrl] = useState("https://example.com/blog/");
  const [copiedKey, setCopiedKey] = useState("");

  const maxLengthValue = maxLengthInput.trim() === "" ? 0 : Number(maxLengthInput);
  const maxLengthInvalid =
    maxLengthInput.trim() !== "" &&
    (!Number.isFinite(maxLengthValue) || maxLengthValue < 5 || maxLengthValue > 300);
  const maxLength = maxLengthInvalid ? 0 : Math.floor(maxLengthValue);

  const options = useMemo(
    () => ({ separator, lowercase, removeStopWords, removeNumbers, maxLength }),
    [lowercase, maxLength, removeNumbers, removeStopWords, separator]
  );

  const rows = useMemo(() => {
    const lines = titles.split("\n").map((line) => line.trim()).filter(Boolean);
    const seen = new Map();
    return lines.map((line) => {
      const base = slugify(line, options);
      if (!base) return { title: line, slug: "", empty: true };
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return {
        title: line,
        slug: count === 0 ? base : `${base}${options.separator}${count + 1}`,
        deduped: count > 0,
        empty: false,
      };
    });
  }, [options, titles]);

  const primary = rows[0];
  const allSlugs = rows.filter((row) => !row.empty).map((row) => row.slug).join("\n");
  const emptyCount = rows.filter((row) => row.empty).length;

  const copy = useCallback(async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1400);
    } catch {
      setCopiedKey("");
    }
  }, []);

  const reset = () => {
    setTitles(DEFAULT_TITLE);
    setSeparator("-");
    setLowercase(true);
    setRemoveStopWords(false);
    setRemoveNumbers(false);
    setMaxLengthInput("60");
    setBaseUrl("https://example.com/blog/");
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Link2 className="h-4 w-4" aria-hidden="true" />
            Text & Writing
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">URL Slug Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Turn headlines into clean, safe URL slugs. Accents, German, Cyrillic and Greek letters
            are transliterated to ASCII, symbols become words, and duplicates get numbered.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <label htmlFor="usg-titles" className="text-sm font-semibold">
                Title (one per line for bulk slugs)
              </label>
              <textarea
                id="usg-titles"
                value={titles}
                onChange={(event) => setTitles(event.target.value)}
                rows={6}
                spellCheck="false"
                placeholder="How to Bake Sourdough at Home"
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              {rows.length === 0 && (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  Enter at least one title to generate a slug.
                </p>
              )}
              {rows.length > 0 && emptyCount > 0 && (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  {nf.format(emptyCount)} line{emptyCount === 1 ? "" : "s"} produced no slug — they
                  contain no letters or digits that survive transliteration.
                </p>
              )}
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Generated slug
                  </p>
                  <p className="mt-1 break-all text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
                    {primary && !primary.empty ? primary.slug : "—"}
                  </p>
                  <p className="mt-2 break-all text-sm text-[var(--muted-foreground)]">
                    {baseUrl.replace(/\/+$/, "")}/
                    {primary && !primary.empty ? primary.slug : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(primary && !primary.empty ? primary.slug : "", "primary")}
                  aria-label="Copy the generated slug"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copiedKey === "primary" ? "Copied!" : "Copy slug"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Slug length", primary && !primary.empty ? `${nf.format(primary.slug.length)} chars` : "0 chars"],
                  ["Words", primary && !primary.empty ? nf.format(primary.slug.split(separator).filter(Boolean).length) : "0"],
                  ["Slugs generated", nf.format(rows.filter((row) => !row.empty).length)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {rows.length > 1 && (
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">All slugs</h2>
                  <button
                    type="button"
                    onClick={() => copy(allSlugs, "all")}
                    aria-label="Copy every generated slug"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {copiedKey === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copiedKey === "all" ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <ul className="mt-3 divide-y divide-[var(--border)]">
                  {rows.map((row, index) => (
                    <li key={`${row.title}-${index}`} className="py-2.5">
                      <p className="truncate text-xs text-[var(--muted-foreground)]">{row.title}</p>
                      <p className="mt-0.5 break-all text-sm font-semibold">
                        {row.empty ? (
                          <span className="text-[var(--danger)]">No usable characters</span>
                        ) : (
                          row.slug
                        )}
                        {row.deduped ? (
                          <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                            duplicate numbered
                          </span>
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold">Options</h2>

            <label htmlFor="usg-separator" className="mt-4 block text-sm font-medium">
              Word separator
            </label>
            <select
              id="usg-separator"
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            >
              {SEPARATORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <label htmlFor="usg-max" className="mt-4 block text-sm font-medium">
              Max length (characters)
            </label>
            <input
              id="usg-max"
              type="number"
              inputMode="numeric"
              min="5"
              max="300"
              value={maxLengthInput}
              onChange={(event) => setMaxLengthInput(event.target.value)}
              placeholder="Leave blank for no limit"
              className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
            {maxLengthInvalid && (
              <p
                role="alert"
                className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                Enter a length between 5 and 300, or leave it blank for no limit.
              </p>
            )}

            <label htmlFor="usg-base" className="mt-4 block text-sm font-medium">
              Base URL for preview
            </label>
            <input
              id="usg-base"
              type="text"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />

            <div className="mt-4 grid gap-3">
              {[
                ["Lowercase everything", lowercase, setLowercase, "Recommended — URLs are case sensitive on most servers."],
                ["Remove stop words", removeStopWords, setRemoveStopWords, "Drops a, the, of, and similar filler words."],
                ["Remove standalone numbers", removeNumbers, setRemoveNumbers, "Useful when the year in a title changes each update."],
              ].map(([label, value, setter, hint]) => (
                <label key={label} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => setter(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>
                    {label}
                    <span className="block text-xs text-[var(--muted-foreground)]">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={reset}
              aria-label="Reset all options"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Reset
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
