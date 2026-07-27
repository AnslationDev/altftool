/**
 * Press Release Prompt Builder.
 *
 * Two jobs:
 *   1. Build a correct dateline from a city, a state or country and a date,
 *      following the Associated Press Stylebook rules on datelines, state
 *      abbreviations and month abbreviations.
 *   2. Split a word budget across the inverted-pyramid structure a release
 *      uses (lead, body, quotes, boilerplate) and write the drafting prompt
 *      with those budgets and the AP dateline embedded.
 *
 * AP rules encoded here are the long-standing Stylebook positions. The
 * Stylebook is revised annually, so treat the lists as a strong default and
 * confirm against the current edition for publication-critical work.
 */

/* ------------------------------------------------------------------ *
 * Length rules
 * ------------------------------------------------------------------ */

/**
 * The conventional one-page release. Wire services and PR desks have long
 * advised roughly 300-500 words; beyond that a release stops being something
 * a journalist skims and starts being something they defer.
 */
export const IDEAL_MIN_WORDS = 300;
export const IDEAL_MAX_WORDS = 500;

/** Hard input bounds for the tool. */
export const LIMITS = {
  totalWords: { min: 200, max: 800 },
  quoteCount: { min: 0, max: 3 },
};

/**
 * A hard-news lead answers who, what, when, where and why in one or two
 * sentences. Journalism style guides put that at roughly 25-30 words; 40 is
 * the ceiling before it stops working as a lead.
 */
export const LEAD_SHARE = 0.1;
export const MIN_LEAD_WORDS = 25;
export const MAX_LEAD_WORDS = 40;

/** A usable pull quote is one to two sentences — about 35 words. */
export const WORDS_PER_QUOTE = 35;

/**
 * The "About [Company]" boilerplate that closes every release. Standard
 * practice is a single tight paragraph of 50-100 words.
 */
export const BOILERPLATE_SHARE = 0.15;
export const MIN_BOILERPLATE_WORDS = 50;
export const MAX_BOILERPLATE_WORDS = 100;

/** Below this the body cannot carry the supporting detail. */
export const MIN_BODY_WORDS = 60;

/**
 * Headline and subhead caps. Wire-service guidance is a headline under about
 * 100 characters so it survives search results and email subject lines; the
 * subhead (deck) carries the second most important fact.
 */
export const HEADLINE_MAX_CHARS = 100;
export const SUBHEAD_MAX_CHARS = 200;

/**
 * The traditional end mark of a press release, inherited from newsroom copy
 * marking. "###" and "-30-" are both accepted; "###" is the common modern form.
 */
export const END_MARK = "###";

/**
 * Mean silent reading rate for English non-fiction, 238 words per minute
 * (Brysbaert, 2019, meta-analysis of 190 reading-rate studies).
 */
export const READING_WORDS_PER_MINUTE = 238;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/* ------------------------------------------------------------------ *
 * AP dateline rules
 * ------------------------------------------------------------------ */

/**
 * AP month style: Jan., Feb., Aug., Sept., Oct. and Nov. and Dec. are
 * abbreviated when used with a specific date. March, April, May, June and
 * July are never abbreviated.
 */
export const AP_MONTHS = [
  "Jan.",
  "Feb.",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

/**
 * AP state abbreviations used in datelines. AP does not use two-letter postal
 * codes in body text or datelines.
 */
export const AP_STATE_ABBREVIATIONS = {
  alabama: "Ala.",
  arizona: "Ariz.",
  arkansas: "Ark.",
  california: "Calif.",
  colorado: "Colo.",
  connecticut: "Conn.",
  delaware: "Del.",
  florida: "Fla.",
  georgia: "Ga.",
  illinois: "Ill.",
  indiana: "Ind.",
  kansas: "Kan.",
  kentucky: "Ky.",
  louisiana: "La.",
  maryland: "Md.",
  massachusetts: "Mass.",
  michigan: "Mich.",
  minnesota: "Minn.",
  mississippi: "Miss.",
  missouri: "Mo.",
  montana: "Mont.",
  nebraska: "Neb.",
  nevada: "Nev.",
  "new hampshire": "N.H.",
  "new jersey": "N.J.",
  "new mexico": "N.M.",
  "new york": "N.Y.",
  "north carolina": "N.C.",
  "north dakota": "N.D.",
  oklahoma: "Okla.",
  oregon: "Ore.",
  pennsylvania: "Pa.",
  "rhode island": "R.I.",
  "south carolina": "S.C.",
  "south dakota": "S.D.",
  tennessee: "Tenn.",
  vermont: "Vt.",
  virginia: "Va.",
  washington: "Wash.",
  "west virginia": "W.Va.",
  wisconsin: "Wis.",
  wyoming: "Wyo.",
};

/**
 * The eight states AP never abbreviates, in datelines or in text.
 */
export const AP_NEVER_ABBREVIATED_STATES = [
  "alaska",
  "hawaii",
  "idaho",
  "iowa",
  "maine",
  "ohio",
  "texas",
  "utah",
];

/**
 * Cities AP considers well enough known to stand alone in a dateline with no
 * state or country following. US list first, then the international list.
 */
export const AP_STANDALONE_DATELINE_CITIES = [
  "atlanta",
  "baltimore",
  "boston",
  "chicago",
  "cincinnati",
  "cleveland",
  "dallas",
  "denver",
  "detroit",
  "honolulu",
  "houston",
  "indianapolis",
  "las vegas",
  "los angeles",
  "miami",
  "milwaukee",
  "minneapolis",
  "new orleans",
  "new york",
  "oklahoma city",
  "philadelphia",
  "phoenix",
  "pittsburgh",
  "st. louis",
  "salt lake city",
  "san antonio",
  "san diego",
  "san francisco",
  "seattle",
  "washington",
  "beijing",
  "berlin",
  "geneva",
  "gibraltar",
  "havana",
  "hong kong",
  "islamabad",
  "istanbul",
  "jerusalem",
  "johannesburg",
  "london",
  "luxembourg",
  "macau",
  "mexico city",
  "milan",
  "monaco",
  "montreal",
  "moscow",
  "munich",
  "new delhi",
  "panama city",
  "paris",
  "quebec city",
  "rio de janeiro",
  "rome",
  "san marino",
  "sao paulo",
  "shanghai",
  "singapore",
  "sydney",
  "tokyo",
  "toronto",
  "vatican city",
  "vienna",
  "zurich",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
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

/**
 * Format an ISO date the AP way — "July 27, 2026", "Sept. 3, 2026".
 * @returns {{error:string}|{text:string}}
 */
export function formatApDate(isoDate) {
  const date = parseIsoDate(isoDate);
  if (!date) return { error: "Enter a valid release date in yyyy-mm-dd form." };
  const month = AP_MONTHS[date.getUTCMonth()];
  return { text: `${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}` };
}

const normalise = (value) => String(value ?? "").trim().toLowerCase();

/**
 * Build an AP-style dateline: city in capitals, the state or country if the
 * city does not stand alone, the AP-formatted date, then an em dash.
 *
 * @param {object} input
 * @param {string} input.city     Dateline city.
 * @param {string} input.region   State (US) or country (elsewhere). May be blank.
 * @param {string} input.isoDate  Release date, yyyy-mm-dd.
 * @returns {{error:string}|object}
 */
export function formatDateline({ city, region, isoDate } = {}) {
  const cityText = String(city ?? "").trim();
  if (!cityText) return { error: "Enter the dateline city." };

  const dateResult = formatApDate(isoDate);
  if (dateResult.error) return { error: dateResult.error };

  const cityKey = normalise(cityText);
  const standsAlone = AP_STANDALONE_DATELINE_CITIES.includes(cityKey);
  const regionText = String(region ?? "").trim();
  const regionKey = normalise(regionText);

  const notes = [];
  let regionRendered = "";

  if (standsAlone) {
    notes.push(
      `AP lists ${cityText.toUpperCase()} among the cities that stand alone in a dateline, so no state or country follows it.`,
    );
  } else if (!regionText) {
    return {
      error: `${cityText} is not on AP's stand-alone dateline list, so it needs a state or country after it.`,
    };
  } else if (AP_NEVER_ABBREVIATED_STATES.includes(regionKey)) {
    regionRendered = regionText.replace(/\b\w/g, (letter) => letter.toUpperCase());
    notes.push(
      `AP never abbreviates ${regionRendered} — it is one of eight states always spelled out.`,
    );
  } else if (AP_STATE_ABBREVIATIONS[regionKey]) {
    regionRendered = AP_STATE_ABBREVIATIONS[regionKey];
    notes.push(
      `AP abbreviates ${regionText} as ${regionRendered} in a dateline — not the postal code.`,
    );
  } else {
    regionRendered = regionText;
    notes.push(
      `${regionText} is treated as a country name and printed in full; AP abbreviates US states only.`,
    );
  }

  const head = standsAlone
    ? cityText.toUpperCase()
    : `${cityText.toUpperCase()}, ${regionRendered}`;

  return {
    dateline: `${head}, ${dateResult.text} — `,
    city: cityText.toUpperCase(),
    region: regionRendered,
    date: dateResult.text,
    standsAlone,
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * Structure planning
 * ------------------------------------------------------------------ */

function toInt(value) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  if (cleaned === "") return NaN;
  const number = Number(cleaned);
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Split the word budget across lead, body, quotes and boilerplate.
 * @returns {{error:string}|object}
 */
export function planPressRelease({ totalWords, quoteCount } = {}) {
  const total = toInt(totalWords);
  if (Number.isNaN(total)) return { error: "Enter the release length in words." };
  if (total < LIMITS.totalWords.min || total > LIMITS.totalWords.max) {
    return {
      error: `Release length must be between ${LIMITS.totalWords.min} and ${LIMITS.totalWords.max} words.`,
    };
  }

  const quotes = toInt(quoteCount);
  if (Number.isNaN(quotes)) return { error: "Choose how many quotes the release carries." };
  if (quotes < LIMITS.quoteCount.min || quotes > LIMITS.quoteCount.max) {
    return {
      error: `A release carries between ${LIMITS.quoteCount.min} and ${LIMITS.quoteCount.max} quotes.`,
    };
  }

  const lead = Math.min(MAX_LEAD_WORDS, Math.max(MIN_LEAD_WORDS, Math.round(total * LEAD_SHARE)));
  const boilerplate = Math.min(
    MAX_BOILERPLATE_WORDS,
    Math.max(MIN_BOILERPLATE_WORDS, Math.round(total * BOILERPLATE_SHARE)),
  );
  const quoteWords = quotes * WORDS_PER_QUOTE;
  const body = total - lead - boilerplate - quoteWords;

  if (body < MIN_BODY_WORDS) {
    return {
      error: `Only ${Math.max(0, body)} words remain for the body after the lead, ${quotes} quote${quotes === 1 ? "" : "s"} and boilerplate. Raise the length or drop a quote.`,
    };
  }

  const warnings = [];
  if (total < IDEAL_MIN_WORDS) {
    warnings.push(
      `${total} words is under the usual ${IDEAL_MIN_WORDS}-${IDEAL_MAX_WORDS} word release — there may not be enough substance for a reporter to work from.`,
    );
  }
  if (total > IDEAL_MAX_WORDS) {
    warnings.push(
      `${total} words runs past the one-page ${IDEAL_MIN_WORDS}-${IDEAL_MAX_WORDS} word convention — move detail into a linked media kit instead.`,
    );
  }
  if (quotes === 0) {
    warnings.push(
      "With no quote there is nothing a reporter can lift verbatim, which is often the only part of a release that gets used.",
    );
  }

  return {
    total,
    lead,
    body,
    quotes,
    quoteWords,
    boilerplate,
    readingSeconds: Math.max(1, Math.round((total / READING_WORDS_PER_MINUTE) * 60)),
    inIdealRange: total >= IDEAL_MIN_WORDS && total <= IDEAL_MAX_WORDS,
    warnings,
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/* ------------------------------------------------------------------ *
 * Prompt
 * ------------------------------------------------------------------ */

/** Announcement types, each with the lead the format demands. */
export const ANNOUNCEMENT_TYPES = [
  {
    id: "product",
    label: "Product or feature launch",
    directive:
      "The lead names what shipped, who it is for and what it lets them do that they could not do before — availability and price belong in the second paragraph, not the lead.",
  },
  {
    id: "funding",
    label: "Funding round",
    directive:
      "The lead states the amount, the round letter, the lead investor and what the money is for. Never bury the amount below the fold.",
  },
  {
    id: "hire",
    label: "Executive appointment",
    directive:
      "The lead names the person, the exact title, the start date and what they will own. Their previous employer goes in the second paragraph.",
  },
  {
    id: "partnership",
    label: "Partnership or acquisition",
    directive:
      "The lead names both parties, the nature of the deal and what changes for customers. State plainly whether terms are being disclosed.",
  },
  {
    id: "award",
    label: "Award or milestone",
    directive:
      "The lead names the award or number, the body that granted it and the period it covers — otherwise the claim is unverifiable and gets cut.",
  },
  {
    id: "research",
    label: "Research or survey findings",
    directive:
      "The lead states the single most surprising finding as a number, and the methodology paragraph (sample size, fielding dates, method) is mandatory, not optional.",
  },
];

export function getAnnouncementType(typeId) {
  return ANNOUNCEMENT_TYPES.find((type) => type.id === typeId) || null;
}

/**
 * Write the press release drafting prompt.
 * @returns {{error:string}|{text:string, plan:object, dateline:object}}
 */
export function buildPressReleasePrompt({
  organisation,
  news,
  audience,
  typeId,
  spokespersonName,
  spokespersonTitle,
  mediaContact,
  notes,
  plan,
  dateline,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid word budget first." };
  if (!dateline || dateline.error) {
    return { error: dateline?.error || "Set a valid dateline first." };
  }
  const type = getAnnouncementType(typeId);
  if (!type) return { error: "Choose the kind of announcement this is." };

  const org = String(organisation ?? "").trim();
  if (!org) return { error: "Enter the organisation making the announcement." };
  const newsText = String(news ?? "").trim();
  if (!newsText) return { error: "State the news in one sentence." };

  const reader = String(audience ?? "").trim() || "trade press covering this sector";
  const speaker = String(spokespersonName ?? "").trim();
  const speakerTitle = String(spokespersonTitle ?? "").trim();
  const contact = String(mediaContact ?? "").trim();
  const extra = String(notes ?? "").trim();

  const attribution = speaker
    ? `${speaker}${speakerTitle ? `, ${speakerTitle}` : ""}`
    : "[named spokesperson and exact title needed]";

  const lines = [
    "Write one press release in Associated Press style. Follow every budget and rule below exactly.",
    "",
    `ORGANISATION: ${org}`,
    `THE NEWS: ${newsText}`,
    `ANNOUNCEMENT TYPE: ${type.label}. ${type.directive}`,
    `WHO IT IS AIMED AT: ${reader}`,
    "",
    "FIXED ELEMENTS — reproduce these exactly:",
    `- DATELINE, opening the first paragraph: ${dateline.dateline.trim()}`,
    `- END MARK on its own centred line after the boilerplate: ${END_MARK}`,
    "",
    `STRUCTURE — total about ${plan.total} words (~${plan.readingSeconds} seconds to read):`,
    `1. HEADLINE — at most ${HEADLINE_MAX_CHARS} characters. Sentence case, active verb, the news itself and not a slogan. No exclamation marks.`,
    `2. SUBHEAD — at most ${SUBHEAD_MAX_CHARS} characters, carrying the second most important fact, not restating the headline.`,
    `3. LEAD PARAGRAPH — ${plan.lead} words maximum, opening with the dateline above. Answer who, what, when, where and why in one or two sentences. Inverted pyramid: if a reader stops after this paragraph they still have the story.`,
    `4. BODY — about ${plan.body} words across two to four paragraphs, in descending order of importance: supporting detail, the number that proves the claim, availability or timing, then context.`,
    plan.quotes > 0
      ? `5. QUOTES — ${plan.quotes} quote${plan.quotes === 1 ? "" : "s"}, about ${WORDS_PER_QUOTE} words each, attributed to ${attribution}. A quote must add judgement, motive or context that the factual paragraphs cannot carry. Never use a quote to restate a fact already stated. No "we are thrilled", "excited to announce" or "game-changing".`
      : "5. QUOTES — none requested. Note in one line where a quote would go if one becomes available.",
    `6. BOILERPLATE — an "About ${org}" paragraph of about ${plan.boilerplate} words: what the organisation does, who it serves, founding year and headquarters. Present tense, third person, no adjectives that cannot be checked.`,
    contact
      ? `7. MEDIA CONTACT — a block after the boilerplate: ${contact}.`
      : "7. MEDIA CONTACT — a block after the boilerplate with name, title, email and phone; write [media contact needed] for anything not supplied.",
    "",
    "AP STYLE RULES TO FOLLOW:",
    "- Third person throughout. The organisation is 'it', never 'we'.",
    "- Numbers one through nine are spelled out; 10 and above use figures. Always use figures for money, ages, percentages and dimensions.",
    "- Use AP state abbreviations, never two-letter postal codes, and spell out Alaska, Hawaii, Idaho, Iowa, Maine, Ohio, Texas and Utah in full.",
    "- Titles are capitalised before a name and lowercase after it.",
    "- Serial comma is omitted in simple lists.",
    "- Give the full name of the organisation on first reference and the short form after.",
    "",
    "RULES:",
    "- Do not invent quotes, names, dates, customers, funding amounts or metrics. Write [detail needed] wherever a real fact must be inserted.",
    "- No superlatives that cannot be sourced ('leading', 'world-class', 'revolutionary', 'first-ever' without evidence).",
    "- No marketing calls to action. A release informs; it does not sell.",
    "- Every claim a reporter would have to verify should be traceable to a named source in the release.",
  ];
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, dateline, type, ...measureText(text) };
}
