/**
 * Brand voice guideline generator.
 *
 * Tone is modelled on the four-dimension tone-of-voice framework published by
 * the Nielsen Norman Group ("The Four Dimensions of Tone of Voice", 2016):
 * Formal vs Casual, Serious vs Funny, Respectful vs Irreverent, and
 * Matter-of-fact vs Enthusiastic. Each dimension is a 0-100 dial where 0 is
 * the first pole and 100 is the second.
 *
 * Readability targets come from plain-language guidance: the US Federal Plain
 * Language Guidelines and the Plain English Campaign both recommend an average
 * sentence length in the region of 15-20 words, and consumer style guides
 * commonly target a US grade 7-9 reading level. We interpolate inside those
 * bounds as the voice moves from formal to casual.
 */

/** Dial minimum. */
export const DIAL_MIN = 0;
/** Dial maximum. */
export const DIAL_MAX = 100;

/** Average sentence length (words) targeted at the fully formal end of the dial. */
export const SENTENCE_WORDS_FORMAL = 24;
/** Average sentence length (words) targeted at the fully casual end of the dial. */
export const SENTENCE_WORDS_CASUAL = 12;
/** Flesch-Kincaid grade level targeted at the fully formal end (college entry). */
export const GRADE_FORMAL = 13;
/** Flesch-Kincaid grade level targeted at the fully casual end (US grade 7). */
export const GRADE_CASUAL = 7;
/**
 * Upper bound on exclamation marks per 100 words at maximum enthusiasm.
 * Most newsroom style guides (AP, Guardian) treat the exclamation mark as a
 * rationed device, so even the most enthusiastic voice is capped low.
 */
export const MAX_EXCLAMATIONS_PER_100_WORDS = 4;
/** Casualness at or above which contractions become the default. */
export const CONTRACTION_THRESHOLD = 50;
/** Casualness and enthusiasm both needed before emoji are sanctioned. */
export const EMOJI_CASUAL_THRESHOLD = 60;
export const EMOJI_ENTHUSIASM_THRESHOLD = 50;

/**
 * Band edges for a 0-100 dial. Below 20 and above 80 read as a strong
 * commitment to a pole; 40-60 reads as deliberately balanced.
 */
export const BAND_EDGES = { strongLow: 19, low: 39, balanced: 60, high: 80 };

export const VOICE_DIMENSIONS = [
  {
    key: "formality",
    label: "Formality",
    lowPole: "Formal",
    highPole: "Casual",
    content: {
      low: {
        summary: "polished and precise",
        dos: [
          "Write complete sentences and spell every term out in full on first use.",
          "Address the reader as \"you\", but keep the register professional throughout.",
          "Lead with the substance of the message before any supporting detail.",
        ],
        donts: [
          "Don't use slang, memes or regional idioms.",
          "Don't use contractions in legal, billing or security copy.",
          "Don't open a sentence with \"So\", \"Basically\" or \"Honestly\".",
        ],
        prefer: ["purchase", "request", "assist", "however", "because"],
        avoid: ["grab", "ping", "stuff", "loads of", "super"],
      },
      balanced: {
        summary: "professional but relaxed",
        dos: [
          "Use contractions in marketing and product copy, full forms in legal and error text.",
          "Keep sentences short but let the vocabulary stay precise.",
          "Match the reader's register: more formal in onboarding, looser in nudges.",
        ],
        donts: [
          "Don't swing between registers inside a single screen or email.",
          "Don't reach for jargon when a plain word does the same work.",
          "Don't strip out politeness markers like \"please\" to save characters.",
        ],
        prefer: ["buy", "ask", "help", "but", "so"],
        avoid: ["leverage", "utilise", "synergy", "kindly do the needful"],
      },
      high: {
        summary: "relaxed and conversational",
        dos: [
          "Use contractions everywhere — you're, we'll, it's.",
          "Write it the way you would explain it to a colleague at the next desk.",
          "Prefer short everyday words over Latinate ones.",
        ],
        donts: [
          "Don't fall back on corporate abstractions like \"leverage\" or \"utilise\".",
          "Don't pad with \"in order to\" or \"at this point in time\".",
          "Don't use slang your international readers won't share.",
        ],
        prefer: ["get", "start", "fix", "so", "here's"],
        avoid: ["commence", "endeavour", "aforementioned", "pursuant to"],
      },
    },
  },
  {
    key: "humour",
    label: "Humour",
    lowPole: "Serious",
    highPole: "Funny",
    content: {
      low: {
        summary: "clear and no-nonsense",
        dos: [
          "Let clarity carry the copy; the reward for the reader is understanding, not a joke.",
          "Keep error, payment and security messages entirely straight.",
          "Use concrete examples instead of witty asides to hold attention.",
        ],
        donts: [
          "Don't use puns in headlines or button labels.",
          "Don't add a joke to soften bad news — say what happened and what to do next.",
          "Don't use exclamation marks as a substitute for warmth.",
        ],
        prefer: ["clear", "direct", "specific"],
        avoid: ["oops", "whoops", "uh-oh", "cheeky"],
      },
      balanced: {
        summary: "light but never flippant",
        dos: [
          "Save humour for low-stakes moments: empty states, confirmations, onboarding.",
          "Keep the joke in the supporting line, never in the instruction itself.",
          "Test every joke against the worst day a reader could be having.",
        ],
        donts: [
          "Don't joke in failure, billing, privacy or account-recovery copy.",
          "Don't make the reader the butt of the joke.",
          "Don't repeat a running gag until it becomes filler.",
        ],
        prefer: ["playful", "warm", "human"],
        avoid: ["hilarious", "epic", "legendary"],
      },
      high: {
        summary: "playful and witty",
        dos: [
          "Let personality show in microcopy, empty states and 404 pages.",
          "Use specific, observational humour rooted in what the reader is actually doing.",
          "Keep the functional instruction readable even if the joke is stripped out.",
        ],
        donts: [
          "Don't joke about money, data loss, health or identity.",
          "Don't rely on humour that depends on one culture's references.",
          "Don't let a gag push the call to action below the fold.",
        ],
        prefer: ["witty", "wry", "specific"],
        avoid: ["lol", "yeet", "cringe", "sus"],
      },
    },
  },
  {
    key: "respect",
    label: "Deference",
    lowPole: "Respectful",
    highPole: "Irreverent",
    content: {
      low: {
        summary: "courteous and humble",
        dos: [
          "Thank people for actions that cost them time or money.",
          "Apologise plainly and once when something goes wrong on your side.",
          "Use the reader's own words for their job, their goal and their problem.",
        ],
        donts: [
          "Don't mock competitors, industries or previous tools by name.",
          "Don't imply the reader made a mistake when the system was ambiguous.",
          "Don't use sarcasm anywhere in the product.",
        ],
        prefer: ["thank you", "sorry", "we'll fix"],
        avoid: ["obviously", "simply", "just", "as you should know"],
      },
      balanced: {
        summary: "respectful with edge",
        dos: [
          "Be candid about limitations before a competitor is.",
          "Challenge industry habits, not individual people.",
          "Keep the confident line in marketing and the humble line in support.",
        ],
        donts: [
          "Don't punch down at beginners or at smaller competitors.",
          "Don't confuse bluntness with rudeness in error messages.",
          "Don't use \"just\" or \"simply\" to describe a step the reader is stuck on.",
        ],
        prefer: ["honest", "straight", "no fluff"],
        avoid: ["obviously", "everyone knows", "duh"],
      },
      high: {
        summary: "blunt and unapologetic",
        dos: [
          "Take a clear position and say what the category gets wrong.",
          "Use blunt, unhedged sentences in campaign copy.",
          "Reserve the irreverence for your own category, never for the reader.",
        ],
        donts: [
          "Don't name and mock a specific competitor — it dates badly and invites legal risk.",
          "Don't carry the irreverent register into support, billing or accessibility copy.",
          "Don't use profanity in any surface a customer cannot opt out of.",
        ],
        prefer: ["bold", "blunt", "unapologetic"],
        avoid: ["disruptive", "game-changing", "revolutionary"],
      },
    },
  },
  {
    key: "enthusiasm",
    label: "Energy",
    lowPole: "Matter-of-fact",
    highPole: "Enthusiastic",
    content: {
      low: {
        summary: "calm and fact-led",
        dos: [
          "State the benefit as a fact with a number attached wherever one exists.",
          "End sentences with a full stop, not an exclamation mark.",
          "Let the product demo carry the excitement instead of the adjectives.",
        ],
        donts: [
          "Don't stack intensifiers — \"incredibly powerful\", \"truly seamless\".",
          "Don't celebrate routine actions with confetti copy.",
          "Don't promise outcomes you cannot measure.",
        ],
        prefer: ["works", "saves", "takes 2 minutes"],
        avoid: ["amazing", "incredible", "unbelievable", "!!!"],
      },
      balanced: {
        summary: "warm but measured",
        dos: [
          "Celebrate genuine milestones — first import, first invoice paid, 100th customer.",
          "Use one exclamation mark at most per screen, and only in a success state.",
          "Pair every enthusiastic claim with the evidence underneath it.",
        ],
        donts: [
          "Don't open every paragraph with an adjective.",
          "Don't use enthusiasm to cover a missing feature.",
          "Don't repeat the same celebratory word twice on one page.",
        ],
        prefer: ["nice", "done", "you're set"],
        avoid: ["insanely", "mind-blowing", "next-level"],
      },
      high: {
        summary: "upbeat and celebratory",
        dos: [
          "Open with the win the reader gets, not the mechanism behind it.",
          "Use active verbs and second person throughout.",
          "Keep the energy in headlines and success states where it is earned.",
        ],
        donts: [
          "Don't carry the high-energy register into errors, outages or refunds.",
          "Don't chain more than one exclamation mark.",
          "Don't inflate small features into launches.",
        ],
        prefer: ["build", "launch", "ship", "let's go"],
        avoid: ["revolutionary", "world-class", "best-in-class"],
      },
    },
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (raw) => {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  const value = Number(String(raw ?? "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Map a 0-100 dial value to a band id, intensity and human label. */
export function bandFor(value) {
  const v = clamp(value, DIAL_MIN, DIAL_MAX);
  if (v <= BAND_EDGES.strongLow) return { id: "low", intensity: "strong", qualifier: "Strongly" };
  if (v <= BAND_EDGES.low) return { id: "low", intensity: "lean", qualifier: "Mostly" };
  if (v <= BAND_EDGES.balanced) return { id: "balanced", intensity: "even", qualifier: "Balanced" };
  if (v <= BAND_EDGES.high) return { id: "high", intensity: "lean", qualifier: "Mostly" };
  return { id: "high", intensity: "strong", qualifier: "Strongly" };
}

/** Highest number of unique banned words the guide will actually enforce. */
export const MAX_BANNED_WORDS = 40;

/**
 * Parse a free-text banned-word list (commas and newlines) into unique
 * entries. Returns every unique word found — callers that need to cap the
 * list (see MAX_BANNED_WORDS) are responsible for slicing it themselves so
 * they can still see, and surface, how many were dropped.
 */
export function parseBannedWords(raw) {
  return Array.from(
    new Set(
      String(raw ?? "")
        .split(/[,\n;]/)
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function poleLabel(dimension, band) {
  if (band.id === "balanced") return `${dimension.lowPole}/${dimension.highPole} balance`;
  return band.id === "low" ? dimension.lowPole : dimension.highPole;
}

/**
 * Build a full voice guide.
 *
 * @param {object} input
 * @param {string} input.brandName
 * @param {string} [input.audience]
 * @param {object} input.dials - { formality, humour, respect, enthusiasm } 0-100
 * @param {string} [input.bannedWords]
 * @returns {object} guide or { error }
 */
export function buildVoiceGuide({ brandName, audience = "", dials = {}, bannedWords = "" } = {}) {
  const name = String(brandName ?? "").trim();
  if (!name) return { error: "Enter a brand or product name to title the guide." };
  if (name.length > 60) return { error: "Brand name is too long — keep it under 60 characters." };

  const values = {};
  for (const dimension of VOICE_DIMENSIONS) {
    const value = toNumber(dials[dimension.key]);
    if (Number.isNaN(value)) {
      return { error: `${dimension.label} must be a number between 0 and 100.` };
    }
    if (value < DIAL_MIN || value > DIAL_MAX) {
      return { error: `${dimension.label} must be between 0 and 100.` };
    }
    values[dimension.key] = value;
  }

  const casualness = values.formality;
  const enthusiasm = values.enthusiasm;

  const dos = [];
  const donts = [];
  const prefer = [];
  const avoid = [];
  const axes = [];

  for (const dimension of VOICE_DIMENSIONS) {
    const value = values[dimension.key];
    const band = bandFor(value);
    const content = dimension.content[band.id];
    axes.push({
      key: dimension.key,
      label: dimension.label,
      value,
      lowPole: dimension.lowPole,
      highPole: dimension.highPole,
      pole: poleLabel(dimension, band),
      qualifier: band.qualifier,
      summary: content.summary,
      statement:
        band.id === "balanced"
          ? `Balanced — ${content.summary}`
          : `${band.qualifier} ${poleLabel(dimension, band).toLowerCase()} — ${content.summary}`,
    });
    dos.push(...content.dos.map((text) => ({ axis: dimension.label, text })));
    donts.push(...content.donts.map((text) => ({ axis: dimension.label, text })));
    prefer.push(...content.prefer);
    avoid.push(...content.avoid);
  }

  const bannedAll = parseBannedWords(bannedWords);
  const bannedList = bannedAll.slice(0, MAX_BANNED_WORDS);
  const bannedWordsTruncated = bannedAll.length > MAX_BANNED_WORDS;
  const bannedSet = new Set(bannedList);
  // A user's explicit ban always wins: strip banned words out of the
  // built-in "prefer" list first, then union the built-in "avoid" list
  // (itself resolved against that already-banned-free prefer list) with the
  // full banned list. Doing it in this order means a banned word can never
  // simultaneously surface as "recommended" while being dropped from the
  // avoid list, which happened when the banned list was merged into avoid
  // and then filtered against the still-unfiltered prefer list.
  const preferList = Array.from(new Set(prefer.map((w) => w.toLowerCase()))).filter(
    (word) => !bannedSet.has(word),
  );
  const avoidList = Array.from(
    new Set([
      ...avoid.map((w) => w.toLowerCase()).filter((word) => !preferList.includes(word)),
      ...bannedList,
    ]),
  );

  const sentenceWords = Math.round(
    SENTENCE_WORDS_FORMAL + (casualness / DIAL_MAX) * (SENTENCE_WORDS_CASUAL - SENTENCE_WORDS_FORMAL),
  );
  const readingGrade = Math.round(
    GRADE_FORMAL + (casualness / DIAL_MAX) * (GRADE_CASUAL - GRADE_FORMAL),
  );
  const exclamationBudget = Math.round((enthusiasm / DIAL_MAX) * MAX_EXCLAMATIONS_PER_100_WORDS);

  const mechanics = {
    sentenceWords,
    readingGrade,
    exclamationBudget,
    contractions: casualness >= CONTRACTION_THRESHOLD,
    emoji: casualness >= EMOJI_CASUAL_THRESHOLD && enthusiasm >= EMOJI_ENTHUSIASM_THRESHOLD,
    person: casualness >= CONTRACTION_THRESHOLD ? "Second person (\"you\", \"we\")" : "Second person, no first-person plural in policy copy",
  };

  const audienceText = audience.trim();
  const statement =
    `${name} sounds ${axes[0].summary}, ${axes[1].summary}, ${axes[2].summary} and ${axes[3].summary}` +
    (audienceText ? ` when writing for ${audienceText}.` : ".");

  const markdown = [
    `# ${name} voice guide`,
    "",
    `**Voice in one sentence:** ${statement}`,
    "",
    "## Tone dials",
    "",
    "| Dimension | Setting | Reads as |",
    "| --- | --- | --- |",
    ...axes.map((axis) => `| ${axis.label} (${axis.lowPole} ↔ ${axis.highPole}) | ${axis.value}/100 | ${axis.statement} |`),
    "",
    "## Mechanics",
    "",
    `- Target average sentence length: ${sentenceWords} words`,
    `- Target reading level: US grade ${readingGrade} (Flesch-Kincaid)`,
    `- Contractions: ${mechanics.contractions ? "use by default" : "avoid in policy, legal and error copy"}`,
    `- Exclamation marks: ${exclamationBudget === 0 ? "none" : `no more than ${exclamationBudget} per 100 words`}`,
    `- Emoji: ${mechanics.emoji ? "allowed in social and in-app celebration copy" : "not used"}`,
    `- Point of view: ${mechanics.person}`,
    "",
    "## Do",
    "",
    ...dos.map((item) => `- ${item.text}`),
    "",
    "## Don't",
    "",
    ...donts.map((item) => `- ${item.text}`),
    "",
    "## Word choices",
    "",
    `**Prefer:** ${preferList.join(", ")}`,
    "",
    `**Avoid:** ${avoidList.join(", ")}`,
    "",
    ...(bannedWordsTruncated
      ? [
          `_${bannedAll.length} banned words were entered; only the first ${MAX_BANNED_WORDS} unique ones are enforced above._`,
          "",
        ]
      : []),
  ].join("\n");

  return {
    brandName: name,
    audience: audienceText,
    statement,
    axes,
    dos,
    donts,
    prefer: preferList,
    avoid: avoidList,
    bannedWords: bannedList,
    bannedWordsEnteredCount: bannedAll.length,
    bannedWordsTruncated,
    mechanics,
    markdown,
  };
}
