import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  applySha256EventHashChain,
  buildCanonicalRecord,
  buildCountsOnlyReport,
  LIMITS,
  parseOffsetTimestamp,
  stableCanonicalStringify,
  validateEvidenceChainDraft,
} from "./evidenceChain.mjs";

const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);

function validDraft() {
  return {
    caseReference: "PRIVATE-CASE-9",
    evidenceItems: [
      {
        id: "EV-B",
        label: "PRIVATE SECOND ITEM",
        digestAlgorithm: "SHA-256",
        digest: DIGEST_B,
      },
      {
        id: "EV-A",
        label: "PRIVATE FIRST ITEM",
        digestAlgorithm: "SHA-256",
        digest: DIGEST_A,
      },
    ],
    events: [
      {
        eventId: "EVENT-1",
        evidenceItemId: "EV-A",
        type: "acquisition",
        timestamp: "2026-07-24T09:00:00+05:30",
        timezone: "Asia/Kolkata",
        actor: "PRIVATE ACTOR",
        recipient: "",
        location: "PRIVATE LOCATION",
        note: "PRIVATE NOTE",
      },
      {
        eventId: "EVENT-2",
        evidenceItemId: "EV-B",
        type: "acquisition",
        timestamp: "2026-07-24T04:00:00Z",
        timezone: "UTC",
        actor: "PRIVATE SECOND ACTOR",
        recipient: "",
        location: "",
        note: "",
      },
      {
        eventId: "EVENT-3",
        evidenceItemId: "EV-A",
        type: "transfer",
        timestamp: "2026-07-24T10:30:00+05:30",
        timezone: "Asia/Kolkata",
        actor: "PRIVATE ACTOR",
        recipient: "PRIVATE RECIPIENT",
        location: "PRIVATE LOCATION",
        note: "PRIVATE TRANSFER NOTE",
      },
    ],
  };
}

test("canonical JSON recursively sorts keys and preserves array order", () => {
  assert.equal(
    stableCanonicalStringify({
      z: 1,
      a: { y: 2, b: 3 },
      list: [{ z: 1, a: 2 }, 4],
    }),
    '{"a":{"b":3,"y":2},"list":[{"a":2,"z":1},4],"z":1}',
  );
});

test("parses offset-bearing timestamps without rewriting entered text", () => {
  const kolkata = parseOffsetTimestamp("2026-07-24T09:00:00+05:30");
  const utc = parseOffsetTimestamp("2026-07-24T03:30:00Z");
  assert.equal(kolkata.ok, true);
  assert.equal(kolkata.epochMs, utc.epochMs);
  assert.equal(parseOffsetTimestamp("2026-02-30T09:00:00Z").ok, false);
  assert.equal(parseOffsetTimestamp("2026-07-24T09:00:00").ok, false);
});

test("validates references, unique IDs, and supported digests", () => {
  const draft = validDraft();
  draft.evidenceItems[1].id = "EV-B";
  draft.events[1].evidenceItemId = "MISSING";
  draft.events[2].eventId = "EVENT-1";
  draft.evidenceItems[0].digest = "not-a-digest";

  const result = validateEvidenceChainDraft(draft);
  assert.equal(result.ok, false);
  assert.deepEqual(
    new Set(result.errors.map((issue) => issue.code)),
    new Set([
      "duplicate-evidence-id",
      "invalid-digest",
      "unknown-evidence-reference",
      "duplicate-event-id",
    ]),
  );
});

test("detects chronological regression and invalid acquisition order", () => {
  const draft = validDraft();
  draft.events[0].type = "access";
  draft.events[2].timestamp = "2026-07-24T03:00:00Z";

  const result = validateEvidenceChainDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(
    result.errors.some((issue) => issue.code === "acquisition-not-first"),
    true,
  );
  assert.equal(
    result.errors.some((issue) => issue.code === "chronology-regression"),
    true,
  );
});

test("requires recipients for transfer and return events", () => {
  const draft = validDraft();
  draft.events[2].recipient = "";
  const result = validateEvidenceChainDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(
    result.errors.some(
      (issue) =>
        issue.path === "events[2].recipient" && issue.code === "required",
    ),
    true,
  );
});

test("canonical record sorts evidence IDs but preserves exact event timestamp and timezone", () => {
  const draft = validDraft();
  const record = buildCanonicalRecord(draft);

  assert.deepEqual(
    record.evidenceItems.map((item) => item.id),
    ["EV-A", "EV-B"],
  );
  assert.deepEqual(
    record.events.map((event) => event.eventId),
    ["EVENT-1", "EVENT-2", "EVENT-3"],
  );
  assert.equal(record.events[0].timestampEntered, draft.events[0].timestamp);
  assert.equal(record.events[0].timezoneEntered, draft.events[0].timezone);
  assert.match(record.limitations.join(" "), /not a digital signature/iu);
  assert.match(record.limitations.join(" "), /notarization/iu);
  assert.match(record.limitations.join(" "), /admissible/iu);
});

test("builds the documented deterministic SHA-256 event hash chain", async () => {
  const record = buildCanonicalRecord(validDraft());
  const chained = await applySha256EventHashChain(record);
  const firstPayload = record.events[0];
  const expectedFirst = createHash("sha256")
    .update(`GENESIS\n${stableCanonicalStringify(firstPayload)}`, "utf8")
    .digest("hex");

  assert.equal(chained.hashChain.enabled, true);
  assert.equal(chained.events[0].chain.previousHash, "GENESIS");
  assert.equal(chained.events[0].chain.eventHash, expectedFirst);
  assert.equal(
    chained.events[1].chain.previousHash,
    chained.events[0].chain.eventHash,
  );
  assert.equal(
    chained.hashChain.finalEventHash,
    chained.events.at(-1).chain.eventHash,
  );

  const repeated = await applySha256EventHashChain(record);
  assert.equal(
    stableCanonicalStringify(chained),
    stableCanonicalStringify(repeated),
  );
});

test("counts-only report excludes all entered values, digests, timestamps, and hashes", async () => {
  const draft = validDraft();
  const validation = validateEvidenceChainDraft(draft);
  const chained = await applySha256EventHashChain(
    buildCanonicalRecord(draft),
  );
  const report = buildCountsOnlyReport(chained, validation);
  const serialized = stableCanonicalStringify(report);

  assert.equal(report.counts.evidenceItems, 2);
  assert.equal(report.counts.events, 3);
  assert.equal(report.counts.hashChainIncluded, true);
  assert.equal(serialized.includes("PRIVATE"), false);
  assert.equal(serialized.includes("EV-A"), false);
  assert.equal(serialized.includes(DIGEST_A), false);
  assert.equal(serialized.includes("2026-07-24"), false);
  assert.equal(
    serialized.includes(chained.events[0].chain.eventHash),
    false,
  );
  assert.equal(report.scope.includesTimestamps, false);
  assert.equal(report.scope.includesNotes, false);
});

test("enforces bounded item and note lengths", () => {
  const draft = validDraft();
  draft.events[0].note = "x".repeat(LIMITS.maxNoteLength + 1);
  const result = validateEvidenceChainDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(
    result.errors.some(
      (issue) => issue.path === "events[0].note" && issue.code === "too-long",
    ),
    true,
  );
});
