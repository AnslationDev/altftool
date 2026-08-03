import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const webRoot = path.resolve(import.meta.dirname, "../../..");
const apiRoot = path.join(webRoot, "src/app/api/top10");

test("every public Top10 route enforces the shared rate limit", () => {
  const routeFiles = readdirSync(apiRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(apiRoot, entry.name, "route.js"));

  assert.ok(routeFiles.length >= 16);
  for (const file of routeFiles) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /enforceTop10RateLimit\(request\)/, path.relative(webRoot, file));
    assert.match(source, /if \(limited\) return limited;/, path.relative(webRoot, file));
  }
});

test("every curated Top10 category route rejects identifiers outside its navigation set", () => {
  const routeFiles = readdirSync(apiRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(apiRoot, entry.name, "route.js"));

  for (const file of routeFiles) {
    const source = readFileSync(file, "utf8");
    if (/by_(?:category|subject|genre)/.test(source)) {
      assert.match(source, /top10Choice\(/, path.relative(webRoot, file));
    }
  }
});

test("Amplify persists every server-side provider credential used by Top10", () => {
  const source = readFileSync(path.join(webRoot, "scripts/write-amplify-runtime-env.mjs"), "utf8");
  for (const envName of [
    "GEOAPIFY_API_KEY",
    "FOURSQUARE_API_KEY",
    "COINCAP_API_KEY",
    "API_NINJAS_KEY",
    "CAT_API_KEY",
    "PRODUCTHUNT_API_",
  ]) {
    assert.match(source, new RegExp(envName));
  }
  assert.match(source, /ALTFT_/);
});

test("Product Hunt stays disabled until commercial use is explicitly approved", () => {
  const source = readFileSync(path.join(webRoot, "src/lib/providers/producthunt/client.js"), "utf8");
  assert.match(source, /requireProviderApproval\("ALTFT_TOP10_PRODUCTHUNT_APPROVED"/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /pendingToken/);
  assert.doesNotMatch(source, /text\.slice\(/);
});

test("the Top10 trending strip avoids full-roster fan-out and has a response deadline", () => {
  const source = readFileSync(path.join(webRoot, "src/lib/top10/trendingCards.js"), "utf8");
  assert.doesNotMatch(source, /getPokemonByCategory/);
  assert.doesNotMatch(source, /getPeopleByCategory/);
  assert.match(source, /CARD_DEADLINE_MS/);
  assert.match(source, /Promise\.race/);
});
