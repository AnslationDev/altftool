/**
 * LinkedIn Self Exposure Query Builder — turns your own name, vanity URL,
 * employer and city into the search-engine queries that reveal how discoverable
 * your professional profile is.
 *
 * Pure module: no React, no DOM, no clocks, no network calls. It only builds
 * strings and URLs; nothing here fetches or scrapes anything.
 *
 * Intended for auditing your own footprint. Every query below uses documented
 * search-engine operators (site:, filetype:, quoted phrases, OR, minus) that
 * work on public, already-indexed pages.
 */

/** LinkedIn public profile paths, used to build the site: filters. */
export const PROFILE_PATH = "linkedin.com/in";

/**
 * LinkedIn's documented rule for a public profile URL (the part after /in/):
 * 3 to 100 characters, letters, numbers and hyphens only, no spaces or symbols.
 */
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 100;
const HANDLE_PATTERN = /^[a-z0-9-]+$/;

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

/** Quotes a phrase when it contains a space, so search treats it as one term. */
export function quotePhrase(value) {
  const clean = cleanField(value);
  if (clean === "") return "";
  return clean.includes(" ") ? `"${clean}"` : `"${clean}"`;
}

/**
 * Accepts a bare vanity name or a full profile URL and returns the vanity part.
 *
 * @param {string} raw e.g. "https://www.linkedin.com/in/jane-doe-123/" or "jane-doe-123"
 * @returns {object} { handle } or { error }
 */
export function normaliseHandle(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter your LinkedIn public profile name, the part after /in/." };
  }

  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "");
  // Country subdomains such as uk.linkedin.com and in.linkedin.com are valid.
  const match = value.match(/(?:^|\.)linkedin\.com\/in\/([^/?#]+)/);
  if (match) value = match[1];
  value = value.replace(/^@/, "").replace(/\/+$/, "");

  if (value === "") {
    return { error: "That URL has no profile name in it — check the part after /in/." };
  }
  if (value.length < HANDLE_MIN || value.length > HANDLE_MAX) {
    return {
      error: `A LinkedIn public profile name is ${HANDLE_MIN}-${HANDLE_MAX} characters long.`,
    };
  }
  if (!HANDLE_PATTERN.test(value)) {
    return { error: "LinkedIn public profile names use only letters, numbers and hyphens." };
  }

  return { handle: value };
}

/**
 * The query set. Each entry receives the cleaned context and returns a query
 * string, or "" when it needs a field the user has not filled in.
 */
export const QUERY_TEMPLATES = [
  {
    id: "profile-name",
    group: "Your profile as strangers see it",
    title: "Your indexed public profile",
    why: "Shows the version of your profile Google holds, which is what someone sees before they ever log in to LinkedIn.",
    needs: ["name"],
    build: ({ name }) => `site:${PROFILE_PATH} ${name}`,
  },
  {
    id: "profile-handle",
    group: "Your profile as strangers see it",
    title: "Your vanity URL, exactly",
    why: "Confirms which profile URL is indexed — useful if you changed your public URL and the old one is still being served.",
    needs: ["handle"],
    build: ({ handle }) => `site:${PROFILE_PATH}/${handle}`,
  },
  {
    id: "country-subdomains",
    group: "Your profile as strangers see it",
    title: "Country subdomain copies",
    why: "LinkedIn serves profiles from country subdomains such as uk.linkedin.com and in.linkedin.com, which are indexed separately.",
    needs: ["name"],
    build: ({ name }) => `site:*.linkedin.com/in ${name}`,
  },
  {
    id: "name-employer",
    group: "Your profile as strangers see it",
    title: "Name plus current employer",
    why: "The pairing a recruiter, a journalist or a social engineer would use first to confirm they have the right person.",
    needs: ["name", "employer"],
    build: ({ name, employer }) => `site:linkedin.com ${name} ${employer}`,
  },
  {
    id: "public-posts",
    group: "Activity and content",
    title: "Your public posts and articles",
    why: "Posts marked public are indexed separately from your profile and often outlive the job they were written in.",
    needs: ["name"],
    build: ({ name }) => `site:linkedin.com/posts ${name}`,
  },
  {
    id: "pulse-articles",
    group: "Activity and content",
    title: "Long-form articles you published",
    why: "Articles sit under a different path and are frequently forgotten years after publication.",
    needs: ["name"],
    build: ({ name }) => `site:linkedin.com/pulse ${name}`,
  },
  {
    id: "company-mentions",
    group: "Activity and content",
    title: "Mentions on your employer's pages",
    why: "Company pages, team lists and press releases quote employees by name and role, adding detail your own profile may omit.",
    needs: ["name", "employer"],
    build: ({ name, employer }) => `site:linkedin.com/company ${name} ${employer}`,
  },
  {
    id: "offsite-links",
    group: "Where your profile is republished",
    title: "Sites that link to your profile",
    why: "Conference bios, company team pages and directories embed your profile URL, which spreads your job history beyond LinkedIn.",
    needs: ["handle"],
    build: ({ handle }) => `"${PROFILE_PATH}/${handle}" -site:linkedin.com`,
  },
  {
    id: "scrapers",
    group: "Where your profile is republished",
    title: "Aggregators holding a copy",
    why: "Business-data sites republish scraped profile fields. Finding your entry is the first step to using their opt-out.",
    needs: ["name", "employer"],
    build: ({ name, employer }) =>
      `${name} ${employer} (site:rocketreach.co OR site:zoominfo.com OR site:signalhire.com)`,
  },
  {
    id: "cv-documents",
    group: "Documents and contact details",
    title: "CVs and slide decks with your name on them",
    why: "PDFs and presentations uploaded by employers, universities or event organisers routinely carry a phone number or a personal email.",
    needs: ["name"],
    build: ({ name }) => `${name} (filetype:pdf OR filetype:doc OR filetype:docx) (cv OR resume)`,
  },
  {
    id: "email-exposure",
    group: "Documents and contact details",
    title: "Pages carrying your work email domain",
    why: "An indexed page pairing your name with a work address is what makes a targeted phishing email convincing.",
    needs: ["name", "domain"],
    build: ({ name, domain }) => `${name} "@${domain}"`,
  },
  {
    id: "location",
    group: "Documents and contact details",
    title: "Name plus city",
    why: "Location narrows a common name to one person, which is exactly how an impersonator confirms a target.",
    needs: ["name", "city"],
    build: ({ name, city }) => `${name} ${city} (site:linkedin.com OR site:*.linkedin.com)`,
  },
];

/** Display order of the groups used by QUERY_TEMPLATES. */
export const GROUPS = [
  "Your profile as strangers see it",
  "Activity and content",
  "Where your profile is republished",
  "Documents and contact details",
];

const FIELD_LABELS = {
  name: "full name",
  handle: "profile URL name",
  employer: "employer",
  city: "city",
  domain: "work email domain",
};

/**
 * Build the query set for one person.
 *
 * @param {object} input
 * @param {string} input.name your full name as it appears on the profile
 * @param {string} [input.handle] the part of your profile URL after /in/
 * @param {string} [input.employer] current or recent employer
 * @param {string} [input.city] city or region
 * @param {string} [input.domain] work email domain, e.g. example.com
 * @returns {object} { queries, skipped, ... } or { error }
 */
export function buildQueries({ name, handle, employer, city, domain } = {}) {
  const cleanName = cleanField(name);
  if (cleanName === "") {
    return { error: "Enter the name on your profile — every query is built around it." };
  }
  if (cleanName.length > MAX_FIELD_LENGTH) {
    return { error: `Keep the name under ${MAX_FIELD_LENGTH} characters.` };
  }

  const optional = { employer, city, domain };
  for (const [key, value] of Object.entries(optional)) {
    if (cleanField(value).length > MAX_FIELD_LENGTH) {
      return { error: `Keep the ${FIELD_LABELS[key]} under ${MAX_FIELD_LENGTH} characters.` };
    }
  }

  let resolvedHandle = "";
  let handleError = null;
  if (typeof handle === "string" && handle.trim() !== "") {
    const parsed = normaliseHandle(handle);
    if (parsed.error) handleError = parsed.error;
    else resolvedHandle = parsed.handle;
  }

  const cleanDomain = cleanField(domain)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");

  const context = {
    name: quotePhrase(cleanName),
    handle: resolvedHandle,
    employer: quotePhrase(employer),
    city: quotePhrase(city),
    domain: cleanDomain,
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
    handleError,
    resolvedHandle,
    total: QUERY_TEMPLATES.length,
    built: queries.length,
  };
}

/** Plain-text export of a built query set, one query per line. */
export function toPlainText(result) {
  if (!result || result.error || !Array.isArray(result.queries)) return "";
  const lines = ["LinkedIn self-exposure queries", ""];
  for (const group of GROUPS) {
    const items = result.queries.filter((entry) => entry.group === group);
    if (items.length === 0) continue;
    lines.push(group);
    for (const item of items) lines.push(`  ${item.query}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
