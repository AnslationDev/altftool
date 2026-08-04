import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  STATIC_TOP_LEVEL_ROUTE_SEGMENTS,
  getDynamicTopLevelSlugCandidate,
} from "./topLevelRouteManifest.js";

const webRoot = path.resolve(import.meta.dirname, "../../..");
const appRoot = path.join(webRoot, "src/app");
const publicRoot = path.join(webRoot, "public");
const routeFilePattern = /^(?:page|route)\.(?:js|jsx|ts|tsx)$/;

async function discoverStaticTopLevelSegments() {
  const segments = new Set(["manifest.webmanifest", "robots.txt", "sitemap.xml"]);
  const appEntries = await readdir(appRoot, { withFileTypes: true });

  for (const entry of appEntries) {
    if (
      !entry.isDirectory() ||
      entry.name === "api" ||
      entry.name.startsWith("(") ||
      entry.name.startsWith("[") ||
      entry.name.startsWith("_")
    ) {
      continue;
    }

    const files = await readdir(path.join(appRoot, entry.name), {
      withFileTypes: true,
    });
    if (files.some((file) => file.isFile() && routeFilePattern.test(file.name))) {
      segments.add(entry.name);
    }
  }

  const publicEntries = await readdir(publicRoot, { withFileTypes: true });
  for (const entry of publicEntries) {
    if (entry.isFile()) segments.add(entry.name);
  }

  return [...segments].sort();
}

test("top-level route manifest matches app and public routes", async () => {
  assert.deepEqual(
    [...STATIC_TOP_LEVEL_ROUTE_SEGMENTS].sort(),
    await discoverStaticTopLevelSegments(),
  );
});

test("only unknown single-segment paths become dynamic candidates", () => {
  assert.equal(getDynamicTopLevelSlugCandidate("/special"), "special");
  assert.equal(getDynamicTopLevelSlugCandidate("/special/"), "special");
  assert.equal(getDynamicTopLevelSlugCandidate("/tools"), null);
  assert.equal(getDynamicTopLevelSlugCandidate("/tools/all"), null);
  assert.equal(getDynamicTopLevelSlugCandidate("/ads.txt"), null);
  assert.equal(getDynamicTopLevelSlugCandidate("/"), null);
  assert.equal(getDynamicTopLevelSlugCandidate("special"), null);
});
