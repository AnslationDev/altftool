/*
 * AltF Lexicon — the word-of-the-day rotation.
 *
 * Both word-of-the-day surfaces import this file, so there is exactly one
 * answer to "which word was 4 May?" and no way for the dated page and the
 * archive list to disagree.
 *
 * The rule is a pure function of the calendar date:
 *
 *     index = days since 1 January of that year   (0 for 1 Jan)
 *     slug  = getWotd()[index]
 *
 * Nothing is random, nothing is stored, and no state accumulates. That is what
 * makes the archive possible at all: a page for 4 May 2026 can be rendered
 * years later, or before it was ever requested, because the answer was always
 * derivable. Every other dictionary in the category serves word of the day at
 * a single evergreen URL with no history, which is a choice their data does
 * not force on them.
 *
 * Leap years. The rotation list is 366 slugs, which is one per day of the
 * longest possible year, so no day is ever skipped. In a common year the 366th
 * slug is simply never reached; in a leap year 29 February takes index 59 and
 * every date after it shifts one slot along. A given date always resolves to
 * the same word, which is the property the archive needs.
 *
 * The index is computed in UTC. A page rendered in Mumbai and a page rendered
 * in Oregon must name the same word, and local midnight is not the same
 * instant in both.
 */

import { COMMONNESS, indefiniteArticle, posLabel } from "@altftool/core/lexicon";
import { getWords, getWotd } from "@altftool/core/lexicon/corpus";

const MS_PER_DAY = 86_400_000;

/**
 * The first day with an archive page.
 *
 * The rotation would happily resolve 4 May 1817, but publishing a "word of the
 * day" for a day on which nobody could have read it is a fabricated record.
 * The archive starts on the day the dictionary did and grows by one page a day.
 */
export const ARCHIVE_START = "2026-01-01";

/** How many days of history the hub lists. Roughly four months. */
export const ARCHIVE_DAYS = 120;

/** How many dated pages are pre-rendered at build time. */
export const PRERENDER_DAYS = 30;

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

/**
 * Strict `YYYY-MM-DD` → UTC `Date`, or `null`.
 *
 * Strict means strict: `2026-7-4` is rejected for the missing pad, and
 * `2026-02-30` is rejected because the round trip through `Date.UTC` rolls it
 * forward to 2 March and no longer matches what was asked for. Anything this
 * returns null for is a 404, not a redirect to something nearby.
 */
export function parseDateKey(value) {
  const match = DATE_KEY.exec(String(value ?? ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/** UTC `Date` → `YYYY-MM-DD`. */
export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Today, as a date key, in UTC. */
export function todayKey(now = new Date()) {
  return toDateKey(now);
}

/** Days elapsed since 1 January of the same year. 1 January is 0. */
export function dayOfYear(date) {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - yearStart) / MS_PER_DAY);
}

/** Which slot in the rotation a date lands on. */
export function rotationIndex(date, length) {
  return dayOfYear(date) % length;
}

/** A date key `days` away from another. Negative goes backwards. */
export function shiftDateKey(key, days) {
  const date = parseDateKey(key);
  if (!date) return null;
  return toDateKey(new Date(date.getTime() + days * MS_PER_DAY));
}

/** `count` date keys ending at `key`, most recent first. */
export function recentDateKeys(key, count) {
  const keys = [];
  for (let offset = 0; offset < count; offset += 1) {
    const shifted = shiftDateKey(key, -offset);
    if (!shifted || shifted < ARCHIVE_START) break;
    keys.push(shifted);
  }
  return keys;
}

/**
 * Is this a date we publish a page for?
 *
 * Past days back to the launch floor, plus today. Tomorrow's word is knowable
 * — it is the same pure function — but serving it would open an unbounded set
 * of dated URLs running to the year 9999, all of them crawlable and none of
 * them read by anyone.
 */
export function isPublishedKey(key, now = new Date()) {
  if (!parseDateKey(key)) return false;
  return key >= ARCHIVE_START && key <= todayKey(now);
}

const LONG_DATE = { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
const SHORT_DATE = { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" };

/** "Wednesday, 29 July 2026" or "29 Jul 2026". */
export function formatDateKey(key, { short = false } = {}) {
  const date = parseDateKey(key);
  if (!date) return key;
  return date.toLocaleDateString("en-GB", short ? SHORT_DATE : LONG_DATE);
}

/* ------------------------------------------------------------------ *
 * Rotation
 * ------------------------------------------------------------------ */

/** The 366 slugs, in rotation order. */
export const getRotation = () => getWotd();

/** Which slug a date key resolves to, and where in the rotation it sits. */
export async function rotationFor(key) {
  const date = parseDateKey(key);
  if (!date) return null;

  const slugs = await getRotation();
  const index = rotationIndex(date, slugs.length);
  return { key, date, index, length: slugs.length, slug: slugs[index] };
}

/**
 * Full entries for a run of date keys, in the order given.
 *
 * One `getWords` call rather than one per day: the archive is 120 days but far
 * fewer buckets, and reading each bucket once is the difference between a page
 * that renders in a tenth of a second and one that does not.
 */
export async function entriesForDateKeys(keys) {
  const slugs = await getRotation();
  const perDay = keys.map((key) => {
    const date = parseDateKey(key);
    return { key, slug: date ? slugs[rotationIndex(date, slugs.length)] : null };
  });

  const entries = await getWords(perDay.map((day) => day.slug).filter(Boolean));
  const bySlug = new Map(entries.map((entry) => [entry.s, entry]));

  return perDay.map((day) => ({ ...day, entry: day.slug ? bySlug.get(day.slug) ?? null : null }));
}

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ *
 *
 * The note under each word is assembled from the entry's own record — its
 * syllable split, its sense count, the WordNet file its first sense is filed
 * in, what it sits under and above, and its measured commonness band.
 *
 * There is no etymology here and no anecdote about where the word came from,
 * because the corpus carries neither. A daily word column that invents a
 * derivation is worse than one that says less: it is the one part a reader
 * cannot check, and every other part of the entry is checkable.
 */

/**
 * A readable name for a WordNet lexicographer file.
 *
 * WordNet sorts every sense into one of 45 files by broad subject — noun.animal,
 * verb.motion, and so on. Nouns and verbs get many; adjectives and adverbs get
 * a handful, which is itself worth saying rather than rendering "the all file".
 */
function domainPhrase(domain) {
  const [posKey, file] = String(domain).split(".");
  const label = { noun: "noun", verb: "verb", adj: "adjective", adv: "adverb" }[posKey] ?? posKey;

  if (file === "Tops") {
    return `the top of WordNet's ${label} hierarchy, where its most general categories sit`;
  }
  if (file === "all") {
    return `WordNet's single ${label} file — it sorts nouns and verbs by subject but keeps ${label}s together`;
  }
  if (file === "pert") {
    return "WordNet's relational adjective file, for adjectives that mean “of or pertaining to” some noun";
  }
  if (file === "ppl") {
    return "WordNet's participial adjective file, for adjectives formed from verbs";
  }
  return `WordNet's "${file}" ${label} file`;
}

function listOf(values, limit = 3) {
  const shown = values.slice(0, limit);
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

/**
 * Two to five sentences about the day's word, every one of them derived.
 *
 * `facts` is `{ manifest, facets }`; both are needed to say how many other
 * entries share this word's commonness band and how it compares with the
 * corpus average for senses.
 */
export function editorialNote(entry, { manifest, facets }) {
  const notes = [];
  const first = entry.sn[0];

  if (entry.pt?.length > 1) {
    notes.push(
      `${entry.sy} syllables, with the beat on "${entry.pt[entry.st]}" — ${entry.pt.join("-")}.${
        entry.ip ? ` The transcription /${entry.ip}/ comes from the CMU Pronouncing Dictionary.` : ""
      }`,
    );
  } else if (entry.pt?.length === 1) {
    notes.push(
      `One syllable${entry.ip ? `, /${entry.ip}/` : ""}${
        entry.rs ? `, said "${entry.rs}"` : ""
      }. Single-beat words are ${(
        (facets.syllables["1"] / manifest.withSyllables) *
        100
      ).toFixed(0)}% of the ${manifest.withSyllables.toLocaleString("en-US")} entries carrying a syllable split, and they do a disproportionate share of the work in plain English.`,
    );
  }

  if (entry.pd) {
    notes.push(
      "This word is not in the pronouncing dictionary, so the syllable split above was derived from its spelling and no phonetic transcription is printed. A guessed one that looked authoritative would be worse than none.",
    );
  }

  const average = (manifest.senses / manifest.total).toFixed(1);
  if (entry.ns === 1) {
    notes.push(
      `It carries a single recorded sense, which is the ordinary case: the corpus averages ${average} senses an entry across ${manifest.total.toLocaleString(
        "en-US",
      )} of them.`,
    );
  } else {
    const parts = [...new Set(entry.sn.map((sense) => posLabel(sense.p)))];
    notes.push(
      `It carries ${entry.ns} senses${
        parts.length > 1 ? `, spread across ${parts.length} parts of speech (${listOf(parts, 4)})` : ""
      } — against a corpus average of ${average} an entry. The meaning you already know is usually not the only one.`,
    );
  }

  if (first.d) {
    notes.push(
      `Its first sense is filed in ${domainPhrase(first.d)}, which is where the relations below come from rather than from any editorial judgement of ours.`,
    );
  }

  const relation = [];
  if (first.br?.length) relation.push(`directly under ${listOf(first.br)}`);
  if (first.nr?.length) {
    relation.push(
      `above ${first.nr.length} narrower ${first.nr.length === 1 ? "term" : "terms"} (${listOf(first.nr)}${
        first.nr.length > 3 ? " among them" : ""
      })`,
    );
  }
  if (relation.length) {
    notes.push(`In the meaning hierarchy that sense sits ${relation.join(", and ")}.`);
  }

  const band = COMMONNESS.find((candidate) => candidate.band === entry.c) ?? COMMONNESS[0];
  const shared = facets.commonness[String(entry.c)] ?? 0;
  notes.push(
    `Commonness band ${entry.c} of 5 — ${band.label}. ${band.blurb} ${shared.toLocaleString(
      "en-US",
    )} of the ${manifest.total.toLocaleString(
      "en-US",
    )} entries share that band, measured against a corpus of everyday English rather than assigned by an editor.`,
  );

  return notes;
}

/** The liftable one-paragraph answer, for the top of the page and for metadata. */
export function answerSentence(entry, key) {
  const parts = entry.p.map(posLabel);
  // The article agrees with the first part of speech, so "an adjective, noun
  // and verb" reads correctly however many there are.
  const posPhrase = `${indefiniteArticle(parts[0])} ${listOf(parts, 4)}`;

  return `The AltF Lexicon word of the day for ${formatDateKey(key)} is ${entry.w} — ${posPhrase} meaning "${
    entry.sn[0].g
  }".${
    entry.pt?.length > 1
      ? ` It is said ${entry.pt.join("-")}, stressed on "${entry.pt[entry.st]}".`
      : ""
  }`;
}

/** Questions a reader actually asks on a dated word page. */
export function wotdFaqs(entry, { key, index, length }) {
  const faqs = [
    {
      question: `What is the word of the day for ${formatDateKey(key)}?`,
      answer: `${entry.w} — "${entry.sn[0].g}".${
        entry.ns > 1 ? ` That is the first of ${entry.ns} recorded senses.` : ""
      }`,
    },
    {
      question: "How is the AltF Lexicon word of the day chosen?",
      answer: `From a fixed rotation of ${length} words, one for every day of a leap year. A date is converted to its position in the year — ${formatDateKey(
        key,
      )} is day ${index + 1} — and that position selects the word. Because the rule is arithmetic on the date and nothing else, the same day always gives the same word, and every past day still has a page.`,
    },
    {
      question: "Can I see previous words of the day?",
      answer:
        "Yes. Every day back to the start of the archive has its own dated page, listed on the word-of-the-day hub. Most dictionaries publish word of the day at one address that is overwritten every morning, so yesterday's word is gone; here it is a permanent URL.",
    },
  ];

  if (entry.pt?.length) {
    faqs.push({
      question: `How do you pronounce ${entry.w}?`,
      answer: `${entry.w} has ${entry.sy} ${entry.sy === 1 ? "syllable" : "syllables"}: ${entry.pt.join(
        "-",
      )}.${entry.pt.length > 1 ? ` The stress falls on "${entry.pt[entry.st]}".` : ""}${
        entry.rs ? ` Said plainly: ${entry.rs}.` : ""
      }${entry.ip ? ` In IPA, /${entry.ip}/.` : ""}`,
    });
  }

  const synonyms = entry.sn.flatMap((sense) => sense.sy ?? []);
  if (synonyms.length) {
    faqs.push({
      question: `What is another word for ${entry.w}?`,
      answer: `Recorded synonyms include ${listOf(synonyms, 5)}. They are listed per sense on the full entry, because a synonym that fits one meaning of a word rarely fits all of them.`,
    });
  }

  return faqs;
}
