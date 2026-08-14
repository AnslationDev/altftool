import assert from "node:assert/strict";
import test from "node:test";

import { sheetFilename, sheetMarkdown, sheetShareQuery } from "./sheet.js";
import { DEFAULT_SPEC, composeSheet, specFromQuery } from "./compose.js";
import { CAST } from "./catalog.js";

const SPEC = CAST[0].spec;

test("the sheet is deterministic", () => {
  assert.equal(sheetMarkdown(SPEC), sheetMarkdown(SPEC));
  assert.equal(sheetFilename(SPEC), sheetFilename(SPEC));
});

test("the sheet carries every section a reader would look for", () => {
  const md = sheetMarkdown(SPEC);
  for (const heading of [
    "## The locked line",
    "## Styling line",
    "## Negative prompt",
    "## Prompt kits",
    "## Why this route",
    "## Reproduction checklist",
    "## Trait ledger",
    "## Disclosure",
    "## First 30 days",
    "### Batch by setup",
    "### Calendar",
  ]) {
    assert.ok(md.includes(heading), `missing ${heading}`);
  }
});

test("the locked line and the seed appear verbatim", () => {
  const sheet = composeSheet(SPEC);
  const md = sheetMarkdown(SPEC);
  assert.ok(md.includes(sheet.lockedLine));
  assert.ok(md.includes(sheet.seed.token));
  assert.ok(md.includes(String(sheet.seed.numeric)));
});

test("every prompt kit is in the file", () => {
  const sheet = composeSheet(SPEC);
  const md = sheetMarkdown(SPEC);
  for (const kit of sheet.kits) {
    assert.ok(md.includes(`### ${kit.label}`), `missing kit ${kit.label}`);
  }
});

test("the disclaimer travels with the disclosure", () => {
  const md = sheetMarkdown(SPEC);
  assert.ok(md.includes("not legal advice"));
});

test("calendar rows cannot break the table with a stray pipe", () => {
  const md = sheetMarkdown(SPEC);
  const rows = md
    .slice(md.indexOf("### Calendar"))
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.startsWith("| ---"));

  for (const row of rows.slice(1)) {
    const cells = row.split(/(?<!\\)\|/).filter((cell) => cell.trim().length);
    assert.equal(cells.length, 4, `row has ${cells.length} cells: ${row}`);
  }
});

test("the share query round-trips back to the same spec", () => {
  const restored = specFromQuery(sheetShareQuery(SPEC));
  assert.equal(composeSheet(restored).seed.token, composeSheet(SPEC).seed.token);
});

test("the filename is filesystem-safe and carries the seed", () => {
  const name = sheetFilename(SPEC);
  assert.match(name, /^[a-z0-9-]+-PSN-[0-9A-Z]{4}-[0-9A-Z]{3}\.md$/);

  const unnamed = sheetFilename({ ...DEFAULT_SPEC, name: "", handle: "" });
  assert.match(unnamed, /^persona-PSN-/);
});

test("a share url is included only when one is supplied", () => {
  assert.ok(!sheetMarkdown(SPEC).includes("Reopen this sheet"));
  assert.ok(
    sheetMarkdown(SPEC, { shareUrl: "https://example.com/x" }).includes(
      "https://example.com/x",
    ),
  );
});
