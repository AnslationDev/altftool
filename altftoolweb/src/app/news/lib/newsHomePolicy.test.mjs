import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/NewsHome.jsx", import.meta.url),
  "utf8",
);

test("NewsHome only emits machine-readable times for dated stories", () => {
  assert.match(source, /function PublishedAge\(/u);
  assert.match(source, /if \(!article\?\.published_at \|\| !label\) return null;/u);
  assert.match(source, /<time className=\{className\} dateTime=\{article\.published_at\}>/u);
  assert.equal((source.match(/<PublishedAge\b/gu) || []).length, 5);
  assert.equal((source.match(/timeAgo\(/gu) || []).length, 2);
});

test("NewsHome labels topics and newsletter behavior truthfully", () => {
  assert.match(source, /compareNewsNewestFirst/u);
  assert.match(source, /Popular Topics/u);
  assert.match(source, /when the newsletter launches/u);
  assert.doesNotMatch(source, /delivered to your inbox daily/u);
});
