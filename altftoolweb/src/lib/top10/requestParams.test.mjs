import assert from "node:assert/strict";
import test from "node:test";

import { top10Choice, top10Page, top10Text, top10Type } from "./requestParams.js";

test("Top10 text parameters are trimmed and bounded", () => {
  const params = new URLSearchParams({ query: `  ${"x".repeat(200)}  ` });
  assert.equal(top10Text(params, "query").length, 120);
  assert.equal(top10Text(new URLSearchParams({ query: "  books  " }), "query"), "books");
});

test("Top10 pages stay within the supported finite range", () => {
  for (const [raw, expected] of [["-4", 1], ["0", 1], ["2", 2], ["999", 5], ["Infinity", 1], ["nope", 1]]) {
    assert.equal(top10Page(new URLSearchParams({ page: raw })), expected);
  }
});

test("Top10 route modes fall back instead of accepting arbitrary values", () => {
  const allowed = ["categories", "search"];
  assert.equal(top10Type(new URLSearchParams({ type: "search" }), allowed, "categories"), "search");
  assert.equal(top10Type(new URLSearchParams({ type: "delete-everything" }), allowed, "categories"), "categories");
  assert.equal(top10Type(new URLSearchParams({ window: "weekly" }), ["daily", "weekly"], "daily", "window"), "weekly");
});

test("Top10 category identifiers stay inside each curated navigation set", () => {
  const allowed = ["fiction", "history"];
  assert.equal(top10Choice(new URLSearchParams({ subject: "history" }), "subject", allowed), "history");
  assert.equal(top10Choice(new URLSearchParams({ subject: "../../admin" }), "subject", allowed), "");
});
