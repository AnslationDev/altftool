"use client";

import { useCallback, useMemo, useState } from "react";
import { BarChart3, Copy, RotateCcw } from "lucide-react";

const SAMPLE_TEXT = `Good writing is rewriting. The first draft exists only to be improved, so treat it as raw material rather than a finished product.

When you revise, read every sentence aloud. If you run out of breath, the sentence is probably too long. If a word does no work, cut it. Short sentences are not simple sentences; they are confident ones.

Readability formulas cannot judge whether an idea is worth reading, but they do reveal when your sentences have quietly grown to thirty words each. Use them as a smoke alarm, not as a style guide.`;

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further",
  "had", "has", "have", "having", "he", "her", "here", "hers", "him", "his", "how",
  "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my",
  "no", "nor", "not", "now", "of", "off", "on", "once", "only", "or", "other", "our", "out", "over", "own",
  "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "why", "will",
  "with", "would", "you", "your", "yours",
]);

const nf = new Intl.NumberFormat("en-IN");
const nf1 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const safe = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback);
const round1 = (value) => Math.round(safe(value) * 10) / 10;

/**
 * Heuristic English syllable counter (vowel-group method with common
 * silent-e and suffix corrections). Accurate for ~90% of English words,
 * which is the same basis the classic readability formulas assume.
 */
function countSyllables(rawWord) {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;

  let working = word;
  // Silent "-ed" (asked, played) but not the spoken one (needed, wanted).
  if (/[^dt]ed$/.test(working)) working = working.slice(0, -2);
  // Silent final "e" (create, brave) but never after "l" (table stays 2).
  working = working.replace(/(?:[^laeiouy]es|[^laeiouy]e)$/, "").replace(/^y/, "");

  const groups = working.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 0);
}

function analyze(text) {
  const trimmed = text.trim();
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const letters = (text.match(/[a-zA-ZÀ-ɏ]/g) || []).length;

  const wordList = trimmed ? trimmed.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)) : [];
  const words = wordList.length;

  // Split on sentence terminators (keeping trailing quotes/brackets) or on
  // line breaks, so headings and list items also count as one sentence each.
  const sentenceList = trimmed
    ? (trimmed.match(/[^.!?\n]+(?:[.!?]+["'\)\]]*|\n+|$)/g) || [])
        .map((s) => s.trim())
        .filter((s) => /[\p{L}\p{N}]/u.test(s))
    : [];
  const sentences = sentenceList.length;

  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length
    : 0;

  let syllables = 0;
  let complexWords = 0;
  let longestWord = "";
  const frequency = new Map();

  for (const raw of wordList) {
    const clean = raw.replace(/[^\p{L}\p{N}'-]/gu, "");
    if (!clean) continue;
    const s = countSyllables(clean);
    syllables += s;
    if (s >= 3) complexWords += 1;
    if (clean.length > longestWord.length) longestWord = clean;
    const key = clean.toLowerCase().replace(/^'+|'+$/g, "");
    if (key) frequency.set(key, (frequency.get(key) || 0) + 1);
  }

  const uniqueWords = frequency.size;
  const wordsPerSentence = sentences > 0 ? words / sentences : 0;
  const syllablesPerWord = words > 0 ? syllables / words : 0;
  const charsPerWord = words > 0 ? charactersNoSpaces / words : 0;

  const hasEnough = words > 0 && sentences > 0;

  const flesch = hasEnough
    ? 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    : 0;
  const fkGrade = hasEnough
    ? 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
    : 0;
  const fog = hasEnough
    ? 0.4 * (wordsPerSentence + 100 * (complexWords / words))
    : 0;
  const smog = hasEnough
    ? 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291
    : 0;
  const colemanLiau = hasEnough
    ? 0.0588 * ((letters / words) * 100) - 0.296 * ((sentences / words) * 100) - 15.8
    : 0;
  const ari = hasEnough
    ? 4.71 * charsPerWord + 0.5 * wordsPerSentence - 21.43
    : 0;

  const topWords = [...frequency.entries()]
    .filter(([word]) => !STOP_WORDS.has(word) && word.length > 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);

  return {
    characters,
    charactersNoSpaces,
    letters,
    words,
    sentences,
    paragraphs,
    syllables,
    complexWords,
    uniqueWords,
    longestWord,
    wordsPerSentence,
    syllablesPerWord,
    charsPerWord,
    lexicalDensity: words > 0 ? (uniqueWords / words) * 100 : 0,
    readingMinutes: words / 238,
    speakingMinutes: words / 140,
    flesch: Math.max(0, Math.min(100, safe(flesch))),
    fleschRaw: safe(flesch),
    fkGrade: Math.max(0, safe(fkGrade)),
    fog: Math.max(0, safe(fog)),
    smog: hasEnough ? Math.max(0, safe(smog)) : 0,
    colemanLiau: Math.max(0, safe(colemanLiau)),
    ari: Math.max(0, safe(ari)),
    topWords,
    hasEnough,
  };
}

function fleschBand(score) {
  if (score >= 90) return { label: "Very easy", note: "5th grade reading level" };
  if (score >= 80) return { label: "Easy", note: "6th grade reading level" };
  if (score >= 70) return { label: "Fairly easy", note: "7th grade reading level" };
  if (score >= 60) return { label: "Plain English", note: "8th-9th grade reading level" };
  if (score >= 50) return { label: "Fairly difficult", note: "10th-12th grade reading level" };
  if (score >= 30) return { label: "Difficult", note: "College reading level" };
  return { label: "Very difficult", note: "College graduate reading level" };
}

function formatDuration(minutes) {
  const total = Math.max(0, Math.round(safe(minutes) * 60));
  if (total < 60) return `${total} sec`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

function StatTile({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 break-words text-lg font-semibold text-[var(--foreground)]">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => analyze(text), [text]);
  const band = fleschBand(stats.flesch);

  const report = useMemo(
    () =>
      [
        "Text Statistics Analyzer",
        `Words: ${nf.format(stats.words)}`,
        `Unique words: ${nf.format(stats.uniqueWords)}`,
        `Characters: ${nf.format(stats.characters)} (${nf.format(stats.charactersNoSpaces)} without spaces)`,
        `Sentences: ${nf.format(stats.sentences)}`,
        `Paragraphs: ${nf.format(stats.paragraphs)}`,
        `Syllables: ${nf.format(stats.syllables)}`,
        `Words per sentence: ${nf1.format(round1(stats.wordsPerSentence))}`,
        `Syllables per word: ${nf1.format(round1(stats.syllablesPerWord))}`,
        `Flesch Reading Ease: ${nf1.format(round1(stats.flesch))} (${band.label})`,
        `Flesch-Kincaid Grade: ${nf1.format(round1(stats.fkGrade))}`,
        `Gunning Fog Index: ${nf1.format(round1(stats.fog))}`,
        `SMOG Index: ${nf1.format(round1(stats.smog))}`,
        `Coleman-Liau Index: ${nf1.format(round1(stats.colemanLiau))}`,
        `Automated Readability Index: ${nf1.format(round1(stats.ari))}`,
        `Reading time: ${formatDuration(stats.readingMinutes)}`,
      ].join("\n"),
    [band.label, stats]
  );

  const copyReport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [report]);

  const grades = [
    ["Flesch-Kincaid Grade", stats.fkGrade],
    ["Gunning Fog Index", stats.fog],
    ["SMOG Index", stats.smog],
    ["Coleman-Liau Index", stats.colemanLiau],
    ["Automated Readability", stats.ari],
  ];
  const averageGrade = stats.hasEnough
    ? grades.reduce((sum, [, value]) => sum + value, 0) / grades.length
    : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Text & Writing
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Text Statistics Analyzer</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Paste any text to get words, sentences, paragraphs, syllables and six readability
            scores. Everything is calculated in your browser as you type.
          </p>
        </header>

        <section className="mt-6 grid gap-6">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="tsa-text" className="text-sm font-semibold">
                Your text
              </label>
              <button
                type="button"
                onClick={() => setText("")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                aria-label="Clear the text box"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
            <textarea
              id="tsa-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={10}
              spellCheck="false"
              placeholder="Paste or type your text here…"
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setText(SAMPLE_TEXT)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Load sample text
              </button>
            </div>

            {!stats.hasEnough && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                Enter at least one full sentence — readability scores need both words and sentence
                endings to be meaningful.
              </p>
            )}
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Flesch Reading Ease
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {nf1.format(round1(stats.flesch))}
                  <span className="ml-2 text-base font-medium text-[var(--muted-foreground)]">/ 100</span>
                </p>
                <p className="mt-1 text-sm font-semibold">{band.label}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{band.note}</p>
              </div>
              <button
                type="button"
                onClick={copyReport}
                aria-label="Copy the full statistics report"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied!" : "Copy report"}
              </button>
            </div>

            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Reading ease ${Math.round(stats.flesch)} out of 100`}
            >
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-[width] motion-reduce:transition-none"
                style={{ width: `${Math.max(0, Math.min(100, stats.flesch))}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Words" value={nf.format(stats.words)} />
              <StatTile label="Characters" value={nf.format(stats.characters)} hint={`${nf.format(stats.charactersNoSpaces)} without spaces`} />
              <StatTile label="Sentences" value={nf.format(stats.sentences)} />
              <StatTile label="Paragraphs" value={nf.format(stats.paragraphs)} />
              <StatTile label="Syllables" value={nf.format(stats.syllables)} />
              <StatTile label="Unique words" value={nf.format(stats.uniqueWords)} hint={`${nf1.format(round1(stats.lexicalDensity))}% density`} />
              <StatTile label="Words / sentence" value={nf1.format(round1(stats.wordsPerSentence))} />
              <StatTile label="Syllables / word" value={nf1.format(round1(stats.syllablesPerWord))} />
              <StatTile label="Complex words" value={nf.format(stats.complexWords)} hint="3+ syllables" />
              <StatTile label="Longest word" value={stats.longestWord || "—"} />
              <StatTile label="Reading time" value={formatDuration(stats.readingMinutes)} hint="238 wpm" />
              <StatTile label="Speaking time" value={formatDuration(stats.speakingMinutes)} hint="140 wpm" />
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold">Grade level formulas</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Each score is the US school grade needed to read the text comfortably. Average:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                grade {nf1.format(round1(averageGrade))}
              </span>
              .
            </p>
            <div className="mt-3 divide-y divide-[var(--border)]">
              {grades.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                  <span className="text-sm font-semibold">{nf1.format(round1(value))}</span>
                </div>
              ))}
            </div>
          </div>

          {stats.topWords.length > 0 && (
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-sm font-semibold">Most used words</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Common stop words such as “the” and “and” are excluded.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {stats.topWords.map(([word, count]) => (
                  <li
                    key={word}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                  >
                    <span className="font-semibold">{word}</span>{" "}
                    <span className="text-[var(--muted-foreground)]">×{nf.format(count)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
