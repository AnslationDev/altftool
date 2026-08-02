export const blogCategories = [
  "Flight Deals & Offers",
  "Destination Guides",
  "Travel Guides",
  "Airline Reviews",
  "Airport Guides",
  "Visa & Immigration",
  "Flight Booking Tips",
  "Travel News & Updates",
  "Airline Baggage Rules",
  "Travel Itineraries",
  "Budget Travel",
  "Family Travel",
  "Business Travel",
  "Travel Safety",
  "Packing Guides",
  "Last-Minute Travel Deals",
];

const feedSources = [
  {
    sourceName: "Travel + Leisure",
    url: "https://www.travelandleisure.com/feed",
    defaultCategory: "Destination Guides",
    tags: ["destinations", "guides", "travel news"],
  },
  {
    sourceName: "The Points Guy",
    url: "https://thepointsguy.com/feed/",
    defaultCategory: "Flight Deals & Offers",
    tags: ["points", "airlines", "deals"],
  },
  {
    sourceName: "One Mile at a Time",
    url: "https://onemileatatime.com/feed/",
    defaultCategory: "Airline Reviews",
    tags: ["airline reviews", "cabins", "loyalty"],
  },
  {
    sourceName: "View from the Wing",
    url: "https://viewfromthewing.com/feed/",
    defaultCategory: "Travel News & Updates",
    tags: ["airlines", "airports", "news"],
  },
  {
    sourceName: "Simple Flying",
    url: "https://simpleflying.com/feed/",
    defaultCategory: "Travel News & Updates",
    tags: ["aviation", "airlines", "flight news"],
  },
  {
    sourceName: "Travel Off Path",
    url: "https://www.traveloffpath.com/feed/",
    defaultCategory: "Travel Guides",
    tags: ["travel guides", "destinations", "requirements"],
  },
];

const categoryImages = {
  "Flight Deals & Offers":
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=75",
  "Destination Guides":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=75",
  "Travel Guides":
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=75",
  "Airline Reviews":
    "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=75",
  "Airport Guides":
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=75",
  "Visa & Immigration":
    "https://images.unsplash.com/photo-1565022536102-f7645c84354a?auto=format&fit=crop&w=1200&q=75",
  "Flight Booking Tips":
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=75",
  "Travel News & Updates":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=75",
  "Airline Baggage Rules":
    "https://images.unsplash.com/photo-1553531768-a0f91bc54868?auto=format&fit=crop&w=1200&q=75",
  "Travel Itineraries":
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=75",
  "Budget Travel":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=75",
  "Family Travel":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=75",
  "Business Travel":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75",
  "Travel Safety":
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=75",
  "Packing Guides":
    "https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?auto=format&fit=crop&w=1200&q=75",
  "Last-Minute Travel Deals":
    "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=75",
};

export async function fetchBlogPosts(limit = 54) {
  const results = await Promise.allSettled(feedSources.map(fetchFeed));
  const posts = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((post) => post.title && post.sourceUrl);

  const seen = new Set();
  const uniquePosts = posts.filter((post) => {
    const key = post.sourceUrl || post.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniquePosts
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
    .slice(0, limit)
    .map((post, index) => ({
      ...post,
      featured: index < 3 || post.tags.some((tag) => tag.includes("guide")),
      popular: index % 4 === 0 || post.category.includes("Deals"),
      recent: index < 8,
    }));
}

export async function getBlogPost(slug) {
  const posts = await fetchBlogPosts(90);
  return posts.find((post) => post.slug === slug);
}

export function getRelatedBlogs(post, posts, limit = 3) {
  const related = posts.filter(
    (candidate) => candidate.slug !== post.slug && candidate.category === post.category,
  );

  return (related.length ? related : posts.filter((candidate) => candidate.slug !== post.slug)).slice(
    0,
    limit,
  );
}

export function buildBlogSections(post) {
  const subject = post.title.replace(/\s+/g, " ").trim();
  const category = post.category.toLowerCase();

  return [
    {
      id: "overview",
      heading: "Quick Overview",
      body: [
        `${subject} is part of our ${category} coverage, selected from ${post.sourceName} because it can help travelers plan with clearer context before searching flights.`,
        post.description ||
          "This story highlights a useful travel update, destination idea, or booking detail that travelers can review before choosing a route.",
      ],
    },
    {
      id: "why-it-matters",
      heading: "Why It Matters for Travelers",
      body: [
        "TripFindBox focuses on the planning decisions that happen before checkout: route timing, destination fit, airline expectations, trip flexibility, and budget awareness.",
        "Use this article as a starting point, then compare dates, airports, cabin preferences, and traveler counts in the TripFindBox search flow when you are ready to explore options.",
      ],
    },
    {
      id: "planning-notes",
      heading: "TripFindBox Planning Notes",
      body: [
        "Check nearby airports when prices feel high, keep your travel dates flexible when possible, and review baggage or change rules before committing to a fare.",
        "For destination stories, compare seasonality, local transport, and hotel location before booking. For airline stories, look for cabin, loyalty, and operational details that affect the full trip experience.",
      ],
    },
    {
      id: "source",
      heading: "Original Source",
      body: [
        `This TripFindBox page summarizes the travel topic and links to the original publisher. Read the complete article from ${post.sourceName} for the full reporting and latest updates.`,
      ],
    },
  ];
}

// Words that only make sense when something follows them. A clamp that stops on
// one of these produces exactly the mid-thought cut this codebase rejects
// ("... Battery Problem Without", "... Miles At Just"), so they are popped off
// the tail after a word-boundary cut.
const TRAILING_CONNECTORS = new Set([
  "a", "about", "after", "again", "against", "along", "also", "am", "amid",
  "among", "an", "and", "any", "are", "around", "as", "at", "be", "because",
  "been", "before", "behind", "being", "below", "beneath", "beside", "between",
  "beyond", "both", "but", "by", "can", "could", "despite", "did", "do", "does",
  "during", "each", "either", "even", "ever", "every", "except", "few", "for",
  "from", "get", "gets", "getting", "got", "had", "has", "have", "he", "her",
  "here", "his", "how", "i", "if", "in", "include", "includes", "including",
  "inside", "into", "is", "it", "its", "just", "least", "less", "like", "many",
  "may", "might", "more", "most", "much", "must", "my", "near", "never", "no",
  "nor", "not", "now", "of", "off", "on", "only", "onto", "or", "our", "out",
  "outside", "over", "past", "per", "plus", "she", "should", "since", "so",
  "some", "still", "such", "than", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "those", "through", "throughout", "to",
  "too", "toward", "towards", "under", "unless", "until", "up", "upon", "us",
  "versus", "very", "via", "vs", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whose", "why", "will", "with", "within", "without",
  "would", "yet", "you", "your",
]);

const TRAILING_PUNCTUATION = /[\s,;:|/–—-]+$/g;

// Words that end in -ly without being adverbs. Everything else ending in -ly is
// treated as one, so it has to be a noun or a verb to belong here.
const LY_NON_ADVERBS = new Set([
  "ally", "anomaly", "apply", "assembly", "belly", "bully", "comply", "family",
  "folly", "italy", "jelly", "july", "lily", "monopoly", "multiply", "panoply",
  "rally", "reply", "rely", "sicily", "supply", "tally",
]);

function isDanglingWord(word) {
  const bare = word.toLowerCase().replace(/[^a-z0-9’'.,]/g, "");
  if (!bare) return true;
  // "Boeing Fixed The 787 Dreamliner's" — a possessive modifies the noun that
  // was cut away, so it never ends a phrase.
  if (/['’]s$/.test(bare) || /s['’]$/.test(bare)) return true;
  // A bare quantity ("80,000", "2025", "16") is always attributive here.
  if (/^[\d.,]+$/.test(bare)) return true;

  const letters = bare.replace(/[^a-z]/g, "");
  // An -ly adverb modifies a verb that the clamp cut away — "... Economy Has
  // Quietly" is still waiting for "Become" — so it reads mid-thought exactly
  // like a connector. Short words ("fly", "rely", "only") are never adverbs
  // formed this way, which is what the length floor screens out.
  if (letters.length > 4 && letters.endsWith("ly") && !LY_NON_ADVERBS.has(letters)) return true;

  return TRAILING_CONNECTORS.has(letters);
}

function trimDanglingTail(value) {
  const words = value.trim().replace(TRAILING_PUNCTUATION, "").split(" ").filter(Boolean);
  while (words.length > 3 && isDanglingWord(words[words.length - 1])) words.pop();
  return words.join(" ").replace(TRAILING_PUNCTUATION, "").trim();
}

// A straight apostrophe is word-internal punctuation ("Lufthansa's", "doesn't")
// far more often than it is a quote mark, so a parity count over every
// occurrence is the wrong test: the single apostrophe in "Why Lufthansa's
// Airbus A350 Premium Economy Has Quietly Become The Sweet Spot On US Routes"
// read as an unbalanced quote and cut the headline back to "Why Lufthansa".
//
// A mark is only counted when it can actually delimit a quotation — opening
// needs a word boundary before it and a non-space after it, closing needs the
// reverse — and each opening is matched against a later closing. Marks that are
// neither (the possessive and contraction cases) are ignored entirely.
// Index of the first quotation mark still open once every opening has been
// matched against a later closing, or -1 when the text is balanced.
function unclosedQuoteIndex(value, quote) {
  const openIndexes = [];

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== quote) continue;

    const before = index > 0 ? value[index - 1] : "";
    const after = index + 1 < value.length ? value[index + 1] : "";
    const opens = (!before || /[\s([{]/.test(before)) && Boolean(after) && !/\s/.test(after);
    const closes =
      Boolean(before) && !/\s/.test(before) && (!after || /[\s)\]}.,;:!?]/.test(after));

    if (opens) openIndexes.push(index);
    else if (closes && openIndexes.length) openIndexes.pop();
  }

  return openIndexes.length ? openIndexes[0] : -1;
}

// A clamp can strand an opening bracket or quote whose partner was cut off.
function closeDanglingPairs(value) {
  let text = value;
  for (const [open, close] of [["(", ")"], ["[", "]"], ["{", "}"], ["“", "”"], ["‘", "’"]]) {
    const opened = text.lastIndexOf(open);
    if (opened !== -1 && text.indexOf(close, opened) === -1) text = text.slice(0, opened);
  }
  for (const quote of ['"', "'"]) {
    const stranded = unclosedQuoteIndex(text, quote);
    if (stranded !== -1) text = text.slice(0, stranded);
  }
  return text.trim().replace(TRAILING_PUNCTUATION, "").trim();
}

// Cutting the text back to a stranded quote can leave a stub. Deleting just the
// mark keeps the whole phrase and still leaves nothing unbalanced, which is the
// better trade when cutting would fall below the clamp's floor.
function dropUnclosedQuotes(value) {
  let text = value;

  for (const quote of ['"', "'"]) {
    for (let guard = 0; guard < 4; guard += 1) {
      const stranded = unclosedQuoteIndex(text, quote);
      if (stranded === -1) break;
      text = text.slice(0, stranded) + text.slice(stranded + 1);
    }
  }

  return text.replace(/\s{2,}/g, " ").trim();
}

/**
 * Shorten `value` to at most `maxLength` characters, preferring a punctuation
 * break that ends a whole phrase over a bare word-boundary cut, and never
 * leaving a connector, possessive or bare number as the final word.
 */
export function clampToPhrase(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

  const floor = Math.ceil(maxLength * 0.45);
  const window = text.slice(0, maxLength + 1);
  let best = "";

  for (const match of window.matchAll(/[.!?](?=\s|$)|[,;:](?=\s)|\s[–—|]\s|[\])](?=\s)/g)) {
    const keepsMark = /^[!?]/.test(match[0]);
    const end = keepsMark || /^[\])]/.test(match[0]) ? match.index + 1 : match.index;
    const candidate = closeDanglingPairs(trimDanglingTail(text.slice(0, end)));
    if (candidate.length >= floor && candidate.length <= maxLength) best = candidate;
  }

  if (best) return best;

  const clipped = text.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const base = lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, maxLength);
  const trimmed = closeDanglingPairs(trimDanglingTail(base));

  // Tidying can still eat most of the string — an unmatched bracket, or a run of
  // connectors popped off the tail. The punctuation branch above already refuses
  // any candidate under the floor; hold this branch to the same floor so a clamp
  // degrades to the plain word-boundary cut instead of shipping a stub.
  if (trimmed.length >= floor) return trimmed;

  const relaxed = trimDanglingTail(dropUnclosedQuotes(base));
  if (relaxed.length >= floor) return relaxed;

  return base.trim() || text.slice(0, maxLength).trim();
}

const BLOG_TITLE_LIMIT = 60;
const BLOG_TITLE_SUFFIX = " | TripFindBox Blog";

/**
 * Rendered <title> for a blog post, at most 60 characters.
 *
 * /bops/tripfindbox has its own layout metadata with a plain string title, which
 * consumes the root layout's "%s | AltFTool" template — nothing is appended
 * below it, so the whole 60-character budget belongs to this string (verified
 * against the served HTML: /bops/tripfindbox/faqs renders "FAQs | TripFindBox").
 *
 * Feed headlines run 55-109 characters, so the branded form almost never fits.
 * When it does not, the full budget goes to the headline rather than to a
 * 30-character stump plus branding: the page still identifies itself, and
 * og:site_name carries the brand.
 */
export function buildBlogSeoTitle(headline) {
  const clean = String(headline ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "TripFindBox Blog";

  const branded = `${clean}${BLOG_TITLE_SUFFIX}`;
  if (branded.length <= BLOG_TITLE_LIMIT) return branded;

  return clampToPhrase(clean, BLOG_TITLE_LIMIT);
}

const BLOG_DESCRIPTION_LIMIT = 158;

/**
 * Meta description for a blog post.
 *
 * Feed summaries are capped at 180 characters by `truncateText`, which leaves a
 * trailing "..." mid-sentence; trimMetaDescription in
 * src/platform/seo/generateMetadata.js then re-cuts anything at or over 160.
 * This produces a string that survives that helper byte-for-byte: at most 158
 * characters, whitespace already collapsed, ending on real punctuation.
 *
 * Short summaries are returned as they are. Some feed items genuinely have a
 * one-line summary and there is nothing factual to pad them with, so they stay
 * under the 70-character floor rather than being filled with invented copy.
 */
export function buildBlogSeoDescription(summary) {
  const clean = String(summary ?? "")
    .replace(/\s+/g, " ")
    .replace(/(?:\.\.\.|…)$/, "")
    .replace(TRAILING_PUNCTUATION, "")
    .trim();
  if (!clean) return "";

  const clamped = clampToPhrase(clean, BLOG_DESCRIPTION_LIMIT);
  return /[.!?]$/.test(clamped) ? clamped : `${clamped}.`;
}

async function fetchFeed(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "User-Agent": "TripFindBoxBlogReader/1.0",
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    return parseFeed(xml, source);
  } catch {
    return [];
  }
}

function parseFeed(xml, source) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return blocks.map((block, index) => {
    const rawTitle = readTag(block, ["title"]);
    const title = truncateText(rawTitle, 110);
    const sourceUrl = readTag(block, ["link"]) || readLinkHref(block) || source.url;
    const rawDescription =
      readTag(block, ["description", "summary", "content:encoded", "content"]) ||
      `${title} from ${source.sourceName}.`;
    const description = truncateText(stripHtml(rawDescription), 180);
    const dateISO = parseDate(readTag(block, ["pubDate", "published", "updated", "dc:date"]));
    const category = categorize(`${title} ${description}`, source.defaultCategory);
    const author = stripHtml(readTag(block, ["dc:creator", "author", "name"])) || source.sourceName;
    const tags = Array.from(new Set([...source.tags, category.toLowerCase(), ...extractCategories(block)]));
    const image = extractImage(block) || categoryImages[category];
    const slug = `${slugify(title)}-${hashString(sourceUrl || `${source.sourceName}-${index}`)}`;

    return {
      slug,
      title,
      category,
      date: formatDate(dateISO),
      dateISO,
      author,
      readingTime: estimateReadingTime(description),
      image,
      description,
      sourceName: source.sourceName,
      sourceUrl,
      tags,
    };
  });
}

function readTag(block, tags) {
  for (const tag of tags) {
    const escapedTag = tag.replace(":", "\\:");
    const match = block.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
    if (match?.[1]) return decodeXml(match[1].trim());
  }

  return "";
}

function readLinkHref(block) {
  return decodeXml(block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "");
}

function extractImage(block) {
  const candidates = [
    block.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1],
    block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1],
    block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\//i)?.[1],
    block.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1],
  ];

  return decodeXml(candidates.find(Boolean) ?? "");
}

function extractCategories(block) {
  return Array.from(block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi))
    .map((match) => stripHtml(decodeXml(match[1])).toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
}

function categorize(text, fallback) {
  const normalized = text.toLowerCase();
  const checks = [
    ["Last-Minute Travel Deals", ["last minute", "last-minute", "flash sale"]],
    ["Flight Deals & Offers", ["deal", "fare", "points", "miles", "sale", "discount", "cheap"]],
    ["Airline Baggage Rules", ["baggage", "bag fee", "carry-on", "luggage"]],
    ["Visa & Immigration", ["visa", "passport", "immigration", "entry requirement", "border"]],
    ["Airport Guides", ["airport", "terminal", "lounge", "tsa"]],
    ["Airline Reviews", ["review", "business class", "first class", "economy", "airline"]],
    ["Flight Booking Tips", ["book", "booking", "ticket", "fare rule", "cancel", "change"]],
    ["Travel Safety", ["safe", "safety", "advisory", "security", "risk"]],
    ["Packing Guides", ["pack", "packing", "carry on", "essentials"]],
    ["Family Travel", ["family", "kids", "children", "parents"]],
    ["Business Travel", ["business travel", "work trip", "corporate"]],
    ["Budget Travel", ["budget", "affordable", "save money", "low-cost"]],
    ["Travel Itineraries", ["itinerary", "weekend", "days in", "road trip"]],
    ["Destination Guides", ["destination", "city", "island", "beach", "visit", "where to go"]],
  ];

  return checks.find(([, words]) => words.some((word) => normalized.includes(word)))?.[0] ?? fallback;
}

function parseDate(rawDate) {
  const parsed = rawDate ? new Date(rawDate) : new Date("2026-06-10T00:00:00.000Z");
  return Number.isNaN(parsed.getTime()) ? "2026-06-10T00:00:00.000Z" : parsed.toISOString();
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

function estimateReadingTime(text) {
  const minutes = Math.max(3, Math.ceil(text.split(/\s+/).filter(Boolean).length / 180));
  return `${minutes} min read`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function stripHtml(value) {
  return decodeXml(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NAMED_ENTITIES = {
  amp: "&",
  apos: "'",
  bull: "•",
  copy: "©",
  deg: "°",
  euro: "€",
  gt: ">",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  middot: "·",
  nbsp: " ",
  ndash: "–",
  pound: "£",
  quot: '"',
  raquo: "»",
  rdquo: "”",
  reg: "®",
  rsquo: "’",
  sbquo: "‚",
  trade: "™",
};

// One left-to-right pass. Each entity is consumed whole, so the "&" produced by
// "&amp;" is NOT rescanned inside this pass — that is what keeps "AT&amp;T"
// from decoding past "AT&T".
function decodeEntityPass(value) {
  return value.replace(
    /&(#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/g,
    (match, body) => {
      if (body.charAt(0) === "#") {
        const hex = body.charAt(1) === "x" || body.charAt(1) === "X";
        const codePoint = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
        if (!Number.isInteger(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) return match;
        // Lone surrogates are not scalar values and String.fromCodePoint would
        // emit an unpaired half; leave the source text alone instead.
        if (codePoint >= 0xd800 && codePoint <= 0xdfff) return match;
        return String.fromCodePoint(codePoint);
      }

      const named = NAMED_ENTITIES[body.toLowerCase()];
      return named === undefined ? match : named;
    },
  );
}

// Feeds routinely arrive double-escaped: "&amp;#8217;" and "AT&amp;#038;T" are
// both real payloads from the sources above. One pass leaves "&#8217;", which
// no later step decodes, so the entity reached the rendered meta description as
// literal "&#8217;" text. Two passes resolve it; the pass count is capped at two
// on purpose, and each pass stops early once the text stops changing, so
// "AT&amp;T" settles on "AT&T" rather than unwinding further.
function decodeXml(value) {
  let text = String(value ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

  for (let pass = 0; pass < 2; pass += 1) {
    const next = decodeEntityPass(text);
    if (next === text) break;
    text = next;
  }

  return text.trim();
}

function truncateText(value, maxLength) {
  const cleanValue = stripHtml(value);
  if (cleanValue.length <= maxLength) return cleanValue;
  return `${cleanValue.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}
