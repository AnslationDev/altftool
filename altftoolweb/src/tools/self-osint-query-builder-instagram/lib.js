/**
 * Instagram Self Exposure Query Builder — turns your own handle, name, city and
 * a hashtag you use into the searches that reveal where your photos, reels and
 * tagged content have spread beyond the app.
 *
 * Pure module: no React, no DOM, no clocks, no network calls. It only builds
 * strings and URLs; nothing here fetches or scrapes anything.
 *
 * Intended for auditing your own footprint, using documented search operators
 * (site:, quoted phrases, OR, minus) against pages that are already indexed.
 */

/** Instagram paths used by the site: filters. */
export const PROFILE_HOST = "instagram.com";
export const POST_PATH = "instagram.com/p";
export const REEL_PATH = "instagram.com/reel";
export const TAG_PATH = "instagram.com/explore/tags";

/**
 * Instagram's documented username rule: up to 30 characters, made of letters,
 * numbers, full stops and underscores, and it may not begin or end with a full
 * stop or contain two in a row.
 */
export const HANDLE_MAX = 30;
const HANDLE_PATTERN = /^[a-z0-9._]+$/;

/** Path segments that are Instagram pages, not usernames, so a pasted link to one of these should not be treated as a handle. */
const NON_USERNAME_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "explore",
  "stories",
  "accounts",
  "direct",
  "tv",
]);

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
  return raw.replace(/["<>]/g, " ").replace(/\s+/g, " ").trim();
}

/** Quotes a phrase so search treats it as one term. */
export function quotePhrase(value) {
  const clean = cleanField(value);
  return clean === "" ? "" : `"${clean}"`;
}

/**
 * Accepts a bare username, an @handle or a profile URL and returns the username.
 *
 * @param {string} raw e.g. "https://instagram.com/jane.doe_" or "@jane.doe_"
 * @returns {object} { handle } or { error }
 */
export function normaliseHandle(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter your Instagram username, with or without the @." };
  }

  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const isBareHost = value === "instagram.com" || /^instagram\.com[/?#]/.test(value);
  const match = value.match(/^instagram\.com\/([^/?#]+)/);
  if (match) {
    value = match[1];
  } else if (isBareHost) {
    return { error: "That URL has no username in it." };
  }
  value = value.replace(/^@/, "").replace(/\/+$/, "");

  if (value === "") return { error: "That URL has no username in it." };
  if (NON_USERNAME_PATHS.has(value)) {
    return {
      error: "That looks like a post, reel or page link, not a profile — paste your profile URL or username instead.",
    };
  }
  if (value.length > HANDLE_MAX) {
    return { error: `Instagram usernames are at most ${HANDLE_MAX} characters.` };
  }
  if (!HANDLE_PATTERN.test(value)) {
    return {
      error: "Instagram usernames use only letters, numbers, full stops and underscores.",
    };
  }
  if (value.startsWith(".") || value.endsWith(".")) {
    return { error: "An Instagram username cannot start or end with a full stop." };
  }
  if (value.includes("..")) {
    return { error: "An Instagram username cannot contain two full stops in a row." };
  }

  return { handle: value };
}

/** Normalises a hashtag to the bare word Instagram uses in its tag URLs. */
export function normaliseTag(raw) {
  const clean = cleanField(raw).toLowerCase().replace(/^#/, "").replace(/\s+/g, "");
  if (clean === "") return "";
  return /^[a-z0-9_]+$/.test(clean) ? clean : "";
}

/**
 * The query set. Each entry returns a query string from the cleaned context.
 */
export const QUERY_TEMPLATES = [
  {
    id: "profile",
    group: "Your account in search results",
    title: "Your profile page as Google holds it",
    why: "Public profiles are indexed with the bio, follower count and recent thumbnails, which is what someone sees before they open the app.",
    needs: ["handle"],
    build: ({ handle }) => `site:${PROFILE_HOST}/${handle}`,
  },
  {
    id: "handle-mentions-on-ig",
    group: "Your account in search results",
    title: "Your @handle anywhere on Instagram",
    why: "Catches posts by other accounts that tag or credit you, including ones you never saw.",
    needs: ["handle"],
    build: ({ handle }) => `site:${PROFILE_HOST} "@${handle}"`,
  },
  {
    id: "indexed-posts",
    group: "Your account in search results",
    title: "Individual posts that got indexed",
    why: "Single posts are indexed under /p/ and stay findable long after they have scrolled out of your grid.",
    needs: ["handle"],
    build: ({ handle }) => `site:${POST_PATH} "${handle}"`,
  },
  {
    id: "indexed-reels",
    group: "Your account in search results",
    title: "Reels that got indexed",
    why: "Reels sit on their own path and are the format most often reposted without credit.",
    needs: ["handle"],
    build: ({ handle }) => `site:${REEL_PATH} "${handle}"`,
  },
  {
    id: "offsite-profile-links",
    group: "Reposts and mirrors",
    title: "Sites linking to your profile",
    why: "Blogs, shop pages, event listings and press articles embed your profile URL, carrying your handle to audiences you never chose.",
    needs: ["handle"],
    build: ({ handle }) => `"${PROFILE_HOST}/${handle}" -site:${PROFILE_HOST}`,
  },
  {
    id: "offsite-mentions",
    group: "Reposts and mirrors",
    title: "Your @handle mentioned off Instagram",
    why: "Forums, news sites and other networks quote handles in plain text, which is how an old post resurfaces in a new context.",
    needs: ["handle"],
    build: ({ handle }) => `"@${handle}" -site:${PROFILE_HOST}`,
  },
  {
    id: "repost-networks",
    group: "Reposts and mirrors",
    title: "Content reposted to other platforms",
    why: "Pinterest, Reddit, Tumblr and X are where reposted Instagram images live longest, usually without the original caption.",
    needs: ["handle"],
    build: ({ handle }) =>
      `"${handle}" (site:pinterest.com OR site:reddit.com OR site:tumblr.com OR site:x.com)`,
  },
  {
    id: "embedded-posts",
    group: "Reposts and mirrors",
    title: "Your posts embedded in articles",
    why: "Publishers embed posts under their own URL, so the image outlives any deletion on your side.",
    needs: ["name"],
    build: ({ name }) => `"instagram.com/p/" ${name}`,
  },
  {
    id: "handle-reuse",
    group: "Handle reuse and identity linking",
    title: "The same handle on other networks",
    why: "Reusing one username across services is what lets a stranger join your accounts into a single profile.",
    needs: ["handle"],
    build: ({ handle }) =>
      `"${handle}" (site:tiktok.com OR site:youtube.com OR site:threads.net OR site:x.com OR site:github.com)`,
  },
  {
    id: "contact-in-bio",
    group: "Handle reuse and identity linking",
    title: "Contact details published with your handle",
    why: "Business bios expose an email or phone number, which aggregator sites then copy and index.",
    needs: ["handle"],
    build: ({ handle }) => `"${handle}" ("gmail.com" OR "outlook.com" OR "contact" OR "DM for")`,
  },
  {
    id: "name-city",
    group: "Name, place and tags",
    title: "Your real name plus city",
    why: "Linking the account to a name and a place is the step that turns a handle into a person.",
    needs: ["name", "city"],
    build: ({ name, city }) => `site:${PROFILE_HOST} ${name} ${city}`,
  },
  {
    id: "hashtag",
    group: "Name, place and tags",
    title: "A hashtag you use often",
    why: "A niche personal or business hashtag gathers your posts and everyone else's use of it in one place.",
    needs: ["tag"],
    build: ({ tag }) => `site:${TAG_PATH}/${tag}`,
  },
];

/** Display order of the groups used by QUERY_TEMPLATES. */
export const GROUPS = [
  "Your account in search results",
  "Reposts and mirrors",
  "Handle reuse and identity linking",
  "Name, place and tags",
];

const FIELD_LABELS = {
  handle: "username",
  name: "real name",
  city: "city",
  tag: "hashtag",
};

/**
 * Build the query set for one account.
 *
 * @param {object} input
 * @param {string} input.handle your Instagram username or profile URL
 * @param {string} [input.name] the real name on the account
 * @param {string} [input.city] city or area you post from
 * @param {string} [input.tag] a hashtag you use
 * @returns {object} { queries, skipped, ... } or { error }
 */
export function buildQueries({ handle, name, city, tag } = {}) {
  const parsed = normaliseHandle(handle);
  if (parsed.error) return { error: parsed.error };

  for (const [key, value] of Object.entries({ name, city, tag })) {
    if (cleanField(value).length > MAX_FIELD_LENGTH) {
      return { error: `Keep the ${FIELD_LABELS[key]} under ${MAX_FIELD_LENGTH} characters.` };
    }
  }

  const cleanTag = normaliseTag(tag);
  const tagRejected = cleanField(tag) !== "" && cleanTag === "";

  const context = {
    handle: parsed.handle,
    name: quotePhrase(name),
    city: quotePhrase(city),
    tag: cleanTag,
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
    resolvedHandle: parsed.handle,
    tagWarning: tagRejected
      ? "Hashtags use only letters, numbers and underscores, so that one was left out."
      : null,
    total: QUERY_TEMPLATES.length,
    built: queries.length,
  };
}

/** Plain-text export of a built query set, one query per line. */
export function toPlainText(result) {
  if (!result || result.error || !Array.isArray(result.queries)) return "";
  const lines = ["Instagram self-exposure queries", ""];
  for (const group of GROUPS) {
    const items = result.queries.filter((entry) => entry.group === group);
    if (items.length === 0) continue;
    lines.push(group);
    for (const item of items) lines.push(`  ${item.query}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
