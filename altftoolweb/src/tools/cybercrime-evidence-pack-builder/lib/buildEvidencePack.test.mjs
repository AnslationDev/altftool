import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlySummary,
  buildEvidencePack,
  normalizeEvidence,
  parseTimeline,
} from "./buildEvidencePack.mjs";

const DIGEST = "a".repeat(64);

test("parses tab and pipe separated timeline events", () => {
  const result = parseTimeline(
    "2026-07-20 10:00\tReceived message\tScreenshot 1\n2026-07-20 10:05 | Payment requested | Chat export",
  );
  assert.equal(result.errors.length, 0);
  assert.equal(result.entries.length, 2);
  assert.equal(result.entries[1].event, "Payment requested");
});

test("reports malformed timeline lines without guessing fields", () => {
  const result = parseTimeline("Only an event");
  assert.equal(result.entries.length, 0);
  assert.match(result.errors[0], /needs a date/);
});

test("normalizes file metadata with a valid SHA-256 digest", () => {
  const result = normalizeEvidence([
    {
      filename: "chat.png",
      mediaType: "image/png",
      size: 123,
      lastModified: 1_700_000_000_000,
      sha256: DIGEST.toUpperCase(),
      note: "Original screenshot copy",
    },
  ]);
  assert.equal(result.errors.length, 0);
  assert.equal(result.evidence[0].sha256, DIGEST);
  assert.equal(result.evidence[0].sizeBytes, 123);
});

test("rejects invalid digest and file size values", () => {
  const result = normalizeEvidence([
    { filename: "bad", size: -1, sha256: "not-a-digest" },
  ]);
  assert.equal(result.evidence.length, 0);
  assert.match(result.errors[0], /SHA-256/);
});

test("builds a structured pack without embedding file content", () => {
  const result = buildEvidencePack({
    incidentTitle: "Marketplace incident",
    incidentReference: "PRIVATE-REF",
    narrative: "A private narrative",
    timelineSource: "2026-07-20\tReceived message\tchat.png",
    evidenceItems: [
      {
        filename: "chat.png",
        mediaType: "image/png",
        size: 123,
        sha256: DIGEST,
      },
    ],
    createdAt: "2026-07-21T00:00:00.000Z",
  });
  assert.equal(result.ok, true);
  assert.equal(result.pack.processing.filesEmbedded, false);
  assert.equal(result.pack.evidence[0].sha256, DIGEST);
  assert.equal(result.counts.evidenceFiles, 1);
});

test("requires a title and some organized evidence", () => {
  assert.equal(buildEvidencePack({ incidentTitle: "" }).ok, false);
  const result = buildEvidencePack({ incidentTitle: "Title" });
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /at least one/);
});

test("counts-only summary excludes incident values, names, and hashes", () => {
  const result = buildEvidencePack({
    incidentTitle: "SECRET TITLE",
    incidentReference: "SECRET REF",
    narrative: "SECRET NARRATIVE",
    timelineSource: "2026-07-20\tSECRET EVENT\tSECRET FILE",
    evidenceItems: [
      {
        filename: "secret-name.png",
        mediaType: "image/png",
        size: 123,
        sha256: DIGEST,
      },
    ],
  });
  const serialized = JSON.stringify(buildCountsOnlySummary(result));
  for (const secret of [
    "SECRET TITLE",
    "SECRET REF",
    "SECRET NARRATIVE",
    "SECRET EVENT",
    "secret-name.png",
    DIGEST,
  ]) {
    assert.equal(serialized.includes(secret), false);
  }
});
