/**
 * Title and meta description for a meme-encyclopedia entry.
 *
 * MEASURED, not assumed: /kym/[slug] titles render with NO brand suffix. The
 * root layout carries `title.template = "%s | AltFTool"`, but ../layout.jsx
 * sets a plain-string `title` for the /kym segment, which consumes that
 * template — so nothing is appended below it. Confirmed against production:
 * https://www.altftool.com/kym/troll-face served
 * `<title>Troll Face — Meaning, Origin and Examples</title>` (41 chars, no
 * suffix) while https://www.altftool.com/kym — the same segment as the layout,
 * so still templated by the root — served "… | AltFTool". The title budget
 * here is therefore the full 60 characters, not 49. If ../layout.jsx ever
 * drops its `title`, every title below gains 11 characters and this constant
 * has to come down with it.
 *
 * The previous description template was `What ${title} means, where it came
 * from and how it spread — a ${category} entry …`, which broke three ways on
 * the real catalog:
 *
 *  - "a episode entry", "a explainer entry", "a event entry", "a editorial
 *    entry" — no article agreement before a vowel-initial category;
 *  - "What What Does 'Tweaking' Mean? … means" on the eleven question-form
 *    titles, and "a entry entry" on every card from the Top Entries rail;
 *  - the longest titles (up to 129 characters) pushed the string past the
 *    160-character cap, so the snippet was cut mid-clause.
 *
 * The builders below lead with the entry's own question when the title asks
 * one — which both removes the duplication and keeps the long explainer titles
 * inside the cap — and otherwise lead with the title. Every clause describes a
 * section the page actually renders (Origin, Spread, Common Examples, Entry
 * Notes and the Related Entries rail); none of them claims anything about the
 * meme itself, which is all the record can honestly support.
 */

// The card labels are display strings, not grammar. "Collections" is the only
// plural one, and "a collections entry" is not English.
const CATEGORY_LABELS = {
  collections: "collection",
};

// trimMetaDescription() hard-caps at 160 and re-cuts anything at or above it,
// so compose below that and keep the authored sentence intact. 150 is the
// floor: anything shorter leaves SERP width on the table.
const MAX_DESCRIPTION_LENGTH = 158;
const MIN_DESCRIPTION_LENGTH = 150;

// Mobile is 84% of this section's search clicks and truncates hardest, so the
// rendered title has to survive at 60 characters.
const MAX_TITLE_LENGTH = 60;

// Appended to a bare entry name, longest first. The first one that still fits
// inside MAX_TITLE_LENGTH wins; "" means the name carries the title alone.
const TITLE_SUFFIXES = [
  " — Meaning, Origin and Examples",
  " — Meaning and Origin",
  "",
];

// Cross-multiplied into the description tail bank below. Both halves are true
// of every entry page: it renders Origin, Spread, Common Examples and Entry
// Notes sections plus a Related Entries rail.
const DESCRIPTION_MIDDLES = [
  " covering where the format came from, how it spread across feeds and the examples people repost",
  " covering where the format came from, how it spread and the examples people repost",
  " covering where it came from, how it spread and the examples people repost",
  " covering where it came from, how it spread and the common examples",
  " covering the origin, the spread and the common examples",
  " covering the origin, the spread and the examples",
  " covering the origin, spread and examples",
  " covering the origin and the spread",
];

const DESCRIPTION_ENDINGS = [
  ", with entry notes and links to the related entries in the AltFTool meme encyclopedia.",
  ", with entry notes and the related entries filed beside it in the encyclopedia.",
  ", with entry notes and related entries from the AltFTool meme encyclopedia.",
  ", with entry notes and the related entries filed beside it.",
  ", with entry notes and the related entries alongside it.",
  ", with entry notes and related entries.",
  ", plus the entry notes beside it.",
  ", with related entries.",
  ", plus entry notes.",
  ".",
];

// Every tail the builder may pick, longest first. Cross-multiplying two banks
// keeps the steps between candidate lengths small enough that a lead of any
// length still finds a tail landing inside the 150-158 window; the assertion
// that it always does is entryMeta.test.mjs.
const DESCRIPTION_TAILS = DESCRIPTION_MIDDLES.flatMap((middle) =>
  DESCRIPTION_ENDINGS.map((ending) => `${middle}${ending}`),
).sort((a, b) => b.length - a.length);

function normalizeTitle(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function categoryLabel(category) {
  const raw = String(category || "").trim().toLowerCase();
  if (!raw) return "internet culture";
  return CATEGORY_LABELS[raw] || raw;
}

/** "an explainer entry", "a meme entry" — and never "a entry entry". */
export function entryPhrase(category) {
  const label = categoryLabel(category);
  if (label === "entry") return "an encyclopedia entry";
  return `${/^[aeiou]/i.test(label) ? "an" : "a"} ${label} entry`;
}

function capitalize(value = "") {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

/** The leading question of a question-form title ("What Does 'X' Mean?"). */
function leadingQuestion(title) {
  return title.match(/^[^?]{3,}\?/)?.[0] || "";
}

/**
 * Cut to `budget` on a phrase boundary — a colon, comma or dash when one sits
 * in the back half of the budget, a word boundary otherwise — so a clamped
 * title never ends mid-word or mid-phrase.
 */
function clampToPhrase(value, budget) {
  if (value.length <= budget) return value;
  const clipped = value.slice(0, budget + 1);
  const phraseEnd = Math.max(
    clipped.lastIndexOf(": "),
    clipped.lastIndexOf(", "),
    clipped.lastIndexOf(" — "),
    clipped.lastIndexOf(" - "),
  );
  const cut = phraseEnd > budget * 0.5 ? phraseEnd : clipped.lastIndexOf(" ");
  return (cut > 0 ? clipped.slice(0, cut) : clipped.slice(0, budget))
    .replace(/[\s,;:—–-]+$/g, "")
    .trim();
}

/**
 * The <title> for an entry, capped at MAX_TITLE_LENGTH rendered characters.
 *
 * A question-form title is already a headline, so it keeps its own wording:
 * the whole thing when it fits, the question alone when the trailing marketing
 * clause pushes it over. Everything else takes the longest descriptive suffix
 * that still fits, and no suffix at all when the name needs the full width.
 */
export function buildKymEntryTitle(item = {}) {
  const title = normalizeTitle(item.title);
  if (!title) return "Meme Encyclopedia Entry";

  const question = leadingQuestion(title);
  if (question) {
    if (title.length <= MAX_TITLE_LENGTH) return title;
    if (question.length <= MAX_TITLE_LENGTH) return question;
    return clampToPhrase(question, MAX_TITLE_LENGTH);
  }

  for (const suffix of TITLE_SUFFIXES) {
    if (title.length + suffix.length <= MAX_TITLE_LENGTH) {
      return `${title}${suffix}`;
    }
  }

  return clampToPhrase(title, MAX_TITLE_LENGTH);
}

/**
 * Join an opening phrase to the category phrase. A title that already ends in
 * terminal punctuation ("What Is The 'Realistic Troll Face' Meme?") is a
 * finished sentence, so the next clause starts a new one; anything else takes
 * the dash. Without this, snippets read "… Troll Face' Meme? — an episode".
 */
function joinLead(text, phrase) {
  return /[.!?]$/.test(text)
    ? `${text} ${capitalize(phrase)}`
    : `${text} — ${phrase}`;
}

/** The longest tail that still fits after `lead`, or "" when none does. */
function fitTail(lead) {
  const budget = MAX_DESCRIPTION_LENGTH - lead.length;
  return DESCRIPTION_TAILS.find((candidate) => candidate.length <= budget) || "";
}

export function buildKymEntryDescription(item = {}) {
  const title = normalizeTitle(item.title);
  const phrase = entryPhrase(item.category);

  if (!title) return `${capitalize(phrase)}${fitTail(capitalize(phrase))}`;

  // Leads, most specific first. The full title is preferred because two
  // entries can share a question ("What Does 'Tweaking' Mean? The Slang Term
  // Explained" and "… The Slang About Excited Behavior Explained") and leading
  // with the question alone gives both the same snippet. Question-form titles
  // fall back to the question, which reads as its own opening line and avoids
  // "What What Does 'Tweaking' Mean? … means" as well as the 160-char cut.
  const question = leadingQuestion(title);
  const leads = [joinLead(title, phrase)];
  if (question && question !== title) {
    leads.push(joinLead(question, phrase));
  }

  for (const lead of leads) {
    const tail = fitTail(lead);
    if (tail && lead.length + tail.length >= MIN_DESCRIPTION_LENGTH) {
      return `${lead}${tail}`;
    }
  }

  // No lead reached the floor with a whole tail: clamp the shortest lead and
  // let the longest tail follow it. Unreached by the current catalog, but a
  // future 200-character card title must not ship a mid-word snippet.
  const lead = clampToPhrase(
    leads[leads.length - 1],
    MAX_DESCRIPTION_LENGTH - DESCRIPTION_TAILS[DESCRIPTION_TAILS.length - 1].length,
  );
  return `${lead}${fitTail(lead)}`;
}

export const KYM_META_LIMITS = {
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
};
