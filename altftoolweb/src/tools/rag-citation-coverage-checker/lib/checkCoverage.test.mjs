import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCoverageReport,
  checkCitationCoverage,
  extractCitationIds,
  parseSources,
} from "./checkCoverage.mjs";

test("parses JSON retrieval arrays and deduplicates source IDs", () => {
  const parsed = parseSources(
    JSON.stringify([
      { id: "A", text: "first" },
      { id: "a", text: "duplicate" },
      { id: "B", content: "second" },
    ]),
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.format, "json");
  assert.deepEqual(
    parsed.sources.map((source) => source.id),
    ["A", "B"],
  );
  assert.equal(parsed.truncated, false);
});

test("parses line-labelled text retrieval sets", () => {
  const parsed = parseSources("1 | First passage\nsource-2: Second passage");
  assert.equal(parsed.sources.length, 2);
  assert.equal(parsed.sources[1].id, "source-2");
});

test("extracts bracket and labelled citation IDs", () => {
  assert.deepEqual(extractCitationIds("Claim [1, source-2] and more (Sources: A; B)."), [
    "1",
    "source-2",
    "A",
    "B",
  ]);
});

test("classifies linked, mixed, unknown, and missing claim citations", () => {
  const result = checkCitationCoverage(
    [
      "The first result is documented here [1].",
      "The second result cites known and missing sources [1, 9].",
      "This assertion only cites an absent source [8].",
      "This final assertion has no source marker.",
    ].join("\n"),
    "1 | Retrieved passage",
  );
  assert.equal(result.ok, true);
  assert.deepEqual(
    result.claims.map((claim) => claim.status),
    ["linked", "mixed", "unknown", "missing"],
  );
  assert.equal(result.coveragePercent, 50);
});

test("does not treat questions and short labels as claims", () => {
  const result = checkCitationCoverage(
    "Summary:\nWhy did this happen?\nA sufficiently long factual statement appears here [1].",
    "1 | passage",
  );
  assert.equal(result.claimCount, 1);
});

test("safe report excludes answer and source content", () => {
  const secret = "private sentence must never enter report";
  const result = checkCitationCoverage(`${secret} [alpha].`, "alpha | confidential passage");
  const report = buildCoverageReport(result);
  assert.equal(JSON.stringify(report).includes(secret), false);
  assert.equal(JSON.stringify(report).includes("confidential passage"), false);
  assert.equal(Object.hasOwn(report.claimStatuses[0], "text"), false);
});
