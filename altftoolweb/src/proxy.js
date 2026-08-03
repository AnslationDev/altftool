import { NextResponse } from "next/server";
// Slugs only, not the full metadata map. The map is 0.89 MiB and this file
// runs on every request; the sole question asked of it here is membership.
import { toolSlugSet } from "./platform/registry/toolSlugs.js";
import { getActiveRedirects } from "./platform/seo/redirectSource.js";
import { resolveRedirect } from "@altftool/core/seo/resolver";
import { getLegacyCategorySlugMap } from "./platform/registry/categoryTaxonomy.js";
import {
  EXACT_ROUTE_REDIRECT_STATUS,
  getExactRouteRedirect,
} from "./platform/navigation/exactRouteManifest.js";

// Pre-consolidation category slugs (e.g. /tools/calculator, /tools/utility)
// → canonical category routes. Static data, computed once per worker.
const LEGACY_CATEGORY_REDIRECTS = getLegacyCategorySlugMap();

// These product families remain in Git for remediation, but must not be
// reachable until their unsourced rankings/financial claims are replaced.
// Rewriting to the framework 404 route preserves the normal error UI while
// setting a real 404 status (layout-level notFound() can stream a soft 404).
const QUARANTINED_ROUTE_PREFIXES = [
  "/ai-explore",
  "/top8",
  "/top11",
  "/tradeon",
];

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
  let pathname = url.pathname;
  let changed = false;
  let statusCode = 301;

  if (
    QUARANTINED_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    const notFoundUrl = new URL("/_not-found", request.url);
    return NextResponse.rewrite(notFoundUrl, {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=300",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // 1a. ALTF Engine central redirects (admin-managed, no deploy).
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
    // 1b. Static path mapping to resolve redirect chains in 1 hop
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
      if (toolSlugSet.has(slug)) {
        pathname = `/tools/all/${slug}`;
        changed = true;
        // `toolMetaMap[slug]` used to answer this, and it inherited from
        // Object.prototype: /tools/toString was truthy and redirected. A Set
        // does not, so those paths now fall through to the line below — where
        // a plain object would inherit in turn and send /tools/toString to
        // /tools/function%20toString()%20%7B%20[native%20code]%20%7D. Own
        // properties only, on both.
      } else if (Object.hasOwn(LEGACY_CATEGORY_REDIRECTS, slug)) {
        // Legacy free-text category slug → canonical category route.
        pathname = `/tools/${LEGACY_CATEGORY_REDIRECTS[slug]}`;
        changed = true;
      }
    }
  }

  // Dynamic catch-all pages must not turn arbitrary strings into indexable
  // soft 404s. The exact manifest contains URL segments only, keeping the
  // Support Settings catalogues and Transform metadata out of this hot path.
  const exactRouteRedirect = getExactRouteRedirect(pathname);
  if (exactRouteRedirect) {
    pathname = exactRouteRedirect;
    changed = true;
    statusCode = EXACT_ROUTE_REDIRECT_STATUS;
  }

  if (changed) {
    const targetUrl = new URL(request.url);
    const isLocalhost =
      targetUrl.hostname === "localhost" || targetUrl.hostname === "127.0.0.1";

    if (!isLocalhost) {
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
