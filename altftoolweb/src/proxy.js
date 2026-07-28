import { NextResponse } from "next/server";
import { toolMetaMap } from "./platform/registry/toolMetaMap.js";
import { getActiveRedirects } from "./platform/seo/redirectSource.js";
import { resolveRedirect } from "@altftool/core/seo/resolver";
import {
  getLegacyCategorySlugMap,
  slugifyCategory,
} from "./platform/registry/categoryTaxonomy.js";

// Pre-consolidation category slugs (e.g. /tools/calculator, /tools/utility)
// → canonical category routes. Static data, computed once per worker.
const LEGACY_CATEGORY_REDIRECTS = getLegacyCategorySlugMap();

// Every real /tools/:category slug. Mirrors getToolCategorySlugs() in
// src/app/tools/toolRouteUtils.js exactly (same derivation: "all" plus every
// slugified tool category in toolMetaMap), but is inlined here because
// toolRouteUtils.js also pulls in the tool SEO content bundle
// (toolContentOverrides.js alone is ~800 KB) and proxy.js runs on every
// request — see the note at the top of platform/seo/redirectSource.js.
const KNOWN_CATEGORY_SLUGS = new Set(["all"]);
Object.values(toolMetaMap ?? {}).forEach((tool) => {
  const categories = Array.isArray(tool?.category)
    ? tool.category
    : tool?.category
      ? [tool.category]
      : [];
  categories.forEach((category) => {
    const slug = slugifyCategory(category);
    if (slug) KNOWN_CATEGORY_SLUGS.add(slug);
  });
});

// Host canonicalisation. Every page is reachable on more than one host (the
// apex, and the Amplify default *.amplifyapp.com domain), and each extra host
// serves a byte-identical copy of the whole site. Search engines treat those as
// separate sites and split the ranking signals between them, so anything that
// is not the canonical host gets a permanent redirect onto it.
const CANONICAL_HOST = "www.altftool.com";

// Dev hosts, which must never be redirected to production.
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

function normalizeHostname(hostname = "") {
  // Trailing dot: "www.altftool.com." is the same host to DNS, and crawlers do
  // occasionally request it.
  return String(hostname).toLowerCase().replace(/\.$/, "");
}

function isLocalHostname(hostname) {
  return LOCAL_HOSTNAMES.has(normalizeHostname(hostname));
}

// Deliberately an allow-list of hosts we know are ours, not "everything that is
// not www". This proxy runs on every request, and Amplify's SSR origin is known
// to present an unusual URL (see the port handling below), so a blanket
// "redirect any unexpected host to www" would turn one wrong Host header into a
// site-wide redirect loop. It would also break device testing over a LAN IP or
// a tunnel host by bouncing the tester to production. Unknown hosts are left
// alone; the hosts that actually cause duplicate indexing are all listed here.
function isNonCanonicalHost(hostname = "") {
  const host = normalizeHostname(hostname);
  if (!host || host === CANONICAL_HOST || LOCAL_HOSTNAMES.has(host)) return false;
  if (host === "altftool.com" || host.endsWith(".altftool.com")) return true;
  // Amplify's build-in domain (e.g. main.d1234.amplifyapp.com) serves the whole
  // site and is crawlable unless it is redirected away.
  if (host.endsWith(".amplifyapp.com")) return true;
  return false;
}

const REDIRECTS_MAP = {
  "/blog": "/blogs",
  "/about": "/policypages/about",
  "/contact": "/policypages/contact",
  "/privacy": "/policypages/privacy",
  "/terms": "/policypages/termsandconditions",
  "/cookie-policy": "/policypages/cookie",
  // "/deals" now serves the AltF Deals hub (was: redirect to /exclusivedeals).
  "/exclusive-deals": "/exclusivedeals",
  "/buy-smart": "/buysmart",
  "/sales": "/sale",
  "/trending-videos": "/trendingvids",
  "/rss": "/rss.xml",
  // Trademark-safe renames (old slugs may be indexed/bookmarked).
  "/tools/all/candy-crush": "/tools/all/candy-match-3",
  "/tools/candy-crush": "/tools/all/candy-match-3",
  "/games/candy-crush": "/games/candy-match-3",
};

export async function proxy(request) {
  const url = request.nextUrl.clone();
  const requestUrl = new URL(request.url);

  // 1. Host first, before any path work. A path redirect issued on the wrong
  //    host keeps the user (and the crawler) on the wrong host, so host and
  //    path have to be fixed in that order — one 301 to the canonical host,
  //    path and query untouched, then the path rules run on the next request.
  if (isNonCanonicalHost(requestUrl.hostname)) {
    requestUrl.protocol = "https:";
    requestUrl.hostname = CANONICAL_HOST;
    // Amplify forwards SSR requests through an internal :3000 origin.
    requestUrl.port = "";
    return NextResponse.redirect(requestUrl, 301);
  }

  let pathname = url.pathname;
  let changed = false;
  let statusCode = 301;

  // 2a. ALTF Engine central redirects (admin-managed, no deploy).
  //     Inert when the engine is off: getActiveRedirects() returns [] instantly.
  const central = resolveRedirect(await getActiveRedirects(), pathname);
  if (central && central.destination) {
    // External destination -> redirect straight there with the configured status.
    if (/^https?:\/\//i.test(central.destination)) {
      return NextResponse.redirect(central.destination, central.statusCode);
    }
    pathname = central.destination;
    changed = true;
    statusCode = central.statusCode;
  } else if (REDIRECTS_MAP[pathname]) {
    // 2b. Static path mapping to resolve redirect chains in 1 hop
    pathname = REDIRECTS_MAP[pathname];
    changed = true;
  } else if (pathname.startsWith("/news/topic/")) {
    const topic = pathname.substring("/news/topic/".length);
    pathname = `/news/topics/${topic}`;
    changed = true;
  } else if (pathname.startsWith("/categories/")) {
    pathname = "/tools/all";
    changed = true;
  } else if (pathname.startsWith("/tools/")) {
    const segments = pathname.split("/").filter(Boolean);
    // Redirect /tools/:slug to /tools/all/:slug if slug matches a registered tool
    if (segments.length === 2 && segments[0] === "tools") {
      const slug = segments[1];
      if (toolMetaMap && toolMetaMap[slug]) {
        pathname = `/tools/all/${slug}`;
        changed = true;
      } else if (LEGACY_CATEGORY_REDIRECTS[slug]) {
        // Legacy free-text category slug → canonical category route.
        pathname = `/tools/${LEGACY_CATEGORY_REDIRECTS[slug]}`;
        changed = true;
      } else if (!KNOWN_CATEGORY_SLUGS.has(slug)) {
        // Unknown slug. /tools/[category] has dynamicParams on (it must: the
        // Amplify build defers bulk prerendering, so generateStaticParams()
        // returns []), which used to render a 200 self-canonical "Zzq Garbage
        // Tools" doorway page for every typo, scrape, and guessed URL — an
        // unbounded indexable surface. Collapse them all onto the real hub.
        pathname = "/tools/all";
        changed = true;
      }
    }
  }

  if (changed) {
    const targetUrl = new URL(request.url);
    // Kept after the host guard above: a request only reaches here on the
    // canonical host, a dev host, or a host the guard deliberately does not
    // recognise (an unexpected Amplify origin). For that last case, pinning the
    // redirect target to the canonical host is still the right answer.
    if (!isLocalHostname(targetUrl.hostname)) {
      targetUrl.protocol = "https:";
      targetUrl.hostname = "www.altftool.com";
      // Amplify forwards SSR requests through an internal :3000 origin.
      targetUrl.port = "";
    }
    targetUrl.pathname = pathname;

    return NextResponse.redirect(targetUrl, statusCode);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
