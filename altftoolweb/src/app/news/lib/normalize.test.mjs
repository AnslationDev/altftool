import assert from "node:assert/strict";
import test from "node:test";

import { normalizeItem } from "./normalize.js";

test("keeps missing and invalid publication dates unknown", () => {
  const missing = normalizeItem({ title: "Undated", link: "https://example.com/a" });
  const invalid = normalizeItem({ title: "Invalid", link: "https://example.com/b", pubDate: "nope" });

  assert.equal(missing.published_at, null);
  assert.equal(missing.published_hours_ago, null);
  assert.equal(invalid.published_at, null);
  assert.equal(invalid.published_hours_ago, null);
});

test("uses a stable identity for an undated syndicated story", () => {
  const item = { title: "Undated wire story", link: "https://example.com/story", _source: "Wire" };
  assert.equal(normalizeItem(item).id, normalizeItem(item).id);
  assert.equal(normalizeItem(item).slug, normalizeItem(item).slug);
});

test("normalizes a valid publication date", () => {
  const item = normalizeItem({
    title: "Dated story",
    link: "https://example.com/dated",
    isoDate: "2026-08-01T12:30:00Z",
  });
  assert.equal(item.published_at, "2026-08-01T12:30:00.000Z");
  assert.equal(Number.isFinite(item.published_hours_ago), true);
});
