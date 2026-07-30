export const PRODUCTION_SITE_URL = "https://www.altftool.com";

const PRODUCTION_HOSTS = new Set(["altftool.com", "www.altftool.com"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * A fully-qualified host can arrive with the DNS root dot ("altftool.com."),
 * which is a different string that serves the exact same site. Without this it
 * would fall through the production-host check and be published as an
 * *external* canonical, splitting signals off the canonical host.
 */
function productionHost(hostname) {
  return PRODUCTION_HOSTS.has(String(hostname || "").toLowerCase().replace(/\.+$/, ""));
}

export function resolveSiteUrl(
  value = process.env.NEXT_PUBLIC_SITE_URL,
  nodeEnv = process.env.NODE_ENV,
) {
  const candidate = String(value || "").trim();
  if (!candidate) return PRODUCTION_SITE_URL;

  try {
    const url = new URL(candidate);

    if (nodeEnv !== "production" && LOCAL_HOSTS.has(url.hostname)) {
      return url.origin;
    }

    if (url.protocol === "https:" && productionHost(url.hostname)) {
      // AWS Amplify redirects the apex host to www (measured 2026-07-30:
      // https://altftool.com/ -> 302, issued above the Next origin, so it is
      // an Amplify console setting and not fixable here — see amplify.yml).
      // Keep every canonical, sitemap entry, entity ID, and social URL on one
      // production host regardless.
      return PRODUCTION_SITE_URL;
    }
  } catch {
    // A malformed deployment variable must never leak into canonical URLs.
  }

  return PRODUCTION_SITE_URL;
}

/**
 * Resolve a canonical value without allowing old apex-domain CMS records to
 * split search signals from the canonical www host. External canonicals remain
 * valid for deliberately syndicated content.
 */
export function normalizeCanonicalUrl(
  value,
  fallbackPath = "/",
  siteUrl = resolveSiteUrl(),
) {
  const canonicalOrigin = String(siteUrl || PRODUCTION_SITE_URL).replace(/\/+$/, "");
  const fallback = String(fallbackPath || "/").trim() || "/";
  const raw = String(value || fallback).trim();

  const resolveFallback = () => {
    try {
      const fallbackUrl = new URL(fallback, `${canonicalOrigin}/`);
      fallbackUrl.hash = "";
      return fallbackUrl.toString();
    } catch {
      return `${canonicalOrigin}/`;
    }
  };

  if (
    !raw ||
    /\s/.test(raw) ||
    (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:/i.test(raw))
  ) {
    return resolveFallback();
  }

  try {
    const url = new URL(raw, `${canonicalOrigin}/`);
    if (!/^https?:$/.test(url.protocol)) return resolveFallback();

    if (productionHost(url.hostname)) {
      const canonicalBase = new URL(canonicalOrigin);
      url.protocol = canonicalBase.protocol;
      url.host = canonicalBase.host;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return resolveFallback();
  }
}
