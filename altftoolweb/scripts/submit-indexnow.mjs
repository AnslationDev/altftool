/**
 * Bulk IndexNow submission — run after a deploy.
 *
 * src/platform/seo/indexNow.js already pings changed URLs when /api/revalidate
 * fires, but nothing ever submits the whole sitemap. That leaves the big case
 * uncovered: a release that adds or reworks hundreds of URLs (this branch alone
 * touched /transform, /exam-photo, /deals, /open-data, /press…) waits for
 * Bing's recrawl to notice. Bing's index is what ChatGPT search, Copilot and
 * DuckDuckGo answer from, so until that recrawl those pages cannot be cited.
 *
 * Usage, after the deploy is live:
 *
 *   ALTFT_INDEXNOW_KEY=<key> node scripts/submit-indexnow.mjs
 *   ALTFT_INDEXNOW_KEY=<key> node scripts/submit-indexnow.mjs --dry-run
 *   ALTFT_INDEXNOW_KEY=<key> node scripts/submit-indexnow.mjs --site https://www.altftool.com
 *
 * Reads the LIVE sitemap (never the local build) so it can only ever submit
 * URLs that are actually being served — submitting before the deploy lands
 * would burn quota on 404s. Follows one level of sitemap-index nesting, dedupes,
 * and batches at IndexNow's 10,000-URL cap. Exit code is always 0 unless the
 * key is missing: indexing pings are best effort and must never fail a deploy
 * pipeline they get wired into.
 *
 * Google does not participate in IndexNow; this replaces nothing on that side.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000;
const FETCH_TIMEOUT_MS = 20000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const siteFlag = args.indexOf("--site");
const site = (siteFlag !== -1 && args[siteFlag + 1]) || "https://www.altftool.com";

const key = (process.env.ALTFT_INDEXNOW_KEY || "").trim();
// A dry run only reads the sitemap, so it works without a key — that is the
// point: you can see what would be submitted before setting anything up.
if (!dryRun && !/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  console.error(
    "ALTFT_INDEXNOW_KEY is not set (or not 8-128 [A-Za-z0-9-] characters).\n" +
      "Generate one (e.g. `openssl rand -hex 16`), set it in the deploy\n" +
      "environment, and make sure the same value is what /indexnow-key.txt\n" +
      "serves — that route reads the same variable.",
  );
  process.exit(1);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Every <loc> in a sitemap or sitemap-index document. */
function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s][^<]*?)\s*<\/loc>/g)].map((m) => m[1]);
}

const sitemapUrl = `${site.replace(/\/$/, "")}/sitemap.xml`;
console.log(`Reading ${sitemapUrl}`);
const rootXml = await fetchText(sitemapUrl);
const rootLocs = extractLocs(rootXml);

// A sitemap index lists child sitemaps; a plain sitemap lists pages. Detect by
// element name rather than guessing from the URL shape.
let urls;
if (/<sitemapindex[\s>]/.test(rootXml)) {
  urls = [];
  for (const child of rootLocs) {
    try {
      urls.push(...extractLocs(await fetchText(child)));
    } catch (error) {
      console.warn(`  skipped ${child}: ${error.message}`);
    }
  }
} else {
  urls = rootLocs;
}

const host = new URL(site).host;
const unique = [
  ...new Set(
    urls.filter((url) => {
      try {
        return new URL(url).host === host;
      } catch {
        return false;
      }
    }),
  ),
];

console.log(`${unique.length} unique URLs on ${host}`);
if (!unique.length) {
  console.error("The sitemap yielded nothing — is the deploy actually live?");
  process.exit(0);
}

if (dryRun) {
  console.log(`--dry-run: would submit in ${Math.ceil(unique.length / BATCH_SIZE)} batch(es).`);
  console.log(unique.slice(0, 5).join("\n"));
  process.exit(0);
}

for (let start = 0; start < unique.length; start += BATCH_SIZE) {
  const batch = unique.slice(start, start + BATCH_SIZE);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${site.replace(/\/$/, "")}/indexnow-key.txt`,
        urlList: batch,
      }),
    });
    // 200 = accepted; 202 = accepted, key not yet verified. 403 means the key
    // file does not match; 422 means URLs do not belong to the host; 429 is
    // rate limiting. All are worth seeing, none should fail the pipeline.
    console.log(`Batch ${start / BATCH_SIZE + 1}: HTTP ${response.status} (${batch.length} URLs)`);
  } catch (error) {
    console.warn(`Batch ${start / BATCH_SIZE + 1} failed: ${error.message}`);
  }
}
