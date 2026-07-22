import { NextResponse } from "next/server";
import { toolMetaMap } from "./platform/registry/toolMetaMap.js";
import { getActiveRedirects } from "./platform/seo/redirectSource.js";
import { resolveRedirect } from "@altftool/core/seo/resolver";
import { getLegacyCategorySlugMap } from "./platform/registry/categoryTaxonomy.js";

// Pre-consolidation category slugs (e.g. /tools/calculator, /tools/utility)
// → canonical category routes. Static data, computed once per worker.
const LEGACY_CATEGORY_REDIRECTS = getLegacyCategorySlugMap();

const REDIRECTS_MAP = {
  "/blog": "/blogs",
  "/about": "/policypages/about",
  "/contact": "/policypages/contact",
  "/privacy": "/policypages/privacy",
  "/terms": "/policypages/termsandconditions",
  "/cookie-policy": "/policypages/cookie",
  "/deals": "/exclusivedeals",
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
      if (toolMetaMap && toolMetaMap[slug]) {
        pathname = `/tools/all/${slug}`;
        changed = true;
      } else if (LEGACY_CATEGORY_REDIRECTS[slug]) {
        // Legacy free-text category slug → canonical category route.
        pathname = `/tools/${LEGACY_CATEGORY_REDIRECTS[slug]}`;
        changed = true;
      }
    }
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
