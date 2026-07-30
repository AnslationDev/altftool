import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const ALTFWORLD_DESCRIPTION =
  "AltfWorld is AltFTool's community-style space for independent builders, tool users, creators, and privacy-minded digital explorers.";

const ALTFWORLD_KEYWORDS = [
  "AltfWorld",
  "AltFTool community",
  "builder community",
  "digital tools community",
  "independent creators",
  "online forums",
];

export function formatAltfWorldSlug(value = "") {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * AltfWorld is a display-only interface demo. `data/mockCommunity.js` generates
 * 5,000 members, 30,000 threads, 2,000 listings and 1,000 resources from name
 * and phrase lists — no real person posted any of it, and the UI says so in
 * several places ("Search 30,000 mock threads", "display-only in this demo").
 *
 * That is fine for a demo and wrong for the index. Submitting a generated
 * corpus at that scale is scaled content abuse under Google's spam policies,
 * and /altfworld/forums/[category]/[subcategory]/[thread] plus
 * /altfworld/profile/[handle] open an effectively unbounded crawl space that
 * would spend crawl budget the real tool pages need.
 *
 * So every AltfWorld route is noindex/nofollow and none of them are in
 * src/app/sitemap.js. The demo stays fully usable for people. When the
 * community runs on real accounts and real posts, pass `noindex: false` from
 * the pages that hold real content — do not flip the default here, because the
 * mock routes will still exist alongside them.
 */
export function buildAltfWorldMetadata({
  title,
  description = ALTFWORLD_DESCRIPTION,
  path = "/altfworld",
  keywords = [],
  noindex = true,
} = {}) {
  return createPageMetadata({
    title,
    description,
    path,
    keywords: [...ALTFWORLD_KEYWORDS, ...keywords],
    noindex,
    follow: !noindex,
  });
}
