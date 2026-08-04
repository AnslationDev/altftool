/**
 * Top-level routes that must pass through the request guard without a
 * Firestore lookup. Keep this module compact because proxy.js imports it on
 * every request. The companion test reconstructs the list from src/app and
 * public so a newly added route cannot be shadowed by the dynamic landing.
 */
function segmentSet(value) {
  return new Set(value.split(" "));
}

export const STATIC_TOP_LEVEL_ROUTE_SEGMENTS = segmentSet(
  "academy account ad-preview ads.txt ai.txt almain.svg alpic.png alternatives altfcalculators altfgame altflinking altfloveimg altflovepdf altftool-icon.svg altfworld altpintrest amaz.jpg amaz.png ancestory apps banner1.png banner2.png banner3.png banner4.png banner5.png banner6.png bharat-virasat blogs bops brandrating buysmart buzzfeed continue.jpg continue.png continue1.png deals desktop docs embed exam-photo exclusivedeals extensions fact-net favicon.ico favicon1.png file.svg flightradar fodey-new free-ai-tool fullscrn games geektyper globe.svg homeserv human-benchmark iHro.png icons.svg image-fallback.svg image.png image128.png image131.png image138.png image139.png imgprompt indexnow-key.txt kym labs licenses live-activity-simulation llms-full.txt llms.txt locations lookouts manifest.webmanifest mobilebanner1.png mobilebanner5.png mother.png n8n news next.svg open-data patatap personality pixel-thought playbuzz prank-socialmedia pranx press products prompts radio-garden request-a-tool robots.txt rss.xml sale search search-eng searchbrand.png siding signals site-map sketchflow smartlink soft-murmur status subscribe.png supportsetting sw.js sitemap.xml tools top1 top10 top11 top6 top9 top9-homepage.html tradeon transform trendingvids unsubscribe vercel.svg vista.png wattpad window.svg windowswap",
);

function getSingleTopLevelSegment(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return null;

  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (normalized === "/") return null;

  const segment = normalized.slice(1);
  if (!segment || segment.includes("/")) return null;
  return segment;
}

/**
 * Return a possible admin-managed root slug. Known app/public routes and all
 * nested paths return null, so only otherwise-unmatched root requests pay for
 * the cached Firestore configuration lookup.
 */
export function getDynamicTopLevelSlugCandidate(pathname) {
  const segment = getSingleTopLevelSegment(pathname);
  if (!segment || STATIC_TOP_LEVEL_ROUTE_SEGMENTS.has(segment)) return null;
  return segment;
}
