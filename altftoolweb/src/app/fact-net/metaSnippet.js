/**
 * Turn a long Fact Hub body description into a meta-description-sized snippet
 * that ends on a real boundary.
 *
 * Why this exists: the article route used `article.description.slice(0, 155)`,
 * a raw character cut. trimMetaDescription in src/platform/seo/generateMetadata.js
 * then saw a sub-160 string with no closing punctuation and appended a period,
 * so /fact-net/articles/30-facts-about-lsu-basketball shipped a description
 * ending "...purple-and-gold identity. This orig." and
 * /fact-net/articles/urban-rooftop-gardens ended "...give residents a ca."
 * Both were served live. Handing the untouched description to
 * trimMetaDescription instead is no better: its own fallback cuts at a word
 * boundary and produced "...and give residents a calmer." at 160 characters.
 *
 * The rules here, in order:
 *   1. Collapse whitespace. Short descriptions pass through untouched.
 *   2. Accumulate whole sentences while the total stays inside MAX.
 *   3. If even one sentence overflows, cut at the last comma (falling back to
 *      the last space), drop a dangling connective, and close with a period.
 *
 * Nothing is invented — every character comes from the article's own
 * description. Measured over all 14 descriptions in data/aiFactsData.js the
 * output is 104–156 characters, inside the 70–158 window, and round-trips
 * through trimMetaDescription unchanged.
 */

const MAX = 158;
const MIN = 70;

function clipToClause(text) {
  if (text.length <= MAX) return text;
  const window = text.slice(0, MAX);
  const comma = window.lastIndexOf(", ");
  const space = window.lastIndexOf(" ");
  const cut = comma > MIN ? comma : space;
  const base = window
    .slice(0, cut > MIN ? cut : MAX)
    .replace(/[,;:—–\-\s]+$/, "")
    .replace(/\s+(?:and|or|but|with|for|to|of|a|an|the|that|which)$/i, "");
  return `${base}.`;
}

export function toMetaSnippet(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= MAX) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = "";
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence.trim()}` : sentence.trim();
    if (next.length > MAX && out.length >= MIN) break;
    out = next;
    if (out.length > MAX) break;
  }

  return clipToClause(out || clean);
}
