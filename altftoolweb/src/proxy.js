import { NextResponse } from "next/server";
import { toolMetaMap } from "./platform/registry/toolMetaMap.js";
import { getActiveRedirects } from "./platform/seo/redirectSource.js";
import { resolveRedirect } from "@altftool/core/seo/resolver";

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
};

export async function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  let pathname = url.pathname;
  let changed = false;
  let statusCode = 301;

  // 1. Force Apex domain: redirect www.altftool.com -> altftool.com
  if (host.startsWith("www.")) {
    changed = true;
  }

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
      }
    }
  }

  if (changed) {
    const targetUrl = new URL(request.url);
    targetUrl.protocol = "https:";
    targetUrl.host = "altftool.com";
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
