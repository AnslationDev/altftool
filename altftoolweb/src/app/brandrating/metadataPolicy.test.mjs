import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./layout.jsx", import.meta.url), "utf8");
const sitemapSource = fs.readFileSync(new URL("../sitemap.js", import.meta.url), "utf8");

test("brand rating hub owns its canonical and stays out of search previews", () => {
  assert.match(source, /path:\s*["']\/brandrating["']/u);
  assert.match(source, /noindex:\s*true/u);
  assert.match(source, /follow:\s*true/u);
  assert.doesNotMatch(
    sitemapSource,
    /\{\s*path:\s*["']\/brandrating["']/u,
  );
});
