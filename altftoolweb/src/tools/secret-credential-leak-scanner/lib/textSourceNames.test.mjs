import assert from "node:assert/strict";
import test from "node:test";

import {
  extensionOfTextSource,
  isSupportedSecretTextName,
} from "./textSourceNames.mjs";

test("accepts supported source extensions and common extensionless secret files", () => {
  for (const name of [
    "src/index.jsx",
    "config/.env",
    ".npmrc",
    ".pypirc",
    ".netrc",
    "Dockerfile",
    "Makefile",
    "Gemfile",
    "credentials",
  ]) {
    assert.equal(isSupportedSecretTextName(name), true, name);
  }
});

test("normalizes archive separators without treating binary names as text", () => {
  assert.equal(isSupportedSecretTextName("nested\\Dockerfile"), true);
  assert.equal(isSupportedSecretTextName("assets/photo.png"), false);
  assert.equal(extensionOfTextSource("nested/config.JSON"), "json");
});
