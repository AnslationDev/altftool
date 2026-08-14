/**
 * IndexNow submission.
 *
 * IndexNow pushes changed URLs to Bing, Yandex, Seznam and Naver instead of
 * waiting for a recrawl. That matters beyond Bing's own share: ChatGPT search
 * and Microsoft Copilot answer from the Bing index, so a page that Bing has not
 * recrawled cannot be cited by them. Google does not participate.
 *
 * Wired into /api/revalidate, which is the single choke point every publish
 * already flows through, so a submission costs nothing extra operationally.
 */

// Extension included to match the sibling modules in this folder and to keep
// the module resolvable by plain Node in tests, not just by the Next bundler.
import { getSiteUrl } from "./generateMetadata.js";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const SUBMIT_TIMEOUT_MS = 4000;

// IndexNow keys must be 8-128 hex-ish characters. Validating here means a
// malformed env value is ignored rather than sent and rejected on every publish.
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

// The key is committed on purpose. An IndexNow key is NOT a secret: the whole
// verification model is that the key is published at a public URL
// (/indexnow-key.txt) so the search engine can fetch it and confirm whoever
// submitted the URLs controls the host. Anyone can already read it with one
// GET. Its only power is "submit URLs on this host for recrawl", which is
// worthless to an attacker — they can only ask Bing to re-read our own pages.
//
// It lives here rather than in an environment variable because an env-only key
// meant the feature shipped switched off: the variable was never set anywhere
// (not in .env.example, not in amplify.yml), so /indexnow-key.txt served a 404
// and every publish silently skipped submission. A constant cannot regress that
// way. ALTFT_INDEXNOW_KEY still overrides it, so the key can be rotated from
// the Amplify console without a deploy.
const DEFAULT_INDEXNOW_KEY = "c8f4f134a042e8cfa5a31139a610b007";

/**
 * The active key. The env override wins when it is well-formed; a malformed
 * override falls back to the committed key rather than disabling IndexNow.
 * Both the key file route and the submitter call this, so the key served and
 * the key sent can never disagree.
 */
export function getIndexNowKey() {
  const raw = process.env.ALTFT_INDEXNOW_KEY;
  const override = typeof raw === "string" ? raw.trim() : "";
  if (override && KEY_PATTERN.test(override)) return override;
  return KEY_PATTERN.test(DEFAULT_INDEXNOW_KEY) ? DEFAULT_INDEXNOW_KEY : null;
}

/**
 * Where the key file is served. The spec allows any path on the host as long as
 * it is declared as keyLocation, so a fixed filename is used rather than the
 * conventional /<key>.txt — a dynamic root route would collide with /[slug].
 */
export function getIndexNowKeyLocation() {
  return `${getSiteUrl()}/indexnow-key.txt`;
}

/**
 * Submit changed paths. Best effort by contract: never throws, never rejects,
 * and never blocks a publish. Returns a small result object for logging.
 */
export async function submitToIndexNow(paths = []) {
  const key = getIndexNowKey();
  if (!key) return { skipped: "no-key" };

  const siteUrl = getSiteUrl();
  let host;
  try {
    host = new URL(siteUrl).host;
  } catch {
    return { skipped: "bad-site-url" };
  }

  // Only public, indexable paths. /api/* is disallowed in robots.txt, and
  // submitting a URL a crawler is forbidden to fetch is a wasted quota hit.
  const urlList = [
    ...new Set(
      (Array.isArray(paths) ? paths : [])
        .filter((p) => typeof p === "string" && p.startsWith("/"))
        .filter((p) => !p.startsWith("/api/"))
        .map((p) => `${siteUrl}${p}`),
    ),
  ].slice(0, 10000); // IndexNow caps a single submission at 10,000 URLs.

  if (!urlList.length) return { skipped: "no-urls" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: getIndexNowKeyLocation(),
        urlList,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    // 200 accepted, 202 accepted-pending-key-validation. Both are successes.
    return { ok: response.ok, status: response.status, count: urlList.length };
  } catch (error) {
    return { ok: false, error: error?.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
