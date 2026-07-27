/**
 * XML-safety layer for Next.js `sitemap.js` routes.
 *
 * WHY THIS EXISTS
 * Next builds sitemap XML by raw string interpolation — see
 * `next/dist/build/webpack/loaders/metadata/resolve-route-data.js`, function
 * `resolveSitemap`. It writes `<loc>${item.url}</loc>`, `<image:loc>${image}</image:loc>`,
 * `<xhtml:link href="${...}" />` and every `<video:*>` field without escaping a
 * single character.
 *
 * That is fine for plain slug URLs and silently fatal for anything carrying a
 * query string. Firebase Storage download URLs look like
 * `https://firebasestorage.googleapis.com/v0/b/…/o/blogs%2FID?alt=media&token=UUID`;
 * the bare `&` makes the document invalid XML. Google's parser aborts at the
 * FIRST offender and discards the whole sitemap — which is why Search Console
 * reported `EntityRef: expecting ';'` and 0 discovered pages.
 *
 * The sitemaps.org protocol already requires entity-escaped values, so escaping
 * here emits exactly the bytes the spec asks for rather than working around Next.
 *
 * WHERE TO USE IT
 * Only at the XML boundary — the `export default` of a sitemap route. The cached
 * entry builders (`getSitemapEntries`) must keep returning raw, unescaped URLs
 * because `/site-map` and the search index render them as real links.
 *
 * Escaping is idempotent: an already-escaped `&amp;` is left alone, so running
 * this twice (or if Next ever adds its own escaping) cannot double-encode.
 */

// Characters XML 1.0 forbids outright. They cannot be escaped, only removed.
// Built via RegExp() so the ranges stay readable as escapes in source.
const INVALID_XML_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\uFFFE\\uFFFF]",
  "g",
);

// Any control character at all makes a URL unusable in a <loc>.
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]");

// An `&` that does not already open a *predefined* XML entity or a numeric
// reference. Deliberately narrower than /&[a-z]+;/: XML predefines only these
// five, so a URL containing e.g. "&session;" is an undefined-entity error and
// must still be escaped. Matching only these keeps escaping both correct and
// idempotent — `&amp;` is left alone, `&session;` becomes `&amp;session;`.
const BARE_AMPERSAND =
  /&(?!(?:amp|lt|gt|quot|apos|#\d+|#[xX][0-9a-fA-F]+);)/g;

/**
 * Entity-escape a value for use as XML text or an attribute value.
 * Escapes the five characters listed by the sitemaps.org protocol.
 */
export function escapeXmlValue(value) {
  if (value === null || value === undefined) return value;
  return String(value)
    .replace(INVALID_XML_CHARS, "")
    .replace(BARE_AMPERSAND, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * A sitemap `<loc>` must be an absolute http(s) URL. Anything else (a relative
 * path, an empty string, a template that stringified `undefined`) is a URL
 * Google will reject or crawl into a 404, so it is dropped rather than emitted.
 */
export function isValidSitemapUrl(value) {
  if (typeof value !== "string" || !value) return false;
  if (/\s/.test(value) || CONTROL_CHARS.test(value)) return false;
  if (value.includes("undefined") || value.includes("null/")) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function escapeUrlList(values) {
  if (!Array.isArray(values)) return undefined;
  const safe = values.filter(isValidSitemapUrl).map(escapeXmlValue);
  return safe.length ? safe : undefined;
}

function escapeAlternates(alternates) {
  const languages = alternates?.languages;
  if (!languages || typeof languages !== "object") return undefined;

  const safe = {};
  for (const [language, href] of Object.entries(languages)) {
    if (!isValidSitemapUrl(href)) continue;
    safe[escapeXmlValue(language)] = escapeXmlValue(href);
  }
  return Object.keys(safe).length ? { languages: safe } : undefined;
}

// Video fields Next interpolates that hold free text or URLs. Numeric and
// boolean fields (duration, view_count, live, …) cannot carry XML specials.
const VIDEO_TEXT_FIELDS = [
  "title",
  "description",
  "thumbnail_loc",
  "content_loc",
  "player_loc",
  "tag",
];

function escapeVideos(videos) {
  if (!Array.isArray(videos) || !videos.length) return undefined;

  return videos.map((video) => {
    const safe = { ...video };
    for (const field of VIDEO_TEXT_FIELDS) {
      if (safe[field] !== undefined) safe[field] = escapeXmlValue(safe[field]);
    }
    if (safe.restriction?.content !== undefined) {
      safe.restriction = {
        ...safe.restriction,
        content: escapeXmlValue(safe.restriction.content),
      };
    }
    if (safe.platform?.content !== undefined) {
      safe.platform = {
        ...safe.platform,
        content: escapeXmlValue(safe.platform.content),
      };
    }
    if (safe.uploader?.content !== undefined) {
      safe.uploader = {
        ...safe.uploader,
        content: escapeXmlValue(safe.uploader.content),
        ...(safe.uploader.info !== undefined
          ? { info: escapeXmlValue(safe.uploader.info) }
          : {}),
      };
    }
    return safe;
  });
}

/**
 * Make a `MetadataRoute.Sitemap` array safe to hand to Next's serializer.
 * Entries with an unusable `url` are dropped; unusable image/alternate URLs are
 * dropped from their entry without dropping the page itself.
 */
export function toXmlSafeSitemap(entries) {
  if (!Array.isArray(entries)) return [];

  const safe = [];
  for (const entry of entries) {
    if (!entry || !isValidSitemapUrl(entry.url)) continue;

    const next = { ...entry, url: escapeXmlValue(entry.url) };

    const images = escapeUrlList(entry.images);
    if (images) next.images = images;
    else delete next.images;

    const videos = escapeVideos(entry.videos);
    if (videos) next.videos = videos;
    else delete next.videos;

    const alternates = escapeAlternates(entry.alternates);
    if (alternates) next.alternates = alternates;
    else delete next.alternates;

    safe.push(next);
  }
  return safe;
}
