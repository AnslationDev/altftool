import { NextResponse } from "next/server";

// SEO fix: force the single canonical host (non-www).
// Clears Google Search Console "Redirect error" on www.altftool.com/* by issuing
// exactly one 308 hop from www → apex. No effect on requests already on the apex.
const CANONICAL_HOST = "altftool.com";

export function middleware(request) {
  const host = (request.headers.get("host") || "").toLowerCase();

  if (host === `www.${CANONICAL_HOST}` || host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

// Run on real pages only; skip Next internals and static assets to save crawl budget.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
