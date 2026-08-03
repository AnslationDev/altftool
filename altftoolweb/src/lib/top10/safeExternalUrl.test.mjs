import assert from "node:assert/strict";
import test from "node:test";

import { safeExternalUrl } from "./safeExternalUrl.js";

test("Top10 external links accept only absolute HTTP(S) URLs", () => {
  assert.equal(safeExternalUrl("https://example.com/a?q=1"), "https://example.com/a?q=1");
  assert.equal(safeExternalUrl("http://example.com"), "http://example.com/");
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl("data:text/html,unsafe"), null);
  assert.equal(safeExternalUrl("/relative"), null);
  assert.equal(safeExternalUrl(null), null);
});
