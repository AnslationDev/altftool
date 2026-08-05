// Emoji ranges (pictographs, symbols, enclosed marks, variation selectors, ZWJ).
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{24C2}\u{2122}\u{2139}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu;

export function stripEmojis(str = "") {
  return String(str).replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}

export function metaTitle(str = "", max = 55) {
  const text = stripEmojis(str);
  if (text.length <= max) return text;

  const clipped = text.slice(0, Math.max(1, max - 1));
  const boundary = clipped.lastIndexOf(" ");
  const candidate = boundary >= Math.floor(max * 0.55)
    ? clipped.slice(0, boundary)
    : clipped;

  return `${candidate.replace(/[,:;\-\s]+$/g, "")}…`;
}

// The category and node collection pages described themselves in 84-102
// characters, which leaves most of a SERP snippet — the part mobile actually
// shows — unused. Rather than hand-write 102 strings, each page passes a head
// sentence built from its own data and these clauses are appended
// longest-first until the line clears MIN. Every generated description lands
// in 150-159, i.e. under trimMetaDescription's 160-character cap, which passes
// anything shorter that ends in a period through verbatim.
const DESCRIPTION_MIN = 150;
const DESCRIPTION_MAX = 159;
const DESCRIPTION_CLAUSES = [
  "Every one lists the nodes it uses and ships a JSON export you can import straight into your own n8n instance.",
  "Each ships a JSON export you can import into your own n8n instance.",
  "Ranked by how often each is viewed.",
  "Author credited on each.",
  "No signup required.",
  "All free.",
];

export function fitMetaDescription(head) {
  let out = String(head).trim();
  for (const clause of DESCRIPTION_CLAUSES) {
    if (out.length >= DESCRIPTION_MIN) break;
    const next = `${out} ${clause}`;
    if (next.length <= DESCRIPTION_MAX) out = next;
  }
  return out;
}

// Six imported records store their blockquote markers HTML-escaped ("&gt; "),
// so the `^>` rule below never matched them and the entity survived all the way
// into the rendered <meta name="description"> as "&amp;gt;". Decode first, then
// the Markdown rules see the real characters.
function decodeEntities(value = "") {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

// Strip Markdown syntax + emojis down to clean plain text (card blurbs, intros).
export function stripMarkdown(md = "") {
  const text = decodeEntities(md)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/^\s*>\s?/gm, ""); // blockquotes
  return stripEmojis(text);
}

// Heading that starts an author promo / contact block — everything from it to the
// end of the description is dropped.
const CONTACT_CUT =
  /\n#{1,6}\s*[^\n]*\b(who\s*am\s*i|who\s*i\s*am|about\s*(me|the\s*author|us)|contact|get\s*in\s*touch|reach\s*(out|me)|hire\s*me|work\s*with\s*me|book\s*a\s*call|let'?s\s*connect|connect\s*with\s*me|follow\s*me|find\s*me|my\s*(links|services|socials?)|social\s*links?|need\s*help|questions?|support\s*me)\b[^\n]*\n[\s\S]*$/i;

// Clean a workflow description for display: drop emojis, the author contact/promo
// block, and any stray emails or social/contact links — while keeping Markdown.
export function cleanDescription(md = "") {
  let text = String(md).replace(EMOJI_RE, "");
  text = text.replace(CONTACT_CUT, "\n");
  text = text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, ""); // emails
  text = text.replace(
    /https?:\/\/(www\.)?(linkedin\.com|twitter\.com|x\.com|calendly\.com|cal\.com|wa\.me|t\.me|telegram\.me|instagram\.com|facebook\.com|discord\.(gg|com)|threads\.net|tiktok\.com|patreon\.com|buymeacoffee\.com|ko-fi\.com|youtube\.com\/@|youtu\.be)\/\S*/gi,
    ""
  ); // social / contact links
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

export function shortIntro(md = "", max = 180) {
  const text = stripMarkdown(cleanDescription(md));
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Meta description for a single workflow.
//
// The detail pages used to pass shortIntro(description, 200) straight to
// createPageMetadata, which cut it a SECOND time at 160 and bolted a period on
// whatever word landed there. Measured over all 59 imported records that
// produced 23 descriptions ending on a dangling function word ("…automate
// ingestion of.", "…healthcare providers by.") and 13 that opened with a
// Markdown section label ("How it works This template…") because stripMarkdown
// removed the "#" but kept the heading text and then collapsed the newline into
// a space.
//
// This builds the line from WHOLE sentences instead, and only falls back to a
// cut when a single source sentence is longer than the budget.
// ---------------------------------------------------------------------------

// Lines that are labels or artefacts rather than prose: Markdown headings, a
// bare **bold label** used as a heading (18 of the 59 records do this instead
// of "##"), and stray comment markers ("//ASMR AI Workflow") left in a README.
const NON_PROSE_LINE = /^\s*(?:#{1,6}\s|\/\/|\*\*[^*\n]+\*\*\s*:?\s*$)/;

// A platform notice three records open with, verbatim and italicised. As a meta
// description it says nothing about the workflow AND is identical across all
// three, so those pages shipped near-duplicate snippets. It stays in the page
// body — only the description skips it.
const BOILERPLATE_LINE =
  /^\s*[*_]*This workflow contains community nodes that are only compatible with the self-hosted version of n8n\.?[*_]*\s*$/i;

// A bullet line, which imported READMEs almost never terminate. Without a
// terminator the whole list collapses into one unsplittable run-on sentence.
const BULLET_LINE = /^\s*(?:[-*+]|\d+[.)])\s+\S/;

// Closed-class words a sentence cannot end on. A cut that lands here is a
// fragment, so walk back past it before the terminator is added.
const DANGLING_TAIL_WORDS = new Set(
  ("a an the and or but of for to in on at by with from into onto over under as is are was were be been being " +
    "that which who whom whose when while where so if than then via per plus its their your our his her this " +
    "these those it they you we not also such about across after before between during through toward towards " +
    "up out off down upon within without because although though since until unless whether both either neither " +
    "each every any some all more most other others including like").split(" "),
);

// Appended longest-first until the line clears DESCRIPTION_MIN. Every clause is
// true of every workflow page: each renders its node list, credits the author,
// and offers the JSON export for download without an account.
const WORKFLOW_CLAUSES = [
  "Free to use, with the full node list and a JSON export you can import into your own n8n instance.",
  "Free to use, with a JSON export you can import into your own n8n instance.",
  "Free JSON export you can import into your own n8n instance.",
  "Free to import into your own n8n instance.",
  "Free to use. No signup.",
];

function trimDanglingTail(value = "") {
  let out = value.replace(/[\s,:;–—-]+$/g, "");
  for (;;) {
    const match = out.match(/\s([A-Za-z']+)$/);
    if (!match || !DANGLING_TAIL_WORDS.has(match[1].toLowerCase())) break;
    out = out.slice(0, match.index).replace(/[\s,:;–—-]+$/g, "");
  }
  return out;
}

export function workflowMetaDescription(md = "") {
  const prose = stripMarkdown(
    cleanDescription(md)
      .split("\n")
      .filter((line) => !NON_PROSE_LINE.test(line) && !BOILERPLATE_LINE.test(line))
      .map((line) =>
        BULLET_LINE.test(line) && !/[.!?:]\s*$/.test(line)
          ? `${line.trimEnd()}.`
          : line,
      )
      .join("\n"),
  );
  if (!prose) return "";

  let out = "";
  for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
    const next = out ? `${out} ${sentence.trim()}` : sentence.trim();
    if (!next) continue;
    if (next.length > DESCRIPTION_MAX) break;
    out = next;
    if (out.length >= DESCRIPTION_MIN) break;
  }

  // No whole sentence fits: cut the first one, preferring a clause boundary so
  // the line still reads as a complete thought.
  if (!out) {
    const clipped = prose.slice(0, DESCRIPTION_MAX);
    const clauseEnd = [...clipped.matchAll(/[,;:–—](?=\s)/g)]
      .map((match) => match.index)
      .filter((index) => index >= 90)
      .pop();
    const wordBoundary = clipped.lastIndexOf(" ");
    out = trimDanglingTail(
      clauseEnd !== undefined
        ? clipped.slice(0, clauseEnd)
        : wordBoundary > 100
          ? clipped.slice(0, wordBoundary)
          : clipped,
    );
  }

  if (!/[.!?]$/.test(out)) out = `${out}.`;
  if (out.length < DESCRIPTION_MIN) {
    // Exactly one clause, longest that still fits. Appending several stacked
    // "Free to use, with…" onto "Free to use. No signup." in the same line.
    for (const clause of WORKFLOW_CLAUSES) {
      const next = `${out} ${clause}`;
      if (next.length <= DESCRIPTION_MAX) {
        out = next;
        break;
      }
    }
  }
  return out;
}
