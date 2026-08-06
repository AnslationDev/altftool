// node --test packages/core/src/rabbithole/lost.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import lost, { LOST_STATUS_IDS, countLostByStatus } from "./lost.js";
import { SITES } from "./catalog.js";

// This page publishes "this site is dead" about named third parties, so the
// tests here are about not saying something false in public.

test("every entry has the fields the page renders", () => {
  for (const entry of lost) {
    assert.ok(entry.name?.trim(), `missing name: ${entry.domain}`);
    assert.ok(entry.domain?.trim(), `missing domain: ${entry.name}`);
    assert.ok(
      LOST_STATUS_IDS.includes(entry.status),
      `${entry.domain} has unknown status ${entry.status}`,
    );
    assert.ok(
      entry.note && entry.note.length >= 80,
      `${entry.domain} note is too thin to be worth a line`,
    );
  }
});

test("domains carry no protocol", () => {
  // A path is allowed — sometimes only one sub-path of a live host died — but a
  // full URL is not, because the page renders this as a bare label.
  for (const entry of lost) {
    assert.doesNotMatch(entry.domain, /^https?:/, entry.domain);
    assert.match(entry.domain, /^[a-z0-9.-]+(?:\/[a-z0-9/-]*)?$/, entry.domain);
  }
});

test("no domain is listed twice", () => {
  const seen = new Set();
  for (const entry of lost) {
    assert.ok(!seen.has(entry.domain), `duplicate: ${entry.domain}`);
    seen.add(entry.domain);
  }
});

test("a lost domain is never also a live catalog entry", () => {
  // Listing a site as dead on one page and linking to it as alive on another
  // is the single most embarrassing failure this page can have. Compared on
  // host+path, because a host can outlive one of its sub-paths.
  const identity = (url) => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/+$/, "")}`;
    } catch {
      return url;
    }
  };
  const live = new Set(SITES.map((site) => identity(site.url)));

  for (const entry of lost) {
    const bare = entry.domain.replace(/\/+$/, "");
    assert.ok(
      !live.has(bare),
      `${entry.domain} is on the graveyard AND in the live catalog`,
    );
    // A bare host on the graveyard must not shadow any live path under it.
    if (!bare.includes("/")) {
      const shadowed = [...live].filter((id) => id === bare || id.startsWith(`${bare}/`));
      assert.deepEqual(
        shadowed,
        [],
        `${entry.domain} is declared dead but still hosts live entries: ${shadowed.join(", ")}`,
      );
    }
  }
});

test("internal successors point at real catalog pages", () => {
  const slugs = new Set(SITES.map((site) => site.slug));
  for (const entry of lost) {
    const url = entry.successor?.url;
    if (!url || !url.startsWith("/")) continue;

    const match = url.match(/^\/rabbithole\/site\/([a-z0-9-]+)$/);
    if (match) {
      assert.ok(
        slugs.has(match[1]),
        `${entry.domain} points at missing entry ${match[1]}`,
      );
    } else {
      // Any other internal path must at least be absolute and slash-rooted.
      assert.match(url, /^\/[a-z0-9/-]+$/, `${entry.domain} bad internal path ${url}`);
    }
  }
});

test("external successors and archives are https", () => {
  for (const entry of lost) {
    const external = [entry.successor?.url, entry.archive].filter(
      (url) => url && !url.startsWith("/"),
    );
    for (const url of external) {
      assert.match(url, /^https:\/\//, `${entry.domain}: ${url}`);
    }
  }
});

test("counts agree with the list", () => {
  const counts = countLostByStatus();
  const summed = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(summed, lost.length);
});
