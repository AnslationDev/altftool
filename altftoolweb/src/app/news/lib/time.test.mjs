import assert from "node:assert/strict";
import test from "node:test";

import {
  compareNewsNewestFirst,
  getNewsHoursAgo,
  normalizePublishedAt,
} from "./time.js";

test("normalizes valid dates without inventing missing or invalid timestamps", () => {
  assert.equal(normalizePublishedAt("2026-08-01T12:30:00Z"), "2026-08-01T12:30:00.000Z");
  assert.equal(normalizePublishedAt(null), null);
  assert.equal(normalizePublishedAt("not-a-date"), null);
});

test("computes age from an explicit clock and clamps future dates", () => {
  const now = Date.parse("2026-08-02T12:30:00Z");
  assert.equal(getNewsHoursAgo("2026-08-01T12:30:00Z", now), 24);
  assert.equal(getNewsHoursAgo("2026-08-03T12:30:00Z", now), 0);
  assert.equal(getNewsHoursAgo(null, now), null);
});

test("sorts dated stories newest-first and leaves undated stories last", () => {
  const undated = { headline: "Undated", published_at: null, published_hours_ago: null };
  const older = { headline: "Older", published_at: "2026-08-01T00:00:00Z" };
  const newer = { headline: "Newer", published_at: "2026-08-02T00:00:00Z" };
  assert.deepEqual(
    [undated, older, newer].sort(compareNewsNewestFirst).map((item) => item.headline),
    ["Newer", "Older", "Undated"],
  );
});
