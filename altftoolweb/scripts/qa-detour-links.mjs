/**
 * Link health check for the AltF Detour catalog.
 *
 *   node scripts/qa-detour-links.mjs [--limit N] [--concurrency N] [--json]
 *
 * A directory of external links decays. This exists so the decay is measurable
 * rather than discovered by a visitor pressing the random button and landing on
 * a parked domain.
 *
 * Classification matters more than the raw status code. Well-known sites sit
 * behind Cloudflare and similar, which answer an automated request with 403 or
 * 503 while being perfectly alive in a browser — counting those as dead would
 * make the report useless. Only DNS failure, connection refusal, 404 and 410
 * are treated as genuinely broken.
 *
 * Not wired into the build: it makes ~1500 outbound requests and depends on
 * networks we do not control, so a CI failure here would say nothing about
 * whether our own code works.
 */

import { ALL_SITES } from "../packages/core/src/detour/catalog.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : Number(args[index + 1]);
};

const LIMIT = flag("limit", Infinity);
// Deliberately low. Past roughly a dozen concurrent sockets this starts timing
// out against hosts that are demonstrably up — the bottleneck is the local
// connection limit, not the remote server, and the resulting report is all
// false negatives. Raise it only if you have checked that it still reports 0
// dead against a known-good sample.
const CONCURRENCY = flag("concurrency", 8);
const AS_JSON = args.includes("--json");
const TIMEOUT_MS = 15_000;

// Some servers reject the default fetch agent outright. A real browser UA is
// the difference between a meaningful result and a page of false negatives.
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
};

const DEAD_STATUSES = new Set([404, 410]);

async function probe(site) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // HEAD first because it is cheap. It is also unreliable: plenty of servers
    // answer HEAD with 404, 403 or 405 while serving the page perfectly well on
    // GET — Wolfram Alpha, notify.moe and Google's Semantris all did, and a
    // first pass reported them as dead. Any non-2xx therefore falls through to
    // a real GET before we conclude anything.
    let response = await fetch(site.url, {
      method: "HEAD",
      headers: HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });

    if (response.status >= 400) {
      response = await fetch(site.url, {
        method: "GET",
        headers: HEADERS,
        redirect: "follow",
        signal: controller.signal,
      });
    }

    if (DEAD_STATUSES.has(response.status)) {
      return { site, state: "dead", detail: `HTTP ${response.status}` };
    }
    if (response.status >= 200 && response.status < 400) {
      return { site, state: "ok", detail: `HTTP ${response.status}` };
    }
    return { site, state: "blocked", detail: `HTTP ${response.status}` };
  } catch (error) {
    const message = error?.cause?.code || error?.name || String(error);
    if (message === "ENOTFOUND" || message === "ECONNREFUSED") {
      return { site, state: "dead", detail: message };
    }
    return { site, state: "unreachable", detail: message };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const external = ALL_SITES.filter((site) => site.origin !== "altf").slice(
    0,
    LIMIT,
  );

  const results = [];
  let cursor = 0;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < external.length) {
      const index = cursor++;
      results.push(await probe(external[index]));
      if (!AS_JSON && results.length % 50 === 0) {
        process.stderr.write(`  …${results.length}/${external.length}\n`);
      }
    }
  });

  await Promise.all(workers);

  const by = (state) => results.filter((result) => result.state === state);
  const dead = by("dead");
  const unreachable = by("unreachable");

  if (AS_JSON) {
    console.log(JSON.stringify({ total: results.length, dead, unreachable }, null, 2));
  } else {
    console.log(`\nChecked ${results.length} external links\n`);
    console.log(`  reachable        ${by("ok").length}`);
    console.log(`  blocked (alive)  ${by("blocked").length}`);
    console.log(`  unreachable      ${unreachable.length}`);
    console.log(`  dead             ${dead.length}\n`);

    [...dead, ...unreachable]
      .sort((a, b) => a.site.slug.localeCompare(b.site.slug))
      .forEach(({ site, state, detail }) => {
        console.log(`  ${state.padEnd(12)} ${site.slug.padEnd(38)} ${detail}  ${site.url}`);
      });
  }

  // Non-zero only on genuinely dead links, and only past a tolerance — a large
  // external directory always has a little rot, and failing on one dead link
  // would make this command something people stop running.
  const deadShare = dead.length / Math.max(1, results.length);
  process.exitCode = deadShare > 0.03 ? 1 : 0;
}

run();
