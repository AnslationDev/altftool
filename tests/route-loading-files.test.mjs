import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const webAppRoot = "altftoolweb/src/app";
const adminAppRoot = "altftoolwebadmin/src/app";
const pageFilePattern = /^page\.(jsx|tsx|js|ts)$/;
const loadingFilePattern = /^loading\.(jsx|tsx|js|ts)$/;
const routeEntryFilePattern = /^(page|route)\.(jsx|tsx|js|ts)$/;
const webRouteLoadingSource = readFileSync(
  "altftoolweb/src/components/ui/route-loading.jsx",
  "utf8",
);

function collectPageSegments(dir, appRoot, segments = [], inheritedLoading = false) {
  const entries = readdirSync(dir);
  const hasPage = entries.some((entry) => pageFilePattern.test(entry));
  const hasLoading = entries.some((entry) => loadingFilePattern.test(entry));
  const hasLoadingInChain = inheritedLoading || hasLoading;

  if (hasPage) {
    segments.push({
      route: relative(appRoot, dir) || "/",
      hasLoading,
      hasLoadingInChain,
    });
  }

  for (const entry of entries) {
    if (entry.startsWith("_")) continue;

    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      collectPageSegments(path, appRoot, segments, hasLoadingInChain);
    }
  }

  return segments;
}

function containsRouteEntry(dir) {
  return readdirSync(dir).some((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return containsRouteEntry(path);
    }

    return routeEntryFilePattern.test(entry);
  });
}

describe("route loading coverage", () => {
  it("keeps every public web feature root connected to a route", () => {
    const infrastructureRoots = new Set(["_altf", "styles"]);
    const orphanedRoots = readdirSync(webAppRoot)
      .filter((entry) => {
        const path = join(webAppRoot, entry);
        return (
          statSync(path).isDirectory() &&
          !infrastructureRoots.has(entry) &&
          !containsRouteEntry(path)
        );
      })
      .sort();

    assert.deepEqual(orphanedRoots, []);
  });

  it("keeps every public App Router page segment covered by an inherited loading UI", () => {
    const missing = collectPageSegments(webAppRoot, webAppRoot)
      .filter((segment) => !segment.hasLoadingInChain)
      .map((segment) => segment.route)
      .sort();

    assert.deepEqual(missing, []);
  });

  it("keeps admin App Router pages covered by an inherited loading UI", () => {
    const missing = collectPageSegments(adminAppRoot, adminAppRoot)
      .filter((segment) => !segment.hasLoadingInChain)
      .map((segment) => segment.route)
      .sort();

    assert.deepEqual(missing, []);
  });

  it("keeps the shared hero skeleton inside narrow mobile viewports", () => {
    assert.match(
      webRouteLoadingSource,
      /grid min-w-0 grid-cols-1 gap-4/,
    );
    assert.match(
      webRouteLoadingSource,
      /compact \? "h-9 max-w-72" : "h-12 max-w-xl"/,
    );
    assert.doesNotMatch(webRouteLoadingSource, /h-12 w-\[34rem\]/);
  });
});
