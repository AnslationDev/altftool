import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rootLayout = readFileSync(
  new URL("../../app/layout.jsx", import.meta.url),
  "utf8",
);

test("global layout does not mount unsolicited newsletter or cookie dialogs", () => {
  assert.doesNotMatch(rootLayout, /NewsletterSubscribeDialog/);
  assert.doesNotMatch(rootLayout, /CookieBanner|CookiePreferencesModal/);
});
