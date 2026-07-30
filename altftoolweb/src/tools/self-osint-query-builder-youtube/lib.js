/**
 * YouTube self-exposure query builder.
 *
 * Pure string construction only: it turns identifiers you already know about
 * yourself into real search-engine queries so you can audit what a stranger
 * would find. Nothing is transmitted; every function here is deterministic.
 */

/**
 * Google stops honouring terms past roughly the first 32 words of a query and
 * silently ignores the remainder. Long-standing documented Google Search
 * behaviour, so we flag queries that cross it.
 */
export const GOOGLE_MAX_QUERY_WORDS = 32;

/**
 * YouTube handles are "@" plus 3-30 characters drawn from letters, digits,
 * period, underscore and hyphen. Source: YouTube Help, "Choose a handle".
 */
export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;
export const HANDLE_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;

/**
 * A YouTube channel ID is the literal prefix "UC" followed by 22 base64url
 * characters, 24 characters in total (e.g. UCxxxxxxxxxxxxxxxxxxxxxx).
 */
export const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/;

/**
 * Shortest dialable subscriber number in the ITU-T E.164 numbering plan is 7
 * digits, so anything shorter is treated as not a phone number at all.
 */
export const MIN_PHONE_DIGITS = 7;

/** Hosts that serve YouTube content and are indexed as separate sites. */
export const YOUTUBE_HOSTS = ["youtube.com", "m.youtube.com", "youtu.be"];

/**
 * Relative weights for the "search surface" heuristic, chosen so a complete
 * identifier set totals exactly 100. Higher weight = the identifier narrows a
 * stranger down to one real person faster. This is a comparison aid, not a
 * probability or a risk measurement.
 */
export const IDENTIFIER_WEIGHTS = {
  fullName: 10,
  handle: 18,
  channelId: 12,
  email: 20,
  phone: 20,
  city: 6,
  employer: 8,
  school: 6,
};

export const IDENTIFIER_LABELS = {
  fullName: "Real name",
  handle: "YouTube handle",
  channelId: "Channel ID",
  email: "Email address",
  phone: "Phone number",
  city: "City / area",
  employer: "Employer",
  school: "School or college",
};

export const GROUP_LABELS = {
  channel: "Channel and profile pages",
  video: "Videos that mention you",
  comment: "Comments you left",
  location: "Location leaks",
  contact: "Contact details in public text",
  crosspost: "The same handle elsewhere",
};

/** Search engines these queries are written for. */
export const ENGINES = {
  google: { id: "google", label: "Google", base: "https://www.google.com/search?q=" },
  bing: { id: "bing", label: "Bing", base: "https://www.bing.com/search?q=" },
  duckduckgo: { id: "duckduckgo", label: "DuckDuckGo", base: "https://duckduckgo.com/?q=" },
  youtube: { id: "youtube", label: "YouTube search", base: "https://www.youtube.com/results?search_query=" },
};

/**
 * Strip characters that would break operator syntax (quotes, brackets) and
 * collapse whitespace. Leaves the words themselves untouched.
 */
export function cleanTerm(value) {
  return String(value ?? "")
    .replace(/[""''"'()[\]{}<>|\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Wrap a multi-word term in double quotes so the engine matches it exactly. */
export function quoteTerm(value) {
  const cleaned = cleanTerm(value);
  if (!cleaned) return "";
  return /\s/.test(cleaned) ? `"${cleaned}"` : cleaned;
}

/** Word count as a search engine counts it, used against GOOGLE_MAX_QUERY_WORDS. */
export function countQueryWords(query) {
  return String(query ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Ready-to-open URL for a query on one of the ENGINES. */
export function searchUrl(engineId, query) {
  const engine = ENGINES[engineId] || ENGINES.google;
  return engine.base + encodeURIComponent(String(query ?? ""));
}

/** Digits only, so "+91 98765 43210" and "9876543210" produce the same variants. */
export function normalisePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/**
 * Phone numbers are written a dozen ways in public text. Search each spacing
 * variant of the last 10 digits, which is the part that stays constant.
 */
export function phoneVariants(value) {
  const digits = normalisePhone(value);
  if (digits.length < MIN_PHONE_DIGITS) return [];
  const local = digits.slice(-10);
  const variants = new Set([digits, local]);
  if (local.length === 10) {
    variants.add(`${local.slice(0, 5)} ${local.slice(5)}`);
    variants.add(`${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`);
    variants.add(`${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`);
  }
  return [...variants];
}

function siteClause(hosts) {
  return hosts.map((host) => `site:${host}`).join(" OR ");
}

function makeQuery(list, { id, group, engine, query, why }) {
  // The pieces were already sanitised by cleanTerm/quoteTerm before assembly;
  // here we only collapse whitespace so operators and quotes survive intact.
  const trimmed = String(query ?? "").replace(/\s+/g, " ").trim();
  if (!trimmed) return;
  const words = countQueryWords(trimmed);
  list.push({
    id,
    group,
    groupLabel: GROUP_LABELS[group],
    engine,
    engineLabel: ENGINES[engine].label,
    query: trimmed,
    url: searchUrl(engine, trimmed),
    words,
    tooLong: words > GOOGLE_MAX_QUERY_WORDS,
    why,
  });
}

/**
 * Build the full audit query set.
 *
 * @param {object} input
 * @returns {{error:string}|{queries:Array,groups:Array,surfaceScore:number,provided:Array,warnings:string[],handleWarning:string,channelWarning:string}}
 */
export function buildYoutubeAuditQueries(input = {}) {
  const fullName = cleanTerm(input.fullName);
  const rawHandle = cleanTerm(input.handle).replace(/^@+/, "");
  const channelId = cleanTerm(input.channelId);
  const email = cleanTerm(input.email).toLowerCase();
  // Fewer than 7 digits cannot be a dialable number, so it is treated as absent.
  const rawPhoneDigits = normalisePhone(input.phone);
  const phone = rawPhoneDigits.length >= MIN_PHONE_DIGITS ? rawPhoneDigits : "";
  const city = cleanTerm(input.city);
  const employer = cleanTerm(input.employer);
  const school = cleanTerm(input.school);

  const provided = [];
  const values = { fullName, handle: rawHandle, channelId, email, phone, city, employer, school };
  Object.keys(IDENTIFIER_WEIGHTS).forEach((key) => {
    if (values[key]) provided.push(key);
  });

  if (!fullName && !rawHandle && !channelId && !email && !phone) {
    return {
      error:
        "Enter at least one identifier that points at you — your real name, YouTube handle, channel ID, email or phone number.",
    };
  }

  const warnings = [];
  let handleWarning = "";
  let channelWarning = "";

  if (rawHandle && !HANDLE_PATTERN.test(rawHandle)) {
    handleWarning = `A YouTube handle is ${HANDLE_MIN_LENGTH}-${HANDLE_MAX_LENGTH} characters using only letters, digits, period, underscore or hyphen. Queries still built, but check the spelling.`;
  }
  if (channelId && !CHANNEL_ID_PATTERN.test(channelId)) {
    channelWarning =
      'A channel ID looks like "UC" followed by 22 characters. If you pasted a handle or a custom URL, put it in the handle field instead.';
  }
  if (email) {
    warnings.push(
      "Searching for your own email address is safe, but never paste it into a site that offers to run the search for you.",
    );
  }

  const queries = [];
  const sites = siteClause(YOUTUBE_HOSTS);
  const name = quoteTerm(fullName);
  const handle = rawHandle ? `"@${rawHandle}"` : "";

  // --- Channel and profile pages -------------------------------------------
  if (name) {
    makeQuery(queries, {
      id: "channel-name",
      group: "channel",
      engine: "google",
      query: `${sites} ${name}`,
      why: "Any YouTube page indexed under your real name: channels, about tabs, video titles and descriptions.",
    });
  }
  if (rawHandle) {
    makeQuery(queries, {
      id: "channel-handle",
      group: "channel",
      engine: "google",
      query: `site:youtube.com inurl:@${rawHandle}`,
      why: "Every indexed page under your handle URL, including tabs you may have forgotten are public (playlists, community, store).",
    });
    makeQuery(queries, {
      id: "channel-handle-about",
      group: "channel",
      engine: "google",
      query: `site:youtube.com ${handle} (about OR contact OR business)`,
      why: "The About tab is where people leave a business email or a city they meant to keep private.",
    });
  }
  if (channelId) {
    makeQuery(queries, {
      id: "channel-id",
      group: "channel",
      engine: "google",
      query: `"${channelId}"`,
      why: "Your channel ID appears in embed codes and API dumps, which links your channel to sites that embedded it.",
    });
  }

  // --- Videos that mention you ---------------------------------------------
  if (name) {
    makeQuery(queries, {
      id: "video-name",
      group: "video",
      engine: "youtube",
      query: `${name}`,
      why: "YouTube's own index reaches titles and descriptions that Google has not crawled yet.",
    });
    makeQuery(queries, {
      id: "video-name-tagged",
      group: "video",
      engine: "google",
      query: `site:youtube.com/watch ${name}`,
      why: "Restricting to /watch drops your own channel pages and leaves videos other people uploaded about you.",
    });
    if (rawHandle) {
      makeQuery(queries, {
        id: "video-name-handle",
        group: "video",
        engine: "google",
        query: `site:youtube.com ${name} ${handle}`,
        why: "Pages where your legal name and your handle appear together — the link that turns a pseudonym into an identity.",
      });
    }
  }

  // --- Comments -------------------------------------------------------------
  if (rawHandle || name) {
    makeQuery(queries, {
      id: "comment-youtube",
      group: "comment",
      engine: "youtube",
      query: rawHandle ? `@${rawHandle}` : name,
      why: "Google indexes very few YouTube comments, so use YouTube search first, then open a suspect video and use your browser's find-in-page after loading all comments.",
    });
    makeQuery(queries, {
      id: "comment-google",
      group: "comment",
      engine: "google",
      query: `${sites} ${rawHandle ? handle : name} (reply OR comment OR "commented on")`,
      why: "Catches the small share of comment threads that do get indexed, plus reposts of your comment on blogs and forums.",
    });
  }

  // --- Location leaks -------------------------------------------------------
  if (city && (name || rawHandle)) {
    makeQuery(queries, {
      id: "location-city",
      group: "location",
      engine: "google",
      query: `${sites} ${name || handle} ${quoteTerm(city)}`,
      why: "A city named in a video description or comment is usually enough to shrink a search to one neighbourhood.",
    });
  }
  if (city) {
    makeQuery(queries, {
      id: "location-landmarks",
      group: "location",
      engine: "google",
      query: `site:youtube.com ${quoteTerm(city)} (vlog OR "my street" OR "my house" OR "outside my")`,
      why: "Footage shot from a doorway or balcony geolocates a home even when no address is spoken.",
    });
  }
  if (employer) {
    makeQuery(queries, {
      id: "location-employer",
      group: "location",
      engine: "google",
      query: `${sites} ${quoteTerm(employer)} ${name || handle}`,
      why: "Ties your channel to your workplace, which is the usual first step in a targeted harassment campaign.",
    });
  }
  if (school) {
    makeQuery(queries, {
      id: "location-school",
      group: "location",
      engine: "google",
      query: `${sites} ${quoteTerm(school)} ${name || handle}`,
      why: "School names in old uploads stay indexed for years after you leave.",
    });
  }

  // --- Contact details ------------------------------------------------------
  if (email) {
    makeQuery(queries, {
      id: "contact-email-site",
      group: "contact",
      engine: "google",
      query: `${sites} "${email}"`,
      why: "Business emails left in an About tab or a pinned comment get scraped continuously.",
    });
    makeQuery(queries, {
      id: "contact-email-wide",
      group: "contact",
      engine: "google",
      query: `"${email}" -site:youtube.com`,
      why: "Where else the same address surfaces — the link that joins your YouTube identity to every other account using it.",
    });
  }
  phoneVariants(phone).forEach((variant, index) => {
    makeQuery(queries, {
      id: `contact-phone-${index}`,
      group: "contact",
      engine: "google",
      query: `"${variant}"`,
      why: "Phone numbers are written many ways; each spacing variant is indexed separately, so search them all.",
    });
  });

  // --- Same handle elsewhere ------------------------------------------------
  if (rawHandle) {
    makeQuery(queries, {
      id: "crosspost-handle",
      group: "crosspost",
      engine: "google",
      query: `"${rawHandle}" -site:youtube.com`,
      why: "Handle reuse is the single easiest way to link a YouTube account to a forum, a marketplace listing or an old blog.",
    });
    makeQuery(queries, {
      id: "crosspost-handle-ddg",
      group: "crosspost",
      engine: "duckduckgo",
      query: `"${rawHandle}"`,
      why: "A second index catches pages Google dropped; DuckDuckGo and Bing share a crawl that differs from Google's.",
    });
    makeQuery(queries, {
      id: "crosspost-handle-bing",
      group: "crosspost",
      engine: "bing",
      query: `"${rawHandle}" ${name || ""}`.trim(),
      why: "Bing keeps older cached copies of profile pages that Google has already dropped from its index.",
    });
  }

  const surfaceScore = provided.reduce((sum, key) => sum + IDENTIFIER_WEIGHTS[key], 0);

  const groups = Object.keys(GROUP_LABELS)
    .map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: queries.filter((item) => item.group === group),
    }))
    .filter((entry) => entry.items.length > 0);

  return {
    queries,
    groups,
    surfaceScore: Math.max(0, Math.min(100, surfaceScore)),
    provided,
    warnings,
    handleWarning,
    channelWarning,
  };
}

/** Plain-text export of a built query set, one query per line under its group. */
export function formatQueryPlan(result) {
  if (!result || result.error) return "";
  const lines = ["YouTube self-exposure audit — search plan", ""];
  result.groups.forEach((entry) => {
    lines.push(`## ${entry.label}`);
    entry.items.forEach((item) => {
      lines.push(`[${item.engineLabel}] ${item.query}`);
    });
    lines.push("");
  });
  lines.push(`Identifiers audited: ${result.provided.map((key) => IDENTIFIER_LABELS[key]).join(", ")}`);
  lines.push(`Search surface: ${result.surfaceScore}/100`);
  return lines.join("\n").trim();
}
