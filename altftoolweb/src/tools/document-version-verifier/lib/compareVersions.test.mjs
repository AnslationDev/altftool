import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_COMPARISON_LINES,
  MAX_SOURCE_CHARACTERS,
  buildCountsOnlyVersionReport,
  compareDocumentVersions,
  parseCsv,
} from "./compareVersions.mjs";

test("aligns replacements, additions, and removals as line evidence", () => {
  const result = compareDocumentVersions(
    "TITLE\nAlpha\nKeep\nRemove me",
    "TITLE\nBeta\nKeep\nAdded one\nAdded two",
    { format: "text" },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.summary, {
    additions: 1,
    removals: 0,
    changes: 2,
  });
  assert.equal(result.rows.filter((row) => row.type === "changed").length, 2);
  assert.equal(result.rows.filter((row) => row.type === "added").length, 1);
});

test("line-ending and whitespace options are explicit and deterministic", () => {
  const result = compareDocumentVersions(
    "One  \r\nTwo\t words",
    "One\nTwo words",
    {
      format: "text",
      options: {
        normalizeLineEndings: true,
        trimLineWhitespace: true,
        collapseWhitespace: true,
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.identical, true);
  assert.equal(result.normalization.length, 3);
});

test("groups Markdown changes under observable heading labels", () => {
  const result = compareDocumentVersions(
    "# Intro\nSame\n## Scope\nOld",
    "# Intro\nSame\n## Scope\nNew",
    { format: "markdown" },
  );

  assert.equal(result.ok, true);
  assert.equal(result.sectionSummaries.length, 1);
  assert.equal(result.sectionSummaries[0].section, "Scope");
  assert.equal(result.sectionSummaries[0].changes, 1);
});

test("compares JSON by field paths while ignoring formatting and key order", () => {
  const before = '{"name":"Tool","version":1,"remove":true}';
  const after = '{\n  "added": false, "version": 2, "name": "Tool"\n}';
  const result = compareDocumentVersions(before, after, { format: "json" });

  assert.equal(result.ok, true);
  assert.deepEqual(result.summary, {
    additions: 1,
    removals: 1,
    changes: 1,
  });
  assert.equal(
    result.structuralChanges.find((change) => change.label === "$.version")
      ?.type,
    "changed",
  );
});

test("returns side-specific JSON parser errors", () => {
  const result = compareDocumentVersions('{"ok":true}', '{"broken":}', {
    format: "json",
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /updated version is not valid JSON/iu);
});

test("parses quoted CSV fields and compares columns, rows, and cells", () => {
  assert.deepEqual(parseCsv('id,note\n1,"hello, world"'), [
    ["id", "note"],
    ["1", "hello, world"],
  ]);

  const result = compareDocumentVersions(
    "id,name,old\n1,Asha,x\n2,Bo,y",
    "id,name,new\n1,Asha,z\n2,Bob,q\n3,Cam,r",
    { format: "csv" },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.summary, {
    additions: 2,
    removals: 1,
    changes: 1,
  });
  assert.equal(
    result.structuralChanges.some(
      (change) => change.kind === "cell" && change.label === "Row 3 · name",
    ),
    true,
  );
});

test("rejects source text beyond the deterministic safety limit", () => {
  const result = compareDocumentVersions(
    "a".repeat(MAX_SOURCE_CHARACTERS + 1),
    "b",
    { format: "text" },
  );
  assert.equal(result.ok, false);
  assert.match(result.error, /limited/iu);
});

test("rejects comparison representations beyond the line bound", () => {
  const tooManyLines = Array.from(
    { length: MAX_COMPARISON_LINES + 1 },
    (_, index) => `line ${index}`,
  ).join("\n");
  const result = compareDocumentVersions(tooManyLines, tooManyLines, {
    format: "text",
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /lines/iu);
});

test("counts-only report excludes paths, values, sections, and source text", () => {
  const secret = "PRIVATE-8675309";
  const result = compareDocumentVersions(
    `# ${secret}\nold`,
    `# ${secret}\nnew`,
    { format: "markdown" },
  );
  const report = buildCountsOnlyVersionReport(
    result,
    "2026-07-24T00:00:00.000Z",
  );
  const serialized = JSON.stringify(report);

  assert.equal(report.reportType, "document-version-comparison-counts-only");
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes("old"), false);
  assert.equal(serialized.includes("new"), false);
  assert.equal("rows" in report, false);
  assert.equal("structuralChanges" in report, false);
});
