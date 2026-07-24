import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCanonicalHashInput,
  buildCountsOnlyReport,
  discoverFieldPaths,
  parseAuditLog,
  sha256Hex,
  stableCanonicalStringify,
  verifyAuditStructure,
  verifySha256Chain,
} from "./auditIntegrity.mjs";

test("parses JSON arrays, wrapped arrays, and JSONL without changing order", () => {
  const array = parseAuditLog('[{"id":"a"},{"id":"b"}]');
  assert.equal(array.ok, true);
  assert.deepEqual(array.entries.map((entry) => entry.id), ["a", "b"]);

  const wrapped = parseAuditLog('{"entries":[{"id":"c"}]}');
  assert.equal(wrapped.sourcePath, "entries");
  assert.equal(wrapped.entries[0].id, "c");

  const jsonl = parseAuditLog('{"id":"d"}\n{"id":"e"}');
  assert.equal(jsonl.format, "jsonl");
  assert.equal(jsonl.entries.length, 2);
});

test("rejects malformed JSONL and non-object entries", () => {
  assert.equal(parseAuditLog('{"id":1}\nnot-json').ok, false);
  const primitive = parseAuditLog("[1,2]");
  assert.equal(primitive.ok, false);
  assert.match(primitive.errors[0], /not JSON objects/i);
});

test("discovers nested audit field paths using common names", () => {
  const discovery = discoverFieldPaths([
    {
      event_id: "a",
      seq: 1,
      meta: { timestamp: "2026-01-01T00:00:00Z" },
      chain: { previousHash: "x" },
      digest: "y",
    },
  ]);
  assert.equal(discovery.mapping.idPath, "event_id");
  assert.equal(discovery.mapping.sequencePath, "seq");
  assert.equal(discovery.mapping.timestampPath, "meta.timestamp");
  assert.equal(discovery.mapping.previousHashPath, "chain.previousHash");
  assert.equal(discovery.mapping.hashPath, "digest");
});

test("canonical JSON recursively sorts object keys while preserving arrays", () => {
  assert.equal(
    stableCanonicalStringify({ z: 1, a: { y: 2, b: 3 }, list: [3, { z: 1, a: 2 }] }),
    '{"a":{"b":3,"y":2},"list":[3,{"a":2,"z":1}],"z":1}',
  );
});

test("structural verification finds missing and duplicate IDs, gaps, reorder, timestamp regression, and broken links", () => {
  const entries = [
    {
      id: "a",
      sequence: 10,
      timestamp: "2026-01-01T10:00:00Z",
      previousHash: "genesis",
      hash: "aaa",
    },
    {
      id: "a",
      sequence: 12,
      timestamp: "2026-01-01T09:00:00Z",
      previousHash: "wrong",
      hash: "bbb",
    },
    {
      sequence: 11,
      timestamp: "not-a-date",
      previousHash: "bbb",
      hash: "ccc",
    },
  ];
  const result = verifyAuditStructure(entries, {
    idPath: "id",
    sequencePath: "sequence",
    timestampPath: "timestamp",
    previousHashPath: "previousHash",
    hashPath: "hash",
  });
  assert.equal(result.checks.ids.state, "mismatch");
  assert.equal(result.checks.ids.missingCount, 1);
  assert.equal(result.checks.ids.duplicateValueCount, 1);
  assert.equal(result.checks.sequence.gapCount, 1);
  assert.equal(result.checks.sequence.reorderedCount, 1);
  assert.equal(result.checks.timestamps.regressionCount, 1);
  assert.equal(result.checks.timestamps.invalidCount, 1);
  assert.equal(result.checks.previousLinks.mismatchCount, 1);
});

test("unconfigured checks are explicitly not checkable", () => {
  const result = verifyAuditStructure([{ value: 1 }], {});
  assert.equal(result.checks.ids.state, "not-checkable");
  assert.equal(result.checks.sequence.state, "not-checkable");
  assert.equal(result.checks.timestamps.state, "not-checkable");
  assert.equal(result.checks.previousLinks.state, "not-checkable");
});

test("recomputes the documented canonical-entry SHA-256 recipe", async () => {
  const config = {
    hashPath: "hash",
    previousHashPath: "previousHash",
    hashRecipe: "canonical-entry",
  };
  const first = {
    id: "a",
    sequence: 1,
    previousHash: "GENESIS",
    action: { tool: "search", ok: true },
  };
  first.hash = await sha256Hex(buildCanonicalHashInput(first, config));
  const second = {
    id: "b",
    sequence: 2,
    previousHash: first.hash,
    action: { ok: true, tool: "write" },
  };
  second.hash = await sha256Hex(buildCanonicalHashInput(second, config));

  const verified = await verifySha256Chain([first, second], config);
  assert.equal(verified.state, "verified");
  assert.equal(verified.verifiedCount, 2);

  second.action.ok = false;
  const mismatch = await verifySha256Chain([first, second], config);
  assert.equal(mismatch.state, "mismatch");
  assert.equal(mismatch.mismatchCount, 1);
});

test("recomputes the previous-hash plus canonical-payload recipe", async () => {
  const config = {
    hashPath: "chain.hash",
    previousHashPath: "chain.previous",
    hashRecipe: "previous-plus-entry",
  };
  const entry = {
    id: "one",
    payload: { result: "allowed", count: 2 },
    chain: { previous: "trusted-genesis" },
  };
  entry.chain.hash = await sha256Hex(buildCanonicalHashInput(entry, config));
  const result = await verifySha256Chain([entry], config);
  assert.equal(result.state, "verified");
});

test("counts-only report contains no IDs, hashes, or raw entry fields", () => {
  const parseResult = parseAuditLog('[{"id":"secret-agent-id"}]');
  const structure = verifyAuditStructure(parseResult.entries, { idPath: "id" });
  const hashResult = {
    state: "not-checkable",
    checkedCount: 0,
    mismatchCount: 0,
    notCheckableCount: 1,
  };
  const report = buildCountsOnlyReport(parseResult, structure, hashResult);
  assert.match(report, /Parsed entries/);
  assert.doesNotMatch(report, /secret-agent-id/);
});
