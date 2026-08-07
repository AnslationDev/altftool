/**
 * Facebook Self Exposure Query Builder — turns your own name, profile address,
 * city and employer or school into the searches that show which of your posts,
 * photos and group activity are publicly indexed.
 *
 * Pure module: no React, no DOM, no clocks, no network calls. It only builds
 * strings and URLs; nothing here fetches or scrapes anything.
 *
 * Intended for auditing your own footprint, using documented search operators
 * (site:, quoted phrases, OR, minus) against pages that are already public.
 */

export const PROFILE_HOST = "facebook.com";
export const MOBILE_HOST = "m.facebook.com";

/**
 * Facebook's documented username rule: at least 5 characters, letters, numbers
 * and full stops only. Numeric profiles use facebook.com/profile.php?id= with a
 * 15 to 17 digit account id, which this module handles as a separate kind.
 */
export const HANDLE_MIN = 5;
export const HANDLE_MAX = 50;
const HANDLE_PATTERN = /^[a-z0-9.]+$/;
const NUMERIC_ID_PATTERN = /^\d{5,20}$/;

/** Longest free-text field accepted, so a paste cannot produce a silly query. */
const MAX_FIELD_LENGTH = 100;

/** Search engines the built queries can be opened in. */
export const SEARCH_ENGINES = [
  { id: "google", label: "Google", base: "https://www.google.com/search?q=" },
  { id: "bing", label: "Bing", base: "https://www.bing.com/search?q=" },
  { id: "duckduckgo", label: "DuckDuckGo", base: "https://duckduckgo.com/?q=" },
];

const engineById = new Map(SEARCH_ENGINES.map((entry) => [entry.id, entry]));

/**
 * A runnable search URL for a query string.
 *
 * @param {string} engineId one of SEARCH_ENGINES[].id
 * @param {string} query the built query
 * @returns {string} url, or "" when either argument is unusable
 */
export function searchUrl(engineId, query) {
  const engine = engineById.get(engineId);
  if (!engine || typeof query !== "string" || query.trim() === "") return "";
  return engine.base + encodeURIComponent(query.trim());
}

/** Strips characters that would break a quoted search phrase. */
function cleanField(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/["'<>]/g, " ").replace(/\s+/g, " ").trim();
}

/** Quotes a phrase so search treats it as one term. */
export function quotePhrase(value) {
  const clean = cleanField(value);
  return clean === "" ? "" : `"${clean}"`;
}

/**
 * Accepts a username, a profile URL or a numeric profile id.
 *
 * @param {string} raw e.g. "facebook.com/jane.doe.9" or "profile.php?id=100001234567890"
 * @returns {object} { handle, kind } where kind is "username" or "id", or { error }
 */
export function normaliseHandle(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter your Facebook username or profile link." };
  }

  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/^m\./, "");

  const idMatch = value.match(/profile\.php\?id=(\d+)/);
  if (idMatch) return { handle: idMatch[1], kind: "id" };

  const hostMatch = value.match(/^facebook\.com\/([^/?#]+)/);
  if (hostMatch) value = hostMatch[1];
  value = value.replace(/^@/, "").replace(/\/+$/, "");

  if (value === "" || value === PROFILE_HOST) {
    return {
      error: "That link has no username or profile id in it. Paste the URL of your own profile page instead.",
    };
  }
  if (NUMERIC_ID_PATTERN.test(value)) return { handle: value, kind: "id" };

  if (value.length < HANDLE_MIN) {
    return { error: `Facebook usernames are at least ${HANDLE_MIN} characters long.` };
  }
  if (value.length > HANDLE_MAX) {
    return { error: `That is longer than a Facebook username (${HANDLE_MAX} characters).` };
  }
  if (!HANDLE_PATTERN.test(value)) {
    return { error: "Facebook usernames use only letters, numbers and full stops." };
  }
  if (value.startsWith(".") || value.endsWith(".")) {
    return { error: "A Facebook username cannot start or end with a full stop." };
  }

  return { handle: value, kind: "username" };
}

/** The profile path for a resolved handle, whichever form it takes. */
function profileReference(handle, kind) {
  return kind === "id" ? `${PROFILE_HOST}/profile.php?id=${handle}` : `${PROFILE_HOST}/${handle}`;
}

/** The query set. Each entry returns a query string from the cleaned context. */
export const QUERY_TEMPLATES = [
  {
    id: "profile",
    group: "Your profile as strangers see it",
    title: "Your profile page in the index",
    why: "Shows the public version of your profile, which is what appears before anyone logs in or sends a request.",
    needs: ["handle"],
    build: ({ handle, handleKind }) =>
      handleKind === "id"
        ? `"${profileReference(handle, handleKind)}"`
        : `site:${profileReference(handle, handleKind)}`,
  },
  {
    id: "name-city",
    group: "Your profile as strangers see it",
    title: "Your name plus city",
    why: "Location is what separates you from everyone else with the same name, and it is the pairing an impersonator confirms first.",
    needs: ["name", "city"],
    build: ({ name, city }) => `site:${PROFILE_HOST} ${name} ${city}`,
  },
  {
    id: "mobile-mirror",
    group: "Your profile as strangers see it",
    title: "The mobile site copy",
    why: "m.facebook.com pages are indexed separately and sometimes expose content the desktop URL does not.",
    needs: ["name"],
    build: ({ name }) => `site:${MOBILE_HOST} ${name}`,
  },
  {
    id: "public-directory",
    group: "Your profile as strangers see it",
    title: "The public people directory",
    why: "Facebook publishes a name directory that search engines crawl, independent of your own profile settings.",
    needs: ["name"],
    build: ({ name }) => `site:${PROFILE_HOST}/public ${name}`,
  },
  {
    id: "photos",
    group: "Posts, photos and groups",
    title: "Photos carrying your name",
    why: "Photo pages are indexed under their own path, including images uploaded and tagged by other people.",
    needs: ["name"],
    build: ({ name }) => `site:${PROFILE_HOST}/photo ${name}`,
  },
  {
    id: "groups",
    group: "Posts, photos and groups",
    title: "Public group posts",
    why: "Posts in public groups are visible to everyone and indexed, however private your own profile is.",
    needs: ["name"],
    build: ({ name }) => `site:${PROFILE_HOST}/groups ${name}`,
  },
  {
    id: "events",
    group: "Posts, photos and groups",
    title: "Events listing you",
    why: "Public event pages name hosts and sometimes attendees, and they usually carry a date and a location.",
    needs: ["name"],
    build: ({ name }) => `site:${PROFILE_HOST}/events ${name}`,
  },
  {
    id: "videos",
    group: "Posts, photos and groups",
    title: "Videos mentioning you",
    why: "Watch pages are indexed with their descriptions and comments, which is where names often appear.",
    needs: ["name"],
    build: ({ name }) => `site:${PROFILE_HOST}/watch ${name}`,
  },
  {
    id: "org-mentions",
    group: "Posts, photos and groups",
    title: "Your name plus employer or school",
    why: "Pages run by an employer, club or school post member names, and those posts are public by default.",
    needs: ["name", "org"],
    build: ({ name, org }) => `site:${PROFILE_HOST} ${name} ${org}`,
  },
  {
    id: "offsite-links",
    group: "Where your profile is linked",
    title: "Sites that link to your profile",
    why: "Directories, club pages and news articles embed profile links, which spreads your account to audiences you never chose.",
    needs: ["handle"],
    build: ({ handle, handleKind }) =>
      `"${profileReference(handle, handleKind)}" -site:${PROFILE_HOST}`,
  },
  {
    id: "offsite-mentions",
    group: "Where your profile is linked",
    title: "Your name next to a Facebook link elsewhere",
    why: "Catches pages that mention you and your account without linking the exact URL you searched for.",
    needs: ["name"],
    build: ({ name }) => `${name} "facebook.com" -site:${PROFILE_HOST} -site:${MOBILE_HOST}`,
  },
  {
    id: "handle-reuse",
    group: "Where your profile is linked",
    title: "The same username on other networks",
    why: "One username reused across services is the simplest way for a stranger to join your accounts together.",
    needs: ["handle"],
    build: ({ handle, handleKind }) =>
      handleKind === "id"
        ? ""
        : `"${handle}" (site:x.com OR site:instagram.com OR site:linkedin.com OR site:tiktok.com)`,
  },
  {
    id: "archives",
    group: "Old accounts and archives",
    title: "Archived copies of your pages",
    why: "The Internet Archive keeps snapshots of public profiles and posts that survive deletion on Facebook itself.",
    needs: ["name"],
    build: ({ name }) => `site:web.archive.org ${name} facebook`,
  },
];

/** Display order of the groups used by QUERY_TEMPLATES. */
export const GROUPS = [
  "Your profile as strangers see it",
  "Posts, photos and groups",
  "Where your profile is linked",
  "Old accounts and archives",
];

const FIELD_LABELS = {
  name: "full name",
  handle: "username or profile link",
  city: "city",
  org: "employer or school",
};

/**
 * Build the query set for one profile.
 *
 * @param {object} input
 * @param {string} input.name the name on your profile
 * @param {string} [input.handle] username, profile URL or numeric profile id
 * @param {string} [input.city] city or town
 * @param {string} [input.org] employer, school or club
 * @returns {object} { queries, skipped, ... } or { error }
 */
export function buildQueries({ name, handle, city, org } = {}) {
  const cleanName = cleanField(name);
  if (cleanName === "") {
    return { error: "Enter the name on your profile — most of these queries are built around it." };
  }
  if (cleanName.length > MAX_FIELD_LENGTH) {
    return { error: `Keep the name under ${MAX_FIELD_LENGTH} characters.` };
  }
  for (const [key, value] of Object.entries({ city, org })) {
    if (cleanField(value).length > MAX_FIELD_LENGTH) {
      return { error: `Keep the ${FIELD_LABELS[key]} under ${MAX_FIELD_LENGTH} characters.` };
    }
  }

  let resolvedHandle = "";
  let handleKind = "";
  let handleError = null;
  if (typeof handle === "string" && handle.trim() !== "") {
    const parsed = normaliseHandle(handle);
    if (parsed.error) {
      handleError = parsed.error;
    } else {
      resolvedHandle = parsed.handle;
      handleKind = parsed.kind;
    }
  }

  const context = {
    name: quotePhrase(cleanName),
    handle: resolvedHandle,
    handleKind,
    city: quotePhrase(city),
    org: quotePhrase(org),
  };

  const queries = [];
  const skipped = [];

  for (const template of QUERY_TEMPLATES) {
    const missing = template.needs.filter((field) => !context[field]);
    if (missing.length > 0) {
      skipped.push({
        id: template.id,
        title: template.title,
        missing: missing.map((field) => FIELD_LABELS[field] || field),
      });
      continue;
    }
    const query = template.build(context).replace(/\s+/g, " ").trim();
    if (query === "") {
      // Some templates cannot be built for a numeric profile id.
      skipped.push({
        id: template.id,
        title: template.title,
        missing: ["a username rather than a numeric profile id"],
      });
      continue;
    }
    queries.push({
      id: template.id,
      group: template.group,
      title: template.title,
      why: template.why,
      query,
    });
  }

  return {
    queries,
    skipped,
    handleError,
    resolvedHandle,
    handleKind,
    total: QUERY_TEMPLATES.length,
    built: queries.length,
  };
}

/** Plain-text export of a built query set, one query per line. */
export function toPlainText(result) {
  if (!result || result.error || !Array.isArray(result.queries)) return "";
  const lines = ["Facebook self-exposure queries", ""];
  for (const group of GROUPS) {
    const items = result.queries.filter((entry) => entry.group === group);
    if (items.length === 0) continue;
    lines.push(group);
    for (const item of items) lines.push(`  ${item.query}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
