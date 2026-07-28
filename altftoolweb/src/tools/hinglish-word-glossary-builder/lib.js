/**
 * Hinglish / Indian English glossary builder.
 *
 * Pure data helpers: validation, de-duplication, search, sorting, statistics
 * and export formatting (Markdown table, RFC 4180 CSV, JSON, plain text).
 * No storage, no DOM, no React.
 */

/** Where the borrowed word comes from. */
export const ORIGINS = [
  "Hindi",
  "Urdu",
  "Punjabi",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Gujarati",
  "Sanskrit",
  "Persian",
  "Arabic",
  "Portuguese",
  "Indian English",
  "Other",
];

/** How safe the term is in professional writing. */
export const REGISTERS = ["Casual", "Neutral", "Workplace", "Avoid in formal writing"];

/** Export formats supported by formatGlossary(). */
export const EXPORT_FORMATS = ["markdown", "csv", "json", "text"];

/** Field limits, chosen so a glossary row still fits a printed A4 table. */
export const TERM_MAX = 60;
export const MEANING_MIN = 3;
export const MEANING_MAX = 300;
export const EXAMPLE_MAX = 300;
export const MAX_ENTRIES = 500;

/**
 * Starter glossary. Each entry is a term genuinely used in Hinglish or Indian
 * English, with the sense it carries in Indian usage rather than a dictionary
 * gloss of the source language.
 */
export const SEED_GLOSSARY = [
  {
    term: "jugaad",
    meaning: "A frugal workaround that solves a problem with whatever is available.",
    example: "We had no projector, so we did a jugaad with a laptop and a bedsheet.",
    origin: "Hindi",
    register: "Neutral",
  },
  {
    term: "timepass",
    meaning: "An activity done only to fill time; also used as an adjective for something mediocre.",
    example: "The second half was pure timepass, but the songs were good.",
    origin: "Indian English",
    register: "Casual",
  },
  {
    term: "prepone",
    meaning: "To move an event to an earlier time; the opposite of postpone.",
    example: "Can we prepone the review to Tuesday morning?",
    origin: "Indian English",
    register: "Workplace",
  },
  {
    term: "do the needful",
    meaning: "Please take the action that the situation obviously requires.",
    example: "Kindly do the needful and share the signed copy.",
    origin: "Indian English",
    register: "Avoid in formal writing",
  },
  {
    term: "out of station",
    meaning: "Away from the city where you live or work; out of town.",
    example: "I am out of station until Friday, so let us meet next week.",
    origin: "Indian English",
    register: "Workplace",
  },
  {
    term: "passing out",
    meaning: "Graduating from a school, college or training academy.",
    example: "She is passing out from the academy this December.",
    origin: "Indian English",
    register: "Avoid in formal writing",
  },
  {
    term: "batchmate",
    meaning: "Someone in the same graduating year or training cohort as you.",
    example: "He was my batchmate in the 2019 engineering batch.",
    origin: "Indian English",
    register: "Workplace",
  },
  {
    term: "cousin brother",
    meaning: "A male cousin; specifies gender because Indian kinship terms usually do.",
    example: "My cousin brother is coming from Pune for the wedding.",
    origin: "Indian English",
    register: "Casual",
  },
  {
    term: "godown",
    meaning: "A warehouse or storage shed.",
    example: "The stock is lying in the godown near the highway.",
    origin: "Indian English",
    register: "Workplace",
  },
  {
    term: "bindaas",
    meaning: "Carefree, unbothered, relaxed about consequences.",
    example: "She quit and went travelling, totally bindaas.",
    origin: "Marathi",
    register: "Casual",
  },
  {
    term: "funda",
    meaning: "The underlying concept or principle of something; short for fundamental.",
    example: "Explain the funda once and the rest of the chapter is easy.",
    origin: "Indian English",
    register: "Casual",
  },
  {
    term: "gyaan",
    meaning: "Unasked-for advice or lecturing, usually said with mild irritation.",
    example: "Stop giving gyaan and help me finish the deck.",
    origin: "Sanskrit",
    register: "Casual",
  },
  {
    term: "bakwas",
    meaning: "Nonsense or rubbish; also used for something of poor quality.",
    example: "That review is complete bakwas, the food was fine.",
    origin: "Hindi",
    register: "Avoid in formal writing",
  },
  {
    term: "faltu",
    meaning: "Useless, pointless or unnecessary.",
    example: "Do not add faltu slides, keep it to five.",
    origin: "Hindi",
    register: "Casual",
  },
  {
    term: "chalta hai",
    meaning: "An attitude of accepting things that are good enough rather than correct.",
    example: "The chalta hai approach is why the report has three broken links.",
    origin: "Hindi",
    register: "Neutral",
  },
  {
    term: "paisa vasool",
    meaning: "Worth every rupee; full value for the money spent.",
    example: "Two hundred rupees for that thali is paisa vasool.",
    origin: "Hindi",
    register: "Casual",
  },
  {
    term: "lafda",
    meaning: "A mess, dispute or complication.",
    example: "There is some lafda with the vendor invoice.",
    origin: "Marathi",
    register: "Casual",
  },
  {
    term: "jhamela",
    meaning: "An avoidable hassle or bureaucratic tangle.",
    example: "Changing the address turned into a two-week jhamela.",
    origin: "Hindi",
    register: "Casual",
  },
  {
    term: "adda",
    meaning: "A regular hangout, or the long unhurried conversation that happens there.",
    example: "Sunday adda at the coffee house has been running for years.",
    origin: "Bengali",
    register: "Neutral",
  },
  {
    term: "dhaba",
    meaning: "A roadside eatery, traditionally on a highway, serving simple hot food.",
    example: "We stopped at a dhaba past Karnal for parathas.",
    origin: "Punjabi",
    register: "Neutral",
  },
  {
    term: "tiffin",
    meaning: "A packed meal, or the stacked container it is carried in.",
    example: "Her tiffin service delivers to the office by one o'clock.",
    origin: "Indian English",
    register: "Neutral",
  },
  {
    term: "lakh",
    meaning: "One hundred thousand, written 1,00,000 in the Indian digit grouping.",
    example: "The car costs eight lakh on road.",
    origin: "Hindi",
    register: "Neutral",
  },
  {
    term: "crore",
    meaning: "Ten million, that is one hundred lakh, written 1,00,00,000.",
    example: "The round was two crore rupees.",
    origin: "Hindi",
    register: "Neutral",
  },
  {
    term: "kanjoos",
    meaning: "Stingy; unwilling to spend.",
    example: "Do not be kanjoos, order the second plate.",
    origin: "Hindi",
    register: "Casual",
  },
  {
    term: "nautanki",
    meaning: "Melodrama, or a person who performs emotions for effect.",
    example: "Enough nautanki, just tell me what broke.",
    origin: "Hindi",
    register: "Casual",
  },
  {
    term: "mast",
    meaning: "Excellent, enjoyable, great.",
    example: "The weather in Coorg was mast.",
    origin: "Persian",
    register: "Casual",
  },
  {
    term: "vella",
    meaning: "Idle or with nothing to do.",
    example: "I am vella today, send me the draft and I will read it.",
    origin: "Punjabi",
    register: "Casual",
  },
  {
    term: "chakkar",
    meaning: "A round trip or errand; also a confusing situation.",
    example: "I made three chakkars to the bank for one signature.",
    origin: "Hindi",
    register: "Casual",
  },
];

/* ------------------------------------------------------------------ */
/* Normalisation and validation                                        */
/* ------------------------------------------------------------------ */

/** Collapse whitespace, trim, and lowercase for duplicate comparison. */
export function normaliseTerm(value) {
  return String(value == null ? "" : value)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Stable anchor id for a term, safe for URLs and Markdown headings. */
export function termSlug(value) {
  const base = normaliseTerm(value)
    .replace(/[^a-z0-9ऀ-ॿ ]+/g, "")
    .replace(/ +/g, "-");
  return base || "term";
}

const clean = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();

/**
 * Check a single glossary entry.
 * @returns {{entry: object}|{error: string}}
 */
export function validateEntry(raw) {
  if (!raw || typeof raw !== "object") return { error: "Entry is missing." };

  const term = clean(raw.term);
  if (!term) return { error: "Enter the Hinglish word or phrase." };
  if (term.length > TERM_MAX) return { error: `Keep the term under ${TERM_MAX} characters.` };

  const meaning = clean(raw.meaning);
  if (meaning.length < MEANING_MIN) return { error: "Write a meaning of at least three characters." };
  if (meaning.length > MEANING_MAX) {
    return { error: `Meaning is ${meaning.length} characters. Keep it under ${MEANING_MAX}.` };
  }

  const example = clean(raw.example);
  if (example.length > EXAMPLE_MAX) {
    return { error: `Example is ${example.length} characters. Keep it under ${EXAMPLE_MAX}.` };
  }

  const origin = ORIGINS.includes(raw.origin) ? raw.origin : "Other";
  const register = REGISTERS.includes(raw.register) ? raw.register : "Neutral";

  return { entry: { term, meaning, example, origin, register, slug: termSlug(term) } };
}

/**
 * Append an entry, rejecting duplicates by normalised term.
 * @returns {{entries: object[]}|{error: string}}
 */
export function addEntry(entries, raw) {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length >= MAX_ENTRIES) {
    return { error: `A glossary holds up to ${MAX_ENTRIES} entries. Export and start a new one.` };
  }

  const checked = validateEntry(raw);
  if (checked.error) return checked;

  const key = normaliseTerm(checked.entry.term);
  if (list.some((item) => normaliseTerm(item.term) === key)) {
    return { error: `"${checked.entry.term}" is already in the glossary.` };
  }

  return { entries: [...list, checked.entry] };
}

/** Remove by normalised term. Returns a new array. */
export function removeEntry(entries, term) {
  const key = normaliseTerm(term);
  return (Array.isArray(entries) ? entries : []).filter((item) => normaliseTerm(item.term) !== key);
}

/* ------------------------------------------------------------------ */
/* Search, sort, stats                                                 */
/* ------------------------------------------------------------------ */

/** Case-insensitive substring match over term, meaning and example. */
export function searchGlossary(entries, query = "", filters = {}) {
  const list = Array.isArray(entries) ? entries : [];
  const q = normaliseTerm(query);
  const { origin, register } = filters;

  return list.filter((item) => {
    if (origin && origin !== "All" && item.origin !== origin) return false;
    if (register && register !== "All" && item.register !== register) return false;
    if (!q) return true;
    const haystack = `${item.term} ${item.meaning} ${item.example || ""}`.toLowerCase();
    return haystack.includes(q);
  });
}

export const SORT_MODES = ["alphabetical", "origin", "added"];

/** Non-mutating sort. "added" preserves insertion order. */
export function sortGlossary(entries, mode = "alphabetical") {
  const list = [...(Array.isArray(entries) ? entries : [])];
  if (mode === "origin") {
    return list.sort(
      (a, b) => a.origin.localeCompare(b.origin) || normaliseTerm(a.term).localeCompare(normaliseTerm(b.term)),
    );
  }
  if (mode === "added") return list;
  return list.sort((a, b) => normaliseTerm(a.term).localeCompare(normaliseTerm(b.term)));
}

/**
 * Coverage summary for the current glossary.
 * @returns {{total:number,withExample:number,examplePercent:number,byOrigin:Array,byRegister:Array,averageMeaningLength:number}}
 */
export function glossaryStats(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const total = list.length;
  if (total === 0) {
    return {
      total: 0,
      withExample: 0,
      examplePercent: 0,
      byOrigin: [],
      byRegister: [],
      averageMeaningLength: 0,
    };
  }

  const withExample = list.filter((item) => clean(item.example).length > 0).length;
  const count = (key) => {
    const map = new Map();
    for (const item of list) map.set(item[key], (map.get(item[key]) || 0) + 1);
    return [...map.entries()].map(([label, n]) => ({ label, count: n })).sort((a, b) => b.count - a.count);
  };
  const meaningChars = list.reduce((sum, item) => sum + clean(item.meaning).length, 0);

  return {
    total,
    withExample,
    examplePercent: Math.round((withExample / total) * 100),
    byOrigin: count("origin"),
    byRegister: count("register"),
    averageMeaningLength: Math.round(meaningChars / total),
  };
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

/** RFC 4180 field: quote when the value holds a comma, quote or newline. */
export function csvField(value) {
  const text = String(value == null ? "" : value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** Markdown table cells cannot contain a bare pipe or a newline. */
function markdownCell(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

/**
 * Render the glossary in one of EXPORT_FORMATS.
 * @returns {{output:string,format:string,lines:number}|{error:string}}
 */
export function formatGlossary(entries, format = "markdown", title = "Hinglish Glossary") {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) return { error: "Add at least one term before exporting." };
  if (!EXPORT_FORMATS.includes(format)) return { error: "Choose Markdown, CSV, JSON or plain text." };

  const heading = clean(title) || "Hinglish Glossary";
  let output = "";

  if (format === "markdown") {
    const rows = list.map(
      (item) =>
        `| ${markdownCell(item.term)} | ${markdownCell(item.meaning)} | ${markdownCell(item.example)} | ${markdownCell(item.origin)} | ${markdownCell(item.register)} |`,
    );
    output = [
      `# ${heading}`,
      "",
      "| Term | Meaning | Example | Origin | Register |",
      "| --- | --- | --- | --- | --- |",
      ...rows,
    ].join("\n");
  } else if (format === "csv") {
    const rows = list.map((item) =>
      [item.term, item.meaning, item.example, item.origin, item.register].map(csvField).join(","),
    );
    output = ["Term,Meaning,Example,Origin,Register", ...rows].join("\r\n");
  } else if (format === "json") {
    output = JSON.stringify(
      { title: heading, count: list.length, entries: list.map(({ slug, ...rest }) => rest) },
      null,
      2,
    );
  } else {
    output = [
      heading,
      "".padEnd(heading.length, "="),
      "",
      ...list.map((item) => {
        const lines = [`${item.term} (${item.origin}, ${item.register})`, `  ${item.meaning}`];
        if (clean(item.example)) lines.push(`  e.g. ${item.example}`);
        return lines.join("\n");
      }),
    ].join("\n\n");
  }

  return { output, format, lines: output.split(/\r?\n/).length };
}
