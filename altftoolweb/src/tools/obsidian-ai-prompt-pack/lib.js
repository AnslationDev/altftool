/**
 * Obsidian AI Prompt Pack — vault syntax rules and prompt templates.
 *
 * The syntax rules encoded here are Obsidian's own:
 *  - note file names cannot contain * " \ / < > : | ?
 *  - link targets additionally cannot contain # ^ [ ] |
 *  - a wikilink is [[Note]], [[Note|Alias]], [[Note#Heading]] or [[Note#^blockId]]
 *  - tags allow letters, digits, underscore, hyphen and forward slash for
 *    nesting, contain no spaces, and cannot be numbers only
 *  - daily note file names use Moment.js format tokens, default YYYY-MM-DD
 */

/** Characters Obsidian refuses in a note file name. */
export const FORBIDDEN_TITLE_CHARS = ['*', '"', "\\", "/", "<", ">", ":", "|", "?"];
/** Characters that additionally break a link target inside [[ ]]. */
export const FORBIDDEN_LINK_CHARS = ["#", "^", "[", "]", "|"];
/** Obsidian's default daily note file name format. */
export const DEFAULT_DAILY_FORMAT = "YYYY-MM-DD";

const FORBIDDEN_TITLE_RE = /[*"\\/<>:|?]/g;
const FORBIDDEN_LINK_RE = /[#^[\]|]/g;
const TAG_STRIP_RE = /[^A-Za-z0-9_\-/]+/g;
const BLOCK_ID_RE = /^[A-Za-z0-9-]+$/;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TOKEN_RE = /YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D/g;

const pad2 = (value) => String(value).padStart(2, "0");

/**
 * Format a date with the Moment-style tokens Obsidian's daily note plugin uses.
 * Pure: the date is always passed in, never read from the clock.
 */
export function formatDateWithTokens(date, pattern = DEFAULT_DAILY_FORMAT) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return { error: "Pass a valid date." };
  }
  const format = String(pattern ?? "").trim();
  if (!format) return { error: "Enter a date format, for example YYYY-MM-DD." };
  if (!TOKEN_RE.test(format)) {
    TOKEN_RE.lastIndex = 0;
    return { error: "That format has no date tokens — use YYYY, MM, DD, MMMM or dddd." };
  }
  TOKEN_RE.lastIndex = 0;

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const weekday = date.getDay();

  const formatted = format.replace(TOKEN_RE, (token) => {
    switch (token) {
      case "YYYY":
        return String(year);
      case "YY":
        return pad2(year % 100);
      case "MMMM":
        return MONTHS_LONG[month];
      case "MMM":
        return MONTHS_LONG[month].slice(0, 3);
      case "MM":
        return pad2(month + 1);
      case "M":
        return String(month + 1);
      case "dddd":
        return DAYS_LONG[weekday];
      case "ddd":
        return DAYS_LONG[weekday].slice(0, 3);
      case "DD":
        return pad2(day);
      case "D":
        return String(day);
      default:
        return token;
    }
  });

  return { formatted, year, month: month + 1, day, weekday: DAYS_LONG[weekday] };
}

/**
 * Strip the characters Obsidian will not accept in a note file name.
 * Returns the cleaned title and the characters that had to go.
 */
export function sanitizeNoteTitle(raw) {
  const input = String(raw ?? "");
  const removed = [...new Set(input.match(FORBIDDEN_TITLE_RE) || [])];
  const title = input.replace(FORBIDDEN_TITLE_RE, " ").replace(/\s+/g, " ").trim();
  if (!title) return { error: "That title is empty once the forbidden characters are removed." };
  return { title, removed, changed: title !== input.trim() };
}

/**
 * Build a wikilink. Heading, block id and alias are all optional.
 * Returns { error } when the target cannot be linked.
 */
export function buildWikiLink({ note = "", heading = "", blockId = "", alias = "" } = {}) {
  const cleaned = sanitizeNoteTitle(note);
  if (cleaned.error) return { error: "Enter the note title to link to." };

  const target = cleaned.title.replace(FORBIDDEN_LINK_RE, "").trim();
  if (!target) return { error: "That note title has nothing left once link-breaking characters are removed." };

  const headingText = String(heading ?? "").replace(FORBIDDEN_LINK_RE, "").trim();
  const block = String(blockId ?? "").trim();
  if (block && !BLOCK_ID_RE.test(block)) {
    return { error: "A block id can only contain letters, digits and hyphens." };
  }
  if (headingText && block) {
    return { error: "Link to a heading or to a block, not to both." };
  }

  let link = target;
  if (headingText) link += `#${headingText}`;
  if (block) link += `#^${block}`;

  const aliasText = String(alias ?? "").replace(/[[\]|]/g, "").trim();
  if (aliasText) link += `|${aliasText}`;

  return { link: `[[${link}]]`, target, heading: headingText, blockId: block, alias: aliasText };
}

/**
 * Normalise a tag to something Obsidian accepts: no leading #, no spaces,
 * only letters, digits, underscore, hyphen and / for nesting, never numeric only.
 */
export function normalizeTag(raw) {
  const input = String(raw ?? "").trim().replace(/^#+/, "");
  if (!input) return { error: "Enter a tag." };
  const tag = input
    .replace(/\s+/g, "-")
    .replace(TAG_STRIP_RE, "")
    .replace(/-{2,}/g, "-")
    .replace(/-*\/+-*/g, "/")
    .replace(/^[-/]+|[-/]+$/g, "");
  if (!tag) return { error: "Nothing usable is left in that tag." };
  if (/^[0-9]+$/.test(tag)) {
    return { error: "Obsidian tags cannot be numbers only — add a word, for example #year-2026." };
  }
  return { tag: `#${tag}`, bare: tag, depth: tag.split("/").length - 1 };
}

/** The pack. Each entry is a real, self-contained prompt with named slots. */
export const PROMPT_PACK = [
  {
    id: "link-suggester",
    label: "Suggest links between notes",
    group: "Linking",
    template:
      "Below are notes from my Obsidian vault about {{topic}}.\n\nFind the connections I have not made yet. For each one give: the two notes, the specific idea that connects them, and the sentence I should add to the first note with the [[wikilink]] already written in.\n\nRules:\n- Only propose a link when the connection is specific. \"Both mention productivity\" is not a connection.\n- Write the link as [[Exact Note Title]] using the titles exactly as I gave them. Do not invent notes.\n- Rank the suggestions by how much the connection would change how I think, not by keyword overlap.\n- Say which notes have no good connection rather than forcing one.",
    slots: ["topic"],
  },
  {
    id: "orphan-finder",
    label: "Find orphan and dead-end notes",
    group: "Linking",
    template:
      "Here is a list of note titles from my vault, with the links each one contains.\n\nIdentify: notes nothing links to, notes that link to nothing, and notes that only link to index pages. For each, say whether it should be linked, merged into another note, or deleted, and give the reason in one line.\n\nRules:\n- Judge by whether the note carries a distinct idea, not by its length.\n- Suggest a specific destination for every merge.\n- Do not recommend deleting anything that contains a source, a quote or a date.",
    slots: [],
  },
  {
    id: "moc-builder",
    label: "Build a map of content",
    group: "Linking",
    template:
      "Build a map of content note for {{topic}} from the note titles below.\n\nGroup the notes into no more than seven themes, order the themes from foundational to advanced, and write a one-sentence description under each theme saying what a reader will learn there. List each note as a [[wikilink]].\n\nRules:\n- Every note goes in exactly one theme. If one truly belongs in two, say so and pick a primary.\n- Name the gaps: what would obviously belong in this map but does not exist yet.\n- Do not invent note titles.",
    slots: ["topic"],
  },
  {
    id: "atomic-splitter",
    label: "Split a long note into atomic notes",
    group: "Structure",
    template:
      "Here is a long note called {{noteTitle}}.\n\nSplit it into atomic notes — one idea each. For every proposed note give: a declarative title that states the claim, the paragraphs from the original that belong in it, and the [[wikilinks]] that should connect it back to the others.\n\nRules:\n- A title should be a sentence that makes a claim, not a topic label: \"Interruptions cost more than the time they take\", not \"Interruptions\".\n- Keep my original wording. Do not rewrite the prose.\n- Leave anything that is only context in a parent note rather than forcing it into an atomic note.",
    slots: ["noteTitle"],
  },
  {
    id: "zettel-title",
    label: "Rewrite titles as claims",
    group: "Structure",
    template:
      "Rewrite these note titles as declarative claims that state what the note argues.\n\nGive the original title, the rewritten title, and one line saying what the note must contain to earn that title.\n\nRules:\n- Each new title must be a complete sentence making a falsifiable claim.\n- Under 80 characters, and free of the characters Obsidian forbids in file names: * \" \\ / < > : | ?\n- If a note's content does not actually support a claim, say so instead of inventing one.",
    slots: [],
  },
  {
    id: "frontmatter",
    label: "Propose YAML frontmatter",
    group: "Structure",
    template:
      "Propose YAML frontmatter for the note below, using this property set and nothing else: {{properties}}.\n\nReturn the frontmatter block only, fenced by --- at the top and bottom, ready to paste as the very first lines of the file.\n\nRules:\n- Dates in YYYY-MM-DD format.\n- Tags as a YAML list, lowercase, hyphen-separated, no # prefix and never numbers only.\n- Leave a property out entirely rather than filling it with a guess or a placeholder.",
    slots: ["properties"],
  },
  {
    id: "tag-consolidator",
    label: "Consolidate overlapping tags",
    group: "Structure",
    template:
      "Here is the tag list from my vault with the number of notes using each.\n\nFind the tags that mean the same thing, propose one winner for each cluster, and give the find-and-replace pairs in order. Then propose a nested structure using / for the tags worth keeping.\n\nRules:\n- Keep the tag already used most often unless a different one is clearly more precise.\n- Tags must be lowercase, hyphenated, with no spaces, and never numbers only.\n- Flag any tag under three uses as a candidate for deletion rather than merging.",
    slots: [],
  },
  {
    id: "note-summariser",
    label: "Summarise a note into a callout",
    group: "Review",
    template:
      "Summarise the note below into an Obsidian callout I can paste at the top of it.\n\nUse this format exactly:\n> [!summary] {{noteTitle}}\n> - point\n> - point\n\nRules:\n- At most five bullets, each under 20 words.\n- Lead with the note's conclusion, not its topic.\n- If the note has no conclusion, write one bullet saying so instead of manufacturing one.",
    slots: ["noteTitle"],
  },
  {
    id: "daily-review",
    label: "Review a week of daily notes",
    group: "Review",
    template:
      "Below are my daily notes for {{dateRange}}, one per day, named in {{dailyFormat}} format.\n\nProduce: what I actually finished, what moved but did not finish, what I wrote down and never touched again, and the thing that keeps reappearing without progress.\n\nRules:\n- Quote the line that supports each point, with its date.\n- Do not encourage or reassure me. Report what the notes say.\n- Name the recurring item plainly, even if it is uncomfortable.",
    slots: ["dateRange", "dailyFormat"],
  },
  {
    id: "weekly-review",
    label: "Draft a weekly review note",
    group: "Review",
    template:
      "Draft a weekly review note for {{dateRange}} from the daily notes below.\n\nStructure it as: Shipped, Learned, Dropped, Next week. Each item one line, each with a [[wikilink]] to the note it came from where one exists.\n\nRules:\n- Only include something under Shipped if the notes say it was finished.\n- Under Next week, list only items that already appear in the notes as intentions — do not invent goals for me.\n- Keep the whole note under 300 words.",
    slots: ["dateRange"],
  },
  {
    id: "literature-note",
    label: "Turn a source into a literature note",
    group: "Research",
    template:
      "Turn the source below into a literature note about {{topic}}.\n\nStructure: source details, the argument in one sentence, three to six claims each with the page or timestamp, my open questions, and the notes in my vault it should link to.\n\nRules:\n- Separate what the author says from what I might conclude, and label each clearly.\n- Quote verbatim inside > blockquotes and give the location for every quote.\n- If a claim has no page or timestamp, mark it unsourced rather than guessing.",
    slots: ["topic"],
  },
  {
    id: "question-generator",
    label: "Generate spaced-repetition questions",
    group: "Research",
    template:
      "Generate spaced-repetition questions from the note below.\n\nFormat each as a single line: question :: answer\n\nRules:\n- One fact per card. Split anything that needs the word \"and\" in its answer.\n- Ask for the reason or the consequence, not the label — \"Why does X happen?\" beats \"What is X?\".\n- No more than {{cardCount}} cards. If the note does not hold that many distinct facts, produce fewer and say so.",
    slots: ["cardCount"],
  },
];

export const PACK_GROUPS = [...new Set(PROMPT_PACK.map((entry) => entry.group))];

const SLOT_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Substitute {{slots}} in a template. Reports any slot left unfilled. */
export function renderTemplate(template, values = {}) {
  const source = String(template ?? "");
  if (!source) return { error: "That prompt template is empty." };
  const missing = [];
  const text = source.replace(SLOT_RE, (match, key) => {
    const value = values[key];
    const filled = value === undefined || value === null ? "" : String(value).trim();
    if (!filled) {
      missing.push(key);
      return match;
    }
    return filled;
  });
  return { text, missing: [...new Set(missing)] };
}

/**
 * Build the selected prompts into one pack.
 * Returns { error } when nothing is selected.
 */
export function buildPromptPack({ selectedIds = [], values = {}, vaultName = "" } = {}) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const chosen = PROMPT_PACK.filter((entry) => ids.includes(entry.id));
  if (chosen.length === 0) {
    return { error: "Pick at least one prompt to include in the pack." };
  }

  const prompts = [];
  const allMissing = new Set();

  for (const entry of chosen) {
    const rendered = renderTemplate(entry.template, values);
    if (rendered.error) return { error: rendered.error };
    rendered.missing.forEach((slot) => allMissing.add(slot));
    prompts.push({ id: entry.id, label: entry.label, group: entry.group, text: rendered.text });
  }

  const vault = String(vaultName ?? "").trim();
  const header = vault
    ? `Prompts for the "${vault}" Obsidian vault. Paste one prompt, then paste the notes it refers to underneath it.`
    : "Obsidian prompts. Paste one prompt, then paste the notes it refers to underneath it.";

  const combined = [
    header,
    "",
    ...prompts.flatMap((prompt) => [`## ${prompt.label}`, "", prompt.text, ""]),
  ]
    .join("\n")
    .trimEnd();

  return {
    prompts,
    combined,
    missing: [...allMissing],
    count: prompts.length,
    characterCount: combined.length,
    wordCount: combined.split(/\s+/).filter(Boolean).length,
  };
}
