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
    // 155 rather than 180: trimMetaDescription() hard-caps meta descriptions at
    // 160 and re-cuts anything longer at a sentence boundary, so a 180-char
    // summary reached the SERP clipped mid-phrase. truncateText appends "...",
    // so this lands at <=158 and round-trips through the SEO helper unchanged.
    const description = truncateText(stripHtml(rawDescription), 155);
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

// Feeds routinely double-escape their entities, so an item arrives carrying
// "&amp;#8217;". The &amp; pass below turns that into "&#8217;", and with no
// numeric rule the entity survived as literal text all the way into the meta
// description — production served
//   content="Hello from Spain, as I just flew Riyadh Air&amp;#8217;s Boeing 787-9"
// which renders as a visible "&#8217;" in the SERP snippet. Decode the numeric
// and remaining named forms after the &amp; pass so the text is real characters.
const NAMED_ENTITIES = {
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function fromCodePoint(code, original) {
  if (!Number.isFinite(code) || code < 0x20 || code > 0x10ffff) return original;
  try {
    return String.fromCodePoint(code);
  } catch {
    return original;
  }
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (match, code) => fromCodePoint(Number(code), match))
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => fromCodePoint(parseInt(code, 16), match))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .trim();
}

function truncateText(value, maxLength) {
  const cleanValue = stripHtml(value);
  if (cleanValue.length <= maxLength) return cleanValue;
  return `${cleanValue.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}
